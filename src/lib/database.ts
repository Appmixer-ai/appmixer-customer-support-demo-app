import { supabase } from './supabase';
import { SupportTicket, Customer, DashboardStats, TicketComment } from '@/types/support';

// Database types for Supabase
interface DatabaseCustomer {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

interface DatabaseTicket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  customer_id: string;
  assignee: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  customers: DatabaseCustomer;
}

interface DatabaseTicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

// Transform database customer to app customer
function transformCustomer(dbCustomer: DatabaseCustomer): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    email: dbCustomer.email,
    avatar: dbCustomer.avatar || undefined,
  };
}

// Transform database comment to app comment
function transformComment(dbComment: DatabaseTicketComment): TicketComment {
  return {
    id: dbComment.id,
    ticketId: dbComment.ticket_id,
    authorId: dbComment.author_id,
    authorName: dbComment.author_name,
    content: dbComment.content,
    isInternal: dbComment.is_internal,
    createdAt: new Date(dbComment.created_at),
    updatedAt: new Date(dbComment.updated_at),
  };
}

// Transform database ticket to app ticket
function transformTicket(dbTicket: DatabaseTicket): SupportTicket {
  return {
    id: dbTicket.id,
    title: dbTicket.title,
    description: dbTicket.description,
    priority: dbTicket.priority as any,
    status: dbTicket.status as any,
    customer: transformCustomer(dbTicket.customers),
    assignee: dbTicket.assignee || undefined,
    createdAt: new Date(dbTicket.created_at),
    updatedAt: new Date(dbTicket.updated_at),
    tags: dbTicket.tags,
  };
}

// Fetch all customers
export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  return data.map(transformCustomer);
}

// Fetch all tickets with customer data
export async function fetchTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      customers (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`);
  }

  return data.map(transformTicket);
}

// Fetch tickets for a specific customer
export async function fetchTicketsByCustomer(customerId: string): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      customers (*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch customer tickets: ${error.message}`);
  }

  return data.map(transformTicket);
}

// Fetch dashboard statistics
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('status');

  if (error) {
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }

  const totalTickets = tickets.length;
  const newTickets = tickets.filter(t => t.status === 'new').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  return {
    totalTickets,
    newTickets,
    inProgressTickets,
    resolvedTickets,
    avgResponseTime: "2.4h", // This would need to be calculated from actual data
    customerSatisfaction: 4.7, // This would come from a separate satisfaction table
  };
}

// Find or create customer by email
export async function findOrCreateCustomer(name: string, email: string): Promise<Customer> {
  // First try to find existing customer by email
  const { data: existingCustomer, error: findError } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw new Error(`Failed to search for customer: ${findError.message}`);
  }

  if (existingCustomer) {
    return transformCustomer(existingCustomer);
  }

  // Customer doesn't exist, create new one
  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert([{
      name: name.trim(),
      email: email.toLowerCase(),
      avatar: null,
    }])
    .select('*')
    .single();

  if (createError) {
    throw new Error(`Failed to create customer: ${createError.message}`);
  }

  return transformCustomer(newCustomer);
}

// Generate next sequential ticket ID
export async function generateNextTicketId(): Promise<string> {
  const { data, error } = await supabase
    .from('tickets')
    .select('id')
    .like('id', 'TICK-%')
    .order('id', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to generate ticket ID: ${error.message}`);
  }

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastId = data[0].id;
    const match = lastId.match(/TICK-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `TICK-${nextNumber.toString().padStart(3, '0')}`;
}

// Create a new ticket with customer lookup/creation
export async function createTicketWithCustomer(
  ticketData: {
    title: string;
    description: string;
    priority: string;
    status: string;
    customerName: string;
    customerEmail: string;
    assignee?: string;
    tags: string[];
  }
): Promise<SupportTicket> {
  try {
    // Find or create customer
    const customer = await findOrCreateCustomer(
      ticketData.customerName,
      ticketData.customerEmail
    );

    // Generate next ticket ID
    const ticketId = await generateNextTicketId();

    // Create the ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        id: ticketId,
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        status: ticketData.status,
        customer_id: customer.id,
        assignee: ticketData.assignee || null,
        tags: ticketData.tags,
      }])
      .select(`
        *,
        customers (*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }

    return transformTicket(data);
  } catch (error) {
    console.error('Error in createTicketWithCustomer:', error);
    throw error;
  }
}

// Create a new ticket (legacy function - kept for compatibility)
export async function createTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
  const ticketId = await generateNextTicketId();
  
  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      id: ticketId,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      customer_id: ticket.customer.id,
      assignee: ticket.assignee || null,
      tags: ticket.tags,
    }])
    .select(`
      *,
      customers (*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create ticket: ${error.message}`);
  }

  return transformTicket(data);
}

// Update a ticket
export async function updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
  const updateData: any = {};
  
  if (updates.title) updateData.title = updates.title;
  if (updates.description) updateData.description = updates.description;
  if (updates.priority) updateData.priority = updates.priority;
  if (updates.status) updateData.status = updates.status;
  if (updates.assignee !== undefined) updateData.assignee = updates.assignee;
  if (updates.tags) updateData.tags = updates.tags;
  if (updates.customer) updateData.customer_id = updates.customer.id;

  const { data, error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', ticketId)
    .select(`
      *,
      customers (*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`);
  }

  return transformTicket(data);
}

// Delete a ticket
export async function deleteTicket(ticketId: string): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId);

  if (error) {
    throw new Error(`Failed to delete ticket: ${error.message}`);
  }
}

// Fetch comments for a specific ticket
export async function fetchTicketComments(ticketId: string): Promise<TicketComment[]> {
  const { data, error } = await supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch ticket comments: ${error.message}`);
  }

  return data.map(transformComment);
}

// Create a new ticket comment
export async function createTicketComment(
  ticketId: string,
  authorId: string,
  authorName: string,
  content: string,
  isInternal: boolean = false
): Promise<TicketComment> {
  const { data, error } = await supabase
    .from('ticket_comments')
    .insert([{
      ticket_id: ticketId,
      author_id: authorId,
      author_name: authorName,
      content: content.trim(),
      is_internal: isInternal,
    }])
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create ticket comment: ${error.message}`);
  }

  return transformComment(data);
}

