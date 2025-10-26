export function clearPhone(phone: string): string | null {
  return phone?.replace(/\D/g, '') ?? null;
}
