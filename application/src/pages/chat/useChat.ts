import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { type ContextDto, type CreateMessageDto, Role, Target } from '@shared/types';
import { fetchChat, fetchCreateChat, fetchCreateChatMessages } from '../../requests.ts';
import { useWelcomeContent } from '../../components/Map/useWelcomeContent.tsx';
import { useParams, useSearchParams } from 'react-router-dom';

export const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';

export function useChat(target: Target, projectId?: number) {
  const { user } = useAuth();
  const welcomeContent = useWelcomeContent(target);
  const params = useParams();

  const [chatId, setChatId] = useState<number | null>(() => {
    return params.id ? Number(params.id) : null;
  });

  const [context, setContext] = useState<ContextDto>();

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState<CreateMessageDto[]>([
    {
      role: Role.ASSISTANT,
      content: welcomeContent,
    },
  ]);

  const createChatMessages = useMutation({ mutationFn: fetchCreateChatMessages });
  const createChatMutation = useMutation({ mutationFn: fetchCreateChat });

  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat(chatId!),
    enabled: !!chatId,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  async function sendMessage(text: string, context?: ContextDto) {
    const trimmed = text.trim();
    if (!trimmed || createChatMessages.isPending) return;
    const userMessage: CreateMessageDto = { role: Role.USER, content: trimmed, context };

    setMessage('');
    setMessages([...messages, userMessage]);

    const createMessages = (chatId: number, withWelcome?: boolean) => {
      createChatMessages.mutate(
        { chatId, messages: [...(withWelcome ? [{ role: Role.ASSISTANT, content: welcomeContent }] : []), userMessage] },
        {
          onSuccess: res => {
            setMessages([...messages, userMessage, res.message]);
            setContext(res.context);
          },
          onError: () => {
            console.log('2');
          },
        },
      );
    };

    if (!chatId) {
      console.log('Создаю новый чат');
      createChatMutation.mutate(
        { target, userId: user?.id, projectId },
        {
          onSuccess: chatId => {
            setChatId(chatId);
            localStorage.setItem(ACTIVE_CHAT_ID_STORAGE_KEY, String(chatId));
            setSearchParams({});

            createMessages(chatId, true);
          },
        },
      );
      return;
    }

    createMessages(chatId);
  }

  useEffect(() => {
    chat?.messages && setMessages(chat.messages);
    chat?.context && setContext(chat?.context);
  }, [chat]);

  useEffect(() => {
    const savedChatId = localStorage.getItem(ACTIVE_CHAT_ID_STORAGE_KEY);
    if (savedChatId) {
      setChatId(Number(savedChatId));
    }
  }, []);

  useEffect(() => {
    const hasTargetInUrl = searchParams.has('target');

    if (hasTargetInUrl) {
      localStorage.removeItem(ACTIVE_CHAT_ID_STORAGE_KEY);
      setChatId(null);
    }
  }, [searchParams]);

  return {
    chatId,
    setChatId,
    message,
    setMessage,
    sendMessage,
    messages,
    context,
    isLoading,
    isSending: createChatMessages.isPending,
  };
}
