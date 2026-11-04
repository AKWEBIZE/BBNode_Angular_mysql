import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type ParticipantType = 'BUYER' | 'SELLER';
export type SenderType = 'BUYER' | 'SELLER' | 'ADMIN';

export interface QuoteProductItem {
  productId: string;
  productName: string;
}

export interface Conversation {
  id: string;
  participantType: ParticipantType;
  participantId: string;
  participantName: string | null;
  subject: string;
  relatedProductId: string | null;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface ConversationMessage {
  id: string;
  senderType: SenderType;
  messageText: string;
  sentAt: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private baseUrl = `${environment.apiBaseUrl}/messaging`;

  constructor(private http: HttpClient) {}

  requestQuote(buyerId: string, products: QuoteProductItem[]): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/quote-request`, { buyerId, products });
  }

  startConversation(participantType: ParticipantType, participantId: string, subject: string, messageText: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/start-conversation`, { participantType, participantId, subject, messageText });
  }

  getConversations(participantType: ParticipantType, participantId: string, page = 0, size = 50): Observable<any> {
    const params = new HttpParams()
      .set('participantType', participantType)
      .set('participantId', participantId)
      .set('page', page)
      .set('size', size);
    return this.http.get(`${this.baseUrl}/conversations`, { params });
  }

  getAdminConversations(participantType?: ParticipantType, page = 0, size = 50): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (participantType) params = params.set('participantType', participantType);
    return this.http.get(`${this.baseUrl}/admin/conversations`, { params });
  }

  getMessages(conversationId: string): Observable<ConversationMessage[]> {
    return this.http.get<ConversationMessage[]>(`${this.baseUrl}/conversations/${conversationId}/messages`);
  }

  reply(conversationId: string, senderType: SenderType, messageText: string): Observable<ConversationMessage> {
    return this.http.post<ConversationMessage>(`${this.baseUrl}/conversations/${conversationId}/reply`, {
      senderType,
      messageText,
    });
  }

  markRead(conversationId: string, viewerType: SenderType): Observable<any> {
    const params = new HttpParams().set('viewerType', viewerType);
    return this.http.put(`${this.baseUrl}/conversations/${conversationId}/read`, null, { params });
  }
}
