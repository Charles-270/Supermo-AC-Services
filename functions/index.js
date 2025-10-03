/**
 * Cloud Functions for Supremo AC Services
 * Handles backend operations like email notifications
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Send booking confirmation email when a new booking is created
 */
exports.onBookingCreated = functions
  .region('europe-west1') // Closest to Ghana
  .firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snapshot, context) => {
    const booking = snapshot.data();
    const bookingId = context.params.bookingId;

    try {
      // In production, integrate with email service (SendGrid, Mailgun, etc.)
      // For now, we'll just log the email details

      const emailData = {
        to: booking.customerEmail,
        subject: `Booking Confirmation - ${booking.serviceType}`,
        body: `
          Dear ${booking.customerName},

          Thank you for booking with Supremo AC Services!

          Booking Details:
          - Service: ${booking.serviceType}
          - Date: ${booking.preferredDate.toDate().toLocaleDateString()}
          - Time: ${booking.preferredTimeSlot}
          - Location: ${booking.address}, ${booking.city}
          - Booking ID: ${bookingId}

          We will assign a technician shortly and send you an update.

          If you have any questions, please contact us.

          Best regards,
          Supremo AC Services Team
        `
      };

      // Log email (in production, send actual email)
      console.log('Booking confirmation email:', emailData);

      // Store email log in Firestore
      await admin.firestore().collection('email_logs').add({
        ...emailData,
        bookingId,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending' // would be 'sent' after actual sending
      });

      return { success: true, bookingId };
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Send notification when technician is assigned
 */
exports.onTechnicianAssigned = functions
  .region('europe-west1')
  .firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;

    // Check if technician was just assigned
    if (!before.technicianId && after.technicianId) {
      try {
        const emailData = {
          to: after.customerEmail,
          subject: 'Technician Assigned to Your Booking',
          body: `
            Dear ${after.customerName},

            Great news! A technician has been assigned to your booking.

            Technician: ${after.technicianName}
            Service: ${after.serviceType}
            Scheduled Date: ${after.preferredDate.toDate().toLocaleDateString()}
            Time: ${after.preferredTimeSlot}

            Your technician will arrive at the scheduled time.

            Booking ID: ${bookingId}

            Best regards,
            Supremo AC Services Team
          `
        };

        console.log('Technician assignment email:', emailData);

        await admin.firestore().collection('email_logs').add({
          ...emailData,
          bookingId,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });

        return { success: true };
      } catch (error) {
        console.error('Error sending technician assignment email:', error);
        return { success: false, error: error.message };
      }
    }

    return null;
  });

/**
 * Send completion confirmation and request review
 */
exports.onBookingCompleted = functions
  .region('europe-west1')
  .firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;

    // Check if booking was just completed
    if (before.status !== 'completed' && after.status === 'completed') {
      try {
        const emailData = {
          to: after.customerEmail,
          subject: 'Service Completed - Please Rate Your Experience',
          body: `
            Dear ${after.customerName},

            Your service has been completed successfully!

            Service: ${after.serviceType}
            Technician: ${after.technicianName || 'N/A'}
            Final Cost: GHS ${after.finalCost || 'To be determined'}

            We would love to hear about your experience! Please take a moment to rate our service.

            Thank you for choosing Supremo AC Services!

            Best regards,
            Supremo AC Services Team
          `
        };

        console.log('Booking completion email:', emailData);

        await admin.firestore().collection('email_logs').add({
          ...emailData,
          bookingId,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });

        return { success: true };
      } catch (error) {
        console.error('Error sending completion email:', error);
        return { success: false, error: error.message };
      }
    }

    return null;
  });

/**
 * Calculate platform statistics (runs daily)
 */
exports.calculateDailyStats = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 0 * * *') // Every day at midnight
  .timeZone('Africa/Accra')
  .onRun(async (context) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count bookings created today
      const bookingsSnapshot = await admin.firestore()
        .collection('bookings')
        .where('createdAt', '>=', today)
        .get();

      // Count completed bookings today
      const completedBookings = bookingsSnapshot.docs.filter(
        doc => doc.data().status === 'completed'
      ).length;

      // Store stats
      await admin.firestore().collection('daily_stats').add({
        date: admin.firestore.FieldValue.serverTimestamp(),
        totalBookings: bookingsSnapshot.size,
        completedBookings,
        pendingBookings: bookingsSnapshot.docs.filter(
          doc => doc.data().status === 'pending'
        ).length
      });

      console.log('Daily stats calculated:', {
        date: today,
        totalBookings: bookingsSnapshot.size,
        completedBookings
      });

      return { success: true };
    } catch (error) {
      console.error('Error calculating daily stats:', error);
      return { success: false, error: error.message };
    }
  });
