"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllStadiums } from "@/utils/api";
import { toast } from "react-toastify";
import { Volleyball, Clock, PhoneCall } from "lucide-react";
import Image from "next/image"; // ✅ ใช้ next/image

const menuItems = [
    { id: "stadiums", label: "จองสนาม", icon: <Volleyball size={24} className="text-orange-500" /> },
    // { id: "quick-book", label: "จองสนามด่วน", icon: <Clock size={24} className="text-gray-500" /> },
    // { id: "contact", label: "ช่องทางติดต่อ", icon: <PhoneCall size={24} className="text-gray-500" /> },
];

const Booking = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("stadiums");
    const [stadiums, setStadiums] = useState([]);
    const [selectedStadiumId, setSelectedStadiumId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null); // ✅ เพิ่ม state เก็บ userId

    // ✅ โหลดข้อมูลสนาม
    useEffect(() => {
        const fetchStadiums = async () => {
            try {
                const data = await getAllStadiums();
                setStadiums(data);
            } catch (error) {
                toast.error("โหลดข้อมูลสนามไม่สำเร็จ");
            }
        };
        fetchStadiums();

        // ✅ ดึง userId จาก localStorage และตรวจสอบค่าก่อนใช้ JSON.parse()
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserId(parsedUser._id);
            } catch (error) {
                console.error("❌ Error parsing user JSON:", error);
                localStorage.removeItem("user"); // 🛠 ลบข้อมูลที่เสียหายออก
            }
        }
    }, []);

    // ✅ ฟังก์ชันแจ้งเตือน
    const handleComingSoon = () => toast.info("🚀 ฟังก์ชันนี้กำลังอัปเดต");

    // ✅ เมื่อกดปุ่ม "จองสนามนี้"
    const handleSelectStadium = (stadiumId: string, stadiumName: string) => {
        if (!userId) {
            toast.error("⛔ กรุณาเข้าสู่ระบบก่อนจองสนาม");
            return;
        }

        router.push(`/booking/selectDate?stadiumId=${stadiumId}&stadiumName=${encodeURIComponent(stadiumName)}&userId=${userId}`);
    };

    return (
        <div className="p-1 pt-20 font-kanit mb-20 max-w-[670px] mx-auto">
            {/* เมนูตัวเลือก */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => (item.id === "stadiums" ? setActiveTab("stadiums") : handleComingSoon())}
                        className={`flex flex-col items-center justify-center p-3 rounded-sm shadow-md transition-all
                        ${activeTab === item.id ? "border-2 border-orange-500 bg-white" : "bg-white"}
                        `}
                    >
                        {item.icon}
                        <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* แสดงข้อมูลสนาม */}
            {activeTab === "stadiums" && (
                <div>
                    <h1 className="text-base mb-4 text-start text-gray-800">รายการสนามทั้งหมด</h1>
                    <div className="grid grid-cols-2 gap-4">
                        {stadiums.map((stadium: any) => (
                            <div key={stadium._id} className="border rounded-sm shadow-md bg-white overflow-hidden">
                                {/* ✅ รูปสนาม */}
                                <div className="relative w-full h-24">
                                    <img
                                        src="/images/football-field.png"
                                        alt="สนามฟุตบอล"
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                                {/* ✅ ข้อมูลสนาม */}
                                <div className="p-3">
                                    <h2 className="text-base font-bold mb-2">{stadium.nameStadium}</h2>
                                    <p className="text-gray-600 text-sm mb-2">{stadium.descriptionStadium}</p>
                                    <p className="text-gray-500 text-sm">📞 {stadium.contactStadium}</p>
                                    <button
                                        className="mt-3 w-full bg-orange-500 text-white py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition"
                                        onClick={() => handleSelectStadium(stadium._id, stadium.nameStadium)}
                                    >
                                        จองสนามนี้
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;
