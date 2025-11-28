// Production data validation utilities
import { NextResponse } from "next/server"

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// Validate product data
export function validateProduct(product: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!product.name || typeof product.name !== "string" || product.name.trim().length === 0) {
    errors.push({ field: "name", message: "Product name is required and must be a non-empty string" })
  }

  if (typeof product.stock !== "number" || product.stock < 0) {
    errors.push({ field: "stock", message: "Stock must be a non-negative number" })
  }

  if (typeof product.minStock !== "number" || product.minStock < 0) {
    errors.push({ field: "minStock", message: "Minimum stock must be a non-negative number" })
  }

  if (typeof product.price !== "number" || product.price < 0) {
    errors.push({ field: "price", message: "Price must be a non-negative number" })
  }

  return { valid: errors.length === 0, errors }
}

// Validate order data
export function validateOrder(order: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!order.customerName || typeof order.customerName !== "string" || order.customerName.trim().length === 0) {
    errors.push({ field: "customerName", message: "Customer name is required" })
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push({ field: "items", message: "Order must contain at least one item" })
  } else {
    order.items.forEach((item: any, index: number) => {
      if (!item.productId) {
        errors.push({ field: `items[${index}].productId`, message: "Product ID is required" })
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: "Quantity must be a positive number" })
      }
      if (typeof item.price !== "number" || item.price < 0) {
        errors.push({ field: `items[${index}].price`, message: "Price must be a non-negative number" })
      }
    })
  }

  if (order.status && !["Pending", "Processing", "Completed"].includes(order.status)) {
    errors.push({ field: "status", message: "Invalid order status" })
  }

  return { valid: errors.length === 0, errors }
}

// Validate workflow rule
export function validateWorkflowRule(rule: any): ValidationResult {
  const errors: ValidationError[] = []

  const validTriggers = ["New Order", "Low Stock", "Order Completed"]
  if (!rule.trigger || !validTriggers.includes(rule.trigger)) {
    errors.push({ field: "trigger", message: `Trigger must be one of: ${validTriggers.join(", ")}` })
  }

  const validActions = ["Send Notification", "Reduce Stock", "Assign Staff"]
  if (!rule.action || !validActions.includes(rule.action)) {
    errors.push({ field: "action", message: `Action must be one of: ${validActions.join(", ")}` })
  }

  return { valid: errors.length === 0, errors }
}

// Format validation error response
export function validationErrorResponse(errors: ValidationError[]) {
  return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 })
}
