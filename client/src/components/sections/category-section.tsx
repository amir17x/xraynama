import CategoryCard from "@/components/ui/category-card";

interface Category {
  title: string;
  slug: string;
  image: string;
}

const categories: Category[] = [
  {
    title: "فیلم",
    slug: "movie",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&h=280&fit=crop"
  },
  {
    title: "انیمیشن",
    slug: "animation",
    image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=500&h=280&fit=crop"
  },
  {
    title: "سریال",
    slug: "series",
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500&h=280&fit=crop"
  },
  {
    title: "مستند",
    slug: "documentary",
    image: "https://images.unsplash.com/photo-1579017331263-ef82f0bbc748?w=500&h=280&fit=crop"
  }
];

interface CategorySectionProps {
  customCategories?: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ customCategories }) => {
  const categoriesToDisplay = customCategories || categories;
  
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-4">دسته‌بندی‌ها</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categoriesToDisplay.map((category) => (
          <CategoryCard
            key={category.slug}
            title={category.title}
            image={category.image}
            slug={category.slug}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
