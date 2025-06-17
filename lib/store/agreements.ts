// In-memory хранилище (сброс при перезапуске сервера)
export const agreements = new Map<string, any>();

export function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
} 