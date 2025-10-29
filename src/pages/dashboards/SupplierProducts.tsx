/**
 * Supplier Manage Products Page
 * Product management interface based on Google Stitch designs
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getSupplierCatalog,
  updateSupplierCatalogItem,
  addSupplierCatalogItem,
  getStoreProductsForSupplier,
} from '@/services/supplierService';
import type { SupplierCatalogItem, Product } from '@/types/product';
import { SupplierLayout } from '@/components/layout/SupplierLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search,
  Plus,
  Link,
  Edit,
  Trash2,
  Package,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

export function SupplierProducts() {
  const { profile } = useAuth();
  const supplierId = profile?.uid;

  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<SupplierCatalogItem[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [linkProductOpen, setLinkProductOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [adjustStockOpen, setAdjustStockOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierCatalogItem | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<SupplierCatalogItem | null>(null);
  const [adjustStockValue, setAdjustStockValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Form states
  const [linkForm, setLinkForm] = useState({
    productId: '',
    price: '',
    stockQuantity: '',
    minimumOrderQuantity: '',
    leadTimeDays: '',
    notes: '',
  });

  const [newProductForm, setNewProductForm] = useState({
    productName: '',
    category: 'split-ac' as Product['category'],
    price: '',
    stockQuantity: '',
    minimumOrderQuantity: '',
    leadTimeDays: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    price: '',
    stockQuantity: '',
    minimumOrderQuantity: '',
    leadTimeDays: '',
    notes: '',
  });

  const loadCatalog = useCallback(async () => {
    if (!supplierId) return;

    try {
      setLoading(true);
      const [catalogItems, storeProductsData] = await Promise.all([
        getSupplierCatalog(supplierId),
        getStoreProductsForSupplier(100),
      ]);
      setCatalog(catalogItems as SupplierCatalogItem[]);
      setStoreProducts(storeProductsData as Product[]);
    } catch (error) {
      console.error('Error loading catalog:', error);
      toast({
        title: 'Failed to load products',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierId) {
      void loadCatalog();
    }
  }, [supplierId, loadCatalog]);

  // Filter products based on search query, category, and status
  const filteredProducts = catalog.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'in-stock') {
      matchesStatus = product.stockQuantity > 5;
    } else if (statusFilter === 'low-stock') {
      matchesStatus = product.stockQuantity > 0 && product.stockQuantity <= 5;
    } else if (statusFilter === 'out-of-stock') {
      matchesStatus = product.stockQuantity === 0;
    } else if (statusFilter === 'pending') {
      matchesStatus = product.status === 'pending';
    } else if (statusFilter !== 'all') {
      matchesStatus = product.status === statusFilter;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: SupplierCatalogItem['status'], stockQuantity: number) => {
    if (status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    
    if (stockQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stockQuantity <= 5) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">Low Stock</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
    }
  };

  const availableStoreProducts = storeProducts.filter(product => 
    !catalog.some(item => item.productId === product.id)
  );

  const handleEdit = (product: SupplierCatalogItem) => {
    setEditingProduct(product);
    setEditForm({
      price: String(product.price || ''),
      stockQuantity: String(product.stockQuantity || ''),
      minimumOrderQuantity: product.minimumOrderQuantity ? String(product.minimumOrderQuantity) : '',
      leadTimeDays: product.leadTimeDays ? String(product.leadTimeDays) : '',
      notes: product.notes || '',
    });
    setEditProductOpen(true);
  };

  const handleDelete = async (product: SupplierCatalogItem) => {
    if (!confirm(`Are you sure you want to delete "${product.productName}"?`)) return;
    
    try {
      // Set status to inactive instead of deleting
      await updateSupplierCatalogItem(product.id, {
        ...product,
        status: 'inactive',
      });
      toast({
        title: 'Product deactivated',
        description: `${product.productName} has been deactivated.`,
      });
      await loadCatalog();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Unable to delete the product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = (product: SupplierCatalogItem) => {
    setNewProductForm({
      productName: `${product.productName} (Copy)`,
      category: product.category as Product['category'],
      price: String(product.price || ''),
      stockQuantity: String(product.stockQuantity || ''),
      minimumOrderQuantity: product.minimumOrderQuantity ? String(product.minimumOrderQuantity) : '',
      leadTimeDays: product.leadTimeDays ? String(product.leadTimeDays) : '',
      notes: product.notes || '',
    });
    setNewProductOpen(true);
  };

  const handleAdjustStock = (product: SupplierCatalogItem) => {
    setAdjustingProduct(product);
    setAdjustStockValue(String(product.stockQuantity || ''));
    setAdjustStockOpen(true);
  };

  const handleSaveStockAdjustment = async () => {
    if (!adjustingProduct) return;

    const newStock = parseInt(adjustStockValue);
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: 'Invalid stock quantity',
        description: 'Please enter a valid number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await updateSupplierCatalogItem(adjustingProduct.id, {
        ...adjustingProduct,
        stockQuantity: newStock,
      });

      toast({
        title: 'Stock updated',
        description: `${adjustingProduct.productName} stock set to ${newStock} units.`,
      });

      setAdjustStockOpen(false);
      setAdjustingProduct(null);
      await loadCatalog();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update stock. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLinkProduct = async () => {
    if (!supplierId || !linkForm.productId) return;

    try {
      setSaving(true);
      const selectedProduct = storeProducts.find(p => p.id === linkForm.productId);
      if (!selectedProduct) return;

      await addSupplierCatalogItem(supplierId, {
        productId: linkForm.productId,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        price: parseFloat(linkForm.price) || 0,
        stockQuantity: parseInt(linkForm.stockQuantity) || 0,
        minimumOrderQuantity: linkForm.minimumOrderQuantity ? parseInt(linkForm.minimumOrderQuantity) : undefined,
        leadTimeDays: linkForm.leadTimeDays ? parseInt(linkForm.leadTimeDays) : undefined,
        notes: linkForm.notes || undefined,
        status: 'active',
      });

      toast({
        title: 'Product linked',
        description: 'The product has been added to your catalog.',
      });

      setLinkProductOpen(false);
      setLinkForm({
        productId: '',
        price: '',
        stockQuantity: '',
        minimumOrderQuantity: '',
        leadTimeDays: '',
        notes: '',
      });
      await loadCatalog();
    } catch (error) {
      toast({
        title: 'Link failed',
        description: 'Unable to link the product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNewProduct = async () => {
    if (!supplierId || !newProductForm.productName.trim()) return;

    try {
      setSaving(true);
      await addSupplierCatalogItem(supplierId, {
        productName: newProductForm.productName.trim(),
        category: newProductForm.category,
        price: parseFloat(newProductForm.price) || 0,
        stockQuantity: parseInt(newProductForm.stockQuantity) || 0,
        minimumOrderQuantity: newProductForm.minimumOrderQuantity ? parseInt(newProductForm.minimumOrderQuantity) : undefined,
        leadTimeDays: newProductForm.leadTimeDays ? parseInt(newProductForm.leadTimeDays) : undefined,
        notes: newProductForm.notes || undefined,
        status: 'pending',
      });

      toast({
        title: 'Product submitted',
        description: 'Your new product request has been submitted for approval.',
      });

      setNewProductOpen(false);
      setNewProductForm({
        productName: '',
        category: 'split-ac',
        price: '',
        stockQuantity: '',
        minimumOrderQuantity: '',
        leadTimeDays: '',
        notes: '',
      });
      await loadCatalog();
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Unable to submit the product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingProduct) return;

    try {
      setSaving(true);
      await updateSupplierCatalogItem(editingProduct.id, {
        price: parseFloat(editForm.price) || 0,
        stockQuantity: parseInt(editForm.stockQuantity) || 0,
        minimumOrderQuantity: editForm.minimumOrderQuantity ? parseInt(editForm.minimumOrderQuantity) : null,
        leadTimeDays: editForm.leadTimeDays ? parseInt(editForm.leadTimeDays) : null,
        notes: editForm.notes || null,
      });

      toast({
        title: 'Product updated',
        description: 'The product has been updated successfully.',
      });

      setEditProductOpen(false);
      setEditingProduct(null);
      await loadCatalog();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update the product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600 mt-1">
              View, edit, and manage your product catalog.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setLinkProductOpen(true)}
              disabled={availableStoreProducts.length === 0}
            >
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Link Store Product</span>
              <span className="sm:hidden">Link Product</span>
            </Button>
            <Button 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setNewProductOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="split-ac">Split AC</SelectItem>
                  <SelectItem value="central-ac">Central AC</SelectItem>
                  <SelectItem value="spare-parts">Spare Parts</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No products found</p>
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first product'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">PRODUCT</TableHead>
                      <TableHead className="hidden sm:table-cell">CATEGORY</TableHead>
                      <TableHead className="text-right">PRICE</TableHead>
                      <TableHead className="text-right">STOCK</TableHead>
                      <TableHead className="hidden md:table-cell">STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.productName}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.productName}</p>
                              <div className="flex flex-col sm:hidden text-sm text-gray-500">
                                <span className="capitalize">{product.category.replace('-', ' ')}</span>
                                {product.productId && <span>SKU: {product.productId}</span>}
                              </div>
                              {product.productId && (
                                <p className="text-sm text-gray-500 hidden sm:block">SKU: {product.productId}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-gray-600 hidden sm:table-cell">
                          {product.category.replace('-', ' ')}
                        </TableCell>
                        <TableCell className="font-medium text-right">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-medium ${
                              product.stockQuantity <= 5 ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {product.stockQuantity}
                            </span>
                            <span className="text-xs text-gray-500 md:hidden">
                              {getStatusBadge(product.status, product.stockQuantity)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getStatusBadge(product.status, product.stockQuantity)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8 p-0"
                              aria-label={`Edit ${product.productName}`}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAdjustStock(product)}
                              className="h-8 w-8 p-0"
                              aria-label={`Adjust stock for ${product.productName}`}
                              title="Adjust Stock"
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(product)}
                              className="h-8 w-8 p-0"
                              aria-label={`Duplicate ${product.productName}`}
                              title="Duplicate"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              aria-label={`Delete ${product.productName}`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Link Store Product Dialog */}
        <Dialog open={linkProductOpen} onOpenChange={setLinkProductOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Link Store Product</DialogTitle>
              <DialogDescription>
                Add an existing store product to your catalog.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-product">Store Product</Label>
                <Select
                  value={linkForm.productId}
                  onValueChange={(value) => {
                    const selectedProduct = storeProducts.find(p => p.id === value);
                    setLinkForm(prev => ({
                      ...prev,
                      productId: value,
                      price: selectedProduct ? String(selectedProduct.price) : '',
                      stockQuantity: selectedProduct ? String(selectedProduct.stockQuantity || 0) : '',
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStoreProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link-price">Price (GHS)</Label>
                  <Input
                    id="link-price"
                    type="number"
                    value={linkForm.price}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-stock">Stock Quantity</Label>
                  <Input
                    id="link-stock"
                    type="number"
                    value={linkForm.stockQuantity}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link-moq">Minimum Order Quantity</Label>
                  <Input
                    id="link-moq"
                    type="number"
                    value={linkForm.minimumOrderQuantity}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, minimumOrderQuantity: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-lead">Lead Time (days)</Label>
                  <Input
                    id="link-lead"
                    type="number"
                    value={linkForm.leadTimeDays}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, leadTimeDays: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-notes">Notes</Label>
                <Textarea
                  id="link-notes"
                  value={linkForm.notes}
                  onChange={(e) => setLinkForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLinkProduct} disabled={saving || !linkForm.productId}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Link Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Product Dialog */}
        <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Product Request</DialogTitle>
              <DialogDescription>
                Submit a new product for admin approval.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Product Name</Label>
                <Input
                  id="new-name"
                  value={newProductForm.productName}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-category">Category</Label>
                  <Select
                    value={newProductForm.category}
                    onValueChange={(value) => setNewProductForm(prev => ({ ...prev, category: value as Product['category'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split-ac">Split AC</SelectItem>
                      <SelectItem value="central-ac">Central AC</SelectItem>
                      <SelectItem value="spare-parts">Spare Parts</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-price">Price (GHS)</Label>
                  <Input
                    id="new-price"
                    type="number"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-stock">Initial Stock</Label>
                  <Input
                    id="new-stock"
                    type="number"
                    value={newProductForm.stockQuantity}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-moq">Minimum Order Quantity</Label>
                  <Input
                    id="new-moq"
                    type="number"
                    value={newProductForm.minimumOrderQuantity}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, minimumOrderQuantity: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-notes">Notes</Label>
                <Textarea
                  id="new-notes"
                  value={newProductForm.notes}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Product description and notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleNewProduct} disabled={saving || !newProductForm.productName.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product pricing and inventory details.
              </DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{editingProduct.productName}</p>
                  <p className="text-sm text-gray-500 capitalize">{editingProduct.category.replace('-', ' ')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (GHS)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">Stock Quantity</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={editForm.stockQuantity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-moq">Minimum Order Quantity</Label>
                    <Input
                      id="edit-moq"
                      type="number"
                      value={editForm.minimumOrderQuantity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, minimumOrderQuantity: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lead">Lead Time (days)</Label>
                    <Input
                      id="edit-lead"
                      type="number"
                      value={editForm.leadTimeDays}
                      onChange={(e) => setEditForm(prev => ({ ...prev, leadTimeDays: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Adjust Stock Dialog */}
        <Dialog open={adjustStockOpen} onOpenChange={setAdjustStockOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
              <DialogDescription>
                Update the stock quantity for {adjustingProduct?.productName}
              </DialogDescription>
            </DialogHeader>
            {adjustingProduct && (
              <div className="grid gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{adjustingProduct.productName}</p>
                  <p className="text-sm text-gray-500">Current stock: {adjustingProduct.stockQuantity} units</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjust-stock-value">New Stock Quantity</Label>
                  <Input
                    id="adjust-stock-value"
                    type="number"
                    min="0"
                    value={adjustStockValue}
                    onChange={(e) => setAdjustStockValue(e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustStockOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStockAdjustment} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SupplierLayout>
  );
}
