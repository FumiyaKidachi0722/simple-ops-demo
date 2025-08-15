import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttendanceRecord, User } from "@/lib/types";
import { formatJst, formatJstTime, workDuration } from "@/lib/utils";

import DetailDialog from "./detail-dialog";

export type UserDetailDialogProps = {
  user: User;
  attendance: AttendanceRecord[];
};

export function UserDetailDialog({ user, attendance }: UserDetailDialogProps) {
  return (
    <DetailDialog title="ユーザー詳細">
      <div className="space-y-2 text-sm">
        <div>氏名: {user.name}</div>
        <div>Email: {user.email}</div>
        <div>ロール: {user.role}</div>
        <div>登録日: {formatJst(user.createdAt)}</div>
        <div>更新日: {formatJst(user.updatedAt)}</div>
      </div>
      {attendance.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="font-medium">勤怠情報</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">日付</TableHead>
                <TableHead className="w-32">開始</TableHead>
                <TableHead className="w-32">終了</TableHead>
                <TableHead className="w-40">予定</TableHead>
                <TableHead className="w-24">実働時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="w-32 truncate">{rec.date}</TableCell>
                  <TableCell className="w-32 truncate">
                    {formatJstTime(rec.start) || "-"}
                  </TableCell>
                  <TableCell className="w-32 truncate">
                    {formatJstTime(rec.end) || "-"}
                  </TableCell>
                  <TableCell className="w-40 truncate">
                    {rec.plannedStart
                      ? `${rec.plannedStart} - ${rec.plannedEnd}`
                      : "-"}
                  </TableCell>
                  <TableCell className="w-24">{workDuration(rec)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DetailDialog>
  );
}

export default UserDetailDialog;
