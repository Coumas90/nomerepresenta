import { useNavigate } from "react-router-dom";
import { Undo2 } from "lucide-react";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-stone-100 flex flex-col">
      <header className="sticky top-0 bg-stone-100/95 backdrop-blur-sm border-b border-stone-200 z-50">
        <div className="flex items-center justify-end px-4 md:px-8 py-3 md:py-4">
          <button
            onClick={() => navigate("/")}
            className="text-stone-700 hover:opacity-60 transition-opacity"
            aria-label="Back to menu"
          >
            <Undo2 className="w-5 md:w-6 h-5 md:h-6" />
          </button>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <a
          href="mailto:contact@ivancomas.studio"
          className="font-helvetica font-bold tracking-tight text-foreground hover:opacity-60 transition-opacity duration-300 text-center break-all"
          style={{ fontSize: 'clamp(1.4rem, 4.65vw, 3.72rem)' }}
        >
          contact@ivancomas.studio
        </a>
      </div>
    </div>
  );
};

export default Contact;
