import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Section } from 'components/Section.tsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type SectionType = 'data' | 'usage' | 'cookies' | 'services' | 'security' | 'retention' | 'rights' | 'ai' | 'contact';

const SECTIONS: { id: SectionType, label: string }[] = [
  { id: 'data', label: 'Какие данные мы собираем' },
  { id: 'usage', label: 'Как мы используем данные' },
  { id: 'cookies', label: 'Cookie' },
  { id: 'services', label: 'Сторонние сервисы' },
  { id: 'security', label: 'Безопасность данных' },
  { id: 'retention', label: 'Срок хранения данных' },
  { id: 'rights', label: 'Ваши права' },
  { id: 'ai', label: 'ИИ и данные' },
  { id: 'contact', label: 'Контакты' },
];

export default function PrivacyPage() {

  const content = useMemo(
    () => ({
      data: (
        <Stack spacing={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Section
                id="data-1"
                title="Данные учетной записи и обучения"
                description="При регистрации и прогрессе ученика могут быть запрошены:"
                items={[
                  'Имя и фамилия',
                  'Адрес электронной почты',
                  'Фотография профиля (необязательно)',
                  'Предпочитаемый язык',
                  'Записанные идеи',
                  'Историю обучения',
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Section
                id="data-3"
                title="Платежная информация"
                description="При оформлении подписки или покупке курса мы можем хранить:"
                items={['Имя плательщика', 'Платежную историю', 'Статус подписки', 'Платежный адрес (при необходимости)']}
                footer="Важно: Мы не храним данные банковских карт. Все платежи обрабатываются сертифицированными платежными сервисами."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Section
                id="data-4"
                title="Техническая информация"
                description="Автоматически собираются:"
                items={[
                  'IP-адрес',
                  'Тип браузера',
                  'Операционная система',
                  'Тип устройства',
                  'Часовой пояс',
                  'История входов',
                  'Диагностические данные и журналы ошибок',
                ]}
                footer="Эти данные используются исключительно для обеспечения стабильной и безопасной работы платформы."
              />
            </Grid>
          </Grid>
        </Stack>
      ),

      usage: (
        <Section
          id="usage"
          description="Мы используем персональные данные для следующих целей:"
          items={[
            'создавать и обслуживать вашу учетную запись',
            'предоставлять доступ к образовательным материалам',
            'сохранять прогресс обучения',
            'выдавать сертификаты',
            'обрабатывать платежи',
            'обеспечивать безопасность аккаунта',
            'отвечать на обращения в службу поддержки',
            'отправлять важные уведомления о работе сервиса',
            'улучшать функциональность платформы',
            'предотвращать мошенничество и злоупотребления',
          ]}
          footer="Эти сервисы получают только ту информацию, которая необходима для выполнения их функций."
        />
      ),

      cookies: (
        <Box id="cookies">
          <Stack spacing={2}>
            <Typography variant="body1">Quantum использует файлы Cookie для корректной работы платформы.</Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Тип Cookie</b>
                    </TableCell>
                    <TableCell>
                      <b>Назначение</b>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow>
                    <TableCell>Обязательные</TableCell>
                    <TableCell>Авторизация и безопасность</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Настройки</TableCell>
                    <TableCell>Запоминание языка и предпочтений</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Аналитические</TableCell>
                    <TableCell>Анализ использования платформы</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Функциональные</TableCell>
                    <TableCell>Улучшение пользовательского опыта</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              При желании вы можете отключить Cookie в настройках браузера, однако некоторые функции платформы могут работать некорректно.
            </Typography>
          </Stack>
        </Box>
      ),

      services: (
        <Section
          id="services"
          description="Для предоставления наших услуг мы можем использовать сторонние сервисы, включая:"
          items={[
            'обработку платежей',
            'облачное хранение данных',
            'сервисы авторизации',
            'аналитику',
            'мониторинг ошибок',
            'отправку электронной почты',
          ]}
          footer="Эти сервисы получают только ту информацию, которая необходима для выполнения их функций."
        />
      ),

      security: (
        <Section
          id="security"
          description="Мы применяем современные методы защиты информации, включая:"
          items={[
            'защищенное HTTPS-соединение',
            'шифрование паролей',
            'контроль доступа к данным',
            'регулярное резервное копирование',
            'мониторинг безопасности',
            'защиту от несанкционированного доступа',
          ]}
          footer="Несмотря на принимаемые меры, ни одна система передачи данных через Интернет не может гарантировать абсолютную безопасность."
        />
      ),

      retention: (
        <Section
          id="data"
          description="Мы храним ваши данные только в течение периода, необходимого для:"
          items={[
            'предоставления услуг',
            'выполнения требований законодательства',
            'защиты наших законных интересов',
            'предотвращения мошенничества',
          ]}
          footer="После удаления учетной записи персональные данные удаляются либо обезличиваются, если их дальнейшее хранение не требуется законодательством."
        />
      ),

      rights: (
        <Section
          id="rights"
          description="В зависимости от законодательства вашей страны вы можете:"
          items={[
            'запросить доступ к своим данным',
            'изменить неточную информацию',
            'скачать копию своих данных',
            'удалить учетную запись',
            'ограничить обработку данных',
            'отозвать ранее данное согласие на обработку',
            'обратиться с жалобой в уполномоченный орган по защите персональных данных',
          ]}
        />
      ),

      ai: (
        <Section
          id="rights"
          description="Некоторые функции Quantum могут использовать технологии искусственного интеллекта для:"
          items={['персонализации обучения', 'рекомендаций учебных материалов', 'помощи при обучении', 'анализа прогресса']}
          footer="Мы не используем ваши персональные данные для продажи или передачи третьим лицам с целью обучения внешних моделей искусственного интеллекта."
        />
      ),

      contact: (
        <Stack spacing={2}>
          <Typography variant="body1">Адрес</Typography>
          <Typography variant="body2">Россия, Москва, ул. Северодвинская 11, корп 1</Typography>
        </Stack>
      ),
    }),
    [],
  );

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4">Политика конфиденциальности</Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label="Обновлено: 29 июня 2026" size="small" />
            <Typography variant="body2" color="text.secondary">
              Quantum Platform
            </Typography>
          </Stack>
        </Stack>

        {/* SUMMARY */}
        <Paper sx={{ p: 2, mb: 4, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body1">
              Мы ценим вашу конфиденциальность. В Quantum мы стремимся обеспечить безопасность ваших персональных данных и прозрачность в вопросах их
              сбора, использования и хранения. Настоящая Политика конфиденциальности объясняет, какие данные мы собираем, зачем это необходимо и какие
              права есть у пользователей.
            </Typography>
            <Divider />
            <Typography variant="h5">Введение</Typography>
            <Typography variant="body1">
              Используя платформу Quantum, вы доверяете нам свои данные. Мы относимся к этому ответственно и используем информацию исключительно для
              предоставления качественного образовательного сервиса, повышения безопасности и улучшения пользовательского опыта.
            </Typography>
            <Typography variant="body1">
              Продолжая пользоваться платформой, вы соглашаетесь с условиями настоящей Политики конфиденциальности.
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {SECTIONS.map((section, index) => (
            <Box key={section.id}>
              <Accordion disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{section.label}</Typography>
                </AccordionSummary>

                <AccordionDetails>{content[section.id]}</AccordionDetails>
              </Accordion>

              {index < SECTIONS.length - 1 && <Divider />}
            </Box>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}
