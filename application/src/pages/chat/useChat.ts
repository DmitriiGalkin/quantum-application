import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { type ChatMessageRole, type ChatTarget, type CreateMessageDto, type MessageDto } from '@shared/types';
import { fetchChat, fetchCreateChat, fetchCreateChatMessages } from '../../requests.ts';
import { useWelcomeContent } from '../../components/Map/useWelcomeContent.tsx';

export function useChat(target: ChatTarget) {
  console.log(target, 'target');
  const { user } = useAuth();
  const welcomeContent = useWelcomeContent(target);

  const [chatId, setChatId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState<CreateMessageDto[]>([
    {
      role: 'assistant',
      content: welcomeContent,
    },
  ]);

  const createChatMessages = useMutation({ mutationFn: fetchCreateChatMessages });
  const createChatMutation = useMutation({ mutationFn: fetchCreateChat });

  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat({ chatId: chatId!, target }),
    enabled: !!chatId,
  });

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || createChatMessages.isPending) return;
    const userMessage: CreateMessageDto = { role: 'user' as ChatMessageRole, content: trimmed };

    setMessage('');
    setMessages([...messages, userMessage]);

    const createMessages = (chatId: number) => {
      createChatMessages.mutate(
        { chatId, messages: [...(!chatId ? [{ role: 'assistent' as ChatMessageRole, content: welcomeContent }] : []), userMessage] },
        {
          onSuccess: (res: { chatId: number; message: MessageDto }) => {
            setMessages([...messages, userMessage, res.message]);
          },
          onError: () => {
            console.log('2');
          },
        },
      );
    };

    if (!chatId) {
      createChatMutation.mutate(
        { target, userId: user?.id },
        {
          onSuccess: (chatId) => {
            createMessages(chatId);
          },
        },
      );
      return;
    }

    createMessages(chatId);
  }

  useEffect(() => {
    chat?.messages && setMessages(chat.messages);
  }, [chat?.messages]);

  return {
    chatId,
    setChatId,
    message,
    setMessage,
    sendMessage,
    messages,
    isLoading,
    isSending: createChatMessages.isPending,
  };
}
