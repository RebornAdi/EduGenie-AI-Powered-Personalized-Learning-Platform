import { useEffect } from "react";

const symbols = ["+", "-", "×", "÷", "=", "π", "Σ", "√", "∞"];

export default function CursorMathTrail() {
  useEffect(() => {
    const handleMove = (e) => {
      if (Math.random() > 0.3) return;

      const particle = document.createElement("span");

      particle.innerText =
        symbols[Math.floor(Math.random() * symbols.length)];

      particle.style.position = "fixed";
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      particle.style.color = "#a5b4fc";
      particle.style.fontSize = "22px";
      particle.style.fontWeight = "700";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "9999";

      document.body.appendChild(particle);

      particle.animate(
        [
          {
            opacity: 1,
            transform: "translateY(0px) scale(1)",
          },
          {
            opacity: 0,
            transform: "translateY(-50px) scale(1.8)",
          },
        ],
        {
          duration: 1000,
          easing: "ease-out",
        }
      );

      setTimeout(() => {
        particle.remove();
      }, 1000);
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return null;
}