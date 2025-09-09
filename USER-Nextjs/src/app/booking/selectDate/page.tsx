"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAvailableDates } from "@/utils/api";
import { toast } from "react-toastify";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/th";

dayjs.locale("th");
dayjs.extend(isBetween);

const SelectDatePage = () => {
    return (
        <Suspense fallback={<p className="text-center text-gray-500">กำลังโหลด...</p>}>
            <SelectDate />
        </Suspense>
    );
};

const SelectDate = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const stadiumId = searchParams?.get("stadiumId") ?? "";
    const stadiumName = searchParams?.get("stadiumName") ?? "ไม่พบชื่อสนาม";
    const userId = searchParams?.get("userId") ?? "";

    const [dateStatusList, setDateStatusList] = useState<{ date: string; status: string }[]>([]);
    const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("18:00");
    const [isTimeActive, setIsTimeActive] = useState(false);

    const [currentYear, setCurrentYear] = useState(dayjs().year());
    const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);

    useEffect(() => {
        if (!stadiumId.trim()) {
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            toast.error("ไม่พบข้อมูลสนาม");
            return;
        }

        const fetchAvailableDates = async () => {
            try {
                const data = await getAvailableDates(stadiumId, currentYear, currentMonth);
                const availableDates = Array.isArray(data?.dates) ? data.dates :
                    Array.isArray(data?.availableDates) ? data.availableDates : [];

                setDateStatusList(availableDates);
            } catch (error) {
                console.error("❌ Error fetching dates:", error);
                toast.error("โหลดข้อมูลวันที่ไม่สำเร็จ");
                setDateStatusList([]);
            }
        };

        fetchAvailableDates();
    }, [stadiumId, currentYear, currentMonth]);

    // ✅ ฟังก์ชันเลือกวัน
    const handleDateSelect = (date: string, status: string) => {
        if (status !== "ว่าง") {
            toast.error("⛔ กรุณาเลือกวันที่ว่างเท่านั้น");
            return;
        }

        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            setSelectedStartDate(date);
            setSelectedEndDate(null);
            setIsTimeActive(true);
        } else if (selectedStartDate && !selectedEndDate) {
            if (dayjs(date).isBefore(dayjs(selectedStartDate))) {
                setSelectedEndDate(selectedStartDate);
                setSelectedStartDate(date);
            } else {
                setSelectedEndDate(date);
            }
        } else {
            setSelectedStartDate(date);
            setSelectedEndDate(null);
            setIsTimeActive(true);
        }
    };

    const isSelected = (date: string) => {
        return (
            date === selectedStartDate ||
            date === selectedEndDate ||
            (selectedStartDate && selectedEndDate && dayjs(date).isBetween(selectedStartDate, selectedEndDate, null, "[]"))
        );
    };

    // ✅ ฟังก์ชันตรวจสอบและไปหน้าถัดไป
    const handleNext = () => {
        if (!selectedStartDate) {
            toast.error("กรุณาเลือกวันที่");
            return;
        }

        if (!isTimeActive) {
            toast.error("กรุณาเลือกวันสิ้นสุดก่อน");
            return;
        }

        if (startTime >= endTime) {
            toast.error("⛔ เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
            return;
        }

        router.push(
            `/booking/selectEquipment?stadiumId=${stadiumId}&stadiumName=${encodeURIComponent(stadiumName)}&userId=${userId}&startDate=${selectedStartDate}&endDate=${selectedEndDate ?? selectedStartDate}&startTime=${startTime}&endTime=${endTime}`
        );
    };

    // ✅ ฟังก์ชันเปลี่ยนเดือน
    const handleMonthChange = (direction: "prev" | "next") => {
        setCurrentMonth((prev) => {
            let newMonth = direction === "prev" ? prev - 1 : prev + 1;
            if (newMonth < 1) {
                setCurrentYear((y) => y - 1);
                newMonth = 12;
            }
            if (newMonth > 12) {
                setCurrentYear((y) => y + 1);
                newMonth = 1;
            }
            return newMonth;
        });
    };

    const firstDayOfMonth = dayjs(`${currentYear}-${currentMonth}-01`).day();

    return (
        <div className="p-3 font-kanit max-w-[670px] mx-auto">
            <h1 className="text-2xl font-bold text-center mb-4">📅 เลือกวันที่</h1>

            <div className="flex justify-between items-center mb-4">
                <button onClick={() => handleMonthChange("prev")} className="p-2 bg-gray-300 rounded-lg">
                    <CircleChevronLeft size={24} className="text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold">{dayjs(`${currentYear}-${currentMonth}-01`).format("MMMM YYYY")}</h2>
                <button onClick={() => handleMonthChange("next")} className="p-2 bg-gray-300 rounded-lg">
                    <CircleChevronRight size={24} className="text-gray-700" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-gray-500">{day}</div>
                ))}

                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} className="text-gray-300">-</div>
                ))}

                {dateStatusList?.map(({ date, status }) => (
                    <button
                        key={date}
                        onClick={() => handleDateSelect(date, status)}
                        disabled={status !== "ว่าง"}
                        className={`p-2 rounded-sm text-center font-bold transition-all ${
                            isSelected(date) ? "bg-orange-700 text-white" : status !== "ว่าง" ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-orange-400 text-white hover:bg-orange-500"
                        }`}
                    >
                        {dayjs(date).date()}
                        <span className="block text-xs mt-1">{status}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6">
                <label className="block text-lg font-bold text-gray-700">เลือกเวลาเริ่มใช้</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2 border rounded" disabled={!isTimeActive} />
            </div>

            <div className="mt-4">
                <label className="block text-lg font-bold text-gray-700">เลือกเวลาสิ้นสุด</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2 border rounded" disabled={!isTimeActive} />
            </div>

            <button onClick={handleNext} className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg text-lg font-bold">ต่อไป</button>
        </div>
    );
};

export default SelectDatePage;
