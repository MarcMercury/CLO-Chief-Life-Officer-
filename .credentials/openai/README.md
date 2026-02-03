# 🤖 OpenAI Credentials Setup

## Overview
OpenAI provides AI capabilities for CLO's intelligent features.

---

## 🚀 Setup Steps

### 1. Create OpenAI Account
1. Go to https://platform.openai.com
2. Create account or sign in
3. Add billing information (required for API access)

### 2. Generate API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name: `CLO Edge Functions`
4. Copy immediately (only shown once!)

### 3. Configure in Supabase
```bash
# Set as Edge Function secret
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Verify it's set
supabase secrets list
```

---

## 📝 Configuration Template

### config.json.template
```json
{
  "api_key_name": "CLO Edge Functions",
  "organization_id": "your-org-id-if-applicable",
  "models_used": [
    "gpt-4o",
    "gpt-4o-mini"
  ],
  "features": {
    "inventory_enrichment": true,
    "cancellation_letters": true,
    "relationship_analysis": false,
    "sentiment_analysis": false
  },
  "rate_limits": {
    "requests_per_minute": 60,
    "tokens_per_minute": 90000
  }
}
```

---

## 🔌 CLO AI Features

### 1. Inventory Enrichment
**Edge Function**: `enrich-inventory-item`
- Input: Barcode or product name
- Output: Warranty info, manual URL, support phone
- Model: `gpt-4o-mini` (cost-effective)

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Extract product warranty information...' },
      { role: 'user', content: `Product: ${productName}` }
    ]
  })
});
```

### 2. Cancellation Letter Generation
**Edge Function**: `generate-cancellation`
- Input: Subscription name and details
- Output: Professional cancellation letter
- Model: `gpt-4o` (higher quality writing)

### 3. Future: Relationship Analysis
- Sentiment analysis of interaction logs
- Suggested talking points
- Conflict detection

---

## 💰 Cost Management

### Pricing (as of 2026)
| Model | Input | Output |
|-------|-------|--------|
| gpt-4o | $2.50/1M tokens | $10.00/1M tokens |
| gpt-4o-mini | $0.15/1M tokens | $0.60/1M tokens |

### Cost Optimization Tips
1. Use `gpt-4o-mini` for simple tasks
2. Implement caching for repeated queries
3. Set monthly budget limits in OpenAI dashboard
4. Use structured output (`json_object`) to reduce token waste

### Estimated Monthly Costs
- Light usage (100 enrichments): ~$0.50
- Medium usage (500 enrichments): ~$2.50
- Heavy usage (2000 enrichments): ~$10.00

---

## 🔐 Security Best Practices

### DO ✅
- Store API key in Supabase Secrets only
- Use in Edge Functions (server-side)
- Set spending limits in OpenAI dashboard
- Monitor usage regularly

### DON'T ❌
- Expose API key in client code
- Commit key to version control
- Share key in plaintext
- Use without rate limiting

---

## 📊 Usage Monitoring

### Check Usage
1. Go to https://platform.openai.com/usage
2. View daily/monthly token consumption
3. Set up usage alerts

### Supabase Function Logs
```bash
# View Edge Function logs
supabase functions logs enrich-inventory-item --tail
```

---

## ⚠️ Rate Limits

### Default Limits (Tier 1)
- 60 requests per minute
- 90,000 tokens per minute
- Higher tiers available with usage

### Handling Rate Limits
```typescript
// Implement exponential backoff
if (response.status === 429) {
  await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
  // Retry request
}
```

---

## 🆘 Troubleshooting

### "Invalid API key"
- Verify key is correctly copied (no extra spaces)
- Check if key was revoked
- Ensure correct environment variable name

### "Rate limit exceeded"
- Implement request queuing
- Use exponential backoff
- Consider upgrading tier

### "Insufficient quota"
- Add payment method to OpenAI account
- Check billing status
- Review spending limits

---

## 📅 Last Updated
- **Date**: January 29, 2026
- **Version**: 1.0
