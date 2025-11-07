import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex items-center justify-center rounded-full bg-primary",
      className
    )}
  >
    <Cpu className="h-[55%] w-[55%] text-primary-foreground" />
  </div>
);