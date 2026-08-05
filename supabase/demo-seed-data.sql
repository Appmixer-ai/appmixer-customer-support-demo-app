-- Demo Seed Data with Realistic Customer Support Scenarios
-- This file contains 40 tickets with varied sentiment, priorities, and conversation histories
--
-- NOTE: This SQL file is primarily for reference and manual database seeding.
-- The application uses the TypeScript implementation in src/lib/database.ts
-- which provides the same data with dynamic timestamps.
--
-- Use this file for:
-- - Manual database resets via Supabase dashboard
-- - Initial database setup
-- - Development environment seeding
-- - Migration scripts and CI/CD pipelines
-- - Reference documentation
--
-- To use this file:
-- 1. Via Supabase Dashboard: Copy and paste into SQL Editor
-- 2. Via Supabase CLI: supabase db execute < supabase/demo-seed-data.sql
-- 3. Via psql: psql -h <host> -U <user> -d <database> -f supabase/demo-seed-data.sql
--
-- For application-based reset, use the "Reset Data" button in the UI.

-- Clear existing data
DELETE FROM ticket_comments;
DELETE FROM tickets;
DELETE FROM customers;

-- Insert customers with realistic profiles
INSERT INTO customers (id, name, email, avatar) VALUES
  -- Enterprise customers (higher expectations)
  ('11111111-1111-1111-1111-111111111111', 'Jennifer Martinez', 'j.martinez@techcorp.com', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Robert Chen', 'robert.chen@enterprise.io', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Amanda Williams', 'amanda.w@globalinc.com', NULL),
  ('44444444-4444-4444-4444-444444444444', 'Michael Thompson', 'm.thompson@bigcompany.net', NULL),

  -- SMB customers
  ('55555555-5555-5555-5555-555555555555', 'Sarah Johnson', 'sarah@smallbiz.com', NULL),
  ('66666666-6666-6666-6666-666666666666', 'David Kim', 'david.kim@startup.co', NULL),
  ('77777777-7777-7777-7777-777777777777', 'Emily Rodriguez', 'emily@creative-agency.com', NULL),
  ('88888888-8888-8888-8888-888888888888', 'James Wilson', 'james.w@consulting.biz', NULL),

  -- Individual users (varied technical skills)
  ('99999999-9999-9999-9999-999999999999', 'Lisa Anderson', 'lisa.anderson@email.com', NULL),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thomas Brown', 'thomas.brown@mail.com', NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Jessica Lee', 'jess.lee@inbox.com', NULL),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Christopher Davis', 'chris.davis@email.net', NULL),

  -- Power users
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Rachel Green', 'rachel.green@techie.io', NULL),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Daniel Park', 'daniel.park@developer.com', NULL),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Sophia Taylor', 'sophia.taylor@prouser.net', NULL),

  -- Additional varied users
  ('10101010-1010-1010-1010-101010101010', 'Marcus Johnson', 'marcus.j@company.com', NULL),
  ('20202020-2020-2020-2020-202020202020', 'Olivia Martinez', 'olivia.m@business.io', NULL),
  ('30303030-3030-3030-3030-303030303030', 'Ethan White', 'ethan.white@mail.com', NULL),
  ('40404040-4040-4040-4040-404040404040', 'Isabella Garcia', 'isabella.g@email.com', NULL),
  ('50505050-5050-5050-5050-505050505050', 'William Clark', 'will.clark@work.net', NULL);

