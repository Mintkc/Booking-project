import express from "express";
import {
  createStadium,
  getStadiums,
  updateStadium,
  deleteStadium,
} from "../controllers/stadiumController.js";
import Stadium from "../models/Stadium.js";
import path from "path";
import fs from "fs";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/** ---------- Stadium CRUD ---------- */
router.get("/", getStadiums);
router.post("/", createStadium);                 // สร้างสนาม (ยังไม่บังคับรูป)
router.put("/:id", updateStadium);
router.delete("/:id", deleteStadium);

/** ---------- Upload Stadium Image ---------- */
// อัปโหลดรูปและตั้งค่า imageUrl ให้สนาม
router.post("/:id/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "ไม่พบไฟล์ภาพ" });

    // พาธสาธารณะสำหรับ FE
    const publicPath = `/uploads/stadiums/${req.file.filename}`;

    const stadium = await Stadium.findByIdAndUpdate(
      req.params.id,
      { imageUrl: publicPath },
      { new: true }
    );
    if (!stadium) return res.status(404).json({ message: "ไม่พบสนามกีฬา" });

    res.json({ message: "อัปโหลดรูปสำเร็จ", stadium });
  } catch (err) {
    res.status(500).json({ message: "อัปโหลดไม่สำเร็จ", error: err.message });
  }
});

/** ---------- Delete Stadium Image ---------- */
router.delete("/:id/image", async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) return res.status(404).json({ message: "ไม่พบสนามกีฬา" });

    // ลบไฟล์จริงถ้ามี (ต้องตัด / นำหน้าออกก่อน join)
    if (stadium.imageUrl) {
      const relative = stadium.imageUrl.replace(/^[\\/]/, ""); // ตัด / นำหน้า
      const filePath = path.join(process.cwd(), relative);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    stadium.imageUrl = "";
    await stadium.save();

    res.json({ message: "ลบรูปสำเร็จ", stadium });
  } catch (err) {
    res.status(500).json({ message: "ลบรูปไม่สำเร็จ", error: err.message });
  }
});

export default router;
