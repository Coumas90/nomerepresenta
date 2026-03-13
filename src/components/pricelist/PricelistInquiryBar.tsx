import { useState } from "react";
import { ArrowRight, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";

interface PricelistInquiryBarProps {
  selectedCount: number;
  selectedTitles: string[];
  selectedArtworks?: { label: string; imageUrl: string }[];
  pricelistName?: string;
  onClearSelection?: () => void;
}

export const PricelistInquiryBar = ({ selectedCount, selectedTitles, selectedArtworks, pricelistName, onClearSelection }: PricelistInquiryBarProps) => {
  const { trackUserEvent } = useAnalytics();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleOpenForm = () => {
    setShowForm(true);
    trackUserEvent("pricelist_inquiry_open", { pricelist: pricelistName, selected_count: selectedCount });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSending(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-inquiry", {
        body: {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          artworks: selectedTitles,
          artworkImages: selectedArtworks?.map((a) => ({ label: a.label, imageUrl: a.imageUrl })),
          pricelistName,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setSent(true);
      trackUserEvent("pricelist_inquiry_sent", { pricelist: pricelistName, selected_count: selectedTitles.length });
      setTimeout(() => {
        setSent(false);
        setShowForm(false);
        setName("");
        setEmail("");
        setMessage("");
        onClearSelection?.();
      }, 2500);
    } catch (err: unknown) {
      console.error("Inquiry error:", err);
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (selectedCount === 0 && !showForm) return null;

  return (
    <>
      {/* Inquiry form overlay */}
      {showForm && (
        <div className="fixed inset-0 z-30 bg-stone-900/40 backdrop-blur-sm flex items-end md:items-center justify-center print:hidden">
          <div className="bg-stone-100 w-full max-w-md md:rounded-lg p-6 md:p-8 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium tracking-wide uppercase text-stone-800">
                Send inquiry
              </h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              {selectedCount} {selectedCount === 1 ? "work" : "works"} selected
            </p>

            {sent ? (
              <div className="py-8 text-center">
                <p className="text-sm text-stone-700">Inquiry sent successfully.</p>
                <p className="text-xs text-stone-400 mt-1">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full bg-transparent border-b border-stone-300 focus:border-stone-700 outline-none py-2 text-sm text-stone-800 placeholder:text-stone-400 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="w-full bg-transparent border-b border-stone-300 focus:border-stone-700 outline-none py-2 text-sm text-stone-800 placeholder:text-stone-400 transition-colors"
                />
                <textarea
                  placeholder="Message (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={5000}
                  rows={3}
                  className="w-full bg-transparent border-b border-stone-300 focus:border-stone-700 outline-none py-2 text-sm text-stone-800 placeholder:text-stone-400 transition-colors resize-none"
                />

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={sending || !name.trim() || !email.trim()}
                  className="flex items-center gap-2 text-xs tracking-wide uppercase text-stone-800 hover:text-stone-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group pt-2"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom bar */}
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
              onClick={handleOpenForm}
              className="flex items-center gap-2 text-xs md:text-sm tracking-wide uppercase text-stone-800 hover:text-stone-600 transition-colors group"
            >
              <span>Send inquiry</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
