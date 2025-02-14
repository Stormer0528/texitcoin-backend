export function formatName(fullName: string) {
  // Split the name into parts
  const nameParts = fullName.trim().split(/\s+/);

  // Capitalize the first name
  const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();

  // Get the last initial
  const lastInitial =
    nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : '';

  // Return the formatted name
  return `${firstName} ${lastInitial}`.trim();
}
