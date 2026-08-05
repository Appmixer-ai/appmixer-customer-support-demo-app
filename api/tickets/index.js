const {
  supabase,
  authenticateApiKey,
  setCorsHeaders,
  handlePreflight,
  handleError
} = require('../lib/auth');

// Transform data
function transformTicket(dbTicket) {
  return {
    id: dbTicket.id,
    title: dbTicket.title,
    description: dbTicket.description,
    priority: dbTicket.priority,
    status: dbTicket.status,
    customer: {
      id: dbTicket.customers.id,
      name: dbTicket.customers.name,
      email: dbTicket.customers.email,
      avatar: dbTicket.customers.avatar || undefined,
    },
    assignee: dbTicket.assignee || undefined,
    createdAt: new Date(dbTicket.created_at),
    updatedAt: new Date(dbTicket.updated_at),
    tags: dbTicket.tags,
  };
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handlePreflight(req, res)) {
    return;
  }

  try {
    const { userId } = await authenticateApiKey(req);
    
    if (req.method === 'GET') {
      // Handle different GET endpoints
      if (req.query.action === 'stats') {
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('status');
        if (error) throw error;
        
        const stats = {
          totalTickets: tickets.length,
          newTickets: tickets.filter(t => t.status === 'new').length,
          inProgressTickets: tickets.filter(t => t.status === 'in-progress').length,
          resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
          avgResponseTime: "2.4h",
          customerSatisfaction: 4.7,
        };
        
        return res.json({ data: stats });
      }
      
      if (req.query.action === 'popular-tags') {
        // Get most popular tags
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('tags')
          .not('tags', 'is', null);
        
        if (error) throw error;
        
        const tagCounts = {};
        tickets.forEach(ticket => {
          if (Array.isArray(ticket.tags)) {
            ticket.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        
        const popularTags = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        
        return res.json({ data: popularTags });
      }
      
      if (req.query.id) {
        // Get specific ticket
        const { data, error } = await supabase
          .from('tickets')
          .select(`*, customers (*)`)
          .eq('id', req.query.id)
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Ticket not found' });
        
        const ticket = transformTicket(data);
        return res.json({ data: ticket });
      }
      
      // Handle tag filtering
      const { tags } = req.query;
      let query = supabase
        .from('tickets')
        .select(`*, customers (*)`);
      
      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        // Filter tickets that contain any of the specified tags
        query = query.not('tags', 'is', null);
        
        // We need to fetch all tickets and filter in memory since Supabase doesn't have array contains operators in this context
        const { data: allTickets, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const filteredTickets = allTickets.filter(ticket => {
          if (!Array.isArray(ticket.tags)) return false;
          return tagList.some(tag => ticket.tags.includes(tag));
        });
        
        const tickets = filteredTickets.map(transformTicket);
        return res.json({ data: tickets });
      }
      
      // Get all tickets
      const { data, error } = await supabase
        .from('tickets')
        .select(`*, customers (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const tickets = data.map(transformTicket);
      return res.json({ data: tickets });
    }
    
    if (req.method === 'POST') {
      const { title, description, priority = 'medium', customer_name, customer_email } = req.body;
      
      // Find or create customer
      let customer;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customer_email.toLowerCase())
        .single();

      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert([{
            name: customer_name.trim(),
            email: customer_email.toLowerCase(),
            avatar: null,
          }])
          .select('*')
          .single();

        if (error) throw error;
        customer = newCustomer;
      }

      // Generate ticket ID
      const { data: lastTicket } = await supabase
        .from('tickets')
        .select('id')
        .like('id', 'TICK-%')
        .order('id', { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (lastTicket && lastTicket.length > 0) {
        const match = lastTicket[0].id.match(/TICK-(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      const ticketId = `TICK-${nextNumber.toString().padStart(3, '0')}`;

      // Create ticket
      const { data: newTicket, error } = await supabase
        .from('tickets')
        .insert([{
          id: ticketId,
          title,
          description,
          priority,
          status: 'new',
          customer_id: customer.id,
          assignee: null,
          tags: []
        }])
        .select(`*, customers (*)`)
        .single();

      if (error) throw error;
      
      const ticket = transformTicket(newTicket);
      return res.status(201).json({ data: ticket });
    }
    
    if (req.method === 'PATCH') {
      const { id } = req.query;
      const updates = req.body;
      
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select(`*, customers (*)`)
        .single();

      if (error) throw error;
      
      const ticket = transformTicket(data);
      return res.json({ data: ticket });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    return handleError(error, res);
  }
};