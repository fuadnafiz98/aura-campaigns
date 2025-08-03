# Lead Scoring System

Simple lead scoring for email campaigns with automatic decay and real-time updates.

## 🏗️ **Architecture**

### **Files:**

- **`leadScoring.ts`** - Core scoring functions and queries
- **`leadScoringWorkers.ts`** - Background batch processing
- **`sendMail.ts`** - Email event handling (auto-triggers scoring updates)
- **`crons.ts`** - Daily and hourly scheduled jobs

## 🎯 **Scoring**

**Points**: Delivered (+1), Opened (+3), Clicked (+10)
**Temperature**: Hot (50+), Warm (20-49), Cold (0-19)
**Decay**: 2% daily, reset after 30 days

## 🚀 **Usage**

### **Get Hot Leads:**

```typescript
const hotLeads = await ctx.runQuery(api.leadScoring.getHotLeads, {
  limit: 50,
  temperature: "hot", // optional
  campaignId: "campaign_123", // optional filter
});
```

### **Manual Trigger:**

```typescript
await ctx.runMutation(api.leadScoringTriggers.triggerBatchScoring, {
  userId: "user_123",
});
```

### **Individual Lead:**

```typescript
const result = await ctx.runMutation(api.leadScoring.calculateLeadScore, {
  leadId: "lead_123",
});
```

## 🤖 **Automation**

**Daily (2 AM UTC)**: Batch score all leads
**Hourly**: Apply decay to scores
**Real-time**: Auto-triggered on email opens/clicks via `handleEmailEvent`

## 📊 **Returns**

Hot leads include:

- Lead details (name, email, company)
- Score and temperature
- Latest email subject
- Campaign name
- Engagement metrics (open rate, click rate, etc.)
- Campaign-specific metrics (when filtered by campaign)
