export const isBefore = (date1: Date, date2: Date) => {
  const strDate1 = date1.toISOString().split('T')[0].split('-');
  const strDate2 = date2.toISOString().split('T')[0].split('-');
  return (
    +strDate1[0] < +strDate2[0] ||
    (+strDate1[0] === +strDate2[0] && +strDate1[1] < +strDate2[1]) ||
    (+strDate1[0] === +strDate2[0] && +strDate1[1] === +strDate2[1] && +strDate1[2] < +strDate2[2])
  );
};
