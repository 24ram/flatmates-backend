require("dotenv").config();
const pool = require("./src/config/db");
const bcrypt = require("bcryptjs");

const testUsers = [
  {
    name: "Priya Sharma",
    email: "priya@test.com",
    password: "password123",
    gender: "Female",
    age: 24,
    budget: 15000,
    city: "Mumbai",
    location: "Bandra West",
    lifestyle: "Active",
    smoking: false,
    pets: true,
    bio: "Love cooking and yoga. Looking for a clean peaceful flatmate.",
    sleep_time: 23,
    cleanliness: 5,
    social_level: 3,
    occupation: "Designer",
  },
  {
    name: "Rohan Mehta",
    email: "rohan@test.com",
    password: "password123",
    gender: "Male",
    age: 26,
    budget: 18000,
    city: "Mumbai",
    location: "Andheri East",
    lifestyle: "Chill",
    smoking: false,
    pets: false,
    bio: "Software dev, work from home. Keep the house clean and quiet.",
    sleep_time: 24,
    cleanliness: 4,
    social_level: 2,
    occupation: "Engineer",
  },
  {
    name: "Anika Verma",
    email: "anika@test.com",
    password: "password123",
    gender: "Female",
    age: 23,
    budget: 12000,
    city: "Bangalore",
    location: "Koramangala",
    lifestyle: "Social",
    smoking: false,
    pets: true,
    bio: "New to the city, looking for friendly flatmates!",
    sleep_time: 22,
    cleanliness: 4,
    social_level: 5,
    occupation: "Marketing",
  },
  {
    name: "Karan Singh",
    email: "karan@test.com",
    password: "password123",
    gender: "Male",
    age: 28,
    budget: 20000,
    city: "Delhi",
    location: "Hauz Khas",
    lifestyle: "Active",
    smoking: true,
    pets: false,
    bio: "Freelance photographer. Travel a lot, mostly need a crash pad.",
    sleep_time: 2,
    cleanliness: 3,
    social_level: 4,
    occupation: "Photographer",
  },
  {
    name: "Meera Iyer",
    email: "meera@test.com",
    password: "password123",
    gender: "Female",
    age: 25,
    budget: 14000,
    city: "Pune",
    location: "Kothrud",
    lifestyle: "Quiet",
    smoking: false,
    pets: false,
    bio: "PhD student. Need a quiet study-friendly environment.",
    sleep_time: 22,
    cleanliness: 5,
    social_level: 2,
    occupation: "Student",
  },
];

async function seed() {
  console.log("🌱 Seeding test users...\n");

  for (const user of testUsers) {
    try {
      const existing = await pool.query("SELECT id FROM users WHERE email = $1", [user.email]);
      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping ${user.name} (already exists)`);
        continue;
      }

      const hashed = await bcrypt.hash(user.password, 10);
      const result = await pool.query(
        `INSERT INTO users
          (name, email, password, gender, age, budget, city, location, lifestyle,
           smoking, pets, bio, sleep_time, cleanliness, social_level, occupation)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         RETURNING id, name, email`,
        [
          user.name, user.email, hashed, user.gender, user.age,
          user.budget, user.city, user.location, user.lifestyle,
          user.smoking, user.pets, user.bio,
          user.sleep_time, user.cleanliness, user.social_level, user.occupation,
        ]
      );
      console.log(`✅ Created: ${result.rows[0].name} (id: ${result.rows[0].id})`);
    } catch (err) {
      console.error(`❌ Failed ${user.name}:`, err.message);
    }
  }

  console.log("\n🎉 Done! Login with any test account:");
  testUsers.forEach(u => console.log(`   ${u.email} / ${u.password}`));
  await pool.end();
}

seed();
