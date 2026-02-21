"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Stack, TextInput, PasswordInput, InlineNotification } from "@carbon/react";
import { loginUser } from "@/../lib";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginUser(loginId, password);
      if (response?.message === "Password reset required") {
        router.replace(`/reset-password?forced=1&next=${encodeURIComponent("/")}`);
        return;
      }

      router.replace("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-3xl font-semibold">Sign in</h1>
      <Form onSubmit={onSubmit}>
        <Stack gap={6}>
          {error ? (
            <InlineNotification
              lowContrast
              kind="error"
              title="Sign in failed"
              subtitle={error}
              onCloseButtonClick={() => setError("")}
            />
          ) : null}

          <TextInput
            id="login-id"
            labelText="Login ID"
            placeholder="Username or email"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            required
          />

          <PasswordInput
            id="password"
            labelText="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <a href="/forgot-password" className="text-sm underline">
              Forgot password?
            </a>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </Stack>
      </Form>
    </main>
  );
}
