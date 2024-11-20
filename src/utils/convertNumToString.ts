interface NumberInputProp {
  value: number;
  length?: number;
  prefix?: string;
}
export const convertNumToString = ({ value, length, prefix }: NumberInputProp) => {
  let res = `${value}`;
  if (length) res = value.toString().padStart(length, '0');
  if (prefix) res = `${prefix}-${res}`;
  return res;
};
