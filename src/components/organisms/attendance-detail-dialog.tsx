import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttendanceRecord } from "@/lib/types";
import { formatJstTime, workDuration } from "@/lib/utils";

import DetailDialog from "./detail-dialog";

export type AttendanceDetailDialogProps = {
  record: AttendanceRecord;
};

export function AttendanceDetailDialog({
  record,
}: AttendanceDetailDialogProps) {
  return (
    <DetailDialog title="勤怠詳細">
      <div className="space-y-2 text-sm">
        <div>日付: {record.date}</div>
        <div>
          予定:{" "}
          {record.plannedStart
            ? `${record.plannedStart} - ${record.plannedEnd}`
            : "-"}
        </div>
        <div>
          開始: {formatJstTime(record.start) || "-"}
          {record.manualStart && (
            <span className="ml-2 text-red-500 text-xs">
              {formatJstTime(record.manualStart)}
            </span>
          )}
        </div>
        <div>
          終了: {formatJstTime(record.end) || "-"}
          {record.manualEnd && (
            <span className="ml-2 text-red-500 text-xs">
              {formatJstTime(record.manualEnd)}
            </span>
          )}
        </div>
        <div>実働時間: {workDuration(record)}</div>
        {(() => {
          const breakCount = Math.max(
            record.breaks.length,
            record.manualBreaks?.length ?? 0,
          );
          return (
            breakCount > 0 && (
              <div className="mt-2 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">休憩開始</TableHead>
                      <TableHead className="w-40">休憩終了</TableHead>
                      <TableHead className="w-40">修正開始</TableHead>
                      <TableHead className="w-40">修正終了</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: breakCount }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="w-40 truncate">
                          {formatJstTime(record.breaks[i]?.start) || "-"}
                        </TableCell>
                        <TableCell className="w-40 truncate">
                          {formatJstTime(record.breaks[i]?.end) || "-"}
                        </TableCell>
                        <TableCell className="w-40 truncate">
                          {formatJstTime(record.manualBreaks?.[i]?.start) ||
                            "-"}
                        </TableCell>
                        <TableCell className="w-40 truncate">
                          {formatJstTime(record.manualBreaks?.[i]?.end) || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          );
        })()}
      </div>
    </DetailDialog>
  );
}

export default AttendanceDetailDialog;
