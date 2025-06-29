import { useEffect, useState } from "react";

export const useResponsiveBoardSize = (maxPx = 360, minPx = 240) => {
  const [size, setSize] = useState(maxPx);

  useEffect(() => {
    const calc = () => {
      const max = Math.min(maxPx, window.innerWidth - 48);
      setSize(max < minPx ? minPx : max);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [maxPx, minPx]);

  return size;
};