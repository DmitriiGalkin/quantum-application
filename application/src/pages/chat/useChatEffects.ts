import { useEffect, useState } from 'react';
import type { CreateMessageDto } from '@shared/types';

const MESSAGE_AFTER_LOGIN_STORAGE_KEY = 'message_after_login';

export function useChatEffects({
  messages,
  sendMessage,
  token,
  authHandler,
}: {
  messages: CreateMessageDto[];
  sendMessage: (text: string) => Promise<void>;
  token: string | null;
  authHandler: () => void;
}) {
  const [authTriggered, setAuthTriggered] = useState(false);
  const [mapTriggered, setMapTriggered] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(MESSAGE_AFTER_LOGIN_STORAGE_KEY);

    if (saved) {
      sendMessage(saved);
      localStorage.removeItem(MESSAGE_AFTER_LOGIN_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const hasAuth = messages.some((m: any) => m?.target === 'auth');

    if (!token && hasAuth && !authTriggered) {
      authHandler();
      setAuthTriggered(true);
    }
  }, [messages]);

  useEffect(() => {
    const hasMap = messages[messages.length - 1].target === 'place';

    if (hasMap && !mapTriggered) {
      setIsMapOpen(true);
      setMapTriggered(true);
    }
  }, [messages]);

  return {
    isMapOpen,
    setIsMapOpen,
  };
}
