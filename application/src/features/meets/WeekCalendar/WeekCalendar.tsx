import { Box, Paper } from '@mui/material';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import WeekCalendarGrid from './WeekCalendarGrid.tsx';
import WeekCalendarHeader from './WeekCalendarHeader.tsx';
import type { MeetExtendedDto } from '@shared/types';

export interface WeekCalendarProps {
  meets: MeetExtendedDto[];

  weekStartsOn?: 0 | 1;

  startHour?: number;

  endHour?: number;

  onMeetClick?(meet: MeetExtendedDto): void;

  onCellClick?(date: Date): void;
  single?: boolean;
  visibleDays: number[];
}

export default function WeekCalendar({ meets, visibleDays, single, startHour = 8, endHour = 22, onMeetClick, onCellClick }: WeekCalendarProps) {

  const handleDragEnd = (event: DragEndEvent) => {
    console.log(event);
    const { active, over } = event;
    if (over) {
      // TODO: Implement meet time update logic
      console.log('Meet moved from', active.id, 'to', over.id);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {!single && <WeekCalendarHeader days={visibleDays} />}

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          <WeekCalendarGrid
            days={visibleDays}
            meets={meets}
            startHour={startHour}
            endHour={endHour}
            onMeetClick={onMeetClick}
            onCellClick={onCellClick}
          />
        </Box>
      </Paper>
    </DndContext>
  );
}
