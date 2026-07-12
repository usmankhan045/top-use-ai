"use client";

import { useEffect, useRef, useState } from "react";

interface PrintableIframePreviewProps {
  slug: string;
  title: string;
  orientation?: "portrait" | "landscape";
}

// US Letter at 96dpi
const PORTRAIT_W = 816;
const PORTRAIT_H = 1056;

export function PrintableIframePreview({ slug, title, orientation = "portrait" }: PrintableIframePreviewProps) {
  const CONTENT_WIDTH  = orientation === "landscape" ? PORTRAIT_H : PORTRAIT_W;
  const CONTENT_HEIGHT = orientation === "landscape" ? PORTRAIT_W : PORTRAIT_H;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.466); // default ~380/816

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setScale(el.offsetWidth / CONTENT_WIDTH);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaledHeight = CONTENT_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-2xl"
      style={{ height: scaledHeight }}
      aria-label={`Preview of ${title}`}
    >
      <iframe
        src={`/printables/${slug}.html`}
        title={`Preview of ${title}`}
        loading="lazy"
        scrolling="no"
        className="border-0 pointer-events-none select-none"
        style={{
          width: CONTENT_WIDTH,
          height: CONTENT_HEIGHT,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}
