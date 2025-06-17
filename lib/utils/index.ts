export function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
} 