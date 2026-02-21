"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, InlineNotification, Tooltip } from "@carbon/react";
import { Information } from "@carbon/icons-react";
import { getSessionUser } from "@/../lib";
import { buildOAuthQueryString, getAuthorizeURL, getConsentTooltip } from "@/../lib/oauth";

export default function OAuthAuthorizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const queryString = useMemo(() => {
    return buildOAuthQueryString(searchParams);
  }, [searchParams]);

  const continueAuthorization = () => {
    setError("");
    setIsRedirecting(true);
    const target = getAuthorizeURL(queryString);
    window.location.replace(target);
  };

  useEffect(() => {
    let isMounted = true;

    getSessionUser()
      .then((user) => {
        if (!isMounted) return;
        if (!user) {
          if (queryString) {
            router.replace(`/oauth/login?query_string=${encodeURIComponent(queryString)}`);
          } else {
            router.replace("/oauth/login");
          }
          return;
        }

        continueAuthorization();
      })
      .catch(() => {
        if (!isMounted) return;
        if (queryString) {
          router.replace(`/oauth/login?query_string=${encodeURIComponent(queryString)}`);
        } else {
          router.replace("/oauth/login");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [queryString, router]);

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-3 text-3xl font-semibold">Authorizing client</h1>
      <p className="mb-6 inline-flex items-center gap-1 text-sm text-gray-300">
        Redirecting to the authorization server.
        <Tooltip label={getConsentTooltip()}>
          <Information size={16} />
        </Tooltip>
      </p>

      {error ? (
        <InlineNotification
          lowContrast
          kind="error"
          title="Authorization failed"
          subtitle={error}
          onCloseButtonClick={() => setError("")}
        />
      ) : null}

      <br />
      <Button kind="primary" disabled={isRedirecting} onClick={continueAuthorization}>
        {isRedirecting ? "Redirecting..." : "Continue"}
      </Button>
    </main>
  );
}
