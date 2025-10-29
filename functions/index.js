/**
 * Cloud Functions for Supremo AC Services
 * Handles backend operations like email notifications
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify/';

/**
 * Seed technician test data (server-side to bypass client security rule limits)
 */
const technicianSeedData = [
  {
    uid: 'tech_001',
    email: 'john.mensah@supremo.com',
    displayName: 'John Mensah',
    phoneNumber: '+233201234567',
    role: 'technician',
    metadata: {
      level: 'senior',
      yearsOfExperience: 6,
      skills: ['ac_installation', 'ac_repair', 'electrical', 'diagnostics'],
      certifications: [],
      primarySpecialization: 'ac_installation',
      isTeamLead: false,
      serviceAreas: ['Accra', 'Tema'],
      maxJobsPerDay: 8,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: [],
      totalJobsCompleted: 124,
      totalJobsAssigned: 130,
      averageRating: 4.7,
      firstTimeFixRate: 88.5,
      averageJobDuration: 3.2,
      hasVehicle: true,
      vehicleType: 'Van',
      hasToolKit: true,
      isEmergencyTechnician: true,
    },
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_002',
    email: 'kwame.osei@supremo.com',
    displayName: 'Kwame Osei',
    phoneNumber: '+233207654321',
    role: 'technician',
    metadata: {
      level: 'lead',
      yearsOfExperience: 9,
      skills: ['ac_installation', 'ac_repair', 'commercial_systems', 'ductwork', 'diagnostics', 'welding'],
      certifications: [],
      primarySpecialization: 'commercial_systems',
      isTeamLead: false,
      serviceAreas: ['Accra', 'Kumasi'],
      maxJobsPerDay: 6,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: [],
      totalJobsCompleted: 287,
      totalJobsAssigned: 295,
      averageRating: 4.9,
      firstTimeFixRate: 92.3,
      averageJobDuration: 4.5,
      hasVehicle: true,
      vehicleType: 'Truck',
      hasToolKit: true,
      isEmergencyTechnician: true,
    },
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_003',
    email: 'ama.boateng@supremo.com',
    displayName: 'Ama Boateng',
    phoneNumber: '+233245678901',
    role: 'technician',
    metadata: {
      level: 'technician',
      yearsOfExperience: 4,
      skills: ['ac_repair', 'preventive_maintenance', 'residential_systems', 'hvac_controls'],
      certifications: [],
      primarySpecialization: 'preventive_maintenance',
      isTeamLead: false,
      serviceAreas: ['Accra', 'Tema', 'Kasoa'],
      maxJobsPerDay: 10,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: ['job_001', 'job_002'],
      totalJobsCompleted: 89,
      totalJobsAssigned: 92,
      averageRating: 4.6,
      firstTimeFixRate: 85.2,
      averageJobDuration: 2.8,
      hasVehicle: true,
      vehicleType: 'Motorcycle',
      hasToolKit: true,
      isEmergencyTechnician: false,
    },
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_004',
    email: 'kofi.asante@supremo.com',
    displayName: 'Kofi Asante',
    phoneNumber: '+233209876543',
    role: 'technician',
    metadata: {
      level: 'junior',
      yearsOfExperience: 2,
      skills: ['ac_repair', 'preventive_maintenance', 'residential_systems'],
      certifications: [],
      primarySpecialization: 'ac_repair',
      isTeamLead: false,
      serviceAreas: ['Tema', 'Ashaiman'],
      maxJobsPerDay: 8,
      canWorkAlone: true,
      availabilityStatus: 'busy',
      currentJobIds: ['job_003', 'job_004', 'job_005', 'job_006', 'job_007', 'job_008'],
      totalJobsCompleted: 34,
      totalJobsAssigned: 38,
      averageRating: 4.3,
      firstTimeFixRate: 78.9,
      averageJobDuration: 3.5,
      hasVehicle: false,
      hasToolKit: true,
      isEmergencyTechnician: false,
    },
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_005',
    email: 'akosua.frimpong@supremo.com',
    displayName: 'Akosua Frimpong',
    phoneNumber: '+233241122334',
    role: 'technician',
    metadata: {
      level: 'senior',
      yearsOfExperience: 7,
      skills: ['refrigeration', 'ac_installation', 'diagnostics', 'commercial_systems'],
      certifications: [],
      primarySpecialization: 'refrigeration',
      isTeamLead: false,
      serviceAreas: ['Accra', 'Tema'],
      maxJobsPerDay: 7,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: ['job_009'],
      totalJobsCompleted: 156,
      totalJobsAssigned: 162,
      averageRating: 4.8,
      firstTimeFixRate: 90.1,
      averageJobDuration: 3.7,
      hasVehicle: true,
      vehicleType: 'Van',
      hasToolKit: true,
      isEmergencyTechnician: true,
    },
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
];

exports.seedTechnicians = functions
  .region('europe-west1')
  .https.onCall(async (_data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
    }

    const firestore = admin.firestore();
    const batch = firestore.batch();

    technicianSeedData.forEach((technician) => {
      const docRef = firestore.doc(`users/${technician.uid}`);
      batch.set(
        docRef,
        {
          ...technician,
          metadata: {
            ...technician.metadata,
            teamId: technician.metadata.teamId || null,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();

    return {
      success: true,
      count: technicianSeedData.length,
    };
  });

/**
 * Verify Paystack payment and update related order
 */
exports.verifyPaystackPayment = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    const { reference, orderId } = data || {};

    if (!reference || !orderId) {
      throw new functions.https.HttpsError('invalid-argument', 'reference and orderId are required.');
    }

    const secretKey = functions.config().paystack && functions.config().paystack.secret;
    if (!secretKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Paystack secret key not configured. Run: firebase functions:config:set paystack.secret="YOUR_SECRET_KEY"'
      );
    }

    const firestore = admin.firestore();
    const orderRef = firestore.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found.');
    }

    const orderData = orderSnap.data();
    const isAdmin = context.auth?.token?.role === 'admin';
    const isOwner = context.auth && orderData.customerId === context.auth.uid;

    if (context.auth && !isOwner && !isAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'You do not have access to this order.');
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Paystack verify failed: ${response.status} ${errorText}`);
      }

      const payload = await response.json();
      const paystackData = payload?.data;

      if (!payload?.status || !paystackData || paystackData.status !== 'success') {
        throw new Error('Payment not successful or still pending confirmation.');
      }

      const metadata = paystackData.metadata || {};
      if (metadata.orderId && metadata.orderId !== orderId) {
        throw new Error('Paystack metadata order mismatch.');
      }

      const paidAtDate = paystackData.paid_at ? new Date(paystackData.paid_at) : null;
      const transactionEntry = {
        gateway: 'paystack',
        reference,
        status: paystackData.status,
        channel: paystackData.channel,
        currency: paystackData.currency,
        amount: typeof paystackData.amount === 'number' ? paystackData.amount / 100 : null,
        paidAt: paystackData.paid_at || null,
        createdAt: paystackData.created_at || null,
      };

      const updates = {
        paymentStatus: 'paid',
        paymentReference: reference,
        paymentGateway: 'paystack',
        paidAt: paidAtDate
          ? admin.firestore.Timestamp.fromDate(paidAtDate)
          : admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        transactions: admin.firestore.FieldValue.arrayUnion(transactionEntry),
      };

      if (orderData.orderStatus === 'pending-payment') {
        updates.orderStatus = 'payment-confirmed';
      }

      await orderRef.update(updates);

      return {
        success: true,
        orderId,
        reference,
        amount: transactionEntry.amount,
      };
    } catch (error) {
      console.error('Paystack verification failed:', error);
      throw new functions.https.HttpsError('internal', error.message || 'Unable to verify payment.');
    }
  });

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
 * Send comprehensive completion notification with service report
 * Includes: service details, technician report, photos, final cost breakdown
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
        // Format date for display
        const completedDate = after.completedAt
          ? after.completedAt.toDate().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Just now';

        // Build photo gallery section
        let photoGalleryHtml = '';
        if (after.photoUrls && after.photoUrls.length > 0) {
          photoGalleryHtml = `
            <h3 style="color: #2563eb; margin-top: 30px; margin-bottom: 15px;">📸 Service Photos</h3>
            <p style="color: #64748b; margin-bottom: 15px;">Before and after photos from your service:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
              ${after.photoUrls.map((url, index) => `
                <div style="border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <img src="${url}" alt="Service photo ${index + 1}" style="width: 100%; height: 200px; object-fit: cover;" />
                  <p style="text-align: center; padding: 8px; background: #f1f5f9; margin: 0; font-size: 12px;">Photo ${index + 1}</p>
                </div>
              `).join('')}
            </div>
          `;
        }

        // Build service report section
        let serviceReportHtml = '';
        if (after.serviceReport && after.serviceReport.trim()) {
          serviceReportHtml = `
            <h3 style="color: #2563eb; margin-top: 30px; margin-bottom: 15px;">📋 Technician's Service Report</h3>
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #334155; white-space: pre-wrap; line-height: 1.6; margin: 0;">${after.serviceReport}</p>
            </div>
          `;
        }

        // Build cost breakdown
        const estimatedCost = after.estimatedCost || 0;
        const finalCost = after.finalCost || estimatedCost;
        const costDifference = finalCost - estimatedCost;
        const costDifferenceText = costDifference > 0
          ? `<span style="color: #dc2626;">+GHS ${costDifference.toFixed(2)}</span>`
          : costDifference < 0
          ? `<span style="color: #16a34a;">-GHS ${Math.abs(costDifference).toFixed(2)}</span>`
          : '<span style="color: #64748b;">No change</span>';

        // Create HTML email body
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">✅ Service Completed!</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Supremo AC Services</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">

      <!-- Greeting -->
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Dear <strong>${after.customerName}</strong>,
      </p>

      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Your HVAC service has been completed successfully! Here's a comprehensive summary of the work performed:
      </p>

      <!-- Service Details -->
      <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">🛠️ Service Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 40%;">Service Type:</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${after.serviceType || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Service Package:</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${after.servicePackage || 'Standard'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Completed On:</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${completedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Location:</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${after.address || 'N/A'}, ${after.city || ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Booking ID:</td>
            <td style="padding: 8px 0; color: #1e293b; font-family: monospace; font-size: 14px;">${bookingId}</td>
          </tr>
        </table>
      </div>

      <!-- Technician Info -->
      ${after.technicianName ? `
      <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #bae6fd;">
        <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 18px;">👨‍🔧 Technician</h3>
        <p style="color: #0c4a6e; margin: 0; font-weight: 600; font-size: 16px;">${after.technicianName}</p>
        ${after.technicianPhone ? `<p style="color: #0369a1; margin: 5px 0 0 0;">📞 ${after.technicianPhone}</p>` : ''}
        ${after.technicianEmail ? `<p style="color: #0369a1; margin: 5px 0 0 0;">✉️ ${after.technicianEmail}</p>` : ''}
      </div>
      ` : ''}

      <!-- Service Report -->
      ${serviceReportHtml}

      <!-- Photo Gallery -->
      ${photoGalleryHtml}

      <!-- Cost Breakdown -->
      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-top: 30px; border: 2px solid #86efac;">
        <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 18px;">💰 Cost Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #166534;">Estimated Cost:</td>
            <td style="padding: 8px 0; color: #166534; text-align: right;">GHS ${estimatedCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #166534;">Cost Adjustment:</td>
            <td style="padding: 8px 0; text-align: right;">${costDifferenceText}</td>
          </tr>
          <tr style="border-top: 2px solid #86efac;">
            <td style="padding: 12px 0; color: #15803d; font-weight: 700; font-size: 18px;">Total Cost:</td>
            <td style="padding: 12px 0; color: #15803d; font-weight: 700; text-align: right; font-size: 18px;">GHS ${finalCost.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Call to Action -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 25px; margin-top: 30px; text-align: center;">
        <p style="color: #92400e; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">⭐ How was your experience?</p>
        <p style="color: #78350f; margin: 0 0 20px 0; font-size: 14px;">We'd love to hear your feedback! Please take a moment to rate your service.</p>
        <a href="https://supremo-ac-services.web.app/dashboard/customer"
           style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Rate Your Service
        </a>
      </div>

      <!-- Footer Message -->
      <div style="margin-top: 30px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
          If you have any questions about the service or need further assistance, please don't hesitate to contact us.
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0;">
          Thank you for choosing <strong>Supremo AC Services</strong> for your HVAC needs!
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
        <strong>Supremo AC Services</strong>
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Quality HVAC Services in Ghana • Accra, Ghana
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
        📧 support@supremo-ac.com • 📞 +233 XX XXX XXXX
      </p>
    </div>

  </div>
</body>
</html>
        `;

        // Plain text fallback
        const plainTextBody = `
Dear ${after.customerName},

Your HVAC service has been completed successfully!

SERVICE DETAILS
===============
Service Type: ${after.serviceType || 'N/A'}
Service Package: ${after.servicePackage || 'Standard'}
Completed On: ${completedDate}
Location: ${after.address || 'N/A'}, ${after.city || ''}
Booking ID: ${bookingId}

${after.technicianName ? `
TECHNICIAN
==========
Name: ${after.technicianName}
${after.technicianPhone ? `Phone: ${after.technicianPhone}` : ''}
${after.technicianEmail ? `Email: ${after.technicianEmail}` : ''}
` : ''}

${after.serviceReport ? `
TECHNICIAN'S SERVICE REPORT
===========================
${after.serviceReport}
` : ''}

${after.photoUrls && after.photoUrls.length > 0 ? `
SERVICE PHOTOS
==============
${after.photoUrls.length} photo(s) attached
View photos in your customer dashboard: https://supremo-ac-services.web.app/dashboard/customer
` : ''}

COST BREAKDOWN
==============
Estimated Cost: GHS ${estimatedCost.toFixed(2)}
Final Cost: GHS ${finalCost.toFixed(2)}
${costDifference !== 0 ? `Difference: GHS ${costDifference.toFixed(2)}` : ''}

HOW WAS YOUR EXPERIENCE?
========================
We'd love to hear your feedback! Please rate your service:
https://supremo-ac-services.web.app/dashboard/customer

If you have any questions, please contact us.

Thank you for choosing Supremo AC Services!

Best regards,
Supremo AC Services Team
support@supremo-ac.com
+233 XX XXX XXXX
        `.trim();

        // Store email in Firestore for Firebase Extension to process
        // Or send via email service (SendGrid, Mailgun, etc.)
        const emailDocument = {
          to: after.customerEmail,
          from: 'Supremo AC Services <noreply@supremo-ac-services.web.app>',
          replyTo: 'support@supremo-ac.com',
          subject: `✅ Service Completed - ${after.serviceType} | Booking ${bookingId.substring(0, 8)}`,
          html: htmlBody,
          text: plainTextBody,
          bookingId,
          customerId: after.customerId,
          type: 'booking_completed',
          metadata: {
            technicianName: after.technicianName || null,
            serviceType: after.serviceType,
            finalCost: finalCost,
            hasPhotos: (after.photoUrls && after.photoUrls.length > 0),
            hasServiceReport: !!(after.serviceReport && after.serviceReport.trim()),
            completedAt: after.completedAt || admin.firestore.FieldValue.serverTimestamp()
          },
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending', // Will be updated to 'sent' by email service
          delivery: {
            startTime: admin.firestore.FieldValue.serverTimestamp(),
            state: 'PENDING',
            attempts: 0,
            error: null
          }
        };

        console.log('📧 Booking completion email prepared:', {
          to: emailDocument.to,
          subject: emailDocument.subject,
          bookingId,
          hasPhotos: emailDocument.metadata.hasPhotos,
          hasReport: emailDocument.metadata.hasServiceReport
        });

        // Store in email collection (can be processed by Firebase Extension or custom email service)
        await admin.firestore().collection('emails').add(emailDocument);

        console.log('✅ Email document created in Firestore for processing');

        return { success: true, bookingId, emailQueued: true };
      } catch (error) {
        console.error('❌ Error preparing completion email:', error);
        return { success: false, error: error.message };
      }
    }

    return null;
  });

