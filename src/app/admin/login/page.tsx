"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/agenda";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(from);
    } else {
      setError("Clave incorrecta");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-brand-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-center text-xl font-bold text-brand-900">
          Admin
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Clave de acceso"
          className="w-full rounded-lg border border-brand-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          autoFocus
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full rounded-lg bg-brand-900 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {loading ? "..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
