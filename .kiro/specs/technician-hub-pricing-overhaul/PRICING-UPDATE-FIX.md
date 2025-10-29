# Pricing Update Issue - Diagnosis & Fix

**Issue:** Admin cannot update service prices in Platform Settings

**Tested Credentials:**
- Email: charlestimmer270@gmail.com
- Password: Charle$123

**Desired Price Updates:**
- AC Inspection: 250 GHS
- AC Maintenance: 350 GHS
- AC Repair: 500 GHS
- AC Installation: 1000 GHS

---

## Potential Causes

### 1. Firestore Security Rules
The most likely issue is that Firestore security rules don't allow writing to the `settings/servicePricing` document.

**Check:** Firestore Rules for `settings` collection

**Expected Rule:**
```javascript
match /settings/{document} {
  allow read: if true;
  allow write: if request.auth != null && 
               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2. Missing Firestore Document
The `settings/servicePricing` document might not exist yet.

**Solution:** Initialize the document with default values

### 3. Admin Role Not Set
The user might not have the `admin` role in Firestore.

**Check:** User document at `users/{uid}` should have `role: 'admin'`

---

## Quick Fix Options

### Option 1: Initialize Pricing Document (Recommended)

Run this in Firebase Console or add an initialization function:

```typescript
// Add to pricingService.ts
export async function initializeServicePricing(): Promise<void> {
  try {
    const pricingRef = doc(db, 'settings', 'servicePricing');
    const pricingSnap = await getDoc(pricingRef);
    
    if (!pricingSnap.exists()) {
      await setDoc(pricingRef, {
        installation: 500,
        maintenance: 150,
        repair: 200,
        inspection: 100,
        lastUpdated: serverTimestamp(),
        updatedBy: 'system',
      });
      console.log('✅ Service pricing initialized');
    }
  } catch (error) {
    console.error('Error initializing pricing:', error);
  }
}
```

### Option 2: Update Firestore Rules

If the rules are too restrictive, update them in Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Add/update the settings collection rule
3. Publish the rules

### Option 3: Manual Update via Firebase Console

As a temporary workaround:

1. Go to Firebase Console → Firestore Database
2. Navigate to `settings` collection
3. Create/edit `servicePricing` document
4. Add fields:
   ```
   installation: 1000
   maintenance: 350
   repair: 500
   inspection: 250
   lastUpdated: [timestamp]
   updatedBy: "admin"
   ```

---

## Debugging Steps

### 1. Check Console Errors

Open browser DevTools (F12) and check for errors when clicking "Save Pricing":
- Look for Firestore permission errors
- Look for network errors
- Check the Console tab for logged errors

### 2. Verify Admin Role

Check if the user has admin role:
```typescript
// In browser console
firebase.auth().currentUser.getIdTokenResult().then(token => {
  console.log('User role:', token.claims.role);
});
```

### 3. Test Firestore Write Permission

Try writing to Firestore manually:
```typescript
// In browser console
import { doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

const testRef = doc(db, 'settings', 'test');
setDoc(testRef, { test: true })
  .then(() => console.log('✅ Write successful'))
  .catch(err => console.error('❌ Write failed:', err));
```

---

## Code Review

The ServicePricingEditor component code is correct:

✅ Fetches current pricing on mount  
✅ Validates changes before saving  
✅ Calls `updateServicePricing()` with correct parameters  
✅ Shows error toast on failure  
✅ Reloads pricing after successful save  

The pricingService code is also correct:

✅ Uses `setDoc()` to update Firestore  
✅ Creates price change notifications  
✅ Proper error handling  
✅ Uses serverTimestamp()  

---

## Recommended Solution

Since I cannot test with Playwright due to browser conflicts, here's what you should do:

### Step 1: Check Browser Console
1. Open the app at http://localhost:5174
2. Login as admin (charlestimmer270@gmail.com / Charle$123)
3. Navigate to Settings → Pricing tab
4. Open DevTools (F12) → Console tab
5. Try to update prices
6. **Copy any error messages you see**

### Step 2: Check Firestore Rules
1. Go to Firebase Console
2. Navigate to Firestore Database → Rules
3. Check if `settings` collection allows admin writes
4. If not, add the rule shown above

### Step 3: Initialize Document
If the document doesn't exist, create it manually in Firebase Console or add an initialization function.

---

## Expected Behavior

When working correctly:

1. Admin opens Settings → Pricing tab
2. Current prices load (or defaults if first time)
3. Admin edits prices:
   - Inspection: 100 → 250
   - Maintenance: 150 → 350
   - Repair: 200 → 500
   - Installation: 500 → 1000
4. Changed fields highlight in orange
5. Impact summary shows who will be notified
6. Click "Save Pricing"
7. Success toast appears: "Pricing Updated"
8. Prices reload with new values
9. Notifications created for technicians

---

## Next Steps

1. **Check console errors** - This will tell us exactly what's failing
2. **Verify Firestore rules** - Ensure admin can write to settings
3. **Check user role** - Confirm the user has admin role
4. **Initialize document** - Create the document if it doesn't exist

Once you provide the console error message, I can give you the exact fix needed.

---

**Status:** Awaiting console error details for precise diagnosis  
**Priority:** High - Blocking admin functionality  
**Estimated Fix Time:** 5-10 minutes once error is identified
