const {
  supabase,
  authenticateApiKey,
  setCorsHeaders,
  handlePreflight,
  handleError
} = require('../lib/auth');

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handlePreflight(req, res)) {
    return;
  }

  try {
    const { userId } = await authenticateApiKey(req);
    
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      
      return res.json({ data });
    }
    
    if (req.method === 'POST') {
      const { name, email, avatar } = req.body;
      
      const { data, error } = await supabase
        .from('customers')
        .insert([{ name, email, avatar }])
        .select('*')
        .single();

      if (error) throw error;
      
      return res.status(201).json({ data });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    return handleError(error, res);
  }
};