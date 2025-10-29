# Email Notification System Setup Guide

## Overview

The email notification system automatically sends customers comprehensive service completion emails that include:
- ✅ Service details (type, package, location, completion date)
- 👨‍🔧 Technician information (name, contact details)
- 📋 Complete service report from technician
- 📸 Before/after photos in a gallery layout
- 💰 Detailed cost breakdown with any adjustments
- ⭐ Call-to-action button to rate the service

## How It Works

### 1. Trigger
When a technician marks a booking as "completed" in the system:
```javascript
// Firestore trigger activates
bookings/{bookingId}.status: 'in-progress' → 'completed'
```

### 2. Cloud Function Processing
The `onBookingCompleted` function (lines 437-736 in `functions/index.js`):
- Extracts all booking data (service details, technician info, photos, costs)
- Generates a beautiful HTML email with inline CSS (mobile-responsive)
- Creates a plain-text fallback for email clients that don't support HTML
- Stores the email document in Firestore `emails` collection

### 3. Email Delivery
The email document is queued in Firestore with status `pending`. From here, you have two options:

**Option A: Firebase Extension (Recommended)**
- Install the "Trigger Email" extension from Firebase Console
- It automatically processes documents in the `emails` collection
- Supports SendGrid, Mailgun, SMTP

**Option B: Custom Email Service**
- Watch the `emails` collection with a Cloud Function
- Send emails via SendGrid, Mailgun, AWS SES, etc.
- Update document status to `sent` after delivery

## Setup Instructions

### Option A: Firebase Trigger Email Extension (Easiest)

#### Step 1: Install Extension
```bash
firebase ext:install firebase/firestore-send-email
```

