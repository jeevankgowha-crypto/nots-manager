"use client";

import { useEffect } from "react";

export default function AdminRedirect() {
  useEffect(() => {
    window.location.href = "/admin/dashboard";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm font-semibold text-slate-500">Redirecting to Admin Dashboard...</p>
    </div>
  );
}
