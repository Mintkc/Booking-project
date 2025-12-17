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
    phoneNumber: "",
    userType: "student" as "student" | "staff",
    fieldOfStudy: "",
    year: "",
    department: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // ✅ แสดง error เฉพาะตอนกด "ถัดไป"
  const [showStep1Error, setShowStep1Error] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validatePhoneNumber = (phoneNumber: string) => /^[0-9]{10}$/.test(phoneNumber.trim());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    // ✅ เปิดการแสดง error ตอนกดถัดไปเท่านั้น
    setShowStep1Error(true);

    const okFullname = !!formData.fullname.trim();
    const okEmail = !!formData.email.trim() && validateEmail(formData.email);
    const okPhone = !!formData.phoneNumber.trim() && validatePhoneNumber(formData.phoneNumber);

    if (!okFullname || !okEmail || !okPhone) return;

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.userType === "student") {
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
    } else {
      if (!formData.department.trim()) {
        toast.error("❌ กรุณากรอกภาควิชา", { position: "top-center" });
        setLoading(false);
        return;
      }
    }

    if (!formData.password.trim()) {
      toast.error("❌ กรุณากรอกรหัสผ่าน", { position: "top-center" });
      setLoading(false);
      return;
    }

    try {
      // ✅ เรียกแบบเดิม เพื่อไม่ให้โปรเจกต์พัง (ถ้า staff จะส่ง field/year เป็นค่าว่าง)
      const response = await RegisterUser(
        formData.fullname,
        formData.email,
        formData.phoneNumber,
        formData.userType === "student" ? formData.fieldOfStudy : "",
        formData.userType === "student" ? formData.year : "",
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

  // ✅ error เฉพาะ step1 (หลังจากกดถัดไป)
  const step1FullnameError = showStep1Error && !formData.fullname.trim();
  const step1EmailError = showStep1Error && (!formData.email.trim() || !validateEmail(formData.email));
  const step1PhoneError = showStep1Error && (!formData.phoneNumber.trim() || !validatePhoneNumber(formData.phoneNumber));

  return (
    <div className="font-kanit relative h-screen flex items-end justify-center pb-10">
      <div className="absolute inset-0">
        <img
          src="/images/backgrounds/bg-football-stadium.png"
          alt="Stadium Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md text-white bg-black/50 p-6 rounded-sm">
          {/* ❌ ไม่แสดงเลขหน้า */}
          <h2 className="text-white text-2xl mb-2 font-bold text-center">สมัครสมาชิก</h2>
          <p className="text-sm text-center text-gray-300">กรุณากรอกข้อมูลเพื่อสมัครสมาชิก</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm mb-1">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="กรอกชื่อ-นามสกุล"
                    className={`w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 ${
                      step1FullnameError ? "border-red-500" : ""
                    }`}
                  />
                  {step1FullnameError && (
                    <p className="mt-1 text-xs text-red-400">✖ กรุณากรอกชื่อ-นามสกุล</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1">อีเมล</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="เช่น mmm@email.com"
                    className={`w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 ${
                      step1EmailError ? "border-red-500" : ""
                    }`}
                  />
                  {step1EmailError && (
                    <p className="mt-1 text-xs text-red-400">✖ รูปแบบอีเมลไม่ถูกต้อง (เช่น mmm@email.com)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="กรอกเบอร์โทรศัพท์ (10 หลัก)"
                    className={`w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 ${
                      step1PhoneError ? "border-red-500" : ""
                    }`}
                  />
                  {step1PhoneError && (
                    <p className="mt-1 text-xs text-red-400">✖ ต้องเป็นตัวเลข 10 หลัก</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-orange-500 text-white py-3 rounded-sm text-lg font-semibold hover:bg-orange-600 transition"
                >
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
                  <label className="block text-sm mb-1">ประเภทผู้ใช้</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="w-full p-4 rounded bg-white border text-gray-600 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="student">นักศึกษา</option>
                    <option value="staff">บุคลากร</option>
                  </select>
                </div>

                {formData.userType === "student" && (
                  <>
                    <div>
                      <label className="block text-sm mb-1">สาขาวิชา</label>
                      <input
                        type="text"
                        name="fieldOfStudy"
                        value={formData.fieldOfStudy}
                        onChange={handleChange}
                        placeholder="กรอกสาขาวิชาของคุณ"
                        className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">ปีที่ศึกษา</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="กรอกปีที่ศึกษา"
                        className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </>
                )}

                {formData.userType === "staff" && (
                  <div>
                    <label className="block text-sm mb-1">ภาควิชา</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="กรอกภาควิชา/หน่วยงาน"
                      className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="กรอกรหัสผ่าน"
                      className="w-full p-4 rounded bg-white border text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-4 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      // ✅ กลับไป step1 แล้วซ่อน error จนกดถัดไปอีกครั้ง
                      setShowStep1Error(false);
                    }}
                    className="w-1/2 bg-gray-500 text-white py-3 rounded-sm text-lg font-semibold hover:bg-gray-600 transition"
                  >
                    ย้อนกลับ
                  </button>

                  <button
                    type="submit"
                    className="w-1/2 bg-orange-500 text-white py-3 rounded-sm text-lg font-semibold hover:bg-orange-600 transition"
                    disabled={loading}
                  >
                    {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                  </button>
                </div>

                {error ? <p className="text-red-300 text-sm">{error}</p> : null}
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoxedRegister;
