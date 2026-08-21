export function BrandWordmark({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const src =
    variant === "light" ? "/brand/harvesters-white-logo-trans.png" : "/brand/harvesters-logo.jpg";
  return (
    <img
      src={src}
      alt="Harvesters International Christian Centre"
      className={`h-8 w-auto object-contain ${className}`}
    />
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/mark-192.png"
      alt="Harvesters International Christian Centre mark"
      className={`h-7 w-7 rounded-sm object-contain ${className}`}
    />
  );
}
