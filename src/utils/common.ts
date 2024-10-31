export const toLocaleDate = function (date: Date, type: 'en-CA' | 'en-US' | 'en-GB'): string {
  return date.toLocaleDateString(type);
};

export const formatDate = function (date: Date): string {
  const formattedDate = date.toISOString().split('T')[0];

  return formattedDate;
};

export const formatDate2 = function (date: Date): string {
  const formattedDate = date.toISOString().split('T')[0].split('-');

  return `${formattedDate[1]}/${formattedDate[2]}/${formattedDate[0]}`;
};

export const today = function (): Date {
  return new Date(formatDate(new Date()));
};
