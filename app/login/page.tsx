"use client";

import { useState, useEffect } from "react";
import { signIn, confirmSignIn, getCurrentUser } from "aws-amplify/auth";

export default function LoginPage() {
  useEffect(() => {
    getCurrentUser()
      .then(() => window.location.assign("/"))
      .catch(() => {});
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn({ username: email, password });

      if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNeedsNewPassword(true);
        setLoading(false);
        return;
      }

      if (result.isSignedIn) {
        // Hard navigation so the freshly-set auth cookies reach the
        // server middleware and Next's Router Cache is bypassed.
        window.location.assign("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bejelentkezési hiba");
      setLoading(false);
    }
  }

  async function handleNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.isSignedIn) {
        window.location.assign("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jelszóváltási hiba");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Bejelentkezés</h1>

        {!needsNewPassword ? (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email cím"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-theme_primary"
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-theme_primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-theme_primary text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Betöltés..." : "Belépés"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewPassword} className="flex flex-col gap-4">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Új jelszó megadása szükséges
            </p>
            <input
              type="password"
              placeholder="Új jelszó"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-theme_primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-theme_primary text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Betöltés..." : "Jelszó mentése"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
