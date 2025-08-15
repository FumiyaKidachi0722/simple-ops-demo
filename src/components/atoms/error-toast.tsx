"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";

export type ErrorInfo = { id: number; message: string };

export function ErrorToast({ error }: { error: ErrorInfo | null }) {
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return null;
}
