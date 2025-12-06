import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Check,
  Clock,
  Truck,
  XCircle,
  Menu,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, OrderWithItems } from "@shared/schema";
import logoImage from "@assets/logo.jpg";

function getAdminHeaders() {
  const token = localStorage.getItem("adminSession");
  return {
    "x-admin-session": token || "",
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: Check,
  processing: Package,
  shipped: Truck,
  delivered: Check,
  cancelled: XCircle,
};

function OrderCard({ order, onStatusUpdate }: { order: OrderWithItems; onStatusUpdate: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      setIsUpdating(true);
      return fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      onStatusUpdate();
      setIsUpdating(false);
    },
    onError: () => {
      setIsUpdating(false);
    },
  });

  const StatusIcon = statusIcons[order.status] || Clock;
  const total = parseFloat(order.totalAmount);
  const address = order.address;

  return (
    <Card data-testid={`order-card-${order.id}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-mono">
              #{order.id.slice(0, 8).toUpperCase()}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[order.status] || "bg-gray-100"}>
              <StatusIcon className="h-3 w-3 me-1" />
              {order.status}
            </Badge>
            <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
              {order.paymentStatus === "paid" ? "Paid" : "Pending Payment"}
            </Badge>
            {order.paymentMethod && (
              <Badge variant="outline" className="uppercase">
                {order.paymentMethod}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Customer Information
            </h4>
            {address?.name && (
              <p className="text-sm font-medium">{address.name}</p>
            )}
            <p className="text-sm">{order.guestEmail || address?.email}</p>
            <p className="text-sm text-muted-foreground">{order.guestPhone || address?.phone}</p>
          </div>
          {address && (
            <div className="bg-muted/50 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Delivery Address
              </h4>
              <p className="text-sm">
                {address.area}, Block {address.block}<br />
                Street {address.street}
                {address.building && `, Building ${address.building}`}
                {address.floor && `, Floor ${address.floor}`}
              </p>
              {address.notes && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  Note: {address.notes}
                </p>
              )}
            </div>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Order Items ({order.items?.length || 0})
          </h4>
          <div className="space-y-2 bg-muted/30 p-3 rounded-md">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.nameEnAtTime} <span className="text-muted-foreground">x {item.quantity}</span>
                </span>
                <span className="font-medium">
                  {(parseFloat(item.priceAtTime) * item.quantity).toFixed(3)} KWD
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex justify-between flex-1 font-semibold">
            <span>Total</span>
            <span className="text-primary text-lg">{total.toFixed(3)} KWD</span>
          </div>
          <Select
            value={order.status}
            onValueChange={(value) => updateStatusMutation.mutate(value)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[160px]" data-testid={`select-status-${order.id}`}>
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductRow({ 
  product, 
  onUpdate 
}: { 
  product: Product; 
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nameEn: product.nameEn,
    nameAr: product.nameAr,
    price: product.price,
    inStock: product.inStock,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(editData),
      }).then(res => res.json());
    },
    onSuccess: () => {
      onUpdate();
      setIsEditing(false);
    },
  });

  const toggleStockMutation = useMutation({
    mutationFn: async () => {
      return fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ inStock: !product.inStock }),
      }).then(res => res.json());
    },
    onSuccess: onUpdate,
  });

  return (
    <div 
      className="flex flex-wrap items-center gap-4 p-4 border-b last:border-b-0"
      data-testid={`product-row-${product.id}`}
    >
      <div className="flex-1 min-w-[200px]">
        <h4 className="font-medium">{product.nameEn}</h4>
        <p className="text-sm text-muted-foreground">{product.nameAr}</p>
      </div>
      <div className="w-24 text-center">
        <Badge variant={product.category as any}>{product.category}</Badge>
      </div>
      <div className="w-24 text-end font-semibold">
        {product.price} KWD
      </div>
      <div className="w-24 flex items-center justify-center gap-2">
        <Switch
          checked={product.inStock ?? false}
          onCheckedChange={() => toggleStockMutation.mutate()}
          disabled={toggleStockMutation.isPending}
          data-testid={`switch-stock-${product.id}`}
        />
        <span className="text-sm">
          {product.inStock ? "In Stock" : "Out"}
        </span>
      </div>
      <div>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-edit-${product.id}`}>
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Name (English)</Label>
                <Input
                  value={editData.nameEn}
                  onChange={(e) => setEditData({ ...editData, nameEn: e.target.value })}
                />
              </div>
              <div>
                <Label>Name (Arabic)</Label>
                <Input
                  value={editData.nameAr}
                  onChange={(e) => setEditData({ ...editData, nameAr: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div>
                <Label>Price (KWD)</Label>
                <Input
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editData.inStock}
                  onCheckedChange={(checked) => setEditData({ ...editData, inStock: checked })}
                />
                <Label>In Stock</Label>
              </div>
              <Button 
                onClick={() => updateMutation.mutate()} 
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminSession");
    const user = localStorage.getItem("adminUser");
    
    if (!token || !user) {
      setLocation("/admin/login");
      return;
    }
    
    try {
      setAdminUser(JSON.parse(user));
    } catch {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: orders, refetch: refetchOrders, isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", {
        headers: getAdminHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const { data: products, refetch: refetchProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminUser");
    setLocation("/admin/login");
  };

  const totalRevenue = orders?.reduce(
    (sum, order) => sum + (order.paymentStatus === "paid" ? parseFloat(order.totalAmount) : 0),
    0
  ) || 0;

  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const totalProducts = products?.length || 0;
  const outOfStock = products?.filter((p) => !p.inStock).length || 0;

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="Al Thenayan Farms" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <h1 className="font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome, {adminUser.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/" target="_blank">View Store</a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 me-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{totalRevenue.toFixed(3)} KWD</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">{outOfStock}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingCart className="h-4 w-4 me-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 me-2" />
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders?.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusUpdate={() => refetchOrders()}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <CardTitle>Product Inventory</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {productsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="divide-y">
                    {products?.map((product) => (
                      <ProductRow 
                        key={product.id} 
                        product={product} 
                        onUpdate={() => refetchProducts()}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
