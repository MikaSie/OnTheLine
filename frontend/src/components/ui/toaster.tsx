import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewportRoot,
} from "./toast";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
}

interface ToastContextValue {
  pushToast: (message: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within Toaster");
  }

  return context;
}

export function Toaster({ children }: { children?: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((message: Omit<ToastMessage, "id">) => {
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), ...message },
    ]);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider swipeDirection="right">
        {children}
        {messages.map((message) => (
          <ToastRoot
            key={message.id}
            open
            onOpenChange={(open) => {
              if (!open) {
                setMessages((current) =>
                  current.filter((entry) => entry.id !== message.id),
                );
              }
            }}
          >
            <div className="space-y-1">
              <ToastTitle className="font-medium">{message.title}</ToastTitle>
              {message.description ? (
                <ToastDescription className="text-sm text-muted-foreground">
                  {message.description}
                </ToastDescription>
              ) : null}
            </div>
            <ToastClose />
          </ToastRoot>
        ))}
        <ToastViewportRoot />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
