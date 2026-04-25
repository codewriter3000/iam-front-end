"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, Stack, PasswordInput, InlineNotification } from "@carbon/react";
import { getForcedResetContext, resetPassword } from "@/../lib";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const isForcedFlow = useMemo(() => searchParams.get("forced") === "1", [searchParams]);
  const nextPath = useMemo(() => searchParams.get("next") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContextValidated, setIsContextValidated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (token) {
      setIsContextValidated(true);
      return () => {
        isMounted = false;
      };
    }

    if (!isForcedFlow) {
      router.replace("/login");
      return () => {
        isMounted = false;
      };
    }

    getForcedResetContext()
      .then(() => {
        if (!isMounted) return;
        setIsContextValidated(true);
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/login");
      });

    return () => {
      isMounted = false;
    };
  }, [isForcedFlow, router, token]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token && !isForcedFlow) {
      setError("Missing reset token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword(token, password);
      setMessage(response?.message || "Password reset successfully");
      const resolvedNext = nextPath.startsWith("/") ? nextPath : "/";
      setTimeout(() => {
        router.replace(resolvedNext || "/");
      }, 1200);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isContextValidated) {
    return null;
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-3xl font-semibold">Reset password</h1>
      <Form onSubmit={onSubmit}>
        <Stack gap={6}>
          {message ? (
            <InlineNotification lowContrast kind="success" title="Password reset" subtitle={message} />
          ) : null}
          {error ? (
            <InlineNotification
              lowContrast
              kind="error"
              title="Reset failed"
              subtitle={error}
              onCloseButtonClick={() => setError("")}
            />
          ) : null}

          <PasswordInput
            id="new-password"
            labelText="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <PasswordInput
            id="confirm-password"
            labelText="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <a href="/login" className="text-sm underline">
              Back to login
            </a>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Button>
          </div>
        </Stack>
      </Form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
