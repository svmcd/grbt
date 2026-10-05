"use client";

import { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button, Field, inputClass } from "./ui";

function authMessage(error: unknown) {
    const code = (error as { code?: string })?.code || "";
    if (code === "auth/too-many-requests") return "Too many attempts. Wait a few minutes and try again.";
    if (code === "auth/network-request-failed") return "No connection. Check your internet and try again.";
    if (code === "auth/invalid-email") return "That email address is not valid.";
    return "Wrong email or password.";
}

export function LoginForm({ notice }: { notice?: React.ReactNode }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setInfo("");
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (err) {
            setError(authMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const reset = async () => {
        setError("");
        setInfo("");
        if (!email.trim()) {
            setError("Type your email address first, then click “Forgot password?”.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email.trim());
        } catch (err) {
            const code = (err as { code?: string })?.code;
            if (code === "auth/invalid-email") {
                setError("That email address is not valid.");
                return;
            }
            // Other errors (e.g. unknown user) get the same answer, so the form does not reveal accounts
        }
        setInfo("If this email has an account, a reset link is on its way. Check your inbox (and spam).");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="mb-6 flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/egrikuyu.svg" alt="eğrikuyu" className="h-9 w-auto" />
                    <p className="text-sm font-medium text-zinc-700">Admin</p>
                </div>
                <form onSubmit={submit} className="rounded-xl border border-zinc-200 bg-paper p-6 shadow-sm">
                    <h1 className="mb-5 text-lg font-semibold text-zinc-900">Sign in</h1>
                    {notice}
                    <div className="space-y-4">
                        <Field label="Email">
                            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Password">
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                    </div>
                    {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
                    {info && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{info}</p>}
                    <Button type="submit" variant="primary" loading={busy} disabled={!email || !password} className="mt-5 w-full">
                        Sign in
                    </Button>
                    <button type="button" onClick={reset} className="mt-3 w-full text-center text-sm font-medium text-zinc-700 underline-offset-2 hover:text-zinc-900 hover:underline">
                        Forgot password?
                    </button>
                </form>
            </div>
        </div>
    );
}
