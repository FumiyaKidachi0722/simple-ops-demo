"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { type ErrorInfo, ErrorToast } from "@/components/atoms/error-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCurrentUser } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/lib/types";
import {
  EMAIL_PATTERN,
  EMAIL_PATTERN_MESSAGE,
  PASSWORD_PATTERN,
  PASSWORD_PATTERN_MESSAGE,
} from "@/lib/validators";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        toast.info("既にログインしています");
        router.replace("/");
      }
      // Unsubscribe after the first check to avoid showing the
      // "既にログインしています" message right after a successful login.
      unsub();
    });
    // The returned cleanup is effectively a no-op because we unsubscribe above,
    // but returning the function satisfies React's expectations.
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const snap = await getDoc(doc(db, "users", credential.user.uid));
      const info = snap.data() as User | undefined;
      if (!info) {
        throw new Error("user not found");
      }
      saveCurrentUser(info);
      toast.success("ログインに成功しました");
      setEmail("");
      setPassword("");
      router.replace("/");
    } catch {
      setError({ id: Date.now(), message: "ログインに失敗しました" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="px-4 py-8 mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">ログイン</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            pattern={EMAIL_PATTERN.source}
            title={EMAIL_PATTERN_MESSAGE}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            pattern={PASSWORD_PATTERN.source}
            title={PASSWORD_PATTERN_MESSAGE}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> ログイン中...
            </>
          ) : (
            "ログイン"
          )}
        </Button>
      </form>
      <ErrorToast error={error} />
    </main>
  );
}
