import Equipment from "../models/Equipment.js";

// ✅ เพิ่มอุปกรณ์ใหม่
export const createEquipment = async (req, res) => {
    try {
        const newEquipment = new Equipment(req.body);
        await newEquipment.save();
        res.status(201).json({ message: "Equipment added successfully", newEquipment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ แก้ไขอุปกรณ์
export const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, status } = req.body;

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            id,
            { name, quantity, status },
            { new: true, runValidators: true }
        );

        if (!updatedEquipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        res.status(200).json({ message: "Equipment updated successfully", updatedEquipment });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ ดึงข้อมูลอุปกรณ์ทั้งหมด
export const getEquipments = async (req, res) => {
    try {
        const equipments = await Equipment.find();
        res.status(200).json(equipments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ ลบอุปกรณ์
export const deleteEquipment = async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Equipment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
