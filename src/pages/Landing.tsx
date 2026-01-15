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
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Smart image preloading: priority images first, rest in idle time
  useEffect(() => {
    // Priority: WORKS and STUDIO (most likely to be clicked)
    const priorityItems = menuItems.filter(item => item.type === 'link');
    const otherItems = menuItems.filter(item => item.type !== 'link');
    
    // Load priority images immediately
    const priorityPromises = priorityItems.map(item => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = item.image;
      });
    });

    Promise.all(priorityPromises).then(() => {
      // Load remaining images in idle time
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          otherItems.forEach(item => {
            const img = new Image();
            img.src = item.image;
          });
          setImagesLoaded(true);
        });
      } else {
        // Fallback for Safari
        setTimeout(() => {
          otherItems.forEach(item => {
            const img = new Image();
            img.src = item.image;
          });
          setImagesLoaded(true);
        }, 100);
      }
    });
  }, []);

  // Trigger entrance animation - instant
  useEffect(() => {
    setIsPageLoaded(true);
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
    
    // Prefetch page chunks on hover for faster navigation
    const item = menuItems[index];
    if (item.type === 'link') {
      if (item.path === '/works') {
        import('./WorksPage');
      } else if (item.path === '/studio') {
        import('./Studio');
      } else if (item.path === '/bio') {
        import('./Bio');
      }
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsTransitioning(true);
    setHoveredIndex(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Focus/blur handlers for keyboard accessibility (same effect as hover)
  const handleFocus = (index: number) => {
    if (hoveredIndex !== index) {
      setIsTransitioning(true);
      setHoveredIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleBlur = () => {
    if (!isMobile) {
      setIsTransitioning(true);
      setHoveredIndex(null);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Get the active index for background-clip effect
  const activeIndex = hoveredIndex ?? selectedIndex;

  return (
    <div className={`relative min-h-screen bg-black overflow-hidden transition-opacity duration-200 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Menu container - centered */}
      <nav className="relative z-10 min-h-screen flex items-center justify-center">
        <ul className="flex flex-col items-start gap-0">
          {menuItems.map((item, index) => {
            const isClickable = item.type === "link" || item.type === "mailto";
            const isActive = activeIndex === index;

            return (
              <li 
                key={index}
                className={`transition-all duration-300 ease-out ${
                  isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemTap(index, item);
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={() => handleFocus(index)}
                  onBlur={handleBlur}
                  disabled={!isClickable && !isMobile}
                  className={`
                    font-helvetica font-bold tracking-tight
                    text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[200px]
                    leading-[0.75] md:leading-[0.72]
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
                    // Background-clip text effect - image shows through text (only when images are preloaded)
                    backgroundImage: isActive && imagesLoaded ? `url(${item.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    WebkitBackgroundClip: isActive && imagesLoaded ? 'text' : 'unset',
                    backgroundClip: isActive && imagesLoaded ? 'text' : 'unset',
                    color: isActive && imagesLoaded ? 'transparent' : 'white',
                    WebkitTextFillColor: isActive && imagesLoaded ? 'transparent' : 'white',
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
