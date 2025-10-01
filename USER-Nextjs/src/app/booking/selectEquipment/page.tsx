"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllEquipment, API_BASE } from "@/utils/api";
import { toast } from "react-toastify";
import { PlusCircle, MinusCircle, Package, ArrowLeft } from "lucide-react";
import Image from "next/image";

type EquipmentItem = {
    _id: string;
    name: string;
    quantity: number;
    imageUrl?: string;
};

const DEFAULT_EQUIPMENT_IMAGE = "/images/products/s1.jpg";

const resolveImageSrc = (imageUrl?: string) => {
    if (!imageUrl || imageUrl.trim() === "") return DEFAULT_EQUIPMENT_IMAGE;
    const trimmed = imageUrl.trim();
    if (trimmed.startsWith("http")) return trimmed;
    return `${API_BASE}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
};

const EquipmentImage = ({ imageUrl, name }: { imageUrl?: string; name: string }) => {
    const [src, setSrc] = useState(resolveImageSrc(imageUrl));

    useEffect(() => {
        setSrc(resolveImageSrc(imageUrl));
    }, [imageUrl]);

    return (
        <div className="relative w-full h-24 mb-3 overflow-hidden rounded-sm bg-gray-100">
            <Image
                src={src}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 200px"
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

    const initialSelectedEquipment = useMemo(() => {
        if (!equipmentParam) return [];
        try {
            const parsed = JSON.parse(equipmentParam);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((item) => item && item.equipmentId && item.quantity).map((item) => ({
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
    const [selectedEquipment, setSelectedEquipment] = useState<{ equipmentId: string; name: string; quantity: number; imageUrl?: string }[]>(initialSelectedEquipment);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialSelectedEquipment.length === 0) return;
        setSelectedEquipment(initialSelectedEquipment);
    }, [initialSelectedEquipment]);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const data = await getAllEquipment();
                setEquipmentList(data);
            } catch (error) {
                toast.error("โหลดข้อมูลอุปกรณ์ไม่สำเร็จ");
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    const handleIncrease = (equipmentId: string, name: string, maxQuantity: number, imageUrl?: string) => {
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
            } else {
                return [...prev, { equipmentId, name, quantity: 1, imageUrl }];
            }
        });
    };

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

    const equipmentQuery = selectedEquipment.length > 0
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

     // ✅ ฟังก์ชันไปหน้าถัดไป (เพิ่ม startTime & endTime)
     const handleNext = () => {
        const stadiumImageParam = stadiumImage
            ? `&stadiumImage=${encodeURIComponent(stadiumImage)}`
            : "";
        router.push(
            `/booking/book-detail?stadiumId=${stadiumId}&stadiumName=${encodeURIComponent(stadiumName)}&userId=${userId}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}${equipmentQuery}${stadiumImageParam}`
        );
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
                <Package size={24} className="text-orange-500" /> เลือกอุปกรณ์
            </h1>
            <p className="text-center text-gray-600 mb-4">เลือกจำนวนอุปกรณ์ที่ต้องการใช้</p>

            {/* ✅ แสดง Loading เมื่อกำลังโหลดอุปกรณ์ */}
            {loading ? (
                <p className="text-center text-gray-500">กำลังโหลดข้อมูลอุปกรณ์...</p>
            ) : equipmentList.length === 0 ? (
                <p className="text-center text-gray-500">ไม่มีอุปกรณ์ให้เลือก</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                    {equipmentList.map((item) => {
                        const selectedItem = selectedEquipment.find((eq) => eq.equipmentId === item._id);
                        const selectedCount = selectedItem ? selectedItem.quantity : 0;
                        const isMax = selectedCount >= item.quantity;
                        const isMin = selectedCount <= 0;

                        return (
                            <div key={item._id} className="p-3 border rounded-sm shadow-md bg-white flex flex-col">
                                <EquipmentImage imageUrl={item.imageUrl} name={item.name} />
                                <h2 className="text-sm font-bold text-center min-h-[40px] flex items-center justify-center text-gray-800">
                                    {item.name}
                                </h2>
                                <p className="text-xs text-gray-500 text-center">เหลือ {item.quantity} ชิ้น</p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <button
                                        onClick={() => handleDecrease(item._id)}
                                        className={`text-gray-500 ${isMin ? "opacity-50 cursor-not-allowed" : "hover:text-red-500"}`}
                                        disabled={isMin}
                                    >
                                        <MinusCircle size={24} />
                                    </button>
                                    <span className="text-lg font-bold">{selectedCount}</span>
                                    <button
                                        onClick={() => handleIncrease(item._id, item.name, item.quantity, item.imageUrl)}
                                        className={`text-gray-500 ${isMax ? "opacity-50 cursor-not-allowed" : "hover:text-orange-500"}`}
                                        disabled={isMax}
                                    >
                                        <PlusCircle size={24} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ✅ แสดงปุ่มจอง และจำนวนที่เลือก */}
            <div className="max-w-[670px] mx-auto fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-between items-center rounded-t-xl">
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
    );
};

export default SelectEquipmentPage;
