"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { flashManager } from "@/lib/flash"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, ExternalLink } from "lucide-react"

interface WorkflowRule {
  id: string
  trigger: "New Order" | "Low Stock" | "Order Completed"
  action: "Send Notification" | "Reduce Stock" | "Assign Staff"
  createdAt: string
  zapierWebhookUrl?: string
}

export default function AutomationPage() {
  const router = useRouter()
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    trigger: "New Order" as const,
    action: "Send Notification" as const,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchRules = async () => {
      try {
        const res = await fetch("/api/workflows")
        const data = await res.json()
        setRules(data)
      } catch (error) {
        console.error("Failed to fetch rules:", error)
        flashManager.add("Failed to load automation rules", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [router])

  const handleSaveRule = async () => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const newRule = await res.json()
      setRules([...rules, newRule])
      setShowForm(false)
      setFormData({ trigger: "New Order", action: "Send Notification" })
      flashManager.add(`Automation rule created: ${formData.trigger} → ${formData.action}`, "success")
    } catch (error) {
      console.error("Failed to save rule:", error)
      flashManager.add("Failed to create automation rule", "error")
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await fetch(`/api/workflows/${ruleId}`, { method: "DELETE" })
      setRules(rules.filter((r) => r.id !== ruleId))
      flashManager.add("Automation rule deleted successfully", "success")
    } catch (error) {
      console.error("Failed to delete rule:", error)
      flashManager.add("Failed to delete automation rule", "error")
    }
  }

  const copyWebhookUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedWebhookId(id)
    flashManager.add("Webhook URL copied to clipboard", "success")
    setTimeout(() => setCopiedWebhookId(null), 2000)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Workflow Automation</h1>
              <p className="text-muted-foreground mt-2">
                Create automation rules and connect them to Zapier for powerful integrations
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>New Rule</Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Automation Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">When this happens (Trigger)</label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={formData.trigger}
                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value as any })}
                  >
                    <option value="New Order">New Order</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Order Completed">Order Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Then do this (Action)</label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                  >
                    <option value="Send Notification">Send Notification</option>
                    <option value="Reduce Stock">Reduce Stock</option>
                    <option value="Assign Staff">Assign Staff</option>
                  </select>
                </div>
                <div className="bg-primary/10 p-4 rounded-md border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    ℹ️ After creating this rule, you'll receive a webhook URL to use in Zapier. You can then create a Zap
                    in Zapier's editor and connect it to SmartFlow.
                  </p>
                </div>
                <Button onClick={handleSaveRule}>Save Automation Rule</Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {rules.length > 0 ? (
              rules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-lg">⚙️</div>
                            <div>
                              <p className="font-semibold">
                                When <span className="text-primary">{rule.trigger}</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Then <span className="text-accent">{rule.action}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                          Delete
                        </Button>
                      </div>

                      <div className="bg-secondary/20 p-4 rounded-md border border-secondary/30">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <span>🔗 Zapier Integration</span>
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Use this webhook URL in Zapier to trigger this automation:
                            </p>
                            <code className="text-xs bg-background p-2 rounded break-all text-foreground">
                              {rule.zapierWebhookUrl}
                            </code>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyWebhookUrl(rule.zapierWebhookUrl || "", rule.id)}
                            >
                              <Copy className="w-4 h-4" />
                              {copiedWebhookId === rule.id ? "Copied" : "Copy"}
                            </Button>
                            <a
                              href="https://zapier.com/app/editor"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Button size="sm" variant="outline">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Create in Zapier
                              </Button>
                            </a>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-muted-foreground">
                          <p className="mb-2">
                            <strong>Quick Setup:</strong>
                          </p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Open Zapier and create a new Zap</li>
                            <li>Use "Webhooks by Zapier" as your trigger app</li>
                            <li>Paste the webhook URL above in Zapier</li>
                            <li>Choose your action app (Slack, Email, etc.)</li>
                            <li>Turn on your Zap</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No automation rules yet. Create one to get started!</p>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
