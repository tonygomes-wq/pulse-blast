import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeWhatsappNumber(number: string): string {
  if (!number) return "";
  const trimmed = number.trim();
  if (trimmed.endsWith("@g.us")) {
    // It's a group ID, keep it as is
    return trimmed;
  }
  // It's a regular number, remove all non-digit characters
  return trimmed.replace(/\D/g, "");
}