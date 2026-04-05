"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Search, Layers, FileText, Zap } from "lucide-react";

export interface CrawlOptions {
  url: string;
  maxDepth: number;
  maxPages: number;
  useJs: boolean;
  respectRobotsTxt: boolean;
}

export function CrawlForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (options: CrawlOptions) => void;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [maxDepth, setMaxDepth] = useState(10);
  const [maxPages, setMaxPages] = useState(5000);
  const [useJs, setUseJs] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit({ url: url.trim(), maxDepth, maxPages, useJs, respectRobotsTxt: true });
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Configurar rastreo
        </h2>
        <p className="text-sm text-muted-foreground">
          Introduce la URL de inicio y ajusta los parametros del rastreo
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="url" className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            URL de inicio
          </Label>
          <Input
            id="url"
            type="url"
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={disabled}
            required
            className="h-10"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Profundidad maxima
            </span>
            <span className="text-sm font-medium tabular-nums bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              {maxDepth}
            </span>
          </Label>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[maxDepth]}
            onValueChange={(v: number | readonly number[]) => setMaxDepth(Array.isArray(v) ? v[0] : v)}
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-0.5">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pages" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Paginas maximas
          </Label>
          <Input
            id="pages"
            type="number"
            min={1}
            max={50000}
            value={maxPages}
            onChange={(e) => setMaxPages(parseInt(e.target.value) || 5000)}
            disabled={disabled}
            className="h-10"
          />
        </div>

        <div className="flex items-center gap-3 py-1">
          <Switch
            id="js"
            checked={useJs}
            onCheckedChange={setUseJs}
            disabled={disabled}
          />
          <Label htmlFor="js" className="flex items-center gap-1.5 cursor-pointer">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Usar renderizado JavaScript (mas lento)
          </Label>
        </div>

        <Button
          type="submit"
          disabled={disabled || !url.trim()}
          className="w-full h-10 text-sm font-medium"
        >
          {disabled ? "Rastreando..." : "Iniciar rastreo"}
        </Button>
      </form>
    </Card>
  );
}
