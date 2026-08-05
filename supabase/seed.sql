-- Populate customers table with mock data
INSERT INTO customers (id, name, email, avatar) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Johnson', 'sarah.johnson@email.com', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Mike Chen', 'mike.chen@company.com', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Emily Rodriguez', 'emily.r@startup.io', NULL),
  ('44444444-4444-4444-4444-444444444444', 'David Kim', 'd.kim@business.net', NULL),
  ('55555555-5555-5555-5555-555555555555', 'Lisa Thompson', 'lisa.thompson@corp.com', NULL),
  ('66666666-6666-6666-6666-666666666666', 'Alex Martinez', 'alex.m@tech.co', NULL),
  ('77777777-7777-7777-7777-777777777777', 'Customer John', 'customer.john@email.com', NULL)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar;

-- Populate tickets table with mock data
INSERT INTO tickets (id, title, description, priority, status, customer_id, assignee, created_at, updated_at, tags) VALUES
  ('TICK-001', 'Login page not loading properly', 'The login page shows a blank screen after entering credentials. This has been happening for the past 2 days.', 'high', 'new', '11111111-1111-1111-1111-111111111111', NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', ARRAY['bug', 'authentication', 'urgent']),
  
  ('TICK-002', 'Feature request: Dark mode support', 'It would be great to have a dark mode option in the application for better user experience during night time usage.', 'low', 'in-progress', '22222222-2222-2222-2222-222222222222', 'Alex Chen', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours', ARRAY['enhancement', 'ui', 'feature-request']),
  
  ('TICK-003', 'Payment gateway timeout error', 'Getting timeout errors when processing payments above $500. Customers are unable to complete large transactions.', 'urgent', 'in-progress', '33333333-3333-3333-3333-333333333333', 'Sarah Kim', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '30 minutes', ARRAY['payment', 'critical', 'bug', 'gateway']),
  
  ('TICK-004', 'How to export data to CSV?', 'I need help understanding how to export my data to CSV format. The documentation is not clear on this process.', 'medium', 'waiting-customer', '44444444-4444-4444-4444-444444444444', 'Mike Wilson', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 hours', ARRAY['question', 'documentation', 'export']),
  
  ('TICK-005', 'Account deletion request', 'I would like to delete my account and all associated data. Please confirm the process and timeline.', 'medium', 'resolved', '55555555-5555-5555-5555-555555555555', 'Tom Brown', NOW() - INTERVAL '2 days', NOW() - INTERVAL '12 hours', ARRAY['account', 'deletion', 'privacy', 'gdpr']),
  
  ('TICK-006', 'Mobile app crashes on startup', 'The mobile application crashes immediately after opening. This started after the latest update yesterday.', 'high', 'new', '66666666-6666-6666-6666-666666666666', NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', ARRAY['mobile', 'crash', 'bug', 'app']),
  
  ('TICK-007', 'Billing discrepancy question', 'There seems to be a discrepancy in my billing statement. The amount charged doesn''t match my plan.', 'medium', 'in-progress', '22222222-2222-2222-2222-222222222222', 'Jennifer Lee', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 hour', ARRAY['billing', 'payment', 'question']),
  
  ('TICK-008', 'API rate limit exceeded', 'Our application is hitting API rate limits frequently. We need to understand how to increase our limits.', 'high', 'waiting-customer', '33333333-3333-3333-3333-333333333333', 'David Park', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '45 minutes', ARRAY['api', 'rate-limit', 'technical']),
  
  ('TICK-009', 'Password reset not working', 'The password reset email is not being received. I''ve checked spam folder and tried multiple times.', 'medium', 'resolved', '11111111-1111-1111-1111-111111111111', 'Lisa Chang', NOW() - INTERVAL '36 hours', NOW() - INTERVAL '6 hours', ARRAY['password', 'email', 'authentication']),
  
  ('TICK-010', 'Integration with Slack', 'We need help setting up the Slack integration for our team notifications. The setup guide is confusing.', 'low', 'new', '55555555-5555-5555-5555-555555555555', NULL, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours', ARRAY['integration', 'slack', 'setup', 'documentation']),
  
  ('TICK-011', 'Unable to access dashboard', 'I''m getting a 403 error when trying to access my dashboard. This started happening this morning.', 'high', 'new', '77777777-7777-7777-7777-777777777777', NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', ARRAY['access', 'dashboard', 'error']),
  
  ('TICK-012', 'Question about subscription plan', 'I want to understand the difference between the Pro and Enterprise plans. Could someone explain the features?', 'medium', 'waiting-customer', '77777777-7777-7777-7777-777777777777', 'Support Agent', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours', ARRAY['subscription', 'pricing', 'question']),
  
  ('TICK-013', 'Feature request: Email notifications', 'It would be helpful to receive email notifications when my tickets are updated or resolved.', 'low', 'in-progress', '77777777-7777-7777-7777-777777777777', 'Product Team', NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 hours', ARRAY['feature-request', 'notifications', 'email'])

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  priority = EXCLUDED.priority,
  status = EXCLUDED.status,
  customer_id = EXCLUDED.customer_id,
  assignee = EXCLUDED.assignee,
  updated_at = EXCLUDED.updated_at,
  tags = EXCLUDED.tags;

-- Populate ticket_comments table with sample conversation history
INSERT INTO ticket_comments (ticket_id, author_id, author_name, content, is_internal, created_at) VALUES
  -- Comments for TICK-001 (Login page issue)
  ('TICK-001', 'support-001', 'Support Agent', 'Thank you for reporting this issue. I understand you''re experiencing a blank screen after entering credentials. Let me help you troubleshoot this problem.

Can you please try the following steps:
1. Clear your browser cache and cookies
2. Try using incognito/private browsing mode
3. Let me know which browser and version you''re using', false, NOW() - INTERVAL '90 minutes'),
  
  ('TICK-001', 'support-001', 'Support Agent', 'Customer reported using Chrome 118. Investigating potential JavaScript error in authentication flow.', true, NOW() - INTERVAL '80 minutes'),
  
  -- Comments for TICK-003 (Payment gateway issue)
  ('TICK-003', 'support-002', 'Sarah Kim', 'Hi Emily, I''ve escalated this to our payment team. This looks like a timeout configuration issue with transactions over $500.

I''ve temporarily increased the timeout limits while we implement a permanent fix.', false, NOW() - INTERVAL '25 minutes'),
  
  ('TICK-003', 'support-002', 'Sarah Kim', 'Dev team confirmed this is related to the recent payment gateway update. Fix scheduled for deployment tonight.', true, NOW() - INTERVAL '15 minutes'),
  
  -- Comments for TICK-004 (CSV export help)
  ('TICK-004', 'support-003', 'Mike Wilson', 'Hi David! I''d be happy to help you with CSV export.

To export your data to CSV:
1. Go to your data dashboard
2. Select the data you want to export using the checkboxes
3. Click the "Export" button in the top right
4. Choose "CSV" from the format dropdown
5. Click "Download"

The export might take a few minutes for large datasets. You''ll get an email when it''s ready.

Does this help? Let me know if you need clarification on any step!', false, NOW() - INTERVAL '4 hours'),
  
  -- Comments for TICK-012 (Subscription question)  
  ('TICK-012', 'support-004', 'Support Agent', 'Great question! Here''s a breakdown of our Pro vs Enterprise plans:

**Pro Plan ($29/month):**
- Up to 10 users
- 100GB storage
- Email support
- Basic integrations
- Standard analytics

**Enterprise Plan ($99/month):**
- Unlimited users
- 1TB storage  
- Priority phone & email support
- Advanced integrations (Slack, Teams, etc.)
- Custom analytics & reporting
- Dedicated account manager
- SLA guarantees

Would you like me to schedule a call to discuss which plan would work best for your team?', false, NOW() - INTERVAL '90 minutes')

ON CONFLICT (id) DO NOTHING;