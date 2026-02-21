"use client";

import { useEffect, useState } from "react";
import { getSessionUser } from "@/../lib";
import { hasAdministratorAccess } from "@/lib/access";

const useAdminAccess = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getSessionUser()
      .then((user) => {
        if (!isMounted) {
          return;
        }

        setIsAdmin(hasAdministratorAccess(user));
        setIsResolved(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setIsAdmin(false);
        setIsResolved(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isAdmin,
    isReadOnly: !isAdmin,
    isResolved,
  };
};

export default useAdminAccess;
