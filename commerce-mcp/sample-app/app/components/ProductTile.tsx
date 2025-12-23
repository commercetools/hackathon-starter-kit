'use client';

import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: {
    value: {
      centAmount: number;
      currencyCode: string;
      fractionDigits: number;
    };
  };
  images?: Array<{ url: string }>;
  sku?: string;
}

interface ProductTileProps {
  product: Product;
  onBuy: (product: Product) => void;
}

export function ProductTile({ product, onBuy }: ProductTileProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: Product['price']) => {
    const amount = price.value.centAmount / Math.pow(10, price.value.fractionDigits);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.value.currencyCode,
    }).format(amount);
  };

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      await onBuy(product);
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0].url
    : '/placeholder-product.svg';

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-600">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-product.svg';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>
        {product.sku && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            SKU: {product.sku}
          </p>
        )}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleBuy}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 text-sm"
          >
            {isLoading ? 'Processing...' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
  onBuy: (product: Product) => void;
}

export function ProductGrid({ products, onBuy }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
      {products.map((product) => (
        <ProductTile key={product.id} product={product} onBuy={onBuy} />
      ))}
    </div>
  );
}
