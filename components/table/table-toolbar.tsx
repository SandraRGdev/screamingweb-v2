"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet, ClipboardCopy, Check } from "lucide-react";

export function TableToolbar({
  search,
  onSearchChange,
  resultCount,
  onExportCsv,
  onExportJson,
  onCopyUrls,
  filters,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  onExportCsv: () => void;
  onExportJson: () => void;
  onCopyUrls: () => Promise<void>;
  filters?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopyUrls();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-4 gap-4">
        <Input
          placeholder="Filtrar URLs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {resultCount} resultados
          </span>
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <ClipboardCopy className="h-4 w-4 mr-1" />
            )}
            {copied ? "Copiado" : "Copiar URLs"}
          </Button>
          <Button onClick={onExportCsv} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button onClick={onExportJson} variant="outline" size="sm">
            <FileJson className="h-4 w-4 mr-1" />
            JSON
          </Button>
        </div>
      </div>
      {filters}
    </div>
  );
}
