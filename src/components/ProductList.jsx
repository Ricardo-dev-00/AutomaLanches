import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-textSecondary">
          Nenhum produto encontrado nesta categoria
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
