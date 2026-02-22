require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { AdminModel } = require("./models/admin.model");

mongoose.connect(process.env.dbURL)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

async function createAdmin() {
  const existing = await AdminModel.findOne({ email: "admin@gmail.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("1234", +process.env.Salt_rounds);

  const admin = new AdminModel({
    name: "Super Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
  });

  await admin.save();
  console.log("Admin created successfully");
  process.exit();
}

createAdmin();
