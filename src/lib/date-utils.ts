/**
 * Formats a date as a relative time string (e.g., "2h ago", "3d ago")
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const days = Math.floor(diffInHours / 24);
  return `${days}d ago`;
}