/**
 * Send notification when booking status changes
 */
exports.onBookingStatusChange = functions
  .region('europe-west1')
  .firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;

    // Check if status changed
    if (before.status !== after.status) {
      try {
        const statusMessages = {
          'pending': 'Your booking has been received and is pending confirmation.',
          'confirmed': 'Your booking has been confirmed! We will notify you when a technician is assigned.',
          'in-progress': 'Your service is now in progress. Our technician is on the way or working on your AC.',
          'completed': 'Your service has been completed successfully!',
          'cancelled': 'Your booking has been cancelled.'
        };

        const emailData = {
          to: after.customerEmail,
          subject: `Booking Status Update - ${after.serviceType}`,
          body: `
            Dear ${after.customerName},

            Your booking status has been updated.

            New Status: ${after.status.toUpperCase()}
            ${statusMessages[after.status] || ''}

            Service: ${after.serviceType}
            Booking ID: ${bookingId}
            ${after.technicianName ? `Technician: ${after.technicianName}` : ''}

            You can track your booking in real-time on your dashboard.

            Best regards,
            Supremo AC Services Team
          `
        };

        console.log('Status change notification:', emailData);

        await admin.firestore().collection('email_logs').add({
          ...emailData,
          bookingId,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
          type: 'status_change'
        });

        // Also notify technician if status changed to 'in-progress' or 'completed'
        if ((after.status === 'in-progress' || after.status === 'completed') && after.technicianEmail) {
          const techEmailData = {
            to: after.technicianEmail,
            subject: `Job Status Update - ${after.serviceType}`,
            body: `
              Hi ${after.technicianName},

              Job status has been updated to: ${after.status.toUpperCase()}

              Customer: ${after.customerName}
              Location: ${after.address}, ${after.city}
              Booking ID: ${bookingId}

              Please update the customer on your progress.

              Best regards,
              Supremo AC Services Team
            `
          };

          await admin.firestore().collection('email_logs').add({
            ...techEmailData,
            bookingId,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            type: 'technician_update'
          });
        }

        return { success: true };
      } catch (error) {
        console.error('Error sending status change notification:', error);
        return { success: false, error: error.message };
      }
    }

    return null;
  });

