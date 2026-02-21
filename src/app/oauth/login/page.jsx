"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Form,
  InlineNotification,
  PasswordInput,
  Stack,
  TextInput,
  Tooltip,
} from "@carbon/react";
import { Information } from "@carbon/icons-react";
import { loginUser } from "@/../lib";
import { buildOAuthQueryString, getConsentTooltip } from "@/../lib/oauth";

export default function OAuthLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const queryString = useMemo(() => {
    return buildOAuthQueryString(searchParams);
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginUser(loginId, password);
      if (response?.message === "Password reset required") {
        const nextPath = queryString ? `/oauth/authorize?${queryString}` : "/";
        router.replace(`/reset-password?forced=1&next=${encodeURIComponent(nextPath)}`);
        return;
      }

      if (queryString) {
        router.replace(`/oauth/authorize?${queryString}`);
      } else {
        router.replace("/");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-3 text-3xl font-semibold">OAuth sign in</h1>
      <p className="mb-6 text-sm text-gray-300 inline-flex items-center gap-1">
        Continue sign in to approve this trusted client.
        {isMounted ? (
          <Tooltip label={getConsentTooltip()}>
            <Information size={16} />
          </Tooltip>
        ) : null}
      </p>

      <Form onSubmit={handleSubmit}>
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
            id="oauth-login-id"
            labelText="Login ID"
            placeholder="Username or email"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            required
          />

          <PasswordInput
            id="oauth-password"
            labelText="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Continue"}
            </Button>
          </div>
        </Stack>
      </Form>
    </main>
  );
}
