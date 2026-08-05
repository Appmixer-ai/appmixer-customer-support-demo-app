# Demo Data Reset Feature

## Overview

This feature allows you to reset all ticket and customer data to a comprehensive default demo state with 40 realistic support tickets.

## Features

### Reset Button Location
- Located in the **Demo Top Banner** (red banner at the top)
- Visible to all authenticated users (not restricted to demo mode)
- Button labeled "Reset Data" with a refresh icon

### Confirmation Dialog
- **Required confirmation** before executing reset
- Shows detailed breakdown of what will be reset:
  - 20 diverse customers (enterprise, SMB, individual users)
  - 4 urgent tickets with frustrated customer interactions
  - 7 high-priority bugs and issues
  - 19 medium-priority tickets with varied scenarios
  - 10 low-priority feature requests and feedback
  - Rich conversation histories with realistic sentiment
- Clear warning that action cannot be undone

### Demo Data Composition

#### 40 Realistic Tickets
**Priority Distribution:**
- **Urgent (10%)**: 4 tickets
  - Critical payment/security/API issues
  - Frustrated/demanding customer tone
  - Immediate escalation scenarios

- **High (25%)**: 7 tickets
  - Login failures, mobile crashes, email issues
  - Multiple users affected
  - Urgent but not critical

- **Medium (47.5%)**: 19 tickets
  - Integrations, billing questions, feature requests
  - Standard support workflows
  - Mix of customer types and scenarios

- **Low (17.5%)**: 10 tickets
  - Minor UI issues, suggestions, positive feedback
  - Nice-to-have improvements

**Status Distribution:**
- **New**: 25% (unassigned, awaiting triage)
- **In Progress**: 35% (active work, assigned agents)
- **Waiting for Customer**: 20% (pending customer response)
- **Resolved**: 20% (completed tickets)

#### 20 Diverse Customers
**Customer Personas:**
- **Enterprise Customers (4)**: High expectations, formal communication
- **SMB Customers (4)**: Practical concerns, professional but friendly
- **Individual Users (8)**: Varied technical skills, mixed communication styles
- **Power Users (4)**: Technical, detailed bug reports

**Realistic Names:**
- Jennifer Martinez, Robert Chen, Amanda Williams, Michael Thompson
- Sarah Johnson, David Kim, Emily Rodriguez, James Wilson
- Lisa Anderson, Thomas Brown, Jessica Lee, Christopher Davis
- Rachel Green, Daniel Park, Sophia Taylor, Marcus Johnson
- Olivia Martinez, Ethan White, Isabella Garcia, William Clark

#### Rich Conversation Histories
**Sample Conversations Include:**

1. **Frustrated Escalation** (TICK-001)
   - Angry customer demanding immediate fix
   - Support agent providing constant updates
   - Internal notes tracking issue
   - Resolution and customer satisfaction

2. **Security Incident** (TICK-002)
   - Professional enterprise customer reporting breach
   - Security team response with detailed analysis
   - Implementation of security measures

3. **Angry Enterprise Customer** (TICK-003)
   - Breaking API changes without notice
   - Threats of legal action
   - Unresolved (demonstrates ongoing critical issue)

4. **Patient Troubleshooting** (TICK-005)
   - Detailed back-and-forth debugging
   - Customer providing requested information
   - Step-by-step resolution guidance
   - Successful resolution with gratitude

5. **Confused User Needing Help** (TICK-012)
   - Customer stuck on integration setup
   - Patient agent providing detailed walkthrough
   - Follow-up questions answered
   - Successful completion

6. **Billing Clarification** (TICK-013)
   - Professional inquiry about charges
   - Detailed breakdown of costs
   - Quick resolution and refund

7. **GDPR Compliance** (TICK-027)
   - Formal data export request
   - Professional compliance response
   - Clear timeline and process

### Customer Sentiment Indicators

**Frustrated/Angry (10-15%)**
- All caps, multiple exclamation marks
- Demanding immediate response
- Threats to switch competitors
- Example: "This is CRITICAL! We've lost THOUSANDS!"

**Confused/Helpless (20-25%)**
- Asking for step-by-step help
- Apologetic tone
- Multiple questions
- Example: "I'm stuck... could someone walk me through this?"

**Professional/Neutral (40-50%)**
- Business-like communication
- Clear problem descriptions
- Patient and respectful
- Example: "There seems to be a discrepancy..."

