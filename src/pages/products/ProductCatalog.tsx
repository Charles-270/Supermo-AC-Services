/**
 * Product Catalog Page
 * Browse products with search, filters, and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';
import { Search, Filter, X, Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { getProducts } from '@/services/productService';
import { useCart } from '@/hooks/useCart';
import type { Product, ProductFilters, ProductCategory } from '@/types/product';
import { AC_BRANDS } from '@/types/product';

export function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCartItemsCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    category: (searchParams.get('category') as ProductCategory) || undefined,
    searchQuery: searchParams.get('q') || undefined,
    brand: searchParams.get('brand') || undefined,
    sortBy: (searchParams.get('sort') as 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc') || 'newest',
    inStock: searchParams.get('inStock') === 'true',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products: fetchedProducts } = await getProducts(filters, 50);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value || undefined }));
    if (value) {
      searchParams.set('q', value);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (value: string) => {
    const category = value === 'all' ? undefined : (value as ProductCategory);
    setFilters((prev) => ({ ...prev, category }));
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleBrandChange = (value: string) => {
    const brand = value === 'all' ? undefined : value;
    setFilters((prev) => ({ ...prev, brand }));
    if (brand) {
      searchParams.set('brand', brand);
    } else {
      searchParams.delete('brand');
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value as 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' }));
    searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  const handleInStockToggle = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, inStock: checked }));
    if (checked) {
      searchParams.set('inStock', 'true');
    } else {
      searchParams.delete('inStock');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  const activeFiltersCount = [
    filters.category,
    filters.brand,
    filters.searchQuery,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/customer">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Shop Products</h1>
                <p className="text-sm text-neutral-600">
                  {products.length} {products.length === 1 ? 'product' : 'products'} available
                </p>
              </div>
            </div>

            <Link to="/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search AC units, spare parts, accessories..."
              className="pl-10 pr-10"
              value={filters.searchQuery || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {filters.searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Toggle Filters Button (Mobile) */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Desktop Filters */}
          <div className={`${showFilters ? 'flex' : 'hidden md:flex'} flex-wrap items-center gap-4 w-full md:w-auto`}>
            {/* Category Filter */}
            <div className="flex-1 md:flex-none md:w-48">
              <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="split-ac">Split AC Units</SelectItem>
                  <SelectItem value="central-ac">Central AC Systems</SelectItem>
                  <SelectItem value="spare-parts">Spare Parts</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="flex-1 md:flex-none md:w-40">
              <Select value={filters.brand || 'all'} onValueChange={handleBrandChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {AC_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* In Stock Only */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock || false}
                onCheckedChange={handleInStockToggle}
              />
              <Label htmlFor="inStock" className="cursor-pointer">
                In Stock Only
              </Label>
            </div>

            {/* Sort */}
            <div className="flex-1 md:flex-none md:w-40">
              <Select value={filters.sortBy || 'newest'} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-neutral-600 text-lg">No products found</p>
            <p className="text-neutral-500 text-sm mt-2">
              Try adjusting your filters or search query
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
