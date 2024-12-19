import { LIMIT_COMMISSION_L_POINT, LIMIT_COMMISSION_R_POINT } from '@/consts';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
dayjs.extend(utcPlugin);

interface GroupSettingCommissionBonusInterface {
  lPoint: number;
  rPoint: number;
  commission: number;
}
interface GroupSettingInterface {
  limitDate: Date;
  groupSettingCommissionBonuses: GroupSettingCommissionBonusInterface[];
}

export function calculatePoint(
  groupSetting: GroupSettingInterface[],
  points: { date: Date; left: number; right: number }
) {
  const sortedGroupSetting: GroupSettingInterface[] = groupSetting
    .sort((group1, group2) => Number(group2.limitDate) - Number(group1.limitDate))
    .map((group) => ({
      limitDate: group.limitDate,
      groupSettingCommissionBonuses: group.groupSettingCommissionBonuses.sort((bonus1, bonus2) =>
        bonus1.lPoint !== bonus2.lPoint
          ? bonus2.lPoint - bonus1.lPoint
          : bonus2.rPoint - bonus1.rPoint
      ),
    }));

  const orgLeft = Math.min(LIMIT_COMMISSION_L_POINT, points.left);
  const orgRight = Math.min(LIMIT_COMMISSION_R_POINT, points.right);
  const group = sortedGroupSetting.find(
    (group) =>
      dayjs(points.date, { utc: true }).isBefore(dayjs(group.limitDate, { utc: true }), 'day') ||
      dayjs(points.date, { utc: true }).isSame(dayjs(group.limitDate, { utc: true }), 'day')
  );
  if (!group) {
    throw new Error(
      `Can not find group - ${dayjs(points.date, { utc: true }).format('MM/DD/YYYY')}`
    );
  }
  const bonus = group.groupSettingCommissionBonuses.find(
    (commissionBonus) => orgLeft >= commissionBonus.lPoint && orgRight >= commissionBonus.rPoint
  );
  if (bonus) {
    return [orgLeft, orgRight, bonus.lPoint, bonus.rPoint, bonus.commission];
  }
  return [orgLeft, orgRight, 0, 0, 0];
}
