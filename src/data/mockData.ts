import { SupportTicket, DashboardStats, Customer } from "@/types/support";

// Mock customers
const customers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@company.com",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@startup.io",
  },
  {
    id: "4",
    name: "David Kim",
    email: "d.kim@business.net",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "lisa.thompson@corp.com",
  },
  {
    id: "6",
    name: "Alex Martinez",
    email: "alex.m@tech.co",
  },
];

// Mock support tickets
export const mockTickets: SupportTicket[] = [
  {
    id: "TICK-001",
    title: "Login page not loading properly",
    description:
      "The login page shows a blank screen after entering credentials. This has been happening for the past 2 days.",
    priority: "high",
    status: "new",
    customer: customers[0],
    assignee: undefined,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    tags: ["bug", "authentication", "urgent"],
  },
  {
    id: "TICK-002",
    title: "Feature request: Dark mode support",
    description:
      "It would be great to have a dark mode option in the application for better user experience during night time usage.",
    priority: "low",
    status: "in-progress",
    customer: customers[1],
    assignee: "Alex Chen",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    tags: ["enhancement", "ui", "feature-request"],
  },
  {
    id: "TICK-003",
    title: "Payment gateway timeout error",
    description:
      "Getting timeout errors when processing payments above $500. Customers are unable to complete large transactions.",
    priority: "urgent",
    status: "in-progress",
    customer: customers[2],
    assignee: "Sarah Kim",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    tags: ["payment", "critical", "bug", "gateway"],
  },
  {
    id: "TICK-004",
    title: "How to export data to CSV?",
    description:
      "I need help understanding how to export my data to CSV format. The documentation is not clear on this process.",
    priority: "medium",
    status: "waiting-customer",
    customer: customers[3],
    assignee: "Mike Wilson",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    tags: ["question", "documentation", "export"],
  },
  {
    id: "TICK-005",
    title: "Account deletion request",
    description:
      "I would like to delete my account and all associated data. Please confirm the process and timeline.",
    priority: "medium",
    status: "resolved",
    customer: customers[4],
    assignee: "Tom Brown",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    tags: ["account", "deletion", "privacy", "gdpr"],
  },
  {
    id: "TICK-006",
    title: "Mobile app crashes on startup",
    description:
      "The mobile application crashes immediately after opening. This started after the latest update yesterday.",
    priority: "high",
    status: "new",
    customer: customers[5],
    assignee: undefined,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    tags: ["mobile", "crash", "bug", "app"],
  },
  {
    id: "TICK-007",
    title: "Billing discrepancy question",
    description:
      "There seems to be a discrepancy in my billing statement. The amount charged doesn't match my plan.",
    priority: "medium",
    status: "in-progress",
    customer: customers[1],
    assignee: "Jennifer Lee",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    tags: ["billing", "payment", "question"],
  },
  {
    id: "TICK-008",
    title: "API rate limit exceeded",
    description:
      "Our application is hitting API rate limits frequently. We need to understand how to increase our limits.",
    priority: "high",
    status: "waiting-customer",
    customer: customers[2],
    assignee: "David Park",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    tags: ["api", "rate-limit", "technical"],
  },
  {
    id: "TICK-009",
    title: "Password reset not working",
    description:
      "The password reset email is not being received. I've checked spam folder and tried multiple times.",
    priority: "medium",
    status: "resolved",
    customer: customers[0],
    assignee: "Lisa Chang",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    tags: ["password", "email", "authentication"],
  },
  {
    id: "TICK-010",
    title: "Integration with Slack",
    description:
      "We need help setting up the Slack integration for our team notifications. The setup guide is confusing.",
    priority: "low",
    status: "new",
    customer: customers[4],
    assignee: undefined,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    tags: ["integration", "slack", "setup", "documentation"],
  },
];

// Mock end user tickets (only tickets for the current end user - Customer John)
export const mockEndUserTickets: SupportTicket[] = [
  {
    id: "TICK-E001",
    title: "Unable to access dashboard",
    description:
      "I'm getting a 403 error when trying to access my dashboard. This started happening this morning.",
    priority: "high",
    status: "new",
    customer: {
      id: "end-user",
      name: "Customer John",
      email: "customer.john@email.com",
    },
    assignee: undefined,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    tags: ["access", "dashboard", "error"],
  },
  {
    id: "TICK-E002",
    title: "Question about subscription plan",
    description:
      "I want to understand the difference between the Pro and Enterprise plans. Could someone explain the features?",
    priority: "medium",
    status: "waiting-customer",
    customer: {
      id: "end-user",
      name: "Customer John",
      email: "customer.john@email.com",
    },
    assignee: "Support Agent",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    tags: ["subscription", "pricing", "question"],
  },
  {
    id: "TICK-E003",
    title: "Feature request: Email notifications",
    description:
      "It would be helpful to receive email notifications when my tickets are updated or resolved.",
    priority: "low",
    status: "in-progress",
    customer: {
      id: "end-user",
      name: "Customer John",
      email: "customer.john@email.com",
    },
    assignee: "Product Team",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    tags: ["feature-request", "notifications", "email"],
  },
];

// Mock dashboard statistics for admin
export const mockDashboardStats: DashboardStats = {
  totalTickets: mockTickets.length,
  newTickets: mockTickets.filter((t) => t.status === "new").length,
  inProgressTickets: mockTickets.filter((t) => t.status === "in-progress")
    .length,
  resolvedTickets: mockTickets.filter((t) => t.status === "resolved").length,
  avgResponseTime: "2.4h",
  customerSatisfaction: 4.7,
};

// Mock dashboard statistics for end user
export const mockEndUserDashboardStats: DashboardStats = {
  totalTickets: mockEndUserTickets.length,
  newTickets: mockEndUserTickets.filter((t) => t.status === "new").length,
  inProgressTickets: mockEndUserTickets.filter(
    (t) => t.status === "in-progress",
  ).length,
  resolvedTickets: mockEndUserTickets.filter((t) => t.status === "resolved")
    .length,
  avgResponseTime: "4.2h",
  customerSatisfaction: 4.5,
};
