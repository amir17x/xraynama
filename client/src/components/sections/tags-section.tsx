import Tag from "@/components/ui/tag";

interface TagsData {
  title: string;
  slug: string;
}

// Default genres
const defaultGenres: TagsData[] = [
  { title: "اکشن", slug: "action" },
  { title: "کمدی", slug: "comedy" },
  { title: "درام", slug: "drama" },
  { title: "علمی-تخیلی", slug: "scifi" },
  { title: "ترسناک", slug: "horror" },
  { title: "ماجراجویی", slug: "adventure" },
  { title: "فانتزی", slug: "fantasy" },
  { title: "جنایی", slug: "crime" },
  { title: "خانوادگی", slug: "family" },
  { title: "عاشقانه", slug: "romance" },
  { title: "بیوگرافی", slug: "biography" },
  { title: "تاریخی", slug: "historical" },
  { title: "موزیکال", slug: "musical" },
  { title: "جنگی", slug: "war" },
  { title: "وسترن", slug: "western" },
  { title: "ورزشی", slug: "sport" },
  { title: "راز و رمز", slug: "mystery" }
];

interface TagsSectionProps {
  title: string;
  tags?: TagsData[];
  basePath?: string;
  onTagClick?: (tag: string) => void;
  selectedTags?: string[];
}

const TagsSection: React.FC<TagsSectionProps> = ({
  title,
  tags = defaultGenres,
  basePath = "/search?genres=",
  onTagClick,
  selectedTags = []
}) => {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug);
          
          if (onTagClick) {
            return (
              <Tag
                key={tag.slug}
                title={tag.title}
                onClick={() => onTagClick(tag.slug)}
                active={isSelected}
              />
            );
          }
          
          return (
            <Tag
              key={tag.slug}
              title={tag.title}
              link={`${basePath}${tag.slug}`}
              active={isSelected}
            />
          );
        })}
      </div>
    </section>
  );
};

export default TagsSection;
