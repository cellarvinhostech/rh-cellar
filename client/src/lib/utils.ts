import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data string (YYYY-MM-DD) para o formato brasileiro sem problemas de fuso horário
 */
export function formatDateBR(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString("pt-BR");
}

/**
 * Calcula anos de serviço baseado na data de admissão
 */
export function calculateYearsOfService(joinDate: string): number {
  const [year, month, day] = joinDate.split('-');
  const joinDateLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  const years = today.getFullYear() - joinDateLocal.getFullYear();
  const monthDiff = today.getMonth() - joinDateLocal.getMonth();
  
  // Ajusta se ainda não completou o aniversário de admissão no ano atual
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDateLocal.getDate())) {
    return years - 1;
  }
  
  return years;
}