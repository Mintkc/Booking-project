"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllEquipment } from "@/utils/api";
import { toast } from "react-toastify";
import { PlusCircle, MinusCircle, Package } from "lucide-react";

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

    const [equipmentList, setEquipmentList] = useState<{ _id: string; name: string; quantity: number }[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<{ equipmentId: string; name: string; quantity: number }[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleIncrease = (equipmentId: string, name: string, maxQuantity: number) => {
        setSelectedEquipment((prev) => {
            const existing = prev.find((item) => item.equipmentId === equipmentId);
            if (existing) {
                const newQuantity = existing.quantity + 1;
                if (newQuantity > maxQuantity) return prev;
                return prev.map((item) =>
                    item.equipmentId === equipmentId ? { ...item, quantity: newQuantity } : item
                );
            } else {
                return [...prev, { equipmentId, name, quantity: 1 }];
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

     // ✅ ฟังก์ชันไปหน้าถัดไป (เพิ่ม startTime & endTime)
     const handleNext = () => {
        router.push(
            `/booking/book-detail?stadiumId=${stadiumId}&stadiumName=${encodeURIComponent(stadiumName)}&userId=${userId}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}${equipmentQuery}`
        );
    };

    return (
        <div className="p-5 font-kanit max-w-[670px] mx-auto">
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
                <div className="grid grid-cols-3 gap-4">
                    {equipmentList.map((item) => {
                        const selectedItem = selectedEquipment.find((eq) => eq.equipmentId === item._id);
                        const selectedCount = selectedItem ? selectedItem.quantity : 0;
                        const isMax = selectedCount >= item.quantity;
                        const isMin = selectedCount <= 0;

                        return (
                            <div key={item._id} className="p-3 border rounded-sm shadow-md bg-white flex flex-col items-center">
                                <h2 className="text-sm font-bold text-center">{item.name}</h2>
                                <p className="text-xs text-gray-500">เหลือ {item.quantity} ชิ้น</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={() => handleDecrease(item._id)}
                                        className={`text-gray-500 ${isMin ? "opacity-50 cursor-not-allowed" : "hover:text-red-500"}`}
                                        disabled={isMin}
                                    >
                                        <MinusCircle size={24} />
                                    </button>
                                    <span className="text-lg font-bold">{selectedCount}</span>
                                    <button
                                        onClick={() => handleIncrease(item._id, item.name, item.quantity)}
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