/**
 * Send email notification when order status changes
 */
exports.onOrderStatusChange = functions
  .region('europe-west1')
  .firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // Check if status changed
    if (before.orderStatus !== after.orderStatus) {
      try {
        const statusMessages = {
          'pending-payment': 'Your order is awaiting payment confirmation.',
          'payment-confirmed': 'Payment confirmed! Your order is being prepared.',
          'processing': 'Your order is being processed and will be shipped soon.',
          'shipped': `Your order has been shipped! Tracking: ${after.trackingNumber || 'Available soon'}`,
          'delivered': 'Your order has been delivered! Thank you for shopping with us.',
          'cancelled': 'Your order has been cancelled.',
          'refunded': 'Your order has been refunded.',
          'failed': 'There was an issue with your order. Please contact support.'
        };

        const emailData = {
          to: after.customerEmail,
          subject: `Order ${after.orderNumber} - Status Update`,
          body: `
            Dear ${after.customerName},

            Your order status has been updated.

            Order Number: ${after.orderNumber}
            New Status: ${after.orderStatus.toUpperCase().replace(/-/g, ' ')}

            ${statusMessages[after.orderStatus] || ''}

            Order Total: GH₵ ${after.totalAmount.toFixed(2)}
            ${after.trackingNumber ? `\nTracking Number: ${after.trackingNumber}` : ''}
            ${after.estimatedDelivery ? `\nEstimated Delivery: ${after.estimatedDelivery.toDate().toLocaleDateString()}` : ''}

            You can view your order details at:
            https://supremo-ac.web.app/orders/${orderId}

            If you have any questions, please contact our support team.

            Best regards,
            Supremo AC Services Team
          `
        };

        console.log('Order status change email:', emailData);

        await admin.firestore().collection('email_logs').add({
          ...emailData,
          orderId,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
          type: 'order_status_change'
        });

        return { success: true };
      } catch (error) {
        console.error('Error sending order status change email:', error);
        return { success: false, error: error.message };
      }
    }

    return null;
  });

