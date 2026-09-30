import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import useCategories from '../../hooks/useCategories';
import { getCategoryStyle } from '../../utils/categoryIcons';

const Categories = () => {
  const categories = useCategories();

  return (
    <div className="bg-background py-10 min-h-[70vh]">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-primary-dark">Shop by Category</h1>
        <p className="text-text-light mt-2">Browse handmade products from artisans across Nepal.</p>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {categories.map((category) => {
            const style = getCategoryStyle(category.slug);
            return (
              <li key={category.slug}>
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center text-center h-full bg-white rounded-2xl border border-border-light shadow-card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                >
                  <span className={`w-16 h-16 rounded-full ${style.bg} ${style.color} flex items-center justify-center`}>
                    <style.icon className="w-7 h-7" strokeWidth={1.5} />
                  </span>
                  <span className="mt-4 text-sm font-semibold text-text group-hover:text-primary">{category.name}</span>
                  {category.productCount !== null && (
                    <span className="text-xs text-text-muted mt-1">
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg"
          >
            View all products <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Categories;
