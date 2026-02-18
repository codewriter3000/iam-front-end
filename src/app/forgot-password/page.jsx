"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Stack, TextInput, InlineNotification } from "@carbon/react";
import { forgotPassword } from "@/../lib";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(loginId);
      if (response?.reset_url) {
        router.push(response.reset_url);
        return;
      }
      setMessage(response?.message || "If the account exists, a password reset link has been sent");
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-3xl font-semibold">Forgot password</h1>
      <Form onSubmit={onSubmit}>
        <Stack gap={6}>
          {message ? (
            <InlineNotification lowContrast kind="success" title="Request submitted" subtitle={message} />
          ) : null}
          {error ? (
            <InlineNotification
              lowContrast
              kind="error"
              title="Request failed"
              subtitle={error}
              onCloseButtonClick={() => setError("")}
            />
          ) : null}

          <TextInput
            id="forgot-login-id"
            labelText="Login ID"
            placeholder="Username or email"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <a href="/login" className="text-sm underline">
              Back to login
            </a>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        </Stack>
      </Form>
    </main>
  );
}
