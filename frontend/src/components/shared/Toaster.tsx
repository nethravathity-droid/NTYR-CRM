import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function Toaster() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            t.variant === "destructive"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-background"
          }`}
        >
          {t.variant === "destructive" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          <div>
            <p className="text-sm font-medium">{t.title}</p>
            {t.description ? (
              <p className="text-xs text-muted-foreground">{t.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => {}}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
