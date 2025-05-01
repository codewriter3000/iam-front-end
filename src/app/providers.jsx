"use client";
import AppHeader from "@/components/AppHeader/AppHeader";
import { Content, Theme } from "@carbon/react";

export function Providers({ children }) {
  return (
    <div>
      <Theme theme="g100" className="h-screen">
        <AppHeader />
        <Content>{children}</Content>
      </Theme>
    </div>
  );
}
