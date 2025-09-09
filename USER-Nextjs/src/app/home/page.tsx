"use client";

import Navbar from "./components/Navbar";
import BottomMenu from "./components/BottomMenu";
import ProfilePage from "../profile/page"; // ✅ นำเข้าหน้า Profile
import HistoryPage from "../history/page"; // ✅ นำเข้าหน้า Profile
import Booking from "./components/Booking";
import { useState } from "react";

const HomePage = () => {
    const [activePage, setActivePage] = useState("home"); // ✅ ควบคุมการเปลี่ยนหน้า

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-100 font-kanit">
            {/* Navbar */}
            <Navbar />

            {/* เนื้อหาส่วนกลาง */}
            <div className="flex-grow p-2">
                {activePage === "home" && <Booking />}
                {activePage === "history" && <HistoryPage />} {/* ✅ แสดงหน้าโปรไฟล์ */}
                {activePage === "profile" && <ProfilePage />} {/* ✅ แสดงหน้าโปรไฟล์ */}
            </div>

            {/* Bottom Navigation */}
            <BottomMenu setActivePage={setActivePage} />
        </div>
    );
};

export default HomePage;
