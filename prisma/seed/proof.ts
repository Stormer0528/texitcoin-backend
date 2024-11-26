import { ProofType } from '@/graphql/enum';

interface ProofTypeDataInterface {
  proofType: ProofType;
  display: string;
}

export const proofTypeData: ProofTypeDataInterface[] = [
  {
    proofType: ProofType.COMMISSION,
    display: 'Commission',
  },
  {
    proofType: ProofType.MINENEWEQUIPMENT,
    display: 'New Equipment',
  },
  {
    proofType: ProofType.MINEELECTRICITY,
    display: 'Electricity',
  },
  {
    proofType: ProofType.MINEMAINTAINANCE,
    display: 'Maintenance',
  },
  {
    proofType: ProofType.MINEFACILITYRENTMORTAGE,
    display: 'Facility',
  },
  {
    proofType: ProofType.MARKETINGMINETXCPROMOTION,
    display: 'MineTXC Promotion',
  },
  {
    proofType: ProofType.MARKETINGTXCPROMOTION,
    display: 'TXC Promotion',
  },
  {
    proofType: ProofType.INFRASTRUCTURE,
    display: 'Infrastructure',
  },
  {
    proofType: ProofType.OVERHEAD,
    display: 'Overhead',
  },
  {
    proofType: ProofType.ADMINISTRATIONSALARY,
    display: 'Salary',
  },
  {
    proofType: ProofType.PROMOTION,
    display: 'Promotion',
  },
  {
    proofType: ProofType.PROFIT,
    display: 'Profit',
  },
  {
    proofType: ProofType.SALE,
    display: 'Sale',
  },
  {
    proofType: ProofType.PREPAY,
    display: 'Prepay',
  },
  {
    proofType: ProofType.DEVELOPERSPROTOCOL,
    display: 'Protocol',
  },
  {
    proofType: ProofType.DEVELOPERSWEB,
    display: 'Web',
  },
  {
    proofType: ProofType.DEVELOPERSAPPS,
    display: 'Apps',
  },
  {
    proofType: ProofType.DEVELOPERSINTEGRATIONS,
    display: 'Integration',
  },
];
