const {
  supabase,
  authenticateApiKey,
  setCorsHeaders,
  handlePreflight,
  handleError
} = require('../lib/auth');

// Transform comment data
function transformComment(dbComment) {
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

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handlePreflight(req, res)) {
    return;
  }

  try {
    const { userId, userName } = await authenticateApiKey(req);
    const { ticket_id, comment_id } = req.query;
    
    if (req.method === 'GET' && ticket_id) {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticket_id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const comments = data.map(transformComment);
      return res.json({ data: comments });
    }
    
    if (req.method === 'POST' && ticket_id) {
      const { content, is_internal = false } = req.body;

      const { data, error } = await supabase
        .from('ticket_comments')
        .insert([{
          ticket_id,
          author_id: userId,
          author_name: userName,
          content,
          is_internal
        }])
        .select('*')
        .single();

      if (error) throw error;
      
      const comment = transformComment(data);
      return res.status(201).json({ data: comment });
    }
    
    if (req.method === 'PATCH' && comment_id) {
      const { content } = req.body;
      
      const { data, error } = await supabase
        .from('ticket_comments')
        .update({ content })
        .eq('id', comment_id)
        .select('*')
        .single();

      if (error) throw error;
      
      const comment = transformComment(data);
      return res.json({ data: comment });
    }
    
    if (req.method === 'DELETE' && comment_id) {
      const { error } = await supabase
        .from('ticket_comments')
        .delete()
        .eq('id', comment_id);

      if (error) throw error;
      
      return res.status(204).end();
    }
    
    return res.status(400).json({ error: 'Invalid request' });
    
  } catch (error) {
    return handleError(error, res);
  }
};