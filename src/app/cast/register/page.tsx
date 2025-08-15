"use client";

import { ProtectedRegisterTemplate } from "@/components/templates/protected-register-template";
import { MANAGER_REGISTER_LINK, STAFF_REGISTER_LINK } from "@/lib/constants";

export default function CastRegisterPage() {
  return (
    <ProtectedRegisterTemplate
      title="キャスト登録"
      defaultRole="cast"
      links={[STAFF_REGISTER_LINK, MANAGER_REGISTER_LINK]}
    />
  );
}
