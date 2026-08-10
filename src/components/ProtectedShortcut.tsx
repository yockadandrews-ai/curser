import { useCallback, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function confirmProtectedShortcut(name: string): boolean {
  return window.confirm(`Run ${name}? Nothing will be sent automatically.`);
}

interface NotificationProps {
  message: string | null;
  onDismiss: () => void;
}

export function ShortcutNotification({ message, onDismiss }: NotificationProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md card border-money-600/40 bg-dark-900 shadow-xl animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="text-money-400 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">Notification</p>
          <p className="text-sm text-gray-300 mt-1">{message}</p>
        </div>
        <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function useProtectedShortcut() {
  const [notification, setNotification] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 10000);
  }, []);

  const runProtected = useCallback(
    async (name: string, action: () => void | Promise<void>, successMessage: string) => {
      if (!confirmProtectedShortcut(name)) return false;
      await action();
      notify(successMessage);
      return true;
    },
    [notify],
  );

  return {
    notification,
    clearNotification: () => setNotification(null),
    notify,
    runProtected,
  };
}
