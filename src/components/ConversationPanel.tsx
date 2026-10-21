import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-context.ts';
import { fetchConversation, fetchCreateMessage, fetchMessageReceipt } from '../requests.ts';
import { informationDateTime } from '../features/meets/moscow-time.ts';
import { getBrowser } from '../shared/lib/browser.ts';

export default function ConversationPanel({ conversationId }: { conversationId: number }) {
  const { passport } = useAuth();
  const [text, setText] = useState('');
  const client = useQueryClient();
  const messagesList = useRef<HTMLOListElement>(null);
  const key = ['messages', passport?.id, conversationId];
  const history = useQuery({ queryKey: key, queryFn: () => fetchConversation(conversationId), enabled: !!passport,
    refetchInterval: 10000, retry: false });
  const lastMessageId = history.data?.messages.at(-1)?.id;
  useEffect(() => {
    const browser = getBrowser();
    if (!browser || !passport || !lastMessageId) return;
    const list = messagesList.current;
    const acknowledge = () => {
      const bounds = list?.getBoundingClientRect();
      const visible = browser.document.visibilityState === 'visible' && browser.document.hasFocus();
      const displayed = visible && bounds ? Array.from(list!.querySelectorAll<HTMLElement>('[data-message-id]')).filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.height > 0 && rect.bottom > bounds.top && rect.top < bounds.bottom;
      }).map(element => Number(element.dataset.messageId)) : [];
      const lastReadId = displayed.length ? Math.max(...displayed) : null;
      void fetchMessageReceipt(conversationId,lastMessageId,false)
        .then(() => lastReadId ? fetchMessageReceipt(conversationId,lastReadId,true) : undefined)
        .then(() => Promise.all([
          client.invalidateQueries({ queryKey: ['conversations',passport.id] }),
          ...(lastReadId ? [client.invalidateQueries({ queryKey: ['notification-count',passport.id] }),
            client.invalidateQueries({ queryKey: ['notifications',passport.id] })] : []),
        ]))
        .catch(() => { /* The next history refresh retries the acknowledgement. */ });
    };
    acknowledge();
    browser.document.addEventListener('visibilitychange',acknowledge);
    browser.addEventListener('focus',acknowledge);
    list?.addEventListener('scroll',acknowledge);
    return () => { browser.document.removeEventListener('visibilitychange',acknowledge); browser.removeEventListener('focus',acknowledge); list?.removeEventListener('scroll',acknowledge); };
  }, [conversationId,lastMessageId,passport,client,history.dataUpdatedAt]);
  const send = useMutation({
    mutationFn: (content: string) => fetchCreateMessage(conversationId, content),
    onSuccess: () => {
      setText('');
      void client.invalidateQueries({ queryKey: key });
      void client.invalidateQueries({ queryKey: ['conversations', passport?.id] });
    },
  });
  if (!passport) return null;
  if (history.isPending) return <Typography role="status">Загрузка сообщений…</Typography>;
  if (history.isError) return <Alert severity="error" action={<Button onClick={() => void history.refetch()}>Повторить</Button>}>Диалог недоступен или не удалось загрузить сообщения.</Alert>;
  return <Stack spacing={2} sx={{ minWidth: 0 }}>
    <Typography component="h2" variant="h6">{history.data.conversation.counterpart?.title || 'Диалог'}</Typography>
    <Stack component="ol" ref={messagesList} spacing={1} sx={{ listStyle: 'none', m: 0, p: 1, maxHeight: '50dvh', overflowY: 'auto' }} aria-label="Сообщения диалога">
      {history.data.messages.map(message => <Box component="li" data-message-id={message.id} key={message.id} sx={{
        alignSelf: message.senderPassportId === passport.id ? 'flex-end' : 'flex-start',
        maxWidth: '90%', bgcolor: 'action.hover', borderRadius: 2, p: 1.5, overflowWrap: 'anywhere',
      }}>
        <Typography variant="caption">{message.senderPassportId === passport.id ? 'Вы' : history.data.conversation.counterpart?.title || 'Собеседник'}</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{message.text}</Typography>
        <Typography variant="caption" color="text.secondary">{informationDateTime(message.createdAt)}
          {message.senderPassportId === passport.id && ` · ${history.data.receipts?.some(r => r.passportId !== passport.id && (r.lastReadMessageId ?? 0) >= message.id)
            ? 'Прочитано' : history.data.receipts?.some(r => r.passportId !== passport.id && (r.lastDeliveredMessageId ?? 0) >= message.id) ? 'Доставлено' : 'Отправлено'}`}
        </Typography>
      </Box>)}
    </Stack>
    {!history.data.messages.length && <Typography color="text.secondary">Сообщений пока нет. Напишите первым.</Typography>}
    <Box component="form" onSubmit={event => { event.preventDefault(); if (text.trim() && !send.isPending) send.mutate(text.trim()); }}
      sx={{ display: 'flex', gap: 1, alignItems: { xs: 'stretch', sm: 'flex-end' }, flexDirection: { xs: 'column', sm: 'row' } }}>
      <TextField fullWidth multiline maxRows={5} label="Сообщение" value={text} disabled={send.isPending} onChange={event => setText(event.target.value)} />
      <Button sx={{ whiteSpace: 'nowrap', flexShrink: 0 }} type="submit" variant="contained" disabled={send.isPending || !text.trim()}>Отправить</Button>
    </Box>
    {send.isError && <Alert severity="error">Не удалось отправить сообщение. Текст сохранён — попробуйте ещё раз.</Alert>}
  </Stack>;
}
