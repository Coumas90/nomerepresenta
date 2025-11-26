import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isWorksOpen, setIsWorksOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Don't hide header when dropdown or mobile menu is open
      if (isWorksOpen || isMobileMenuOpen) {
        setIsVisible(true);
        return;
      }
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isWorksOpen, isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isWorksOpen ? 'bg-foreground' : 'bg-transparent'
    } ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Artist Name - Left */}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('top');
          }}
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight hover:opacity-70 transition-all duration-300 cursor-pointer ${
            isWorksOpen ? 'text-background' : 'text-foreground'
          }`}
        >
          IVAN COMAS
        </a>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8 ml-auto">
          <div 
            className="relative"
            onMouseEnter={() => setIsWorksOpen(true)}
            onMouseLeave={() => setIsWorksOpen(false)}
          >
            <a 
              href="#works" 
              className={`text-sm font-medium tracking-wide hover:opacity-70 transition-all duration-300 ${
                isWorksOpen ? 'text-background' : 'text-foreground'
              }`}
            >
              WORKS
            </a>
            
            {isWorksOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-screen z-40">
                <div className="bg-foreground text-background py-8 px-6 w-full flex flex-col items-center">
                  <a 
                    href="#works" 
                    className="text-base font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap text-background"
                  >
                    TRI-PEEL
                  </a>
                </div>
              </div>
            )}
          </div>
          <a 
            href="#bio" 
            className={`text-sm font-medium tracking-wide hover:opacity-70 transition-all duration-300 ${
              isWorksOpen ? 'text-background' : 'text-foreground'
            }`}
          >
            BIO
          </a>
          <a 
            href="#contact" 
            className={`text-sm font-medium tracking-wide hover:opacity-70 transition-all duration-300 ${
              isWorksOpen ? 'text-background' : 'text-foreground'
            }`}
          >
            CONTACT
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button 
              className={`p-2 ${isWorksOpen ? 'text-background' : 'text-foreground'}`}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-full max-w-none bg-foreground text-background border-none p-0"
          >
            <div className="flex flex-col h-full px-6">
              {/* Logo/Nombre del artista arriba */}
              <div className="pt-8">
                <button
                  onClick={() => scrollToSection('top')}
                  className="text-2xl font-bold italic tracking-tight hover:opacity-70 transition-opacity"
                >
                  IVAN COMAS
                </button>
              </div>
              
              {/* Navegación centrada verticalmente */}
              <nav className="flex-1 flex flex-col justify-center gap-8 -mt-16">
                {/* Grupo WORKS + TRI-PEEL */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => scrollToSection('works')}
                    className="text-left text-2xl font-medium tracking-wide hover:opacity-70 transition-opacity"
                  >
                    WORKS
                  </button>
                  
                  <button
                    onClick={() => scrollToSection('works')}
                    className="text-left text-lg font-normal tracking-wide hover:opacity-70 transition-opacity ml-4"
                  >
                    / TRI-PEEL
                  </button>
                </div>
                
                <button
                  onClick={() => scrollToSection('bio')}
                  className="text-left text-2xl font-medium tracking-wide hover:opacity-70 transition-opacity"
                >
                  BIO
                </button>
                
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-left text-2xl font-medium tracking-wide hover:opacity-70 transition-opacity"
                >
                  CONTACT
                </button>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
