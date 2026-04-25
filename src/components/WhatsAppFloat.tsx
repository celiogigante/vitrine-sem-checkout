import { useEffect, useState } from "react";
import { getSettings } from "@/lib/products";

const WhatsAppFloat = () => {
  const [num, setNum] = useState(getSettings().whatsappNumber);
  useEffect(() => {
    const h = () => setNum(getSettings().whatsappNumber);
    window.addEventListener("settings-updated", h);
    return () => window.removeEventListener("settings-updated", h);
  }, []);
  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 animate-float-bounce"
      aria-label="Contato via WhatsApp"
    >
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F3a4b716306f84cbea69438c199a4f5ae%2Fa560d2af2ff543d3ae83ddf136da6ca2?format=webp&width=800&height=1200"
        alt="WhatsApp"
        className="h-14 w-14 rounded-full"
      />
    </a>
  );
};

export default WhatsAppFloat;
