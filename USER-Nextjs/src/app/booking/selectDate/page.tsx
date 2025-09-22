"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAvailableDates, createBooking } from "@/utils/api";
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

  // โหลดวันว่าง/ไม่ว่าง
  useEffect(() => {
    if (!stadiumId.trim()) return;
    (async () => {
      try {
        const data = await getAvailableDates(stadiumId, currentYear, currentMonth);
        const normalized =
          Array.isArray(data?.dates)
            ? data.dates
            : Array.isArray(data?.availableDates)
              ? data.availableDates
              : [];
        setDateStatusList(
          normalized
            .filter((x: any) => x && x.date)
            .map((x: any) => ({
              date: dayjs(x.date).format("YYYY-MM-DD"),
              status: x.status === "ไม่ว่าง" ? "ไม่ว่าง" : "ว่าง",
            }))
        );
      } catch (error) {
        console.error("❌ Error fetching dates:", error);
        setDateStatusList([]);
      }
    })();
  }, [stadiumId, currentYear, currentMonth]);

  const statusMap = useMemo(() => {
    const m = new Map<string, "ว่าง" | "ไม่ว่าง">();
    dateStatusList.forEach((d) => m.set(d.date, d.status as "ว่าง" | "ไม่ว่าง"));
    return m;
  }, [dateStatusList]);

  const monthStart = useMemo(() => dayjs(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`), [currentYear, currentMonth]);
  const monthEnd = useMemo(() => monthStart.endOf("month"), [monthStart]);
  const daysInMonth = monthEnd.date();
  const firstDayIndex = monthStart.day();
  const todayStr = dayjs().format("YYYY-MM-DD");

  const monthDates = useMemo(() => {
    const arr: string[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(monthStart.date(i).format("YYYY-MM-DD"));
    }
    return arr;
  }, [daysInMonth, monthStart]);

  const handleDateSelect = (date: string, status: string) => {
    if (status !== "ว่าง") {
      toast.error("⛔ กรุณาเลือกวันที่ว่างเท่านั้น");
      return;
    }
    if (dayjs(date).isBefore(dayjs(todayStr), "day")) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setIsTimeActive(true);
      return;
    }

    if (dayjs(date).isBefore(dayjs(selectedStartDate))) {
      setSelectedEndDate(selectedStartDate);
      setSelectedStartDate(date);
    } else {
      setSelectedEndDate(date);
    }
  };

  const isSelected = (date: string) => {
    return (
      date === selectedStartDate ||
      date === selectedEndDate ||
      (selectedStartDate &&
        selectedEndDate &&
        dayjs(date).isBetween(selectedStartDate, selectedEndDate, null, "[]"))
    );
  };

  // 🔑 กดปุ่ม "ยืนยันการจอง"
  const handleBooking = async () => {
    if (!selectedStartDate) {
      toast.error("กรุณาเลือกวันที่");
      return;
    }
    if (!isTimeActive) {
      toast.error("กรุณาเลือกวันที่สิ้นสุดก่อน");
      return;
    }
    if (!userId) {
      toast.error("⛔ ต้องเข้าสู่ระบบก่อนจอง");
      return;
    }

    const isSingleDay = !selectedEndDate || selectedStartDate === selectedEndDate;
    if (isSingleDay && startTime >= endTime) {
      toast.error("⛔ เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
      return;
    }

    const end = selectedEndDate ?? selectedStartDate;

    try {
      await createBooking({
        userId,
        stadiumId,
        startDate: selectedStartDate,
        endDate: end,
        startTime,
        endTime,
      });
      toast.success("✅ จองสำเร็จ");
      router.push("/booking/history"); // ไปหน้าประวัติการจอง
    } catch (err: any) {
      toast.error("❌ " + (err.message || "ไม่สามารถจองได้"));
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      let m = direction === "prev" ? prev - 1 : prev + 1;
      if (m < 1) {
        setCurrentYear((y) => y - 1);
        m = 12;
      }
      if (m > 12) {
        setCurrentYear((y) => y + 1);
        m = 1;
      }
      return m;
    });
  };

  return (
    <div className="p-3 font-kanit max-w-[670px] mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">📅 เลือกวันที่</h1>

      {/* แถบเดือน/ปี */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => handleMonthChange("prev")} className="p-2 bg-gray-300 rounded-lg">
          <CircleChevronLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold">
          {monthStart.format("MMMM YYYY")}
        </h2>
        <button onClick={() => handleMonthChange("next")} className="p-2 bg-gray-300 rounded-lg">
          <CircleChevronRight size={24} className="text-gray-700" />
        </button>
      </div>

      {/* หัวตารางวัน */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-gray-500">{d}</div>
        ))}

        {Array.from({ length: firstDayIndex }, (_, i) => (
          <div key={`empty-${i}`} className="text-gray-300">-</div>
        ))}

        {monthDates.map((d) => {
          const status = statusMap.get(d) ?? "ว่าง";
          const isPast = dayjs(d).isBefore(dayjs(todayStr), "day");
          const disabled = status !== "ว่าง" || isPast;

          return (
            <button
              key={d}
              onClick={() => handleDateSelect(d, status)}
              disabled={disabled}
              className={`p-2 rounded-sm text-center font-bold transition-all
                ${isSelected(d)
                  ? "bg-orange-700 text-white"
                  : disabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-orange-400 text-white hover:bg-orange-500"}`}
              title={status}
            >
              {dayjs(d).date()}
              {!isPast && <span className="block text-xs mt-1">{status}</span>}
            </button>
          );
        })}
      </div>

      {/* เวลา */}
      <div className="mt-6">
        <label className="block text-lg font-bold text-gray-700">เลือกเวลาเริ่มใช้</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={!isTimeActive}
        />
      </div>

      {selectedStartDate && (!selectedEndDate || selectedStartDate === selectedEndDate) && (
        <div className="mt-4">
          <label className="block text-lg font-bold text-gray-700">เลือกเวลาสิ้นสุด</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!isTimeActive}
          />
        </div>
      )}

      <button onClick={handleBooking} className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg text-lg font-bold">
        ยืนยันการจอง
      </button>
    </div>
  );
};

export default SelectDatePage;