**Happy/Satisfied (10-15%)**
- Positive feedback
- Feature requests with enthusiasm
- Thank you messages
- Example: "Love the new UI! Great work!"

**Demanding/Entitled (5-10%)**
- Expects immediate response
- References importance/status
- Threats of legal action
- Example: "I need someone senior on this NOW!"

## Technical Implementation

### Files Modified/Created

1. **`src/lib/database.ts`**
   - Added `resetToDefaultDemoData()` function
   - Added `generateDefaultTickets()` helper
   - Added `generateDefaultComments()` helper
   - Handles deletion of existing data and insertion of demo data

2. **`src/components/DemoTopBanner.tsx`**
   - Added reset button with icon
   - Integrated AlertDialog for confirmation
   - Added loading state during reset
   - Success/error toast notifications
   - Auto-reload after successful reset

3. **`src/App.tsx`**
   - Added `onDataReset` callback prop to DemoTopBanner
   - Prepared for future enhancements

4. **`supabase/demo-seed-data.sql`**
   - SQL file with complete demo dataset
   - Reference for manual database seeding
   - Documentation of data structure

### Database Operations

The reset function performs the following operations:

1. **Delete all existing data**
   ```typescript
   - Delete all tickets (cascade deletes comments)
   - Delete all customers
   ```

2. **Insert default customers**
   ```typescript
   - 20 customers with realistic names and emails
   - Diverse customer types (enterprise, SMB, individual)
   ```

3. **Insert default tickets**
   ```typescript
   - 40 tickets with varied priorities and statuses
   - Realistic creation and update timestamps
   - Rich descriptions with customer sentiment
   - Appropriate tags and assignees
   ```

4. **Insert conversation history**
   ```typescript
   - 50+ comments across multiple tickets
   - Mix of customer replies and agent responses
   - Internal notes (visible only to agents)
   - Realistic timestamps relative to ticket creation
   ```

### User Experience Flow

1. User clicks "Reset Data" button in top banner
2. Confirmation dialog appears with:
   - Clear warning about data loss
   - Detailed breakdown of new data
   - Cancel and Confirm buttons
3. On confirmation:
   - Button shows "Resetting..." state
   - Data is deleted and recreated
   - Success toast notification appears
   - Page automatically reloads after 1 second
4. User sees fresh demo data with 40 tickets

## Use Cases

### Demonstration Purposes
- Reset to clean state before demos
- Show consistent demo data to prospects
- Train new team members on support workflows

### Testing
- Test with realistic, diverse ticket scenarios
- Verify UI with various customer sentiments
- Test search, filtering, and sorting features

### Development
- Quickly restore known-good state
- Test data migrations and transformations
- Verify new features with realistic data

## Future Enhancements

Potential additions to this feature:

1. **Multiple Preset Datasets**
   - "Light Load" (10 tickets)
   - "Normal Load" (40 tickets - current)
   - "Heavy Load" (100+ tickets)

2. **Backup Before Reset**
   - Export current state before resetting
   - Download as JSON for later restoration

3. **Partial Reset Options**
   - Reset only tickets (keep customers)
   - Reset only specific priorities
   - Reset and add N new random tickets

4. **Analytics Dashboard**
   - Track reset usage patterns
   - Show ticket distribution visualization
   - Display sentiment analysis

## Notes

- **Performance**: Reset takes 2-5 seconds depending on database speed
- **Authentication**: Works in all modes, not just demo mode
- **Data Loss**: Irreversible - always shows clear warning
- **Timestamps**: Dynamically calculated to be recent and realistic
- **Auto-reload**: Page reloads automatically to refresh all cached data

## Support Scenarios Covered

The demo data includes realistic scenarios for:
- ✅ Payment processing failures
- ✅ Security incidents
- ✅ API integration issues
- ✅ Mobile app crashes
- ✅ Authentication problems
- ✅ Email delivery issues
- ✅ Data export requests
- ✅ Search functionality bugs
- ✅ SSO integration issues
- ✅ Dashboard loading problems
- ✅ Slack integration help
- ✅ Billing discrepancies
- ✅ Feature requests (dark mode, bulk import, etc.)
- ✅ Password reset issues
- ✅ Account management
- ✅ GDPR compliance
- ✅ Team permissions
- ✅ Multi-language requests
- ✅ Documentation improvements
- ✅ Positive feedback and praise
