import { type User, type InsertUser, type Product, type InsertProduct, type CartItem, type InsertCartItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.initializeProducts();
  }

  private initializeProducts() {
    const defaultProducts: Product[] = [
      {
        id: "1",
        nameAr: "سمك البلطي الكويتي 10 كيلو",
        nameEn: "Kuwaiti Tilapia Fish 10 kg",
        price: "20.000",
        image: "/api/images/tilapia",
        category: "fish",
        inStock: true,
        unit: "kg",
      },
      {
        id: "2",
        nameAr: "سمك البلطي الكويتي 5 كيلو",
        nameEn: "Kuwaiti Tilapia Fish 5 kg",
        price: "12.000",
        image: "/api/images/tilapia",
        category: "fish",
        inStock: true,
        unit: "kg",
      },
      {
        id: "3",
        nameAr: "حمام 20 حبة",
        nameEn: "Pigeon 20 Pieces",
        price: "35.000",
        image: "/api/images/pigeon",
        category: "pigeon",
        inStock: true,
        unit: "piece",
      },
      {
        id: "4",
        nameAr: "حمام 10 حبات",
        nameEn: "Pigeon 10 Pieces",
        price: "20.000",
        image: "/api/images/pigeon",
        category: "pigeon",
        inStock: true,
        unit: "piece",
      },
      {
        id: "5",
        nameAr: "بط فرنسي 10 حبات",
        nameEn: "French Duck 10 Pieces",
        price: "35.000",
        image: "/api/images/duck",
        category: "duck",
        inStock: false,
        unit: "piece",
      },
      {
        id: "6",
        nameAr: "بط فرنسي 5 حبات",
        nameEn: "French Duck 5 Pieces",
        price: "20.000",
        image: "/api/images/duck",
        category: "duck",
        inStock: false,
        unit: "piece",
      },
      {
        id: "7",
        nameAr: "دجاج عربي ساسو طازج",
        nameEn: "Fresh Sasso Arabian Chicken",
        price: "20.000",
        image: "/api/images/chicken",
        category: "chicken",
        inStock: true,
        unit: "piece",
      },
      {
        id: "8",
        nameAr: "خاروف استرالي مبرد",
        nameEn: "Frozen Australian Lamb",
        price: "65.000",
        image: "/api/images/lamb",
        category: "lamb",
        inStock: true,
        unit: "piece",
      },
      {
        id: "9",
        nameAr: "خروف تركي مبرد",
        nameEn: "Frozen Turkish Lamb",
        price: "49.500",
        image: "/api/images/lamb",
        category: "lamb",
        inStock: true,
        unit: "piece",
      },
      {
        id: "10",
        nameAr: "خروف شفالي محلي تسمين مزرعة الثنيان",
        nameEn: "Fresh Shefali Sheep at Al Thunayan Farm",
        price: "125.000",
        image: "/api/images/lamb",
        category: "lamb",
        inStock: true,
        unit: "piece",
      },
      {
        id: "11",
        nameAr: "تيس عارضي",
        nameEn: "Aardhi Goat",
        price: "80.000",
        image: "/api/images/goat",
        category: "goat",
        inStock: true,
        unit: "piece",
      },
      {
        id: "12",
        nameAr: "بيض دجاج عربي 3 أطباق",
        nameEn: "Arabic Chicken Eggs 3 Dishes",
        price: "12.000",
        image: "/api/images/eggs",
        category: "eggs",
        inStock: true,
        unit: "dish",
      },
    ];

    defaultProducts.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id,
      inStock: insertProduct.inStock ?? true,
      unit: insertProduct.unit ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const quantity = insertItem.quantity ?? 1;
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.productId === insertItem.productId && item.sessionId === insertItem.sessionId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = { 
      productId: insertItem.productId,
      sessionId: insertItem.sessionId,
      quantity,
      id 
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const items = await this.getCartItems(sessionId);
    items.forEach((item) => this.cartItems.delete(item.id));
  }
}

export const storage = new MemStorage();
