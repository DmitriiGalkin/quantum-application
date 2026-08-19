import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Section } from '../shared/ui/Section.tsx';

const sections = [
  {
    id: 'eligibility',
    title: '1. Доступ к сервису',
    content: 'Вы должны быть старше 18 лет и иметь право заключать юридически обязательные соглашения.',
  },
  {
    id: 'accounts',
    title: '2. Аккаунт',
    content: 'Вы несёте ответственность за сохранность данных своего аккаунта и все действия, совершённые через него.',
  },
  {
    id: 'use',
    title: '3. Использование сервиса',
    content: 'Запрещено злоупотребление сервисом: несанкционированный доступ, скрейпинг, вредоносные действия.',
  },
  {
    id: 'ai',
    title: '4. Использование AI',
    content: 'AI-ответы могут содержать неточности. Вы обязаны проверять результаты перед их использованием.',
  },
  {
    id: 'payments',
    title: '5. Оплата',
    content: 'Подписка оплачивается заранее. Условия возврата регулируются отдельной политикой.',
  },
  {
    id: 'termination',
    title: '6. Прекращение доступа',
    content: 'Мы можем приостановить или заблокировать аккаунт при нарушении условий без предварительного уведомления.',
  },
  {
    id: 'liability',
    title: '7. Ограничение ответственности',
    content: 'Мы не несем ответственности за косвенные убытки, потерю данных или прерывание работы сервиса.',
  },
];

export default function TermsPage() {
  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        {/* HEADER */}
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4">Условия использования</Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label="Обновлено: 29 июня 2026" size="small" />
            <Typography variant="body2" color="text.secondary">
              Quantum Platform
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Эти условия объясняют, как вы можете использовать сервис и какие обязательства при этом возникают.
          </Typography>
        </Stack>

        {/* SUMMARY */}
        <Paper sx={{ p: 2, mb: 4, borderRadius: 3 }}>
          <Section
            id="rights"
            title="Краткое резюме"
            items={[
              'Используйте сервис ответственно',
              'Вы отвечаете за свой аккаунт',
              'AI может ошибаться',
              'Подписка оплачивается заранее',
              'Мы можем ограничить доступ при нарушениях',
            ]}
          />
        </Paper>

        {/* CONTENT */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {sections.map((section, index) => (
            <Box key={section.id}>
              <Accordion disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{section.title}</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {section.content}
                  </Typography>
                </AccordionDetails>
              </Accordion>

              {index < sections.length - 1 && <Divider />}
            </Box>
          ))}
        </Paper>

        {/* FOOTER */}
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Вопросы? Напишите на <Link href="mailto:support@quantum.com">support@quantum.com</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
