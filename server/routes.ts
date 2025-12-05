import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
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

  return httpServer;
}
