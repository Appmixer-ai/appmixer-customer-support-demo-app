/**
 * Application-wide constants for the customer support demo app
 */

// Ticket Status Constants
export const TICKET_STATUSES = {
  NEW: 'new',
  IN_PROGRESS: 'in-progress',
  WAITING_CUSTOMER: 'waiting-customer',
  RESOLVED: 'resolved',
} as const;

export type TicketStatus = typeof TICKET_STATUSES[keyof typeof TICKET_STATUSES];

// Ticket Priority Constants
export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TicketPriority = typeof TICKET_PRIORITIES[keyof typeof TICKET_PRIORITIES];

// Kanban Column Configuration
export const KANBAN_COLUMNS = [
  {
    id: TICKET_STATUSES.NEW,
    title: 'New',
    color: 'bg-blue-50',
    badgeColor: 'bg-blue-500',
  },
  {
    id: TICKET_STATUSES.IN_PROGRESS,
    title: 'In Progress',
    color: 'bg-yellow-50',
    badgeColor: 'bg-yellow-500',
  },
  {
    id: TICKET_STATUSES.WAITING_CUSTOMER,
    title: 'Waiting on Customer',
    color: 'bg-purple-50',
    badgeColor: 'bg-purple-500',
  },
  {
    id: TICKET_STATUSES.RESOLVED,
    title: 'Resolved',
    color: 'bg-green-50',
    badgeColor: 'bg-green-500',
  },
] as const;

// Priority Colors for Badges
export const PRIORITY_COLORS = {
  [TICKET_PRIORITIES.LOW]: 'bg-gray-100 text-gray-800 border-gray-200',
  [TICKET_PRIORITIES.MEDIUM]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TICKET_PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TICKET_PRIORITIES.URGENT]: 'bg-red-100 text-red-800 border-red-200',
} as const;

// Status Colors for Badges
export const STATUS_COLORS = {
  [TICKET_STATUSES.NEW]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TICKET_STATUSES.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TICKET_STATUSES.WAITING_CUSTOMER]: 'bg-purple-100 text-purple-800 border-purple-200',
  [TICKET_STATUSES.RESOLVED]: 'bg-green-100 text-green-800 border-green-200',
} as const;

// Status Labels (Human-readable)
export const STATUS_LABELS = {
  [TICKET_STATUSES.NEW]: 'New',
  [TICKET_STATUSES.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUSES.WAITING_CUSTOMER]: 'Waiting on Customer',
  [TICKET_STATUSES.RESOLVED]: 'Resolved',
} as const;

// Priority Labels (Human-readable)
export const PRIORITY_LABELS = {
  [TICKET_PRIORITIES.LOW]: 'Low',
  [TICKET_PRIORITIES.MEDIUM]: 'Medium',
  [TICKET_PRIORITIES.HIGH]: 'High',
  [TICKET_PRIORITIES.URGENT]: 'Urgent',
} as const;

// Priority Indicator Colors (for visual indicators)
export const PRIORITY_INDICATOR_COLORS = {
  [TICKET_PRIORITIES.LOW]: 'bg-gray-400',
  [TICKET_PRIORITIES.MEDIUM]: 'bg-blue-500',
  [TICKET_PRIORITIES.HIGH]: 'bg-orange-500',
  [TICKET_PRIORITIES.URGENT]: 'bg-red-500',
} as const;
