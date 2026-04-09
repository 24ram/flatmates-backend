const pool = require("./src/config/db");
require("dotenv").config();

const listings = [
  {
    title: "Cozy Studio in Bandra West",
    description: "Fully furnished studio apartment with a sea-facing balcony. Perfect for a working professional. WiFi, AC, and daily housekeeping included.",
    rent: 18000,
    city: "Mumbai",
    location: "Bandra West",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
    ],
    amenities: ["WiFi", "AC", "Furnished", "Balcony", "Kitchen"],
    owner_email: "priya@test.com",
    smoking_ok: false,
    pets_ok: true,
  },
  {
    title: "Spacious 2BHK in Andheri East",
    description: "Looking for one flatmate to share a 2BHK. Clean, well-maintained apartment near metro station. Ideal for professionals.",
    rent: 14000,
    city: "Mumbai",
    location: "Andheri East",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
    amenities: ["WiFi", "Parking", "Laundry", "Kitchen", "Security"],
    owner_email: "rohan@test.com",
    smoking_ok: false,
    pets_ok: false,
  },
  {
    title: "Modern Room in Koramangala",
    description: "Private room in a friendly flatshare. High-speed internet, fully equipped kitchen. 5 min walk from restaurants and cafes.",
    rent: 12000,
    city: "Bangalore",
    location: "Koramangala 5th Block",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    ],
    amenities: ["WiFi", "AC", "Furnished", "Kitchen", "Gym"],
    owner_email: "anika@test.com",
    smoking_ok: false,
    pets_ok: true,
  },
  {
    title: "Premium Room in Hauz Khas Village",
    description: "Stunning room in Delhi's most vibrant neighbourhood. Art studios, cafes, and the lake all within walking distance.",
    rent: 20000,
    city: "Delhi",
    location: "Hauz Khas",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
    ],
    amenities: ["WiFi", "AC", "Furnished", "Balcony", "Pool"],
    owner_email: "karan@test.com",
    smoking_ok: true,
    pets_ok: false,
  },
  {
    title: "Quiet 1BHK in Kothrud",
    description: "Peaceful, clean apartment for a female professional or student. Library access, no loud music. Great for focused work.",
    rent: 11000,
    city: "Pune",
    location: "Kothrud",
    images: [
      "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&q=80",
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
    ],
    amenities: ["WiFi", "AC", "Kitchen", "Security", "Laundry"],
    owner_email: "meera@test.com",
    smoking_ok: false,
    pets_ok: false,
  },
];

async function seedListings() {
  console.log("🏠 Seeding listings...\n");

  for (const l of listings) {
    try {
      // Get owner id
      const user = await pool.query("SELECT id FROM users WHERE email = $1", [l.owner_email]);
      if (!user.rows[0]) {
        console.log(`⏭️  Skipping "${l.title}" — owner ${l.owner_email} not found`);
        continue;
      }

      // Check if listing already exists
      const exists = await pool.query(
        "SELECT id FROM listings WHERE title = $1 AND owner_id = $2",
        [l.title, user.rows[0].id]
      );
      if (exists.rows.length > 0) {
        console.log(`⏭️  Skipping "${l.title}" (already exists)`);
        continue;
      }

      await pool.query(
        `INSERT INTO listings (title, description, rent, city, location, images, amenities, owner_id, smoking_ok, pets_ok)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [l.title, l.description, l.rent, l.city, l.location, l.images, l.amenities, user.rows[0].id, l.smoking_ok, l.pets_ok]
      );
      console.log(`✅ "${l.title}" — ₹${l.rent}/mo in ${l.city}`);
    } catch (err) {
      console.error(`❌ Failed "${l.title}":`, err.message);
    }
  }

  console.log("\n🎉 Listings seeded! Visit /listings to see them.");
  await pool.end();
}

seedListings();
