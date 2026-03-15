import { useParams } from "react-router-dom";
import { useInvoiceByToken } from "@/hooks/useInvoices";
import InvoicePreview from "@/components/admin/invoices/InvoicePreview";

const InvoicePublic = () => {
  const { token } = useParams<{ token: string }>();
  const { data: invoice, isLoading, error } = useInvoiceByToken(token);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading invoice…</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Invoice not found.</p>
      </div>
    );
  }

  const artworks = (invoice.invoice_artworks || [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((ia) => ia.artwork!)
    .filter(Boolean);

  const lineItems = (invoice.invoice_line_items || [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((li) => ({
      description: li.description,
      price: Number(li.price),
      display_order: li.display_order,
    }));

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <InvoicePreview
        isPublic
        invoice={{
          invoiceNumber: invoice.invoice_number,
          invoiceDate: invoice.invoice_date,
          sellerName: invoice.seller_name,
          sellerAddress: invoice.seller_address,
          buyerName: invoice.buyer_name,
          buyerAddress: invoice.buyer_address,
          currency: invoice.currency,
          conditions: invoice.conditions,
          artworks,
          lineItems,
          total: Number(invoice.total_price),
        }}
      />
    </div>
  );
};

export default InvoicePublic;
