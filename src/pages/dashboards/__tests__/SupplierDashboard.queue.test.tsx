import * as React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SupplierDashboard } from '../SupplierDashboard';

const mockGetSupplierWithStats = vi.fn();
const mockGetSupplierOrders = vi.fn();
const mockGetSupplierProfile = vi.fn();
const mockUpdateSupplierProfile = vi.fn();
const mockGetSupplierCatalog = vi.fn();
const mockAddSupplierCatalogItem = vi.fn();
const mockUpdateSupplierCatalogItem = vi.fn();
const mockGetStoreProductsForSupplier = vi.fn();

const mockUpdateOrderStatus = vi.fn();
const mockUpdateTrackingNumber = vi.fn();

const toastSpy = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: {
      uid: 'supplier-123',
      role: 'supplier',
      metadata: { companyName: 'Test Supplier' },
      displayName: 'Supplier Owner',
    },
    signOut: vi.fn(),
  }),
}));

vi.mock('@/services/supplierService', () => ({
  getSupplierWithStats: (...args: unknown[]) => mockGetSupplierWithStats(...args),
  getSupplierOrders: (...args: unknown[]) => mockGetSupplierOrders(...args),
  getSupplierProfile: (...args: unknown[]) => mockGetSupplierProfile(...args),
  updateSupplierProfile: (...args: unknown[]) => mockUpdateSupplierProfile(...args),
  getSupplierCatalog: (...args: unknown[]) => mockGetSupplierCatalog(...args),
  addSupplierCatalogItem: (...args: unknown[]) => mockAddSupplierCatalogItem(...args),
  updateSupplierCatalogItem: (...args: unknown[]) => mockUpdateSupplierCatalogItem(...args),
  getStoreProductsForSupplier: (...args: unknown[]) => mockGetStoreProductsForSupplier(...args),
}));

vi.mock('@/services/productService', () => ({
  updateOrderStatus: (...args: unknown[]) => mockUpdateOrderStatus(...args),
  updateTrackingNumber: (...args: unknown[]) => mockUpdateTrackingNumber(...args),
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: (...args: unknown[]) => toastSpy(...args),
}));

vi.mock('@/components/ui/select', () => {
  const Select = ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => {
    let triggerId: string | undefined;
    let placeholder = '';
    const options: Array<{ value: string; label: React.ReactNode }> = [];

    React.Children.forEach(children, (child) => {
      if (!child || typeof child !== 'object' || !('type' in child)) {
        return;
      }
      const reactChild = child as React.ReactElement<{ id?: string; children: React.ReactNode }>;
      if (reactChild.type === SelectTrigger) {
        triggerId = reactChild.props.id;
        React.Children.forEach(reactChild.props.children, (grandChild) => {
          if (grandChild && typeof grandChild === 'object' && 'type' in grandChild) {
            const reactGrandChild = grandChild as React.ReactElement<{ placeholder?: string }>;
            if (reactGrandChild.type === SelectValue && reactGrandChild.props.placeholder) {
              placeholder = reactGrandChild.props.placeholder;
            }
          }
        });
      }
      if (reactChild.type === SelectContent) {
        React.Children.forEach(reactChild.props.children, (item) => {
          if (item && typeof item === 'object' && 'type' in item) {
            const reactItem = item as React.ReactElement<{ value: string; children: React.ReactNode }>;
            if (reactItem.type === SelectItem) {
              options.push({ value: reactItem.props.value, label: reactItem.props.children });
            }
          }
        });
      }
    });

    return (
      <select id={triggerId} value={value} onChange={(event) => onValueChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const SelectTrigger = ({ children }: { id?: string; children: React.ReactNode }) => (
    <>{children}</>
  );
  SelectTrigger.displayName = 'SelectTrigger';

  const SelectValue = () => null;
  SelectValue.displayName = 'SelectValue';

  const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  SelectContent.displayName = 'SelectContent';

  const SelectItem = (_props: { value: string; children: React.ReactNode }) => null;
  SelectItem.displayName = 'SelectItem';

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  };
});

vi.mock('@/components/ui/dialog', () => {
  const Dialog = ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null;
  const DialogContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const DialogDescription = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
  const DialogFooter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const DialogHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>;

  return {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  };
});

describe('SupplierDashboard linking queue', () => {
  beforeEach(() => {
    mockGetSupplierWithStats.mockResolvedValue({
      totalRevenue: 0,
      totalProducts: 0,
      pendingOrders: 0,
      lowStock: 0,
    });
    mockGetSupplierOrders.mockResolvedValue([]);
    mockGetSupplierProfile.mockResolvedValue({ metadata: {} });
    mockUpdateSupplierProfile.mockResolvedValue(undefined);
    mockGetSupplierCatalog.mockResolvedValue([]);
    mockAddSupplierCatalogItem.mockResolvedValue(undefined);
    mockUpdateSupplierCatalogItem.mockResolvedValue(undefined);
    mockGetStoreProductsForSupplier.mockResolvedValue([
      {
        id: 'store-1',
        name: 'Test Coil Unit',
        description: 'Efficient cooling coil',
        category: 'accessories',
        price: 1500,
        compareAtPrice: 0,
        images: [],
        specifications: {},
        stockQuantity: 20,
        stockStatus: 'active',
        condition: 'new',
        supplierId: 'core',
        supplierName: 'Marketplace',
        tags: [],
        featured: false,
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      },
    ]);
    mockUpdateOrderStatus.mockResolvedValue(undefined);
    mockUpdateTrackingNumber.mockResolvedValue(undefined);
    toastSpy.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('queues a store product and links it before clearing the queue', async () => {
    render(<SupplierDashboard />);

    await waitFor(() => expect(mockGetSupplierCatalog).toHaveBeenCalledTimes(1));

    const linkStoreBtn = await screen.findByRole('button', { name: /link store products/i });
    fireEvent.click(linkStoreBtn);

    const dialog = await screen.findByTestId('dialog');

    const productSelect = within(dialog).getByLabelText('Store product');
    fireEvent.change(productSelect, { target: { value: 'store-1' } });

    fireEvent.change(within(dialog).getByLabelText('Supplier base price (GHS)'), {
      target: { value: '1200' },
    });
    fireEvent.change(within(dialog).getByLabelText('On-hand stock'), { target: { value: '9' } });

    const addToQueueBtn = within(dialog).getByRole('button', { name: /add to queue/i });
    fireEvent.click(addToQueueBtn);

    expect(
      await within(dialog).findByText('Test Coil Unit', { selector: 'p' })
    ).toBeInTheDocument();

    const linkProductsBtn = within(dialog).getByRole('button', { name: /link products/i });
    fireEvent.click(linkProductsBtn);

    await waitFor(() => expect(mockAddSupplierCatalogItem).toHaveBeenCalledTimes(1));
    expect(mockAddSupplierCatalogItem).toHaveBeenCalledWith(
      'supplier-123',
      expect.objectContaining({ productId: 'store-1', price: 1200, stockQuantity: 9 })
    );

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Products linked' })
    );

    await waitFor(() => expect(screen.queryByTestId('dialog')).toBeNull());

    fireEvent.click(await screen.findByRole('button', { name: /link store products/i }));

    const reopenedDialog = await screen.findByTestId('dialog');
    expect(within(reopenedDialog).getByText(/Queue is empty/i)).toBeInTheDocument();
  }, 15000);
});
