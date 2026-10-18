"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Sprout } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleAuthButton from "@/components/GoogleAuthButton";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ user_email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const validate = () => {
    const e = {};
    if (!emailRe.test(form.user_email)) e.user_email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async (credential) => {
    try {
      await googleLogin(credential);
      toast.success("Signed in with Google!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-6 flex flex-col items-center text-center">
        <Sprout className="h-10 w-10 text-teal-700" />
        <h1 className="mt-2 text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to your SeedInvest account.</p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={form.user_email}
            onChange={(e) => setForm({ ...form, user_email: e.target.value })}
          />
          {errors.user_email && <p className="mt-1 text-xs text-red-600">{errors.user_email}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <div className="relative py-1 text-center text-xs text-slate-400">
          <span className="bg-white px-2">or</span>
        </div>

        <GoogleAuthButton enabled={googleEnabled} onCredential={handleGoogle} />
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Don’t have an account?{" "}
        <Link href="/register" className="font-semibold text-teal-700">
          Register
        </Link>
      </p>
    </div>
  );
}
