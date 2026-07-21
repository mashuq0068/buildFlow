"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const currentUserName = useAuthStore((s) => s.currentUserName);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!currentUserName && pathname !== "/login") {
      router.replace("/login");
    } else if (currentUserName && pathname === "/login") {
      router.replace("/");
    }
  }, [mounted, currentUserName, pathname, router]);

  if (!mounted) return null;
  if (!currentUserName && pathname !== "/login") return null;
  if (currentUserName && pathname === "/login") return null;

  return <>{children}</>;
}
