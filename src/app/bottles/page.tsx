"use client";

import { useEffect, useMemo, useState } from "react";

import { CustomerSelect } from "@/components/atoms/customer-select";
import { type ErrorInfo, ErrorToast } from "@/components/atoms/error-toast";
import { KeepDetailDialog } from "@/components/organisms/keep-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomers } from "@/hooks/useCustomers";
import { bottleRepository } from "@/infrastructure/firebase/bottleRepository";
import { loadCurrentUser } from "@/lib/auth";
import { type Keep, type Product, type User } from "@/lib/types";

export default function BottlesPage() {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">ボトル管理</h1>

      {currentUser === undefined ? (
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      ) : currentUser === null ? (
        <p>ログインが必要です</p>
      ) : (
        <BottlesContent currentUser={currentUser} />
      )}
    </div>
  );
}

function BottlesContent({ currentUser }: { currentUser: User }) {
  const {
    customers,
    selectedId: selectedCustomer,
    setSelectedId: setSelectedCustomer,
    error: customerError,
    nameById: customerNameById,
  } = useCustomers(currentUser);

  const [products, setProducts] = useState<Product[]>([]);
  const [keeps, setKeeps] = useState<Keep[]>([]);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingKeepId, setEditingKeepId] = useState<number | null>(null);

  const [tab, setTab] = useState<"master" | "keeps">("master");
  const [productSearch, setProductSearch] = useState("");
  const [keepSearch, setKeepSearch] = useState("");

  useEffect(() => {
    bottleRepository
      .listProducts()
      .then((ps) => {
        setProducts(ps);
        if (ps.length > 0) setSelectedProduct(ps[0].id);
      })
      .catch(() =>
        setError({ id: Date.now(), message: "商品の取得に失敗しました" }),
      );
    bottleRepository
      .listKeeps()
      .then(setKeeps)
      .catch(() =>
        setError({ id: Date.now(), message: "キープの取得に失敗しました" }),
      );
  }, []);

  const addProduct = async () => {
    if (!productName || !price) {
      setError({ id: Date.now(), message: "登録に失敗しました" });
      return;
    }
    const p: Product = {
      id: editingProductId ?? Date.now(),
      name: productName,
      price: Number(price),
    };
    try {
      await bottleRepository.saveProduct(p);
      setProducts((prev) =>
        editingProductId
          ? prev.map((prod) => (prod.id === editingProductId ? p : prod))
          : [...prev, p],
      );
      if (!editingProductId && selectedProduct === 0) setSelectedProduct(p.id);
      setError(null);
      setProductName("");
      setPrice("");
      setEditingProductId(null);
    } catch {
      setError({ id: Date.now(), message: "登録に失敗しました" });
    }
  };

  const editProduct = (id: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setProductName(prod.name);
    setPrice(String(prod.price));
    setEditingProductId(id);
    setTab("master");
  };

  const deleteProduct = async (id: number) => {
    try {
      await bottleRepository.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingProductId === id) {
        setProductName("");
        setPrice("");
        setEditingProductId(null);
      }
      setError(null);
    } catch {
      setError({ id: Date.now(), message: "削除に失敗しました" });
    }
  };

  const addKeep = async () => {
    const k: Keep = {
      id: editingKeepId ?? Date.now(),
      customerId: selectedCustomer,
      productId: selectedProduct,
    };
    try {
      await bottleRepository.saveKeep(k);
      setKeeps((prev) =>
        editingKeepId
          ? prev.map((keep) => (keep.id === editingKeepId ? k : keep))
          : [...prev, k],
      );
      setEditingKeepId(null);
      setError(null);
    } catch {
      setError({ id: Date.now(), message: "登録に失敗しました" });
    }
  };

  const editKeep = (id: number) => {
    const keep = keeps.find((k) => k.id === id);
    if (!keep) return;
    setSelectedCustomer(keep.customerId);
    setSelectedProduct(keep.productId);
    setEditingKeepId(id);
    setTab("keeps");
  };

  const deleteKeep = async (id: number) => {
    try {
      await bottleRepository.deleteKeep(id);
      setKeeps((prev) => prev.filter((k) => k.id !== id));
      if (editingKeepId === id) {
        setSelectedCustomer(customers[0]?.id ?? 0);
        setSelectedProduct(products[0]?.id ?? 0);
        setEditingKeepId(null);
      }
      setError(null);
    } catch {
      setError({ id: Date.now(), message: "削除に失敗しました" });
    }
  };

  const productNameById = (id: number) =>
    products.find((p) => p.id === id)?.name || "";

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const nameHit = p.name.toLowerCase().includes(q);
      const priceHit = String(p.price).includes(q);
      return nameHit || priceHit;
    });
  }, [products, productSearch]);

  const filteredKeeps = useMemo(() => {
    const q = keepSearch.trim().toLowerCase();
    if (!q) return keeps;
    return keeps.filter((k) => {
      const cname = customerNameById(k.customerId)?.toLowerCase() ?? "";
      const pname = productNameById(k.productId)?.toLowerCase() ?? "";
      return cname.includes(q) || pname.includes(q) || String(k.id).includes(q);
    });
  }, [keeps, keepSearch, customerNameById, productNameById]);

  return (
    <div className="space-y-4">
      <ErrorToast error={error || customerError} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="master">酒のマスタ</TabsTrigger>
          <TabsTrigger value="keeps">顧客のボトル</TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="商品名"
            />
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="価格"
              type="number"
            />
            <Button onClick={addProduct} className="bg-blue-500 text-white">
              {editingProductId ? "更新" : "マスタ追加"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="商品名/価格で絞り込み"
            />
            {productSearch && (
              <Button
                variant="outline"
                onClick={() => setProductSearch("")}
                className="bg-white text-black"
              >
                クリア
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-40">商品名</TableHead>
                <TableHead className="w-32">価格</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="w-16">{p.id}</TableCell>
                  <TableCell className="w-40 truncate">{p.name}</TableCell>
                  <TableCell className="w-32">{p.price}</TableCell>
                  <TableCell className="w-32 flex gap-2">
                    <Button
                      onClick={() => editProduct(p.id)}
                      className="bg-yellow-500 text-white"
                    >
                      編集
                    </Button>
                    <Button
                      onClick={() => deleteProduct(p.id)}
                      className="bg-red-500 text-white"
                    >
                      削除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="keeps" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <CustomerSelect
              customers={customers}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              className="border px-2 py-1"
            />
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              className="border px-2 py-1"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button onClick={addKeep} className="bg-green-500 text-white">
              {editingKeepId ? "更新" : "キープ登録"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={keepSearch}
              onChange={(e) => setKeepSearch(e.target.value)}
              placeholder="顧客名 / 商品名 / ID で絞り込み"
            />
            {keepSearch && (
              <Button
                variant="outline"
                onClick={() => setKeepSearch("")}
                className="bg-white text-black"
              >
                クリア
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-40">顧客</TableHead>
                <TableHead className="w-40">ボトル</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeeps.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="w-16">{k.id}</TableCell>
                  <TableCell className="w-40 truncate">
                    {customerNameById(k.customerId)}
                  </TableCell>
                  <TableCell className="w-40 truncate">
                    {productNameById(k.productId)}
                  </TableCell>
                  <TableCell className="w-24 flex gap-2">
                    <KeepDetailDialog
                      keep={k}
                      customerName={customerNameById(k.customerId)}
                      productName={productNameById(k.productId)}
                    />
                    <Button
                      onClick={() => editKeep(k.id)}
                      className="bg-yellow-500 text-white"
                    >
                      編集
                    </Button>
                    <Button
                      onClick={() => deleteKeep(k.id)}
                      className="bg-red-500 text-white"
                    >
                      削除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
