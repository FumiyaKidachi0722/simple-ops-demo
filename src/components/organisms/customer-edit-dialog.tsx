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
import type { Cast, Customer } from "@/lib/types";

export type CustomerEditDialogProps = {
  customer: Customer;
  onUpdateCustomer: (
    id: number,
    values: CustomerFormValues,
  ) => Promise<boolean>;
  castOptions: Cast[];
};

export function CustomerEditDialog({
  customer,
  onUpdateCustomer,
  castOptions,
}: CustomerEditDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUpdate = async (values: CustomerFormValues) => {
    const success = await onUpdateCustomer(customer.id, values);
    if (success) {
      setOpen(false);
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          編集
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>顧客編集</DialogTitle>
        </DialogHeader>
        <CustomerForm
          initialValues={{
            name: customer.name,
            tags: customer.tags.join(", "),
            birthday: customer.birthday ?? "",
            favoriteDrink: customer.favoriteDrink ?? "",
            seatPreference: customer.seatPreference ?? "",
            bottle: customer.bottle ?? "",
            castId: customer.castId,
          }}
          onSubmit={handleUpdate}
          submitLabel="更新"
          castOptions={castOptions}
        />
      </DialogContent>
    </Dialog>
  );
}
