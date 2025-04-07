import { storage } from "../storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }
    
    // Create admin user
    const adminUser = await storage.createUser({
      username: "admin",
      email: "admin@xraynama.com",
      password: await hashPassword("admin123"),
      name: "مدیر سیستم",
      role: "admin"
    });
    
    console.log("Admin user created successfully:", adminUser);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function
createAdminUser();