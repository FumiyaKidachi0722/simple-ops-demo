"use client";

import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { clearCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/firebase";

export default function LogoutPage() {
  const router = useRouter();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    signOut(auth)
      .catch(() => {})
      .finally(() => {
        clearCurrentUser();
        toast.info("ログアウトしました");
        router.replace("/login");
      });
  }, [router]);

  return null;
}
