"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cast } from "@/lib/types";

export type CustomerFormValues = {
  name: string;
  tags: string;
  birthday: string;
  favoriteDrink: string;
  seatPreference: string;
  bottle: string;
  castId: string;
};

const defaultValues: CustomerFormValues = {
  name: "",
  tags: "",
  birthday: "",
  favoriteDrink: "",
  seatPreference: "",
  bottle: "",
  castId: "",
};

export type CustomerFormProps = {
  initialValues?: CustomerFormValues;
  onSubmit: (values: CustomerFormValues) => Promise<boolean>;
  submitLabel?: string;
  castOptions: Cast[];
};

export function CustomerForm({
  initialValues,
  onSubmit,
  submitLabel = "追加",
  castOptions,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(
    initialValues ?? defaultValues,
  );
  const [submitting, setSubmitting] = useState(false);

  const [castQuery, setCastQuery] = useState("");
  const filteredCasts = useMemo(() => {
    const q = castQuery.trim().toLowerCase();
    if (!q) return castOptions;
    return castOptions.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );
  }, [castQuery, castOptions]);

  const selectedCast = useMemo(
    () => castOptions.find((c) => c.id === values.castId),
    [values.castId, castOptions],
  );

  const update =
    (field: keyof CustomerFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues({ ...values, [field]: e.target.value });

  const submit = async () => {
    if (submitting) return;
    if (!values.name.trim()) return;
    setSubmitting(true);
    try {
      const success = await onSubmit(values);
      if (success && !initialValues) {
        setValues(defaultValues);
        setCastQuery("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showSelectedGhost =
    selectedCast && !filteredCasts.some((c) => c.id === selectedCast.id);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          value={values.name}
          onChange={update("name")}
          disabled={submitting}
          placeholder="例）山田 太郎"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">タグ（カンマ区切り）</Label>
        <Input
          id="tags"
          value={values.tags}
          onChange={update("tags")}
          disabled={submitting}
          placeholder="例）常連, VIP, 喫煙"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthday">誕生日</Label>
        <Input
          id="birthday"
          value={values.birthday}
          onChange={update("birthday")}
          type="date"
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="favoriteDrink">好きなお酒</Label>
        <Input
          id="favoriteDrink"
          value={values.favoriteDrink}
          onChange={update("favoriteDrink")}
          disabled={submitting}
          placeholder="例）ハイボール"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seatPreference">席の好み</Label>
        <Input
          id="seatPreference"
          value={values.seatPreference}
          onChange={update("seatPreference")}
          disabled={submitting}
          placeholder="例）カウンター奥"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bottle">ボトル</Label>
        <Input
          id="bottle"
          value={values.bottle}
          onChange={update("bottle")}
          disabled={submitting}
          placeholder="例）山崎12年"
        />
      </div>

      {/* --- 担当キャスト（検索 + 選択） --- */}
      <div className="space-y-2">
        <Label htmlFor="castQuery">担当キャスト</Label>
        <Input
          id="castQuery"
          value={castQuery}
          onChange={(e) => setCastQuery(e.target.value)}
          disabled={submitting}
          placeholder="担当キャストを検索（名前 / ID で絞り込み）"
        />
        <select
          id="castId"
          value={values.castId}
          onChange={update("castId")}
          className="border px-2 py-1 rounded-md w-full"
          disabled={submitting}
        >
          <option value="">選択してください</option>

          {/* フィルタで消えた場合も選択状態を維持するための一時挿入 */}
          {showSelectedGhost && selectedCast && (
            <option value={selectedCast.id}>
              {selectedCast.name}（選択中）
            </option>
          )}

          {filteredCasts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          ※
          未選択の場合は、登録時に現在のログインユーザーが担当として設定されます。
        </p>
      </div>

      <Button onClick={submit} disabled={submitting} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
