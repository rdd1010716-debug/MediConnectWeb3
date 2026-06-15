export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function formatDate(value: string): string {
  if (!value) return 'Sin fecha';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    programada: 'Programada',
    cancelada: 'Cancelada',
    finalizada: 'Finalizada',
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
  };
  return labels[status] || status || 'Sin estado';
}