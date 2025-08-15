"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getDocFromCache } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { auth, db } from "@/lib/firebase";
import { MANAGERIAL_ROLES } from "@/lib/roles";
import type { Role, User } from "@/lib/types";

import {
  RegisterTemplate,
  type RegisterTemplateProps,
} from "./register-template";

export type ProtectedRegisterTemplateProps = RegisterTemplateProps & {
  allowedRoles?: Role[];
};

export function ProtectedRegisterTemplate({
  allowedRoles = MANAGERIAL_ROLES,
  ...props
}: ProtectedRegisterTemplateProps) {
  const router = useRouter();
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      const ref = doc(db, "users", u.uid);
      let snap;
      try {
        snap = await getDocFromCache(ref);
      } catch {
        snap = await getDoc(ref);
      }
      const info = snap.data() as User | undefined;
      if (info && allowedRoles.includes(info.role)) {
        setAllow(true);
      } else {
        toast.error("権限がありません: このページを表示する権限がありません。");
        router.replace("/");
      }
    });
    return () => unsub();
  }, [router, allowedRoles]);
  if (!allow) return null;

  return <RegisterTemplate {...props} />;
}
