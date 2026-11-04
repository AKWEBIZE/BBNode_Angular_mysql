import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation, ConversationMessage, MessagingService } from 'src/app/services/messaging.service';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-seller-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class SellerMessagesComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: ConversationMessage[] = [];
  replyText = '';
  loading = false;
  sending = false;

  creatingNew = false;
  newMessage = '';
  startingConversation = false;
  newConversationError = '';

  private sellerId: string | null = null;
  private unsubscribeParticipantTopic: (() => void) | null = null;
  private unsubscribeConversationTopic: (() => void) | null = null;

  constructor(
    private messagingService: MessagingService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.sellerId = sessionStorage.getItem('sellerId');
    this.loadConversations();
    this.subscribeToParticipantUpdates();
  }

  ngOnDestroy(): void {
    this.unsubscribeParticipantTopic?.();
    this.unsubscribeConversationTopic?.();
  }

  // Live updates whenever any of this seller's conversations change (new admin reply, read
  // receipt, etc.) — covers the "another tab/user updated it" case without a manual reload.
  private subscribeToParticipantUpdates(): void {
    if (!this.sellerId) return;
    this.unsubscribeParticipantTopic = this.webSocketService.subscribe<Conversation>(
      `/topic/participant/SELLER/${this.sellerId}`,
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
    if (!this.sellerId) return;
    this.loading = true;
    this.messagingService.getConversations('SELLER', this.sellerId).subscribe({
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
    this.creatingNew = false;
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
    this.messagingService.markRead(conversation.id, 'SELLER').subscribe({
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
    this.messagingService.reply(this.selectedConversation.id, 'SELLER', text).subscribe({
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

  refresh(): void {
    this.loadConversations();
  }

  openNewConversationForm(): void {
    this.closeConversation();
    this.newMessage = '';
    this.newConversationError = '';
    this.creatingNew = true;
  }

  cancelNewConversation(): void {
    this.creatingNew = false;
  }

  startConversation(): void {
    if (!this.sellerId || !this.newMessage.trim()) return;
    this.startingConversation = true;
    this.newConversationError = '';
    const messageText = this.newMessage.trim().slice(0, 250);
    // No subject field in the UI — derive a short one from the message itself so the
    // conversation still shows something meaningful in the list/admin inbox.
    const subject = messageText.length > 50 ? messageText.slice(0, 50) + '…' : messageText;

    this.messagingService.startConversation('SELLER', this.sellerId, subject, messageText).subscribe({
      next: (conversation) => {
        this.conversations = [conversation, ...this.conversations];
        this.creatingNew = false;
        this.startingConversation = false;
        this.openConversation(conversation);
      },
      error: (err) => {
        console.error('Error starting conversation:', err);
        this.startingConversation = false;
        this.newConversationError = 'Failed to send. Please try again.';
      },
    });
  }
}
