"use client";

import React, { useState } from "react";
import { Tag, FolderPlus, Edit2, Trash2, Check, X } from "lucide-react";
import type { Category, Course } from "@/lib/types/database";

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

  const handleSaveEditCategory = () => {
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

  return (
    <>
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. UNIFIED SECTION HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#f58220] shrink-0 shadow-2xs">
                  <Tag className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Categorie Formative
                    </h2>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {categories.length} categorie
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Organizza i corsi per ambiti tematici e macro-settori della sicurezza sul lavoro.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                  {courses.length} corsi totali associati
                </span>
              </div>
            </div>

            {/* 2. INTEGRATED CONTROLS & ADD BAR */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Nome nuova categoria (es. Lavori in Spazi Confinati, HACCP, Patenti Speciali)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all shrink-0"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Aggiungi Categoria</span>
                </button>
              </form>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tutte le Categorie Configurate ({categories.length})
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {courses.length} corsi totali suddivisi
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {categories.map((cat, idx) => {
                  const countCourses = courses.filter((c) => c.category_id === cat.id).length;
                  const isEditing = editingCategory?.id === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Name or Edit Input */}
                      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md">
                            <input
                              type="text"
                              value={editingCategory.newName}
                              onChange={(e) =>
                                setEditingCategory({ ...editingCategory, newName: e.target.value })
                              }
                              className="w-full px-3 py-1.5 bg-white border border-[#008e97] rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditCategory}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Salva nuovo nome"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                              title="Annulla"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-900">{cat.name}</span>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {countCourses} {countCourses === 1 ? "corso" : "corsi"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setEditingCategory({ id: cat.id, newName: cat.name })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#008e97] hover:bg-[#e6f6f7] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rinomina</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCategoryConfirm(cat)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-[#df0000] hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Elimina</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {deleteCategoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf2f2] text-[#df0000] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Elimina Categoria
            </h4>
            <p className="text-xs text-slate-600 text-center mb-6">
              Sei sicuro di voler eliminare la categoria{" "}
              <strong>"{deleteCategoryConfirm.name}"</strong>? I corsi che ne fanno parte verranno spostati nella categoria "{categories.find((c) => c.id !== deleteCategoryConfirm.id)?.name ?? "—"}".
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteCategoryConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
              >
                Annulla
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteCategoryConfirm)}
                disabled={isBusy}
                className="px-5 py-2.5 rounded-xl bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Elimina Categoria
              </button>
            </div>
          </div>
        </div>
        )}
    </>
  );
}
