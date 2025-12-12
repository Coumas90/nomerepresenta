import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// Menu items with their associated artwork images
const menuItems = [
  { text: "IVAN", type: "title" as const, image: "/images/artworks/tri-peel-1.png" },
  { text: "COMAS", type: "title" as const, image: "/images/artworks/tri-peel-2.png" },
  { text: "WORKS", type: "link" as const, path: "/works", image: "/images/artworks/tri-peel-3.png" },
  { text: "STUDIO", type: "link" as const, path: "/studio", image: "/images/artworks/tri-peel-4.jpg" },
  { text: "CONTACT", type: "mailto" as const, email: "contact@ivancomas.com", image: "/images/artworks/tri-peel-5.jpg" },
  { text: "BIO", type: "link" as const, path: "/bio", image: "/images/artworks/tri-peel-6.jpg" },
];

const Landing = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle tap outside to deselect on mobile
  useEffect(() => {
    if (!isMobile || selectedIndex === null) return;
    
    const handleTapOutside = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button')) {
        setSelectedIndex(null);
        setHoveredIndex(null);
      }
    };
    
    document.addEventListener('touchstart', handleTapOutside);
    return () => document.removeEventListener('touchstart', handleTapOutside);
  }, [isMobile, selectedIndex]);

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.type === "mailto") {
      window.location.href = `mailto:${item.email}`;
    } else if (item.type === "link" && item.path) {
      navigate(item.path);
    }
  };

  // Mobile tap handler: first tap = preview, second tap = navigate
  const handleItemTap = useCallback((index: number, item: typeof menuItems[0]) => {
    const isClickable = item.type === "link" || item.type === "mailto";
    
    if (isMobile && isClickable) {
      if (selectedIndex === index) {
        // Second tap - navigate
        handleItemClick(item);
      } else {
        // First tap - show preview
        setIsTransitioning(true);
        setSelectedIndex(index);
        setHoveredIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    } else {
      // Desktop or non-clickable - direct action
      handleItemClick(item);
    }
  }, [isMobile, selectedIndex, navigate]);

  const handleMouseEnter = (index: number) => {
    if (isMobile) return;
    if (hoveredIndex !== index) {
      setIsTransitioning(true);
      setHoveredIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsTransitioning(true);
    setHoveredIndex(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Get the active index for background-clip effect
  const activeIndex = hoveredIndex ?? selectedIndex;

  return (
    <div className={`relative min-h-screen bg-black overflow-hidden transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Menu container - left aligned */}
      <nav className="relative z-10 min-h-screen flex items-center">
        <ul className="flex flex-col items-start gap-0 pl-8 sm:pl-12 md:pl-16 lg:pl-24">
          {menuItems.map((item, index) => {
            const isClickable = item.type === "link" || item.type === "mailto";
            const isActive = activeIndex === index;

            return (
              <li 
                key={index}
                className={`transition-all duration-500 ease-out ${
                  isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${100 + index * 80}ms` }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemTap(index, item);
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  disabled={!isClickable && !isMobile}
                  className={`
                    font-playfair font-black tracking-tight
                    text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[10rem]
                    leading-[0.85] md:leading-[0.85]
                    transition-all duration-500 ease-out will-change-transform
                    ${isClickable 
                      ? "cursor-pointer" 
                      : "cursor-default"
                    }
                    ${isActive
                      ? "scale-[1.02]" 
                      : activeIndex !== null
                        ? "opacity-30" 
                        : "opacity-100"
                    }
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                    disabled:cursor-default
                    relative
                  `}
                  style={{
                    // Background-clip text effect - image shows through text
                    backgroundImage: isActive ? `url(${item.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    WebkitBackgroundClip: isActive ? 'text' : 'unset',
                    backgroundClip: isActive ? 'text' : 'unset',
                    color: isActive ? 'transparent' : 'white',
                    WebkitTextFillColor: isActive ? 'transparent' : 'white',
                  }}
                >
                  {item.text}
                  {/* Mobile hint: tap again to navigate */}
                  {isMobile && isClickable && selectedIndex === index && (
                    <span 
                      className="block text-xs font-sans font-normal tracking-wide mt-2 animate-fade-in"
                      style={{ 
                        color: 'white', 
                        WebkitTextFillColor: 'white',
                        opacity: 0.6 
                      }}
                    >
                      tap again to open
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Landing;
