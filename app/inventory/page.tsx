"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { flashManager } from "@/lib/flash"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  name: string
  stock: number
  minStock: number
  price: number
  createdAt: string
}

export default function InventoryPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    minStock: 0,
    price: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
        flashManager.add("Failed to load inventory", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [router])

  const handleSaveProduct = async () => {
    if (!formData.name) {
      flashManager.add("Product name is required", "warning")
      return
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const updated = await res.json()
        setProducts(products.map((p) => (p.id === editingId ? updated : p)))
        flashManager.add(`Product "${formData.name}" updated successfully`, "success")
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const newProduct = await res.json()
        setProducts([...products, newProduct])
        flashManager.add(`Product "${formData.name}" added to inventory`, "success")
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ name: "", stock: 0, minStock: 0, price: 0 })
    } catch (error) {
      console.error("Failed to save product:", error)
      flashManager.add("Failed to save product", "error")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const productName = products.find((p) => p.id === productId)?.name
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" })
      setProducts(products.filter((p) => p.id !== productId))
      flashManager.add(`Product "${productName}" removed from inventory`, "success")
    } catch (error) {
      console.error("Failed to delete product:", error)
      flashManager.add("Failed to delete product", "error")
    }
  }

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      stock: product.stock,
      minStock: product.minStock,
      price: product.price,
    })
    setEditingId(product.id)
    setShowForm(true)
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
            <h1 className="text-3xl font-bold">Inventory</h1>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({ name: "", stock: 0, minStock: 0, price: 0 })
                setShowForm(!showForm)
              }}
            >
              Add Product
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    placeholder="Product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Stock</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Min Stock</label>
                    <Input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Price (Rp)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                  />
                </div>
                <Button onClick={handleSaveProduct}>Save Product</Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Stock</p>
                            <p className="font-semibold">{product.stock} units</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min Stock</p>
                            <p className="font-semibold">{product.minStock} units</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-semibold">Rp {product.price.toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                        {product.stock < product.minStock && (
                          <div className="mt-2 px-2 py-1 bg-red-500/20 text-red-700 dark:text-red-400 text-xs rounded inline-block">
                            ⚠️ Low Stock Alert
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No products yet</p>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
