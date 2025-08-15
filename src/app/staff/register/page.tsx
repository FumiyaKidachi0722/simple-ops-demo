"use client";

import { ProtectedRegisterTemplate } from "@/components/templates/protected-register-template";
import { CAST_REGISTER_LINK, MANAGER_REGISTER_LINK } from "@/lib/constants";

export default function StaffRegisterPage() {
  return (
    <ProtectedRegisterTemplate
      title="スタッフ登録"
      defaultRole="staff"
      links={[CAST_REGISTER_LINK, MANAGER_REGISTER_LINK]}
    />
  );
}
