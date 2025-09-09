import express from "express";
import { createStaff, deleteStaff, updateStaff, getAllStaff, loginStaff} from "../controllers/staffController.js";

const router = express.Router();

// ✅ สร้างพนักงานใหม่
router.post("/", createStaff);

// ✅ ลบพนักงาน
router.delete("/:id", deleteStaff);

// ✅ แก้ไขข้อมูลพนักงาน
router.put("/:id", updateStaff);

// ✅ ดูข้อมูลพนักงานทั้งหมด
router.get("/", getAllStaff);

// ✅ Login พนักงาน
router.post("/login", loginStaff);


export default router;
