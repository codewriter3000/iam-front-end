"use client";
import AppHeader from "@/components/AppHeader/AppHeader";
import PublicHeader from "@/components/PublicHeader/PublicHeader";
import { Content, Theme } from "@carbon/react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSessionUser } from "@/../lib";

export function Providers({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const normalizedPathname = useMemo(() => {
    if (!pathname) return "/";
    if (pathname.length > 1 && pathname.endsWith("/")) {
      return pathname.slice(0, -1);
    }
    return pathname;
  }, [pathname]);

  const isPublicRoute = useMemo(() => {
    return ["/login", "/forgot-password", "/reset-password", "/oauth/login", "/oauth/authorize", "/error"].includes(normalizedPathname);
  }, [normalizedPathname]);

  useEffect(() => {
    let isMounted = true;

    if (isPublicRoute) {
      setIsAuthChecked(true);
      return () => {
        isMounted = false;
      };
    }

    setIsAuthChecked(false);
    getSessionUser()
      .then((user) => {
        if (!isMounted) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        setIsAuthChecked(true);
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/login");
      });

    return () => {
      isMounted = false;
    };
  }, [isPublicRoute, pathname, router]);

  if (!isPublicRoute && !isAuthChecked) {
    return (
      <div
        aria-busy="true"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#c6c6c6",
          background: "#161616",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Theme theme="g100" className="h-screen">
        {!isPublicRoute ? <AppHeader /> : <PublicHeader />}
        <Content>{children}</Content>
      </Theme>
    </div>
  );
}
