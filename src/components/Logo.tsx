import { cn } from "@/lib/utils";
import logoUrl from "/logo-mac-ip.png";

export const Logo = ({ className }: { className?: string }) => (
  <img
    src={logoUrl}
    alt="MAC-IP Logo"
    className={cn("h-auto", className)}
  />
);