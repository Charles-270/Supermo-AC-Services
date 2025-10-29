# Real-Time Notifications System

This document explains the real-time booking updates and Cloud Functions notification system implemented for Supremo AC Services.

## Overview

The platform now features a comprehensive real-time notification system that keeps customers and technicians updated about booking status changes instantly, without requiring page refreshes.

## Architecture

### 1. **Real-Time Listeners (Frontend)**

#### Custom Hook: `useRealtimeBookings`
Location: `src/hooks/useRealtimeBookings.ts`

**Features:**
- Real-time booking updates using Firestore `onSnapshot`
- Automatic state synchronization
- Filter by customer ID, technician ID, or booking status
- Real-time booking counts by status
- Automatic cleanup on component unmount

**Usage Example:**
```typescript
// In Customer Dashboard
const { bookings, loading, error } = useRealtimeBookings({
  customerId: user?.uid,
});

// In Technician Dashboard
const { bookings, loading, error } = useRealtimeBookings({
  technicianId: user?.uid,
});

// Get real-time counts
const { counts } = useRealtimeBookingCounts(user?.uid, 'customer');
// Returns: { pending, confirmed, in-progress, completed, cancelled }
```

### 2. **Cloud Functions (Backend)**

Location: `functions/index.js`

#### Function 1: `onBookingCreated`
**Trigger:** New booking document created
**Purpose:** Send booking confirmation email to customer
**Notifications:**
- Customer receives booking confirmation
- Booking details (service, date, time, location)
- Booking ID for reference

#### Function 2: `onTechnicianAssigned`
**Trigger:** Booking document updated with technician ID
**Purpose:** Notify customer when technician is assigned
**Notifications:**
- Customer receives technician details
- Service appointment confirmation
- Technician name and contact

#### Function 3: `onBookingStatusChange`
**Trigger:** Booking status field changes
**Purpose:** Notify both customer and technician of status updates
**Status Messages:**
- `pending`: Booking received, awaiting confirmation
- `confirmed`: Booking confirmed, waiting for technician assignment
- `in-progress`: Service in progress
- `completed`: Service completed successfully
- `cancelled`: Booking cancelled

**Dual Notifications:**
- Customer gets status update email
- Technician gets job update email (for in-progress/completed)

#### Function 4: `onBookingCompleted`
**Trigger:** Booking status changes to 'completed'
**Purpose:** Send completion confirmation and request review
**Notifications:**
- Service completion confirmation
- Final cost details
- Review request

#### Function 5: `calculateDailyStats`
**Trigger:** Scheduled (daily at midnight GMT+0, Africa/Accra timezone)
**Purpose:** Calculate platform statistics
**Metrics Collected:**
- Total bookings
- Completed bookings
- Pending bookings

## UI Indicators

### Live Status Indicator
Both Customer and Technician dashboards feature a **pulsing green dot** indicator:
```html
<span className="flex h-2 w-2 relative">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" title="Live updates enabled"></span>
</span>
```

This indicates that real-time updates are active.

### Status Badges
- **Pending**: Amber badge with count
- **Confirmed**: Blue badge with count
- **In Progress**: Primary (cyan) badge with count
- Active job count displayed next to jobs list

## Email Notification Flow

### Current Implementation
All notifications are logged to the `email_logs` collection in Firestore with:
- Recipient email
- Subject line
- Email body (plain text)
- Booking ID reference
- Timestamp
- Status (pending/sent)
- Type (booking_created, technician_assigned, status_change, etc.)

### Production Setup (To Implement)
For production deployment, integrate with an email service provider:

#### Option 1: SendGrid
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: emailData.to,
  from: 'noreply@supremo-ac.com',
  subject: emailData.subject,
  text: emailData.body,
});
```

#### Option 2: Mailgun
```javascript
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

await mailgun.messages().send({
  from: 'Supremo AC <noreply@supremo-ac.com>',
  to: emailData.to,
  subject: emailData.subject,
  text: emailData.body,
});
```

## Deployment

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged into Firebase: `firebase login`
3. Project initialized: `firebase init functions`

### Deploy Cloud Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:onBookingStatusChange
```

### View Logs
```bash
firebase functions:log
firebase functions:log --only onBookingStatusChange
```

### Local Testing with Emulator
```bash
firebase emulators:start --only functions
```

## Configuration

### Environment Variables
Set up environment variables for production:
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_KEY"
firebase functions:config:set app.email="noreply@supremo-ac.com"
```

Access in code:
```javascript
const sendgridKey = functions.config().sendgrid.key;
```

### Region
All functions are deployed to `europe-west1` (closest to Ghana for optimal performance).

To change region, modify the `.region()` call:
```javascript
exports.functionName = functions
  .region('europe-west1') // Change as needed
  .firestore
  // ...
```

## Monitoring

### Firebase Console
1. Go to Firebase Console → Functions
2. View function execution logs
3. Monitor function health and performance
4. Check error rates

### Firestore Email Logs
Query the `email_logs` collection to:
- View all sent notifications
- Track delivery status
- Debug email issues
- Audit notification history

```typescript
// Query example
const emailLogs = await getDocs(
  query(
    collection(db, 'email_logs'),
    where('bookingId', '==', bookingId),
    orderBy('sentAt', 'desc')
  )
);
```

## Benefits

### For Customers
✅ Instant booking status updates without refreshing
✅ Real-time technician assignment notifications
✅ Live booking count badges (pending, confirmed, in-progress)
✅ Email notifications at every stage
✅ No missed updates

### For Technicians
✅ Real-time job assignments appear immediately
✅ Live job count updates
✅ Status change notifications
✅ Customer details instantly available
✅ Email alerts for important job updates

### For Admin
✅ Daily statistics automatically calculated
✅ Complete email audit trail
✅ Platform performance monitoring
✅ Automated notification system

## Future Enhancements

### 1. SMS Notifications
Integrate with Twilio or Africa's Talking for SMS:
```javascript
const africastalking = require('africastalking')({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: 'supremo-ac'
});

await africastalking.SMS.send({
  to: [booking.customerPhone],
  message: 'Your AC service is confirmed...'
});
```

### 2. Push Notifications
Add Firebase Cloud Messaging (FCM) for web/mobile push:
```javascript
await admin.messaging().send({
  notification: {
    title: 'Booking Confirmed',
    body: 'Your service has been confirmed'
  },
  token: userDeviceToken
});
```

### 3. WhatsApp Business API
Integrate WhatsApp for rich media notifications

### 4. In-App Notifications
Add notification bell with real-time updates

### 5. Notification Preferences
Let users choose notification channels (email, SMS, push, WhatsApp)

## Troubleshooting

### Real-time updates not working
1. Check browser console for Firestore errors
2. Verify Firebase Security Rules allow reads
3. Check user authentication status
4. Verify network connection

### Cloud Functions not triggering
1. Check Firebase Console → Functions logs
2. Verify functions are deployed: `firebase functions:list`
3. Check Firestore triggers are properly configured
4. Review function error logs

### Emails not sending
1. Check `email_logs` collection for entries
2. Verify email service integration (SendGrid/Mailgun)
3. Check API keys and configuration
4. Review function execution logs

## Support

For issues or questions:
- Check Firebase Console logs
- Review Firestore security rules
- Verify environment configuration
- Check network and authentication status
