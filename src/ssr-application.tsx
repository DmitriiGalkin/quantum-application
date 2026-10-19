import React from 'react';
import { renderHtml } from './utils/render-html.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routers from './Routers.tsx';
import { StaticRouter } from 'react-router-dom';
import type { PageMeta } from 'entities';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import CssBaseline from '@mui/material/CssBaseline';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const FRONTEND_SERVER = import.meta.env.FRONTEND_SERVER ?? 'http://localhost:4000';

async function getMetaByUrl(url: string): Promise<PageMeta> {
  url = new URL(url, 'http://localhost').pathname;
  if (url === '/cards') {
    return {
      title: 'Карточки интерфейса — Quantum', description: 'Галерея карточек Quantum: проекты, встречи, идеи, преподаватели, центры и залы.',
      ogTitle: 'Карточки интерфейса Quantum', ogDescription: 'Примеры карточек приложения и их основных состояний.',
      ogType: 'website', ogSiteName: 'Quantum', ogImage: `${FRONTEND_SERVER}/brand-preview.png`,
    };
  }
  if (url === '/' || url === '/projects') {
    return {
      title: 'Quantum — образовательные проекты для детей',
      description: 'Выберите проект для ребёнка: преподаватели, места, ближайшие встречи и стоимость участия.',
      ogTitle: 'Образовательные проекты для детей',
      ogDescription: 'Выберите проект для ребёнка: преподаватели, места, ближайшие встречи и стоимость участия.',
      ogImage: `${FRONTEND_SERVER}/brand-preview.png`,
      ogType: 'article',
      ogSiteName: 'Quantum',
    };
  }

  if (url === '/craft-school-program') {
    return {
      title: 'Программа вальдорфской школы по ремеслу — Quantum',
      description: 'Программа ремесла для 1–12 классов: направления работы и идеи изделий.',
      ogTitle: 'Программа вальдорфской школы по ремеслу',
      ogDescription: 'Программа ремесла для 1–12 классов: направления работы и идеи изделий.',
      ogType: 'article', ogSiteName: 'Quantum', ogImage: `${FRONTEND_SERVER}/brand-preview.png`,
    };
  }

  if (url === '/ideas') {
    return {
      title: 'Quantum — библиотека идей', description: 'Идеи образовательных проектов для детей и преподавателей.',
      ogTitle: 'Библиотека идей', ogDescription: 'Вдохновение для новых образовательных проектов.',
      ogType: 'website', ogSiteName: 'Quantum', ogImage: `${FRONTEND_SERVER}/brand-preview.png`,
    };
  }
  if (url === '/landing/parent') {
    return {
      title: 'Quantum | Для родителей',
      description:
        'Выберите образовательный проект для ребёнка и запишитесь на встречу с преподавателем.',
      ogTitle: 'Найдите интересный проект для ребёнка',
      ogDescription:
        'Выберите образовательный проект для ребёнка и запишитесь на встречу с преподавателем.',
      ogImage: `${FRONTEND_SERVER}/forParent.png`,
      ogType: 'article',
      ogSiteName: 'Quantum | Для родителей',
    };
  }

  if (url === '/project') {
    return {
      title: 'Quantum | Для педагогов',
      description:
        'Помогаем педагогам развивать детские проекты: набирать детей в группы, подбирать места для проведения встреч, вести учет посещаемости и оплаты занятий',
      ogTitle: 'Организовать детский проект',
      ogDescription:
        'Помогаем педагогам развивать детские проекты: набирать детей в группы, подбирать места для проведения встреч, вести учет посещаемости и оплаты занятий',
      ogImage: `${FRONTEND_SERVER}/forTeacher.png`,
      ogType: 'article',
      ogSiteName: 'Quantum | Для учителей',
    };
  }

  const entityMatch = url.match(/^\/(project|idea|places)\/([^/]+)$/);
  if (entityMatch) {
    const [, entity, id] = entityMatch;
    const response = await fetch(API_URL + '/' + (entity === 'places' ? 'place' : entity) + '/' + id + '/meta');
    if (response.ok) {
      const meta = (await response.json()) as Partial<PageMeta>;
      return {
        title: meta.title ?? 'Quantum',
        description: meta.description ?? 'Quantum',
        ogTitle: meta.ogTitle ?? meta.title ?? 'Quantum',
        ogDescription: meta.ogDescription ?? meta.description ?? 'Quantum',
        ogImage: meta.ogImage ?? FRONTEND_SERVER + '/brand-preview.png',
        ogType: meta.ogType ?? 'article',
        ogSiteName: meta.ogSiteName ?? 'Quantum',
      };
    }
  }

  return {
    title: 'Quantum',
    description: 'Quantum',
    ogTitle: 'Quantum',
    ogDescription: 'Quantum',
    ogImage: `${FRONTEND_SERVER}/brand-preview.png`,
    ogType: 'website',
    ogSiteName: 'Quantum',
  };
}

export async function render(url: string) {
  const meta = await getMetaByUrl(url);
  const queryClient = new QueryClient();

  const html = await renderHtml(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <Routers />
            </AuthProvider>
          </ThemeProvider>
        </StaticRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );

  return {
    html,
    meta,
  };
}
