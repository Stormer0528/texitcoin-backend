export function calculatePoint(points: { left: number; right: number }) {
  const orgLeft = Math.min(9, points.left);
  const orgRight = Math.min(9, points.right);
  if (orgLeft >= 9 && orgRight >= 9) {
    return [orgLeft, orgRight, 9, 9, 3000];
  } else if (orgLeft >= 6 && orgRight >= 6) {
    return [orgLeft, orgRight, 6, 6, 2000];
  } else if (orgLeft >= 3 && orgRight >= 3) {
    return [orgLeft, orgRight, 3, 3, 1000];
  }
  return [orgLeft, orgRight, 0, 0, 0];
}