Or install via [Firebase Console](https://console.firebase.google.com/):
1. Go to Extensions
2. Search for "Trigger Email"
3. Click "Install"

#### Step 2: Configure Extension
During installation, provide:
- **SMTP Connection URI**: Your email service credentials
  - SendGrid: `smtps://apikey:YOUR_API_KEY@smtp.sendgrid.net:465`
  - Mailgun: `smtps://YOUR_USERNAME:YOUR_API_KEY@smtp.mailgun.org:465`
  - Gmail: `smtps://YOUR_EMAIL:YOUR_APP_PASSWORD@smtp.gmail.com:465`

- **Email Documents Collection**: `emails`
- **Default FROM address**: `Supremo AC Services <noreply@supremo-ac-services.web.app>`

#### Step 3: Verify Setup
1. Mark a test booking as completed
2. Check Firestore `emails` collection for new document
3. Document status should change from `PENDING` → `SUCCESS`
4. Check customer email inbox

---

### Option B: SendGrid Direct Integration

#### Step 1: Get SendGrid API Key
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key with "Mail Send" permission
3. Verify your sender email address

#### Step 2: Install SendGrid Package
```bash
cd functions
npm install @sendgrid/mail
```

#### Step 3: Configure Firebase Functions
```bash
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
```

#### Step 4: Create Email Processor Function
Add to `functions/index.js`:

```javascript
const sgMail = require('@sendgrid/mail');

exports.processEmailQueue = functions
  .region('europe-west1')
  .firestore
  .document('emails/{emailId}')
  .onCreate(async (snapshot, context) => {
    const emailData = snapshot.data();
    const emailId = context.params.emailId;

    // Skip if already processed
    if (emailData.delivery?.state !== 'PENDING') {
      return null;
    }

    try {
      // Configure SendGrid
      const apiKey = functions.config().sendgrid?.api_key;
      if (!apiKey) {
        throw new Error('SendGrid API key not configured');
      }
      sgMail.setApiKey(apiKey);

      // Prepare email
      const msg = {
        to: emailData.to,
        from: emailData.from,
        replyTo: emailData.replyTo,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      // Send email
      await sgMail.send(msg);

      // Update document
      await snapshot.ref.update({
        'delivery.state': 'SUCCESS',
        'delivery.endTime': admin.firestore.FieldValue.serverTimestamp(),
        'delivery.info': {
          messageId: context.params.emailId,
          provider: 'sendgrid'
        }
      });

      console.log(`✅ Email sent successfully: ${emailId}`);
      return { success: true, emailId };

    } catch (error) {
      console.error(`❌ Error sending email ${emailId}:`, error);

      // Update document with error
      await snapshot.ref.update({
        'delivery.state': 'ERROR',
        'delivery.endTime': admin.firestore.FieldValue.serverTimestamp(),
        'delivery.error': error.message,
        'delivery.attempts': admin.firestore.FieldValue.increment(1)
      });

      return { success: false, error: error.message };
    }
  });
```

#### Step 5: Deploy
```bash
firebase deploy --only functions:processEmailQueue
```

---

## Email Document Structure

Each email is stored in Firestore with this schema:

```typescript
interface EmailDocument {
  // Recipients
  to: string;                    // Customer email
  from: string;                  // Sender (Supremo AC Services)
  replyTo: string;               // Support email for replies

  // Content
  subject: string;               // Email subject line
  html: string;                  // Rich HTML email body
  text: string;                  // Plain text fallback

  // Metadata
  bookingId: string;             // Related booking ID
  customerId: string;            // Customer user ID
  type: 'booking_completed';     // Email type

  // Tracking
  sentAt: Timestamp;             // When queued
  delivery: {
    startTime: Timestamp;        // Processing start
    endTime?: Timestamp;         // Processing end
    state: 'PENDING' | 'SUCCESS' | 'ERROR';
    attempts: number;            // Retry count
    error?: string;              // Error message if failed
  };

  // Additional data
  metadata: {
    technicianName: string | null;
    serviceType: string;
    finalCost: number;
    hasPhotos: boolean;
    hasServiceReport: boolean;
    completedAt: Timestamp;
  };
}
```

## Email Template Features

### 1. Responsive Design
- Mobile-first approach with inline CSS
- Works on all major email clients (Gmail, Outlook, Apple Mail, etc.)
- Maximum width 600px for optimal readability

### 2. Rich Content Sections
- **Header**: Gradient background with completion checkmark
- **Service Details**: Clean table layout with booking information
- **Technician Info**: Highlighted card with contact details
- **Service Report**: Formatted text area with technician's notes
- **Photo Gallery**: Grid layout with thumbnails (if photos available)
- **Cost Breakdown**: Clear pricing with estimated vs final comparison
- **Call-to-Action**: Button linking to rating form
- **Footer**: Company branding and contact information

### 3. Conditional Content
- Technician section only shows if assigned
- Service report only shows if provided
- Photo gallery only shows if photos were uploaded
- Cost adjustment shows color-coded difference (green for savings, red for increase)

## Testing

### 1. Test with Firebase Emulator
```bash
# Start emulators
firebase emulators:start

# In another terminal, trigger test email
node scripts/test-email.js
```

Create `scripts/test-email.js`:
```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

async function testEmail() {
  // Update a test booking to completed
  const testBookingRef = db.collection('bookings').doc('TEST_BOOKING_ID');

  await testBookingRef.update({
    status: 'completed',
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    serviceReport: 'Test service report: AC maintenance completed successfully.',
    finalCost: 150.00
  });

  console.log('Test booking marked as completed. Check emails collection.');
}

testEmail();
```

### 2. Check Email Logs
Monitor Firestore `emails` collection:
```bash
firebase firestore:get emails --limit 10
```

### 3. Verify Delivery Status
Check document `delivery.state`:
- `PENDING`: Waiting to be sent
- `SUCCESS`: Delivered successfully
- `ERROR`: Failed (check `delivery.error` for details)

## Cost Considerations

### Firebase Extension
- Free tier: 10,000 emails/month
- Beyond free tier: $0.001 per email (very affordable)

### SendGrid
- Free tier: 100 emails/day
- Essentials plan: $19.95/month for 50,000 emails

### Firestore Writes
- Each email creates 2 document writes (create + status update)
- ~$0.36 per 1 million emails

**Example Monthly Cost (1,000 completed bookings):**
- Firebase Extension: Free (within 10K limit)
- Firestore writes: $0.000072
- **Total: ~$0 per month** 🎉

## Security Rules

Add to `firestore.rules`:

```javascript
// Email collection (write-only by Cloud Functions)
match /emails/{emailId} {
  // Only Cloud Functions can write
  allow read, write: if false;
}
```

This prevents clients from reading sensitive email content or creating fake emails.

## Monitoring & Debugging

### View Cloud Function Logs
```bash
firebase functions:log --only onBookingCompleted
```

### Common Issues

**Issue**: Emails not being sent
- **Check**: Firestore `emails` collection has documents
- **Check**: Extension is installed and configured
- **Check**: SMTP credentials are correct
- **Solution**: Review Cloud Functions logs

**Issue**: HTML not rendering
- **Check**: Email client supports HTML (most do)
- **Check**: Inline styles are present (no external CSS)
- **Solution**: Plain text fallback should display

**Issue**: Photos not loading
- **Check**: Firebase Storage rules allow public read
- **Check**: Photo URLs are publicly accessible
- **Solution**: Update Storage rules or use signed URLs

## Future Enhancements

### 1. Email Templates
Create reusable templates for different email types:
- Booking confirmation
- Technician assigned
- Status updates
- Order confirmations

### 2. Email Preferences
Allow customers to customize notification preferences:
```typescript
interface EmailPreferences {
  bookingConfirmation: boolean;
  statusUpdates: boolean;
  completionReport: boolean;
  marketingEmails: boolean;
}
```

### 3. Multi-language Support
Detect customer language and send localized emails:
```javascript
const emailTemplates = {
  en: getEnglishTemplate(bookingData),
  fr: getFrenchTemplate(bookingData),
};
```

### 4. SMS Notifications
Integrate with Twilio or Africa's Talking for SMS:
```javascript
exports.sendCompletionSMS = functions
  .firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    // Send SMS via Twilio
  });
```

## Support

For questions or issues:
- **Documentation**: This file
- **Firebase Support**: https://firebase.google.com/support
- **Extension Issues**: https://github.com/firebase/extensions/issues

---

**Last Updated**: October 2025
**Version**: 1.0.0
