import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Link2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvoice, useNextInvoiceNumber, useCreateInvoice, useUpdateInvoice } from "@/hooks/useInvoices";
import { toast } from "sonner";
import ArtworkPicker from "@/components/admin/works/ArtworkPicker";
import InvoicePreview from "./InvoicePreview";
import { useCatalogArtworks } from "@/hooks/useCatalog";
import { resolveArtworkImageUrl } from "@/lib/artworkImageUrl";

interface LineItem {
  description: string;
  price: number;
  display_order: number;
}

interface Props {
  invoiceId: string | null;
  onClose: () => void;
}

const CURRENCIES = ["R$", "USD", "EUR", "£"];

const InvoiceEditor = ({ invoiceId, onClose }: Props) => {
  const { data: existingInvoice } = useInvoice(invoiceId || undefined);
  const { data: nextNumber } = useNextInvoiceNumber();
  const { data: catalogArtworks = [] } = useCatalogArtworks();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [sellerName, setSellerName] = useState("Ivan Comas");
  const [sellerAddress, setSellerAddress] = useState("2227 Alcyona dr\n90068, Los Angeles\nCalifornia");
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [currency, setCurrency] = useState("R$");
  const [conditions, setConditions] = useState("");
  const [artworkIds, setArtworkIds] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", price: 0, display_order: 0 }]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing invoice data
  useEffect(() => {
    if (existingInvoice) {
      setInvoiceNumber(existingInvoice.invoice_number);
      setInvoiceDate(existingInvoice.invoice_date);
      setSellerName(existingInvoice.seller_name);
      setSellerAddress(existingInvoice.seller_address);
      setBuyerName(existingInvoice.buyer_name);
      setBuyerAddress(existingInvoice.buyer_address);
      setCurrency(existingInvoice.currency);
      setConditions(existingInvoice.conditions);
      setArtworkIds(
        (existingInvoice.invoice_artworks || [])
          .sort((a, b) => a.display_order - b.display_order)
          .map((ia) => ia.artwork_id)
      );
      const items = (existingInvoice.invoice_line_items || [])
        .sort((a, b) => a.display_order - b.display_order)
        .map((li) => ({
          description: li.description,
          price: Number(li.price),
          display_order: li.display_order,
        }));
      setLineItems(items.length > 0 ? items : [{ description: "", price: 0, display_order: 0 }]);
    } else if (nextNumber) {
      setInvoiceNumber(nextNumber);
    }
  }, [existingInvoice, nextNumber]);

  const selectedArtworks = artworkIds
    .map((id) => catalogArtworks.find((a) => a.id === id))
    .filter(Boolean) as typeof catalogArtworks;

  const total = lineItems.reduce((sum, li) => sum + (li.price || 0), 0);

  const handleAddLine = () => {
    setLineItems([...lineItems, { description: "", price: 0, display_order: lineItems.length }]);
  };

  const handleRemoveLine = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((li, i) => (i === idx ? { ...li, [field]: value } : li)));
  };

  const handleAddArtworks = (ids: string[]) => {
    setArtworkIds([...artworkIds, ...ids]);
  };

  const handleRemoveArtwork = (id: string) => {
    setArtworkIds(artworkIds.filter((a) => a !== id));
  };

  const handleSave = async () => {
    const payload = {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      seller_name: sellerName,
      seller_address: sellerAddress,
      buyer_name: buyerName,
      buyer_address: buyerAddress,
      conditions,
      total_price: total,
      currency,
      artwork_ids: artworkIds,
      line_items: lineItems.map((li, i) => ({ ...li, display_order: i })),
    };

    if (invoiceId) {
      await updateMutation.mutateAsync({ id: invoiceId, invoice: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const copyMagicLink = () => {
    if (existingInvoice?.magic_token) {
      const url = `${window.location.origin}/invoice/${existingInvoice.magic_token}`;
      navigator.clipboard.writeText(url);
      toast.success("Magic link copied");
    }
  };

  const invoiceData = {
    invoiceNumber,
    invoiceDate,
    sellerName,
    sellerAddress,
    buyerName,
    buyerAddress,
    currency,
    conditions,
    artworks: selectedArtworks,
    lineItems,
    total,
  };

  if (showPreview) {
    return (
      <InvoicePreview
        invoice={invoiceData}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Invoices
        </Button>
        <div className="flex gap-2">
          {invoiceId && (
            <Button variant="outline" size="sm" onClick={copyMagicLink}>
              <Link2 className="h-4 w-4 mr-1" /> Copy Link
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-1" /> Preview & PDF
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {invoiceId ? "Update" : "Save"} Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Metadata */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Seller</h3>
          <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Seller name" />
          <Textarea
            value={sellerAddress}
            onChange={(e) => setSellerAddress(e.target.value)}
            placeholder="Seller address"
            rows={3}
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Invoice Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Invoice #" />
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Buyer</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Buyer name" />
          <Textarea
            value={buyerAddress}
            onChange={(e) => setBuyerAddress(e.target.value)}
            placeholder="Buyer address"
            rows={3}
          />
        </div>
      </div>

      {/* Artworks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Artworks</h3>
          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Artwork
          </Button>
        </div>
        {selectedArtworks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
            No artworks selected.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedArtworks.map((art) => (
              <div key={art.id} className="relative border rounded-lg p-2 group">
                <img src={resolveArtworkImageUrl(art.image_url)} alt={art.title} className="w-full aspect-square object-contain rounded" />
                <div className="mt-2 text-xs">
                  <p className="font-medium">{art.title}{art.year ? `, ${art.year}` : ""}</p>
                  {art.materials && <p className="text-muted-foreground">{art.materials}</p>}
                  {art.dimensions && <p className="text-muted-foreground">{art.dimensions}</p>}
                </div>
                <button
                  onClick={() => handleRemoveArtwork(art.id)}
                  className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Price Lines</h3>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {lineItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Input
              className="flex-1"
              value={item.description}
              onChange={(e) => handleLineChange(idx, "description", e.target.value)}
              placeholder="Description (e.g. 2 Paintings 30×36 cm)"
            />
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">{currency}</span>
              <Input
                className="w-[140px]"
                type="number"
                value={item.price || ""}
                onChange={(e) => handleLineChange(idx, "price", parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            {lineItems.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => handleRemoveLine(idx)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddLine}>
          <Plus className="h-4 w-4 mr-1" /> Add Line
        </Button>
        <div className="flex justify-end text-sm font-semibold border-t pt-3">
          Total: {currency} {total.toLocaleString()}
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Conditions of Sale</h3>
        <Textarea
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          placeholder="Payment terms, conditions, etc."
          rows={4}
        />
      </div>

      <ArtworkPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddArtworks}
        excludeIds={artworkIds}
        multiple
      />
    </div>
  );
};

export default InvoiceEditor;
