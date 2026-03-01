"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJson } from "../../../lib/api";
import styles from "./health.module.css";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: unknown };

export default function HealthPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    getJson("/api/health")
      .then((data) => setState({ status: "success", data }))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        setState({ status: "error", message });
      });
  }, []);

  return (
    <main className={styles.page}>
      <Link href="/admin" className={styles.back}>
        ← Back to Admin
      </Link>
      <h1 className={styles.title}>Health Check</h1>
      <p>
        Calls <code>GET /api/health</code> on the Spring Boot backend.
      </p>
      <br />

      {state.status === "loading" && (
        <span className={`${styles.status} ${styles.loading}`}>
          ⏳ Loading…
        </span>
      )}

      {state.status === "error" && (
        <>
          <span className={`${styles.status} ${styles.error}`}>
            ❌ Error
          </span>
          <div className={styles.errorBox}>{state.message}</div>
        </>
      )}

      {state.status === "success" && (
        <>
          <span className={`${styles.status} ${styles.success}`}>
            ✅ OK
          </span>
          <pre className={styles.pre}>
            {JSON.stringify(state.data, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
