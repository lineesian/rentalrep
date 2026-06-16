const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format a Date as "14 June 2026" (South African style, no external libs). */
export function formatDateZA(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Review window rules:
 *   Opens  14 days BEFORE lease end date
 *   Closes 90 days AFTER  lease end date
 */
export type ReviewWindowStatus =
  | { status: "too_early"; opensOn: Date }
  | { status: "expired";   closedOn: Date }
  | { status: "open" };

export function getReviewWindowStatus(leaseEndDate: string): ReviewWindowStatus {
  const end = new Date(leaseEndDate);
  end.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const opensOn = new Date(end);
  opensOn.setDate(opensOn.getDate() - 14);

  const closedOn = new Date(end);
  closedOn.setDate(closedOn.getDate() + 90);

  if (today < opensOn)  return { status: "too_early", opensOn };
  if (today > closedOn) return { status: "expired",   closedOn };
  return { status: "open" };
}
