interface AppBrandProps {
  className?: string;
}

export function AppBrand({ className = "" }: AppBrandProps) {
  return (
    <span
      className={`bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text font-bold text-transparent ${className}`}
    >
      App
    </span>
  );
}
