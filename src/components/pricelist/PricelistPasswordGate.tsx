import { useState } from "react";

interface PricelistPasswordGateProps {
  onSubmit: (password: string) => Promise<boolean>;
}

export const PricelistPasswordGate = ({ onSubmit }: PricelistPasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const success = await onSubmit(password);
    setLoading(false);
    if (!success) {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4 text-center">
        <h1 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-500">
          Password Required
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Enter password"
          autoFocus
          disabled={loading}
          className="w-full border-b border-stone-300 bg-transparent py-2 text-center text-base tracking-wide text-stone-800 placeholder:text-stone-400 focus:border-stone-800 focus:outline-none transition-colors disabled:opacity-50"
        />
        {error && (
          <p className="text-xs text-red-500">Incorrect password</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="text-xs tracking-[0.15em] uppercase text-stone-500 hover:text-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Enter"}
        </button>
      </form>
    </div>
  );
};
