"use client";

import { useEffect, useState } from "react";

import { UserDetailDialog } from "@/components/organisms/user-detail-dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FirebaseAuthRepository } from "@/infrastructure/firebase/authRepository";
import {
  type AttendanceRecord,
  type Role,
  ROLES,
  type User,
} from "@/lib/types";
import { formatJst } from "@/lib/utils";

const roles: Role[] = Object.values(ROLES);

const sampleAttendance: AttendanceRecord[] = [
  {
    id: 1,
    userId: "sample",
    date: "2024-12-01",
    start: "2024-12-01T09:00:00",
    end: "2024-12-01T18:00:00",
    breaks: [],
    plannedStart: "09:00",
    plannedEnd: "18:00",
  },
  {
    id: 2,
    userId: "sample",
    date: "2024-12-05",
    breaks: [],
    plannedStart: "10:00",
    plannedEnd: "17:00",
  },
];

function attendanceForRole(role: Role) {
  return role === ROLES.OWNER ? [] : sampleAttendance;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  useEffect(() => {
    const repo = new FirebaseAuthRepository();
    repo
      .listUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const filtered =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">ユーザー管理</h1>

      <div className="flex items-center gap-2">
        <Label htmlFor="role">ロール</Label>
        <select
          id="role"
          className="border rounded p-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
        >
          <option value="all">すべて</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">氏名</TableHead>
            <TableHead className="w-52">Email</TableHead>
            <TableHead className="w-32">ロール</TableHead>
            <TableHead className="w-40">登録日</TableHead>
            <TableHead className="w-40">更新日</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="w-40 truncate">{u.name}</TableCell>
              <TableCell className="w-52 truncate">{u.email}</TableCell>
              <TableCell className="w-32 truncate">{u.role}</TableCell>
              <TableCell className="w-40 truncate">
                {formatJst(u.createdAt)}
              </TableCell>
              <TableCell className="w-40 truncate">
                {formatJst(u.updatedAt)}
              </TableCell>
              <TableCell className="w-24">
                <UserDetailDialog
                  user={u}
                  attendance={attendanceForRole(u.role)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
