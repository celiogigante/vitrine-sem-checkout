import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed left-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-300 hover:bg-yellow-400 text-black transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-7 w-7" />
        </button>
      )}
    </>
  );
}
