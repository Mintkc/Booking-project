import Stadium from "../models/Stadium.js";

// ✅ เพิ่ม Stadium
export const createStadium = async (req, res) => {
    try {
        const newStadium = new Stadium(req.body);
        await newStadium.save();
        res.status(201).json({ message: "Stadium created successfully", newStadium });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ ดึงข้อมูล Stadium ทั้งหมด
export const getStadiums = async (req, res) => {
    try {
        const stadiums = await Stadium.find();
        res.status(200).json(stadiums);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ อัปเดต Stadium
export const updateStadium = async (req, res) => {
    try {
        // ค้นหา Stadium
        const stadium = await Stadium.findById(req.params.id);
        if (!stadium) return res.status(404).json({ message: "Stadium not found" });

        // ตรวจสอบสถานะ IsBooking
        if (stadium.statusStadium === "IsBooking") {
            return res.status(400).json({ message: "Cannot update stadium. Stadium is currently booked (IsBooking)." });
        }

        // อัปเดตข้อมูล Stadium
        const updatedStadium = await Stadium.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Stadium updated successfully", updatedStadium });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ ลบ Stadium
export const deleteStadium = async (req, res) => {
    try {
        // ค้นหา Stadium
        const stadium = await Stadium.findById(req.params.id);
        if (!stadium) return res.status(404).json({ message: "Stadium not found" });

        // ตรวจสอบสถานะ IsBooking
        if (stadium.statusStadium === "IsBooking") {
            return res.status(400).json({ message: "Cannot delete stadium. Stadium is currently booked (IsBooking)." });
        }

        // ลบ Stadium
        await Stadium.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Stadium deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};