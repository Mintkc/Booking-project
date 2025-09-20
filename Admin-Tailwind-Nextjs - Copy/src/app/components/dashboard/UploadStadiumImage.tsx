"use client";
import React, { useEffect, useState } from "react";

type Props = {
  stadiumId: string;
  currentImage?: string;     // เช่น "/uploads/stadiums/xxx.jpg"
  onChanged?: () => void;    // callback หลังอัปโหลด/ลบ
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5008";

export default function UploadStadiumImage({ stadiumId, currentImage, onChanged }: Props) {
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    setPreview(currentImage ? `${API_BASE}${currentImage}` : "");
  }, [currentImage]);

  async function upload(file: File) {
    try {
      setLoading(true); setErr("");
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/api/stadiums/${stadiumId}/image`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");
      const { stadium } = await res.json();
      setPreview(`${API_BASE}${stadium.imageUrl}`);
      onChanged?.();
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally { setLoading(false); }
  }

  async function remove() {
    try {
      setLoading(true); setErr("");
      const res = await fetch(`${API_BASE}/api/stadiums/${stadiumId}/image`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบรูปไม่สำเร็จ");
      await res.json();
      setPreview("");
      onChanged?.();
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally { setLoading(false); }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-16 h-16 rounded-md overflow-hidden border bg-gray-100">
        {preview ? <img src={preview} className="w-full h-full object-cover" alt="stadium" />
                 : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">ไม่มีรูป</div>}
      </div>
      <div className="flex flex-col gap-1">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
          disabled={loading}
          className="text-xs"
        />
        {preview && (
          <button type="button" onClick={remove} disabled={loading} className="text-red-500 text-xs hover:underline">
            ลบรูป
          </button>
        )}
        {loading && <p className="text-blue-500 text-xs">กำลังอัปเดต...</p>}
        {err && <p className="text-red-500 text-xs">{err}</p>}
      </div>
    </div>
  );
}
