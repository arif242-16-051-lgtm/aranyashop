"use client";

import { useEffect, useRef, useState } from "react";
import { getJson, postJson, putJson, deleteJson } from "../../../lib/api";
import type { Variant } from "../../../lib/types";
import styles from "./variants.module.css";

interface Props {
  readonly productId: string;
}

const EMPTY_FORM = {
  sku: "", color: "", size: "", pricePaisa: "", stockQty: "0", active: true,
};

type FormState = typeof EMPTY_FORM;

/** Convert paisa (int) to BDT string e.g. 19900 → "199.00" */
function paisaToBdt(paisa: number): string {
  return (paisa / 100).toFixed(2);
}

/** Convert BDT input string to paisa int */
function bdtToPaisa(bdt: string): number {
  return Math.round(Number.parseFloat(bdt || "0") * 100);
}

export default function VariantsSection({ productId }: Props) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Inline edit
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const editSkuRef = useRef<HTMLInputElement>(null);

  const BASE = `/api/admin/products/${productId}/variants`;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setVariants(await getJson<Variant[]>(BASE));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load variants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [productId]); // eslint-disable-line

  // ── Add variant ────────────────────────────────────────────────────────────
  async function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    setFormErrors({});
    try {
      const created = await postJson<Variant>(BASE, {
        sku:        form.sku        || undefined,
        color:      form.color      || undefined,
        size:       form.size       || undefined,
        pricePaisa: bdtToPaisa(form.pricePaisa),
        stockQty:   Number.parseInt(form.stockQty || "0", 10),
        active:     form.active,
      });
      setVariants(prev => [...prev, created]);
      setForm(EMPTY_FORM);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add";
      const parsed = tryParseErrors(msg);
      if (parsed) setFormErrors(parsed);
      else setAddError(msg);
    } finally {
      setAdding(false);
    }
  }

  // ── Inline edit ───────────────────────────────────────────────────────────
  function startEdit(v: Variant) {
    setEditId(v.id);
    setEditForm({
      sku:        v.sku,
      color:      v.color ?? "",
      size:       v.size  ?? "",
      pricePaisa: paisaToBdt(v.pricePaisa),
      stockQty:   String(v.stockQty),
      active:     v.active,
    });
    setTimeout(() => editSkuRef.current?.focus(), 40);
  }

  function cancelEdit() { setEditId(null); }

  async function handleSaveEdit(variantId: number) {
    try {
      const updated = await putJson<Variant>(`${BASE}/${variantId}`, {
        sku:        editForm.sku        || undefined,
        color:      editForm.color      || undefined,
        size:       editForm.size       || undefined,
        pricePaisa: bdtToPaisa(editForm.pricePaisa),
        stockQty:   Number.parseInt(editForm.stockQty || "0", 10),
        active:     editForm.active,
      });
      setVariants(prev => prev.map(v => v.id === updated.id ? updated : v));
      setEditId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(v: Variant) {
    if (!confirm(`Delete SKU "${v.sku}"? This cannot be undone.`)) return;
    try {
      await deleteJson(`${BASE}/${v.id}`);
      setVariants(prev => prev.filter(x => x.id !== v.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function tryParseErrors(msg: string): Record<string, string> | null {
    try {
      const json = JSON.parse(msg.replace(/^API error \d+ [^:]+: /, ""));
      return json.errors ?? null;
    } catch { return null; }
  }

  function setF<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setEF<K extends keyof FormState>(key: K, val: FormState[K]) {
    setEditForm(f => ({ ...f, [key]: val }));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Variants / SKUs</h2>

      {/* Add form */}
      <form className={styles.addForm} onSubmit={handleAdd}>
        <div className={styles.addRow}>
          <div className={styles.addField}>
            <label htmlFor="v-sku" className={styles.addLabel}>SKU <span className={styles.optional}>(auto)</span></label>
            <input id="v-sku" className={styles.addInput} value={form.sku}
              onChange={e => setF("sku", e.target.value)} placeholder="AUTO" disabled={adding} />
          </div>
          <div className={styles.addField}>
            <label htmlFor="v-color" className={styles.addLabel}>Color</label>
            <input id="v-color" className={styles.addInput} value={form.color}
              onChange={e => setF("color", e.target.value)} placeholder="e.g. Red" disabled={adding} />
          </div>
          <div className={styles.addField}>
            <label htmlFor="v-size" className={styles.addLabel}>Size</label>
            <input id="v-size" className={styles.addInput} value={form.size}
              onChange={e => setF("size", e.target.value)} placeholder="e.g. M" disabled={adding} />
          </div>
          <div className={styles.addField}>
            <label htmlFor="v-price" className={styles.addLabel}>Price (BDT) *</label>
            <input id="v-price" className={`${styles.addInput} ${formErrors.pricePaisa ? styles.inputError : ""}`}
              type="number" min="0" step="0.01" value={form.pricePaisa}
              onChange={e => setF("pricePaisa", e.target.value)} placeholder="0.00" disabled={adding} />
            {formErrors.pricePaisa && <span className={styles.fieldError}>{formErrors.pricePaisa}</span>}
          </div>
          <div className={styles.addField}>
            <label htmlFor="v-stock" className={styles.addLabel}>Stock</label>
            <input id="v-stock" className={styles.addInput} type="number" min="0" value={form.stockQty}
              onChange={e => setF("stockQty", e.target.value)} disabled={adding} />
          </div>
          <div className={styles.addFieldCheck}>
            <input id="v-active" type="checkbox" checked={form.active}
              onChange={e => setF("active", e.target.checked)} disabled={adding} />
            <label htmlFor="v-active" className={styles.addLabel}>Active</label>
          </div>
        </div>
        {addError && <div className={styles.addError}>{addError}</div>}
        <button className={styles.btnAdd} type="submit" disabled={adding}>
          {adding ? "Adding…" : "+ Add Variant"}
        </button>
      </form>

      {/* Table */}
      {error && <div className={styles.error}>{error}</div>}
      {loading && <p className={styles.hint}>Loading variants…</p>}
      {!loading && variants.length === 0 && (
        <p className={styles.hint}>No variants yet. Add one above.</p>
      )}
      {!loading && variants.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Color</th>
                <th>Size</th>
                <th>Price (BDT)</th>
                <th>Stock</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.id} className={editId === v.id ? styles.editRow : undefined}>
                  {editId === v.id ? (
                    /* ── Inline edit row ── */
                    <>
                      <td><input ref={editSkuRef} className={styles.cellInput}
                        value={editForm.sku} onChange={e => setEF("sku", e.target.value)} /></td>
                      <td><input className={styles.cellInput} value={editForm.color}
                        onChange={e => setEF("color", e.target.value)} /></td>
                      <td><input className={styles.cellInput} value={editForm.size}
                        onChange={e => setEF("size", e.target.value)} /></td>
                      <td><input className={styles.cellInput} type="number" min="0" step="0.01"
                        value={editForm.pricePaisa} onChange={e => setEF("pricePaisa", e.target.value)} /></td>
                      <td><input className={styles.cellInput} type="number" min="0"
                        value={editForm.stockQty} onChange={e => setEF("stockQty", e.target.value)} /></td>
                      <td><input type="checkbox" checked={editForm.active}
                        onChange={e => setEF("active", e.target.checked)} /></td>
                      <td>
                        <div className={styles.actions}>
                          <button className={`${styles.btnSm} ${styles.btnSave}`}
                            onClick={() => handleSaveEdit(v.id)}>Save</button>
                          <button className={`${styles.btnSm} ${styles.btnCancel}`}
                            onClick={cancelEdit}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    /* ── Read-only row ── */
                    <>
                      <td className={styles.skuCell}>{v.sku}</td>
                      <td>{v.color ?? <span className={styles.na}>—</span>}</td>
                      <td>{v.size  ?? <span className={styles.na}>—</span>}</td>
                      <td className={styles.priceCell}>৳{paisaToBdt(v.pricePaisa)}</td>
                      <td className={styles.stockCell}>{v.stockQty}</td>
                      <td>
                        <span className={`${styles.badge} ${v.active ? styles.active : styles.inactive}`}>
                          {v.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={`${styles.btnSm} ${styles.btnEdit}`}
                            onClick={() => startEdit(v)}>Edit</button>
                          <button className={`${styles.btnSm} ${styles.btnDelete}`}
                            onClick={() => handleDelete(v)}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
