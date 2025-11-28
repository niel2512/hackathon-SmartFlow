import type { WorkflowRule } from "./db"

/**
 * Maps SmartFlow automation rules to Zapier-compatible configurations
 * Note: Zapier Zaps cannot be created via API directly, but we can:
 * 1. Store rules in SmartFlow database
 * 2. Generate webhook endpoints for Zapier to call
 * 3. Provide instructions for users to create Zaps manually
 */

export interface ZapierWebhookPayload {
  trigger: WorkflowRule["trigger"]
  action: WorkflowRule["action"]
  data: Record<string, any>
  timestamp: string
}

export const zapierConfig = {
  // Map SmartFlow triggers to Zapier app integrations
  triggerMap: {
    "New Order": {
      app: "Webhooks by Zapier",
      event: "Catch Raw Hook",
      description: "Triggered when a new order is created in SmartFlow",
    },
    "Low Stock": {
      app: "Webhooks by Zapier",
      event: "Catch Raw Hook",
      description: "Triggered when product stock falls below minimum threshold",
    },
    "Order Completed": {
      app: "Webhooks by Zapier",
      event: "Catch Raw Hook",
      description: "Triggered when an order status changes to completed",
    },
  },

  // Map SmartFlow actions to Zapier app integrations
  actionMap: {
    "Send Notification": {
      apps: ["Email", "Slack", "SMS by Zapier"],
      description: "Send notifications to team members or customers",
    },
    "Reduce Stock": {
      apps: ["Google Sheets", "Airtable", "SmartFlow API"],
      description: "Automatically update inventory in connected systems",
    },
    "Assign Staff": {
      apps: ["Slack", "Email", "Microsoft Teams"],
      description: "Notify staff members to assign tasks for order fulfillment",
    },
  },
}

export function generateZapierWebhookUrl(ruleId: string, baseUrl: string): string {
  const finalUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://hackathon-smart-flow.vercel.app";
  return `${finalUrl}/api/webhooks/zapier/${ruleId}`
}

export function generateZapierInstructions(rule: WorkflowRule, webhookUrl: string): string {
  const trigger = zapierConfig.triggerMap[rule.trigger]
  const action = zapierConfig.actionMap[rule.action]

  return `
# SmartFlow Zapier Automation Setup

## Rule: ${rule.trigger} → ${rule.action}

### Step 1: Create a New Zap in Zapier
1. Go to https://zapier.com/app/editor
2. Click "Create" to start a new Zap

### Step 2: Set Up the Trigger
1. Search for "${trigger.app}"
2. Select "${trigger.event}" as the trigger event
3. Click "Continue"
4. When prompted for a webhook URL, use this URL:
   \`${webhookUrl}\`

### Step 3: Set Up the Action
1. Click "+" to add an action step
2. Search for and select one of these apps: ${action.apps.join(", ")}
3. Configure the action according to your needs
4. Map fields from the SmartFlow trigger to your action

### Step 4: Test and Turn On
1. Test the Zap with sample data
2. Turn on the Zap when ready

SmartFlow will send webhook data to Zapier whenever:
- ${rule.trigger} occurs
`
}

export async function validateZapierConnection(webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
      }),
    })
    return response.ok
  } catch (error) {
    console.error("Zapier webhook validation failed:", error)
    return false
  }
}
