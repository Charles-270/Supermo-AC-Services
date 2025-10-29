/**
 * Product Detail Page
 * Detailed product view with image gallery, specs, and add to cart
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Package,
  Check,
  Loader2,
  Minus,
  Plus,
  Truck,
  Shield,
} from 'lucide-react';
import { getProduct } from '@/services/productService';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types/product';
import { INSTALLATION_FEES } from '@/types/product';
import { resolveProductPricing } from '@/utils/pricing';

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [installationRequired, setInstallationRequired] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    setLoading(true);
    try {
      const fetchedProduct = await getProduct(id);
      setProduct(fetchedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      console.log('ProductDetail: Adding to cart', product.name, 'qty:', quantity);
      addToCart(product, quantity, installationRequired);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      console.log('ProductDetail: Buy Now clicked', product.name);
      addToCart(product, quantity, installationRequired);
      navigate('/cart');
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <Card className="p-8 text-center">
          <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-neutral-600 mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pricing = resolveProductPricing(product);
  const discountPercentage =
    typeof product.compareAtPrice === 'number' &&
    product.compareAtPrice > pricing.totalPrice
      ? Math.round(
          ((product.compareAtPrice - pricing.totalPrice) / product.compareAtPrice) * 100
        )
      : 0;

  const installationFee =
    installationRequired && (product.category === 'split-ac' || product.category === 'central-ac')
      ? INSTALLATION_FEES[product.category]
      : 0;

  const totalPrice = pricing.totalPrice * quantity + installationFee;

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-neutral-900">Product Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-32 w-32 text-neutral-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-neutral-50 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-primary-500'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-neutral-500 uppercase tracking-wide mb-1">
                    {product.category.replace('-', ' ')}
                  </p>
                  <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>
                </div>
                <div className="flex flex-col gap-2">
                  {product.featured && (
                    <Badge className="bg-accent-500 text-white">Featured</Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge variant="destructive">-{discountPercentage}%</Badge>
                  )}
                </div>
              </div>

              {/* Brand and Model */}
              {product.specifications.brand && (
                <p className="text-lg text-neutral-700">
                  {product.specifications.brand}
                  {product.specifications.model && ` - ${product.specifications.model}`}
                </p>
              )}

              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-warning-500 text-warning-500" />
                    <span className="font-semibold">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-neutral-600">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary-600">
                  {formatCurrency(pricing.totalPrice)}
                </span>
              </div>
              {installationFee > 0 && (
                <p className="text-sm text-neutral-600 mt-2">
                  + {formatCurrency(installationFee)} installation fee
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stockStatus === 'active' ? (
                <div className="flex items-center gap-2 text-success-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">In Stock ({product.stockQuantity} available)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-error-600">
                  <Package className="h-5 w-5" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
              <p className="text-neutral-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div>
              <Label className="mb-2 block">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {product.stockStatus !== 'active' && (
                <p className="text-xs text-neutral-500 mt-1">Stock: {product.stockQuantity} available</p>
              )}
            </div>

            {/* Installation Option */}
            {(product.category === 'split-ac' || product.category === 'central-ac') && (
              <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-lg">
                <Checkbox
                  id="installation"
                  checked={installationRequired}
                  onCheckedChange={(checked) => setInstallationRequired(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="installation" className="cursor-pointer font-semibold">
                    Professional Installation
                  </Label>
                  <p className="text-sm text-neutral-600 mt-1">
                    Add professional installation service (+{formatCurrency(installationFee)})
                  </p>
                </div>
              </div>
            )}

            {/* Add to Cart Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className={`flex-1 ${justAdded ? 'bg-success-500 hover:bg-success-600' : ''}`}
                  onClick={handleAddToCart}
                >
                  {justAdded ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added
                    </>
                  ) : isInCart(product.id) ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      In Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
              <p className="text-sm text-center text-neutral-600">
                Total: <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              </p>
              {product.stockStatus !== 'active' && (
                <p className="text-sm text-center text-warning-600 bg-warning-50 py-2 px-4 rounded">
                  ?? This product is currently out of stock but you can still place an order
                </p>
              )}
            </div>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary-500" />
                  <span className="text-sm">Free delivery in Greater Accra</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span className="text-sm">
                    {product.specifications.warranty || '1 year'} warranty included
                  </span>
                </div>
                {product.condition === 'refurbished' && (
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success-500" />
                    <span className="text-sm">Certified refurbished - Like new condition</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            {Object.keys(product.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <div key={key} className="flex justify-between border-b border-neutral-100 pb-2">
                          <dt className="text-sm text-neutral-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm font-medium text-neutral-900">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
