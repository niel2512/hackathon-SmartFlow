// In-memory database for SmartFlow with types
export interface User {
  id: string
  name: string
  email: string
  password: string // In production, hash passwords!
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

// In-memory storage - Removed all dummy data; users, products, and orders start empty for production
const users: User[] = []

let products: Product[] = []

let orders: Order[] = []

let workflowRules: WorkflowRule[] = []

const notificationLogs: NotificationLog[] = []

export const db = {
  // User operations
  getUser: (email: string) => users.find((u) => u.email === email),
  getUserById: (id: string) => users.find((u) => u.id === id),
  createUser: (user: Omit<User, "id" | "createdAt">) => {
    const newUser = { ...user, id: Date.now().toString(), createdAt: new Date() }
    users.push(newUser)
    return newUser
  },
  getAllUsers: () => users,

  // Product operations
  getProducts: () => products,
  getProduct: (id: string) => products.find((p) => p.id === id),
  createProduct: (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct = { ...product, id: Date.now().toString(), createdAt: new Date() }
    products.push(newProduct)
    return newProduct
  },
  updateProduct: (id: string, updates: Partial<Product>) => {
    const index = products.findIndex((p) => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      return products[index]
    }
    return null
  },
  deleteProduct: (id: string) => {
    products = products.filter((p) => p.id !== id)
  },

  // Order operations
  getOrders: () => orders,
  getOrder: (id: string) => orders.find((o) => o.id === id),
  createOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    orders.push(newOrder)
    notificationLogs.push({
      id: Date.now().toString(),
      message: `New order created: ${newOrder.customerName}`,
      type: "Order",
      createdAt: new Date(),
    })
    return newOrder
  },
  updateOrderStatus: (id: string, status: Order["status"]) => {
    const index = orders.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders[index] = { ...orders[index], status, updatedAt: new Date() }

      // Trigger automation when order is completed
      if (status === "Completed") {
        notificationLogs.push({
          id: Date.now().toString(),
          message: `Order Completed → Notification Sent for ${orders[index].customerName}`,
          type: "Automation",
          createdAt: new Date(),
        })
      }

      return orders[index]
    }
    return null
  },
  deleteOrder: (id: string) => {
    orders = orders.filter((o) => o.id !== id)
  },
  updateOrder: (id: string, updates: Partial<Order>) => {
    const index = orders.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date() }
      return orders[index]
    }
    return null
  },

  // Workflow operations
  getWorkflowRules: () => workflowRules,
  createWorkflowRule: (rule: Omit<WorkflowRule, "id" | "createdAt">) => {
    const newRule = { ...rule, id: Date.now().toString(), createdAt: new Date() }
    workflowRules.push(newRule)
    return newRule
  },
  deleteWorkflowRule: (id: string) => {
    workflowRules = workflowRules.filter((r) => r.id !== id)
  },

  // Notification operations
  getNotifications: () => notificationLogs,
  addNotification: (notification: Omit<NotificationLog, "id" | "createdAt">) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    notificationLogs.push(newNotification)
    return newNotification
  },
}
