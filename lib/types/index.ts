export interface User {
  _id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  deadline?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Participant {
  id: string;
  name: string;
  hasAgreed: boolean;
  agreedAt?: string;
}

export interface Agreement {
  id: string;
  title: string;
  description: string;
  participants: Participant[];
  checklist: ChecklistItem[];
  chat: Message[];
  status: 'draft' | 'pending' | 'agreed' | 'completed' | 'cancelled';
  inviteCode: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateAgreementRequest {
  title: string;
  description?: string;
  creatorName: string;
}

export interface JoinAgreementRequest {
  inviteCode: string;
  participantName: string;
}

export interface AddMessageRequest {
  content: string;
  senderName: string;
}

export interface AddChecklistItemRequest {
  text: string;
  deadline?: string;
  participantName: string;
}

export interface AgreeRequest {
  participantName: string;
} 