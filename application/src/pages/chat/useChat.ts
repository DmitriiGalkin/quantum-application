import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider.tsx';
import {
  type Chat,
  type ChatMessageRole,
  type ChatTarget,
  type CreateMessage,
  type CreateMessageDto,
  type MessageDto,
} from '@shared/types';
import { fetchChat, fetchCreateChat, fetchCreateChatMessages } from '../../requests.ts';
import { addMessage, addOptimisticMessage, deleteOptimisticMessage } from '../../components/helper.ts';
import { useWelcomeContent } from '../../components/Map/useWelcomeContent.tsx';

export function useChat(target: ChatTarget) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const welcomeContent = useWelcomeContent(target);

  const [chatId, setChatId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
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

  console.log(messages, 'MESSAGES');





  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || createChatMessages.isPending) return;
    const messagesSend: CreateMessageDto[] = [
      ...(!chatId ? [{ role: 'assistent' as ChatMessageRole, content: welcomeContent }] : []),
      { role: 'user' as ChatMessageRole, content: trimmed },
    ];
    const messageOpti: CreateMessageDto = { role: 'user' as ChatMessageRole, content: trimmed };

    console.log(messagesSend, 'messagesSend');

    setMessage('');
    setMessages([...messages, messageOpti]);

    console.log('setMessages', [...messages, messageOpti]);


    const createMessages = (chatId: number) => {
      createChatMessages.mutate(
        { chatId, messages: messagesSend },
        {
          onSuccess: (res: {
            chatId: number,
            message: MessageDto,
          }) => {
            const suc = [...messages, messageOpti, res.message];
            console.log(suc,'suc')
            setMessages(suc);
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
