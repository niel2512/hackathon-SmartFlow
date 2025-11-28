import { createClient as createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server"

// Re-export interfaces for backward compatibility
export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "Admin" | "Staff"
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  stock: number
  minStock: number
  price: number
  createdAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerName: string
  items: OrderItem[]
  status: "Pending" | "Processing" | "Completed"
  total: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowRule {
  id: string
  trigger: "New Order" | "Low Stock" | "Order Completed"
  action: "Send Notification" | "Reduce Stock" | "Assign Staff"
  createdAt: Date
}

export interface NotificationLog {
  id: string
  message: string
  type: "Order" | "Stock" | "Automation"
  createdAt: Date
}

export const db = {
  // User operations
  getUser: async (email: string) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") return null // No rows returned
      throw error
    }
    return data as User
  },

  getUserById: async (id: string) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as User
  },

  createUser: async (user: Omit<User, "id" | "createdAt">) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .insert([{ ...user, created_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  getAllUsers: async () => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*")

    if (error) throw error
    return (data || []) as User[]
  },

  // Product operations
  getProducts: async () => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.from("products").select("*")

    if (error) throw error
    return (data || []) as Product[]
  },

  getProduct: async (id: string) => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as Product
  },

  createProduct: async (product: Omit<Product, "id" | "createdAt">) => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: product.name,
          stock: product.stock,
          min_stock: product.minStock,
          price: product.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const supabase = await createServiceClient()
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name) updateData.name = updates.name
    if (updates.stock !== undefined) updateData.stock = updates.stock
    if (updates.minStock !== undefined) updateData.min_stock = updates.minStock
    if (updates.price !== undefined) updateData.price = updates.price

    const { data, error } = await supabase.from("products").update(updateData).eq("id", id).select().single()

    if (error) throw error
    return data as Product
  },

  deleteProduct: async (id: string) => {
    const supabase = await createServiceClient()
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error
  },

  // Order operations
  getOrders: async () => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.from("orders").select("*")

    if (error) throw error
    return (data || []) as Order[]
  },

  getOrder: async (id: string) => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data as Order
  },

  createOrder: async (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: order.customerName,
          status: order.status,
          total: order.total,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Add notification for new order
    await db.addNotification({
      message: `New order created: ${order.customerName}`,
      type: "Order",
    })

    return data as Order
  },

  updateOrderStatus: async (id: string, status: Order["status"]) => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Trigger automation when order is completed
    if (status === "Completed") {
      const order = data as Order
      await db.addNotification({
        message: `Order Completed → Notification Sent for ${order.customer_name}`,
        type: "Automation",
      })
    }

    return data as Order
  },

  deleteOrder: async (id: string) => {
    const supabase = await createServiceClient()
    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) throw error
  },

  updateOrder: async (id: string, updates: Partial<Order>) => {
    const supabase = await createServiceClient()
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.customerName) updateData.customer_name = updates.customerName
    if (updates.status) updateData.status = updates.status
    if (updates.total !== undefined) updateData.total = updates.total
    if (updates.items) updateData.items = updates.items

    const { data, error } = await supabase.from("orders").update(updateData).eq("id", id).select().single()

    if (error) throw error
    return data as Order
  },

  // Workflow operations
  getWorkflowRules: async () => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.from("workflow_rules").select("*")

    if (error) throw error
    return (data || []) as WorkflowRule[]
  },

  createWorkflowRule: async (rule: Omit<WorkflowRule, "id" | "createdAt">) => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from("workflow_rules")
      .insert([{ ...rule, created_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return data as WorkflowRule
  },

  deleteWorkflowRule: async (id: string) => {
    const supabase = await createServiceClient()
    const { error } = await supabase.from("workflow_rules").delete().eq("id", id)

    if (error) throw error
  },

  // Notification operations
  getNotifications: async () => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.from("notification_logs").select("*")

    if (error) throw error
    return (data || []) as NotificationLog[]
  },

  addNotification: async (notification: Omit<NotificationLog, "id" | "createdAt">) => {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from("notification_logs")
      .insert([{ ...notification, created_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return data as NotificationLog
  },
}
