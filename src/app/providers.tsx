"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder-client-id";

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
