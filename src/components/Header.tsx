import { NavLink } from "@/components/NavLink";
import { useState } from "react";

const Header = () => {
  const [isWorksOpen, setIsWorksOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Artist Name - Left */}
        <NavLink to="/" className="text-xl font-bold tracking-tight hover:opacity-70 transition-opacity">
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
              className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
              activeClassName="opacity-100"
            >
              WORKS
            </NavLink>
            
            {isWorksOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
                <div className="bg-foreground text-background py-8 px-12 min-w-[200px] flex flex-col items-center gap-3">
                  <NavLink 
                    to="/works/new-arrivals" 
                    className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    NEW ARRIVALS
                  </NavLink>
                  <NavLink 
                    to="/works/paintings" 
                    className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    PAINTINGS
                  </NavLink>
                  <NavLink 
                    to="/works/sculptures" 
                    className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    SCULPTURES
                  </NavLink>
                  <NavLink 
                    to="/works/drawings" 
                    className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    DRAWINGS
                  </NavLink>
                  <NavLink 
                    to="/works/installations" 
                    className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    INSTALLATIONS
                  </NavLink>
                  <NavLink 
                    to="/works/digital" 
                    className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    DIGITAL
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          <NavLink 
            to="/bio" 
            className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
            activeClassName="opacity-100"
          >
            BIO
          </NavLink>
          <NavLink 
            to="/contact" 
            className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
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
