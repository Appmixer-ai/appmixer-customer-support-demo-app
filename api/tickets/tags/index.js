const {
  supabase,
  authenticateApiKey,
  setCorsHeaders,
  handlePreflight,
  handleError
} = require('../../lib/auth');

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handlePreflight(req, res)) {
    return;
  }

  try {
    const { userId } = await authenticateApiKey(req);
    const { ticket_id, tag_id } = req.query;
    
    if (req.method === 'GET' && ticket_id) {
      // Get tags for a specific ticket
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('tags')
        .eq('id', ticket_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Ticket not found' });
        }
        throw error;
      }
      
      const tags = Array.isArray(ticket.tags) ? ticket.tags : [];
      return res.json({ data: tags });
    }
    
    if (req.method === 'POST') {
      // Add tag(s) to ticket
      const { ticket_id: bodyTicketId, tags, tag } = req.body;
      const targetTicketId = bodyTicketId || ticket_id;
      
      if (!targetTicketId) {
        return res.status(400).json({ error: 'Ticket ID is required' });
      }
      
      // Support both single tag and multiple tags
      const tagsToAdd = tags ? (Array.isArray(tags) ? tags : [tags]) : (tag ? [tag] : []);
      
      if (tagsToAdd.length === 0) {
        return res.status(400).json({ error: 'At least one tag is required' });
      }
      
      // Validate tag names
      for (const tagName of tagsToAdd) {
        if (!tagName || typeof tagName !== 'string' || tagName.trim().length === 0) {
          return res.status(400).json({ error: 'All tag names must be non-empty strings' });
        }
      }
      
      // Get current ticket
      const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select('tags')
        .eq('id', targetTicketId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Ticket not found' });
        }
        throw fetchError;
      }
      
      // Merge tags (avoid duplicates)
      const currentTags = Array.isArray(ticket.tags) ? ticket.tags : [];
      const normalizedNewTags = tagsToAdd.map(tag => tag.trim());
      const updatedTags = [...new Set([...currentTags, ...normalizedNewTags])];
      
      // Update ticket with new tags
      const { data: updatedTicket, error: updateError } = await supabase
        .from('tickets')
        .update({ tags: updatedTags })
        .eq('id', targetTicketId)
        .select('tags')
        .single();

      if (updateError) throw updateError;
      
      return res.json({ 
        data: {
          ticketId: targetTicketId,
          tags: updatedTicket.tags,
          addedTags: normalizedNewTags.filter(tag => !currentTags.includes(tag))
        }
      });
    }
    
    if (req.method === 'DELETE') {
      // Remove tag from ticket
      if (!ticket_id) {
        return res.status(400).json({ error: 'Ticket ID is required' });
      }
      
      if (!tag_id) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }
      
      const tagToRemove = decodeURIComponent(tag_id);
      
      // Get current ticket
      const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select('tags')
        .eq('id', ticket_id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Ticket not found' });
        }
        throw fetchError;
      }
      
      // Remove tag from array
      const currentTags = Array.isArray(ticket.tags) ? ticket.tags : [];
      const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
      
      if (updatedTags.length === currentTags.length) {
        return res.status(404).json({ error: 'Tag not found on ticket' });
      }
      
      // Update ticket
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ tags: updatedTags })
        .eq('id', ticket_id);

      if (updateError) throw updateError;
      
      return res.json({
        data: {
          ticketId: ticket_id,
          removedTag: tagToRemove,
          remainingTags: updatedTags
        }
      });
    }
    
    return res.status(400).json({ error: 'Invalid request' });
    
  } catch (error) {
    return handleError(error, res);
  }
};