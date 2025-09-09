import Booking from "../models/Booking.js";
import Equipment from "../models/Equipment.js";
import Stadium from "../models/Stadium.js";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import 'dayjs/locale/th.js'

dayjs.extend(isBetween);
dayjs.locale('th');
dayjs.extend(utc);
dayjs.extend(timezone);
// ตั้งค่า default timezone เป็น Asia/Bangkok
dayjs.tz.setDefault("Asia/Bangkok");

// ✅ จองสนามและอุปกรณ์
export const bookStadium = async (req, res) => {
    try {
        const { userId, stadiumId, equipment = [], startDate, endDate, startTime, endTime } = req.body;

        console.log("📌 Received Request Data:", { userId, stadiumId, startDate, endDate, startTime, endTime, equipment });

        // ✅ ตรวจสอบว่า Stadium มีอยู่หรือไม่
        const stadium = await Stadium.findById(stadiumId);
        if (!stadium) {
            return res.status(404).json({ message: "Stadium not found" });
        }

        // ✅ ตรวจสอบว่า `startTime` ต้องน้อยกว่า `endTime`
        if (startTime >= endTime) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        // ✅ แปลง `startDate` และ `endDate` เป็น Date Object
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        // ✅ ตรวจสอบว่ามีการจองที่ทับซ้อนกันหรือไม่
        let currentDate = new Date(start);
        let overlappingDates = [];

        while (currentDate <= end) {
            const formattedDate = new Date(currentDate).toISOString().split("T")[0]; // ดึงเฉพาะวันที่

            const overlappingBooking = await Booking.findOne({
                stadiumId,
                status: { $in: ["pending", "confirmed"] },
                startDate: formattedDate,
                $or: [
                    { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }] }
                ]
            });

            if (overlappingBooking) {
                overlappingDates.push(formattedDate);
            }

            currentDate.setDate(currentDate.getDate() + 1); // เพิ่มวัน
        }

        if (overlappingDates.length > 0) {
            return res.status(400).json({
                message: "This stadium is already booked on these dates",
                overlappingDates
            });
        }

        // ✅ ตรวจสอบอุปกรณ์ที่ไม่พอ
        if (equipment.length > 0) {
            const unavailableEquipments = [];
            for (const item of equipment) {
                const dbEquipment = await Equipment.findById(item.equipmentId);
                if (!dbEquipment || dbEquipment.status !== "available" || dbEquipment.quantity < item.quantity) {
                    unavailableEquipments.push({
                        equipmentId: item.equipmentId,
                        message: "Not enough quantity or unavailable"
                    });
                }
            }
            if (unavailableEquipments.length > 0) {
                return res.status(400).json({
                    message: "Some equipment is unavailable",
                    unavailableEquipments
                });
            }

            // ✅ อัปเดตจำนวนอุปกรณ์
            for (const item of equipment) {
                await Equipment.findByIdAndUpdate(item.equipmentId, {
                    $inc: { quantity: -item.quantity }
                });
            }
        }

        // ✅ บันทึกการจองเพียง **1 รายการ**
        const newBooking = new Booking({
            userId,
            stadiumId,
            equipment,
            startDate: start,
            endDate: end,
            startTime,
            endTime,
            status: "pending"
        });

        await newBooking.save();

        // ✅ อัปเดตสถานะสนามกีฬา
        const activeBookings = await Booking.find({ stadiumId, status: { $ne: "canceled" } });
        stadium.statusStadium = activeBookings.length > 0 ? "IsBooking" : "Available";
        await stadium.save();

        res.status(201).json({
            message: "Stadium booked successfully",
            success: true,
            booking: newBooking
        });
    } catch (error) {
        console.error("🚨 Server Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("stadiumId", "nameStadium descriptionStadium")
            .populate("equipment.equipmentId", "name quantity")
            .populate("userId", "fullname phoneNumber email fieldOfStudy year");

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ ฟังก์ชันดึงวันที่ว่างและติดจอง
export const getAvailableDates = async (req, res) => {
    try {
        const { stadiumId, year, month } = req.query;

        if (!stadiumId || !year || !month) {
            return res.status(400).json({ message: "stadiumId, year, and month จำเป็นต้องระบุ" });
        }

        const today = dayjs().format("YYYY-MM-DD"); // วันที่ปัจจุบัน
        const startOfMonth = dayjs(`${year}-${month}-01`).startOf("month");
        const endOfMonth = dayjs(`${year}-${month}-01`).endOf("month");

        const stadium = await Stadium.findById(stadiumId);
        if (!stadium) {
            return res.status(404).json({ message: "ไม่พบข้อมูลสนาม" });
        }

        // ✅ ถ้าสนามสถานะเป็น "active" ให้ทุกวันว่างหมด
        if (stadium.statusStadium === "active") {
            const totalDaysInMonth = endOfMonth.date();
            const availableDates = [];

            for (let day = 1; day <= totalDaysInMonth; day++) {
                const date = dayjs(`${year}-${month}-${day}`).format("YYYY-MM-DD");
                availableDates.push({
                    date,
                    status: dayjs(date).isBefore(today, "day") ? "ไม่ได้" : "ว่าง",
                });
            }

            return res.status(200).json({ availableDates, bookedDates: [] });
        }

        // ✅ ดึงรายการจองของเดือนนี้
        const bookings = await Booking.find({
            stadiumId,
            status: { $in: ["confirmed", "pending"] },
            $or: [
                { startDate: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() } },
                { endDate: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() } },
                {
                    $and: [
                        { startDate: { $lte: startOfMonth.toDate() } },
                        { endDate: { $gte: endOfMonth.toDate() } },
                    ],
                },
            ],
        });

        // ✅ เก็บวันที่จอง
        const bookedDates = new Set();

        bookings.forEach((booking) => {
            let currentDate = dayjs(booking.startDate);
            const endDate = dayjs(booking.endDate);

            while (currentDate.isBefore(endDate, "day") || currentDate.isSame(endDate, "day")) {
                if (currentDate.isBetween(startOfMonth, endOfMonth, "day", "[]")) {
                    bookedDates.add(currentDate.format("YYYY-MM-DD"));
                }
                currentDate = currentDate.add(1, "day");
            }
        });

        // ✅ วนลูปสร้างวันที่ทั้งหมดในเดือน
        const totalDaysInMonth = endOfMonth.date();
        const responseDates = [];

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const date = dayjs(`${year}-${month}-${day}`).format("YYYY-MM-DD");

            if (bookedDates.has(date)) {
                responseDates.push({ date, status: "ไม่ว่าง" });
            } else if (dayjs(date).isBefore(today, "day")) {
                responseDates.push({ date, status: "ไม่ได้" });
            } else {
                responseDates.push({ date, status: "ว่าง" });
            }
        }

        res.status(200).json({ dates: responseDates });
    } catch (error) {
        console.error("❌ Error fetching available dates:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


export const getBookingByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const bookings = await Booking.find({ userId })
            .populate("stadiumId", "nameStadium descriptionStadium")
            .populate("equipment.equipmentId", "name quantity")
            .populate("userId", "fullname phoneNumber email fieldOfStudy year");

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this user" });
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


// ✅ ยืนยันการจอง
export const confirmBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = "confirmed";
        await booking.save();

        res.status(200).json({ message: "Booking confirmed successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ ยกเลิกการจอง พร้อมคืนค่าอุปกรณ์และรีเซ็ตสนาม
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("equipment.equipmentId");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === "canceled") {
            return res.status(400).json({ message: "Booking is already canceled" });
        }

        // ✅ 1. คืนค่าอุปกรณ์ที่ถูกใช้
        for (const item of booking.equipment) {
            const equipment = await Equipment.findById(item.equipmentId._id);
            if (equipment) {
                await Equipment.findByIdAndUpdate(item.equipmentId._id, {
                    status: "available",
                    $inc: { quantity: item.quantity }, // เพิ่มจำนวนอุปกรณ์กลับเข้าไป
                });
            }
        }

        // ✅ 2. เปลี่ยนสถานะสนามจาก "IsBooking" เป็น "active"
        const stadium = await Stadium.findById(booking.stadiumId);
        if (stadium && stadium.statusStadium === "IsBooking") {
            await Stadium.findByIdAndUpdate(booking.stadiumId, { statusStadium: "active" });
        }

        // ✅ 3. เปลี่ยนสถานะ Booking เป็น "canceled"
        booking.status = "canceled";
        await booking.save();

        res.status(200).json({
            message: "Booking canceled successfully, equipment and stadium reset",
            booking,
        });
    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


// ✅ ดึงประวัติการจองที่มีสถานะ "Return Success"
export const getReturnedBookings = async (req, res) => {
    try {
        const returnedBookings = await Booking.find({ status: "Return Success" })
            .populate("userId", "fullname phoneNumber email fieldOfStudy year") // ดึงข้อมูลผู้ใช้
            .populate("stadiumId", "nameStadium descriptionStadium") // ดึงข้อมูลสนามกีฬา
            .populate("equipment.equipmentId", "name quantity"); // ดึงข้อมูลอุปกรณ์

        if (returnedBookings.length === 0) {
            return res.status(404).json({ message: "No returned bookings found" });
        }

        res.status(200).json(returnedBookings);
    } catch (error) {
        console.error("Error fetching returned bookings:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


// Controller to get booking statistics per month
export const getMonthlyBookingStats = async (req, res) => {
    try {
        // Aggregate data to calculate monthly booking counts
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$startDate" },
                        month: { $month: "$startDate" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
            },
            {
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    _id: 0, // Exclude the default `_id`
                },
            },
        ]);

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching monthly booking stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const resetBookingStatus = async (req, res) => {
    try {
        const { id } = req.params; // รับ ID ของ Booking จาก URL

        // ดึงข้อมูลการจอง
        const booking = await Booking.findById(id).populate("equipment.equipmentId");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status !== "confirmed") {
            return res.status(400).json({ message: "Only confirmed bookings can be reset" });
        }

        // Reset Stadium Status
        await Stadium.findByIdAndUpdate(booking.stadiumId, { statusStadium: "active" });

        // Reset Equipment Status
        for (const item of booking.equipment) {
            const equipment = await Equipment.findById(item.equipmentId._id);
            if (equipment) {
                await Equipment.findByIdAndUpdate(item.equipmentId._id, {
                    status: "available",
                    $inc: { quantity: item.quantity }, // คืนจำนวนอุปกรณ์ที่ถูกใช้
                });
            }
        }

        // อัปเดตสถานะ Booking
        booking.status = "Return Success";
        await booking.save();

        res.status(200).json({ message: "Booking and stadium reset successfully", booking });
    } catch (error) {
        console.error("Error resetting booking status:", error);
        res.status(500).json({ message: "Server error", error });
    }
};