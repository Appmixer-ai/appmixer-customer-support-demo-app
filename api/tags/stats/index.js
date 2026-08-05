const {
  supabase,
  authenticateApiKey,
  setCorsHeaders,
  handlePreflight,
  handleError
} = require('../../lib/auth');

// Get date range for trends analysis
function getDateRange(period = '30d') {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return { start, end: now };
}

// Generate mock trend data for demo
function generateTrendData(tagCounts, period = '30d') {
  const { start, end } = getDateRange(period);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  const trends = {};
  
  Object.keys(tagCounts).forEach(tag => {
    const dailyData = [];
    const totalCount = tagCounts[tag];
    
    // Generate mock daily usage data
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      // Simulate varying usage with some randomness
      const baseUsage = Math.floor(totalCount / days);
      const variation = Math.floor(Math.random() * (baseUsage * 0.5));
      const usage = Math.max(0, baseUsage + (Math.random() > 0.5 ? variation : -variation));
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        count: usage
      });
    }
    
    trends[tag] = dailyData;
  });
  
  return trends;
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handlePreflight(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = await authenticateApiKey(req);
    const { action, period = '30d', limit = 10 } = req.query;
    
    // Get all tickets with tags
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('tags, created_at, status, priority')
      .not('tags', 'is', null);
    
    if (error) throw error;
    
    if (action === 'trends') {
      // Tag usage trends over time
      const tagCounts = {};
      const { start, end } = getDateRange(period);
      
      // Filter tickets within date range and count tags
      const filteredTickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= start && ticketDate <= end;
      });
      
      filteredTickets.forEach(ticket => {
        if (Array.isArray(ticket.tags)) {
          ticket.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // Get top tags for trends
      const topTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, parseInt(limit))
        .reduce((obj, [tag, count]) => {
          obj[tag] = count;
          return obj;
        }, {});
      
      const trends = generateTrendData(topTags, period);
      
      return res.json({
        data: {
          period,
          dateRange: getDateRange(period),
          trends,
          summary: {
            totalTags: Object.keys(tagCounts).length,
            totalUsage: Object.values(tagCounts).reduce((sum, count) => sum + count, 0),
            topTags: Object.entries(topTags).map(([name, count]) => ({ name, count }))
          }
        }
      });
    }
    
    // Default: General tag statistics
    const tagCounts = {};
    const tagsByStatus = {};
    const tagsByPriority = {};
    
    tickets.forEach(ticket => {
      if (Array.isArray(ticket.tags)) {
        ticket.tags.forEach(tag => {
          // Overall counts
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          
          // By status
          if (!tagsByStatus[tag]) tagsByStatus[tag] = {};
          tagsByStatus[tag][ticket.status] = (tagsByStatus[tag][ticket.status] || 0) + 1;
          
          // By priority
          if (!tagsByPriority[tag]) tagsByPriority[tag] = {};
          tagsByPriority[tag][ticket.priority] = (tagsByPriority[tag][ticket.priority] || 0) + 1;
        });
      }
    });
    
    const totalTicketsWithTags = tickets.length;
    const uniqueTags = Object.keys(tagCounts);
    const totalTagUsages = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);
    
    // Most and least used tags
    const sortedTags = Object.entries(tagCounts).sort(([,a], [,b]) => b - a);
    const mostUsed = sortedTags.slice(0, parseInt(limit));
    const leastUsed = sortedTags.slice(-parseInt(limit)).reverse();
    
    // Tag distribution analysis
    const distributionBuckets = {
      high: sortedTags.filter(([,count]) => count >= 10).length,
      medium: sortedTags.filter(([,count]) => count >= 3 && count < 10).length,
      low: sortedTags.filter(([,count]) => count < 3).length
    };
    
    const stats = {
      overview: {
        totalTags: uniqueTags.length,
        totalUsages: totalTagUsages,
        ticketsWithTags: totalTicketsWithTags,
        averageTagsPerTicket: totalTicketsWithTags > 0 ? (totalTagUsages / totalTicketsWithTags).toFixed(2) : 0
      },
      distribution: distributionBuckets,
      mostUsed: mostUsed.map(([name, count]) => ({
        name,
        count,
        percentage: ((count / totalTagUsages) * 100).toFixed(1)
      })),
      leastUsed: leastUsed.map(([name, count]) => ({
        name,
        count,
        percentage: ((count / totalTagUsages) * 100).toFixed(1)
      })),
      byStatus: Object.entries(tagsByStatus).reduce((result, [tag, statuses]) => {
        result[tag] = {
          total: tagCounts[tag],
          breakdown: statuses
        };
        return result;
      }, {}),
      byPriority: Object.entries(tagsByPriority).reduce((result, [tag, priorities]) => {
        result[tag] = {
          total: tagCounts[tag],
          breakdown: priorities
        };
        return result;
      }, {})
    };
    
    return res.json({ data: stats });
    
  } catch (error) {
    return handleError(error, res);
  }
};