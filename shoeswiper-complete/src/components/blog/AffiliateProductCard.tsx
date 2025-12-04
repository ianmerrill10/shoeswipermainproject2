import { FaAmazon } from 'react-icons/fa';
import { AffiliateProduct } from '../../lib/blogTypes';
import { useRecordAffiliateClick } from '../../hooks/useBlog';
import { BlogType } from '../../lib/blogTypes';

interface AffiliateProductCardProps {
  product: AffiliateProduct;
  blogType: BlogType;
  postId: string;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function AffiliateProductCard({
  product,
  blogType,
  postId,
  variant = 'default',
}: AffiliateProductCardProps) {
  const recordClick = useRecordAffiliateClick();

  const handleClick = () => {
    recordClick.mutate({
      blogType,
      postId,
      productId: product.id,
    });
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {product.name}
          </h4>
          <p className="text-orange-500 font-bold">${product.price}</p>
        </div>
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded hover:scale-105 transition-transform flex items-center gap-1"
        >
          <FaAmazon className="w-4 h-4" aria-hidden="true" />
          Buy Now
        </a>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-shadow">
        <div className="flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          {discountPercentage > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {product.brand}
          </p>
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">
            {product.name}
          </h4>
          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-orange-500">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleClick}
              className="ml-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <FaAmazon className="w-4 h-4" aria-hidden="true" />
              Buy Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Default vertical card
  return (
    <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {discountPercentage}% OFF
        </span>
      )}

      {/* Stock Badge */}
      {!product.inStock && (
        <span className="absolute top-3 right-3 z-10 bg-gray-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          Out of Stock
        </span>
      )}

      {/* Product Image */}
      <a
        href={product.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block"
      >
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </a>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          {product.brand}
        </p>
        <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h4>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(product.rating!)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount?.toLocaleString()})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-orange-500">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-center flex items-center justify-center gap-2 hover:scale-105 transition-transform ${
            product.inStock
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FaAmazon className="w-5 h-5" aria-hidden="true" />
          {product.inStock ? 'Buy Now' : 'Out of Stock'}
        </a>

        {/* Affiliate Disclosure */}
        <p className="text-[10px] text-gray-400 text-center mt-2">
          As an Amazon Associate, we earn from qualifying purchases.
        </p>
      </div>
    </div>
  );
}
