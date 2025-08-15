"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { AttendanceDetailDialog } from "@/components/organisms/attendance-detail-dialog";
import { AttendanceEditDialog } from "@/components/organisms/attendance-edit-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth, db } from "@/lib/firebase";
import { canManage } from "@/lib/roles";
import type { AttendanceRecord, User } from "@/lib/types";
import { breakDuration, formatJstTime, workDuration } from "@/lib/utils";

export default function AttendancePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleDate, setScheduleDate] = useState(today);
  const [scheduleStart, setScheduleStart] = useState("09:00");
  const [scheduleEnd, setScheduleEnd] = useState("18:00");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [current, setCurrent] = useState<AttendanceRecord | null>(null);
  const [onBreak, setOnBreak] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      const snap = await getDoc(doc(db, "users", u.uid));
      const info = snap.data() as User | undefined;
      if (!info) {
        router.replace("/login");
        return;
      }
      setCurrentUser(info);
      setTargetUserId(info.id);
      if (canManage(info.role)) {
        const list = await getDocs(collection(db, "users"));
        const filtered = list.docs
          .map((d) => d.data() as User)
          .filter((usr) => usr.role === "cast" || usr.role === "staff");
        setUsers(filtered);
      }
    });
    return () => unsub();
  }, [router]);
  const fetchRecords = useCallback(async () => {
    const list = await getDocs(collection(db, "attendances"));
    const data = list.docs.map((d) => d.data() as AttendanceRecord);
    setRecords(data);
    const cur = data.find(
      (r) => r.userId === targetUserId && r.date === selectedDate && !r.end,
    );
    setCurrent(cur || null);
    if (cur) {
      const br = cur.breaks;
      setOnBreak(br.length > 0 && !br[br.length - 1].end);
    }
  }, [targetUserId, selectedDate]);

  useEffect(() => {
    setCurrent(null);
    setOnBreak(false);
    fetchRecords();
  }, [fetchRecords]);

  const canManageOthers = currentUser && canManage(currentUser.role);
  const isSelf = currentUser && targetUserId === currentUser.id;

  const clockIn = async () => {
    if (current) {
      toast.error("既に出勤しています");
      return;
    }
    const existing = records.find(
      (r) => r.date === selectedDate && r.userId === targetUserId,
    );
    const rec: AttendanceRecord = {
      id: existing ? existing.id : Date.now(),
      userId: targetUserId,
      date: selectedDate,
      start: new Date().toISOString(),
      breaks: existing?.breaks ?? [],
      ...(existing?.plannedStart
        ? { plannedStart: existing.plannedStart }
        : {}),
      ...(existing?.plannedEnd ? { plannedEnd: existing.plannedEnd } : {}),
    };
    setCurrent(rec);
    setRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.date === rec.date && r.userId === rec.userId,
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...rec };
        return updated;
      }
      return [...prev, rec];
    });
    await setDoc(doc(db, "attendances", rec.id.toString()), rec, {
      merge: true,
    });
    await fetchRecords();
  };

  const startBreak = async () => {
    if (!current) {
      toast.error("出勤していません");
      return;
    }
    if (onBreak) {
      toast.error("既に休憩中です");
      return;
    }
    const b = { start: new Date().toISOString() };
    const updated = { ...current, breaks: [...current.breaks, b] };
    setCurrent(updated);
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setOnBreak(true);
    await setDoc(doc(db, "attendances", updated.id.toString()), updated, {
      merge: true,
    });
    await fetchRecords();
  };

  const endBreak = async () => {
    if (!current) {
      toast.error("出勤していません");
      return;
    }
    if (!onBreak) {
      toast.error("休憩中ではありません");
      return;
    }
    const breaks = [...current.breaks];
    breaks[breaks.length - 1].end = new Date().toISOString();
    const updated = { ...current, breaks };
    setCurrent(updated);
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setOnBreak(false);
    await setDoc(doc(db, "attendances", updated.id.toString()), updated, {
      merge: true,
    });
    await fetchRecords();
  };

  const clockOut = async () => {
    if (!current) {
      toast.error("既に退勤しています");
      return;
    }
    const finished = { ...current, end: new Date().toISOString() };
    setRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.date === finished.date && r.userId === finished.userId,
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...finished };
        return updated;
      }
      return [...prev, finished];
    });
    await setDoc(doc(db, "attendances", finished.id.toString()), finished, {
      merge: true,
    });
    setCurrent(null);
    setOnBreak(false);
    await fetchRecords();
  };

  const addSchedule = async () => {
    const idx = records.findIndex(
      (r) => r.date === scheduleDate && r.userId === targetUserId,
    );
    let data: AttendanceRecord;
    if (idx >= 0) {
      data = {
        ...records[idx],
        plannedStart: scheduleStart,
        plannedEnd: scheduleEnd,
      };
      setRecords((prev) => {
        const updated = [...prev];
        updated[idx] = data;
        return updated;
      });
    } else {
      data = {
        id: Date.now(),
        userId: targetUserId,
        date: scheduleDate,
        breaks: [],
        plannedStart: scheduleStart,
        plannedEnd: scheduleEnd,
      };
      setRecords((prev) => [...prev, data]);
    }
    await setDoc(doc(db, "attendances", data.id.toString()), data, {
      merge: true,
    });
  };

  const handleUpdate = (rec: AttendanceRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
  };

  const filteredRecords = records.filter((r) => r.userId === targetUserId);
  const totalMinutes = filteredRecords.reduce((sum, r) => {
    const wd = workDuration(r);
    const m = parseInt(wd, 10);
    return sum + (isNaN(m) ? 0 : m);
  }, 0);
  const totalDuration = totalMinutes > 0 ? `${totalMinutes}分` : "-";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">勤怠打刻</h1>
      <div className="flex items-center gap-2">
        <label htmlFor="date">日付</label>
        <input
          id="date"
          type="date"
          className="border rounded p-1"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button
          onClick={clockIn}
          className="bg-blue-500 text-white px-3 py-1"
          disabled={!isSelf}
        >
          出勤
        </button>
        <button
          onClick={startBreak}
          className="bg-yellow-500 text-white px-3 py-1"
          disabled={!isSelf}
        >
          休憩開始
        </button>
        <button
          onClick={endBreak}
          className="bg-yellow-600 text-white px-3 py-1"
          disabled={!isSelf}
        >
          休憩終了
        </button>
        <button
          onClick={clockOut}
          className="bg-green-500 text-white px-3 py-1"
          disabled={!isSelf}
        >
          退勤
        </button>
      </div>

      {canManageOthers && (
        <div className="flex items-center gap-2">
          <label htmlFor="user">ユーザー</label>
          <select
            id="user"
            className="border rounded p-1"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          >
            <option value={currentUser.id}>{currentUser.name}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span>出勤予定追加</span>
        <input
          type="date"
          className="border rounded p-1"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
        />
        <input
          type="time"
          className="border rounded p-1"
          value={scheduleStart}
          onChange={(e) => setScheduleStart(e.target.value)}
        />
        <input
          type="time"
          className="border rounded p-1"
          value={scheduleEnd}
          onChange={(e) => setScheduleEnd(e.target.value)}
        />
        <button
          onClick={addSchedule}
          className="bg-purple-500 text-white px-3 py-1"
        >
          追加
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">日付</TableHead>
            <TableHead className="w-32">開始</TableHead>
            <TableHead className="w-32">終了</TableHead>
            <TableHead className="w-40">予定</TableHead>
            <TableHead className="w-24">休憩時間</TableHead>
            <TableHead className="w-24">実働時間</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="w-32 truncate">{r.date}</TableCell>
              <TableCell className="w-32 truncate">
                {formatJstTime(r.start) || "-"}
                {r.manualStart && (
                  <div className="text-xs text-red-500">
                    {formatJstTime(r.manualStart)}
                  </div>
                )}
              </TableCell>
              <TableCell className="w-32 truncate">
                {formatJstTime(r.end) || "-"}
                {r.manualEnd && (
                  <div className="text-xs text-red-500">
                    {formatJstTime(r.manualEnd)}
                  </div>
                )}
              </TableCell>
              <TableCell className="w-40 truncate">
                {r.plannedStart ? `${r.plannedStart} - ${r.plannedEnd}` : "-"}
              </TableCell>
              <TableCell className="w-24">{breakDuration(r)}</TableCell>
              <TableCell className="w-24">{workDuration(r)}</TableCell>
              <TableCell className="w-32 flex gap-1">
                <AttendanceDetailDialog record={r} />
                <AttendanceEditDialog record={r} onUpdate={handleUpdate} />
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="w-32 font-bold">合計</TableCell>
            <TableCell className="w-32" />
            <TableCell className="w-32" />
            <TableCell className="w-40" />
            <TableCell className="w-24" />
            <TableCell className="w-24">{totalDuration}</TableCell>
            <TableCell className="w-32" />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
