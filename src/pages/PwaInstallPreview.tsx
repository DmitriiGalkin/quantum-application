import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const icon = '/icons/192.png';

function AppIdentity({ size = 44 }: { size?: number }) {
  return <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
    <Box component="img" src={icon} alt="" sx={{ width: size, height: size, borderRadius: '22%', flexShrink: 0 }} />
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ lineHeight: 1.25 }}>Quantum</Typography>
      <Typography variant="caption" color="text.secondary">Образовательные проекты для детей</Typography>
    </Box>
  </Stack>;
}

function Action({ children, primary = false }: { children: string; primary?: boolean }) {
  return <Box sx={{ px: 1.5, py: 0.75, borderRadius: 2, bgcolor: primary ? 'primary.main' : 'action.hover', color: primary ? 'primary.contrastText' : 'text.primary', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>{children}</Box>;
}

function Device({ title, detail, children }: { title: string; detail: string; children: ReactNode }) {
  return <Stack spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
    <Typography variant="subtitle2">{title}</Typography>
    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', minHeight: 32 }}>{detail}</Typography>
    {children}
  </Stack>;
}

const phoneSx = { width: '100%', maxWidth: 270, minHeight: 365, border: '7px solid #292344', borderRadius: '30px', bgcolor: '#FAF8FF', boxShadow: '0 14px 28px rgba(41,35,68,.15)', overflow: 'hidden' } as const;

export default function PwaInstallPreview() {
  return <Box component="section" id="pwa" aria-labelledby="pwa-title" sx={{ scrollMarginTop: 100 }}>
    <Typography id="pwa-title" component="h2" variant="h4" sx={{ mb: 1 }}>Установка приложения · PWA</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>Так выглядят текущий логотип и иконки Quantum. Экраны установки ниже — макеты: системные подписи и кнопки зависят от браузера и устройства.</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mb: 3 }}>
      <Card variant="outlined"><CardContent><Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Логотип в шапке</Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}><Box component="img" src="/brand-mark.svg" alt="Знак Quantum" sx={{ width: 80, height: 80, borderRadius: 2 }} /><Typography variant="h5" sx={{ fontWeight: 800 }}>Quantum</Typography></Stack>
        <Typography variant="caption" color="text.secondary">brand-mark.svg</Typography>
      </CardContent></Card>
      <Card variant="outlined"><CardContent><Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Значок приложения</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {[
            { src: '/icons/512.png', label: 'Обычная · PWA' },
            { src: '/icons/maskable-512.png', label: 'Маскируемая · Android' },
            { src: '/icons/apple-touch-icon.png', label: 'Экран «Домой» · iPhone' },
          ].map(item => <Stack key={item.src} spacing={0.5} sx={{ width: 88, alignItems: 'center', textAlign: 'center' }}>
            <Box component="img" src={item.src} alt={item.label} sx={{ width: 72, height: 72, borderRadius: '22%' }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{item.label}</Typography>
          </Stack>)}
        </Box>
      </CardContent></Card>
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' }, gap: 3, alignItems: 'start' }}>
      <Device title="Android · Chrome" detail="Предложение установить приложение">
        <Box sx={phoneSx}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">quantum · образовательные проекты</Typography></Box>
          <Box sx={{ p: 2, height: 137, background: 'linear-gradient(145deg, #eee5ff, #fff8eb)' }}><AppIdentity size={36} /><Typography variant="body2" sx={{ mt: 2 }}>Идеи превращаются в проекты</Typography></Box>
          <Box sx={{ mx: 1, mt: 2, p: 2, borderRadius: 3, bgcolor: '#fff', boxShadow: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Установить приложение?</Typography><AppIdentity />
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}><Action>Отмена</Action><Action primary>Установить</Action></Stack>
          </Box>
        </Box>
      </Device>
      <Device title="iPhone · Safari" detail="Добавление на экран «Домой»">
        <Box sx={phoneSx}>
          <Box sx={{ p: 1.5, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">quantum · Safari</Typography></Box>
          <Box sx={{ p: 2, height: 119, background: 'linear-gradient(145deg, #eee5ff, #fff8eb)' }}><AppIdentity size={36} /><Typography variant="body2" sx={{ mt: 1.5 }}>Учиться, создавая</Typography></Box>
          <Box sx={{ mx: 1, mt: 1, p: 2, borderRadius: 3, bgcolor: '#fff', boxShadow: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>На экран «Домой»</Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Box component="img" src="/icons/apple-touch-icon.png" alt="" sx={{ width: 44, height: 44, borderRadius: 2 }} /><Typography variant="body2">Quantum</Typography></Stack>
            <Box sx={{ mt: 2 }}><Action primary>Добавить</Action></Box>
          </Box>
        </Box>
      </Device>
      <Device title="Компьютер · Chrome" detail="Диалог установки в браузере">
        <Box sx={{ width: '100%', minHeight: 258, mt: { md: 5 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#FAF8FF', boxShadow: '0 14px 28px rgba(41,35,68,.15)', overflow: 'hidden' }}>
          <Box sx={{ p: 1, bgcolor: '#eeeaf5', borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="caption">Quantum · quantum-education</Typography></Box>
          <Box sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Установить приложение</Typography>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', boxShadow: 2 }}><AppIdentity size={56} />
              <Typography variant="body2" sx={{ mt: 2 }}>Открывайте Quantum как отдельное приложение.</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}><Action>Отмена</Action><Action primary>Установить</Action></Stack>
            </Box>
          </Box>
        </Box>
      </Device>
    </Box>
  </Box>;
}
