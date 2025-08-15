import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Bill } from "@/lib/types";

import DetailDialog from "./detail-dialog";

export type BillDetailDialogProps = {
  bill: Bill;
  customerName: string;
  total: number;
};

export function BillDetailDialog({
  bill,
  customerName,
  total,
}: BillDetailDialogProps) {
  return (
    <DetailDialog title="伝票詳細">
      <div className="space-y-2 text-sm">
        <div>ID: {bill.id}</div>
        <div>顧客: {customerName}</div>
        <div>キャスト: {bill.cast}</div>
        <div>登録日時: {bill.createdAt}</div>
        <div>合計: {total}円</div>
      </div>
      <div className="mt-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">内容</TableHead>
              <TableHead className="w-24">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="w-48 truncate">{i.description}</TableCell>
                <TableCell className="w-24">{i.amount}円</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DetailDialog>
  );
}

export default BillDetailDialog;
