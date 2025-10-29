/**
 * Product Card Component
 * Displays product in catalog grid
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Package, Check } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { resolveProductPricing } from '@/utils/pricing';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);
  const pricing = resolveProductPricing(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('ProductCard: Add to cart clicked for', product.name);
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 group rounded-2xl"
        onClick={handleCardClick}
      >
        <div className="flex gap-4 p-4 md:p-5">
          {/* Product Image */}
          <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-50">
            {product.images && product.images.length > 0 && !imageError ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-500" />
                  </div>
                )}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  loading="lazy"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  className={`w-full h-full object-cover object-center ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-20 w-20 text-neutral-300" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                {product.category.replace('-', ' ')}
              </p>
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                {product.name}
              </h3>
              {product.specifications.brand && (
                <p className="text-sm text-neutral-600 mb-2">
                  {product.specifications.brand}
                  {product.specifications.capacity && ` • ${product.specifications.capacity}`}
                </p>
              )}
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
                  <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-neutral-500">
                    ({product.reviewCount || 0})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(pricing.totalPrice)}
                </span>
              </div>
              <Button
                variant={isInCart(product.id) || justAdded ? 'default' : 'outline'}
                size="sm"
                onClick={handleAddToCart}
                className={cn(
                  'rounded-xl h-10 md:h-11',
                  justAdded && 'bg-success-500 hover:bg-success-600'
                )}
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Added
                  </>
                ) : isInCart(product.id) ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group rounded-2xl"
      onClick={handleCardClick}
    >
      <CardHeader className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-neutral-50">
          {product.images && product.images.length > 0 && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-500" />
                </div>
              )}
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-20 w-20 text-neutral-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-accent-500 text-white">Featured</Badge>
            )}
            {product.stockStatus === 'out-of-stock' && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>

          {/* Quick View Button (appears on hover) */}
          {product.stockStatus === 'active' && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product.id}`);
                }}
              >
                <Package className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-5">
        {/* Product Info */}
        <div className="space-y-2">
          {/* Category */}
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            {product.category.replace('-', ' ')}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-neutral-900 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Specifications */}
          {product.specifications.brand && (
            <p className="text-sm text-neutral-600">
              {product.specifications.brand}
              {product.specifications.capacity && ` • ${product.specifications.capacity}`}
            </p>
          )}

          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning-500 text-warning-500" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-neutral-500">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 md:p-5 pt-0 flex items-center justify-between">
        {/* Price */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(pricing.totalPrice)}
            </span>
          </div>
          {product.condition === 'refurbished' && (
            <span className="text-xs text-neutral-500">Refurbished</span>
          )}
        </div>

        {/* Add to Cart Button - Always visible */}
        <Button
          variant={isInCart(product.id) || justAdded ? 'default' : 'outline'}
          size="sm"
          onClick={handleAddToCart}
          className={cn(
            'rounded-xl h-10 md:h-11',
            justAdded && 'bg-success-500 hover:bg-success-600'
          )}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Added
            </>
          ) : isInCart(product.id) ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
