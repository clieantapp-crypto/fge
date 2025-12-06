import { db } from "./db";
import { products, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const defaultProducts = [
  {
    id: "1",
    nameAr: "سمك البلطي الكويتي 10 كيلو",
    nameEn: "Kuwaiti Tilapia Fish 10 kg",
    descriptionAr:
      "سمك بلطي طازج من المزرعة الكويتية، وزن 10 كيلو، مثالي للعائلات الكبيرة",
    descriptionEn:
      "Fresh tilapia fish from Kuwaiti farm, 10 kg weight, perfect for large families",
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
    descriptionAr: "سمك بلطي طازج من المزرعة الكويتية، وزن 5 كيلو",
    descriptionEn: "Fresh tilapia fish from Kuwaiti farm, 5 kg weight",
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
    descriptionAr: "حمام طازج من مزرعة الثنيان، 20 حبة، مربى بعناية",
    descriptionEn:
      "Fresh pigeon from Al Thunayan Farm, 20 pieces, carefully raised",
    price: "12.000",
    image: "/api/images/pigeon",
    category: "pigeon",
    inStock: true,
    unit: "piece",
  },
  {
    id: "4",
    nameAr: "حمام 10 حبات",
    nameEn: "Pigeon 10 Pieces",
    descriptionAr: "حمام طازج من مزرعة الثنيان، 10 حبات",
    descriptionEn: "Fresh pigeon from Al Thunayan Farm, 10 pieces",
    price: "4.000",
    image: "/api/images/pigeon",
    category: "pigeon",
    inStock: true,
    unit: "piece",
  },
  {
    id: "5",
    nameAr: "بط فرنسي 10 حبات",
    nameEn: "French Duck 10 Pieces",
    descriptionAr: "بط فرنسي فاخر، 10 حبات، لحم طري ولذيذ",
    descriptionEn: "Premium French duck, 10 pieces, tender and delicious meat",
    price: "12.000",
    image: "/api/images/duck",
    category: "duck",
    inStock: false,
    unit: "piece",
  },
  {
    id: "6",
    nameAr: "بط فرنسي 5 حبات",
    nameEn: "French Duck 5 Pieces",
    descriptionAr: "بط فرنسي فاخر، 5 حبات",
    descriptionEn: "Premium French duck, 5 pieces",
    price: "12.000",
    image: "/api/images/duck",
    category: "duck",
    inStock: false,
    unit: "piece",
  },
  {
    id: "7",
    nameAr: "دجاج عربي ساسو طازج",
    nameEn: "Fresh Sasso Arabian Chicken",
    descriptionAr: "دجاج عربي ساسو طازج من المزرعة، لحم صحي وطبيعي",
    descriptionEn:
      "Fresh Sasso Arabian chicken from the farm, healthy and natural meat",
    price: "12.000",
    image: "/api/images/chicken",
    category: "chicken",
    inStock: true,
    unit: "piece",
  },
  {
    id: "8",
    nameAr: "خاروف استرالي مبرد",
    nameEn: "Frozen Australian Lamb",
    descriptionAr: "خروف أسترالي مبرد، لحم عالي الجودة ومستورد",
    descriptionEn: "Frozen Australian lamb, high quality imported meat",
    price: "42.000",
    image: "/api/images/lamb",
    category: "lamb",
    inStock: true,
    unit: "piece",
  },
  {
    id: "9",
    nameAr: "خروف تركي مبرد",
    nameEn: "Frozen Turkish Lamb",
    descriptionAr: "خروف تركي مبرد، لحم طازج ولذيذ",
    descriptionEn: "Frozen Turkish lamb, fresh and delicious meat",
    price: "40.500",
    image: "/api/images/lamb",
    category: "lamb",
    inStock: true,
    unit: "piece",
  },
  {
    id: "10",
    nameAr: "خروف شفالي محلي تسمين مزرعة الثنيان",
    nameEn: "Fresh Shefali Sheep at Al Thunayan Farm",
    descriptionAr: "خروف شفالي محلي من تسمين مزرعة الثنيان، الأفضل في الكويت",
    descriptionEn:
      "Local Shefali sheep from Al Thunayan Farm fattening, the best in Kuwait",
    price: "100.000",
    image: "/api/images/lamb",
    category: "lamb",
    inStock: true,
    unit: "piece",
  },
  {
    id: "11",
    nameAr: "تيس عارضي",
    nameEn: "Aardhi Goat",
    descriptionAr: "تيس عارضي محلي، لحم طازج وعالي الجودة",
    descriptionEn: "Local Aardhi goat, fresh and high quality meat",
    price: "50.000",
    image: "/api/images/goat",
    category: "goat",
    inStock: true,
    unit: "piece",
  },
  {
    id: "12",
    nameAr: "بيض دجاج عربي 3 أطباق",
    nameEn: "Arabic Chicken Eggs 3 Dishes",
    descriptionAr: "بيض دجاج عربي طازج، 3 أطباق، من دجاج حر",
    descriptionEn:
      "Fresh Arabic chicken eggs, 3 dishes, from free-range chickens",
    price: "5.000",
    image: "/api/images/eggs",
    category: "eggs",
    inStock: true,
    unit: "dish",
  },
];

async function seed() {
  console.log("Seeding database...");

  // Check if products exist
  const existingProducts = await db.select().from(products);

  if (existingProducts.length === 0) {
    console.log("Inserting products...");
    for (const product of defaultProducts) {
      await db.insert(products).values(product).onConflictDoNothing();
    }
    console.log(`Inserted ${defaultProducts.length} products`);
  } else {
    console.log(
      `Products already exist (${existingProducts.length} found), skipping...`,
    );
  }

  // Create admin user if not exists
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"));

  if (!existingAdmin) {
    console.log("Creating admin user...");
    // Simple password hash - in production use bcrypt
    const adminPassword = "admin123"; // This should be changed
    await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      email: "admin@althenayanfarms.com",
      role: "admin",
    });
    console.log("Admin user created (username: admin, password: admin123)");
  } else {
    console.log("Admin user already exists");
  }

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
