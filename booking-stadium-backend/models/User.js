import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true }, // ✅ เพิ่มเบอร์โทรศัพท์
    fieldOfStudy: { type: String, required: true },
    year: { type: Number, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    blockUntil: { type: Date, default: null } // ✅ เพิ่มฟิลด์เก็บวันหมดอายุของการบล็อก
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;
