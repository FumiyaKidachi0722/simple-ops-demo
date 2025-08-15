"use client";

import { ProtectedRegisterTemplate } from "@/components/templates/protected-register-template";
import { CAST_REGISTER_LINK, STAFF_REGISTER_LINK } from "@/lib/constants";
import { ROLES } from "@/lib/types";

export default function ManagerRegisterPage() {
  return (
    <ProtectedRegisterTemplate
      title="管理者登録"
      defaultRole="manager"
      roleOptions={[{ value: "manager", label: "マネージャー" }]}
      links={[STAFF_REGISTER_LINK, CAST_REGISTER_LINK]}
      allowedRoles={[ROLES.OWNER]}
    />
  );
}
