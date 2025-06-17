import { 
  CreateAgreementRequest, 
  JoinAgreementRequest, 
  AddMessageRequest, 
  AddChecklistItemRequest, 
  AgreeRequest,
  Agreement 
} from '@/lib/types';

const BASE_URL = '/api';

class ApiClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  agreements = {
    create: async (data: CreateAgreementRequest) => {
      return this.makeRequest('/agreements', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    join: async (data: JoinAgreementRequest) => {
      return this.makeRequest('/agreements/join', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getById: async (id: string, participantName: string): Promise<{ agreement: Agreement }> => {
      return this.makeRequest(`/agreements/${id}?name=${encodeURIComponent(participantName)}`);
    },

    update: async (id: string, data: { title: string; description: string; participantName: string }) => {
      return this.makeRequest(`/agreements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    addMessage: async (id: string, data: AddMessageRequest) => {
      return this.makeRequest(`/agreements/${id}/chat`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    addChecklistItem: async (id: string, data: AddChecklistItemRequest) => {
      return this.makeRequest(`/agreements/${id}/checklist`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    agree: async (id: string, data: AgreeRequest) => {
      return this.makeRequest(`/agreements/${id}/agree`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };
}

export const apiClient = new ApiClient(); 