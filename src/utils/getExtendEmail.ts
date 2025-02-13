export const getExtendEmail = (email: string, idx: number) => {
  const emails = email.split('@');
  return `${emails[0]}+${idx}@${emails[1]}`;
};
