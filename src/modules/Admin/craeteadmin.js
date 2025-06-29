import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import AdminModel from "../../../DB/models/admin.model.js";
dotenv.config();
async function createAdmin() {
  try {
    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Admin";
    const existingAdmin = await AdminModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists:", adminEmail);
      process.exit(0);
    }
    const saltRounds = parseInt(process.env.SALT_ROUND) || 10;
    const hashedPassword = await bcrypt.hash(adminPassword, 8);

    const admin = new AdminModel({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
    });
    await admin.save();
    console.log("Admin created successfully with email:", adminEmail);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}
createAdmin();
//node src/modules/Admin/admin.controller.js