/**
 * Send email notification when order is created
 */
exports.onOrderCreated = functions
  .region('europe-west1')
  .firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const order = snapshot.data();
    const orderId = context.params.orderId;

    try {
      const itemsList = order.items.map(item =>
        `- ${item.productName} (Qty: ${item.quantity}) - GH₵ ${item.subtotal.toFixed(2)}`
      ).join('\n            ');

      const emailData = {
        to: order.customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        body: `
          Dear ${order.customerName},

          Thank you for your order with Supremo AC Services!

          Order Number: ${order.orderNumber}
          Order Date: ${order.createdAt.toDate().toLocaleDateString()}

          Items Ordered:
            ${itemsList}

          Subtotal: GH₵ ${order.itemsTotal.toFixed(2)}
          ${order.installationFee ? `Installation Fee: GH₵ ${order.installationFee.toFixed(2)}` : ''}
          Shipping Fee: GH₵ ${order.shippingFee.toFixed(2)}
          ─────────────────────────────
          Total Amount: GH₵ ${order.totalAmount.toFixed(2)}

          Shipping Address:
          ${order.shippingAddress.fullName}
          ${order.shippingAddress.address}
          ${order.shippingAddress.city}, ${order.shippingAddress.region}
          Phone: ${order.shippingAddress.phone}

          Payment Method: ${order.paymentMethod.replace(/-/g, ' ').toUpperCase()}

          You will receive updates as your order is processed and shipped.
          View your order: https://supremo-ac.web.app/orders/${orderId}

          Thank you for choosing Supremo AC Services!

          Best regards,
          Supremo AC Services Team
        `
      };

      console.log('Order confirmation email:', emailData);

      await admin.firestore().collection('email_logs').add({
        ...emailData,
        orderId,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        type: 'order_created'
      });

      return { success: true, orderId };
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * ⚡ PERFORMANCE OPTIMIZATION: Custom Claims
 * Set custom claims when user profile is created
 * This eliminates Firestore lookups in security rules (10-100x faster!)
 *
 * How it works:
 * 1. User registers → User doc created in Firestore
 * 2. This function triggers → Sets custom claims on Auth user
 * 3. Security rules read claims from token (instant, no DB query!)
 *
 * Benefits:
 * - Firestore reads reduced by ~50% (security rule checks are free)
 * - No race conditions (claims are always available)
 * - Faster permission checks (microseconds vs milliseconds)
 */
exports.setUserClaims = functions
  .region('europe-west1')
  .firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, context) => {
    const userData = snapshot.data();
    const userId = context.params.userId;

    try {
      // Set custom claims on Firebase Auth user
      await admin.auth().setCustomUserClaims(userId, {
        role: userData.role || 'customer', // Default to customer if not specified
        isApproved: userData.isApproved || false,
        isActive: userData.isActive || true
      });

      console.log(`✅ Custom claims set for user ${userId}:`, {
        role: userData.role,
        isApproved: userData.isApproved,
        isActive: userData.isActive
      });

      // Optional: Store a flag in Firestore to track claim updates
      await snapshot.ref.update({
        claimsLastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, userId, claims: { role: userData.role, isApproved: userData.isApproved } };
    } catch (error) {
      console.error(`❌ Error setting custom claims for user ${userId}:`, error);
      return { success: false, error: error.message };
    }
  });

