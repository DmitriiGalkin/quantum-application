import React from 'react';
import { renderHtml } from './utils/render-html.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routers from './Routers.tsx';
import { StaticRouter } from 'react-router-dom';
import type { PageMeta } from 'entities';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const FRONTEND_SERVER = import.meta.env.FRONTEND_SERVER ?? 'http://localhost:4000';

async function getMetaByUrl(url: string): Promise<PageMeta> {
  url = new URL(url, 'http://localhost').pathname;
  if (url === '/') {
    return {
      title: 'Quantum Evolution',
      description: 'Помогаем педагогам и детям находить друг друга, создавать интересные проекты, подбирать места для проведения встреч',
      ogTitle: 'Интересные проекты и идеи для детей рядом',
      ogDescription: 'Помогаем педагогам и детям находить друг друга, создавать интересные проекты, подбирать места для проведения встреч',
      ogImage: `${FRONTEND_SERVER}/forIndex.png`,
      ogType: 'article',
      ogSiteName: 'Quantum',
    };
  }

  if (url === '/idea') {
    return {
      title: 'Quantum | Для родителей',
      description:
        'Помогаем родителям подобрать для ребенка интересный проект: секцию, кружок, мастер класс или предложить идею нового уникального проекта',
      ogTitle: 'Реализовать идею проекта ребенка',
      ogDescription:
        'Помогаем родителям подобрать для ребенка интересный проект: секцию, кружок, мастер класс или предложить идею нового уникального проекта',
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
        ogImage: meta.ogImage ?? FRONTEND_SERVER + '/forIndex.png',
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
    ogImage: `${FRONTEND_SERVER}/forIndex.png`,
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
