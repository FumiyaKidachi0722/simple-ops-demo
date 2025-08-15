import type { Customer } from "@/lib/types";

import DetailDialog from "./detail-dialog";

export type CustomerDetailDialogProps = {
  customer: Customer;
  castName: string;
};

export function CustomerDetailDialog({
  customer,
  castName,
}: CustomerDetailDialogProps) {
  const visitsDesc = [...(customer.visits ?? [])].sort((a, b) =>
    b.localeCompare(a),
  );
  const lastVisit = visitsDesc[0];

  return (
    <DetailDialog title="顧客詳細">
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 sm:col-span-1">ID</div>
          <div className="col-span-3 sm:col-span-2">{customer.id}</div>

          <div className="col-span-3 sm:col-span-1">名前</div>
          <div className="col-span-3 sm:col-span-2">{customer.name}</div>

          <div className="col-span-3 sm:col-span-1">誕生日</div>
          <div className="col-span-3 sm:col-span-2">
            {customer.birthday || "-"}
          </div>

          <div className="col-span-3 sm:col-span-1">好きなお酒</div>
          <div className="col-span-3 sm:col-span-2">
            {customer.favoriteDrink || "-"}
          </div>

          <div className="col-span-3 sm:col-span-1">席の好み</div>
          <div className="col-span-3 sm:col-span-2">
            {customer.seatPreference || "-"}
          </div>

          <div className="col-span-3 sm:col-span-1">ボトル</div>
          <div className="col-span-3 sm:col-span-2">
            {customer.bottle || "-"}
          </div>

          <div className="col-span-3 sm:col-span-1">担当キャスト</div>
          <div className="col-span-3 sm:col-span-2">{castName}</div>

          <div className="col-span-3 sm:col-span-1">タグ</div>
          <div className="col-span-3 sm:col-span-2">
            {(customer.tags ?? []).length > 0 ? customer.tags.join(", ") : "-"}
          </div>

          <div className="col-span-3 sm:col-span-1">最終来店日</div>
          <div className="col-span-3 sm:col-span-2">{lastVisit || "-"}</div>
        </div>

        <div className="pt-2">
          <div className="font-medium">来店履歴</div>
          {visitsDesc.length === 0 ? (
            <div className="text-muted-foreground">-</div>
          ) : (
            <div className="mt-2 max-h-48 overflow-auto rounded border">
              <ul className="divide-y">
                {visitsDesc.slice(0, 50).map((d, idx) => (
                  <li key={`${d}-${idx}`} className="px-3 py-2">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DetailDialog>
  );
}
