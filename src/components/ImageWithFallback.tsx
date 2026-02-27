"use client";

import { useState } from "react";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
  onError,
  ...rest
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setFailed(true);
    onError?.(e);
  };

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-700 text-zinc-500 ${fallbackClassName ?? ""} ${className ?? ""}`}
        aria-hidden
      >
        <span className="text-xs">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
}
