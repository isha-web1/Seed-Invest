"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function Providers({ children }) {
  const content = (
    <AuthProvider>
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </AuthProvider>
  );

  if (!GOOGLE_CLIENT_ID) return content;

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>;
}
