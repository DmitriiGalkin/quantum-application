import { useQuery } from '@tanstack/react-query';
import Markdown from 'markdown-to-jsx';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import source from '../../docs/craft-school-program.md?raw';
import IdeaCard from '../features/idea/ui/IdeaCard.tsx';
import savedIdeas from '../features/idea/data/craft-program-cards.json';
import { fetchIdeas } from '../requests.ts';
import { parseCraftProgram } from '../shared/lib/craft-school-program.ts';

const sections = parseCraftProgram(source);

export default function CraftSchoolProgramPage() {
  const query = useQuery({ queryKey: ['ideas', {}], queryFn: () => fetchIdeas({}) });
  // Published catalog data keeps the document's cards visible during SSR and API outages.
  const byId = new Map((query.data ?? savedIdeas).map(idea => [idea.id, idea]));
  return <Container maxWidth="lg"><Stack spacing={4}>
    <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 30, md: 44 } }}>Программа вальдорфской школы по ремеслу</Typography>
    {query.isPending && <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <CircularProgress size={24} aria-label="Загрузка идей программы" />
      <Typography role="status">Обновление идей программы…</Typography>
    </Stack>}
    {query.isError && <Alert severity="warning" action={<Button onClick={() => void query.refetch()}>Повторить</Button>}>Не удалось обновить идеи программы. {query.data === undefined && 'Показана сохранённая версия каталога.'}</Alert>}
    {sections.map((section, sectionIndex) => <Stack component="section" key={section.title} spacing={2} aria-labelledby={`program-section-${sectionIndex}`}>
      <Typography component="h2" variant="h4" id={`program-section-${sectionIndex}`}>{section.title}</Typography>
      {section.blocks.map((block, blockIndex) => {
        if (block.kind === 'text') return <Box key={blockIndex} sx={{ '& p': { my: 1 }, '& li': { mb: 0.5 }, overflowWrap: 'anywhere' }}><Markdown>{block.markdown}</Markdown></Box>;
        return <Stack key={blockIndex} direction="row" sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'stretch' }}>
          {block.ideas.map(({ id, label }) => {
            const idea = byId.get(id);
            if (idea) return <Box key={id} sx={{ width: { xs: '100%', sm: 280 }, minWidth: 0 }}><IdeaCard idea={idea} /></Box>;
            return query.isSuccess ? <Typography key={id} color="text.secondary">{label}: идея недоступна.</Typography> : null;
          })}
        </Stack>;
      })}
    </Stack>)}
  </Stack></Container>;
}