/**
 * ⚡ PERFORMANCE OPTIMIZATION: Update Custom Claims
 * Update custom claims when user profile is updated
 *
 * Triggers when:
 * - Admin approves a user (isApproved: false → true)
 * - Admin changes user role (customer → admin)
 * - User is deactivated (isActive: true → false)
 */
exports.updateUserClaims = functions
  .region('europe-west1')
  .firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    // Check if relevant fields changed
    const roleChanged = before.role !== after.role;
    const approvalChanged = before.isApproved !== after.isApproved;
    const activeChanged = before.isActive !== after.isActive;

    if (roleChanged || approvalChanged || activeChanged) {
      try {
        // Update custom claims
        await admin.auth().setCustomUserClaims(userId, {
          role: after.role,
          isApproved: after.isApproved || false,
          isActive: after.isActive || true
        });

        console.log(`✅ Custom claims updated for user ${userId}:`, {
          changes: {
            role: roleChanged ? `${before.role} → ${after.role}` : 'unchanged',
            isApproved: approvalChanged ? `${before.isApproved} → ${after.isApproved}` : 'unchanged',
            isActive: activeChanged ? `${before.isActive} → ${after.isActive}` : 'unchanged'
          }
        });

        // Update timestamp
        await change.after.ref.update({
          claimsLastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, userId, updated: { roleChanged, approvalChanged, activeChanged } };
      } catch (error) {
        console.error(`❌ Error updating custom claims for user ${userId}:`, error);
        return { success: false, error: error.message };
      }
    }

    return null; // No relevant changes
  });

