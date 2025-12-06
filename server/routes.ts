import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertAddressSchema, insertOrderSchema, insertOrderItemSchema, insertProductSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// Simple session-based auth check
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminSession = req.headers["x-admin-session"];
  if (!adminSession) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all products with optional search/filter
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { search, category, minPrice, maxPrice } = req.query;
      
      if (search || category || minPrice || maxPrice) {
        const products = await storage.searchProducts(
          search as string || "",
          category as string,
          minPrice ? parseFloat(minPrice as string) : undefined,
          maxPrice ? parseFloat(maxPrice as string) : undefined
        );
        return res.json(products);
      }
      
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get products by category
  app.get("/api/products/category/:category", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  // Get categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = [
        { id: "fish", nameAr: "سمك", nameEn: "Fish", slug: "fish" },
        { id: "duck", nameAr: "بط", nameEn: "Duck", slug: "duck" },
        { id: "pigeon", nameAr: "حمام", nameEn: "Pigeon", slug: "pigeon" },
        { id: "eggs", nameAr: "بيض", nameEn: "Eggs", slug: "eggs" },
        { id: "lamb", nameAr: "خروف", nameEn: "Lamb", slug: "lamb" },
        { id: "goat", nameAr: "ماعز", nameEn: "Goat", slug: "goat" },
        { id: "chicken", nameAr: "دجاج", nameEn: "Chicken", slug: "chicken" },
      ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Cart routes
  app.get("/api/cart/:sessionId", async (req: Request, res: Response) => {
    try {
      const cartItems = await storage.getCartItems(req.params.sessionId);
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return { ...item, product };
        })
      );
      res.json(itemsWithProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const validation = insertCartItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const cartItem = await storage.addToCart(validation.data);
      const product = await storage.getProductById(cartItem.productId);
      res.status(201).json({ ...cartItem, product });
    } catch (error) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const quantitySchema = z.object({ quantity: z.number().min(1) });
      const validation = quantitySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const cartItem = await storage.updateCartItemQuantity(
        req.params.id,
        validation.data.quantity
      );
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      const product = await storage.getProductById(cartItem.productId);
      res.json({ ...cartItem, product });
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart/session/:sessionId", async (req: Request, res: Response) => {
    try {
      await storage.clearCart(req.params.sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Return user info with a simple session token
      const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role 
        }, 
        token: sessionToken 
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Orders routes
  app.get("/api/orders", requireAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProductById(item.productId);
              return { ...item, product };
            })
          );
          const address = order.addressId ? await storage.getAddressById(order.addressId) : null;
          return { ...order, items: itemsWithProducts, address };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getOrderItems(order.id);
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return { ...item, product };
        })
      );
      const address = order.addressId ? await storage.getAddressById(order.addressId) : null;
      res.json({ ...order, items: itemsWithProducts, address });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status, paymentStatus } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status, paymentStatus);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Stripe checkout
  app.post("/api/checkout/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { amount, sessionId, customerEmail, customerPhone, shippingAddress, cartItems: clientCartItems } = req.body;
      
      // Create guest address first
      const address = await storage.createGuestAddress({
        name: shippingAddress.name,
        email: customerEmail,
        phone: customerPhone,
        area: shippingAddress.area,
        block: shippingAddress.block,
        street: shippingAddress.street,
        building: shippingAddress.building || undefined,
        floor: shippingAddress.floor || undefined,
        notes: shippingAddress.notes || undefined,
      });

      // Create order with address reference
      const order = await storage.createOrder({
        status: "pending",
        totalAmount: amount.toString(),
        paymentMethod: "card",
        paymentStatus: "pending",
        guestEmail: customerEmail,
        guestPhone: customerPhone,
        userId: null,
        addressId: address.id,
        stripeSessionId: null,
        notes: null,
      });

      // Get cart items from database or use client-provided items
      let cartItems = await storage.getCartItems(sessionId);
      
      // If no items in database, use client-provided items
      if (cartItems.length === 0 && clientCartItems && clientCartItems.length > 0) {
        for (const item of clientCartItems) {
          const product = await storage.getProductById(item.productId);
          if (product) {
            await storage.createOrderItem({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: product.price,
              nameArAtTime: product.nameAr,
              nameEnAtTime: product.nameEn,
            });
          }
        }
      } else {
        for (const item of cartItems) {
          const product = await storage.getProductById(item.productId);
          if (product) {
            await storage.createOrderItem({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: product.price,
              nameArAtTime: product.nameAr,
              nameEnAtTime: product.nameEn,
            });
          }
        }
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 1000), // Convert KWD to fils
        currency: "kwd",
        metadata: {
          orderId: order.id,
          sessionId,
          addressId: address.id,
        },
        receipt_email: customerEmail,
      });

      // Update order with stripe payment intent id
      await storage.updateOrderStatus(order.id, "pending", "processing");

      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        addressId: address.id,
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: error.message || "Checkout failed" });
    }
  });

  app.post("/api/checkout/confirm", async (req: Request, res: Response) => {
    try {
      const { orderId, sessionId } = req.body;
      
      // Update order status
      await storage.updateOrderStatus(orderId, "confirmed", "paid");
      
      // Clear cart
      await storage.clearCart(sessionId);
      
      res.json({ success: true, orderId });
    } catch (error) {
      res.status(500).json({ error: "Failed to confirm order" });
    }
  });

  // KNET checkout - Create order
  app.post("/api/checkout/create-order", async (req: Request, res: Response) => {
    try {
      const { amount, sessionId, customerEmail, customerPhone, paymentMethod, shippingAddress, cartItems: clientCartItems } = req.body;
      
      // Create guest address first
      const address = await storage.createGuestAddress({
        name: shippingAddress.name,
        email: customerEmail,
        phone: customerPhone,
        area: shippingAddress.area,
        block: shippingAddress.block,
        street: shippingAddress.street,
        building: shippingAddress.building || undefined,
        floor: shippingAddress.floor || undefined,
        notes: shippingAddress.notes || undefined,
      });

      // Create order with address reference
      const order = await storage.createOrder({
        status: "pending",
        totalAmount: amount.toString(),
        paymentMethod: paymentMethod || "knet",
        paymentStatus: "pending",
        guestEmail: customerEmail,
        guestPhone: customerPhone,
        userId: null,
        addressId: address.id,
        stripeSessionId: null,
        notes: null,
      });

      // Create order items from cart
      if (clientCartItems && clientCartItems.length > 0) {
        for (const item of clientCartItems) {
          const product = await storage.getProductById(item.productId);
          if (product) {
            await storage.createOrderItem({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: product.price,
              nameArAtTime: product.nameAr,
              nameEnAtTime: product.nameEn,
            });
          }
        }
      }

      res.json({
        orderId: order.id,
        addressId: address.id,
      });
    } catch (error: any) {
      console.error("Create order error:", error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  // KNET payment processing - redirect to KNET gateway
  app.post("/api/checkout/process-knet", async (req: Request, res: Response) => {
    try {
      const { orderId, sessionId } = req.body;
      
      // Get order details
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // In production, this would redirect to KNET payment gateway
      // For now, we simulate a successful payment
      // KNET integration requires:
      // 1. Merchant ID from KNET
      // 2. Transport Key
      // 3. Resource Key
      // The actual flow would redirect to: https://kpay.com.kw/kpg/PaymentHTTP.htm
      
      // Simulate successful payment - Update order status
      await storage.updateOrderStatus(orderId, "confirmed", "paid");
      
      // Clear cart
      await storage.clearCart(sessionId);
      
      // In real KNET integration, return the redirect URL
      // For demo, we return success directly
      res.json({ 
        success: true, 
        orderId,
        // redirectUrl would be the KNET payment page URL in production
        // redirectUrl: `https://kpay.com.kw/kpg/PaymentHTTP.htm?...`
      });
    } catch (error: any) {
      console.error("KNET payment error:", error);
      res.status(500).json({ error: error.message || "Payment processing failed" });
    }
  });

  // Admin product management
  app.post("/api/admin/products", requireAdmin, async (req: Request, res: Response) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Stripe config for frontend
  app.get("/api/config/stripe", (req: Request, res: Response) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  });

  // Location service - secure proxy for ipdata.co
  app.get("/api/location/country", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.IPDATA_API_KEY;
      if (!apiKey) {
        throw new Error("IPDATA_API_KEY not configured");
      }
      
      const url = `https://api.ipdata.co/country_name?api-key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const country = await response.text();
      res.json({ country });
    } catch (error) {
      console.error("Location fetch error:", error);
      res.status(500).json({ error: "Failed to fetch location" });
    }
  });

  return httpServer;
}
