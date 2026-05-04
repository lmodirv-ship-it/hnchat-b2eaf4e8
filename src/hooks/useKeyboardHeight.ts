import { useEffect, useState } from "react";

/**
 * Tracks the virtual keyboard height on mobile devices.
 * Uses the Visual Viewport API for accurate measurement.
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;

    const onResize = () => {
      const diff = window.innerHeight - (vv.height + vv.offsetTop);
      setKeyboardHeight(Math.max(0, diff));
    };

    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);

    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  return keyboardHeight;
}
