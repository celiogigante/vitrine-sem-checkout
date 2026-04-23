import { MessageCircle } from "lucide-react";
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
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg transition-transform hover:scale-110 hover:bg-whatsapp-hover"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppFloat;
