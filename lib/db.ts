// In-memory database for SmartFlow with types
import * as fs from "fs"
import * as path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const DB_FILE = path.join(DATA_DIR, "db.json")

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Load persisted data on server startup
const loadData = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"))
      return data
    }
  } catch (error) {
    console.error("[v0] Failed to load persisted data:", error)
  }
  return null
}

// Persist data to file
const saveData = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("[v0] Failed to save data to disk:", error)
  }
}

// Load initial data
const persistedData = loadData()

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

// In-memory storage
const users: User[] = persistedData?.users || []
let products: Product[] = persistedData?.products || []
let orders: Order[] = persistedData?.orders || []
let workflowRules: WorkflowRule[] = persistedData?.workflowRules || []
const notificationLogs: NotificationLog[] = persistedData?.notificationLogs || []

// Helper function to persist data after each modification
const persistDatabase = () => {
  saveData({
    users,
    products,
    orders,
    workflowRules,
    notificationLogs,
  })
}

export const db = {
  // User operations
  getUser: (email: string) => users.find((u) => u.email === email),
  getUserById: (id: string) => users.find((u) => u.id === id),
  createUser: (user: Omit<User, "id" | "createdAt">) => {
    const newUser = { ...user, id: Date.now().toString(), createdAt: new Date() }
    users.push(newUser)
    persistDatabase() // Persist after user creation
    return newUser
  },
  getAllUsers: () => users,

  // Product operations
  getProducts: () => products,
  getProduct: (id: string) => products.find((p) => p.id === id),
  createProduct: (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct = { ...product, id: Date.now().toString(), createdAt: new Date() }
    products.push(newProduct)
    persistDatabase() // Persist after product creation
    return newProduct
  },
  updateProduct: (id: string, updates: Partial<Product>) => {
    const index = products.findIndex((p) => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      persistDatabase() // Persist after product update
      return products[index]
    }
    return null
  },
  deleteProduct: (id: string) => {
    products = products.filter((p) => p.id !== id)
    persistDatabase() // Persist after product deletion
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
    persistDatabase() // Persist after order creation
    return newOrder
  },
  updateOrderStatus: (id: string, status: Order["status"]) => {
    const index = orders.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders[index] = { ...orders[index], status, updatedAt: new Date() }

      if (status === "Completed") {
        notificationLogs.push({
          id: Date.now().toString(),
          message: `Order Completed → Notification Sent for ${orders[index].customerName}`,
          type: "Automation",
          createdAt: new Date(),
        })
      }

      persistDatabase() // Persist after status update
      return orders[index]
    }
    return null
  },
  deleteOrder: (id: string) => {
    orders = orders.filter((o) => o.id !== id)
    persistDatabase() // Persist after order deletion
  },
  updateOrder: (id: string, updates: Partial<Order>) => {
    const index = orders.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date() }
      persistDatabase() // Persist after order update
      return orders[index]
    }
    return null
  },

  // Workflow operations
  getWorkflowRules: () => workflowRules,
  createWorkflowRule: (rule: Omit<WorkflowRule, "id" | "createdAt">) => {
    const newRule = { ...rule, id: Date.now().toString(), createdAt: new Date() }
    workflowRules.push(newRule)
    persistDatabase() // Persist after workflow creation
    return newRule
  },
  deleteWorkflowRule: (id: string) => {
    workflowRules = workflowRules.filter((r) => r.id !== id)
    persistDatabase() // Persist after workflow deletion
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
    persistDatabase() // Persist after notification addition
    return newNotification
  },
}
