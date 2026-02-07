import { categories } from '../data/products';

const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="sticky top-16 bg-white z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-card text-textPrimary hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-card text-textPrimary hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
