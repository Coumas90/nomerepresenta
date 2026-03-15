import { useRef, useState, useCallback } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ArtworkInfo {
  id: string;
  title: string;
  year: string | null;
  dimensions: string | null;
  materials: string | null;
  image_url: string;
}

interface LineItem {
  description: string;
  price: number;
  display_order: number;
}

export interface InvoicePreviewData {
  invoiceNumber: string;
  invoiceDate: string;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  currency: string;
  conditions: string;
  artworks: ArtworkInfo[];
  lineItems: LineItem[];
  total: number;
}

interface Props {
  invoice: InvoicePreviewData;
  onBack?: () => void;
  isPublic?: boolean;
}

/** Convert an image URL to a base64 data URL to avoid CORS issues in html2canvas */
const toBase64 = (url: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = () => resolve(url); // fallback to original
    img.src = url;
  });

const InvoicePreview = ({ invoice, onBack, isPublic = false }: Props) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    setGenerating(true);
    try {
      // Pre-convert all images to base64 to avoid CORS issues
      const imgs = previewRef.current.querySelectorAll<HTMLImageElement>("img[data-artwork]");
      const originals: { el: HTMLImageElement; src: string }[] = [];
      await Promise.all(
        Array.from(imgs).map(async (img) => {
          originals.push({ el: img, src: img.src });
          img.src = await toBase64(img.src);
        })
      );

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `invoice-${invoice.invoiceNumber.replace("#", "")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(previewRef.current)
        .save();

      // Restore original src
      originals.forEach(({ el, src }) => { el.src = src; });
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  }, [invoice.invoiceNumber]);

  // Group artworks into rows of 2
  const artworkRows: ArtworkInfo[][] = [];
  for (let i = 0; i < invoice.artworks.length; i += 2) {
    artworkRows.push(invoice.artworks.slice(i, i + 2));
  }

  return (
    <div className="space-y-4">
      {!isPublic && (
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Editor
          </Button>
          <Button onClick={handleDownloadPDF} size="sm" disabled={generating}>
            <Download className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      )}

      {isPublic && (
        <div className="flex justify-end print:hidden pb-2">
          <Button onClick={handleDownloadPDF} size="sm" disabled={generating}>
            <Download className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      )}

      {/* A4 Preview */}
      <div className="flex justify-center">
        <div
          ref={previewRef}
          className="bg-white shadow-lg"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "25mm 30mm 20mm 30mm",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            color: "#000",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          {/* Header: Seller left, Invoice info right */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{invoice.sellerName}</div>
              <div style={{ fontSize: "13px", whiteSpace: "pre-line", lineHeight: 1.6 }}>
                {invoice.sellerAddress}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: "15px" }}>INVOICE {invoice.invoiceNumber}</div>
              <div style={{ fontSize: "13px" }}>{formatDate(invoice.invoiceDate)}</div>
            </div>
          </div>

          {/* Buyer */}
          {(invoice.buyerName || invoice.buyerAddress) && (
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>TO:</div>
              {invoice.buyerName && (
                <div style={{ fontSize: "13px" }}>{invoice.buyerName}</div>
              )}
              {invoice.buyerAddress && (
                <div style={{ fontSize: "13px", whiteSpace: "pre-line", lineHeight: 1.6 }}>
                  {invoice.buyerAddress}
                </div>
              )}
            </div>
          )}

          {/* Artworks Grid */}
          {artworkRows.length > 0 && (
            <div style={{ marginBottom: "36px" }}>
              {artworkRows.map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    display: "flex",
                    gap: "24px",
                    marginBottom: "16px",
                    justifyContent: row.length === 1 ? "flex-start" : "center",
                  }}
                >
                  {row.map((art) => (
                    <div
                      key={art.id}
                      style={{
                        flex: row.length === 1 ? "0 0 48%" : "1",
                        maxWidth: "48%",
                      }}
                    >
                      <img
                        data-artwork="true"
                        src={art.image_url}
                        alt={art.title}
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Price Lines */}
          {invoice.lineItems.some((li) => li.description || li.price > 0) && (
            <div style={{ marginBottom: "24px" }}>
              {invoice.lineItems
                .filter((li) => li.description || li.price > 0)
                .map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      fontSize: "14px",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    <span>{item.description}</span>
                    <span
                      style={{
                        flex: 1,
                        borderBottom: "1px solid #999",
                        margin: "0 16px",
                        position: "relative",
                        top: "-3px",
                      }}
                    />
                    <span>
                      {invoice.currency}
                      {item.price.toLocaleString()}
                    </span>
                  </div>
                ))}

              {/* Total (only if multiple lines) */}
              {invoice.lineItems.filter((li) => li.description || li.price > 0).length > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    fontSize: "15px",
                    fontWeight: 700,
                    borderTop: "1px solid #000",
                    paddingTop: "8px",
                    marginTop: "8px",
                  }}
                >
                  Total: {invoice.currency}
                  {invoice.total.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Conditions */}
          {invoice.conditions && (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  borderTop: "3px solid #000",
                  paddingTop: "24px",
                  marginTop: "8px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
                  Conditions of sale
                </div>
                <div style={{ fontSize: "13px", whiteSpace: "pre-line", lineHeight: 1.7 }}>
                  {invoice.conditions}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "20mm",
              left: "30mm",
              right: "30mm",
            }}
          >
            <div style={{ borderTop: "3px solid #000", paddingTop: "16px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  color: "#000",
                }}
              >
                IVAN COMAS STUDIO
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
