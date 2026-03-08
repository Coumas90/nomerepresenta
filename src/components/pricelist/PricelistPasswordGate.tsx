import { useState } from "react";

interface PricelistPasswordGateProps {
  onSubmit: (password: string) => boolean;
}

export const PricelistPasswordGate = ({ onSubmit }: PricelistPasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onSubmit(password);
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
          className="w-full border-b border-stone-300 bg-transparent py-2 text-center text-sm tracking-wide text-stone-800 placeholder:text-stone-400 focus:border-stone-800 focus:outline-none transition-colors"
        />
        {error && (
          <p className="text-xs text-red-500">Incorrect password</p>
        )}
        <button
          type="submit"
          className="text-xs tracking-[0.15em] uppercase text-stone-500 hover:text-stone-800 transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
};
