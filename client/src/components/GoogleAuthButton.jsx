"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function GoogleAuthButton({ onCredential, role, enabled }) {
  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in"
        className="btn-outline w-full cursor-not-allowed justify-center"
      >
        Continue with Google (not configured)
      </button>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(res) => onCredential(res.credential)}
        onError={() => {}}
        shape="pill"
        width="320"
        text="continue_with"
      />
    </div>
  );
}
