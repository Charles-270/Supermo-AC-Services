/**
 * Product Management Page - Redesigned
 * Create, edit, and delete products with full UI
 * Google Stitch-inspired design - October 2025
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  Search,
  Upload,
  Image as ImageIcon,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductCategory } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { uploadProductImage } from '@/utils/imageUpload';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Badge } from '@/components/ui/badge';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number;
  category: ProductCategory;
  brand: string;
  capacity: string;
  stockQuantity: number;
  condition: 'new' | 'refurbished';
  stockStatus: 'active' | 'low-stock' | 'out-of-stock';
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  compareAtPrice: 0,
  category: 'split-ac',
  brand: '',
  capacity: '',
  stockQuantity: 0,
  condition: 'new',
  stockStatus: 'active',
};

export default function ManageProductsRedesigned() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [currentProductImages, setCurrentProductImages] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
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
      showStatus('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const previewUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...files]);
    setImagePreviewUrls(prev => [...prev, ...previewUrls]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (index: number) => {
    setCurrentProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setCurrentProductImages([]);
    showStatus('success', 'All images cleared. Save to apply changes.');
  };

  const uploadImages = async (productName: string): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of selectedImages) {
        const result = await uploadProductImage(file, productName);
        uploadedUrls.push(result.url);
      }
      return uploadedUrls;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price) {
      showStatus('error', 'Name and price are required');
      return;
    }

    setSaving(true);
    try {
      const imageUrls = await uploadImages(formData.name);

      await addDoc(collection(db, 'products'), {
        ...formData,
        images: imageUrls,
        specifications: {
          brand: formData.brand,
          capacity: formData.capacity,
        },
        featured: false,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      showStatus('success', `Product "${formData.name}" added successfully with ${imageUrls.length} image(s)!`);
      setFormData(EMPTY_FORM);
      setShowAddForm(false);
      setSelectedImages([]);
      setImagePreviewUrls([]);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      showStatus('error', 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = async (productId: string) => {
    if (!formData.name || !formData.price) {
      showStatus('error', 'Name and price are required');
      return;
    }

    setSaving(true);
    try {
      const newImageUrls = await uploadImages(formData.name);
      const allImages = [...currentProductImages, ...newImageUrls];

      await updateDoc(doc(db, 'products', productId), {
        ...formData,
        images: allImages,
        specifications: {
          brand: formData.brand,
          capacity: formData.capacity,
        },
        updatedAt: new Date(),
      });

      showStatus('success', `Product "${formData.name}" updated successfully with ${allImages.length} image(s)!`);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setCurrentProductImages([]);
      setSelectedImages([]);
      setImagePreviewUrls([]);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      showStatus('error', 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      showStatus('success', `Product "${productName}" deleted successfully!`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showStatus('error', 'Failed to delete product');
    }
  };

  const startEdit = (product: Product) => {
    const formStockStatus = product.stockStatus === 'discontinued' ? 'out-of-stock' : product.stockStatus;

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || 0,
      category: product.category,
      brand: product.specifications?.brand || '',
      capacity: product.specifications?.capacity || '',
      stockQuantity: product.stockQuantity || 0,
      condition: product.condition || 'new',
      stockStatus: formStockStatus || 'active',
    });
    setCurrentProductImages(product.images || []);
    setEditingId(product.id);
    setShowAddForm(false);
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData(EMPTY_FORM);
    setCurrentProductImages([]);
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.specifications.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      title="Manage Products"
      subtitle={`${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'E-Commerce', href: '/dashboard/admin/ecommerce/products' },
        { label: 'Manage Products' }
      ]}
      actions={
        !showAddForm && !editingId && (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Status Messages */}
        {statusMessage && (
          <Alert className={statusMessage.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={statusMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {statusMessage.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <Card className="border-2 border-blue-200 shadow-md">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="text-lg">{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
              <CardDescription>Fill in the product details below</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Samsung 1.5HP Split AC"
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief product description"
                    className="mt-1"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value: ProductCategory) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split-ac">Split AC Units</SelectItem>
                      <SelectItem value="central-ac">Central AC Systems</SelectItem>
                      <SelectItem value="spare-parts">Spare Parts</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., Samsung, LG"
                    className="mt-1"
                  />
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor="price">Price (GH₵) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                {/* Compare At Price */}
                <div>
                  <Label htmlFor="compareAtPrice">Supplier Base Price (GH₵)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="Net amount before platform fees"
                    className="mt-1"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Supplier cost before 3% platform fees
                  </p>
                </div>

                {/* Capacity */}
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 1.5HP, 12000 BTU"
                    className="mt-1"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                {/* Condition */}
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value: 'new' | 'refurbished') => setFormData({ ...formData, condition: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Status */}
                <div>
                  <Label htmlFor="stockStatus">Stock Status</Label>
                  <Select value={formData.stockStatus} onValueChange={(value: 'active' | 'low-stock' | 'out-of-stock') => setFormData({ ...formData, stockStatus: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Management Section */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Product Images</Label>
                  {editingId && currentProductImages.length > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={clearAllImages}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Images
                    </Button>
                  )}
                </div>

                {/* Current Product Images */}
                {editingId && currentProductImages.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm text-neutral-600 mb-2 block">Current Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {currentProductImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden border-2 border-neutral-200">
                            <img
                              src={imageUrl}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={() => removeCurrentImage(index)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm text-neutral-600 mb-2 block">New Images to Upload</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imagePreviewUrls.map((previewUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden border-2 border-blue-500">
                            <img
                              src={previewUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={() => removeSelectedImage(index)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <Label htmlFor="imageUpload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 hover:border-blue-500 transition-colors text-center bg-neutral-50 hover:bg-blue-50">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                      <p className="text-sm font-medium text-neutral-600">
                        Click to upload product images
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        JPG, PNG, WebP, or AVIF (max 5MB each)
                      </p>
                    </div>
                  </Label>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {uploadingImages && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading images...
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => editingId ? handleEditProduct(editingId) : handleAddProduct()}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingId ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </Button>
                <Button onClick={cancelEdit} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        {!showAddForm && !editingId && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search products by name, category, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Products List */}
        {!showAddForm && !editingId && (
          <>
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
                    {searchQuery ? 'No products found matching your search' : 'No products yet. Add your first product above!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Product Image Thumbnail */}
                        {product.images && product.images.length > 0 ? (
                          <div className="w-24 h-24 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 flex-shrink-0 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-neutral-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-neutral-900">{product.name}</h3>
                              {product.description && (
                                <p className="text-sm text-neutral-600 mt-1">{product.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => startEdit(product)}
                                variant="outline"
                                size="sm"
                                disabled={!!editingId}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                variant="outline"
                                size="sm"
                                disabled={!!editingId}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-3">
                            <span>
                              <strong>Category:</strong> {product.category.replace('-', ' ')}
                            </span>
                            {product.specifications.brand && (
                              <span>
                                <strong>Brand:</strong> {product.specifications.brand}
                              </span>
                            )}
                            {product.specifications.capacity && (
                              <span>
                                <strong>Capacity:</strong> {product.specifications.capacity}
                              </span>
                            )}
                            <span>
                              <strong>Stock:</strong> {product.stockQuantity}
                            </span>
                            <span>
                              <strong>Images:</strong> {product.images?.length || 0}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatCurrency(product.price)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-sm text-neutral-500">
                                Base: {formatCurrency(product.compareAtPrice)}
                              </span>
                            )}
                            {getStockBadge(product.stockStatus)}
                            {product.condition === 'refurbished' && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                Refurbished
                              </Badge>
                            )}
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
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchQuery && ` (filtered from ${products.length} total)`}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
