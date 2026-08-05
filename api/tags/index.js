const {
  supabase,
  authenticateApiKey,
  setCorsHeaders,
  handlePreflight,
  handleError
} = require('../lib/auth');

// Transform tag data
function transformTag(dbTag) {
  return {
    id: dbTag.id,
    name: dbTag.name,
    color: dbTag.color,
    description: dbTag.description,
    usageCount: dbTag.usage_count || 0,
    createdAt: new Date(dbTag.created_at),
    updatedAt: new Date(dbTag.updated_at),
  };
}

// Get tag usage count
async function getTagUsageCount(tagName) {
  const { data, error } = await supabase
    .from('tickets')
    .select('tags')
    .not('tags', 'is', null);
  
  if (error) return 0;
  
  let count = 0;
  data.forEach(ticket => {
    if (Array.isArray(ticket.tags) && ticket.tags.includes(tagName)) {
      count++;
    }
  });
  
  return count;
}

// Get all tags with usage counts
async function getAllTagsWithUsage() {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('tags')
    .not('tags', 'is', null);
  
  if (error) return [];
  
  const tagCounts = {};
  tickets.forEach(ticket => {
    if (Array.isArray(ticket.tags)) {
      ticket.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    usageCount: count,
    color: getDefaultTagColor(name),
    description: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

// Get default color for tag
function getDefaultTagColor(tagName) {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  const hash = tagName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handlePreflight(req, res)) {
    return;
  }

  try {
    const { userId } = await authenticateApiKey(req);
    
    if (req.method === 'GET') {
      const { id, popular } = req.query;
      
      if (popular === 'true') {
        // Get most popular tags
        const tags = await getAllTagsWithUsage();
        const sortedTags = tags
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 10);
        
        return res.json({ data: sortedTags });
      }
      
      if (id) {
        // Get specific tag (simulated since we don't have a tags table)
        const tagName = decodeURIComponent(id);
        const usageCount = await getTagUsageCount(tagName);
        
        if (usageCount === 0) {
          return res.status(404).json({ error: 'Tag not found' });
        }
        
        const tag = {
          id: tagName,
          name: tagName,
          color: getDefaultTagColor(tagName),
          description: null,
          usageCount,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return res.json({ data: tag });
      }
      
      // Get all tags with usage counts
      const tags = await getAllTagsWithUsage();
      const sortedTags = tags.sort((a, b) => a.name.localeCompare(b.name));
      
      return res.json({ data: sortedTags });
    }
    
    if (req.method === 'POST') {
      const { name, color, description } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Tag name is required' });
      }
      
      const tagName = name.trim();
      const tagColor = color || getDefaultTagColor(tagName);
      
      // Check if tag already exists by checking if it's used in any tickets
      const usageCount = await getTagUsageCount(tagName);
      
      const tag = {
        id: tagName,
        name: tagName,
        color: tagColor,
        description: description || null,
        usageCount,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return res.status(201).json({ data: tag });
    }
    
    if (req.method === 'PATCH') {
      const { id } = req.query;
      const { name, color, description } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }
      
      const oldTagName = decodeURIComponent(id);
      const newTagName = name ? name.trim() : oldTagName;
      
      // If renaming tag, update all tickets that use this tag
      if (newTagName !== oldTagName) {
        const { data: tickets, error: fetchError } = await supabase
          .from('tickets')
          .select('id, tags')
          .not('tags', 'is', null);
        
        if (fetchError) throw fetchError;
        
        for (const ticket of tickets) {
          if (Array.isArray(ticket.tags) && ticket.tags.includes(oldTagName)) {
            const updatedTags = ticket.tags.map(tag => tag === oldTagName ? newTagName : tag);
            
            const { error: updateError } = await supabase
              .from('tickets')
              .update({ tags: updatedTags })
              .eq('id', ticket.id);
            
            if (updateError) throw updateError;
          }
        }
      }
      
      const usageCount = await getTagUsageCount(newTagName);
      
      const tag = {
        id: newTagName,
        name: newTagName,
        color: color || getDefaultTagColor(newTagName),
        description: description !== undefined ? description : null,
        usageCount,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return res.json({ data: tag });
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }
      
      const tagName = decodeURIComponent(id);
      
      // Remove tag from all tickets
      const { data: tickets, error: fetchError } = await supabase
        .from('tickets')
        .select('id, tags')
        .not('tags', 'is', null);
      
      if (fetchError) throw fetchError;
      
      for (const ticket of tickets) {
        if (Array.isArray(ticket.tags) && ticket.tags.includes(tagName)) {
          const updatedTags = ticket.tags.filter(tag => tag !== tagName);
          
          const { error: updateError } = await supabase
            .from('tickets')
            .update({ tags: updatedTags })
            .eq('id', ticket.id);
          
          if (updateError) throw updateError;
        }
      }
      
      return res.status(204).end();
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    return handleError(error, res);
  }
};