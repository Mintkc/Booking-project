"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllEquipment, API_BASE } from "@/utils/api";
import { toast } from "react-toastify";
import { PlusCircle, MinusCircle, Package, ArrowLeft, XCircle } from "lucide-react";
import Image from "next/image";

type EquipmentItem = {
  _id: string;
  name: string;
  quantity: number;   // จำนวนคงเหลือในสต็อก
  imageUrl?: string;
};

type SelectedItem = {
  equipmentId: string;
  name: string;
  quantity: number;   // จำนวนที่ผู้ใช้เลือก
  imageUrl?: string;
};

const DEFAULT_EQUIPMENT_IMAGE = "/images/products/s1.jpg";

const resolveImageSrc = (imageUrl?: string) => {
  if (!imageUrl || imageUrl.trim() === "") return DEFAULT_EQUIPMENT_IMAGE;
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith("http")) return trimmed;
  return `${API_BASE}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
};

const EquipmentImage = ({
  imageUrl,
  name,
  count,
  quantity,
  onIncrease,
  onDecrease,
  isMin,
  isMax,
}: {
  imageUrl?: string;
  name: string;
  count?: number;
  quantity: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  isMin?: boolean;
  isMax?: boolean;
}) => {
  const [src, setSrc] = useState(resolveImageSrc(imageUrl));

  useEffect(() => {
    setSrc(resolveImageSrc(imageUrl));
  }, [imageUrl]);

  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 200px"
        onError={() => setSrc(DEFAULT_EQUIPMENT_IMAGE)}
      />
      {/* overlay: name + controls */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-2">
          <p className="text-white text-sm md:text-base font-semibold text-center line-clamp-2 leading-snug mb-1">
            {name}
          </p>
          <p className="text-white text-xs text-center opacity-80 mb-2">เหลือ {quantity} ชิ้น</p>
          {(typeof count !== "undefined") && (onIncrease || onDecrease) && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onDecrease}
                className={`text-white ${isMin ? "opacity-50 cursor-not-allowed" : "hover:text-red-300"}`}
                disabled={!!isMin}
                aria-label="ลดจำนวน"
                title="ลดจำนวน"
              >
                <MinusCircle size={22} />
              </button>
              <span className="text-white text-lg font-extrabold min-w-[2ch] text-center bg-black/30 rounded px-2">
                {count}
              </span>
              <button
                onClick={onIncrease}
                className={`text-white ${isMax ? "opacity-50 cursor-not-allowed" : "hover:text-orange-300"}`}
                disabled={!!isMax}
                aria-label="เพิ่มจำนวน"
                title="เพิ่มจำนวน"
              >
                <PlusCircle size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Thumb = ({ imageUrl, name }: { imageUrl?: string; name: string }) => {
  const [src, setSrc] = useState(resolveImageSrc(imageUrl));
  useEffect(() => setSrc(resolveImageSrc(imageUrl)), [imageUrl]);
  return (
    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white">
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover"
        sizes="40px"
        onError={() => setSrc(DEFAULT_EQUIPMENT_IMAGE)}
      />
    </div>
  );
};

const SelectEquipmentPage = () => {
  return (
    <Suspense fallback={<p className="text-center text-gray-500">กำลังโหลด...</p>}>
      <SelectEquipment />
    </Suspense>
  );
};

const SelectEquipment = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const stadiumId = searchParams?.get("stadiumId") ?? "";
  const stadiumName = searchParams?.get("stadiumName") ?? "ไม่พบชื่อสนาม";
  const userId = searchParams?.get("userId") ?? "";
  const startDate = searchParams?.get("startDate") ?? "";
  const endDate = searchParams?.get("endDate") ?? "";
  const startTime = searchParams?.get("startTime") ?? "";
  const endTime = searchParams?.get("endTime") ?? "";
  const stadiumImage = searchParams?.get("stadiumImage") ?? "";
  const equipmentParam = searchParams?.get("equipment");

  // 🔁 อ่านรายการที่เลือกจาก query (ถ้ามี)
  const initialSelectedEquipment = useMemo<SelectedItem[]>(() => {
    if (!equipmentParam) return [];
    try {
      const parsed = JSON.parse(equipmentParam);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && item.equipmentId && item.quantity)
        .map((item) => ({
          equipmentId: String(item.equipmentId),
          name: String(item.name || ""),
          quantity: Number(item.quantity) || 0,
          imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        }));
    } catch (error) {
      console.error("❌ Failed to parse equipment param", error);
      return [];
    }
  }, [equipmentParam]);

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedItem[]>(initialSelectedEquipment);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSelectedEquipment.length === 0) return;
    setSelectedEquipment(initialSelectedEquipment);
  }, [initialSelectedEquipment]);

  // 📥 โหลดรายการอุปกรณ์ทั้งหมด
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await getAllEquipment();
        setEquipmentList(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("โหลดข้อมูลอุปกรณ์ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  // ➕ เพิ่มจำนวน
  const handleIncrease = (
    equipmentId: string,
    name: string,
    maxQuantity: number,
    imageUrl?: string
  ) => {
    setSelectedEquipment((prev) => {
      const existing = prev.find((item) => item.equipmentId === equipmentId);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (newQuantity > maxQuantity) return prev;
        return prev.map((item) =>
          item.equipmentId === equipmentId
            ? { ...item, quantity: newQuantity, imageUrl: item.imageUrl ?? imageUrl }
            : item
        );
      }
      return [...prev, { equipmentId, name, quantity: 1, imageUrl }];
    });
  };

  // ➖ ลดจำนวน
  const handleDecrease = (equipmentId: string) => {
    setSelectedEquipment((prev) => {
      const existing = prev.find((item) => item.equipmentId === equipmentId);
      if (!existing) return prev;

      const newQuantity = existing.quantity - 1;
      if (newQuantity <= 0) return prev.filter((item) => item.equipmentId !== equipmentId);

      return prev.map((item) =>
        item.equipmentId === equipmentId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // ❌ เอาออกจากรายการ
  const handleRemove = (equipmentId: string) => {
    setSelectedEquipment((prev) => prev.filter((i) => i.equipmentId !== equipmentId));
  };

  const equipmentQuery =
    selectedEquipment.length > 0
      ? `&equipment=${encodeURIComponent(JSON.stringify(selectedEquipment))}`
      : "";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      const params = new URLSearchParams({
        stadiumId,
        stadiumName,
        userId,
        startDate,
        endDate,
        startTime,
        endTime,
        ...(stadiumImage ? { stadiumImage } : {}),
      });
      router.push(`/booking/selectDate?${params.toString()}`);
    }
  };

  const handleNext = () => {
    const stadiumImageParam = stadiumImage
      ? `&stadiumImage=${encodeURIComponent(stadiumImage)}`
      : "";
    router.push(
      `/booking/book-detail?stadiumId=${stadiumId}&stadiumName=${encodeURIComponent(
        stadiumName
      )}&userId=${userId}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}${equipmentQuery}${stadiumImageParam}`
    );
  };

  return (
    <div className="relative min-h-screen font-kanit">
      {/* 🔹 พื้นหลัง */}
      <div className="absolute inset-0">
        <Image
          src={stadiumImage || "/images/stadium-placeholder.jpg"}
          alt={stadiumName}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* 🔹 เนื้อหา */}
      <div className="relative z-10 p-5 max-w-[960px] mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-orange-400 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          ย้อนกลับ
        </button>

        <h1 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2 text-white">
          <Package size={24} className="text-orange-300" /> เลือกอุปกรณ์
        </h1>
        <p className="text-center text-gray-200 mb-4">เลือกจำนวนอุปกรณ์ที่ต้องการใช้</p>

        {/* 🧺 อุปกรณ์ที่เลือก (live) */}
        <div className="mb-5">
          <div className="bg-white/90 backdrop-blur border border-orange-200 rounded-xl p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              อุปกรณ์ที่เลือก ({selectedEquipment.length} รายการ)
            </h2>

            {selectedEquipment.length === 0 ? (
              <p className="text-gray-600">ยังไม่ได้เลือกอุปกรณ์</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {selectedEquipment.map((item) => (
                  <div
                    key={item.equipmentId}
                    className="flex items-center justify-between gap-3 p-2 border rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <Thumb imageUrl={item.imageUrl} name={item.name} />
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">จำนวน: {item.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(item.equipmentId)}
                        className="text-gray-700 hover:text-red-600"
                        title="ลดจำนวน"
                      >
                        <MinusCircle size={22} />
                      </button>
                      <button
                        onClick={() =>
                          handleIncrease(
                            item.equipmentId,
                            item.name,
                            Number.MAX_SAFE_INTEGER, // สามารถเพิ่มได้ แล้วค่อยถูกจำกัดตอนต่อจาก grid หลัก
                            item.imageUrl
                          )
                        }
                        className="text-gray-700 hover:text-orange-600"
                        title="เพิ่มจำนวน"
                      >
                        <PlusCircle size={22} />
                      </button>
                      <button
                        onClick={() => handleRemove(item.equipmentId)}
                        className="ml-1 text-gray-500 hover:text-red-600"
                        title="เอาออกจากรายการ"
                      >
                        <XCircle size={22} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 📋 รายการอุปกรณ์ทั้งหมดให้เลือก */}
        {loading ? (
          <p className="text-center text-gray-200">กำลังโหลดข้อมูลอุปกรณ์...</p>
        ) : equipmentList.length === 0 ? (
          <p className="text-center text-gray-200">ไม่มีอุปกรณ์ให้เลือก</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-32">
            {equipmentList.map((item) => {
              const selectedItem = selectedEquipment.find((eq) => eq.equipmentId === item._id);
              const selectedCount = selectedItem ? selectedItem.quantity : 0;
              const isMax = selectedCount >= item.quantity;
              const isMin = selectedCount <= 0;

              return (
                <div key={item._id} className="relative h-48 md:h-56 rounded-sm overflow-hidden border border-white/20 shadow-md">
                  <EquipmentImage
                    imageUrl={item.imageUrl}
                    name={item.name}
                    count={selectedCount}
                    quantity={item.quantity}
                    onIncrease={() => handleIncrease(item._id, item.name, item.quantity, item.imageUrl)}
                    onDecrease={() => handleDecrease(item._id)}
                    isMin={isMin}
                    isMax={isMax}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 🧾 สรุปด้านล่าง */}
        <div className="max-w-[960px] mx-auto fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur shadow-xl p-4 flex justify-between items-center rounded-t-xl">
          <div className="text-lg font-bold text-black">
            อุปกรณ์ที่เลือก <br />
            <span className="text-orange-600 text-xl font-extrabold">
              {selectedEquipment.length} รายการ
            </span>
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-sm text-lg font-semibold transition bg-orange-500 text-white hover:bg-orange-600"
          >
            ต่อไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectEquipmentPage;