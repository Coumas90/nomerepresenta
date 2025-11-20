import { NavLink } from "@/components/NavLink";
import { useState, useEffect } from "react";

const Header = () => {
  const [isWorksOpen, setIsWorksOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
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
  }, [lastScrollY]);

  return (
    <header className={`fixed top-0 left-0 right-0 border-b z-50 transition-all duration-300 ${
      isWorksOpen ? 'bg-foreground border-foreground' : 'bg-background border-border'
    } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Artist Name - Left */}
        <NavLink 
          to="/" 
          className={`text-xl font-bold tracking-tight hover:opacity-70 transition-all duration-300 ${
            isWorksOpen ? 'text-background' : 'text-foreground'
          }`}
        >
          IVAN COMAS
        </NavLink>

        {/* Navigation - Center */}
        <nav className="flex items-center gap-8">
          <div 
            className="relative"
            onMouseEnter={() => setIsWorksOpen(true)}
            onMouseLeave={() => setIsWorksOpen(false)}
          >
            <NavLink 
              to="/works" 
              className={`text-sm font-medium tracking-wide hover:opacity-70 transition-all duration-300 ${
                isWorksOpen ? 'text-background' : 'text-foreground'
              }`}
              activeClassName="opacity-100"
            >
              WORKS
            </NavLink>
            
            {isWorksOpen && (
              <div className="fixed left-0 right-0 top-[73px] z-40">
                <div className="bg-foreground text-background py-12 px-6 w-full flex flex-col items-center gap-4">
                  <NavLink 
                    to="/works/new-arrivals" 
                    className="text-base font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap text-background"
                  >
                    NEW ARRIVALS
                  </NavLink>
                  <NavLink 
                    to="/works/paintings" 
                    className="text-base font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap text-background"
                  >
                    PAINTINGS
                  </NavLink>
                  <NavLink 
                    to="/works/sculptures" 
                    className="text-base font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap text-background"
                  >
                    SCULPTURES
                  </NavLink>
                  <NavLink 
                    to="/works/drawings" 
                    className="text-base font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap text-background"
                  >
                    DRAWINGS
                  </NavLink>
                  <NavLink 
                    to="/works/installations" 
                    className="text-base font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap text-background"
                  >
                    INSTALLATIONS
                  </NavLink>
                  <NavLink 
                    to="/works/digital" 
                    className="text-base font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap text-background"
                  >
                    DIGITAL
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          <NavLink 
            to="/bio" 
            className={`text-sm font-medium tracking-wide hover:opacity-70 transition-all duration-300 ${
              isWorksOpen ? 'text-background' : 'text-foreground'
            }`}
            activeClassName="opacity-100"
          >
            BIO
          </NavLink>
          <NavLink 
            to="/contact" 
            className={`text-sm font-medium tracking-wide hover:opacity-70 transition-all duration-300 ${
              isWorksOpen ? 'text-background' : 'text-foreground'
            }`}
            activeClassName="opacity-100"
          >
            CONTACT
          </NavLink>
        </nav>

        {/* Right side - empty for now, can add search/account later */}
        <div className="w-32"></div>
      </div>
    </header>
  );
};

export default Header;
