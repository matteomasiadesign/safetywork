"use client";

import React, { useState } from "react";
import { Tag, FolderPlus, Edit2, Trash2, Check, X } from "lucide-react";
import type { Category, Course } from "@/lib/types/database";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import SectionHeader from "@/components/admin/ui/SectionHeader";
import { btnPrimary, iconBtn } from "@/components/admin/ui/styles";

interface CategoriesManagerProps {
  categories: Category[];
  courses: Course[];
  onAddCategory: (name: string) => Promise<unknown>;
  onRenameCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  showToast: (msg: string, tone?: "success" | "error") => void;
}

export default function CategoriesManager({
  categories,
  courses,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  showToast,
}: CategoriesManagerProps) {
  const [newCatInput, setNewCatInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: string; newName: string } | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<Category | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    try {
      await action();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Operazione non riuscita.", "error");
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatInput.trim();
    if (!name) return;
    run(async () => {
      await onAddCategory(name);
      showToast(`Categoria "${name}" creata.`);
      setNewCatInput("");
    });
  };

  const handleSaveEditCategory = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editingCategory || !editingCategory.newName.trim()) return;
    const { id, newName } = editingCategory;
    run(async () => {
      await onRenameCategory(id, newName.trim());
      showToast(`Categoria rinominata in "${newName.trim()}".`);
      setEditingCategory(null);
    });
  };

  const handleDeleteCategory = (category: Category) => {
    run(async () => {
      await onDeleteCategory(category.id);
      showToast(`Categoria "${category.name}" eliminata.`);
      setDeleteCategoryConfirm(null);
    });
  };

  const fallbackCategory = deleteCategoryConfirm
    ? categories.find((c) => c.id !== deleteCategoryConfirm.id)?.name ?? "—"
    : "—";

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <SectionHeader
          icon={<Tag className="h-5 w-5 stroke-[2.2]" />}
          iconClassName="bg-amber-50 border-amber-200/60 text-[#f58220]"
          title="Categorie Formative"
          count={`${categories.length} categorie`}
          description="Organizza i corsi per ambiti tematici e macro-settori della sicurezza sul lavoro."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <form onSubmit={handleCreateCategory} className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="Nome nuova categoria (es. HACCP, Spazi Confinati)"
                enterKeyHint="done"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008e97]"
              />
            </div>
            <button type="submit" disabled={isBusy} className={`${btnPrimary} shrink-0`}>
              <FolderPlus className="h-4 w-4" />
              <span>Aggiungi Categoria</span>
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-6 sm:py-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Tutte le categorie ({categories.length})</span>
            <span className="shrink-0 font-mono text-[11px] text-slate-400">{courses.length} corsi</span>
          </div>

          {categories.length === 0 && (
            <div className="px-6 py-10 text-center text-xs text-slate-500">Nessuna categoria: aggiungi la prima qui sopra.</div>
          )}

          <div className="divide-y divide-slate-100">
            {categories.map((cat, idx) => {
              const countCourses = courses.filter((c) => c.category_id === cat.id).length;
              const isEditing = editingCategory?.id === cat.id;

              return (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50/70 sm:px-6">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs text-slate-500">
                    {idx + 1}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSaveEditCategory} className="flex min-w-0 flex-1 items-center gap-1.5">
                      <input
                        type="text"
                        value={editingCategory.newName}
                        onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                        onKeyDown={(e) => e.key === "Escape" && setEditingCategory(null)}
                        className="min-w-0 flex-1 rounded-lg border border-[#008e97] bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isBusy}
                        className={`${iconBtn} bg-emerald-600 text-white hover:bg-emerald-700`}
                        title="Salva nuovo nome"
                        aria-label="Salva nuovo nome"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className={`${iconBtn} bg-slate-200 text-slate-700 hover:bg-slate-300`}
                        title="Annulla"
                        aria-label="Annulla"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <div className="break-words text-sm font-bold leading-snug text-slate-900">{cat.name}</div>
                        <div className="mt-0.5 font-mono text-[10px] font-semibold text-slate-500">
                          {countCourses} {countCourses === 1 ? "corso" : "corsi"}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCategory({ id: cat.id, newName: cat.name })}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-[#e6f6f7] hover:text-[#008e97] sm:h-10 sm:w-auto sm:gap-1.5 sm:px-3 sm:text-xs sm:font-medium"
                          aria-label={`Rinomina ${cat.name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Rinomina</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteCategoryConfirm(cat)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-[#df0000] sm:h-10 sm:w-auto sm:gap-1.5 sm:px-3 sm:text-xs sm:font-medium"
                          aria-label={`Elimina ${cat.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Elimina</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteCategoryConfirm)}
        title="Eliminare la categoria?"
        confirmLabel="Elimina categoria"
        busy={isBusy}
        onConfirm={() => deleteCategoryConfirm && handleDeleteCategory(deleteCategoryConfirm)}
        onCancel={() => setDeleteCategoryConfirm(null)}
      >
        Stai per eliminare la categoria <strong>&ldquo;{deleteCategoryConfirm?.name}&rdquo;</strong>. I corsi che ne fanno parte
        verranno spostati nella categoria &ldquo;{fallbackCategory}&rdquo;.
      </ConfirmDialog>
    </>
  );
}
