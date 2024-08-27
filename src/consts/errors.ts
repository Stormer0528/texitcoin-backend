export const uniqueErrors = [
  {
    modelName: 'Admin',
    path: ['username'],
    message: 'Username already exists',
  },
  {
    modelName: 'Admin',
    path: ['email'],
    message: 'Email already exists',
  },
  {
    modelName: 'Member',
    path: ['username'],
    message: 'Username already exists',
  },
  {
    modelName: 'Member',
    path: ['email'],
    message: 'Email already exists',
  },
  {
    modelName: 'Member',
    path: ['userId'],
    message: 'UserId already exists',
  },
  {
    modelName: 'Sale',
    path: ['invoiceNo'],
    message: 'InvoiceNo already exists',
  },
  {
    modelName: 'MemberWallet',
    path: ['memberId', 'payoutId', 'address', 'deletedAt'],
    message: 'Wallet already exists',
  },
  {
    modelName: 'Member',
    path: ['assetId'],
    message: 'AssetId already exists',
  },
  {
    modelName: 'Statistics',
    path: ['transactionId'],
    message: 'TransactionId already exists',
  },
];

export const foreignKeyErrors = [
  {
    constraintName: 'member_statistics_memberId_fkey',
    model: 'MemberStatistics',
    foreignModel: 'Member',
    message: 'There is a reward of this member',
    path: ['memberid'],
  },
  {
    constraintName: 'member_statistics_statisticsId_fkey',
    model: 'MemberStatistics',
    foreignModel: 'Statistics',
    message: 'Some members are remained in this reward',
    path: ['statisticsId'],
  },
  {
    constraintName: 'sales_memberId_fkey',
    model: 'Sale',
    foreignModel: 'Member',
    message: 'There is a sale of this member',
    path: ['memberId'],
  },
  {
    constraintName: 'sales_packageId_fkey',
    model: 'Sale',
    foreignModel: 'Package',
    message: 'There is a sale of this package',
    path: ['packageId'],
  },
  {
    constraintName: 'statistics_sale_statisticsId_fkey',
    model: 'StatisticsSale',
    foreignModel: 'Statistics',
    message: 'Some sales are reamined in this reward',
    path: ['statisticsId'],
  },
  {
    constraintName: 'statistics_sale_saleId_fkey',
    model: 'StatisticsSale',
    foreignModel: 'Sale',
    message: 'There is a reward of this sale',
    path: ['saleId'],
  },
  {
    constraintName: 'members_sponsorId_fkey',
    model: 'Member',
    foreignModel: 'Member',
    message: 'Some introducers are remained',
    path: ['sponsorId'],
  },
  {
    constraintName: 'memberwallets_memberId_fkey',
    model: 'MemberWallet',
    foreignModel: 'Member',
    message: 'Wallets data is remained',
    path: ['memberId'],
  },
  {
    constraintName: 'memberwallets_payoutId_fkey',
    model: 'MemberWallet',
    foreignModel: 'Payout',
    message: 'Wallets data is remained',
    path: ['payoutId'],
  },
  {
    constraintName: 'memberstatisticswallets_memberStatisticId_fkey',
    model: 'MemberStatisticsWallet',
    foreignModel: 'MemberStatistics',
    message: 'There are wallets of this reward',
    path: ['memberStatisticId'],
  },
  {
    constraintName: 'memberstatisticswallets_memberWalletId_fkey',
    model: 'memberstatisticswallets',
    foreignModel: 'MemberWallet',
    message: 'There are rewards using this wallet',
    path: ['memberWalletId'],
  },
];
