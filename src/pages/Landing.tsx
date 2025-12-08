import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.type === "mailto") {
      window.location.href = `mailto:${item.email}`;
    } else if (item.type === "link" && item.path) {
      navigate(item.path);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (hoveredIndex !== index) {
      setIsTransitioning(true);
      setHoveredIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleMouseLeave = () => {
    setIsTransitioning(true);
    setHoveredIndex(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className={`relative min-h-screen bg-black overflow-hidden transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background images - one for each menu item */}
      {menuItems.map((item, index) => (
        <div
          key={`bg-${index}`}
          className={`absolute inset-0 transition-all duration-700 ease-out will-change-opacity ${
            hoveredIndex === index ? "opacity-40 scale-105" : "opacity-0 scale-100"
          }`}
          style={{
            backgroundImage: `url(${item.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Dark overlay for better text readability when image is shown */}
      <div 
        className={`absolute inset-0 bg-black/30 transition-opacity duration-500 ${
          hoveredIndex !== null ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Menu container */}
      <nav className="relative z-10 min-h-screen flex items-center justify-center">
        <ul className="flex flex-col items-center gap-2 md:gap-3">
          {menuItems.map((item, index) => {
            const isClickable = item.type === "link" || item.type === "mailto";
            const isHovered = hoveredIndex === index;

            return (
              <li 
                key={index}
                className={`transition-all duration-500 ease-out ${
                  isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${100 + index * 80}ms` }}
              >
                <button
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  disabled={!isClickable}
                  className={`
                    text-white font-bold tracking-tight leading-none
                    text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
                    transition-all duration-300 ease-out will-change-transform
                    ${isClickable 
                      ? "cursor-pointer hover:tracking-normal" 
                      : "cursor-default"
                    }
                    ${isHovered 
                      ? "opacity-100 scale-105" 
                      : hoveredIndex !== null 
                        ? "opacity-40" 
                        : "opacity-100"
                    }
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                    disabled:cursor-default
                  `}
                  style={{
                    textShadow: isHovered ? "0 0 60px rgba(255,255,255,0.4)" : "none",
                  }}
                >
                  {item.text}
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
