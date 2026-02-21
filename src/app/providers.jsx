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

  const isPublicRoute = useMemo(() => {
    return ["/login", "/forgot-password", "/reset-password", "/oauth/login", "/oauth/authorize", "/error"].includes(pathname);
  }, [pathname]);

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
    return null;
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
