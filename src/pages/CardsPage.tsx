import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ActiveRole } from 'entities';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { FeatureCard } from '../components/FeatureCard.tsx';
import { AuthContext, useAuth } from '../providers/auth-context.ts';
import ProjectCard from '../features/project/ui/ProjectCard.tsx';
import MeetCard from '../features/meets/MeetCard.tsx';
import WeekCalendarMeet from '../features/meets/WeekCalendar/WeekCalendarMeet.tsx';
import IdeaCard from '../features/idea/ui/IdeaCard.tsx';
import TeacherCard from '../features/teacher/TeacherCard.tsx';
import PlaceCard from '../features/place/PlaceCard.tsx';
import LocationCard from '../features/place/LocationCard.tsx';
import UserCard from '../features/user/UserCard.tsx';
import { cover, meet, place, project, pupil, room, studentIdea, teacher } from './card-gallery-data.ts';

const sections = [
  ['projects', 'Проекты'], ['meets', 'Встречи'], ['calendar', 'Календарь'],
  ['ideas', 'Идеи'], ['teachers', 'Преподаватели'],
  ['places', 'Центры'], ['rooms', 'Залы'], ['users', 'Участники'],
  ['features', 'Возможности'],
] as const;

interface PreviewProps { title: string; children: ReactNode; role?: ActiveRole; passportId?: number; wide?: boolean }

function Preview({ title, children, role = 'guest', passportId, wide = false }: PreviewProps) {
  const auth = useAuth();
  return <Stack spacing={1} sx={{ minWidth: 0, gridColumn: wide ? { xs: 'auto', sm: 'span 2' } : undefined }}>
    <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
    <AuthContext.Provider value={{ ...auth, passport: passportId === undefined ? null : { id: passportId, title: 'Преподаватель' } as NonNullable<typeof auth.passport>, role, userId: undefined, placeId: undefined }}>
      <Box onClickCapture={event => { event.preventDefault(); event.stopPropagation(); }}
        onKeyDownCapture={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); } }}
        sx={{ minWidth: 0, flex: 1 }}>
        {children}
      </Box>
    </AuthContext.Provider>
  </Stack>;
}

function Section({ id, title, children, fourColumns = false }: { id: string; title: string; children: ReactNode; fourColumns?: boolean }) {
  return <Box component="section" id={id} aria-labelledby={`${id}-title`} sx={{ scrollMarginTop: 100 }}>
    <Typography id={`${id}-title`} variant="h4" component="h2" sx={{ mb: 2 }}>{title}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: `repeat(${fourColumns ? 3 : 2}, minmax(0, 1fr))`, lg: `repeat(${fourColumns ? 4 : 3}, minmax(0, 1fr))` }, gap: 2, alignItems: 'start' }}>{children}</Box>
  </Box>;
}

