import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Conversation, ConversationMessage, MessagingService } from 'src/app/services/messaging.service';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-buyer-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  standalone: false,
})
export class MessagesComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: ConversationMessage[] = [];
  replyText = '';
  loading = false;
  sending = false;

  private buyerId: string | null = null;
  private unsubscribeParticipantTopic: (() => void) | null = null;
  private unsubscribeConversationTopic: (() => void) | null = null;

  constructor(
    private messagingService: MessagingService,
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.buyerId = this.authService.getBuyerId();
    this.loadConversations();
    this.subscribeToParticipantUpdates();
  }

  ngOnDestroy(): void {
    this.unsubscribeParticipantTopic?.();
    this.unsubscribeConversationTopic?.();
  }

  // Live updates whenever any of this buyer's conversations change (new admin reply, read
  // receipt, etc.) — covers the "another tab/user updated it" case without a manual reload.
  private subscribeToParticipantUpdates(): void {
    if (!this.buyerId) return;
    this.unsubscribeParticipantTopic = this.webSocketService.subscribe<Conversation>(
      `/topic/participant/BUYER/${this.buyerId}`,
      (updated) => this.upsertConversation(updated)
    );
  }

  private upsertConversation(updated: Conversation): void {
    const index = this.conversations.findIndex((c) => c.id === updated.id);
    const next = [...this.conversations];
    if (index >= 0) {
      next[index] = updated;
    } else {
      next.unshift(updated);
    }
    this.conversations = next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (this.selectedConversation?.id === updated.id) {
      this.selectedConversation = updated;
    }
  }

  loadConversations(): void {
    if (!this.buyerId) return;
    this.loading = true;
    this.messagingService.getConversations('BUYER', this.buyerId).subscribe({
      next: (res) => {
        this.conversations = res?._embedded?.conversationResponseBeanList || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching conversations:', err);
        this.loading = false;
      },
    });
  }

  get totalUnread(): number {
    return this.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }

  openConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.messages = [];

    this.unsubscribeConversationTopic?.();
    this.unsubscribeConversationTopic = this.webSocketService.subscribe<ConversationMessage[]>(
      `/topic/conversations/${conversation.id}`,
      (messages) => (this.messages = messages)
    );

    this.messagingService.getMessages(conversation.id).subscribe({
      next: (messages) => (this.messages = messages),
      error: (err) => console.error('Error fetching messages:', err),
    });
    this.messagingService.markRead(conversation.id, 'BUYER').subscribe({
      next: () => (conversation.unreadCount = 0),
      error: () => {},
    });
  }

  closeConversation(): void {
    this.unsubscribeConversationTopic?.();
    this.unsubscribeConversationTopic = null;
    this.selectedConversation = null;
    this.messages = [];
  }

  sendReply(): void {
    if (!this.selectedConversation || !this.replyText.trim()) return;
    const text = this.replyText.trim().slice(0, 250);
    this.sending = true;
    this.messagingService.reply(this.selectedConversation.id, 'BUYER', text).subscribe({
      next: () => {
        this.replyText = '';
        this.sending = false;
        // this.messages updates via the /topic/conversations/{id} broadcast triggered by this reply.
      },
      error: (err) => {
        console.error('Error sending reply:', err);
        this.sending = false;
      },
    });
  }
}
