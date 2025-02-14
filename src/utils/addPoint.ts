import { PLACEMENT_ROOT } from '@/consts';
import dayjs from 'dayjs';

export async function addPoint(
  mapMembers: Record<string, any>,
  sale: { id: string; point: number },
  addedLeftPoint: Record<string, number>,
  addedRightPoint: Record<string, number>,
  weekStartDate: Date
) {
  if (!sale.point) return;
  let iID = sale.id;
  const ids: { id: string; position: string }[] = [];
  const nextWeekStartDate = dayjs(weekStartDate).add(1, 'week').toDate();
  while (iID !== PLACEMENT_ROOT && iID) {
    if (!mapMembers[iID]) break;

    const parentId = mapMembers[iID].placementParentId;
    if (parentId) {
      if (mapMembers[parentId].createdAt < nextWeekStartDate) {
        ids.push({
          id: parentId,
          position: mapMembers[iID].placementPosition,
        });
      }
    }

    iID = parentId;
  }

  if (iID) {
    ids.forEach((id) => {
      if (id.position === 'LEFT') {
        addedLeftPoint[id.id] = (addedLeftPoint[id.id] ?? 0) + sale.point;
      } else if (id.position === 'RIGHT') {
        addedRightPoint[id.id] = (addedRightPoint[id.id] ?? 0) + sale.point;
      }
    });
  }
}
