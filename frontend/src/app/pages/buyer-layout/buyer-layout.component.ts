import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Conversation, MessagingService } from 'src/app/services/messaging.service';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-buyer-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './buyer-layout.component.html',
  styleUrl: './buyer-layout.component.scss',
})
export class BuyerLayoutComponent implements OnInit, OnDestroy {
  showUserMenu = false;
  buyerName = '';

  notificationCount = 5;

  private conversations: Conversation[] = [];
  private unsubscribeParticipantTopic: (() => void) | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messagingService: MessagingService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.buyerName = this.authService.getBuyerName() || '';
    this.loadUnreadMessageCount();
    this.subscribeToMessageUpdates();
  }

  ngOnDestroy(): void {
    this.unsubscribeParticipantTopic?.();
  }

  get messageCount(): number {
    return this.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }

  private loadUnreadMessageCount(): void {
    const buyerId = this.authService.getBuyerId();
    if (!buyerId) return;

    this.messagingService.getConversations('BUYER', buyerId).subscribe({
      next: (res) => {
        this.conversations = res?._embedded?.conversationResponseBeanList || [];
      },
      error: () => (this.conversations = []),
    });
  }

  // Live badge updates: a reply arriving (or a read receipt firing from another tab) while this
  // layout is mounted updates the sidebar count immediately, no reload needed.
  private subscribeToMessageUpdates(): void {
    const buyerId = this.authService.getBuyerId();
    if (!buyerId) return;

    this.unsubscribeParticipantTopic = this.webSocketService.subscribe<Conversation>(
      `/topic/participant/BUYER/${buyerId}`,
      (updated) => {
        const index = this.conversations.findIndex((c) => c.id === updated.id);
        if (index >= 0) {
          this.conversations = this.conversations.map((c, i) => (i === index ? updated : c));
        } else {
          this.conversations = [...this.conversations, updated];
        }
      }
    );
  }

  get initials(): string {
    if (!this.buyerName) return 'B';
    return this.buyerName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
