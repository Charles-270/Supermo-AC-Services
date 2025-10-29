# Supplier Product Linking Guide

## Overview
This guide walks you through testing the supplier product linking feature with your existing 26 products.

---

## Prerequisites

### 1. Firebase Authentication Setup
Ensure you have:
- Admin account (to add products if needed)
- Supplier account (to test linking)
- Both accounts should be **approved** in the system

### 2. Products in Store
You mentioned having **26 products** in the store. To verify:
1. Login as **admin**
2. Navigate to `/admin/manage-products`
3. Confirm you see all 26 products listed

---

## Testing Workflow

### PART 1: Admin - Verify Products Exist

**Step 1:** Open http://localhost:5173/login

**Step 2:** Login with **admin credentials**

**Step 3:** Navigate to **Manage Products**
- URL: `/admin/manage-products`
- OR: Dashboard → "Manage Products" link

**Step 4:** Verify Product Count
- Bottom of page should show: "26 products"
- If fewer, add more using "Add New Product" button

**Step 5:** Note Product Names
- Write down 2-3 product names to search for later
- Examples: "Samsung 1.5HP Split AC", "LG 2.0HP Split AC", etc.

---

### PART 2: Supplier - Link Existing Products

**Step 1:** Logout and login as **supplier**

**Step 2:** Navigate to Supplier Dashboard
- URL: `/dashboard/supplier`
- Should see: "Supplier Hub" header

**Step 3:** Check Console Logs
- Press `F12` to open DevTools
- Go to **Console** tab
- Look for: `✅ Supplier Dashboard loaded: { storeProducts: 26, ... }`
- **If storeProducts: 0**, there's a Firebase connection issue

**Step 4:** Click "Link store products" Button
- Located in "Catalogue" card
- Button should be **enabled** (not grayed out)
- Dialog opens: "Link store products"

**Step 5:** Select a Product
- Click the dropdown: "Store product"
- Should see **up to 26 products** listed
- Select one product (e.g., "Samsung 1.5HP Split AC")

**Step 6:** Configure Inventory
Fill in the form:
- **Unit price (GHS)**: `2800` (your selling price)
- **On-hand stock**: `10` (your inventory)
- **Minimum order quantity**: `1` (optional)
- **Lead time (days)**: `2` (optional)
- **Delivery regions**: `Accra, Kumasi` (optional)
- **Internal notes**: `Prime location warehouse` (optional)

**Step 7:** Add to Queue
- Click **"Add to queue"** button
- Product appears in "Link queue" section below
- Form resets, ready for another product

**Step 8:** (Optional) Queue More Products
- Repeat steps 5-7 to queue 2-3 more products
- Test the queue management feature

**Step 9:** Link Products
- Click **"Link products"** button at bottom
- Wait for success toast: "X products added to your catalogue"
- Dialog closes automatically

**Step 10:** Verify in Catalogue Table
- Scroll to "Catalogue" card
- Your linked products should appear in the table
- Check: Price, Stock, Status = "active"

---

### PART 3: Supplier - Request New Product

**Step 1:** Click "New product request" Button
- Located next to "Link store products"
- Dialog opens: "Request a new product"

**Step 2:** Fill in Product Details
- **Product name**: `Daikin 3.0HP Split AC Inverter`
- **Category**: `Split AC Units`
- **Target price (GHS)**: `4500`
- **Initial stock**: `5`
- **Minimum order quantity**: `1`
- **Lead time (days)**: `3`
- **Delivery regions**: `Accra, Tema, Kumasi`
- **Supporting notes**: `High-efficiency inverter model with 5-year warranty`

**Step 3:** Submit Request
- Click **"Submit for approval"** button
- Success toast: "Admin will review and approve your new product request"
- Dialog closes

**Step 4:** Check Pending Products
- Look for notification at top: "Pending approval: 1 product awaiting admin review"
- Product appears in Catalogue table with Status: "pending" (amber badge)

---

### PART 4: Admin - Approve New Product

**Step 1:** Logout and login as **admin**

**Step 2:** Navigate to Admin Dashboard
- Should see pending supplier catalog items
- (This requires the admin approval interface)

**Step 3:** Approve or Reject
- Review supplier's new product request
- If approved, it becomes active in their catalog
- If rejected, supplier is notified

---

## Troubleshooting

### Issue: "No products in store yet" message

**Check:**
1. Open browser console (F12)
2. Look for: `✅ Supplier Dashboard loaded: { storeProducts: 0, ... }`
3. **Cause:** Products aren't loading from Firestore

**Solutions:**
- Check Firebase connection in `/src/lib/firebase.ts`
- Verify Firestore security rules allow supplier role to read `products` collection
- Check browser Network tab for failed requests

### Issue: Dropdown is disabled / "All store products are linked"

**Check:**
1. Count rows in Catalogue table
2. If you see 26 items, you've already linked all products!

**Solutions:**
- Unlink some products first (edit/delete from catalog)
- OR: Use "New product request" instead

### Issue: "Link products" button does nothing

**Check:**
1. Browser console for JavaScript errors
2. Network tab for failed Firestore writes

**Solutions:**
- Check Firestore security rules allow supplier to write to `supplier_catalog`
- Verify Firebase authentication token is valid

### Issue: Images not showing in products

**Check:**
- Firebase Storage security rules
- Image URLs in product documents

---

## Expected Firebase Structure

### Products Collection (`products`)
```javascript
{
  id: "product123",
  name: "Samsung 1.5HP Split AC",
  description: "Energy-efficient split AC unit",
  category: "split-ac",
  price: 2500,
  stockQuantity: 50,
  images: ["https://storage.googleapis.com/..."],
  specifications: {
    brand: "Samsung",
    capacity: "1.5HP"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Supplier Catalog Collection (`supplier_catalog`)
```javascript
{
  id: "catalog_item_456",
  supplierId: "supplier_uid_123",
  productId: "product123", // Links to products collection
  productName: "Samsung 1.5HP Split AC",
  category: "split-ac",
  price: 2800, // Supplier's price (can differ from store price)
  stockQuantity: 10, // Supplier's inventory
  minimumOrderQuantity: 1,
  leadTimeDays: 2,
  deliveryRegions: ["Accra", "Kumasi"],
  notes: "Prime location warehouse",
  status: "active", // or "pending", "inactive"
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Success Criteria

✅ Can view all 26 products in dropdown
✅ Can queue multiple products before linking
✅ Products appear in Catalogue table after linking
✅ Console shows correct product counts
✅ Can submit new product requests
✅ Pending products show amber "pending" badge
✅ No TypeScript/JavaScript errors in console

---

## Video Walkthrough (Manual Steps)

Since I cannot interact with the browser directly, please follow these steps and report any issues:

1. **Record your screen** (optional) or take screenshots
2. Follow **PART 1** → **PART 2** → **PART 3** → **PART 4**
3. Note any error messages or unexpected behavior
4. Check browser console for `✅ Supplier Dashboard loaded` message
5. Share any issues you encounter

---

## Quick Test Commands

Open browser console and run:

```javascript
// Check if products are loaded
console.log('Store Products:', storeProducts.length);

// Check if catalog items exist
console.log('Catalog Items:', catalog.length);

// Check available products to link
console.log('Available to Link:', availableStoreProducts.length);
```

---

## Next Steps After Testing

Once linking works:
1. Test customer checkout with supplier products
2. Verify orders route to correct supplier
3. Test supplier order fulfillment workflow
4. Check inventory deduction on purchase
5. Test multiple suppliers selling same product

---

**Need Help?** Check browser console for errors and Firestore security rules for permission issues.