/**
 * 🔧 UTILITY: Force refresh custom claims for a user (callable function)
 * Can be called from client when user logs in and claims seem outdated
 *
 * Usage from client:
 * const refreshClaims = httpsCallable(functions, 'refreshUserClaims');
 * await refreshClaims({ userId: auth.currentUser.uid });
 */
exports.refreshUserClaims = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = data.userId || context.auth.uid;

    // Only allow users to refresh their own claims (unless admin)
    if (userId !== context.auth.uid && context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Can only refresh own claims');
    }

    try {
      // Fetch user profile from Firestore
      const userDoc = await admin.firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found');
      }

      const userData = userDoc.data();

      // Set custom claims
      await admin.auth().setCustomUserClaims(userId, {
        role: userData.role,
        isApproved: userData.isApproved || false,
        isActive: userData.isActive || true
      });

      console.log(`✅ Claims refreshed for user ${userId}`);

      return {
        success: true,
        message: 'Claims refreshed successfully. Please sign out and sign in again to apply changes.',
        claims: {
          role: userData.role,
          isApproved: userData.isApproved,
          isActive: userData.isActive
        }
      };
    } catch (error) {
      console.error(`❌ Error refreshing claims for user ${userId}:`, error);
      throw new functions.https.HttpsError('internal', error.message);
    }
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

      // Count orders created today
      const ordersSnapshot = await admin.firestore()
        .collection('orders')
        .where('createdAt', '>=', today)
        .get();

      // Store stats
      await admin.firestore().collection('daily_stats').add({
        date: admin.firestore.FieldValue.serverTimestamp(),
        totalBookings: bookingsSnapshot.size,
        completedBookings: completedBookings,
        totalOrders: ordersSnapshot.size,
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
