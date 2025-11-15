import React, { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

// Props: src (Cloudinary URL), alt, className, lazy (true/false), onClick
export default function CloudinaryImage({ src, alt, className, lazy = true, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Add Cloudinary optimization params
    const optimizedSrc = src.includes("cloudinary.com")
      ? `${src}?w=800&f_auto&q_auto`
      : src;

    img.src = optimizedSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Watermark
      const svgData = `
        <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.15">
            <text x="20" y="40" font-family="Poppins, sans-serif" font-weight="700" font-size="30" fill="#3B82F6">Naijahome</text>
          </g>
        </svg>
      `;
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const svgImg = new Image();
      svgImg.src = url;
      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
      };
    };
  }, [src]);

  const handleRightClick = (e) => {
    e.preventDefault();
    toast.error("❌ Sorry, you can't download this image!");
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      alt={alt}
      onClick={onClick}
      onContextMenu={handleRightClick}
      loading={lazy ? "lazy" : "eager"}
    />
  );
}
