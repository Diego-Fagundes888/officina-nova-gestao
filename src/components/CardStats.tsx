
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CardStatsProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export default function CardStats({
  title,
  value,
  icon: Icon,
  description,
  className,
}: CardStatsProps) {
  return (
    <div className={cn("bg-card p-6 rounded-lg border border-border card-hover", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 rounded-full bg-secondary/50">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
