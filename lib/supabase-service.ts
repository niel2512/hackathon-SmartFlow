import { createClient } from "./supabase/server"

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getProduct(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function createProduct(product: {
  name: string
  stock: number
  minStock: number
  price: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: product.name,
        stock: product.stock,
        min_stock: product.minStock,
        price: product.price,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string
    stock: number
    minStock: number
    price: number
  }>,
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.stock !== undefined && { stock: updates.stock }),
      ...(updates.minStock !== undefined && { min_stock: updates.minStock }),
      ...(updates.price !== undefined && { price: updates.price }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) throw error
}

// Order operations
export async function getOrders() {
  const supabase = await createClient()
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (ordersError) throw ordersError

  // Get order items for each order
  const { data: items, error: itemsError } = await supabase.from("order_items").select("*")

  if (itemsError) throw itemsError

  // Combine orders with their items
  return orders.map((order) => ({
    ...order,
    items: items.filter((item) => item.order_id === order.id),
  }))
}

export async function getOrder(id: string) {
  const supabase = await createClient()
  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()

  if (orderError) throw orderError

  const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", id)

  if (itemsError) throw itemsError

  return { ...order, items }
}

export async function createOrder(order: {
  customerName: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  total: number
}) {
  const supabase = await createClient()

  // Create order
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        customer_name: order.customerName,
        status: "Pending",
        total: order.total,
      },
    ])
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const { error: itemsError } = await supabase.from("order_items").insert(
    order.items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
  )

  if (itemsError) throw itemsError

  // Log notification
  await supabase.from("notification_logs").insert([
    {
      message: `New order created: ${order.customerName}`,
      type: "Order",
    },
  ])

  return newOrder
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  // Log notification for completed orders
  if (status === "Completed") {
    await supabase.from("notification_logs").insert([
      {
        message: `Order Completed → Notification Sent for ${data.customer_name}`,
        type: "Automation",
      },
    ])
  }

  return data
}

export async function deleteOrder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("orders").delete().eq("id", id)

  if (error) throw error
}

// Workflow operations
export async function getWorkflowRules() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("workflow_rules").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createWorkflowRule(rule: {
  trigger: string
  action: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("workflow_rules").insert([rule]).select().single()

  if (error) throw error
  return data
}

export async function deleteWorkflowRule(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("workflow_rules").delete().eq("id", id)

  if (error) throw error
}

// Notification operations
export async function getNotifications() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("notification_logs").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function addNotification(notification: {
  message: string
  type: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("notification_logs").insert([notification]).select().single()

  if (error) throw error
  return data
}
