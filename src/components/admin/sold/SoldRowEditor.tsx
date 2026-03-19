import { useState, useRef, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Download, FileText, ChevronDown, Check } from "lucide-react";
import type { SoldArtwork } from "@/hooks/useSoldArtworks";
import { useSoldInstallments, useSyncInstallments, useUpdateInstallment, type SoldInstallment } from "@/hooks/useSoldInstallments";

const PAYMENT_STATUSES = ["pending", "paid", "installments", "trade"];
const COLLECTOR_TYPES = ["Private", "Institution", "Gallery"];
const SOLD_THROUGH_OPTIONS = ["Studio", "Gallery", "Fair", "Online", "Friend space", "Other"];
const CURRENCIES = ["USD", "EUR", "BRL", "GBP"];
const INSTALLMENT_STATUSES = ["pending", "paid"];

export type ThumbSize = "sm" | "md" | "lg";
const THUMB_SIZES: Record<ThumbSize, number> = { sm: 40, md: 64, lg: 120 };

interface SoldRowEditorProps {
  item: SoldArtwork;
  thumbSize: ThumbSize;
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onUploadInvoice: (soldId: string, file: File) => void;
  onDownloadInvoice: (path: string) => void;
}

export const SoldRowEditor = ({ item, thumbSize, onUpdate, onDelete, onUploadInvoice, onDownloadInvoice }: SoldRowEditorProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const isInstallments = item.payment_status === "installments";
  const [installmentsOpen, setInstallmentsOpen] = useState(false);

  const { data: installments = [] } = useSoldInstallments(item.id);
  const syncInstallments = useSyncInstallments();
  const updateInstallment = useUpdateInstallment();

  const handleBlur = (field: string, value: string | number | null) => {
    onUpdate(item.id, { [field]: value || null });
  };

  const handleSelectChange = (field: string, value: string) => {
    onUpdate(item.id, { [field]: value });
  };

  const handleInstallmentCountChange = (countStr: string) => {
    const count = countStr ? parseInt(countStr, 10) : 0;
    if (isNaN(count) || count < 0) return;
    onUpdate(item.id, { installment_count: count || null });
    if (count > 0) {
      syncInstallments.mutate({ soldArtworkId: item.id, count, totalPrice: item.sale_price });
    } else {
      syncInstallments.mutate({ soldArtworkId: item.id, count: 0 });
    }
  };

  const handleInstallmentUpdate = (inst: SoldInstallment, field: string, value: unknown) => {
    updateInstallment.mutate({ id: inst.id, soldArtworkId: item.id, updates: { [field]: value || null } });
  };

  return (
    <>
      <TableRow className="align-top">
        {/* Artwork info */}
        <TableCell className="min-w-[260px]">
          <div className="flex items-center gap-3">
            {item.artwork && (
              <img
                src={item.artwork.image_url}
                alt={item.artwork.title}
                style={{ width: THUMB_SIZES[thumbSize], height: THUMB_SIZES[thumbSize] }}
                className="object-contain rounded shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-tight">{item.artwork?.title || "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
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
            {isInstallments && (
              <div className="space-y-1 pl-1 border-l-2 border-muted ml-1">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    defaultValue={item.installment_count ?? ""}
                    onBlur={(e) => handleInstallmentCountChange(e.target.value)}
                    className="h-6 text-[10px] w-[60px]"
                    placeholder="# inst."
                    min={0}
                  />
                  {installments.length > 0 && (
                    <button
                      onClick={() => setInstallmentsOpen(!installmentsOpen)}
                      className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown className={`h-3 w-3 transition-transform ${installmentsOpen ? "rotate-180" : ""}`} />
                      {installmentsOpen ? "Hide" : `${installments.length} inst.`}
                    </button>
                  )}
                </div>
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

      {/* Expandable installment rows */}
      {isInstallments && installmentsOpen && installments.length > 0 && (
        <TableRow className="bg-muted/20">
          <TableCell colSpan={10} className="py-2 px-6">
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Installments ({installments.length})
              </p>
              <div className="grid grid-cols-[40px_100px_100px_90px_90px_1fr] gap-2 text-[10px] text-muted-foreground font-medium px-1">
                <span>#</span>
                <span>Due Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Paid Date</span>
                <span>Notes</span>
              </div>
              {installments.map((inst) => (
                <div
                  key={inst.id}
                  className="grid grid-cols-[40px_100px_100px_90px_90px_1fr] gap-2 items-center px-1 py-0.5 rounded hover:bg-muted/40 transition-colors"
                >
                  <span className="text-[10px] text-muted-foreground font-medium">{inst.installment_number}</span>
                  <Input
                    type="date"
                    defaultValue={inst.due_date || ""}
                    onBlur={(e) => handleInstallmentUpdate(inst, "due_date", e.target.value)}
                    className="h-6 text-[10px] w-[100px]"
                  />
                  <Input
                    type="number"
                    defaultValue={inst.amount ?? ""}
                    onBlur={(e) => handleInstallmentUpdate(inst, "amount", e.target.value ? Number(e.target.value) : null)}
                    className="h-6 text-[10px] w-[90px]"
                    placeholder="0"
                  />
                  <Select
                    defaultValue={inst.status}
                    onValueChange={(v) => handleInstallmentUpdate(inst, "status", v)}
                  >
                    <SelectTrigger className="h-6 text-[10px] w-[80px]">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 ${
                          inst.status === "paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {inst.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {INSTALLMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    defaultValue={inst.paid_date || ""}
                    onBlur={(e) => handleInstallmentUpdate(inst, "paid_date", e.target.value)}
                    className="h-6 text-[10px] w-[90px]"
                  />
                  <Input
                    defaultValue={inst.notes || ""}
                    onBlur={(e) => handleInstallmentUpdate(inst, "notes", e.target.value)}
                    className="h-6 text-[10px]"
                    placeholder="Note..."
                  />
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const MAX_PREVIEW = 60;

const NotesCell = ({ value, onSave }: { value: string; onSave: (v: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = value.length > MAX_PREVIEW;

  return (
    <div className="w-[160px]">
      <textarea
        defaultValue={value}
        onBlur={(e) => onSave(e.target.value)}
        className="flex w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        rows={expanded ? 5 : 2}
        placeholder="Notes…"
      />
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 mt-0.5"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
};

