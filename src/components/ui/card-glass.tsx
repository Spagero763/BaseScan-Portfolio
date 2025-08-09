import { cn } from "@/lib/utils";

export const CardGlass = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div
      className={cn(
        "bg-card/60 dark:bg-card/60 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 hover:border-border-hover dark:hover:border-white/20 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );