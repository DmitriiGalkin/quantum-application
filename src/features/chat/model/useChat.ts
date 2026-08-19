import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { type ContextDto, type CreateMessageDto, type Target } from 'dto';
import { fetchChat, fetchCreateChat, fetchCreateChatMessages } from '../../../requests.ts';
import { useWelcomeContent } from './useWelcomeContent.ts';
import { useParams, useSearchParams } from 'react-router-dom';

export const ACTIVE_CHAT_ID_STORAGE_KEY = 'active_chat_id';

export function useChat(target: Target, projectId?: number, ideaId?: number) {
  const { userId } = useAuth();
  const welcomeContent = useWelcomeContent(target, ideaId);

  const params = useParams();

  const [chatId, setChatId] = useState<number | null>(() => {
    if (params.id) return Number(params.id);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_CHAT_ID_STORAGE_KEY);
      return saved ? Number(saved) : null;
    }

    return null;
  });

  // контекст от ответов
  const [answerContext, setAnswerContext] = useState<ContextDto>();

  const [message, setMessage] = useState('');

  const [answerMessages, setAnswerMessages] = useState<CreateMessageDto[]>([]);


  const createChatMessages = useMutation({ mutationFn: ({ chatId, messages }: { chatId: number, messages: CreateMessageDto[]}) => fetchCreateChatMessages(chatId as number, messages) });
  const createChatMutation = useMutation({ mutationFn: fetchCreateChat });

  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat(chatId!),
    enabled: !!chatId,
  });

  const context = {...chat?.context, ...answerContext}
  const messages = [
    ...(chat?.messages || [
      {
        role: 'assistant',
        content: welcomeContent,
      },
    ]),
    ...answerMessages,
  ];


  console.log(messages, 'messages');
  console.log(chat, 'chat');

  const [searchParams, setSearchParams] = useSearchParams();

  async function sendMessage(text: string, context?: ContextDto) {
    const trimmed = text.trim();
    if (!trimmed || createChatMessages.isPending) return;
    const userMessage: CreateMessageDto = { role: 'user', content: trimmed, context };

    setMessage('');
    setAnswerMessages([...answerMessages, userMessage]);

    const createMessages = (chatId: number, withWelcome?: boolean) => {
      createChatMessages.mutate(
        { chatId, messages: [...(withWelcome ? [{ role: 'assistant' as const, content: welcomeContent }] : []), userMessage] },
        {
          onSuccess: res => {
            setAnswerMessages([...answerMessages, userMessage, res.message]);
            setAnswerContext(res.context);
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
        { target, userId, projectId, ideaId },
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
    const hasTargetInUrl = searchParams.has('target');

    // 👉 игнорируем OAuth возврат
    const hasAccessToken = searchParams.has('access_token');

    if (hasTargetInUrl && !hasAccessToken) {
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
