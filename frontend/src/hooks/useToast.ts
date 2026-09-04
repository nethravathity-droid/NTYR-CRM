import { useState, useCallback } from "react";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (options: { title: string; description?: string; variant?: "default" | "destructive" }) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, ...options }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  return { toast, toasts };
}
