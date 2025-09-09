import express from "express";
import { createEquipment, getEquipments, deleteEquipment, updateEquipment } from "../controllers/equipmentController.js";

const router = express.Router();

router.post("/", createEquipment);
router.get("/", getEquipments);
router.delete("/:id", deleteEquipment);
router.put("/:id", updateEquipment);

export default router;
