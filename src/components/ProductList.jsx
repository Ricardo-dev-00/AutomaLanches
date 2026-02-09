import ProductCard from './ProductCard';
import { categories } from '../data/products';

const ProductList = ({ products, showCategoryTitles = false }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-textSecondary">
          Nenhum produto encontrado nesta categoria
        </p>
      </div>
    );
  }

  if (!showCategoryTitles) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map(category => {
        const categoryProducts = products.filter(product => product.category === category.id);

        if (categoryProducts.length === 0) {
          return null;
        }

        return (
          <section key={category.id} className="space-y-4">
            <h3 className="text-2xl sm:text-xl font-bold text-textPrimary text-center">
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ProductList;
