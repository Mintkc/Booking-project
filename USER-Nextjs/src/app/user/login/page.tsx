"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ ใช้ useRouter
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/utils/api";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";


const StartPage = () => {
  const { login } = useAuth();
  const router = useRouter(); // ✅ ใช้ Router
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(credentials.email, credentials.password);
      login(response.user); // ✅ เก็บข้อมูล User
      toast.success("เข้าสู่ระบบสำเร็จ!");
      router.push("/home"); // ✅ ไปหน้า Home
    } catch (error: any) {
      console.error("❌ Login Failed:", error);

      const msg = error?.message || "";

      if (msg.includes("ไม่พบอีเมล")) {
        toast.error("ไม่พบอีเมลนี้ในระบบ");
      } else if (msg.includes("รหัสผ่านไม่ถูกต้อง")) {
        toast.error("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
      } else if (msg.includes("ถูกบล็อก")) {
        toast.error(msg); // แสดงตามข้อความที่ Backend ส่งมา
      } else {
        toast.error("เข้าสู่ระบบไม่สำเร็จ");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="font-kanit relative h-screen flex items-end justify-center pb-20">
      {/* พื้นหลังรูปภาพ */}
      <div className="absolute inset-0">
        <img
          src="/images/backgrounds/bg-football-stadium.png"
          alt="Stadium Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Form Login (Overlay) */}
      {showLogin && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md text-white bg-black/50 p-6 rounded-lg">
            <h2 className="text-white text-2xl mb-2 font-bold text-center">เข้าสู่ระบบ</h2>
            <p className="text-sm text-center text-gray-300">กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ</p>

            {/* แสดง Error ถ้ามี */}
            {error && <p className="text-red-400 text-center mt-2">{error}</p>}

            {/* ฟอร์ม Login */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm mb-1">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="กรอกอีเมลของคุณ"
                  className="w-full p-4 rounded bg-white border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full p-4 rounded bg-white border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 pr-12"
                    required
                  />
                  {/* ปุ่มแสดง/ซ่อนรหัสผ่าน */}
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* ปุ่มเข้าสู่ระบบ */}
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition"
                disabled={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
            {/* ปุ่ม "ลืมรหัสผ่าน" */}
            <p className="mt-4 text-center text-sm font-semibold">
              <Link href="/user/reset-password">
                <span className="text-yellow-400 hover:underline">ลืมรหัสผ่าน?</span>
              </Link>
            </p>


            {/* ข้อความ "ถ้ายังไม่มีบัญชี" */}
            <p className="mt-4 text-center text-sm text-gray-300">
              ถ้ายังไม่มีบัญชี?{" "}
              <Link href="/user/register">
                <span className="text-blue-400 hover:underline">คลิกที่นี่</span>
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ปุ่ม "จองเลย" เพื่อเปิด Form Login */}
      {!showLogin && (
        <div className="relative z-10 text-center text-white px-6 max-w-md">
          <h1 className="text-2xl font-bold text-white leading-relaxed">
            จองสนามกีฬา อุปกรณ์<br /> ได้อย่างง่ายดาย
          </h1>
          <p className="text-base mt-3 text-gray-300 leading-relaxed">
            เลือกสนามที่เหมาะกับคุณ พร้อมอุปกรณ์ครบครัน <br />
            ใช้งานสะดวกในไม่กี่ขั้นตอน
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="mt-6 mb-20 bg-orange-500 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-orange-600 transition w-full max-w-sm"
          >
            จองเลย
          </button>
        </div>
      )}
    </div>
  );
};

export default StartPage;
