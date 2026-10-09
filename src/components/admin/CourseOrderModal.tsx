"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@/components/admin/ui/dndModifiers";
import { GripVertical, ListOrdered } from "lucide-react";
import type { Course } from "@/lib/types/database";
import AdminModal from "@/components/admin/ui/AdminModal";
import { btnSecondary, btnTeal } from "@/components/admin/ui/styles";

interface CourseOrderModalProps {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  fallbackImage: string;
  onSave: (orderedIds: string[]) => Promise<void>;
  showToast: (msg: string, tone?: "success" | "error") => void;
}

function SortableRow({ course, position, fallbackImage }: { course: Course; position: number; fallbackImage: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: course.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-2xl border bg-white p-2.5 ${
        isDragging ? "relative z-10 border-[#008e97] shadow-xl" : "border-slate-200 shadow-xs"
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Sposta "${course.title}"`}
        className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="w-6 shrink-0 text-center font-mono text-xs font-bold text-slate-400">{position}</span>

      <img
        src={course.image_url || fallbackImage}
        alt=""
        className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-slate-900">{course.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="truncate rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{course.category.name}</span>
          {!course.is_published && (
            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">Bozza</span>
          )}
        </div>
      </div>
    </li>
  );
}

/** Pannello per ordinare i corsi con drag & drop (mouse, touch e tastiera). L'ordine vale per tutto il sito. */
export default function CourseOrderModal({ open, onClose, courses, fallbackImage, onSave, showToast }: CourseOrderModalProps) {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Ogni volta che il pannello si apre si riparte dall'ordine salvato
  useEffect(() => {
    if (open) setOrderedIds(courses.map((c) => c.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const byId = new Map(courses.map((c) => [c.id, c]));
  const ordered = orderedIds.map((id) => byId.get(id)).filter((c): c is Course => Boolean(c));
  const changed = ordered.some((c, index) => c.id !== courses[index]?.id);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrderedIds((ids) => arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(orderedIds);
      showToast("Ordine dei corsi salvato.");
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ordine non salvato.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Ordina i corsi"
      subtitle="Trascina per cambiare l'ordine sul sito"
      icon={<ListOrdered className="h-5 w-5" />}
      size="lg"
      fixedHeight
      dismissOnBackdrop={false}
      footer={
        <div className="flex gap-2 sm:justify-end">
          <button type="button" onClick={onClose} className={`${btnSecondary} flex-1 sm:flex-none`}>
            Annulla
          </button>
          <button type="button" onClick={handleSave} disabled={!changed || isSaving} className={`${btnTeal} flex-[2] sm:flex-none`}>
            {isSaving ? "Salvataggio..." : "Salva ordine"}
          </button>
        </div>
      }
    >
      <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">
        L&apos;ordine vale per tutto il sito: catalogo, sezioni di ogni categoria e anteprima in home. In ogni elenco appaiono per
        primi i corsi più in alto qui; le anteprime mostrano i primi 4.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {ordered.map((course, index) => (
              <SortableRow key={course.id} course={course} position={index + 1} fallbackImage={fallbackImage} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </AdminModal>
  );
}
