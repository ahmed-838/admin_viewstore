"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // تحقق مما إذا كان المستخدم قد سجل الدخول
    const token = localStorage.getItem("token");
    
    // إذا كان المستخدم في صفحة تسجيل الدخول ولديه توكن، قم بتوجيهه إلى الصفحة الرئيسية
    if (pathname === "/router/login" && token) {
      router.push("/");
      return;
    }
    
    // إذا لم يكن المستخدم في صفحة تسجيل الدخول ولا يملك توكن، قم بتوجيهه إلى صفحة تسجيل الدخول
    if (pathname !== "/router/login" && !token) {
      router.push("/router/login");
      return;
    }
    
    setIsAuthenticated(!!token);
  }, [pathname, router]);

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // إذا كان المستخدم في صفحة تسجيل الدخول ولم يسجل الدخول، أو إذا كان المستخدم مصادقًا وليس في صفحة تسجيل الدخول
  if ((pathname === "/router/login" && !isAuthenticated) || (isAuthenticated && pathname !== "/router/login")) {
    return <>{children}</>;
  }

  // في الحالات الأخرى، لا تعرض شيئًا لأن التوجيه سيحدث
  return null;
} 