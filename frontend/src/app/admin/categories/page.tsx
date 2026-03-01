"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getJson, postJson, putJson, deleteJson } from "../../../lib/api";
import styles from "./categories.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Inline edit state: which row is being edited
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const API = "/api/admin/categories";

  // ── Load all ──────────────────────────────────────────────────────────────
  async function load() {
    try {
      setError(null);
      const data = await getJson<Category[]>(API);
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Create ────────────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await postJson<Category>(API, { name: newName.trim() });
      setCategories(prev =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────────────
  async function handleToggle(cat: Category) {
    try {
      const updated = await putJson<Category>(`${API}/${cat.id}`, {
        active: !cat.active,
      });
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    }
  }

  // ── Inline edit ───────────────────────────────────────────────────────────
  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
  }

  async function handleSaveEdit(id: number) {
    if (!editName.trim()) return;
    try {
      const updated = await putJson<Category>(`${API}/${id}`, {
        name: editName.trim(),
      });
      setCategories(prev =>
        prev.map(c => c.id === updated.id ? updated : c)
            .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await deleteJson(`${API}/${cat.id}`);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <Link href="/admin" className={styles.back}>← Admin</Link>
      </div>

      {/* Create form */}
      <form className={styles.form} onSubmit={handleCreate}>
        <input
          className={styles.input}
          type="text"
          placeholder="New category name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          disabled={creating}
        />
        <button
          className={styles.btnPrimary}
          type="submit"
          disabled={creating || !newName.trim()}
        >
          {creating ? "Adding…" : "Add Category"}
        </button>
      </form>

      {createError && <div className={styles.error}>{createError}</div>}
      {error && <div className={styles.error}>{error}</div>}

      {/* Table */}
      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : categories.length === 0 ? (
        <p className={styles.empty}>No categories yet. Add one above!</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  {/* Name / inline edit */}
                  <td>
                    {editId === cat.id ? (
                      <div className={styles.inlineEdit}>
                        <input
                          ref={editInputRef}
                          className={styles.inlineInput}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleSaveEdit(cat.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <button
                          className={`${styles.btnSmall} ${styles.btnSave}`}
                          onClick={() => handleSaveEdit(cat.id)}
                        >Save</button>
                        <button
                          className={`${styles.btnSmall} ${styles.btnCancel}`}
                          onClick={cancelEdit}
                        >Cancel</button>
                      </div>
                    ) : (
                      cat.name
                    )}
                  </td>

                  {/* Slug */}
                  <td><span className={styles.slug}>{cat.slug}</span></td>

                  {/* Active badge */}
                  <td>
                    <span className={`${styles.badge} ${cat.active ? styles.active : styles.inactive}`}>
                      {cat.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.btnSmall} ${styles.btnToggle}`}
                        onClick={() => handleToggle(cat)}
                      >
                        {cat.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className={`${styles.btnSmall} ${styles.btnEdit}`}
                        onClick={() => startEdit(cat)}
                        disabled={editId === cat.id}
                      >Edit</button>
                      <button
                        className={`${styles.btnSmall} ${styles.btnDelete}`}
                        onClick={() => handleDelete(cat)}
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
