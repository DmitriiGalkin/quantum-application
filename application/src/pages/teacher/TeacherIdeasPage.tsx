import { CardContent, Stack, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { fetchTeacherIdeas } from '../../requests.ts';

export default function TeacherIdeasPage() {
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['teacher-ideas'],
    queryFn: fetchTeacherIdeas,
  });

  if (isLoading) {
    return <>Загрузка...</>;
  }

  return (
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center'}}>
          <Typography variant="h4">Мои идеи проектов</Typography>
          <Button variant="contained" component={Link} to="/teacher/ideas/create">
            Создать идею
          </Button>
        </Stack>

        {ideas.map(idea => (
          <Card key={idea.id}>
            <CardContent>
              <Typography>{idea.title}</Typography>

              <Typography color="text.secondary">
                {idea.createdAt}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
  );
}
// import Card from '@mui/material/Card';
// import { useQuery } from '@tanstack/react-query';
// import { fetchTeacherIdeas } from '../../requests.ts';
//
// export default function TeacherIdeasPage() {
//   const { data: ideas = [], isLoading } = useQuery({
//     queryKey: ['teacher-ideas'],
//     queryFn: fetchTeacherIdeas,
//   });
//
//   if (isLoading) {
//     return <>Загрузка...</>;
//   }
//
//   return (
//       <Stack spacing={2}>
//         <Typography variant="h4">Мои идеи проектов</Typography>
//
//         {ideas.map(idea => (
//           <Card key={idea.id}>
//             <CardContent>
//               <Typography>{idea.title}</Typography>
//
//               <Typography color="text.secondary">
//                 {idea.createdAt}
//               </Typography>
//             </CardContent>
//           </Card>
//         ))}
//       </Stack>
//   );
// }
