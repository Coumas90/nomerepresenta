import { ArrowRight } from "lucide-react";

interface PricelistInquiryBarProps {
  selectedCount: number;
  selectedTitles: string[];
  pricelistName?: string;
}

export const PricelistInquiryBar = ({ selectedCount, selectedTitles, pricelistName }: PricelistInquiryBarProps) => {
  const handleInquiry = () => {
    const subject = encodeURIComponent(`Inquiry — ${pricelistName || "Pricelist"}`);
    const body = encodeURIComponent(
      `Hello,\n\nI would like to inquire about the following work${selectedTitles.length > 1 ? "s" : ""}:\n\n${selectedTitles.map((t) => `• ${t}`).join("\n")}\n\nThank you.`
    );
    window.location.href = `mailto:contact@ivancomas.studio?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-20 print:hidden
        transition-all duration-500 ease-out
        ${selectedCount > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}
      `}
    >
      <div className="bg-stone-100/95 backdrop-blur border-t border-stone-300">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-3 md:py-4 flex items-center justify-between">
          <span className="text-xs text-stone-500 tracking-wide">
            {selectedCount} {selectedCount === 1 ? "work" : "works"} selected
          </span>
          <button
            onClick={handleInquiry}
            className="flex items-center gap-2 text-xs md:text-sm tracking-wide uppercase text-stone-800 hover:text-stone-600 transition-colors group"
          >
            <span>Send inquiry</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
