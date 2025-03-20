"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // إزالة التوكن والبيانات من التخزين المحلي
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // توجيه المستخدم إلى صفحة تسجيل الدخول
    router.push("/router/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md bg-gradient-to-r from-red-500 to-red-700 px-4 py-2.5 text-white font-medium shadow-md transition duration-300 ease-in-out hover:from-red-600 hover:to-red-800 hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      تسجيل الخروج
    </button>
  );
} 