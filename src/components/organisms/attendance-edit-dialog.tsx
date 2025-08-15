"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import type { AttendanceRecord } from "@/lib/types";
import { formatJstTime } from "@/lib/utils";

import DetailDialog from "./detail-dialog";

export type AttendanceEditDialogProps = {
  record: AttendanceRecord;
  onUpdate: (rec: AttendanceRecord) => void;
};

export function AttendanceEditDialog({
  record,
  onUpdate,
}: AttendanceEditDialogProps) {
  const toTimeValue = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Tokyo",
        })
      : "";
  const [start, setStart] = useState(
    toTimeValue(record.manualStart ?? record.start),
  );
  const [end, setEnd] = useState(toTimeValue(record.manualEnd ?? record.end));
  const [plannedStart, setPlannedStart] = useState(record.plannedStart ?? "");
  const [plannedEnd, setPlannedEnd] = useState(record.plannedEnd ?? "");
  const [manualBreaks, setManualBreaks] = useState(() =>
    (record.manualBreaks && record.manualBreaks.length > 0
      ? record.manualBreaks
      : record.breaks
    ).map((b) => ({
      start: toTimeValue(b.start),
      end: toTimeValue(b.end),
    })),
  );

  const updateBreak = (i: number, field: "start" | "end", value: string) => {
    setManualBreaks((prev) => {
      const arr = [...prev];
      arr[i] = { ...arr[i], [field]: value };
      return arr;
    });
  };

  const addBreak = () =>
    setManualBreaks((prev) => [...prev, { start: "", end: "" }]);

  const save = async () => {
    const payload: Partial<AttendanceRecord> = {};
    if (start)
      payload.manualStart = new Date(`${record.date}T${start}`).toISOString();
    if (end)
      payload.manualEnd = new Date(`${record.date}T${end}`).toISOString();
    if (plannedStart) payload.plannedStart = plannedStart;
    if (plannedEnd) payload.plannedEnd = plannedEnd;
    payload.manualBreaks = manualBreaks
      .map((b) => ({
        start: b.start
          ? new Date(`${record.date}T${b.start}`).toISOString()
          : undefined,
        end: b.end
          ? new Date(`${record.date}T${b.end}`).toISOString()
          : undefined,
      }))
      .filter((b) => b.start || b.end);
    await setDoc(doc(db, "attendances", record.id.toString()), payload, {
      merge: true,
    });
    onUpdate({ ...record, ...payload });
    toast.info("保存に成功しました");
  };

  return (
    <DetailDialog
      title="勤怠編集"
      trigger={
        <Button variant="outline" size="sm">
          編集
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        <div>開始(打刻): {formatJstTime(record.start) || "-"}</div>
        <div>開始(修正)</div>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border rounded p-1"
        />
        <div>終了(打刻): {formatJstTime(record.end) || "-"}</div>
        <div>終了(修正)</div>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border rounded p-1"
        />
        <div>予定開始</div>
        <input
          type="time"
          value={plannedStart}
          onChange={(e) => setPlannedStart(e.target.value)}
          className="border rounded p-1"
        />
        <div>予定終了</div>
        <input
          type="time"
          value={plannedEnd}
          onChange={(e) => setPlannedEnd(e.target.value)}
          className="border rounded p-1"
        />
        {manualBreaks.map((b, i) => (
          <div key={i} className="space-y-1">
            <div>
              休憩{`${i + 1}`}(打刻開始):{" "}
              {formatJstTime(record.breaks[i]?.start) || "-"}
            </div>
            <div>
              休憩{`${i + 1}`}(打刻終了):{" "}
              {formatJstTime(record.breaks[i]?.end) || "-"}
            </div>
            <div>休憩{`${i + 1}`}(修正開始)</div>
            <input
              type="time"
              value={b.start}
              onChange={(e) => updateBreak(i, "start", e.target.value)}
              className="border rounded p-1"
            />
            <div>休憩{`${i + 1}`}(修正終了)</div>
            <input
              type="time"
              value={b.end}
              onChange={(e) => updateBreak(i, "end", e.target.value)}
              className="border rounded p-1"
            />
          </div>
        ))}
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={addBreak}>
            休憩追加
          </Button>
          <Button onClick={save}>保存</Button>
        </div>
      </div>
    </DetailDialog>
  );
}

export default AttendanceEditDialog;
