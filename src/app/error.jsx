"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/error");
  }, [router]);

  return null;
}
