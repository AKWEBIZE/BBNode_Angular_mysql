import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { environment } from 'src/environments/environment';

/**
 * Thin wrapper around a single shared STOMP-over-WebSocket connection (plain ws://, not SockJS —
 * sockjs-client expects Node's `global` and crashes under Angular's esbuild dev server). Used for
 * live updates (new messages, read receipts) so open tabs/pages don't need a manual reload to see
 * changes another tab/user just made.
 */
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client: Client;
  private connected = false;
  private pendingActions: Array<() => void> = [];

  constructor() {
    const wsUrl = environment.apiBaseUrl.replace(/^http/, 'ws') + '/ws';

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      debug: () => {},
    });

    this.client.onConnect = () => {
      this.connected = true;
      const actions = this.pendingActions;
      this.pendingActions = [];
      actions.forEach((run) => run());
    };

    this.client.onDisconnect = () => {
      this.connected = false;
    };

    this.client.activate();
  }

  /**
   * Subscribes to a topic and parses each message body as JSON. Returns an unsubscribe function.
   * Safe to call before the socket has connected — the subscription is queued and applied once
   * connected.
   */
  subscribe<T = any>(topic: string, onMessage: (payload: T) => void): () => void {
    let subscription: StompSubscription | undefined;
    let cancelled = false;

    const doSubscribe = () => {
      if (cancelled) return;
      subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          onMessage(JSON.parse(message.body));
        } catch {
          // Ignore malformed frames rather than breaking the subscription.
        }
      });
    };

    if (this.connected) {
      doSubscribe();
    } else {
      this.pendingActions.push(doSubscribe);
    }

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }
}
