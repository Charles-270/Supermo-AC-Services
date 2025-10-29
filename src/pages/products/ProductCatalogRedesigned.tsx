/**
 * Product Catalog Page - Redesigned
 * Modern e-commerce layout with sidebar navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { Search, X, ShoppingCart, Grid, List, SlidersHorizontal, Menu, Package, AlertCircle } from 'lucide-react';
import { getProducts } from '@/services/productService';
import { useCart } from '@/hooks/useCart';

import type { Product, ProductFilters, ProductCategory } from '@/types/product';
import { AC_BRANDS } from '@/types/product';
import { cn } from '@/lib/utils';

export function ProductCatalogRedesigned() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCartItemsCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
    setError(null);
    try {
      const { products: fetchedProducts } = await getProducts(filters, 50);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError((err as Error).message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowFilters(false);
    }
  }, []);

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
    setFilters((prev) => ({ ...prev, sortBy: value as any }));
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

  const categories = [
    { value: 'all', label: 'All Categories', count: products.length },
    { value: 'split-ac', label: 'Split AC Units', count: products.filter(p => p.category === 'split-ac').length },
    { value: 'central-ac', label: 'Central AC Systems', count: products.filter(p => p.category === 'central-ac').length },
    { value: 'spare-parts', label: 'Spare Parts', count: products.filter(p => p.category === 'spare-parts').length },
    { value: 'accessories', label: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
  ];

  return (
    <div className="relative min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <CustomerSidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">Shop Products</h1>
                  <p className="mt-1 text-sm text-neutral-600">
                    {products.length} results for {filters.searchQuery ? `"${filters.searchQuery}"` : 'all products'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/cart')}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                      {getCartItemsCount()}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-4 lg:mt-6">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search products..."
                className="rounded-lg py-6 pl-10 pr-10"
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

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="w-full flex-shrink-0 lg:w-64" role="complementary" aria-label="Product filters">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg">Filters</h2>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Active Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
                      <div className="flex flex-wrap gap-2">
                        {filters.category && (
                          <Badge variant="secondary" className="gap-1">
                            {categories.find(c => c.value === filters.category)?.label}
                            <button onClick={() => handleCategoryChange('all')}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {filters.brand && (
                          <Badge variant="secondary" className="gap-1">
                            {filters.brand}
                            <button onClick={() => handleBrandChange('all')}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {filters.inStock && (
                          <Badge variant="secondary" className="gap-1">
                            In Stock
                            <button onClick={() => handleInStockToggle(false)}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category Filter */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">Category</Label>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => handleCategoryChange(cat.value)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                            (filters.category === cat.value || (!filters.category && cat.value === 'all'))
                              ? 'bg-cyan-50 text-cyan-700 font-medium'
                              : 'hover:bg-neutral-50 text-neutral-700'
                          )}
                        >
                          <span>{cat.label}</span>
                          <span className="text-neutral-500">({cat.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">Brand</Label>
                    <Select value={filters.brand || 'all'} onValueChange={handleBrandChange}>
                      <SelectTrigger className="h-10 rounded-lg" aria-label="Select brand">
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

                  {/* Price Range */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">Price Range</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          placeholder="Min" 
                          className="text-sm h-10 rounded-lg" 
                          aria-label="Minimum price"
                        />
                        <span className="text-neutral-500">-</span>
                        <Input 
                          type="number" 
                          placeholder="Max" 
                          className="text-sm h-10 rounded-lg" 
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>
                  </div>

                  {/* In Stock Only */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock || false}
                      onCheckedChange={handleInStockToggle}
                    />
                    <Label htmlFor="inStock" className="cursor-pointer text-sm">
                      In Stock Only
                    </Label>
                  </div>
                </div>
              </aside>
            )}

            {/* Products Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <Select value={filters.sortBy || 'newest'} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-48">
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

                  {/* View Mode */}
                  <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                  <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Failed to load products
                  </h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    className="rounded-xl" 
                    onClick={() => fetchProducts()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : loading ? (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  )}
                >
                  {/* Skeleton Cards */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="aspect-square bg-neutral-100 animate-pulse" />
                      <div className="p-4 md:p-5 space-y-3">
                        <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/3" />
                        <div className="h-5 bg-neutral-100 rounded animate-pulse w-full" />
                        <div className="h-4 bg-neutral-100 rounded animate-pulse w-2/3" />
                        <div className="flex items-center justify-between pt-2">
                          <div className="h-6 bg-neutral-100 rounded animate-pulse w-1/3" />
                          <div className="h-10 bg-neutral-100 rounded-xl animate-pulse w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  )}
                  role="region"
                  aria-label="Product results"
                  aria-live="polite"
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                  <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No products found</h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" className="rounded-xl" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <CustomerSidebar
            variant="mobile"
            className="relative z-40 h-full w-72 max-w-[80%]"
            onClose={() => setIsMobileNavOpen(false)}
            onNavigate={() => setIsMobileNavOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
