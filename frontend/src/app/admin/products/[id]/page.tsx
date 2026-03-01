"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getJson, putJson } from "../../../../lib/api";
import type { Product, Category } from "../../../../lib/types";
import styles from "../form.module.css";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shippingClass, setShippingClass] = useState("STANDARD");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      getJson<Product>(`/api/admin/products/${id}`),
      getJson<Category[]>("/api/admin/categories"),
    ])
      .then(([product, cats]) => {
        setTitle(product.title);
        setDescription(product.description ?? "");
        setCategoryId(String(product.category.id));
        setShippingClass(product.shippingClass);
        setActive(product.active);
        setCategories(cats);
      })
      .catch(e => setGlobalError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setGlobalError(null);

    try {
      await putJson(`/api/admin/products/${id}`, {
        title,
        description: description || null,
        categoryId: Number(categoryId),
        shippingClass,
        active,
      });
      router.push("/admin/products");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      try {
        const json = JSON.parse(msg.replace(/^API error \d+ \w+: /, ""));
        if (json.errors) { setErrors(json.errors); return; }
      } catch { /* not JSON */ }
      setGlobalError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className={styles.page}><p className={styles.hint}>Loading…</p></main>;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Product</h1>
        <Link href="/admin/products" className={styles.back}>← Products</Link>
      </div>

      {globalError && <div className={styles.error}>{globalError}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Title */}
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>Title *</label>
          <input
            id="title"
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={saving}
          />
          {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>Description</label>
          <textarea
            id="description"
            className={styles.textarea}
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            disabled={saving}
          />
        </div>

        {/* Category */}
        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>Category *</label>
          <select
            id="category"
            className={`${styles.select} ${errors.categoryId ? styles.inputError : ""}`}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            disabled={saving}
          >
            {categories.map(c => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className={styles.fieldError}>{errors.categoryId}</span>}
        </div>

        {/* Shipping class */}
        <div className={styles.field}>
          <label htmlFor="shipping" className={styles.label}>Shipping Class</label>
          <select
            id="shipping"
            className={styles.select}
            value={shippingClass}
            onChange={e => setShippingClass(e.target.value)}
            disabled={saving}
          >
            <option value="STANDARD">Standard</option>
            <option value="FREE">Free</option>
          </select>
        </div>

        {/* Active */}
        <div className={styles.fieldRow}>
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            disabled={saving}
          />
          <label htmlFor="active" className={styles.checkLabel}>Active</label>
        </div>

        <div className={styles.formActions}>
          <button className={styles.btnPrimary} type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/admin/products" className={styles.btnCancel}>Cancel</Link>
        </div>
      </form>
    </main>
  );
}
