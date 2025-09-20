import express from "express";
import { createStadium, getStadiums, updateStadium, deleteStadium } from "../controllers/stadiumController.js";

import multer from "multer";
import path from "path";
import fs from "fs";
import Stadium from "../models/Stadium.js";
import { message } from "hawk/lib/client.js";

const router = express.Router();

//------------Multer Config----------------
const STADIUM_DIR = path.join(process.cwd(), "uploads",  "stadiums");
fs.mkdirSync(STADIUM_DIR, { recursive: true});

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, STADIUM_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
        cb(null, `${base}-${Date.now()}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error("รองรับเฉพาะไฟล์ภาพ"), ok);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024}
});

//---------------- Stadium CRUD ---------------
router.post("/", createStadium);
router.get("/", getStadiums);
router.put("/:id", updateStadium);
router.delete("/:id", deleteStadium);

//----------------- Upload Stadium Image ------------
router.post("/:id/image", upload.single("image"), async (req, res) => {
    try{
        if (!req.file) return res.status(400).json({message:"ไม่พบไฟล์ภาพ"});

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

//--------------  Delete Stadium Image -----------------------
router.delete("/:id/image", async (req, res) => {
    try {
        const stadium = await Stadium.findById(req.params.id);
        if (!stadium) return res.status(404).json({ message: "ไม่พบสนามกีฬา"});

        //ลบไฟล์จริงออกถ้ามี
        if (stadium.imageUrl) {
            const filePath = path.join(process.cwd(), stadium.imageUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        stadium.imageUrl = "";
        await stadium.save();

        res.json({ message: "ลบรูปสำเร็จ", stadium });
    } catch (err) {
        res.status(500).json({message: "ลบรูปสำเร็จ", error: err.message });
    }
});
export default router;
