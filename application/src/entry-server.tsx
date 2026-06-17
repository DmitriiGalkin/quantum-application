import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { StaticRouter } from 'react-router-dom';
import type { PageMeta } from '@shared/types';
import { AuthProvider } from './providers/AuthProvider.tsx';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const FRONTEND_SERVER = import.meta.env.FRONTEND_SERVER ?? 'http://localhost:4000';

async function getMetaByUrl(url: string): Promise<PageMeta> {
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

  const projectMatch = url.match(/^\/project\/([^/]+)/);

  if (projectMatch) {
    console.log(projectMatch, 'projectMatch');
    const projectId = projectMatch[1];
    const response = await fetch(`${API_URL}/project/${projectId}/meta`);
    const projectMeta = await response.json();

    console.log(projectMeta, 'projectMeta');

    return {
      title: projectMeta.title,
      description: projectMeta.description,
      ogTitle: projectMeta.ogTitle,
      ogDescription: projectMeta.ogDescription,
      ogImage: projectMeta.ogImage,
      ogType: projectMeta.ogType ?? 'article',
      ogSiteName: projectMeta.ogSiteName ?? 'Quantum',
    };
  }

  const ideaMatch = url.match(/^\/project\/([^/]+)/);

  if (ideaMatch) {
    const ideaId = ideaMatch[1];
    const response = await fetch(`${API_URL}/idea/${ideaId}/meta`);
    const meta = await response.json();

    return {
      title: meta.title,
      description: meta.description,
      ogTitle: meta.ogTitle,
      ogDescription: meta.ogDescription,
      ogImage: meta.ogImage,
      ogType: meta.ogType ?? 'article',
      ogSiteName: meta.ogSiteName ?? 'Quantum',
    };
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

  const html = renderToString(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </StaticRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );

  return {
    html,
    meta,
  };
}