import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeWhatsappNumber(number: string): string {
  if (!number) return "";
  const trimmed = number.trim();

  // If it's a group ID, return as is.
  if (trimmed.endsWith("@g.us")) {
    return trimmed;
  }

  // If it's a contact ID already, return as is.
  if (trimmed.endsWith("@c.us")) {
    return trimmed;
  }

  // Otherwise, assume it's a plain number. Clean it and add the suffix.
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly) {
    return `${digitsOnly}@c.us`;
  }

  return ""; // Return empty if no digits found
}