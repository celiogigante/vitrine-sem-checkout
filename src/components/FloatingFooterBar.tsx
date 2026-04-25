import { useState, useEffect } from "react";
import { ArrowUp, MapPin } from "lucide-react";
import { getSettings } from "@/lib/products";

const FloatingFooterBar = () => {
  const [num, setNum] = useState(getSettings().whatsappNumber);

  useEffect(() => {
    const handleSettings = () => setNum(getSettings().whatsappNumber);
    window.addEventListener("settings-updated", handleSettings);
    return () => window.removeEventListener("settings-updated", handleSettings);
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
        borderColor: "#FCD34D",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="grid grid-cols-3 h-20">
        {/* Left - Scroll to Top */}
        <button
          onClick={scrollToTop}
          className="flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
          style={{
            borderRight: "1px solid #FCD34D",
          }}
          aria-label="Scroll to top"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:to-blue-500/0 transition-all duration-300"></div>
          <div className="flex flex-col items-center gap-1 relative z-10">
            <ArrowUp className="h-7 w-7 text-blue-400 transition-all duration-300 group-hover:text-blue-300 group-hover:scale-125" />
            <span className="text-xs font-semibold text-white opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              Topo
            </span>
          </div>
        </button>

        {/* Center - Google Maps */}
        <a
          href="https://maps.app.goo.gl/kP9HvFtU6faBvTPA9"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
          style={{
            borderRight: "1px solid #FCD34D",
          }}
          aria-label="Localização no Google Maps"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/20 group-hover:to-red-500/0 transition-all duration-300"></div>
          <div className="flex flex-col items-center gap-1 relative z-10">
            <MapPin className="h-7 w-7 text-red-400 transition-all duration-300 group-hover:text-red-300 group-hover:scale-125" />
            <span className="text-xs font-semibold text-white opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              Localização
            </span>
          </div>
        </a>

        {/* Right - WhatsApp */}
        <a
          href={`https://wa.me/${num}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
          aria-label="Contato via WhatsApp"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/30 group-hover:to-emerald-500/0 transition-all duration-300"></div>
          <div className="flex flex-col items-center gap-2 relative z-10">
            {/* Official WhatsApp Logo Image */}
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F3a4b716306f84cbea69438c199a4f5ae%2Fa560d2af2ff543d3ae83ddf136da6ca2?format=webp&width=800&height=1200"
              alt="WhatsApp"
              className="h-8 w-8 rounded-full transition-all duration-300 group-hover:scale-125 shadow-md"
            />
            <span className="text-xs font-semibold text-white opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              WhatsApp
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default FloatingFooterBar;
