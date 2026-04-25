import { useState, useEffect } from "react";
import { ArrowUp, MapPin, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/products";

const FloatingFooterBar = () => {
  const [num, setNum] = useState(getSettings().whatsappNumber);
  const [isScrollVisible, setIsScrollVisible] = useState(false);

  useEffect(() => {
    const handleSettings = () => setNum(getSettings().whatsappNumber);
    window.addEventListener("settings-updated", handleSettings);
    return () => window.removeEventListener("settings-updated", handleSettings);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsScrollVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        backgroundColor: "#000",
        borderColor: "#FFF9E6",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="grid grid-cols-3 h-20">
        {/* Left - Scroll to Top */}
        <button
          onClick={scrollToTop}
          className="flex items-center justify-center transition-all duration-300 hover:bg-yellow-300 hover:text-black text-white group"
          style={{
            borderRight: "1px solid #FFF9E6",
          }}
          aria-label="Scroll to top"
        >
          <div className="flex flex-col items-center gap-1">
            <ArrowUp className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Topo
            </span>
          </div>
        </button>

        {/* Center - Google Maps */}
        <a
          href="https://maps.app.goo.gl/kP9HvFtU6faBvTPA9"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center transition-all duration-300 hover:bg-yellow-300 hover:text-black text-white group"
          style={{
            borderRight: "1px solid #FFF9E6",
          }}
          aria-label="Localização no Google Maps"
        >
          <div className="flex flex-col items-center gap-1">
            <MapPin className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Localização
            </span>
          </div>
        </a>

        {/* Right - WhatsApp */}
        <a
          href={`https://wa.me/${num}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center transition-all duration-300 hover:bg-emerald-500 hover:text-white text-white group"
          aria-label="Contato via WhatsApp"
        >
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              WhatsApp
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default FloatingFooterBar;
