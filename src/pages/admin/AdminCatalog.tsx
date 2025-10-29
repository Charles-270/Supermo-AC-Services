/**
 * Admin Catalog View
 * View all products in admin context with management actions
 * Google Stitch-inspired design - October 2025
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Edit,
  Loader2,
  Image as ImageIcon,
  Plus,
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

export default function AdminCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.specifications.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (status: string) => {
    const badges = {
      'active': <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>,
      'low-stock': <Badge className="bg-amber-100 text-amber-800 border-amber-200">Low Stock</Badge>,
      'out-of-stock': <Badge className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>,
      'discontinued': <Badge className="bg-gray-100 text-gray-800 border-gray-200">Discontinued</Badge>,
    };
    return badges[status as keyof typeof badges] || badges['active'];
  };

  return (
    <AdminLayout
      title="Product Catalog"
      subtitle={`Browse all products • ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'E-Commerce', href: '/dashboard/admin/ecommerce/products' },
        { label: 'Catalog' }
      ]}
      actions={
        <Button size="sm" onClick={() => navigate('/dashboard/admin/ecommerce/products')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search products by name, category, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100">
                <ImageIcon className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500">
                {searchQuery || categoryFilter !== 'all'
                  ? 'No products found matching your filters'
                  : 'No products available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="aspect-square bg-neutral-100 rounded-t-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-neutral-900 line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0 h-8 w-8 p-0"
                        onClick={() => navigate('/dashboard/admin/ecommerce/products')}
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    {product.description && (
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-sm text-neutral-500 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {getStockBadge(product.stockStatus)}
                        {product.condition === 'refurbished' && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            Refurbished
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-neutral-500 space-y-1">
                        {product.specifications.brand && (
                          <p>Brand: {product.specifications.brand}</p>
                        )}
                        {product.specifications.capacity && (
                          <p>Capacity: {product.specifications.capacity}</p>
                        )}
                        <p>Stock: {product.stockQuantity} units</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Product Count */}
        {filteredProducts.length > 0 && (
          <div className="text-center text-sm text-neutral-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
