export const convertNumToString = (value: number, length: number = -1) => {
  if (length === -1) return `${value}`;
  return value.toString().padStart(length, '0');
};
