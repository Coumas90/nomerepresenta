import { useState, useEffect } from "react";

const Header = () => {
  const [isWorksOpen, setIsWorksOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Don't hide header when dropdown is open
      if (isWorksOpen) {
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
  }, [lastScrollY, isWorksOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isWorksOpen ? 'bg-foreground' : 'bg-background'
    } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Artist Name - Left */}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`text-xl font-bold tracking-tight hover:opacity-70 transition-all duration-300 cursor-pointer ${
            isWorksOpen ? 'text-background' : 'text-foreground'
          }`}
        >
          IVAN COMAS
        </a>

        {/* Navigation - Center */}
        <nav className="flex items-center gap-8">
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

        {/* Right side - empty for now, can add search/account later */}
        <div className="w-32"></div>
      </div>
    </header>
  );
};

export default Header;