-- Insert 40 realistic tickets with varied priorities and statuses
INSERT INTO tickets (id, title, description, priority, status, customer_id, assignee, created_at, updated_at, tags) VALUES
  -- URGENT TICKETS (10%) - Critical issues with frustrated/demanding customers
  ('TICK-001', 'URGENT: Payment processing completely down!', 'This is CRITICAL! Our entire payment system has been down for 3 HOURS! We''ve lost multiple sales and customers are complaining. This needs to be fixed IMMEDIATELY or we''re switching to a competitor. I need someone senior on this NOW!', 'urgent', 'in-progress', '11111111-1111-1111-1111-111111111111', 'Senior Support - Alex Chen', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '15 minutes', ARRAY['payment', 'critical', 'enterprise', 'bug', 'escalated']),

  ('TICK-002', 'Security breach - unauthorized access detected', 'We detected unauthorized login attempts on multiple accounts. Need immediate security audit and user notification. This could be a serious data breach situation.', 'urgent', 'in-progress', '22222222-2222-2222-2222-222222222222', 'Security Team', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', ARRAY['security', 'critical', 'breach', 'enterprise']),

  ('TICK-003', 'API completely broken after update', 'Your latest API update BROKE our entire integration! Nothing works anymore. 500 errors everywhere. Roll it back NOW! Our production app is down and we have customers screaming at us!', 'urgent', 'new', '33333333-3333-3333-3333-333333333333', NULL, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes', ARRAY['api', 'critical', 'bug', 'integration', 'breaking-change']),

  ('TICK-004', 'Database connection timeout - site down', 'Customer-facing website showing database connection errors. Site has been down for 90 minutes. This is costing us thousands in revenue!', 'urgent', 'resolved', '44444444-4444-4444-4444-444444444444', 'DevOps Team', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '1 hour', ARRAY['database', 'downtime', 'critical', 'infrastructure']),

  -- HIGH PRIORITY (25%) - Major bugs affecting multiple users
  ('TICK-005', 'Login page not loading - multiple users affected', 'The login page shows a blank white screen after clicking submit. This started 2 hours ago and we''ve received 15+ reports from customers. Using Chrome 120, but also confirmed in Firefox. This is blocking all new user signups!', 'high', 'in-progress', '55555555-5555-5555-5555-555555555555', 'Alex Chen', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '20 minutes', ARRAY['authentication', 'bug', 'login', 'urgent']),

  ('TICK-006', 'Mobile app crashes on startup (iOS)', 'Our mobile app crashes immediately after opening on iOS 17. Happens 100% of the time. Started after version 2.3.1 update yesterday. We''re getting flooded with 1-star reviews. Please fix ASAP!', 'high', 'in-progress', '66666666-6666-6666-6666-666666666666', 'Mobile Team', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '2 hours', ARRAY['mobile', 'ios', 'crash', 'bug', 'app']),

  ('TICK-007', 'Email notifications not being sent', 'None of our customers are receiving email notifications for the past 6 hours. This includes password resets, order confirmations, everything. Very concerning!', 'high', 'new', '77777777-7777-7777-7777-777777777777', NULL, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours', ARRAY['email', 'notifications', 'bug', 'critical']),

  ('TICK-008', 'Data export failing for large datasets', 'When trying to export more than 10,000 records, the system times out and fails. We need to export 50K records for compliance reporting. This is blocking our audit!', 'high', 'waiting-customer', '88888888-8888-8888-8888-888888888888', 'Sarah Kim', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours', ARRAY['export', 'performance', 'data', 'bug']),

  ('TICK-009', 'Search functionality returning wrong results', 'The search feature is completely broken. Searching for exact customer names returns no results, but searching random text returns everything. This makes the product unusable!', 'high', 'in-progress', '99999999-9999-9999-9999-999999999999', 'Mike Wilson', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 hour', ARRAY['search', 'bug', 'functionality']),

  ('TICK-010', 'SSO integration failing randomly', 'Our Google SSO integration works sometimes but fails randomly with "invalid_token" errors. About 30% failure rate. Users are getting frustrated having to try multiple times.', 'high', 'new', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', ARRAY['sso', 'authentication', 'integration', 'bug']),

  ('TICK-011', 'Dashboard widgets not loading', 'All dashboard widgets show loading spinners but never load data. Started this morning. Console shows CORS errors. Tried clearing cache - no help.', 'high', 'resolved', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tom Brown', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour', ARRAY['dashboard', 'bug', 'ui', 'cors']),

  -- MEDIUM PRIORITY (50%) - Standard bugs, questions, feature requests
  ('TICK-012', 'How to integrate with Slack?', 'Hi, I''m trying to set up the Slack integration but the documentation is a bit confusing. Could someone walk me through the setup process step by step? Specifically, I''m stuck on the OAuth configuration part.', 'medium', 'waiting-customer', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Jennifer Lee', NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 hours', ARRAY['integration', 'slack', 'question', 'documentation']),

  ('TICK-013', 'Billing discrepancy on last invoice', 'There seems to be a discrepancy on my latest invoice. I''m on the Pro plan ($49/month) but was charged $79. Could you please look into this and issue a correction? Invoice #INV-12345.', 'medium', 'in-progress', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Billing Team', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 hours', ARRAY['billing', 'payment', 'question', 'invoice']),

  ('TICK-014', 'Feature request: Dark mode', 'It would be amazing if you could add a dark mode theme! I use your app a lot at night and the bright white interface is hard on the eyes. This is a pretty standard feature in most modern apps now. Would really appreciate it!', 'medium', 'new', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', ARRAY['feature-request', 'ui', 'enhancement', 'dark-mode']),

  ('TICK-015', 'Cannot delete old project', 'I''m trying to delete a project I no longer need, but when I click the delete button nothing happens. No error message, it just doesn''t do anything. I''ve tried on both Chrome and Safari.', 'medium', 'in-progress', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Alex Chen', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '2 hours', ARRAY['bug', 'project', 'ui', 'deletion']),

  ('TICK-016', 'API rate limits too restrictive', 'We''re hitting API rate limits frequently (100 requests/minute). For our use case, we need at least 500/minute. Is there a way to increase our limit? We''re on the Business plan.', 'medium', 'waiting-customer', '10101010-1010-1010-1010-101010101010', 'David Park', NOW() - INTERVAL '1 day', NOW() - INTERVAL '8 hours', ARRAY['api', 'rate-limit', 'question', 'technical']),

  ('TICK-017', 'Password reset email not received', 'I requested a password reset email 30 minutes ago but haven''t received it. I checked spam folder too. Could you please resend it or help me reset my password another way? Email: thomas.brown@mail.com', 'medium', 'resolved', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Support Agent', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', ARRAY['password', 'email', 'authentication', 'account']),

  ('TICK-018', 'Request to change account email', 'I need to update my account email from my old company email to my personal email. What''s the process for this? Do I need to create a new account or can you transfer everything?', 'medium', 'in-progress', '20202020-2020-2020-2020-202020202020', 'Support Agent', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '1 hour', ARRAY['account', 'email', 'question']),

  ('TICK-019', 'Timezone display incorrect', 'All timestamps in the app are showing in PST but I''m in EST. I can''t find a setting to change the timezone preference. Is this a bug or am I missing something?', 'medium', 'new', '30303030-3030-3030-3030-303030303030', NULL, NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours', ARRAY['bug', 'timezone', 'ui', 'settings']),

  ('TICK-020', 'Feature request: Bulk user import', 'Would love to see a bulk user import feature via CSV. Currently have to add 200+ users manually which is very time consuming. This would be a huge time saver!', 'medium', 'new', '40404040-4040-4040-4040-404040404040', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', ARRAY['feature-request', 'users', 'import', 'enhancement']),

  ('TICK-021', 'File upload size limit question', 'What''s the maximum file size for uploads? I''m trying to upload a 50MB file but it fails. Is there a way to increase this limit?', 'medium', 'waiting-customer', '50505050-5050-5050-5050-505050505050', 'Support Agent', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours', ARRAY['upload', 'file', 'question', 'limits']),

  ('TICK-022', 'Excel export formatting issues', 'When I export data to Excel, all the date columns lose their formatting and show as numbers instead. Can this be fixed so dates export properly formatted?', 'medium', 'in-progress', '11111111-1111-1111-1111-111111111111', 'Development Team', NOW() - INTERVAL '3 days', NOW() - INTERVAL '12 hours', ARRAY['export', 'excel', 'bug', 'formatting']),

  ('TICK-023', 'Request for API documentation improvement', 'The API docs are missing examples for the webhook endpoints. Could you add some code samples? Specifically for Node.js and Python. Would make integration much easier!', 'medium', 'new', '22222222-2222-2222-2222-222222222222', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', ARRAY['documentation', 'api', 'webhook', 'improvement']),

  ('TICK-024', 'Understanding subscription plan differences', 'Can someone explain the difference between the Pro and Enterprise plans in more detail? Particularly interested in the API limits and storage differences. Considering upgrading.', 'medium', 'resolved', '33333333-3333-3333-3333-333333333333', 'Sales Team', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 hours', ARRAY['subscription', 'pricing', 'question', 'sales']),

  ('TICK-025', 'Mobile app: Add fingerprint authentication', 'Feature request: Would be great to add fingerprint/Face ID authentication to the mobile app instead of typing password every time. Most banking apps have this now.', 'medium', 'new', '44444444-4444-4444-4444-444444444444', NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', ARRAY['feature-request', 'mobile', 'authentication', 'security']),

  ('TICK-026', 'Webhook delivery failures', 'Some of our webhooks are failing to deliver. The logs show 408 timeout errors. Is there a way to retry failed webhooks automatically or configure a longer timeout?', 'medium', 'in-progress', '55555555-5555-5555-5555-555555555555', 'Technical Support', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours', ARRAY['webhook', 'api', 'bug', 'timeout']),

  ('TICK-027', 'GDPR data export request', 'Per GDPR regulations, I''m requesting a complete export of all my personal data stored in your system. Please provide this within the required 30-day timeframe. Account email: sarah@smallbiz.com', 'medium', 'in-progress', '55555555-5555-5555-5555-555555555555', 'Privacy Team', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ARRAY['gdpr', 'privacy', 'data', 'compliance', 'export']),

  ('TICK-028', 'Team member permissions not working', 'I added a new team member with "Editor" permissions but they''re still seeing the app as view-only. I''ve tried removing and re-adding them but same issue. What am I doing wrong?', 'medium', 'waiting-customer', '66666666-6666-6666-6666-666666666666', 'Sarah Kim', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '2 hours', ARRAY['permissions', 'team', 'bug', 'access']),

  ('TICK-029', 'Request: Multi-language support', 'Are there plans to add support for other languages? Our team is international and would love to have the interface in Spanish, German, and French.', 'medium', 'new', '77777777-7777-7777-7777-777777777777', NULL, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', ARRAY['feature-request', 'i18n', 'localization', 'language']),

  ('TICK-030', 'Custom fields for user profiles', 'It would be helpful to have custom fields for user profiles. We need to track employee ID, department, and location for each user in our system.', 'medium', 'new', '88888888-8888-8888-8888-888888888888', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', ARRAY['feature-request', 'users', 'custom-fields', 'enhancement']),

  -- LOW PRIORITY (15%) - Minor issues, nice-to-have features
  ('TICK-031', 'Tooltip text is cut off', 'Minor UI issue: Some of the tooltip text gets cut off when hovering over the help icons. Not blocking anything but thought you should know.', 'low', 'new', '99999999-9999-9999-9999-999999999999', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', ARRAY['ui', 'bug', 'minor', 'tooltip']),

  ('TICK-032', 'Feature request: Keyboard shortcuts', 'Would be nice to have keyboard shortcuts for common actions. Like Ctrl+N for new item, Ctrl+S for save, etc. Would speed up workflow for power users!', 'low', 'new', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', ARRAY['feature-request', 'ui', 'enhancement', 'keyboard']),

  ('TICK-033', 'Small typo in welcome email', 'Just noticed a small typo in the welcome email template. "recieve" should be "receive". Not urgent but wanted to let you know!', 'low', 'resolved', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Content Team', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', ARRAY['email', 'typo', 'minor', 'content']),

  ('TICK-034', 'Color scheme suggestion', 'Love the app! One small suggestion: the green color used for success messages is a bit too bright. Maybe tone it down slightly? Just a minor UX thing.', 'low', 'new', 'ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', ARRAY['ui', 'design', 'suggestion', 'colors']),

  ('TICK-035', 'Feature idea: Activity feed', 'It would be cool to have an activity feed showing recent actions by team members. Like "John edited Project X" or "Sarah created new task". Low priority but would be nice!', 'low', 'new', '10101010-1010-1010-1010-101010101010', NULL, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', ARRAY['feature-request', 'activity', 'feed', 'enhancement']),

  ('TICK-036', 'Documentation: Add video tutorials', 'The written docs are great, but video tutorials would be even better for visual learners. Just a suggestion for future improvement!', 'low', 'new', '20202020-2020-2020-2020-202020202020', NULL, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks', ARRAY['documentation', 'video', 'enhancement', 'suggestion']),

  ('TICK-037', 'Export to PDF feature', 'Would be nice to have a "Export to PDF" option for reports. Currently only have CSV and Excel. Not urgent, just a nice-to-have.', 'low', 'in-progress', '30303030-3030-3030-3030-303030303030', 'Product Team', NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 days', ARRAY['feature-request', 'export', 'pdf', 'reports']),

  ('TICK-038', 'Suggestion: Remember last used filter', 'Small UX improvement idea: Remember the last filter I used on the tickets page. Minor inconvenience to reset it every time I visit.', 'low', 'new', '40404040-4040-4040-4040-404040404040', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', ARRAY['ui', 'ux', 'suggestion', 'filter']),

  ('TICK-039', 'Add company logo to reports', 'Would be professional to have our company logo on exported reports. Low priority but would make them look more polished for client presentations.', 'low', 'new', '50505050-5050-5050-5050-505050505050', NULL, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', ARRAY['feature-request', 'reports', 'branding', 'export']),

  ('TICK-040', 'Positive feedback: Love the new UI!', 'Just wanted to say the new UI update is fantastic! Much cleaner and easier to navigate. Great work team! 🎉', 'low', 'resolved', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Product Team', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ARRAY['feedback', 'positive', 'ui', 'praise']);

-- Insert realistic conversation history with varied sentiment
INSERT INTO ticket_comments (ticket_id, author_id, author_name, content, is_internal, created_at) VALUES
  -- TICK-001: URGENT payment issue - Frustrated customer → Quick escalation
  ('TICK-001', '11111111-1111-1111-1111-111111111111', 'Jennifer Martinez', 'UPDATE: Still not working! I''ve been refreshing every 5 minutes. When will this be fixed?? We''re losing thousands of dollars every hour!!!', false, NOW() - INTERVAL '2 hours'),
  ('TICK-001', 'support-001', 'Alex Chen', 'Jennifer, I completely understand your frustration. I''ve escalated this to our senior engineering team and they''re actively working on it right now. I''ll update you every 15 minutes until this is resolved.', false, NOW() - INTERVAL '1 hour 50 minutes'),
  ('TICK-001', 'support-001', 'Alex Chen', 'INTERNAL: Payment gateway had a configuration issue after the deployment. DevOps rolling back now.', true, NOW() - INTERVAL '1 hour 45 minutes'),
  ('TICK-001', 'support-001', 'Alex Chen', 'Good news! We''ve identified the issue - it was a configuration problem with our payment gateway after this morning''s deployment. We''re rolling back the changes now. Should be resolved within 10 minutes.', false, NOW() - INTERVAL '1 hour 30 minutes'),
  ('TICK-001', '11111111-1111-1111-1111-111111111111', 'Jennifer Martinez', 'Thank you for the quick response! Testing now...', false, NOW() - INTERVAL '1 hour 20 minutes'),
  ('TICK-001', 'support-001', 'Alex Chen', 'Payment system is back online. I''ve confirmed multiple successful transactions in the last 5 minutes. Can you confirm on your end?', false, NOW() - INTERVAL '1 hour'),
  ('TICK-001', '11111111-1111-1111-1111-111111111111', 'Jennifer Martinez', 'YES! It''s working now. Thank you for handling this so quickly. I appreciate the constant communication during the crisis.', false, NOW() - INTERVAL '30 minutes'),
  ('TICK-001', 'support-001', 'Alex Chen', 'Excellent! I''ll be monitoring for the next few hours to ensure stability. Again, sincere apologies for the disruption. I''ll follow up with a detailed incident report and our prevention plan within 24 hours.', false, NOW() - INTERVAL '15 minutes'),

  -- TICK-002: Security breach - Professional, urgent
  ('TICK-002', '22222222-2222-2222-2222-222222222222', 'Robert Chen', 'Additional info: The unauthorized attempts were from IP addresses in Eastern Europe. We''ve temporarily disabled those accounts as a precaution.', false, NOW() - INTERVAL '1 hour 50 minutes'),
  ('TICK-002', 'security-001', 'Security Team', 'Robert, thank you for the quick action. We''re running a full security audit now. Preliminary analysis shows these were automated bot attempts, not a targeted attack. Your affected accounts are secure.', false, NOW() - INTERVAL '1 hour 30 minutes'),
  ('TICK-002', 'security-001', 'Security Team', 'INTERNAL: Implementing additional rate limiting and CAPTCHA on login. Also flagged the IP ranges for blocking.', true, NOW() - INTERVAL '1 hour'),
  ('TICK-002', 'security-001', 'Security Team', 'Update: We''ve implemented enhanced security measures including additional rate limiting and IP blocking. We''ll be sending security notifications to all affected users within the hour. Full report will be ready by EOD.', false, NOW() - INTERVAL '30 minutes'),

  -- TICK-003: API broken - ANGRY customer
  ('TICK-003', '33333333-3333-3333-3333-333333333333', 'Amanda Williams', 'This is absolutely UNACCEPTABLE! You can''t just push breaking changes without proper deprecation notices! We had ZERO warning about this!', false, NOW() - INTERVAL '40 minutes'),
  ('TICK-003', '33333333-3333-3333-3333-333333333333', 'Amanda Williams', 'I need someone from engineering to call me IMMEDIATELY. This is affecting our enterprise customers and we''re considering legal action for the damages!', false, NOW() - INTERVAL '35 minutes'),

  -- TICK-005: Login issue - Multiple users - Professional troubleshooting
  ('TICK-005', 'support-002', 'Alex Chen', 'Hi Sarah, thank you for the detailed report. Let me help you troubleshoot this immediately.

Can you please provide:
1. The exact browser version (you can find this at chrome://version)
2. A screenshot of the browser console (F12 → Console tab)
3. Are you using any browser extensions that might interfere?

Also, as a temporary workaround, can you try accessing via our mobile app?', false, NOW() - INTERVAL '1 hour 50 minutes'),
  ('TICK-005', '55555555-5555-5555-5555-555555555555', 'Sarah Johnson', 'Hi! Thanks for the quick response. Here''s the info:
1. Chrome Version 120.0.6099.109 (Official Build) (64-bit)
2. Console shows: "Uncaught TypeError: Cannot read property ''token'' of undefined at login.js:247"
3. I disabled all extensions - same issue

Mobile app works fine! But we need the web version for our team.', false, NOW() - INTERVAL '1 hour 30 minutes'),
  ('TICK-005', 'support-002', 'Alex Chen', 'Perfect, that error message is very helpful! I''ve found the issue - there''s a bug in our recent authentication update that affects the web version.

INTERNAL NOTE: Bug in auth.js - token validation failing when localStorage is empty. Fix in progress.', true, NOW() - INTERVAL '1 hour 15 minutes'),
  ('TICK-005', 'support-002', 'Alex Chen', 'Good news! Our engineering team has deployed a fix for this issue. Can you please:
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Close all browser windows
3. Reopen and try logging in again

Let me know if this resolves it!', false, NOW() - INTERVAL '45 minutes'),
  ('TICK-005', '55555555-5555-5555-5555-555555555555', 'Sarah Johnson', 'That worked! Thank you so much for the quick fix. Really appreciate the excellent support! 👍', false, NOW() - INTERVAL '20 minutes'),

  -- TICK-006: Mobile app crash - Frustrated
  ('TICK-006', '66666666-6666-6666-6666-666666666666', 'David Kim', 'Still crashing! I''ve uninstalled and reinstalled twice. This is really frustrating - I need to access my account urgently!', false, NOW() - INTERVAL '16 hours'),
  ('TICK-006', 'mobile-team', 'Mobile Team', 'David, we sincerely apologize for this issue. We''ve identified the bug - it''s related to iOS 17.2 compatibility. We''re submitting an emergency fix to Apple right now.

As a workaround, you can access everything via our web app at app.ourservice.com until the update is approved (usually 24-48 hours).', false, NOW() - INTERVAL '12 hours'),
  ('TICK-006', '66666666-6666-6666-6666-666666666666', 'David Kim', 'Thanks for the update and workaround. I guess I can wait, but please prioritize this - the mobile app is really important for our workflow.', false, NOW() - INTERVAL '8 hours'),
  ('TICK-006', 'mobile-team', 'Mobile Team', 'Update: Apple has approved our emergency fix! Version 2.3.2 is now live in the App Store. Please update and let us know if you have any issues.', false, NOW() - INTERVAL '2 hours'),

  -- TICK-008: Data export - Professional, patient
  ('TICK-008', 'support-003', 'Sarah Kim', 'Hi James, I understand the urgency for your compliance reporting. For large exports (>10k records), we recommend using our API''s batch export endpoint which handles large datasets much better.

I can help you set this up, or we can manually process your export on our side. Which would you prefer?

Also, do you need this exported in a specific format?', false, NOW() - INTERVAL '20 hours'),
  ('TICK-008', '88888888-8888-8888-8888-888888888888', 'James Wilson', 'Thanks for the response! I think the manual export would be easier for us since this is a one-time thing for the audit. We need it in CSV format with all fields included.

Timeframe needed: by end of this week. Will that work?', false, NOW() - INTERVAL '16 hours'),
  ('TICK-008', 'support-003', 'Sarah Kim', 'Perfect! Yes, end of week is definitely doable. I''ll process this export manually and have it ready for you by Thursday EOD.

Quick question: Do you need any specific date ranges or should I export all historical data?', false, NOW() - INTERVAL '12 hours'),
  ('TICK-008', '88888888-8888-8888-8888-888888888888', 'James Wilson', 'All historical data from January 1, 2023 to present. Thanks so much for the help!', false, NOW() - INTERVAL '8 hours'),
  ('TICK-008', 'support-003', 'Sarah Kim', 'Got it! I''ll get started on this today and send you a secure download link by Thursday. I''ll keep you updated on progress.', false, NOW() - INTERVAL '3 hours'),

  -- TICK-012: Slack integration - Confused customer needing help
  ('TICK-012', 'support-004', 'Jennifer Lee', 'Hi! I''d be happy to walk you through the Slack integration setup! It''s actually simpler than it looks.

Here''s a step-by-step guide:

**Step 1: Create Slack App**
1. Go to api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name it (e.g., "YourSaaS Notifications")
5. Select your workspace

**Step 2: Configure OAuth**
1. In your Slack app settings, go to "OAuth & Permissions"
2. Add these redirect URLs:
   - https://app.yourservice.com/oauth/slack/callback
3. Add these Bot Token Scopes:
   - chat:write
   - channels:read

**Step 3: Connect in Our App**
1. Go to Settings → Integrations in our app
2. Click "Connect Slack"
3. It will redirect you to Slack for authorization
4. Approve the permissions

Where exactly are you getting stuck? I can provide more specific guidance!', false, NOW() - INTERVAL '20 hours'),
  ('TICK-012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Christopher Davis', 'Thank you SO much for the detailed instructions! I got stuck on Step 2 - I wasn''t sure where to find "OAuth & Permissions". I found it now though!

One more question: After I connect it, how do I choose which channel to post notifications to?', false, NOW() - INTERVAL '18 hours'),
  ('TICK-012', 'support-004', 'Jennifer Lee', 'Great question! After you complete the connection:

1. Go back to Settings → Integrations
2. Click "Configure" next to your connected Slack workspace
3. You''ll see a dropdown to select the channel
4. Choose your channel (e.g., #notifications)
5. Save settings

You can also customize which events trigger notifications (new tickets, status changes, etc.) on that same page.

Did you manage to complete the connection? Let me know if you need any other help!', false, NOW() - INTERVAL '12 hours'),
  ('TICK-012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Christopher Davis', 'Perfect! I got it all set up and it''s working beautifully. Thank you for your patience and excellent instructions! 🙌', false, NOW() - INTERVAL '5 hours'),

  -- TICK-013: Billing issue - Professional concern
  ('TICK-013', 'billing-team', 'Billing Team', 'Hi Rachel, thank you for bringing this to our attention. Let me look into your account right away.

I''ve reviewed your account and invoice #INV-12345. I can see you''re definitely on the Pro plan ($49/month), but I notice the charge of $79 includes:
- Pro Plan: $49
- Additional Storage (100GB): $20
- Extra API calls: $10

Does this match your usage? Let me know if you weren''t expecting these add-ons and I can adjust your plan and issue a refund.', false, NOW() - INTERVAL '1 day 20 hours'),
  ('TICK-013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Rachel Green', 'Oh! I didn''t realize I had those add-ons activated. I must have clicked something by accident.

I don''t need the extra storage or API calls - the base Pro plan is fine for me. Can you remove those and refund the difference?', false, NOW() - INTERVAL '1 day 18 hours'),
  ('TICK-013', 'billing-team', 'Billing Team', 'Absolutely! I''ve removed both add-ons from your account and processed a $30 refund to your original payment method. You should see it in 3-5 business days.

Your next invoice will be back to the base $49/month. Is there anything else I can help with?', false, NOW() - INTERVAL '1 day 12 hours'),
  ('TICK-013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Rachel Green', 'Perfect! Thank you for resolving this so quickly. Much appreciated!', false, NOW() - INTERVAL '6 hours'),

  -- TICK-017: Password reset - Worried customer
  ('TICK-017', 'support-005', 'Support Agent', 'Hi Thomas, I can help you with that! I''ve manually triggered a new password reset email to thomas.brown@mail.com.

Can you check your inbox in the next few minutes? Also double-check your spam/junk folder just in case.

If you still don''t receive it, I can verify your identity and reset your password manually. Just let me know!', false, NOW() - INTERVAL '1 hour 45 minutes'),
  ('TICK-017', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thomas Brown', 'Got it! It came through this time. Not sure why the first one didn''t arrive but this worked. Thanks!', false, NOW() - INTERVAL '1 hour 30 minutes'),
  ('TICK-017', 'support-005', 'Support Agent', 'Excellent! Glad it worked. Sometimes there can be delays with email delivery. If you have any other issues, don''t hesitate to reach out!', false, NOW() - INTERVAL '30 minutes'),

  -- TICK-024: Subscription question - Sales inquiry
  ('TICK-024', 'sales-team', 'Sales Team', 'Hi Amanda! Great question. I''d be happy to break down the key differences between Pro and Enterprise:

**Pro Plan - $49/month:**
- 5 team members
- 100GB storage
- 10,000 API calls/month
- Email support (24-hour response)
- Standard integrations (10+)
- Basic analytics

**Enterprise Plan - $199/month:**
- Unlimited team members
- 1TB storage (expandable)
- 100,000 API calls/month (negotiable)
- Priority support (1-hour response) + Phone
- All integrations (50+) + Custom integrations
- Advanced analytics + Custom reports
- Dedicated account manager
- SLA guarantees (99.9% uptime)
- SSO and advanced security features
- Custom onboarding + training

For your use case, the main benefits would be the increased API limits and storage. How many team members are you planning to have?', false, NOW() - INTERVAL '1 day 20 hours'),
  ('TICK-024', '33333333-3333-3333-3333-333333333333', 'Amanda Williams', 'Thanks for the detailed breakdown! We have about 15 team members and we''re definitely hitting the API limits on Pro.

The Enterprise plan looks perfect. Can we schedule a call to discuss the custom integration options? We need to integrate with our proprietary CRM.', false, NOW() - INTERVAL '1 day 18 hours'),
  ('TICK-024', 'sales-team', 'Sales Team', 'Absolutely! Custom CRM integration is definitely something we can accommodate on Enterprise.

I''ve sent you a calendar invite for tomorrow at 2 PM EST. We''ll discuss:
- Your CRM integration requirements
- Migration plan from Pro to Enterprise
- Custom onboarding timeline
- Any other questions you have

Looking forward to the call!', false, NOW() - INTERVAL '1 day 12 hours'),
  ('TICK-024', '33333333-3333-3333-3333-333333333333', 'Amanda Williams', 'Perfect! See you on the call. Thanks for the quick response!', false, NOW() - INTERVAL '6 hours'),

  -- TICK-027: GDPR request - Formal compliance
  ('TICK-027', 'privacy-team', 'Privacy Team', 'Dear Sarah,

Thank you for your GDPR data export request. We take data privacy very seriously and will complete this within the required timeframe.

Your data export will include:
- Account information
- All tickets and comments
- Activity logs
- Billing history
- Any integrations and connected services

We''ll prepare a comprehensive data package in machine-readable format (JSON) and provide it within 30 days, though we typically complete these requests within 5-7 business days.

You''ll receive an email with a secure download link once ready.

Reference Number: GDPR-2024-001234

Best regards,
Privacy Team', false, NOW() - INTERVAL '1 day 20 hours'),
  ('TICK-027', '55555555-5555-5555-5555-555555555555', 'Sarah Johnson', 'Thank you for the prompt response and clear timeline. Looking forward to receiving the data export.', false, NOW() - INTERVAL '1 day');

-- Set proper sequence for ticket IDs
-- This ensures new tickets will continue from TICK-041
