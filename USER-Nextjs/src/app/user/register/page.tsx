"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { RegisterUser } from "@/utils/api";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BoxedRegister = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "", // ✅ เพิ่มฟิลด์เบอร์โทรศัพท์
    fieldOfStudy: "",
    year: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phoneNumber: string) => /^[0-9]{10}$/.test(phoneNumber); // ✅ เช็กเบอร์โทรให้มี 10 หลัก

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (!formData.fullname.trim()) {
      toast.error("❌ กรุณากรอกชื่อ-นามสกุล", { position: "top-center" });
      return;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      toast.error("❌ อีเมลไม่ถูกต้อง", { position: "top-center" });
      return;
    }
    if (!formData.phoneNumber.trim() || !validatePhoneNumber(formData.phoneNumber)) {
      toast.error("❌ กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)", { position: "top-center" });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.fieldOfStudy.trim()) {
      toast.error("❌ กรุณากรอกสาขาวิชา", { position: "top-center" });
      setLoading(false);
      return;
    }
    if (!formData.year.trim()) {
      toast.error("❌ กรุณากรอกปีที่ศึกษา", { position: "top-center" });
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      toast.error("❌ กรุณากรอกรหัสผ่าน", { position: "top-center" });
      setLoading(false);
      return;
    }

    try {
      const response = await RegisterUser(
        formData.fullname,
        formData.email,
        formData.phoneNumber, // ✅ ส่งเบอร์โทรศัพท์ไป API
        formData.fieldOfStudy,
        formData.year,
        formData.password
      );

      if (response && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        login(response.user);
        toast.success("✅ สมัครสมาชิกสำเร็จ!", { position: "top-center", autoClose: 3000 });

        setTimeout(() => {
          router.push("/home");
        }, 3000);
      } else {
        throw new Error("❌ API ไม่ส่งข้อมูลผู้ใช้กลับมา");
      }
    } catch (error: any) {
      console.error("❌ สมัครสมาชิกไม่สำเร็จ:", error);
      setError(error.message || "สมัครสมาชิกไม่สำเร็จ");
      toast.error("❌ สมัครสมาชิกไม่สำเร็จ! กรุณาลองใหม่อีกครั้ง", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-kanit relative h-screen flex items-end justify-center pb-10">
      <div className="absolute inset-0">
        <img src="/images/backgrounds/bg-football-stadium.png" alt="Stadium Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md text-white bg-black/50 p-6 rounded-sm">
          <h2 className="text-white text-2xl mb-2 font-bold text-center">สมัครสมาชิก</h2>
          <p className="text-sm text-center text-gray-300">กรุณากรอกข้อมูลเพื่อสมัครสมาชิก</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm mb-1">ชื่อ-นามสกุล</label>
                  <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="กรอกชื่อ-นามสกุล"
                    className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">อีเมล</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="กรอกอีเมลของคุณ"
                    className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">เบอร์โทรศัพท์</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="กรอกเบอร์โทรศัพท์"
                    className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button type="button" onClick={handleNextStep} className="w-full bg-orange-500 text-white py-3 rounded-sm text-lg font-semibold hover:bg-orange-600 transition">
                  ถัดไป
                </button>

                <p className="mt-4 text-center text-sm text-gray-300">
                  มีบัญชีแล้ว?{" "}
                  <Link href="/user/login">
                    <span className="text-blue-400 hover:underline">คลิกที่นี่</span>
                  </Link>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm mb-1">สาขาวิชา</label>
                  <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} placeholder="กรอกสาขาวิชาของคุณ"
                    className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">ปีที่ศึกษา</label>
                  <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="กรอกปีที่ศึกษา"
                    className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                {/* ✅ เพิ่มช่องกรอกรหัสผ่าน */}
                <div>
                  <label className="block text-sm mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="กรอกรหัสผ่าน"
                      className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 pr-12"
                    />
                    <button type="button" className="absolute right-4 top-4 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="w-1/2 bg-gray-500 text-white py-3 rounded-sm text-lg font-semibold hover:bg-gray-600 transition">
                    ย้อนกลับ
                  </button>
                  <button type="submit" className="w-1/2 bg-orange-500 text-white py-3 rounded-sm text-lg font-semibold hover:bg-orange-600 transition" disabled={loading}>
                    {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoxedRegister;
