import axios from "axios";

// ✅ กำหนด API_URL ตาม Environment Variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5008/api";

// ✅ ฟังก์ชันสำหรับการล็อกอิน
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "An error occurred" };
    }
};

// ✅ ฟังก์ชันสำหรับการสมัครสมาชิก (Register)
export const RegisterUser = async (fullname, email, phoneNumber, fieldOfStudy, year, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            fullname,
            phoneNumber,
            email,
            fieldOfStudy,
            year,
            password
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
    }
};

// ✅ ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้
export const updateUser = async (id, userData) => {
    try {
        const response = await axios.put(`${API_URL}/auth/${id}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
    }
};

// ✅ ฟังก์ชันสำหรับจองสนาม
export const createBooking = async (bookingData) => {
    try {
        const response = await axios.post(`${API_URL}/bookings`, bookingData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to create booking" };
    }
};

// ✅ ดึงวันที่ว่างและวันที่จองแล้ว
export const getAvailableDates = async (stadiumId, year, month) => {
    try {
        const response = await axios.get(`${API_URL}/bookings/available-dates`, {
            params: { stadiumId, year, month }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch available dates" };
    }
};

// ดึงข้อมูลอุปกรณ์ทั้งหมด
export const getAllEquipment = async () => {
    try {
        const response = await axios.get(`${API_URL}/equipments`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch equipment data" };
    }
};


export const getUserBookings = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/bookings/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch bookings" };
    }
};

// ✅ ยกเลิกการจอง
export const cancelBooking = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/bookings/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to cancel booking" };
    }
};


// ✅ ขอรหัสรีเซ็ตรหัสผ่าน
export const resetPasswordRequest = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password/request`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to send password reset request" };
    }
};

// ✅ รีเซ็ตรหัสผ่านใหม่
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to reset password" };
    }
};












































// ✅ ดึงข้อมูลพนักงานทั้งหมด
export const getAllStaff = async () => {
    try {
        const response = await axios.get(`${API_URL}/staff`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch staff data" };
    }
};

// ✅ เพิ่มพนักงานใหม่
export const createStaff = async (staffData) => {
    try {
        const response = await axios.post(`${API_URL}/staff`, staffData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to create staff" };
    }
};

// ✅ แก้ไขข้อมูลพนักงาน
export const updateStaff = async (id, staffData) => {
    try {
        const response = await axios.put(`${API_URL}/staff/${id}`, staffData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update staff" };
    }
};

// ✅ ลบพนักงาน
export const deleteStaff = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/staff/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete staff" };
    }
};

// ✅ ฟังก์ชันสำหรับ Equipment



// เพิ่มอุปกรณ์ใหม่
export const createEquipment = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/equipments`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to create equipment" };
    }
};

// แก้ไขข้อมูลอุปกรณ์
export const updateEquipment = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/equipments/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update equipment" };
    }
};

// ลบอุปกรณ์
export const deleteEquipment = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/equipments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete equipment" };
    }
};

// ✅ ฟังก์ชันสำหรับ Stadium

// ดึงข้อมูลสนามทั้งหมด
export const getAllStadiums = async () => {
    try {
        const response = await axios.get(`${API_URL}/stadiums`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch stadium data" };
    }
};

// เพิ่มสนามกีฬาใหม่
export const createStadium = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/stadiums`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to create stadium" };
    }
};

// แก้ไขข้อมูลสนามกีฬา
export const updateStadium = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/stadiums/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update stadium" };
    }
};

// ลบสนามกีฬา
export const deleteStadium = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/stadiums/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete stadium" };
    }
};


export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/AllUser`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch users" };
    }
};

// ✅ ดึงประวัติการจองทั้งหมด
export const getAllBookings = async () => {
    try {
        const response = await axios.get(`${API_URL}/bookings`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch bookings" };
    }
};

// ✅ ยืนยันการจอง
export const confirmBooking = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${id}/confirm`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to confirm booking" };
    }
};




// Fetch monthly booking stats
export const getMonthlyBookingStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/bookings/stats/monthly`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch monthly booking stats" };
    }
};

// ✅ ดึงจำนวนผู้ใช้ทั้งหมด
export const getTotalUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/users`);
        return response.data.totalUsers; // Return จำนวนผู้ใช้ทั้งหมด
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch total users" };
    }
};

// ✅ Fetch count of pending bookings
export const getPendingBookingsCount = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/bookings/pending`);
        return response.data.pendingBookings; // Assumes the response includes a 'pendingBookings' count
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch pending bookings count" };
    }
};

// ✅ Reset Booking Status API
export const resetBookingStatus = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${id}/reset`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to reset booking status" };
    }
};

// ✅ ดึงประวัติการจองที่มีสถานะ "Return Success"
export const getReturnedBookings = async () => {
    try {
        const response = await axios.get(`${API_URL}/bookings/history/returned`);
        return response.data;
    } catch (error) {
        console.error("Error fetching returned bookings:", error);
        return [];
    }
};