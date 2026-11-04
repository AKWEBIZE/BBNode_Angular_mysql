import { Component, OnDestroy, OnInit } from '@angular/core';
import { Conversation, ConversationMessage, MessagingService } from 'src/app/services/messaging.service';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-admin-seller-interactions',
  templateUrl: './admin-seller-interactions.component.html',
  styleUrls: ['./admin-seller-interactions.component.scss'],
  standalone: false,
})
export class AdminSellerInteractionsComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: ConversationMessage[] = [];
  replyText = '';
  loading = false;
  sending = false;

  private unsubscribeAdminTopic: (() => void) | null = null;
  private unsubscribeConversationTopic: (() => void) | null = null;

  constructor(
    private messagingService: MessagingService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.unsubscribeAdminTopic = this.webSocketService.subscribe<Conversation>(
      '/topic/admin/conversations',
      (updated) => this.upsertConversation(updated)
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeAdminTopic?.();
    this.unsubscribeConversationTopic?.();
  }

  private upsertConversation(updated: Conversation): void {
    // The admin topic broadcasts every conversation update (buyer + seller) — this screen only
    // cares about seller conversations, so ignore anything else rather than leaking it into the list.
    if (updated.participantType !== 'SELLER') return;

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
    this.loading = true;
    this.messagingService.getAdminConversations('SELLER').subscribe({
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
    this.messagingService.markRead(conversation.id, 'ADMIN').subscribe({
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
    this.messagingService.reply(this.selectedConversation.id, 'ADMIN', text).subscribe({
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
