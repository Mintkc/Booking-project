import express from "express";
import { createStadium, getStadiums, updateStadium, deleteStadium } from "../controllers/stadiumController.js";

const router = express.Router();

router.post("/", createStadium);
router.get("/", getStadiums);
router.put("/:id", updateStadium);
router.delete("/:id", deleteStadium);

export default router;
