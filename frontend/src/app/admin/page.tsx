import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Admin Panel</h1>
      <p className={styles.subtitle}>Manage your AranyaShop backend.</p>
      <ul className={styles.nav}>
        <li>
          <Link href="/admin/products">📦 Products</Link>
        </li>
        <li>
          <Link href="/admin/categories">🗂 Categories</Link>
        </li>
        <li>
          <Link href="/admin/health">🩺 Health Check</Link>
        </li>
      </ul>
    </main>
  );
}
