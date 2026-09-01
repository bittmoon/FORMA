import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return 'forma_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

export function formatCurrency(value: number | string | undefined | null, symbol: string = '$'): string {
  if (value === undefined || value === null || value === '') return `${symbol}0.00`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${symbol}0.00`;
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string | undefined | null, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, formatStr);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined | null): string {
  return formatDate(dateStr, 'MMM d, yyyy · h:mm a');
}

export function truncate(str: string, length: number = 30): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => {
    const newVal = Math.round(val + (percent / 100) * 255);
    return Math.min(255, Math.max(0, newVal));
  };
  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function applyWorkspaceAccentColor(colorHex?: string): void {
  if (!colorHex || typeof document === 'undefined') return;
  const rgb = hexToRgb(colorHex) || { r: 199, g: 243, b: 107 };
  const root = document.documentElement;

  const hoverColor = adjustBrightness(colorHex, -8);
  const dimColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`;
  const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;

  root.style.setProperty('--color-lime', colorHex);
  root.style.setProperty('--color-lime-hover', hoverColor);
  root.style.setProperty('--color-lime-dim', dimColor);
  root.style.setProperty('--color-lime-glow', glowColor);
  root.style.setProperty('--color-lime-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}

