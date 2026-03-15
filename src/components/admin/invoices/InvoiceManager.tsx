import { useState } from "react";
import { Plus, FileText, Trash2, Link2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices";
import { toast } from "sonner";
import InvoiceEditor from "./InvoiceEditor";

const InvoiceManager = () => {
  const { data: invoices = [], isLoading } = useInvoices();
  const deleteMutation = useDeleteInvoice();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("Delete this invoice?")) {
      deleteMutation.mutate(id);
    }
  };

  const copyMagicLink = (token: string) => {
    const url = `${window.location.origin}/invoice/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Magic link copied to clipboard");
  };

  if (creating || editingId) {
    return (
      <InvoiceEditor
        invoiceId={editingId}
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
      />
    );
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading invoices…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Invoices</h2>
          <p className="text-xs text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground border rounded-lg">
          No invoices yet. Click "New Invoice" to create one.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Artworks</TableHead>
              <TableHead className="w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                <TableCell>{inv.invoice_date}</TableCell>
                <TableCell>{inv.buyer_name || "—"}</TableCell>
                <TableCell>
                  {inv.currency} {Number(inv.total_price).toLocaleString()}
                </TableCell>
                <TableCell>{inv.invoice_artworks?.length || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(inv.id)} title="Edit">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyMagicLink(inv.magic_token)} title="Copy link">
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default InvoiceManager;
