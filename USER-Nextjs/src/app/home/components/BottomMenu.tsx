"use client";

import { useState } from "react";
import { Home, FileText, User } from "lucide-react";

const menuItems = [
    { name: "หน้าแรก", page: "home", icon: Home },
    { name: "ประวัติการจอง", page: "history", icon: FileText },
    { name: "โปรไฟล์ของฉัน", page: "profile", icon: User },
];

const BottomMenu = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
    const [activeMenu, setActiveMenu] = useState("home"); // ✅ ใช้ useState ควบคุม Active

    const handleMenuClick = (page: string) => {
        setActiveMenu(page);
        setActivePage(page);
    };

    return (
        <div className="font-kanit fixed bottom-0 left-0 right-0 bg-white p-4 flex justify-around shadow-lg rounded-t-xl max-w-[670px] mx-auto">
            {menuItems.map((item) => (
                <button
                    key={item.page}
                    onClick={() => handleMenuClick(item.page)}
                    className={`flex flex-col items-center text-sm transition-all ${activeMenu === item.page ? "text-orange-500 " : "text-gray-500"
                        }`}
                >
                    <item.icon size={24} />
                    <span>{item.name}</span>
                </button>
            ))}
        </div>
    );
};

export default BottomMenu;
