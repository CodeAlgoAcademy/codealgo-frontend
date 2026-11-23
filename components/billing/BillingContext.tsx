import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import http from "axios.config";
import { getAccessToken } from "utils/getTokens";

/**
 * The billing screens were written for parents only. Teachers (outside an org)
 * and students use the same ones, so the few things that differ live here:
 * where the pages are, who can go on a plan, and whether an org already pays.
 *
 * No provider means the parent pages, which is what they always were.
 */
export type BillingRole = "parent" | "teacher" | "student";

export interface BillingSeat {
   id: number;
   fullName: string;
   username?: string;
}

export interface BillingCoverage {
   covered_by_organization: boolean;
   organizations: { id: number; name: string }[];
}

interface BillingContextValue {
   role: BillingRole;
   basePath: string;
   seats: BillingSeat[] | null;
   coverage: BillingCoverage | null;
}

const EMPTY: any[] = [];

const BillingContext = createContext<BillingContextValue | null>(null);

export const BILLING_PATHS: Record<BillingRole, string> = {
   parent: "/parents/billing",
   teacher: "/teachers/billing",
   student: "/students/billing",
};

const authHeader = () => ({ headers: { Authorization: `Bearer ${getAccessToken()}` } });

export const BillingProvider = ({ role, children }: { role: BillingRole; children: ReactNode }) => {
   const [seats, setSeats] = useState<BillingSeat[] | null>(null);
   const [coverage, setCoverage] = useState<BillingCoverage | null>(null);

   useEffect(() => {
      if (role === "parent") return;
      let cancelled = false;

      http
         .get<BillingSeat[]>("/payment/subscription/seats", authHeader())
         .then((res) => !cancelled && setSeats(res.data || []))
         .catch(() => !cancelled && setSeats([]));

      http
         .get<BillingCoverage>("/payment/subscription/coverage", authHeader())
         .then((res) => !cancelled && setCoverage(res.data))
         .catch(() => !cancelled && setCoverage({ covered_by_organization: false, organizations: [] }));

      return () => {
         cancelled = true;
      };
   }, [role]);

   return <BillingContext.Provider value={{ role, basePath: BILLING_PATHS[role], seats, coverage }}>{children}</BillingContext.Provider>;
};

export const useBilling = () => {
   const ctx = useContext(BillingContext);
   const parentKids = useSelector((state: RootState) => state.parentChild?.children) ?? EMPTY;

   const role = ctx?.role ?? "parent";
   const ctxSeats = ctx?.seats;
   const seats: BillingSeat[] = useMemo(
      () =>
         role === "parent"
            ? parentKids.map((c: any) => ({ id: Number(c.id), fullName: c.fullName || c.username || "", username: c.username }))
            : ctxSeats ?? [],
      [role, parentKids, ctxSeats]
   );

   return {
      role,
      basePath: ctx?.basePath ?? BILLING_PATHS.parent,
      seats,
      seatsLoaded: role === "parent" || ctx?.seats !== null,
      coverage: ctx?.coverage ?? null,
      // Students only ever buy for themselves, the backend puts them on the plan.
      picksSeats: role !== "student",
   };
};
