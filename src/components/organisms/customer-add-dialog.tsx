"use client";

import { useState } from "react";

import {
  CustomerForm,
  type CustomerFormValues,
} from "@/components/organisms/customer-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Cast } from "@/lib/types";

export type CustomerAddDialogProps = {
  onAddCustomer: (values: CustomerFormValues) => Promise<boolean>;
  castOptions: Cast[];
};

export function CustomerAddDialog({
  onAddCustomer,
  castOptions,
}: CustomerAddDialogProps) {
  const [open, setOpen] = useState(false);

  const handleAdd = async (values: CustomerFormValues) => {
    const success = await onAddCustomer(values);
    if (success) {
      setOpen(false);
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>顧客登録</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>顧客登録</DialogTitle>
        </DialogHeader>
        <CustomerForm onSubmit={handleAdd} castOptions={castOptions} />
      </DialogContent>
    </Dialog>
  );
}
