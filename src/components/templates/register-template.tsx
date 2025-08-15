"use client";

import { useState } from "react";
import { registerUser } from "@application/auth/register";
import { FirebaseAuthRepository } from "@infrastructure/firebase/authRepository";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

import { type ErrorInfo, ErrorToast } from "@/components/atoms/error-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LinkItem, Role } from "@/lib/types";
import {
  EMAIL_PATTERN,
  EMAIL_PATTERN_MESSAGE,
  PASSWORD_PATTERN,
  PASSWORD_PATTERN_MESSAGE,
} from "@/lib/validators";

export type RoleOption = { value: Role; label: string };

export type RegisterTemplateProps = {
  title: string;
  defaultRole: Role;
  links: LinkItem[];
  roleOptions?: RoleOption[];
};

export function RegisterTemplate({
  title,
  defaultRole,
  links,
  roleOptions = [],
}: RegisterTemplateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const repo = new FirebaseAuthRepository();
      await registerUser(repo, email, password, name, role);
      setName("");
      setEmail("");
      setPassword("");
      setRole(defaultRole);
      toast.info("登録に成功しました");
    } catch (err) {
      setError({ id: Date.now(), message: getRegisterErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  function getRegisterErrorMessage(error: unknown): string {
    if (typeof error === "object" && error && "code" in error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        return "既に登録されているメールアドレスです";
      }
    }
    return "登録に失敗しました";
  }

  return (
    <main className="px-4 py-8 mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">氏名</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
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
        {roleOptions.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Role</legend>
            <div className="flex items-center space-x-4">
              {roleOptions.map((option) => (
                <Label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    disabled={isLoading}
                  />
                  {option.label}
                </Label>
              ))}
            </div>
          </fieldset>
        )}
        <Button
          type="submit"
          className="w-full"
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              登録中...
            </>
          ) : (
            "登録"
          )}
        </Button>
        {links.map(({ href, label }) => (
          <p key={href} className="mt-2 text-sm">
            <Link href={href} className="text-primary hover:underline">
              {label}
            </Link>
          </p>
        ))}
      </form>

      <ErrorToast error={error} />
    </main>
  );
}
