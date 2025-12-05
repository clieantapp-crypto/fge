import { 
  type User, type InsertUser, 
  type Product, type InsertProduct, 
  type CartItem, type InsertCartItem,
  type Address, type InsertAddress,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  users, products, cartItems, addresses, orders, orderItems
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string, category?: string, minPrice?: number, maxPrice?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;
  
  getAddresses(userId: string): Promise<Address[]>;
  getAddressById(id: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  createGuestAddress(data: { 
    name: string; 
    email: string; 
    phone: string; 
    area: string; 
    block: string; 
    street: string; 
    building?: string; 
    floor?: string; 
    notes?: string; 
  }): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;
  
  getOrders(userId?: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<Order | undefined>;
  
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async searchProducts(query: string, category?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> {
    const conditions = [];
    
    if (query) {
      conditions.push(
        or(
          ilike(products.nameAr, `%${query}%`),
          ilike(products.nameEn, `%${query}%`)
        )
      );
    }
    
    if (category) {
      conditions.push(eq(products.category, category));
    }
    
    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice.toString()));
    }
    
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice.toString()));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(products);
    }
    
    return await db.select().from(products).where(and(...conditions));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const quantity = insertItem.quantity ?? 1;
    const [existingItem] = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.productId, insertItem.productId),
        eq(cartItems.sessionId, insertItem.sessionId)
      ));

    if (existingItem) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updated;
    }

    const [cartItem] = await db.insert(cartItems).values({
      ...insertItem,
      quantity
    }).returning();
    return cartItem;
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return item || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async getAddressById(id: string): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const [address] = await db.insert(addresses).values(insertAddress).returning();
    return address;
  }

  async createGuestAddress(data: { 
    name: string; 
    email: string; 
    phone: string; 
    area: string; 
    block: string; 
    street: string; 
    building?: string; 
    floor?: string; 
    notes?: string; 
  }): Promise<Address> {
    const [address] = await db.insert(addresses).values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      area: data.area,
      block: data.block,
      street: data.street,
      building: data.building || null,
      floor: data.floor || null,
      notes: data.notes || null,
      userId: null,
      label: null,
      apartment: null,
      isDefault: false,
    }).returning();
    return address;
  }

  async updateAddress(id: string, updates: Partial<InsertAddress>): Promise<Address | undefined> {
    const [address] = await db.update(addresses).set(updates).where(eq(addresses.id, id)).returning();
    return address || undefined;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return result.length > 0;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId));
    }
    return await db.select().from(orders);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<Order | undefined> {
    const updates: Partial<Order> = { status };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(insertItem).returning();
    return item;
  }
}

export const storage = new DatabaseStorage();
