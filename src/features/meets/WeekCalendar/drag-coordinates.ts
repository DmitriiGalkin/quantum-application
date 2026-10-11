import type { CollisionDetection, KeyboardCoordinateGetter } from '@dnd-kit/core';

// Use the meeting's start edge, not its centre (which varies with duration).
export const slotCollision: CollisionDetection = ({ collisionRect, droppableRects, droppableContainers }) => {
  const x = collisionRect.left + collisionRect.width / 2;
  const y = collisionRect.top + 1;
  const zone = droppableContainers.find(container => {
    const rect = droppableRects.get(container.id);
    return !container.disabled && rect && x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
  });
  return zone ? [{ id: zone.id }] : [];
};

export const calendarKeyboardCoordinates: KeyboardCoordinateGetter = (event, { currentCoordinates, context }) => {
  const rect = [...context.droppableRects.values()][0];
  if (!rect || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return undefined;
  event.preventDefault();
  return { x: currentCoordinates.x + (event.code === 'ArrowRight' ? rect.width : event.code === 'ArrowLeft' ? -rect.width : 0),
    y: currentCoordinates.y + (event.code === 'ArrowDown' ? 18 : event.code === 'ArrowUp' ? -18 : 0) };
};
