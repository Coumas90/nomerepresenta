import { useState, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Download, FileText, ChevronDown } from "lucide-react";
import type { SoldArtwork } from "@/hooks/useSoldArtworks";

const PAYMENT_STATUSES = ["pending", "paid", "installments", "trade"];
const COLLECTOR_TYPES = ["Private", "Institution", "Gallery"];
const SOLD_THROUGH_OPTIONS = ["Studio", "Gallery", "Fair", "Online", "Friend space", "Other"];
const CURRENCIES = ["USD", "EUR", "BRL", "GBP"];

interface SoldRowEditorProps {
  item: SoldArtwork;
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onUploadInvoice: (soldId: string, file: File) => void;
  onDownloadInvoice: (path: string) => void;
}

export const SoldRowEditor = ({ item, onUpdate, onDelete, onUploadInvoice, onDownloadInvoice }: SoldRowEditorProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showInstallments, setShowInstallments] = useState(item.payment_status === "installments");

  const handleBlur = (field: string, value: string | number | null) => {
    onUpdate(item.id, { [field]: value || null });
  };

  const handleSelectChange = (field: string, value: string) => {
    onUpdate(item.id, { [field]: value });
    if (field === "payment_status") {
      setShowInstallments(value === "installments");
    }
  };

  return (
    <TableRow className="align-top">
      {/* Artwork info */}
      <TableCell className="w-[200px]">
        <div className="flex items-center gap-2">
          {item.artwork && (
            <img src={item.artwork.image_url} alt={item.artwork.title} className="w-10 h-10 object-cover rounded" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{item.artwork?.title || "—"}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {item.artwork?.catalog_series || ""} {item.artwork?.year ? `· ${item.artwork.year}` : ""}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Date Sold */}
      <TableCell>
        <Input
          type="date"
          defaultValue={item.date_sold || ""}
          onBlur={(e) => handleBlur("date_sold", e.target.value)}
          className="h-7 text-xs w-[130px]"
        />
      </TableCell>

      {/* Sale Price + Currency */}
      <TableCell>
        <div className="flex gap-1">
          <Input
            type="number"
            defaultValue={item.sale_price ?? ""}
            onBlur={(e) => handleBlur("sale_price", e.target.value ? Number(e.target.value) : null)}
            className="h-7 text-xs w-[90px]"
            placeholder="0"
          />
          <Select defaultValue={item.currency || "USD"} onValueChange={(v) => handleSelectChange("currency", v)}>
            <SelectTrigger className="h-7 text-xs w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </TableCell>

      {/* Payment Status */}
      <TableCell>
        <div className="space-y-1">
          <Select defaultValue={item.payment_status || "pending"} onValueChange={(v) => handleSelectChange("payment_status", v)}>
            <SelectTrigger className="h-7 text-xs w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {showInstallments && (
            <div className="space-y-1 pl-1 border-l-2 border-muted ml-1">
              <Input
                type="number"
                defaultValue={item.installment_count ?? ""}
                onBlur={(e) => handleBlur("installment_count", e.target.value ? Number(e.target.value) : null)}
                className="h-6 text-[10px] w-[80px]"
                placeholder="# inst."
              />
              <Input
                type="date"
                defaultValue={item.installment_start_date || ""}
                onBlur={(e) => handleBlur("installment_start_date", e.target.value)}
                className="h-6 text-[10px] w-[120px]"
              />
              <Input
                type="date"
                defaultValue={item.installment_end_date || ""}
                onBlur={(e) => handleBlur("installment_end_date", e.target.value)}
                className="h-6 text-[10px] w-[120px]"
              />
            </div>
          )}
        </div>
      </TableCell>

      {/* Collector */}
      <TableCell>
        <div className="space-y-1">
          <Input
            defaultValue={item.collector_name || ""}
            onBlur={(e) => handleBlur("collector_name", e.target.value)}
            className="h-7 text-xs w-[140px]"
            placeholder="Name"
          />
          <Select defaultValue={item.collector_type || ""} onValueChange={(v) => handleSelectChange("collector_type", v)}>
            <SelectTrigger className="h-6 text-[10px] w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {COLLECTOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </TableCell>

      {/* Location */}
      <TableCell>
        <div className="space-y-1">
          <Input
            defaultValue={item.collector_city || ""}
            onBlur={(e) => handleBlur("collector_city", e.target.value)}
            className="h-7 text-xs w-[100px]"
            placeholder="City"
          />
          <Input
            defaultValue={item.collector_country || ""}
            onBlur={(e) => handleBlur("collector_country", e.target.value)}
            className="h-6 text-[10px] w-[100px]"
            placeholder="Country"
          />
        </div>
      </TableCell>

      {/* Contact */}
      <TableCell>
        <div className="space-y-1">
          <Input
            defaultValue={item.collector_email || ""}
            onBlur={(e) => handleBlur("collector_email", e.target.value)}
            className="h-7 text-xs w-[150px]"
            placeholder="Email"
            type="email"
          />
          <Input
            defaultValue={item.collector_phone || ""}
            onBlur={(e) => handleBlur("collector_phone", e.target.value)}
            className="h-6 text-[10px] w-[120px]"
            placeholder="Phone"
          />
        </div>
      </TableCell>

      {/* Sales Channel */}
      <TableCell>
        <div className="space-y-1">
          <Select defaultValue={item.sold_through || ""} onValueChange={(v) => handleSelectChange("sold_through", v)}>
            <SelectTrigger className="h-7 text-xs w-[110px]">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              {SOLD_THROUGH_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            defaultValue={item.gallery_name || ""}
            onBlur={(e) => handleBlur("gallery_name", e.target.value)}
            className="h-6 text-[10px] w-[110px]"
            placeholder="Gallery name"
          />
          <Input
            type="number"
            defaultValue={item.commission_percentage ?? ""}
            onBlur={(e) => handleBlur("commission_percentage", e.target.value ? Number(e.target.value) : null)}
            className="h-6 text-[10px] w-[80px]"
            placeholder="Comm %"
          />
        </div>
      </TableCell>

      {/* Notes */}
      <TableCell>
        <NotesCell
          value={item.notes || ""}
          onSave={(v) => handleBlur("notes", v)}
        />
      </TableCell>

      {/* Invoice + Actions */}
      <TableCell>
        <div className="flex items-center gap-1">
          {item.invoice_url ? (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownloadInvoice(item.invoice_url!)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
              <FileText className="h-3 w-3 text-muted-foreground" />
            </>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadInvoice(item.id, f);
            }}
          />
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