export default function CardsPage() {
  return <Stack spacing={4}>
    <Stack spacing={2}>
      <Typography component="h1" variant="h3">Карточки Quantum</Typography>
      <Typography color="text.secondary">Все виды карточек приложения и их основные состояния — для сравнения и обсуждения дизайна.</Typography>
      <Alert severity="info">Демонстрационные данные. Кнопки и ссылки внутри примеров отключены, записи и бронирования не создаются. Даты будущих встреч условные.</Alert>
      <Stack component="nav" aria-label="Виды карточек" direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {sections.map(([id, title]) => <Chip key={id} component="a" href={`#${id}`} clickable label={title} />)}
      </Stack>
    </Stack>
    <Section id="projects" title="Проекты">
      <Preview title="Каталог · платная встреча"><ProjectCard project={project} variant="catalog" /></Preview>
      <Preview title="Каталог · бесплатно"><ProjectCard project={{ ...project, meets: [{ ...meet, price: 0 }] }} variant="catalog" /></Preview>
      <Preview title="Каталог · длинное название и неизвестная цена"><ProjectCard project={{ ...project, title: 'Мастерим большую деревянную табуретку для школьной мастерской и семейных проектов', image: null, meets: [{ ...meet, price: null }] }} variant="catalog" /></Preview>
      <Preview title="Без обложки и назначенной встречи"><ProjectCard project={{ ...project, image: null, meets: [], users: [] }} /></Preview>
      <Preview title="Компактный список кабинета"><ProjectCard project={project} variant="compact" /></Preview>
      <Preview title="Регулярный кружок · ближайшая встреча не назначена"><ProjectCard project={{ ...project, kind: 'regular', weeklySchedule: [{ weekday: 2, startTime: '15:15', duration: 60 }, { weekday: 4, startTime: '15:15', duration: 60 }], meets: [], users: [] }} /></Preview>
      <Preview title="Подробная карточка на странице проекта" role="user" wide><ProjectCard project={{ ...project, kind: 'regular', weeklySchedule: [{ weekday: 2, startTime: '15:15', duration: 60 }] }} detailed /></Preview>
    </Section>
    <Section id="meets" title="Встречи">
      <Preview title="Опубликована · есть свободные места"><MeetCard meet={meet} /></Preview>
      <Preview title="Бесплатная · мест нет"><MeetCard meet={{ ...meet, id: -2, price: 0, participantCount: 8 }} /></Preview>
      <Preview title="Заявка на подтверждение центра" role="place"><MeetCard meet={{ ...meet, id: -3, status: 'pending', participantCount: 0, users: [], bookingState: 'requested' }} management={{ placeId: place.id }} /></Preview>
      <Preview title="Преподаватель ожидает подтверждения зала" role="teacher" passportId={meet.passport.id}><MeetCard meet={{ ...meet, id: -10, status: 'pending', bookingState: 'requested' }} /></Preview>
      <Preview title="Подтверждена центром" role="place"><MeetCard meet={{ ...meet, id: -4 }} management={{ placeId: place.id }} /></Preview>
      <Preview title="Требуется новая площадка"><MeetCard meet={{ ...meet, id: -5, status: 'pending', bookingState: 'needs_location' }} /></Preview>
      <Preview title="Отменённая встреча"><MeetCard meet={{ ...meet, id: -6, status: 'cancelled' }} /></Preview>
      <Preview title="Завершённая встреча"><MeetCard meet={{ ...meet, id: -7, startedAt: '2020-10-19T12:00:00.000Z' }} /></Preview>
    </Section>
    <Section id="calendar" title="Встреча в календаре">
      <Preview title="Опубликованная"><Box sx={{ position: 'relative', height: 180 }}><WeekCalendarMeet meet={meet} top={0} height={180} /></Box></Preview>
      <Preview title="На подтверждении"><Box sx={{ position: 'relative', height: 180 }}><WeekCalendarMeet meet={{ ...meet, id: -8, status: 'pending' }} top={0} height={180} /></Box></Preview>
    </Section>
    <Section id="ideas" title="Идеи" fourColumns>
      <Preview title="С обложкой"><IdeaCard idea={{ id: -1, title: 'Табуретка из дерева', description: project.description ?? '', image: cover }} /></Preview>
      <Preview title="Без изображения · длинное название"><IdeaCard idea={{ id: -2, title: 'Переносная многоярусная полочка для любимых книг, инструментов и маленьких сокровищ', description: 'Придумываем конструкцию, которая легко переносится и помогает хранить всё под рукой.', image: null }} /></Preview>
      <Preview title="Идея ученика · можно написать сообщение"><IdeaCard idea={studentIdea} /></Preview>
    </Section>
    <Section id="teachers" title="Преподаватели">
      <Preview title="Обычная карточка"><TeacherCard teacher={teacher} /></Preview>
      <Preview title="Выделенная карточка"><TeacherCard teacher={teacher} highlighted /></Preview>
    </Section>
    <Section id="places" title="Центры">
      <Preview title="С обложкой"><PlaceCard place={place} /></Preview>
      <Preview title="Без изображения"><PlaceCard place={{ ...place, image: null }} /></Preview>
    </Section>
    <Section id="rooms" title="Залы">
      <Preview title="Публичная карточка зала"><LocationCard location={room} showRate={false} /></Preview>
      <Preview title="Без фото · без вместимости"><LocationCard location={{ ...room, id: -2, photos: [], capacity: null, hourlyRate: null }} /></Preview>
    </Section>
    <Section id="users" title="Участники">
      <Preview title="Ученик с описанием"><Card><CardContent><UserCard user={pupil} /></CardContent></Card></Preview>
      <Preview title="Без возраста и описания"><Card><CardContent><UserCard user={{ ...pupil, title: 'Саша', age: null, description: null }} /></CardContent></Card></Preview>
    </Section>
    <Section id="features" title="Возможности платформы">
      <Preview title="Информационная карточка лендинга"><FeatureCard icon={<SchoolOutlinedIcon color="primary" />} title="Учиться, создавая" description="Находим интересную идею, знакомимся с преподавателем и вместе создаём настоящий проект." /></Preview>
    </Section>
  </Stack>;
}
