import { GROUP_SETTINGS } from '../../src/consts';

interface GroupSettingCommissionBonusInterface {
  lPoint: number;
  rPoint: number;
  commission: number;
  groupSettingId: string;
}

interface GroupSettingInterface {
  id: string;
  limitDate: Date;
  name: string;
  sponsorBonusPackageId?: string | null;
  groupSettingCommissionBonuses: GroupSettingCommissionBonusInterface[];
}

export const groupSettings: GroupSettingInterface[] = [
  {
    id: GROUP_SETTINGS[0],
    limitDate: new Date('2024-06-08'),
    name: "Founder's club",
    sponsorBonusPackageId: null,
    groupSettingCommissionBonuses: [
      {
        lPoint: 3,
        rPoint: 3,
        commission: 1000,
        groupSettingId: GROUP_SETTINGS[0],
      },
      {
        lPoint: 6,
        rPoint: 6,
        commission: 2000,
        groupSettingId: GROUP_SETTINGS[0],
      },
      {
        lPoint: 9,
        rPoint: 9,
        commission: 3000,
        groupSettingId: GROUP_SETTINGS[0],
      },
    ],
  },
  {
    id: GROUP_SETTINGS[1],
    limitDate: new Date('2100-01-01'),
    name: 'Early Adopters',
    sponsorBonusPackageId: null,
    groupSettingCommissionBonuses: [
      {
        lPoint: 3,
        rPoint: 3,
        commission: 1000,
        groupSettingId: GROUP_SETTINGS[1],
      },
      {
        lPoint: 6,
        rPoint: 6,
        commission: 2000,
        groupSettingId: GROUP_SETTINGS[1],
      },
      {
        lPoint: 9,
        rPoint: 9,
        commission: 3000,
        groupSettingId: GROUP_SETTINGS[1],
      },
    ],
  },
];
