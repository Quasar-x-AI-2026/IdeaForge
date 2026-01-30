import { Heart } from "lucide-react";

export const DoctorAvatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 22,
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full gradient-doctor flex items-center justify-center shadow-glow flex-shrink-0`}
    >
      <Heart className="text-primary-foreground" size={iconSizes[size]} fill="currentColor" />
    </div>
  );
};
