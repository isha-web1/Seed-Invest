"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Sprout, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import ImageUploader from "@/components/ImageUploader";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rules = [
  { test: (p) => p.length >= 6, label: "At least 6 characters" },
  { test: (p) => /[A-Za-z]/.test(p), label: "Contains a letter" },
  { test: (p) => /\d/.test(p), label: "Contains a number" },
];

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    display_name: "",
    user_email: "",
    photo_url: "",
    password: "",
    role: "supporter",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const validate = () => {
    const e = {};
    if (!form.display_name.trim()) e.display_name = "Name is required.";
    if (!emailRe.test(form.user_email)) e.user_email = "Enter a valid email address.";
    if (!rules.every((r) => r.test(form.password)))
      e.password = "Password does not meet the requirements.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      toast.success(
        form.role === "creator"
          ? "Welcome! You received 20 credits."
          : "Welcome! You received 50 credits."
      );
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async (credential) => {
    try {
      await googleLogin(credential, form.role);
      toast.success("Account ready!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-6 flex flex-col items-center text-center">
        <Sprout className="h-10 w-10 text-teal-700" />
        <h1 className="mt-2 text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-slate-500">
          Supporters start with 50 credits, creators with 20.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            placeholder="Jane Doe"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          />
          {errors.display_name && <p className="mt-1 text-xs text-red-600">{errors.display_name}</p>}
        </div>

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

        <ImageUploader
          label="Profile Picture"
          value={form.photo_url}
          onChange={(url) => setForm({ ...form, photo_url: url })}
        />

        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <ul className="mt-2 space-y-1">
            {rules.map((r) => {
              const ok = r.test(form.password);
              return (
                <li
                  key={r.label}
                  className={`flex items-center gap-1 text-xs ${ok ? "text-emerald-600" : "text-slate-400"}`}
                >
                  {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {r.label}
                </li>
              );
            })}
          </ul>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label className="label">I want to join as</label>
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="supporter">Supporter</option>
            <option value="creator">Creator</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <div className="relative py-1 text-center text-xs text-slate-400">
          <span className="bg-white px-2">or</span>
        </div>

        <GoogleAuthButton enabled={googleEnabled} role={form.role} onCredential={handleGoogle} />
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-700">
          Login
        </Link>
      </p>
    </div>
  );
}