// Update a ticket comment
export async function updateTicketComment(
  commentId: string,
  content: string
): Promise<TicketComment> {
  const { data, error } = await supabase
    .from('ticket_comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update ticket comment: ${error.message}`);
  }

  return transformComment(data);
}

// Delete a ticket comment
export async function deleteTicketComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('ticket_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    throw new Error(`Failed to delete ticket comment: ${error.message}`);
  }
}

// Reset database to demo seed data
export async function resetToDefaultDemoData(): Promise<void> {
  try {
    // Since we can't execute raw SQL directly from the client in Supabase,
    // we'll delete all data and recreate it using the JavaScript client

    // Step 1: Delete all existing data (cascades will handle comments)
    // First, get all ticket IDs to delete
    const { data: allTickets } = await supabase
      .from('tickets')
      .select('id');

    if (allTickets && allTickets.length > 0) {
      const ticketIds = allTickets.map(t => t.id);
      const { error: deleteTicketsError } = await supabase
        .from('tickets')
        .delete()
        .in('id', ticketIds);

      if (deleteTicketsError) {
        throw new Error(`Failed to delete tickets: ${deleteTicketsError.message}`);
      }
    }

    // Then, get all customer IDs to delete
    const { data: allCustomers } = await supabase
      .from('customers')
      .select('id');

    if (allCustomers && allCustomers.length > 0) {
      const customerIds = allCustomers.map(c => c.id);
      const { error: deleteCustomersError } = await supabase
        .from('customers')
        .delete()
        .in('id', customerIds);

      if (deleteCustomersError) {
        throw new Error(`Failed to delete customers: ${deleteCustomersError.message}`);
      }
    }

    // Step 2: Insert default customers
    const defaultCustomers = [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Jennifer Martinez', email: 'j.martinez@techcorp.com', avatar: null },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Robert Chen', email: 'robert.chen@enterprise.io', avatar: null },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Amanda Williams', email: 'amanda.w@globalinc.com', avatar: null },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Michael Thompson', email: 'm.thompson@bigcompany.net', avatar: null },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Sarah Johnson', email: 'sarah@smallbiz.com', avatar: null },
      { id: '66666666-6666-6666-6666-666666666666', name: 'David Kim', email: 'david.kim@startup.co', avatar: null },
      { id: '77777777-7777-7777-7777-777777777777', name: 'Emily Rodriguez', email: 'emily@creative-agency.com', avatar: null },
      { id: '88888888-8888-8888-8888-888888888888', name: 'James Wilson', email: 'james.w@consulting.biz', avatar: null },
      { id: '99999999-9999-9999-9999-999999999999', name: 'Lisa Anderson', email: 'lisa.anderson@email.com', avatar: null },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Thomas Brown', email: 'thomas.brown@mail.com', avatar: null },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Jessica Lee', email: 'jess.lee@inbox.com', avatar: null },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Christopher Davis', email: 'chris.davis@email.net', avatar: null },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Rachel Green', email: 'rachel.green@techie.io', avatar: null },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', name: 'Daniel Park', email: 'daniel.park@developer.com', avatar: null },
      { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', name: 'Sophia Taylor', email: 'sophia.taylor@prouser.net', avatar: null },
      { id: '10101010-1010-1010-1010-101010101010', name: 'Marcus Johnson', email: 'marcus.j@company.com', avatar: null },
      { id: '20202020-2020-2020-2020-202020202020', name: 'Olivia Martinez', email: 'olivia.m@business.io', avatar: null },
      { id: '30303030-3030-3030-3030-303030303030', name: 'Ethan White', email: 'ethan.white@mail.com', avatar: null },
      { id: '40404040-4040-4040-4040-404040404040', name: 'Isabella Garcia', email: 'isabella.g@email.com', avatar: null },
      { id: '50505050-5050-5050-5050-505050505050', name: 'William Clark', email: 'will.clark@work.net', avatar: null },
    ];

    const { error: customersError } = await supabase
      .from('customers')
      .insert(defaultCustomers);

    if (customersError) {
      throw new Error(`Failed to insert customers: ${customersError.message}`);
    }

    // Step 3: Insert default tickets (we'll use the generateDefaultTickets helper)
    const defaultTickets = generateDefaultTickets();

    const { error: ticketsError } = await supabase
      .from('tickets')
      .insert(defaultTickets);

    if (ticketsError) {
      throw new Error(`Failed to insert tickets: ${ticketsError.message}`);
    }

    // Step 4: Insert default comments
    const defaultComments = generateDefaultComments();

    const { error: commentsError } = await supabase
      .from('ticket_comments')
      .insert(defaultComments);

    if (commentsError) {
      throw new Error(`Failed to insert comments: ${commentsError.message}`);
    }

    console.log('Database reset to default demo data successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

// Helper function to generate default tickets
function generateDefaultTickets() {
  const now = new Date();
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  return [
    // URGENT TICKETS
    { id: 'TICK-001', title: 'URGENT: Payment processing completely down!', description: 'This is CRITICAL! Our entire payment system has been down for 3 HOURS! We\'ve lost multiple sales and customers are complaining. This needs to be fixed IMMEDIATELY or we\'re switching to a competitor. I need someone senior on this NOW!', priority: 'urgent', status: 'in-progress', customer_id: '11111111-1111-1111-1111-111111111111', assignee: 'Senior Support - Alex Chen', created_at: hoursAgo(3), updated_at: hoursAgo(0.25), tags: ['payment', 'critical', 'enterprise', 'bug', 'escalated'] },
    { id: 'TICK-002', title: 'Security breach - unauthorized access detected', description: 'We detected unauthorized login attempts on multiple accounts. Need immediate security audit and user notification. This could be a serious data breach situation.', priority: 'urgent', status: 'in-progress', customer_id: '22222222-2222-2222-2222-222222222222', assignee: 'Security Team', created_at: hoursAgo(2), updated_at: hoursAgo(0.5), tags: ['security', 'critical', 'breach', 'enterprise'] },
    { id: 'TICK-003', title: 'API completely broken after update', description: 'Your latest API update BROKE our entire integration! Nothing works anymore. 500 errors everywhere. Roll it back NOW! Our production app is down and we have customers screaming at us!', priority: 'urgent', status: 'new', customer_id: '33333333-3333-3333-3333-333333333333', assignee: null, created_at: hoursAgo(0.75), updated_at: hoursAgo(0.75), tags: ['api', 'critical', 'bug', 'integration', 'breaking-change'] },
    { id: 'TICK-004', title: 'Database connection timeout - site down', description: 'Customer-facing website showing database connection errors. Site has been down for 90 minutes. This is costing us thousands in revenue!', priority: 'urgent', status: 'resolved', customer_id: '44444444-4444-4444-4444-444444444444', assignee: 'DevOps Team', created_at: hoursAgo(5), updated_at: hoursAgo(1), tags: ['database', 'downtime', 'critical', 'infrastructure'] },

    // HIGH PRIORITY
    { id: 'TICK-005', title: 'Login page not loading - multiple users affected', description: 'The login page shows a blank white screen after clicking submit. This started 2 hours ago and we\'ve received 15+ reports from customers. Using Chrome 120, but also confirmed in Firefox. This is blocking all new user signups!', priority: 'high', status: 'in-progress', customer_id: '55555555-5555-5555-5555-555555555555', assignee: 'Alex Chen', created_at: hoursAgo(2), updated_at: hoursAgo(0.33), tags: ['authentication', 'bug', 'login', 'urgent'] },
    { id: 'TICK-006', title: 'Mobile app crashes on startup (iOS)', description: 'Our mobile app crashes immediately after opening on iOS 17. Happens 100% of the time. Started after version 2.3.1 update yesterday. We\'re getting flooded with 1-star reviews. Please fix ASAP!', priority: 'high', status: 'in-progress', customer_id: '66666666-6666-6666-6666-666666666666', assignee: 'Mobile Team', created_at: hoursAgo(18), updated_at: hoursAgo(2), tags: ['mobile', 'ios', 'crash', 'bug', 'app'] },
    { id: 'TICK-007', title: 'Email notifications not being sent', description: 'None of our customers are receiving email notifications for the past 6 hours. This includes password resets, order confirmations, everything. Very concerning!', priority: 'high', status: 'new', customer_id: '77777777-7777-7777-7777-777777777777', assignee: null, created_at: hoursAgo(4), updated_at: hoursAgo(4), tags: ['email', 'notifications', 'bug', 'critical'] },
    { id: 'TICK-008', title: 'Data export failing for large datasets', description: 'When trying to export more than 10,000 records, the system times out and fails. We need to export 50K records for compliance reporting. This is blocking our audit!', priority: 'high', status: 'waiting-customer', customer_id: '88888888-8888-8888-8888-888888888888', assignee: 'Sarah Kim', created_at: daysAgo(1), updated_at: hoursAgo(3), tags: ['export', 'performance', 'data', 'bug'] },
    { id: 'TICK-009', title: 'Search functionality returning wrong results', description: 'The search feature is completely broken. Searching for exact customer names returns no results, but searching random text returns everything. This makes the product unusable!', priority: 'high', status: 'in-progress', customer_id: '99999999-9999-9999-9999-999999999999', assignee: 'Mike Wilson', created_at: hoursAgo(8), updated_at: hoursAgo(1), tags: ['search', 'bug', 'functionality'] },
    { id: 'TICK-010', title: 'SSO integration failing randomly', description: 'Our Google SSO integration works sometimes but fails randomly with "invalid_token" errors. About 30% failure rate. Users are getting frustrated having to try multiple times.', priority: 'high', status: 'new', customer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', assignee: null, created_at: hoursAgo(12), updated_at: hoursAgo(12), tags: ['sso', 'authentication', 'integration', 'bug'] },
    { id: 'TICK-011', title: 'Dashboard widgets not loading', description: 'All dashboard widgets show loading spinners but never load data. Started this morning. Console shows CORS errors. Tried clearing cache - no help.', priority: 'high', status: 'resolved', customer_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', assignee: 'Tom Brown', created_at: hoursAgo(6), updated_at: hoursAgo(1), tags: ['dashboard', 'bug', 'ui', 'cors'] },

    // MEDIUM PRIORITY
    { id: 'TICK-012', title: 'How to integrate with Slack?', description: 'Hi, I\'m trying to set up the Slack integration but the documentation is a bit confusing. Could someone walk me through the setup process step by step? Specifically, I\'m stuck on the OAuth configuration part.', priority: 'medium', status: 'waiting-customer', customer_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', assignee: 'Jennifer Lee', created_at: daysAgo(1), updated_at: hoursAgo(5), tags: ['integration', 'slack', 'question', 'documentation'] },
    { id: 'TICK-013', title: 'Billing discrepancy on last invoice', description: 'There seems to be a discrepancy on my latest invoice. I\'m on the Pro plan ($49/month) but was charged $79. Could you please look into this and issue a correction? Invoice #INV-12345.', priority: 'medium', status: 'in-progress', customer_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', assignee: 'Billing Team', created_at: daysAgo(2), updated_at: hoursAgo(6), tags: ['billing', 'payment', 'question', 'invoice'] },
    { id: 'TICK-014', title: 'Feature request: Dark mode', description: 'It would be amazing if you could add a dark mode theme! I use your app a lot at night and the bright white interface is hard on the eyes. This is a pretty standard feature in most modern apps now. Would really appreciate it!', priority: 'medium', status: 'new', customer_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', assignee: null, created_at: daysAgo(3), updated_at: daysAgo(3), tags: ['feature-request', 'ui', 'enhancement', 'dark-mode'] },
    { id: 'TICK-015', title: 'Cannot delete old project', description: 'I\'m trying to delete a project I no longer need, but when I click the delete button nothing happens. No error message, it just doesn\'t do anything. I\'ve tried on both Chrome and Safari.', priority: 'medium', status: 'in-progress', customer_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', assignee: 'Alex Chen', created_at: hoursAgo(10), updated_at: hoursAgo(2), tags: ['bug', 'project', 'ui', 'deletion'] },
    { id: 'TICK-016', title: 'API rate limits too restrictive', description: 'We\'re hitting API rate limits frequently (100 requests/minute). For our use case, we need at least 500/minute. Is there a way to increase our limit? We\'re on the Business plan.', priority: 'medium', status: 'waiting-customer', customer_id: '10101010-1010-1010-1010-101010101010', assignee: 'David Park', created_at: daysAgo(1), updated_at: hoursAgo(8), tags: ['api', 'rate-limit', 'question', 'technical'] },
    { id: 'TICK-017', title: 'Password reset email not received', description: 'I requested a password reset email 30 minutes ago but haven\'t received it. I checked spam folder too. Could you please resend it or help me reset my password another way? Email: thomas.brown@mail.com', priority: 'medium', status: 'resolved', customer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', assignee: 'Support Agent', created_at: hoursAgo(2), updated_at: hoursAgo(0.5), tags: ['password', 'email', 'authentication', 'account'] },
    { id: 'TICK-018', title: 'Request to change account email', description: 'I need to update my account email from my old company email to my personal email. What\'s the process for this? Do I need to create a new account or can you transfer everything?', priority: 'medium', status: 'in-progress', customer_id: '20202020-2020-2020-2020-202020202020', assignee: 'Support Agent', created_at: hoursAgo(5), updated_at: hoursAgo(1), tags: ['account', 'email', 'question'] },
    { id: 'TICK-019', title: 'Timezone display incorrect', description: 'All timestamps in the app are showing in PST but I\'m in EST. I can\'t find a setting to change the timezone preference. Is this a bug or am I missing something?', priority: 'medium', status: 'new', customer_id: '30303030-3030-3030-3030-303030303030', assignee: null, created_at: hoursAgo(7), updated_at: hoursAgo(7), tags: ['bug', 'timezone', 'ui', 'settings'] },
    { id: 'TICK-020', title: 'Feature request: Bulk user import', description: 'Would love to see a bulk user import feature via CSV. Currently have to add 200+ users manually which is very time consuming. This would be a huge time saver!', priority: 'medium', status: 'new', customer_id: '40404040-4040-4040-4040-404040404040', assignee: null, created_at: daysAgo(4), updated_at: daysAgo(4), tags: ['feature-request', 'users', 'import', 'enhancement'] },
    { id: 'TICK-021', title: 'File upload size limit question', description: 'What\'s the maximum file size for uploads? I\'m trying to upload a 50MB file but it fails. Is there a way to increase this limit?', priority: 'medium', status: 'waiting-customer', customer_id: '50505050-5050-5050-5050-505050505050', assignee: 'Support Agent', created_at: daysAgo(1), updated_at: hoursAgo(4), tags: ['upload', 'file', 'question', 'limits'] },
    { id: 'TICK-022', title: 'Excel export formatting issues', description: 'When I export data to Excel, all the date columns lose their formatting and show as numbers instead. Can this be fixed so dates export properly formatted?', priority: 'medium', status: 'in-progress', customer_id: '11111111-1111-1111-1111-111111111111', assignee: 'Development Team', created_at: daysAgo(3), updated_at: hoursAgo(12), tags: ['export', 'excel', 'bug', 'formatting'] },
    { id: 'TICK-023', title: 'Request for API documentation improvement', description: 'The API docs are missing examples for the webhook endpoints. Could you add some code samples? Specifically for Node.js and Python. Would make integration much easier!', priority: 'medium', status: 'new', customer_id: '22222222-2222-2222-2222-222222222222', assignee: null, created_at: daysAgo(5), updated_at: daysAgo(5), tags: ['documentation', 'api', 'webhook', 'improvement'] },
    { id: 'TICK-024', title: 'Understanding subscription plan differences', description: 'Can someone explain the difference between the Pro and Enterprise plans in more detail? Particularly interested in the API limits and storage differences. Considering upgrading.', priority: 'medium', status: 'resolved', customer_id: '33333333-3333-3333-3333-333333333333', assignee: 'Sales Team', created_at: daysAgo(2), updated_at: hoursAgo(6), tags: ['subscription', 'pricing', 'question', 'sales'] },
    { id: 'TICK-025', title: 'Mobile app: Add fingerprint authentication', description: 'Feature request: Would be great to add fingerprint/Face ID authentication to the mobile app instead of typing password every time. Most banking apps have this now.', priority: 'medium', status: 'new', customer_id: '44444444-4444-4444-4444-444444444444', assignee: null, created_at: daysAgo(6), updated_at: daysAgo(6), tags: ['feature-request', 'mobile', 'authentication', 'security'] },
    { id: 'TICK-026', title: 'Webhook delivery failures', description: 'Some of our webhooks are failing to deliver. The logs show 408 timeout errors. Is there a way to retry failed webhooks automatically or configure a longer timeout?', priority: 'medium', status: 'in-progress', customer_id: '55555555-5555-5555-5555-555555555555', assignee: 'Technical Support', created_at: daysAgo(1), updated_at: hoursAgo(3), tags: ['webhook', 'api', 'bug', 'timeout'] },
    { id: 'TICK-027', title: 'GDPR data export request', description: 'Per GDPR regulations, I\'m requesting a complete export of all my personal data stored in your system. Please provide this within the required 30-day timeframe. Account email: sarah@smallbiz.com', priority: 'medium', status: 'in-progress', customer_id: '55555555-5555-5555-5555-555555555555', assignee: 'Privacy Team', created_at: daysAgo(2), updated_at: daysAgo(1), tags: ['gdpr', 'privacy', 'data', 'compliance', 'export'] },
    { id: 'TICK-028', title: 'Team member permissions not working', description: 'I added a new team member with "Editor" permissions but they\'re still seeing the app as view-only. I\'ve tried removing and re-adding them but same issue. What am I doing wrong?', priority: 'medium', status: 'waiting-customer', customer_id: '66666666-6666-6666-6666-666666666666', assignee: 'Sarah Kim', created_at: hoursAgo(8), updated_at: hoursAgo(2), tags: ['permissions', 'team', 'bug', 'access'] },
    { id: 'TICK-029', title: 'Request: Multi-language support', description: 'Are there plans to add support for other languages? Our team is international and would love to have the interface in Spanish, German, and French.', priority: 'medium', status: 'new', customer_id: '77777777-7777-7777-7777-777777777777', assignee: null, created_at: daysAgo(7), updated_at: daysAgo(7), tags: ['feature-request', 'i18n', 'localization', 'language'] },
    { id: 'TICK-030', title: 'Custom fields for user profiles', description: 'It would be helpful to have custom fields for user profiles. We need to track employee ID, department, and location for each user in our system.', priority: 'medium', status: 'new', customer_id: '88888888-8888-8888-8888-888888888888', assignee: null, created_at: daysAgo(4), updated_at: daysAgo(4), tags: ['feature-request', 'users', 'custom-fields', 'enhancement'] },

    // LOW PRIORITY
    { id: 'TICK-031', title: 'Tooltip text is cut off', description: 'Minor UI issue: Some of the tooltip text gets cut off when hovering over the help icons. Not blocking anything but thought you should know.', priority: 'low', status: 'new', customer_id: '99999999-9999-9999-9999-999999999999', assignee: null, created_at: daysAgo(5), updated_at: daysAgo(5), tags: ['ui', 'bug', 'minor', 'tooltip'] },
    { id: 'TICK-032', title: 'Feature request: Keyboard shortcuts', description: 'Would be nice to have keyboard shortcuts for common actions. Like Ctrl+N for new item, Ctrl+S for save, etc. Would speed up workflow for power users!', priority: 'low', status: 'new', customer_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', assignee: null, created_at: daysAgo(7), updated_at: daysAgo(7), tags: ['feature-request', 'ui', 'enhancement', 'keyboard'] },
    { id: 'TICK-033', title: 'Small typo in welcome email', description: 'Just noticed a small typo in the welcome email template. "recieve" should be "receive". Not urgent but wanted to let you know!', priority: 'low', status: 'resolved', customer_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', assignee: 'Content Team', created_at: daysAgo(3), updated_at: daysAgo(1), tags: ['email', 'typo', 'minor', 'content'] },
    { id: 'TICK-034', title: 'Color scheme suggestion', description: 'Love the app! One small suggestion: the green color used for success messages is a bit too bright. Maybe tone it down slightly? Just a minor UX thing.', priority: 'low', status: 'new', customer_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', assignee: null, created_at: daysAgo(6), updated_at: daysAgo(6), tags: ['ui', 'design', 'suggestion', 'colors'] },
    { id: 'TICK-035', title: 'Feature idea: Activity feed', description: 'It would be cool to have an activity feed showing recent actions by team members. Like "John edited Project X" or "Sarah created new task". Low priority but would be nice!', priority: 'low', status: 'new', customer_id: '10101010-1010-1010-1010-101010101010', assignee: null, created_at: daysAgo(7), updated_at: daysAgo(7), tags: ['feature-request', 'activity', 'feed', 'enhancement'] },
    { id: 'TICK-036', title: 'Documentation: Add video tutorials', description: 'The written docs are great, but video tutorials would be even better for visual learners. Just a suggestion for future improvement!', priority: 'low', status: 'new', customer_id: '20202020-2020-2020-2020-202020202020', assignee: null, created_at: daysAgo(14), updated_at: daysAgo(14), tags: ['documentation', 'video', 'enhancement', 'suggestion'] },
    { id: 'TICK-037', title: 'Export to PDF feature', description: 'Would be nice to have a "Export to PDF" option for reports. Currently only have CSV and Excel. Not urgent, just a nice-to-have.', priority: 'low', status: 'in-progress', customer_id: '30303030-3030-3030-3030-303030303030', assignee: 'Product Team', created_at: daysAgo(7), updated_at: daysAgo(3), tags: ['feature-request', 'export', 'pdf', 'reports'] },
    { id: 'TICK-038', title: 'Suggestion: Remember last used filter', description: 'Small UX improvement idea: Remember the last filter I used on the tickets page. Minor inconvenience to reset it every time I visit.', priority: 'low', status: 'new', customer_id: '40404040-4040-4040-4040-404040404040', assignee: null, created_at: daysAgo(4), updated_at: daysAgo(4), tags: ['ui', 'ux', 'suggestion', 'filter'] },
    { id: 'TICK-039', title: 'Add company logo to reports', description: 'Would be professional to have our company logo on exported reports. Low priority but would make them look more polished for client presentations.', priority: 'low', status: 'new', customer_id: '50505050-5050-5050-5050-505050505050', assignee: null, created_at: daysAgo(7), updated_at: daysAgo(7), tags: ['feature-request', 'reports', 'branding', 'export'] },
    { id: 'TICK-040', title: 'Positive feedback: Love the new UI!', description: 'Just wanted to say the new UI update is fantastic! Much cleaner and easier to navigate. Great work team! 🎉', priority: 'low', status: 'resolved', customer_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', assignee: 'Product Team', created_at: daysAgo(5), updated_at: daysAgo(4), tags: ['feedback', 'positive', 'ui', 'praise'] },
  ];
}

// Helper function to generate default comments
function generateDefaultComments() {
  const now = new Date();
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  return [
    // TICK-001 comments (Urgent payment issue)
    { ticket_id: 'TICK-001', author_id: '11111111-1111-1111-1111-111111111111', author_name: 'Jennifer Martinez', content: 'UPDATE: Still not working! I\'ve been refreshing every 5 minutes. When will this be fixed?? We\'re losing thousands of dollars every hour!!!', is_internal: false, created_at: hoursAgo(2) },
    { ticket_id: 'TICK-001', author_id: 'support-001', author_name: 'Alex Chen', content: 'Jennifer, I completely understand your frustration. I\'ve escalated this to our senior engineering team and they\'re actively working on it right now. I\'ll update you every 15 minutes until this is resolved.', is_internal: false, created_at: hoursAgo(1.83) },
    { ticket_id: 'TICK-001', author_id: 'support-001', author_name: 'Alex Chen', content: 'INTERNAL: Payment gateway had a configuration issue after the deployment. DevOps rolling back now.', is_internal: true, created_at: hoursAgo(1.75) },
    { ticket_id: 'TICK-001', author_id: 'support-001', author_name: 'Alex Chen', content: 'Good news! We\'ve identified the issue - it was a configuration problem with our payment gateway after this morning\'s deployment. We\'re rolling back the changes now. Should be resolved within 10 minutes.', is_internal: false, created_at: hoursAgo(1.5) },
    { ticket_id: 'TICK-001', author_id: '11111111-1111-1111-1111-111111111111', author_name: 'Jennifer Martinez', content: 'Thank you for the quick response! Testing now...', is_internal: false, created_at: hoursAgo(1.33) },
    { ticket_id: 'TICK-001', author_id: 'support-001', author_name: 'Alex Chen', content: 'Payment system is back online. I\'ve confirmed multiple successful transactions in the last 5 minutes. Can you confirm on your end?', is_internal: false, created_at: hoursAgo(1) },
    { ticket_id: 'TICK-001', author_id: '11111111-1111-1111-1111-111111111111', author_name: 'Jennifer Martinez', content: 'YES! It\'s working now. Thank you for handling this so quickly. I appreciate the constant communication during the crisis.', is_internal: false, created_at: hoursAgo(0.5) },
    { ticket_id: 'TICK-001', author_id: 'support-001', author_name: 'Alex Chen', content: 'Excellent! I\'ll be monitoring for the next few hours to ensure stability. Again, sincere apologies for the disruption. I\'ll follow up with a detailed incident report and our prevention plan within 24 hours.', is_internal: false, created_at: hoursAgo(0.25) },

    // TICK-002 comments (Security breach)
    { ticket_id: 'TICK-002', author_id: '22222222-2222-2222-2222-222222222222', author_name: 'Robert Chen', content: 'Additional info: The unauthorized attempts were from IP addresses in Eastern Europe. We\'ve temporarily disabled those accounts as a precaution.', is_internal: false, created_at: hoursAgo(1.83) },
    { ticket_id: 'TICK-002', author_id: 'security-001', author_name: 'Security Team', content: 'Robert, thank you for the quick action. We\'re running a full security audit now. Preliminary analysis shows these were automated bot attempts, not a targeted attack. Your affected accounts are secure.', is_internal: false, created_at: hoursAgo(1.5) },
    { ticket_id: 'TICK-002', author_id: 'security-001', author_name: 'Security Team', content: 'INTERNAL: Implementing additional rate limiting and CAPTCHA on login. Also flagged the IP ranges for blocking.', is_internal: true, created_at: hoursAgo(1) },
    { ticket_id: 'TICK-002', author_id: 'security-001', author_name: 'Security Team', content: 'Update: We\'ve implemented enhanced security measures including additional rate limiting and IP blocking. We\'ll be sending security notifications to all affected users within the hour. Full report will be ready by EOD.', is_internal: false, created_at: hoursAgo(0.5) },

    // TICK-003 comments (API broken - angry customer)
    { ticket_id: 'TICK-003', author_id: '33333333-3333-3333-3333-333333333333', author_name: 'Amanda Williams', content: 'This is absolutely UNACCEPTABLE! You can\'t just push breaking changes without proper deprecation notices! We had ZERO warning about this!', is_internal: false, created_at: hoursAgo(0.67) },
    { ticket_id: 'TICK-003', author_id: '33333333-3333-3333-3333-333333333333', author_name: 'Amanda Williams', content: 'I need someone from engineering to call me IMMEDIATELY. This is affecting our enterprise customers and we\'re considering legal action for the damages!', is_internal: false, created_at: hoursAgo(0.58) },

    // TICK-005 comments (Login issue)
    { ticket_id: 'TICK-005', author_id: 'support-002', author_name: 'Alex Chen', content: 'Hi Sarah, thank you for the detailed report. Let me help you troubleshoot this immediately.\n\nCan you please provide:\n1. The exact browser version (you can find this at chrome://version)\n2. A screenshot of the browser console (F12 → Console tab)\n3. Are you using any browser extensions that might interfere?\n\nAlso, as a temporary workaround, can you try accessing via our mobile app?', is_internal: false, created_at: hoursAgo(1.83) },
    { ticket_id: 'TICK-005', author_id: '55555555-5555-5555-5555-555555555555', author_name: 'Sarah Johnson', content: 'Hi! Thanks for the quick response. Here\'s the info:\n1. Chrome Version 120.0.6099.109 (Official Build) (64-bit)\n2. Console shows: "Uncaught TypeError: Cannot read property \'token\' of undefined at login.js:247"\n3. I disabled all extensions - same issue\n\nMobile app works fine! But we need the web version for our team.', is_internal: false, created_at: hoursAgo(1.5) },
    { ticket_id: 'TICK-005', author_id: 'support-002', author_name: 'Alex Chen', content: 'Perfect, that error message is very helpful! I\'ve found the issue - there\'s a bug in our recent authentication update that affects the web version.\n\nINTERNAL NOTE: Bug in auth.js - token validation failing when localStorage is empty. Fix in progress.', is_internal: true, created_at: hoursAgo(1.25) },
    { ticket_id: 'TICK-005', author_id: 'support-002', author_name: 'Alex Chen', content: 'Good news! Our engineering team has deployed a fix for this issue. Can you please:\n1. Clear your browser cache (Ctrl+Shift+Delete)\n2. Close all browser windows\n3. Reopen and try logging in again\n\nLet me know if this resolves it!', is_internal: false, created_at: hoursAgo(0.75) },
    { ticket_id: 'TICK-005', author_id: '55555555-5555-5555-5555-555555555555', author_name: 'Sarah Johnson', content: 'That worked! Thank you so much for the quick fix. Really appreciate the excellent support! 👍', is_internal: false, created_at: hoursAgo(0.33) },

    // TICK-006 comments (Mobile crash)
    { ticket_id: 'TICK-006', author_id: '66666666-6666-6666-6666-666666666666', author_name: 'David Kim', content: 'Still crashing! I\'ve uninstalled and reinstalled twice. This is really frustrating - I need to access my account urgently!', is_internal: false, created_at: hoursAgo(16) },
    { ticket_id: 'TICK-006', author_id: 'mobile-team', author_name: 'Mobile Team', content: 'David, we sincerely apologize for this issue. We\'ve identified the bug - it\'s related to iOS 17.2 compatibility. We\'re submitting an emergency fix to Apple right now.\n\nAs a workaround, you can access everything via our web app at app.ourservice.com until the update is approved (usually 24-48 hours).', is_internal: false, created_at: hoursAgo(12) },
    { ticket_id: 'TICK-006', author_id: '66666666-6666-6666-6666-666666666666', author_name: 'David Kim', content: 'Thanks for the update and workaround. I guess I can wait, but please prioritize this - the mobile app is really important for our workflow.', is_internal: false, created_at: hoursAgo(8) },
    { ticket_id: 'TICK-006', author_id: 'mobile-team', author_name: 'Mobile Team', content: 'Update: Apple has approved our emergency fix! Version 2.3.2 is now live in the App Store. Please update and let us know if you have any issues.', is_internal: false, created_at: hoursAgo(2) },

    // TICK-008 comments (Data export)
    { ticket_id: 'TICK-008', author_id: 'support-003', author_name: 'Sarah Kim', content: 'Hi James, I understand the urgency for your compliance reporting. For large exports (>10k records), we recommend using our API\'s batch export endpoint which handles large datasets much better.\n\nI can help you set this up, or we can manually process your export on our side. Which would you prefer?\n\nAlso, do you need this exported in a specific format?', is_internal: false, created_at: hoursAgo(20) },
    { ticket_id: 'TICK-008', author_id: '88888888-8888-8888-8888-888888888888', author_name: 'James Wilson', content: 'Thanks for the response! I think the manual export would be easier for us since this is a one-time thing for the audit. We need it in CSV format with all fields included.\n\nTimeframe needed: by end of this week. Will that work?', is_internal: false, created_at: hoursAgo(16) },
    { ticket_id: 'TICK-008', author_id: 'support-003', author_name: 'Sarah Kim', content: 'Perfect! Yes, end of week is definitely doable. I\'ll process this export manually and have it ready for you by Thursday EOD.\n\nQuick question: Do you need any specific date ranges or should I export all historical data?', is_internal: false, created_at: hoursAgo(12) },
    { ticket_id: 'TICK-008', author_id: '88888888-8888-8888-8888-888888888888', author_name: 'James Wilson', content: 'All historical data from January 1, 2023 to present. Thanks so much for the help!', is_internal: false, created_at: hoursAgo(8) },
    { ticket_id: 'TICK-008', author_id: 'support-003', author_name: 'Sarah Kim', content: 'Got it! I\'ll get started on this today and send you a secure download link by Thursday. I\'ll keep you updated on progress.', is_internal: false, created_at: hoursAgo(3) },

    // TICK-012 comments (Slack integration help)
    { ticket_id: 'TICK-012', author_id: 'support-004', author_name: 'Jennifer Lee', content: 'Hi! I\'d be happy to walk you through the Slack integration setup! It\'s actually simpler than it looks.\n\nHere\'s a step-by-step guide:\n\n**Step 1: Create Slack App**\n1. Go to api.slack.com/apps\n2. Click "Create New App"\n3. Choose "From scratch"\n4. Name it (e.g., "YourSaaS Notifications")\n5. Select your workspace\n\n**Step 2: Configure OAuth**\n1. In your Slack app settings, go to "OAuth & Permissions"\n2. Add these redirect URLs:\n   - https://app.yourservice.com/oauth/slack/callback\n3. Add these Bot Token Scopes:\n   - chat:write\n   - channels:read\n\n**Step 3: Connect in Our App**\n1. Go to Settings → Integrations in our app\n2. Click "Connect Slack"\n3. It will redirect you to Slack for authorization\n4. Approve the permissions\n\nWhere exactly are you getting stuck? I can provide more specific guidance!', is_internal: false, created_at: hoursAgo(20) },
    { ticket_id: 'TICK-012', author_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', author_name: 'Christopher Davis', content: 'Thank you SO much for the detailed instructions! I got stuck on Step 2 - I wasn\'t sure where to find "OAuth & Permissions". I found it now though!\n\nOne more question: After I connect it, how do I choose which channel to post notifications to?', is_internal: false, created_at: hoursAgo(18) },
    { ticket_id: 'TICK-012', author_id: 'support-004', author_name: 'Jennifer Lee', content: 'Great question! After you complete the connection:\n\n1. Go back to Settings → Integrations\n2. Click "Configure" next to your connected Slack workspace\n3. You\'ll see a dropdown to select the channel\n4. Choose your channel (e.g., #notifications)\n5. Save settings\n\nYou can also customize which events trigger notifications (new tickets, status changes, etc.) on that same page.\n\nDid you manage to complete the connection? Let me know if you need any other help!', is_internal: false, created_at: hoursAgo(12) },
    { ticket_id: 'TICK-012', author_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', author_name: 'Christopher Davis', content: 'Perfect! I got it all set up and it\'s working beautifully. Thank you for your patience and excellent instructions! 🙌', is_internal: false, created_at: hoursAgo(5) },

    // TICK-013 comments (Billing discrepancy)
    { ticket_id: 'TICK-013', author_id: 'billing-team', author_name: 'Billing Team', content: 'Hi Rachel, thank you for bringing this to our attention. Let me look into your account right away.\n\nI\'ve reviewed your account and invoice #INV-12345. I can see you\'re definitely on the Pro plan ($49/month), but I notice the charge of $79 includes:\n- Pro Plan: $49\n- Additional Storage (100GB): $20\n- Extra API calls: $10\n\nDoes this match your usage? Let me know if you weren\'t expecting these add-ons and I can adjust your plan and issue a refund.', is_internal: false, created_at: daysAgo(1.83) },
    { ticket_id: 'TICK-013', author_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', author_name: 'Rachel Green', content: 'Oh! I didn\'t realize I had those add-ons activated. I must have clicked something by accident.\n\nI don\'t need the extra storage or API calls - the base Pro plan is fine for me. Can you remove those and refund the difference?', is_internal: false, created_at: daysAgo(1.75) },
    { ticket_id: 'TICK-013', author_id: 'billing-team', author_name: 'Billing Team', content: 'Absolutely! I\'ve removed both add-ons from your account and processed a $30 refund to your original payment method. You should see it in 3-5 business days.\n\nYour next invoice will be back to the base $49/month. Is there anything else I can help with?', is_internal: false, created_at: daysAgo(1.5) },
    { ticket_id: 'TICK-013', author_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', author_name: 'Rachel Green', content: 'Perfect! Thank you for resolving this so quickly. Much appreciated!', is_internal: false, created_at: hoursAgo(6) },

    // TICK-017 comments (Password reset)
    { ticket_id: 'TICK-017', author_id: 'support-005', author_name: 'Support Agent', content: 'Hi Thomas, I can help you with that! I\'ve manually triggered a new password reset email to thomas.brown@mail.com.\n\nCan you check your inbox in the next few minutes? Also double-check your spam/junk folder just in case.\n\nIf you still don\'t receive it, I can verify your identity and reset your password manually. Just let me know!', is_internal: false, created_at: hoursAgo(1.75) },
    { ticket_id: 'TICK-017', author_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', author_name: 'Thomas Brown', content: 'Got it! It came through this time. Not sure why the first one didn\'t arrive but this worked. Thanks!', is_internal: false, created_at: hoursAgo(1.5) },
    { ticket_id: 'TICK-017', author_id: 'support-005', author_name: 'Support Agent', content: 'Excellent! Glad it worked. Sometimes there can be delays with email delivery. If you have any other issues, don\'t hesitate to reach out!', is_internal: false, created_at: hoursAgo(0.5) },

    // TICK-024 comments (Subscription question)
    { ticket_id: 'TICK-024', author_id: 'sales-team', author_name: 'Sales Team', content: 'Hi Amanda! Great question. I\'d be happy to break down the key differences between Pro and Enterprise:\n\n**Pro Plan - $49/month:**\n- 5 team members\n- 100GB storage\n- 10,000 API calls/month\n- Email support (24-hour response)\n- Standard integrations (10+)\n- Basic analytics\n\n**Enterprise Plan - $199/month:**\n- Unlimited team members\n- 1TB storage (expandable)\n- 100,000 API calls/month (negotiable)\n- Priority support (1-hour response) + Phone\n- All integrations (50+) + Custom integrations\n- Advanced analytics + Custom reports\n- Dedicated account manager\n- SLA guarantees (99.9% uptime)\n- SSO and advanced security features\n- Custom onboarding + training\n\nFor your use case, the main benefits would be the increased API limits and storage. How many team members are you planning to have?', is_internal: false, created_at: daysAgo(1.83) },
    { ticket_id: 'TICK-024', author_id: '33333333-3333-3333-3333-333333333333', author_name: 'Amanda Williams', content: 'Thanks for the detailed breakdown! We have about 15 team members and we\'re definitely hitting the API limits on Pro.\n\nThe Enterprise plan looks perfect. Can we schedule a call to discuss the custom integration options? We need to integrate with our proprietary CRM.', is_internal: false, created_at: daysAgo(1.75) },
    { ticket_id: 'TICK-024', author_id: 'sales-team', author_name: 'Sales Team', content: 'Absolutely! Custom CRM integration is definitely something we can accommodate on Enterprise.\n\nI\'ve sent you a calendar invite for tomorrow at 2 PM EST. We\'ll discuss:\n- Your CRM integration requirements\n- Migration plan from Pro to Enterprise\n- Custom onboarding timeline\n- Any other questions you have\n\nLooking forward to the call!', is_internal: false, created_at: daysAgo(1.5) },
    { ticket_id: 'TICK-024', author_id: '33333333-3333-3333-3333-333333333333', author_name: 'Amanda Williams', content: 'Perfect! See you on the call. Thanks for the quick response!', is_internal: false, created_at: hoursAgo(6) },

    // TICK-027 comments (GDPR request)
    { ticket_id: 'TICK-027', author_id: 'privacy-team', author_name: 'Privacy Team', content: 'Dear Sarah,\n\nThank you for your GDPR data export request. We take data privacy very seriously and will complete this within the required timeframe.\n\nYour data export will include:\n- Account information\n- All tickets and comments\n- Activity logs\n- Billing history\n- Any integrations and connected services\n\nWe\'ll prepare a comprehensive data package in machine-readable format (JSON) and provide it within 30 days, though we typically complete these requests within 5-7 business days.\n\nYou\'ll receive an email with a secure download link once ready.\n\nReference Number: GDPR-2024-001234\n\nBest regards,\nPrivacy Team', is_internal: false, created_at: daysAgo(1.83) },
    { ticket_id: 'TICK-027', author_id: '55555555-5555-5555-5555-555555555555', author_name: 'Sarah Johnson', content: 'Thank you for the prompt response and clear timeline. Looking forward to receiving the data export.', is_internal: false, created_at: daysAgo(1) },
  ];
}