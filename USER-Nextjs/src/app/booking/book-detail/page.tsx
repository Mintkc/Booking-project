"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createBooking } from "@/utils/api";
import { Calendar, Package, MapPin, CheckCircle, User, Clock, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";

// ✅ กำหนด Type ให้ชัดเจน
interface UserType {
    _id: string;
    fullname: string;
    email: string;
    fieldOfStudy: string;
    year: string;
}

interface Equipment {
    equipmentId: string;
    name: string;
    quantity: number;
}

const BookingDetailPage = () => {
    return (
        <Suspense fallback={<p className="text-center text-gray-500">Loading...</p>}>
            <BookingDetail />
        </Suspense>
    );
};

const BookingDetail = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const stadiumName = searchParams?.get("stadiumName") ?? "ไม่พบชื่อสนาม";
    const stadiumId = searchParams?.get("stadiumId") ?? "";
    const startDate = searchParams?.get("startDate") ?? "";
    const endDate = searchParams?.get("endDate") ?? "";
    const equipmentQuery = searchParams?.get("equipment");
    const startTime = searchParams?.get("startTime") ?? "";
    const endTime = searchParams?.get("endTime") ?? "";

    // ✅ กำหนด Type ให้ `selectedEquipment`
    const selectedEquipment: Equipment[] = equipmentQuery ? JSON.parse(equipmentQuery) : [];

    // ✅ กำหนด type `User | null` ให้ชัดเจน
    const [user, setUser] = useState<UserType | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setLoadingUser(true);
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser: UserType = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (error) {
                    console.error("❌ Error parsing user JSON:", error);
                    localStorage.removeItem("user");
                }
            }
            setLoadingUser(false);
        }

    }, []);

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/home");
        }
    };

    const handleBooking = async () => {
        if (!user) {
            alert("⛔ กรุณาเข้าสู่ระบบก่อนทำการจอง");
            return;
        }

        try {
            const bookingData = {
                userId: user._id,
                stadiumId,
                startDate,
                endDate,
                startTime, // ✅ เพิ่มเวลาเริ่มต้น
                endTime,   // ✅ เพิ่มเวลาสิ้นสุด
                equipment: selectedEquipment.map(({ equipmentId, quantity }) => ({
                    equipmentId,
                    quantity,
                })),
            };

            // console.log("📦 Booking Payload:", bookingData);

            const response = await createBooking(bookingData);
            // console.log("📩 API Response:", response);

            if (response?.success) {
                toast.success("✅ จองสำเร็จ");
                router.push("/booking/history");
            } else {
                alert(response.message || "❌ เกิดข้อผิดพลาด");
            }
        } catch (error) {
            console.error("❌ Booking Error:", error);
            alert("❌ จองไม่สำเร็จ กรุณาลองใหม่");
        }
    };

    return (
        <div className="p-5 font-kanit max-w-[670px] mx-auto">
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-orange-500 font-semibold mb-4"
            >
                <ArrowLeft size={20} />
                ย้อนกลับ
            </button>
            <h1 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
                <CheckCircle size={24} className="text-orange-500" /> ยืนยันการจอง
            </h1>

            <div className="bg-white p-4 rounded-md shadow-md mb-4 border-2 border-orange-300">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <MapPin className="text-orange-500" size={20} /> สนามที่จอง
                </h2>
                <p className="text-gray-700 text-md">{stadiumName}</p>
            </div>

            {/* ✅ แสดงวันที่ & เวลา */}
            <div className="bg-white p-4 rounded-md shadow-md mb-4 border-2 border-orange-300">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Calendar className="text-orange-500" size={20} /> ข้อมูลวันที่จอง
                </h2>
                <p className="text-gray-700">เริ่มวันที่: {dayjs(startDate).format("DD/MM/YYYY")}</p>
                <p className="text-gray-700">สิ้นสุดวันที่: {dayjs(endDate).format("DD/MM/YYYY")}</p>
                <p className="text-gray-700 flex items-center gap-2 mt-2">
                    <Clock className="text-orange-500" size={18} /> เวลา: {startTime} - {endTime}
                </p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-md mb-4 border-2 border-orange-300">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Package className="text-orange-500" size={20} /> รายการอุปกรณ์
                </h2>
                {selectedEquipment.length > 0 ? (
                    <ul className="text-gray-700 space-y-1">
                        {selectedEquipment.map((item, index) => (
                            <li key={index} className="text-md">
                                {item.name} <span className="text-gray-500">x{item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">ไม่ได้เลือกอุปกรณ์</p>
                )}
            </div>

            {loadingUser ? (
                <p className="text-gray-500 mb-10">กำลังโหลดข้อมูลผู้ใช้...</p>
            ) : user ? (
                <div className="bg-white p-4 rounded-md shadow-md mb-4 border-2 border-orange-300">
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <User className="text-orange-500" size={20} /> ข้อมูลผู้จอง
                    </h2>
                    <p className="text-gray-700">ชื่อผู้จอง: {user.fullname}</p>
                    <p className="text-gray-700">Email: {user.email}</p>
                    <p className="text-gray-700">สาขาวิชา: {user.fieldOfStudy}</p>
                    <p className="text-gray-700">ปีเรียน: {user.year}</p>
                </div>
            ) : (
                <p className="text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
            )}
            <div className="max-w-[670px] mx-auto fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex items-center justify-center rounded-t-xl">
                <button
                    onClick={handleBooking}
                    className="w-full max-w-xs px-6 py-3 rounded-xl text-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                    จองเลย
                </button>
            </div>

        </div>
    );
};

export default BookingDetailPage;
