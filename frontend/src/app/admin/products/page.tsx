"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getJson, deleteJson } from "../../../lib/api";
import type { Product, Category } from "../../../lib/types";
import styles from "./products.module.css";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>(""); // ""|"true"|"false"
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (activeFilter) params.set("active", activeFilter);
    if (categoryFilter) params.set("categoryId", categoryFilter);
    const qs = params.toString();
    return qs ? `/api/admin/products?${qs}` : "/api/admin/products";
  }, [q, activeFilter, categoryFilter]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJson<Product[]>(buildQuery());
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // Load categories once on mount
  useEffect(() => {
    getJson<Category[]>("/api/admin/categories")
      .then(setCategories)
      .catch(() => {/* non-critical */});
  }, []);

  // Reload products whenever filters change
  useEffect(() => { load(); }, [q, activeFilter, categoryFilter]); // eslint-disable-line

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await deleteJson(`/api/admin/products/${p.id}`);
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <div className={styles.headerActions}>
          <Link href="/admin/products/new" className={styles.btnPrimary}>+ New Product</Link>
          <Link href="/admin" className={styles.back}>← Admin</Link>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.input}
          type="text"
          placeholder="Search by title…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className={styles.select}
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          className={styles.select}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading && <p className={styles.empty}>Loading…</p>}
      {!loading && products.length === 0 && (
        <p className={styles.empty}>No products found.</p>
      )}
      {!loading && products.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Shipping</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className={styles.titleCell}>{p.title}</td>
                  <td>{p.category.name}</td>
                  <td>
                    <span className={`${styles.badge} ${p.shippingClass === "FREE" ? styles.free : styles.standard}`}>
                      {p.shippingClass}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${p.active ? styles.active : styles.inactive}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/products/${p.id}`} className={`${styles.btnSmall} ${styles.btnEdit}`}>
                        Edit
                      </Link>
                      <button
                        className={`${styles.btnSmall} ${styles.btnDelete}`}
                        onClick={() => handleDelete(p)}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
