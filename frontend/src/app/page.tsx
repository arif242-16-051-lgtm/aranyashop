import Link from "next/link";
import styles from "./page.module.css";

export default function StorefrontPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>
        {process.env.NEXT_PUBLIC_SITE_NAME ?? "AranyaShop"}
      </h1>
      <p className={styles.subtitle}>
        Welcome to AranyaShop — your neighbourhood online store.
      </p>
      <Link href="/admin" className={styles.link}>
        Go to Admin →
      </Link>
    </main>
  );
}
