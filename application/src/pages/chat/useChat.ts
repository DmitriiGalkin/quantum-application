import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider.tsx';
import type { ChatTarget } from "@shared/types";
import { fetchChat, fetchCreateChat, fetchSendMessage } from '../../requests.ts';
import { ACTIVE_CHAT_ID_STORAGE_KEY } from '../../components/Drawer.tsx';
import { addMessage, addOptimisticMessage, deleteOptimisticMessage } from '../../components/helper.ts';

export function useChat(target: ChatTarget) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [chatId, setChatId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const mutation = useMutation({ mutationFn: fetchSendMessage });
  const createChatMutation = useMutation({ mutationFn: fetchCreateChat });

  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat({ chatId: chatId!, target }),
    enabled: !!chatId,
  });

  const messages = chat?.messages || [];

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    if (!chatId) {
      createChatMutation.mutate(
        { target, userId: user?.id },
        {
          onSuccess: chatId => {
            localStorage.setItem(ACTIVE_CHAT_ID_STORAGE_KEY, String(chatId));
            setChatId(chatId);

            queryClient.setQueryData(['chat', chatId], addOptimisticMessage(trimmed));
            setMessage('');

            mutation.mutate(
              { chatId, message: trimmed, target },
              {
                onSuccess: res => {
                  queryClient.setQueryData(['chat', chatId], addMessage(res.message));
                },
                onError: () => {
                  queryClient.setQueryData(['chat', chatId], deleteOptimisticMessage);
                },
              },
            );
          },
        },
      );

      return;
    }

    queryClient.setQueryData(['chat', chatId], addOptimisticMessage(trimmed));
    setMessage('');

    mutation.mutate(
      { chatId, message: trimmed, target },
      {
        onSuccess: res => {
          queryClient.setQueryData(['chat', chatId], addMessage(res.message));
        },
        onError: () => {
          queryClient.setQueryData(['chat', chatId], deleteOptimisticMessage);
        },
      },
    );
  }

  return {
    chatId,
    setChatId,
    message,
    setMessage,
    sendMessage,
    messages,
    isLoading,
    isSending: mutation.isPending,
  };
}
