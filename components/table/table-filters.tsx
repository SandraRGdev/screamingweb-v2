"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TableFiltersProps {
  statusFilter: number | null;
  onStatusFilterChange: (value: number | null) => void;
  uniqueStatuses: number[];
  indexableFilter: boolean | null;
  onIndexableFilterChange: (value: boolean | null) => void;
  langFilter: string | null;
  onLangFilterChange: (value: string | null) => void;
  uniqueLangs: string[];
  onClearFilters: () => void;
}

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer";

export function TableFilters({
  statusFilter,
  onStatusFilterChange,
  uniqueStatuses,
  indexableFilter,
  onIndexableFilterChange,
  langFilter,
  onLangFilterChange,
  uniqueLangs,
  onClearFilters,
}: TableFiltersProps) {
  const hasActiveFilters =
    statusFilter !== null || indexableFilter !== null || langFilter !== null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={statusFilter ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onStatusFilterChange(val === "" ? null : Number(val));
        }}
        className={selectClass}
      >
        <option value="">Todos los estados</option>
        {uniqueStatuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={indexableFilter === null ? "" : indexableFilter ? "true" : "false"}
        onChange={(e) => {
          const val = e.target.value;
          onIndexableFilterChange(
            val === "" ? null : val === "true",
          );
        }}
        className={selectClass}
      >
        <option value="">Todos</option>
        <option value="true">Indexable</option>
        <option value="false">No indexable</option>
      </select>

      <select
        value={langFilter ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onLangFilterChange(val === "" ? null : val);
        }}
        className={selectClass}
      >
        <option value="">Todos los idiomas</option>
        {uniqueLangs.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
