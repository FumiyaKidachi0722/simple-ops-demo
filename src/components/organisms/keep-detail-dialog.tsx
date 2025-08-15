import type { Keep } from "@/lib/types";

import DetailDialog from "./detail-dialog";

export type KeepDetailDialogProps = {
  keep: Keep;
  customerName: string;
  productName: string;
};

export function KeepDetailDialog({
  keep,
  customerName,
  productName,
}: KeepDetailDialogProps) {
  return (
    <DetailDialog title="キープ詳細">
      <div className="space-y-2 text-sm">
        <div>ID: {keep.id}</div>
        <div>顧客: {customerName}</div>
        <div>ボトル: {productName}</div>
      </div>
    </DetailDialog>
  );
}

export default KeepDetailDialog;
