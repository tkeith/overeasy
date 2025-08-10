interface OvereasyLogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
}

export function OvereasyLogo({
  className = "",
  size = "medium",
}: OvereasyLogoProps) {
  const sizeClasses = {
    small: "h-8 w-auto",
    medium: "h-12 w-auto",
    large: "h-20 w-auto",
  };

  return (
    <img
      src="https://ewnjlwwtpuzcbskypoue.supabase.co/storage/v1/object/public/assets/overeasy-logo.png"
      alt="Overeasy"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
