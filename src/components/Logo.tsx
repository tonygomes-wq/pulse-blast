import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <img
    src="/logo-mac-ip.png"
    alt="MAC-IP Logo"
    className={cn("h-auto", className)}
  />
);