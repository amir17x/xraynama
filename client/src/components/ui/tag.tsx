import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface TagProps {
  title: string;
  link?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const Tag: React.FC<TagProps> = ({ title, link, className, onClick, active = false }) => {
  const baseClasses = cn(
    "tag transition-colors duration-200 px-3 py-2 rounded-lg text-sm",
    active 
      ? "bg-primary/30 border-primary text-white" 
      : "bg-dark-card hover:bg-primary-dark/30 text-text-primary",
    className
  );

  if (link) {
    return (
      <Link href={link}>
        <a className={baseClasses}>{title}</a>
      </Link>
    );
  }

  return (
    <button 
      className={baseClasses} 
      onClick={onClick}
      type="button"
    >
      {title}
    </button>
  );
};

export default Tag;
