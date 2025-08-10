interface AppBrandProps {
  className?: string;
}

export function AppBrand({ className = "" }: AppBrandProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-3xl" role="img" aria-label="egg">
        🍳
      </span>
      <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text font-bold text-transparent">
        Overeasy
      </span>
    </span>
  );
}
