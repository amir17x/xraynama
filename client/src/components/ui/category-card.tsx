import { Link } from "wouter";

interface CategoryCardProps {
  title: string;
  image: string;
  slug: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, slug }) => {
  return (
    <Link href={`/category/${slug}`}>
      <a className="relative rounded-xl overflow-hidden aspect-video group">
        <img 
          src={image}
          alt={title} 
          className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 to-transparent flex items-end p-4">
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
      </a>
    </Link>
  );
};

export default CategoryCard;
