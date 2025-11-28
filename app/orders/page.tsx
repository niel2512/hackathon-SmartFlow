"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { flashManager } from "@/lib/flash"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customerName: string
  status: "Pending" | "Processing" | "Completed"
  total: number
  createdAt: string
  items: OrderItem[]
  lowStockAlerts?: string[]
}

interface Product {
  id: string
  name: string
  stock: number
  minStock: number
  price: number
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: "",
    items: [{ productId: "", quantity: 1 }],
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([fetch("/api/orders"), fetch("/api/products")])
        const ordersData = await ordersRes.json()
        const productsData = await productsRes.json()
        setOrders(ordersData)
        setProducts(productsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        flashManager.add("Failed to load orders", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  const handleAddOrder = async () => {
    if (!formData.customerName || formData.items.some((item) => !item.productId)) {
      flashManager.add("Please fill all fields and select products", "warning")
      return
    }

    for (const item of formData.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        flashManager.add("Selected product not found", "error")
        return
      }
      if (item.quantity > product.stock) {
        flashManager.add(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          "error",
        )
        return
      }
    }

    try {
      const orderItems = formData.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return {
          productId: item.productId,
          productName: product?.name || "",
          quantity: item.quantity,
          price: product?.price || 0,
        }
      })

      const orderData = {
        customerName: formData.customerName,
        items: orderItems,
        total: calculateTotal(),
        status: "Pending",
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create order")
      }

      const newOrder = await res.json()
      setOrders([...orders, newOrder])

      const productsRes = await fetch("/api/products")
      const updatedProducts = await productsRes.json()
      setProducts(updatedProducts)

      setShowForm(false)
      setFormData({
        customerName: "",
        items: [{ productId: "", quantity: 1 }],
      })

      flashManager.add(`Order created for ${formData.customerName}`, "success")
    } catch (error) {
      console.error("Failed to add order:", error)
      flashManager.add("Failed to create order", "error")
    }
  }

  const handleEditOrder = async () => {
    if (!selectedOrder) return

    if (!formData.customerName || formData.items.some((item) => !item.productId)) {
      flashManager.add("Please fill all fields and select products", "warning")
      return
    }

    for (const item of formData.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        flashManager.add("Selected product not found", "error")
        return
      }
      if (item.quantity > product.stock) {
        flashManager.add(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          "error",
        )
        return
      }
    }

    try {
      const orderItems = formData.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return {
          productId: item.productId,
          productName: product?.name || "",
          quantity: item.quantity,
          price: product?.price || 0,
        }
      })

      const updateData = {
        customerName: formData.customerName,
        items: orderItems,
        total: calculateTotal(),
      }

      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update order")
      }

      const updatedOrder = await res.json()
      setOrders(orders.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)))
      setSelectedOrder(updatedOrder)
      setEditingOrderId(null)
      setFormData({
        customerName: "",
        items: [{ productId: "", quantity: 1 }],
      })

      flashManager.add(`Order updated successfully`, "success")
    } catch (error) {
      console.error("Failed to edit order:", error)
      flashManager.add("Failed to update order", "error")
    }
  }

  const handleStartEdit = (order: Order) => {
    setEditingOrderId(order.id)
    setFormData({
      customerName: order.customerName,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
  }

  const handleCancelEdit = () => {
    setEditingOrderId(null)
    setFormData({
      customerName: "",
      items: [{ productId: "", quantity: 1 }],
    })
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", quantity: 1 }],
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]

    if (field === "quantity") {
      const selectedProductId = newItems[index].productId
      const selectedProduct = products.find((p) => p.id === selectedProductId)
      const maxQuantity = selectedProduct?.stock || 1
      value = Math.min(Math.max(1, Number.parseInt(value) || 1), maxQuantity)
    }

    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleUpdateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const updatedOrder = await res.json()
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)))
      setSelectedOrder(updatedOrder)

      const productsRes = await fetch("/api/products")
      const updatedProducts = await productsRes.json()
      setProducts(updatedProducts)

      flashManager.add(`Order status updated to ${status}`, "success")

      if (updatedOrder.lowStockAlerts && updatedOrder.lowStockAlerts.length > 0) {
        updatedOrder.lowStockAlerts.forEach((alert: string) => {
          flashManager.add(alert, "warning")
        })
      }
    } catch (error) {
      console.error("Failed to update order:", error)
      flashManager.add("Failed to update order status", "error")
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
      const result = await res.json()
      setOrders(orders.filter((o) => o.id !== orderId))
      setSelectedOrder(null)

      const productsRes = await fetch("/api/products")
      const updatedProducts = await productsRes.json()
      setProducts(updatedProducts)

      flashManager.add(result.message || "Order deleted and stock returned", "success")
    } catch (error) {
      console.error("Failed to delete order:", error)
      flashManager.add("Failed to delete order", "error")
    }
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
            <h1 className="text-3xl font-bold">Orders</h1>
            <Button onClick={() => setShowForm(!showForm)}>Add Order</Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input
                    placeholder="Customer name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Products</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground block mb-1">Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItem(index, "productId", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        >
                          <option value="">Select a product...</option>
                          {products
                            .filter((product) => product.stock > 0)
                            .map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} (Stock: {product.stock}, Price: Rp{" "}
                                {product.price.toLocaleString("id-ID")})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <label className="text-xs text-muted-foreground block mb-1">Qty</label>
                        <Input
                          type="number"
                          min="1"
                          max={item.productId ? products.find((p) => p.id === item.productId)?.stock || 1 : 1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddItem} className="w-full bg-transparent">
                    Add Another Product
                  </Button>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">Rp {calculateTotal().toLocaleString("id-ID")}</p>
                </div>

                <Button onClick={handleAddOrder} className="w-full">
                  Create Order
                </Button>
              </CardContent>
            </Card>
          )}

          {editingOrderId && (
            <Card className="mb-8 border-primary">
              <CardHeader>
                <CardTitle>Edit Order (Pending Only)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input
                    placeholder="Customer name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Products</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground block mb-1">Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItem(index, "productId", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        >
                          <option value="">Select a product...</option>
                          {products
                            .filter((product) => product.stock > 0)
                            .map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} (Stock: {product.stock}, Price: Rp{" "}
                                {product.price.toLocaleString("id-ID")})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <label className="text-xs text-muted-foreground block mb-1">Qty</label>
                        <Input
                          type="number"
                          min="1"
                          max={item.productId ? products.find((p) => p.id === item.productId)?.stock || 1 : 1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddItem} className="w-full bg-transparent">
                    Add Another Product
                  </Button>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">Rp {calculateTotal().toLocaleString("id-ID")}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEditOrder} className="flex-1">
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            selectedOrder?.id === order.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-semibold">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.items.length} item{order.items.length !== 1 ? "s" : ""} - Rp{" "}
                                {order.total.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                order.status === "Completed"
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                  : order.status === "Processing"
                                    ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                    : "bg-gray-500/20 text-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No orders yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-semibold">{selectedOrder.customerName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Products</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="text-sm p-2 bg-muted rounded">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × Rp {item.price.toLocaleString("id-ID")} = Rp{" "}
                            {(item.quantity * item.price).toLocaleString("id-ID")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold">Rp {selectedOrder.total.toLocaleString("id-ID")}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Status Flow</p>
                    <div className="space-y-2">
                      {["Pending", "Processing", "Completed"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status as any)}
                          disabled={
                            selectedOrder.status === status ||
                            (selectedOrder.status === "Processing" && status === "Pending") ||
                            (selectedOrder.status === "Completed" && (status === "Pending" || status === "Processing"))
                          }
                          className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                            selectedOrder.status === status
                              ? "bg-primary text-primary-foreground"
                              : "border border-input hover:bg-muted"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.status === "Pending" && editingOrderId !== selectedOrder.id && (
                    <Button onClick={() => handleStartEdit(selectedOrder)} className="w-full" variant="outline">
                      Edit Order
                    </Button>
                  )}

                  <Button variant="destructive" onClick={() => handleDeleteOrder(selectedOrder.id)} className="w-full">
                    Delete Order
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
