"use client";

import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { loginUser } from "@/utils/api";

const AuthLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // ✅ State สำหรับ Loading

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(email, password);
      console.log("✅ Login Successful:", response);

      if (response.staff?.fullname) {
        localStorage.setItem("staffName", response.staff.fullname);
      }

      // ✅ ให้ Loading ใช้เวลาอย่างน้อย 5 วินาทีก่อนเข้าสู่ระบบ
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("❌ Login Failed:", err);
      setError(err.message || "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ");
      setLoading(false); // ❌ ปิด Loading ถ้าล็อกอินไม่สำเร็จ
    }
  };

  return (
    <form className="font-kanit" onSubmit={handleLogin}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="email" value="Email" />
        </div>
        <TextInput
          id="email"
          type="email"
          sizing="md"
          className="form-control"
          placeholder="กรอก email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="password" value="Password" />
        </div>
        <TextInput
          id="password"
          type="password"
          sizing="md"
          className="form-control"
          placeholder="กรอก รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* แสดงข้อความแจ้งเตือนเมื่อเกิด Error */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* ✅ ปุ่มเข้าสู่ระบบที่มี Loading Indicator */}
      <Button type="submit" color="primary" className="w-full font-kanit" disabled={loading}>
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner size="sm" color="white" />
            กำลังเข้าสู่ระบบ...
          </div>
        ) : (
          "เข้าสู่ระบบ"
        )}
      </Button>
    </form>
  );
};

export default AuthLogin;
