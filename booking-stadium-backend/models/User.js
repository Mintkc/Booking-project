// booking-stadium-backend/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // ไม่บังคับ + ใช้ unique แบบ sparse กันชนกันเวลาค่าว่าง
    phoneNumber: { type: String, unique: true, sparse: true, trim: true },
    fieldOfStudy: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1 },
    password: { type: String, required: true, minlength: 6 },
    blockUntil: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
