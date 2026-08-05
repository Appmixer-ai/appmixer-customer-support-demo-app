export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus =
  | "new"
  | "in-progress"
  | "waiting-customer"
  | "resolved";

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  customer: Customer;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  comments?: TicketComment[];
}

export interface DashboardStats {
  totalTickets: number;
  newTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResponseTime: string;
  customerSatisfaction: number;
}
