import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { resolveProductPricing } from '@/utils/pricing';

export function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  } = useCart();

  const hasItems = cart.length > 0;
  const total = getCartTotal();
  const itemCount = getCartItemsCount();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Shopping Cart</h1>
          <p className="text-neutral-600">
            {hasItems
              ? `You have ${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart.`
              : 'Your cart is currently empty.'}
          </p>
        </div>
        {hasItems ? (
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={clearCart}>
              Clear cart
            </Button>
            <Button asChild variant="secondary">
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {hasItems ? (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4">
            {cart.map(({ product, quantity, installationRequired }) => {
              const pricing = resolveProductPricing(product);
              const subtotal = pricing.totalPrice * quantity;
              const productImage = product.images?.[0];

              return (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm md:flex-row md:items-stretch"
                >
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="h-32 w-32 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-md bg-neutral-100 text-sm text-neutral-500">
                      No image
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium text-neutral-900">{product.name}</h2>
                      <p className="text-sm text-neutral-600">{product.description}</p>
                      {installationRequired ? (
                        <p className="mt-2 text-sm font-medium text-primary-600">
                          Installation required
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                        >
                          +
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-neutral-500">
                          Unit price: {formatCurrency(pricing.totalPrice)}
                        </p>
                        <p className="text-lg font-semibold text-neutral-900">
                          {formatCurrency(subtotal)}
                        </p>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(product.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">Order summary</h2>
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>Items ({itemCount})</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="my-4 border-t border-neutral-200" />
            <div className="flex items-center justify-between text-lg font-semibold text-neutral-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button className="mt-6 w-full" asChild>
              <Link to="/checkout">Continue to checkout</Link>
            </Button>
          </aside>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="text-neutral-600">
            Explore our{' '}
            <Link className="text-primary-600 underline" to="/products">
              product catalog
            </Link>{' '}
            to add items to your cart.
          </p>
        </div>
      )}
    </div>
  );
}

export default CartPage;
