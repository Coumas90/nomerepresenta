import { NavLink } from "@/components/NavLink";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Artist Name - Left */}
        <NavLink to="/" className="text-xl font-bold tracking-tight hover:opacity-70 transition-opacity">
          IVAN COMAS
        </NavLink>

        {/* Navigation - Center */}
        <nav className="flex items-center gap-8">
          <NavLink 
            to="/works" 
            className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
            activeClassName="opacity-100"
          >
            WORKS
          </NavLink>
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
