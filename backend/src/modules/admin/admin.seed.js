const admin = require("firebase-admin");
const User = require("../user/user.model");
const Category = require("../category/category.model");
const Product = require("../product/product.model");
const SellerProfile = require("../seller/sellerProfile.model");
const { generateCleanSlug } = require("../../utils/slugify");

/**
 * Seed database with default admin, seller, categories, and verified products.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_SEED_EMAIL;
    const adminName = process.env.ADMIN_SEED_NAME || "Admin";
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;

    if (!adminEmail) {
      console.log("ℹ️  No ADMIN_SEED_EMAIL set — skipping admin seed");
      return;
    }

    // 1. ── Seed Admin User ──
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne({ email: adminEmail });
      if (adminUser) {
        adminUser.role = "admin";
        await adminUser.save();
        console.log(`✅ Existing user ${adminEmail} promoted to admin`);
      } else {
        let firebaseUid = null;
        if (adminPassword) {
          try {
            let fbUser;
            try {
              fbUser = await admin.auth().getUserByEmail(adminEmail);
              console.log(`ℹ️  Firebase user already exists for ${adminEmail}`);
            } catch {
              fbUser = await admin.auth().createUser({
                email: adminEmail,
                password: adminPassword,
                displayName: adminName,
                emailVerified: true,
              });
              console.log(`✅ Firebase auth user created: ${adminEmail}`);
            }
            firebaseUid = fbUser.uid;
          } catch (fbErr) {
            console.error("⚠️  Failed to create Firebase admin:", fbErr.message);
          }
        }

        adminUser = await User.create({
          email: adminEmail,
          name: adminName,
          role: "admin",
          firebaseUid,
        });
        console.log(`✅ Admin user seeded: ${adminEmail}`);
      }
    }

    // Ensure Firebase Uid is linked for existing admin
    if (adminPassword && !adminUser.firebaseUid) {
      try {
        const fbUser = await admin.auth().getUserByEmail(adminEmail);
        adminUser.firebaseUid = fbUser.uid;
        await adminUser.save();
        console.log(`✅ Admin firebaseUid linked: ${fbUser.uid}`);
      } catch (fbErr) {
        console.warn("⚠️  Could not link admin Firebase UID:", fbErr.message);
      }
    }

    // 2. ── Seed Seller User & Profile ──
    const sellerEmail = "seller@cartnest.com";
    let sellerUser = await User.findOne({ email: sellerEmail });
    let sellerProfile = await SellerProfile.findOne({ shopSlug: "artisan-collective" });

    if (!sellerUser) {
      sellerUser = await User.create({
        email: sellerEmail,
        name: "Jane Doe (Seller)",
        role: "seller",
        isSeller: true,
      });
      console.log(`✅ Dummy seller user created: ${sellerEmail}`);
    }

    if (!sellerProfile) {
      sellerProfile = await SellerProfile.create({
        userId: sellerUser._id,
        userEmail: sellerEmail,
        shopName: "Artisan Collective",
        shopSlug: "artisan-collective",
        description: "A curated collection of handcrafted goods and style essentials from local creators.",
        logo: {
          public_id: "dummy/seller_logo",
          url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=200&q=80",
        },
      });
      console.log(`✅ Dummy seller profile created: Artisan Collective`);

      sellerUser.isSeller = true;
      sellerUser.role = "seller";
      sellerUser.sellerProfileId = sellerProfile._id;
      await sellerUser.save();
    }

    // 3. ── Seed Categories ──
    const defaultCategories = [
      { name: "Featured", description: "Hand-picked highlight products" },
      { name: "New", description: "Newly arrived products" },
      { name: "Home Decor", description: "Beautiful accessories and decor items for your home" },
      { name: "Food & Drink", description: "Organic ingredients and artisan prepared foodstuffs" },
      { name: "Women", description: "Apparel and lifestyle essentials for women" },
      { name: "Beauty & Wellness", description: "Skincare, cosmetics, and self-care items" },
      { name: "Jewelry", description: "Artisan rings, bracelets, and ornaments" },
      { name: "Kids & Baby", description: "Eco-friendly toys and baby accessories" },
      { name: "Men", description: "Apparel and lifestyle items for men" },
      { name: "Books", description: "Thoughtful titles and lifestyle reading" },
    ];

    const categoryMap = {};
    for (const cat of defaultCategories) {
      const slug = generateCleanSlug(cat.name);
      let existingCat = await Category.findOne({ slug });
      if (!existingCat) {
        existingCat = await Category.create({
          name: cat.name,
          slug,
          description: cat.description,
          createdBy: adminUser._id,
        });
        console.log(`✅ Category seeded: ${cat.name}`);
      }
      categoryMap[slug] = existingCat._id;
    }

    // 4. ── Seed Dummy Products ──
    const dummyProducts = [
      {
        title: "Artisan Ceramic Vase",
        description: "Handcrafted ceramic vase with a textured matte finish. Perfect for dry flowers or as a standalone design piece.",
        price: 2400,
        mrp: 2900,
        categorySlug: "home-decor",
        stock: 12,
        images: [
          {
            public_id: "dummy/ceramic-vase",
            url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80",
            alt: "Artisan Ceramic Vase",
          },
        ],
        tags: ["ceramics", "vase", "decor"],
      },
      {
        title: "Minimalist Wall Sconce",
        description: "Modern brass wall sconce with a soft diffusing shade. Adds warm ambient light to any living space.",
        price: 3800,
        mrp: 4500,
        categorySlug: "home-decor",
        stock: 8,
        images: [
          {
            public_id: "dummy/wall-sconce",
            url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
            alt: "Minimalist Wall Sconce",
          },
        ],
        tags: ["lighting", "sconce", "brass"],
      },
      {
        title: "Organic Herbal Tea Blend",
        description: "A calming blend of organic chamomile, lavender, and lemon balm. Caffeine-free and grown locally.",
        price: 650,
        mrp: 800,
        categorySlug: "food-drink",
        stock: 35,
        images: [
          {
            public_id: "dummy/herbal-tea",
            url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
            alt: "Organic Herbal Tea Blend",
          },
        ],
        tags: ["tea", "organic", "herbal"],
      },
      {
        title: "Artisanal Cold Pressed Olive Oil",
        description: "Extra virgin cold-pressed olive oil sourced from organic family groves. Rich, peppery flavor profile.",
        price: 1250,
        mrp: 1500,
        categorySlug: "food-drink",
        stock: 20,
        images: [
          {
            public_id: "dummy/olive-oil",
            url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
            alt: "Artisanal Cold Pressed Olive Oil",
          },
        ],
        tags: ["olive-oil", "artisanal", "cooking"],
      },
      {
        title: "Sterling Silver Leaf Ring",
        description: "Adjustable leaf-wrap ring handcrafted from recycled sterling silver. Delicate, nature-inspired, and elegant.",
        price: 1800,
        mrp: 2200,
        categorySlug: "jewelry",
        stock: 15,
        images: [
          {
            public_id: "dummy/silver-ring",
            url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
            alt: "Sterling Silver Leaf Ring",
          },
        ],
        tags: ["ring", "silver", "jewelry"],
      },
      {
        title: "Lavender Soy Candle",
        description: "Hand-poured soy wax candle infused with natural lavender essential oil. Provides 40 hours of relaxing burn time.",
        price: 850,
        mrp: 990,
        categorySlug: "beauty-wellness",
        stock: 25,
        images: [
          {
            public_id: "dummy/lavender-candle",
            url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
            alt: "Lavender Soy Candle",
          },
        ],
        tags: ["candle", "lavender", "soy"],
      },
      {
        title: "The Art of Slow Living",
        description: "A beautifully photographed guide to finding balance, simplicity, and mindfulness in everyday life.",
        price: 1100,
        mrp: 1250,
        categorySlug: "books",
        stock: 10,
        images: [
          {
            public_id: "dummy/slow-living-book",
            url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
            alt: "The Art of Slow Living Book",
          },
        ],
        tags: ["book", "slow-living", "lifestyle"],
      },
      {
        title: "Wooden Rainbow Stacker",
        description: "Eco-friendly wooden rainbow stacking toy painted with non-toxic water-based colors. Promotes fine motor skills.",
        price: 1450,
        mrp: 1800,
        categorySlug: "kids-baby",
        stock: 14,
        images: [
          {
            public_id: "dummy/rainbow-stacker",
            url: "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=600&q=80",
            alt: "Wooden Rainbow Stacker",
          },
        ],
        tags: ["toy", "wooden", "rainbow"],
      },
    ];

    for (const prod of dummyProducts) {
      const slug = generateCleanSlug(prod.title);
      let existingProd = await Product.findOne({ slug });
      if (!existingProd) {
        const categoryId = categoryMap[prod.categorySlug];
        if (categoryId) {
          existingProd = await Product.create({
            sellerId: sellerProfile._id,
            sellerEmail: sellerEmail,
            title: prod.title,
            slug,
            description: prod.description,
            price: prod.price,
            mrp: prod.mrp,
            categoryId,
            stock: prod.stock,
            images: prod.images,
            tags: prod.tags,
            verified: true,
            verificationState: "verified",
            status: "active",
          });
          console.log(`✅ Product seeded: ${prod.title}`);
        }
      }
    }

    console.log("✅ Database seeding completed successfully.");
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
  }
};

module.exports = { seedAdmin };
