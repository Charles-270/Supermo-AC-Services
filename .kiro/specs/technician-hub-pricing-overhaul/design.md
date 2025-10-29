# Design Document

## Overview

This design document outlines the comprehensive overhaul of the Technician Hub and the platform's pricing system. The redesign addresses critical functionality issues in the current Technician Dashboard, replaces the legacy SERVICE_PACKAGES model with a unified Service Catalog, and implements a modern, accessible interface using the Supplier Dashboard visual language.

### Design Goals

1. **Fix Critical Issues**: Audit and resolve all P0/P1 functionality issues in the current Technician Dashboard
2. **Unified Pricing**: Replace SERVICE_PACKAGES with a centralized Service Catalog managed by admins
3. **Consistent UX**: Apply Supplier Dashboard visual language (cards, shadows, Inter font, WCAG AA)
4. **Transparent Earnings**: Implement 90/10 split with clear visibility for technicians
5. **Price Change Communication**: One-time notifications when prices update
6. **Backward Compatibility**: Additive changes only, no breaking existing endpoints

### Key Principles

- **Mobile-First**: Technicians work in the field, mobile is primary
- **Accessibility**: WCAG AA compliance, Lighthouse score ≥ 90
- **Simplicity**: Clear actions, minimal cognitive load
- **Transparency**: Show pricing, earnings, and splits clearly
- **Reliability**: Real-time updates, offline-friendly where possible

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Settings                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Service Pricing UI                                   │  │
│  │  - Edit Installation/Maintenance/Repair/Inspection    │  │
│  │  - Creates new ServiceCatalog versions                │  │
│  │  - Triggers price change notifications                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Catalog (Firestore)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  serviceCatalog collection                            │  │
│  │  - code, name, basePrice, currency                    │  │
│  │  - effectiveFrom, effectiveTo, isActive               │  │
│  │  - updatedBy, updatedAt, changeId                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│  Customer Book Service   │   │   Technician Hub         │
│  - Reads current prices  │   │   - Views job prices     │
│  - Captures priceAtBook  │   │   - Sees 90% earnings    │
│  - Creates booking       │   │   - Receives alerts      │
└──────────────────────────┘   └──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Bookings (Firestore)                      │
│  - serviceCode, priceAtBooking (snapshot)                   │
│  - technicianId, status, completion details                 │
└─────────────────────────────────────────────────────────────┘
                │
                ▼ (on completion)
┌─────────────────────────────────────────────────────────────┐
│              Earnings & Revenue Ledgers                     │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ TechnicianEarning    │  │  PlatformRevenue         │   │
│  │ - techShare (90%)    │  │  - platformShare (10%)   │   │
│  │ - status: pending    │  │  - createdAt             │   │
│  └──────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Admin Updates Pricing** → Creates new ServiceCatalog versions → Generates changeId
2. **Notification Fanout** → Sends one-time alerts to technicians and customers
3. **Customer Books** → Reads current catalog → Captures priceAtBooking snapshot
4. **Job Completion** → Creates TechnicianEarning (90%) + PlatformRevenue (10%)
5. **Technician Views** → Sees earnings from priceAtBooking, not current prices


## Components and Interfaces

### 1. Audit Report Structure

The audit will be delivered as a written document categorizing issues:

**P0 (Critical - Blocks Core Functionality)**
- Non-functional buttons/actions that prevent job completion
- Data integrity issues (missing earnings, incorrect calculations)
- Navigation failures that trap users

**P1 (High Priority - Degrades Experience)**
- Broken job workflow steps (Accept/Start/Upload/Complete)
- Earnings display showing SERVICE_PACKAGES instead of actual prices
- Missing or incorrect status updates

**P2 (Medium Priority - Polish Issues)**
- Responsive design issues (overflows, small tap targets)
- Accessibility violations (contrast, focus management, labels)
- Console warnings and errors

**Audit Deliverable Format:**
```markdown
# Technician Dashboard Audit Report

## P0 Issues
1. [Issue]: Description
   - Expected: What should happen
   - Actual: What currently happens
   - Location: File/component path
   - Fix: Proposed solution

## P1 Issues
...

## P2 Issues
...

## Summary
- Total issues: X
- Estimated fix effort: Y hours
```

### 2. Technician Hub - UI Components

#### A. Overview Screen (`TechnicianOverview.tsx`)

**Layout Structure:**
```tsx
<TechnicianLayout>
  <Header>
    <Title>Dashboard Overview</Title>
    <Subtitle>Welcome back, {technicianName}</Subtitle>
  </Header>

  {/* Stats Cards - 4 columns on desktop, 2 on tablet, 1 on mobile */}
  <StatsGrid>
    <StatCard icon={Calendar} label="Today's Jobs" value={todayCount} />
    <StatCard icon={Clock} label="This Week" value={weekCount} />
    <StatCard icon={DollarSign} label="This Month Earnings" value={monthEarnings} />
    <StatCard icon={Wallet} label="Pending Payout" value={pendingAmount} />
  </StatsGrid>

  {/* Alerts Banner */}
  {alerts.length > 0 && (
    <AlertsBanner alerts={alerts} onDismiss={handleDismiss} />
  )}

  {/* Today's Jobs - Kanban or List View */}
  <JobsSection>
    <SectionHeader>
      <Title>Today's Jobs</Title>
      <ViewToggle value={view} onChange={setView} /> {/* List/Kanban */}
    </SectionHeader>
    
    {view === 'kanban' ? (
      <KanbanBoard>
        <Column status="new" jobs={newJobs} />
        <Column status="in_progress" jobs={inProgressJobs} />
        <Column status="completed" jobs={completedJobs} />
      </KanbanBoard>
    ) : (
      <JobsList jobs={todayJobs} onAction={handleJobAction} />
    )}
  </JobsSection>

  {/* Next 7 Days Mini Schedule */}
  <MiniSchedule>
    <SectionHeader>Upcoming Schedule</SectionHeader>
    <WeekView jobs={upcomingJobs} />
  </MiniSchedule>
</TechnicianLayout>
```

**Visual Design:**
- Cards: `rounded-xl`, `shadow-sm`, `border border-gray-200`
- Spacing: `gap-4` (16px) between cards, `gap-6` (24px) between sections
- Typography: Inter font, `text-2xl font-bold` for headers, `text-sm text-gray-600` for labels
- Colors: Blue primary (#2563eb), Green success (#16a34a), Yellow warning (#eab308)
- Icons: Lucide icons, 20px (h-5 w-5) for inline, 24px (h-6 w-6) for cards

**Responsive Breakpoints:**
- sm: ≤ 640px (mobile) - Single column, cards stack
- md: 641-1024px (tablet) - 2 columns for stats
- lg: 1025-1440px (desktop) - 4 columns for stats
- xl: ≥ 1441px (large desktop) - Max width container


#### B. Jobs List & Job Details (`TechnicianJobs.tsx`, `JobDetailsDialog.tsx`)

**Jobs List Component:**
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>My Jobs</CardTitle>
        <CardDescription>Manage your assigned jobs</CardDescription>
      </div>
      <FilterDropdown value={filter} onChange={setFilter} />
    </div>
  </CardHeader>
  
  <CardContent>
    {/* Desktop: Table View */}
    <Table className="hidden md:table">
      <TableHeader>
        <TableRow>
          <TableHead>JOB ID</TableHead>
          <TableHead>SERVICE</TableHead>
          <TableHead>CUSTOMER</TableHead>
          <TableHead>DATE & TIME</TableHead>
          <TableHead>PRICE</TableHead>
          <TableHead>STATUS</TableHead>
          <TableHead>ACTIONS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map(job => (
          <JobRow key={job.id} job={job} onAction={handleAction} />
        ))}
      </TableBody>
    </Table>

    {/* Mobile: Card View */}
    <div className="md:hidden space-y-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} onAction={handleAction} />
      ))}
    </div>
  </CardContent>
</Card>
```

**Job Details Dialog:**
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Job Details</DialogTitle>
      <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
    </DialogHeader>

    <div className="space-y-6">
      {/* Service Info */}
      <Section>
        <SectionTitle>Service Information</SectionTitle>
        <InfoGrid>
          <InfoItem label="Service Type" value={job.serviceCode} />
          <InfoItem label="Price" value={formatCurrency(job.priceAtBooking)} />
          <InfoItem label="Your Earnings" value={formatCurrency(job.priceAtBooking * 0.9)} />
        </InfoGrid>
      </Section>

      {/* Customer Info */}
      <Section>
        <SectionTitle>Customer Details</SectionTitle>
        <InfoGrid>
          <InfoItem label="Name" value={job.customerName} />
          <InfoItem label="Phone" value={job.customerPhone} />
          <InfoItem label="Address" value={job.address} />
          {job.locationNotes && (
            <InfoItem label="Notes" value={job.locationNotes} />
          )}
        </InfoGrid>
        {job.address && (
          <Button variant="outline" onClick={() => openMap(job.address)}>
            <MapPin className="mr-2 h-4 w-4" />
            Open in Maps
          </Button>
        )}
      </Section>

      {/* Schedule Info */}
      <Section>
        <SectionTitle>Schedule</SectionTitle>
        <InfoGrid>
          <InfoItem label="Date" value={formatDate(job.preferredDate)} />
          <InfoItem label="Time Slot" value={job.preferredTimeSlot} />
        </InfoGrid>
      </Section>

      {/* Status Actions */}
      <Section>
        <StatusFlow currentStatus={job.status} onStatusChange={handleStatusChange} />
      </Section>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Close</Button>
      {getActionButton(job.status)}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Job Status Flow:**
- Assigned → Accepted (optional) → In Progress → Completed
- Each status has specific actions:
  - Assigned: "Accept Job", "View Details"
  - Accepted: "Start Job", "View Details"
  - In Progress: "Upload Photos", "Add Notes", "Complete Job"
  - Completed: "View Receipt", "View Details"

**Completion Form:**
```tsx
<CompletionForm onSubmit={handleComplete}>
  <FormField>
    <Label>Work Summary</Label>
    <Textarea 
      placeholder="Describe the work completed..."
      required
    />
  </FormField>

  <FormField>
    <Label>Photos (up to 5)</Label>
    <ImageUpload 
      maxFiles={5}
      accept="image/*"
      onUpload={handlePhotoUpload}
    />
  </FormField>

  <FormField>
    <Label>Parts Used (Optional)</Label>
    <PartsInput 
      parts={parts}
      onAdd={handleAddPart}
      onRemove={handleRemovePart}
    />
  </FormField>

  <FormField>
    <Checkbox 
      id="customer-present"
      checked={customerPresent}
      onCheckedChange={setCustomerPresent}
    />
    <Label htmlFor="customer-present">Customer was present</Label>
  </FormField>

  <Button type="submit" disabled={submitting}>
    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    Complete Job
  </Button>
</CompletionForm>
```


#### C. Earnings View (`TechnicianEarnings.tsx`)

**Layout Structure:**
```tsx
<TechnicianLayout>
  <Header>
    <Title>My Earnings</Title>
    <Subtitle>Track your income and payments</Subtitle>
  </Header>

  {/* Summary Cards */}
  <SummaryGrid>
    <EarningsCard 
      label="This Month"
      amount={thisMonthEarnings}
      change={monthOverMonthChange}
      icon={TrendingUp}
    />
    <EarningsCard 
      label="Last Month"
      amount={lastMonthEarnings}
      icon={Calendar}
    />
    <EarningsCard 
      label="Lifetime"
      amount={lifetimeEarnings}
      icon={Award}
    />
    <EarningsCard 
      label="Pending Payout"
      amount={pendingEarnings}
      status="pending"
      icon={Clock}
    />
  </SummaryGrid>

  {/* Filters */}
  <FiltersCard>
    <DateRangePicker 
      from={dateFrom}
      to={dateTo}
      onChange={handleDateChange}
    />
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="paid">Paid</SelectItem>
      </SelectContent>
    </Select>
    <Select value={serviceFilter} onValueChange={setServiceFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Service Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Services</SelectItem>
        <SelectItem value="installation">Installation</SelectItem>
        <SelectItem value="maintenance">Maintenance</SelectItem>
        <SelectItem value="repair">Repair</SelectItem>
        <SelectItem value="inspection">Inspection</SelectItem>
      </SelectContent>
    </Select>
  </FiltersCard>

  {/* Earnings Breakdown Table */}
  <Card>
    <CardHeader>
      <CardTitle>Earnings Breakdown</CardTitle>
      <CardDescription>
        Detailed view of your completed jobs and payments
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Desktop Table */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>DATE</TableHead>
            <TableHead>BOOKING ID</TableHead>
            <TableHead>SERVICE</TableHead>
            <TableHead>JOB PRICE</TableHead>
            <TableHead>YOUR SHARE (90%)</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earnings.map(earning => (
            <TableRow key={earning.id}>
              <TableCell>{formatDate(earning.createdAt)}</TableCell>
              <TableCell className="font-mono text-sm">
                {earning.bookingId.slice(0, 8)}
              </TableCell>
              <TableCell className="capitalize">
                {earning.serviceCode}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(earning.priceAtBooking)}
              </TableCell>
              <TableCell className="font-bold text-green-600">
                {formatCurrency(earning.techShare)}
              </TableCell>
              <TableCell>
                <Badge variant={earning.status === 'paid' ? 'default' : 'secondary'}>
                  {earning.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => downloadReceipt(earning.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {earnings.map(earning => (
          <EarningCard key={earning.id} earning={earning} />
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Pagination */}
  {totalPages > 1 && (
    <Pagination 
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  )}
</TechnicianLayout>
```

**Key Features:**
- No reference to SERVICE_PACKAGES anywhere
- All earnings derived from `priceAtBooking` field
- Clear 90% split display
- Filter by date range, status, and service type
- Download receipt for each earning
- Responsive table → cards on mobile


#### D. Notifications (`TechnicianNotifications.tsx`)

**Bell Icon Component:**
```tsx
<Button 
  variant="ghost" 
  size="icon"
  className="relative"
  onClick={() => setNotificationsOpen(true)}
  aria-label="Notifications"
>
  <Bell className="h-5 w-5" />
  {unreadCount > 0 && (
    <Badge 
      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
      variant="destructive"
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </Badge>
  )}
</Button>
```

**Notifications Panel:**
```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right" className="w-full sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Notifications</SheetTitle>
      <SheetDescription>
        Stay updated on job assignments and changes
      </SheetDescription>
    </SheetHeader>

    <div className="mt-6 space-y-4">
      {notifications.length === 0 ? (
        <EmptyState 
          icon={Bell}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        notifications.map(notification => (
          <NotificationCard 
            key={notification.id}
            notification={notification}
            onRead={handleMarkRead}
            onAction={handleNotificationAction}
          />
        ))
      )}
    </div>
  </SheetContent>
</Sheet>
```

**Notification Types:**
```tsx
interface Notification {
  id: string;
  type: 'job_assigned' | 'schedule_change' | 'price_update' | 'customer_message';
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    bookingId?: string;
    changeId?: string; // For price updates
  };
}
```

**Price Change Notification:**
```tsx
<NotificationCard variant="info">
  <div className="flex items-start gap-3">
    <div className="bg-blue-100 p-2 rounded-lg">
      <DollarSign className="h-5 w-5 text-blue-600" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900">
        Service pricing updated
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Service prices have been updated on {formatDate(notification.timestamp)}.
        This affects new bookings only.
      </p>
      <Button 
        variant="link" 
        className="mt-2 p-0 h-auto"
        onClick={() => navigate('/pricing')}
      >
        View pricing details →
      </Button>
    </div>
  </div>
</NotificationCard>
```

**One-Time Delivery Logic:**
```typescript
// Check if notification already delivered
const existingNotification = await getDoc(
  doc(db, 'priceChangeNotifications', `${changeId}_${userId}`)
);

if (!existingNotification.exists()) {
  // Send notification
  await addDoc(collection(db, 'notifications'), {
    userId,
    type: 'price_update',
    title: 'Service pricing updated',
    message: 'Service prices have been updated. See details.',
    timestamp: serverTimestamp(),
    read: false,
    metadata: { changeId },
  });

  // Mark as delivered
  await setDoc(
    doc(db, 'priceChangeNotifications', `${changeId}_${userId}`),
    {
      changeId,
      userId,
      deliveredAt: serverTimestamp(),
    }
  );
}
```


### 3. Customer Booking Interface Updates

**Service Catalog Display (`ServiceCatalog.tsx`):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {services.map(service => (
    <ServiceCard 
      key={service.code}
      icon={getServiceIcon(service.code)}
      name={service.name}
      price={service.basePrice}
      description={getServiceDescription(service.code)}
      onClick={() => handleServiceSelect(service)}
    />
  ))}
</div>
```

**Service Card Component:**
```tsx
<Card 
  className="cursor-pointer hover:shadow-lg transition-shadow"
  onClick={onClick}
>
  <CardContent className="p-6">
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="bg-blue-100 p-4 rounded-xl">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-900">
          {name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
      <div className="text-2xl font-bold text-blue-600">
        {formatCurrency(price)}
      </div>
    </div>
  </CardContent>
</Card>
```

**Booking Confirmation:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Booking Summary</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex justify-between">
      <span className="text-gray-600">Service</span>
      <span className="font-medium">{selectedService.name}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Date & Time</span>
      <span className="font-medium">
        {formatDateTime(selectedDate, selectedTimeSlot)}
      </span>
    </div>
    <Separator />
    <div className="flex justify-between text-lg">
      <span className="font-semibold">Total Price</span>
      <span className="font-bold text-blue-600">
        {formatCurrency(selectedService.basePrice)}
      </span>
    </div>
    <p className="text-xs text-gray-500">
      This price is locked for your booking and won't change.
    </p>
  </CardContent>
</Card>
```

**Booking Creation Logic:**
```typescript
async function createBooking(formData: BookingFormData) {
  // Get current price from Service Catalog
  const catalogEntry = await getCurrentServicePrice(formData.serviceCode);
  
  if (!catalogEntry) {
    throw new Error('Service not available');
  }

  // Create booking with price snapshot
  const booking: Booking = {
    ...formData,
    serviceCode: formData.serviceCode,
    priceAtBooking: catalogEntry.basePrice, // Snapshot!
    currency: 'GHS',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'bookings'), booking);
}
```

### 4. Admin Service Pricing Interface

**Admin Settings - Service Pricing Section (`AdminServicePricing.tsx`):**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Service Pricing</CardTitle>
    <CardDescription>
      Manage platform-wide service prices. Changes affect new bookings only.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Form onSubmit={handleSave}>
      <div className="space-y-6">
        {/* Installation */}
        <PricingRow
          icon={Wrench}
          label="Installation"
          code="installation"
          currentPrice={prices.installation}
          onChange={(value) => handlePriceChange('installation', value)}
        />

        {/* Maintenance */}
        <PricingRow
          icon={Settings}
          label="Maintenance"
          code="maintenance"
          currentPrice={prices.maintenance}
          onChange={(value) => handlePriceChange('maintenance', value)}
        />

        {/* Repair */}
        <PricingRow
          icon={Tool}
          label="Repair"
          code="repair"
          currentPrice={prices.repair}
          onChange={(value) => handlePriceChange('repair', value)}
        />

        {/* Inspection */}
        <PricingRow
          icon={Search}
          label="Inspection"
          code="inspection"
          currentPrice={prices.inspection}
          onChange={(value) => handlePriceChange('inspection', value)}
        />
      </div>

      <Separator className="my-6" />

      {/* Audit Trail */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-gray-700">Recent Changes</h4>
        <div className="text-sm text-gray-600">
          <p>Last updated: {formatDateTime(lastUpdate.timestamp)}</p>
          <p>Updated by: {lastUpdate.userName}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" disabled={saving || !hasChanges}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </Form>
  </CardContent>
</Card>
```

**Pricing Row Component:**
```tsx
<div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
  <div className="bg-white p-3 rounded-lg">
    {icon}
  </div>
  <div className="flex-1">
    <Label htmlFor={code} className="text-base font-medium">
      {label}
    </Label>
    <p className="text-sm text-gray-500">
      Current: {formatCurrency(currentPrice)}
    </p>
  </div>
  <div className="w-32">
    <Input
      id={code}
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="text-right font-medium"
    />
  </div>
  <span className="text-gray-500">GHS</span>
</div>
```


**Save Logic with Notification Trigger:**
```typescript
async function handleSavePricing(updates: PricingUpdates) {
  const changeId = uuidv4();
  const batch = writeBatch(db);
  const now = new Date();

  // For each changed service
  for (const [code, newPrice] of Object.entries(updates)) {
    // Get current active entry
    const currentQuery = query(
      collection(db, 'serviceCatalog'),
      where('code', '==', code),
      where('isActive', '==', true)
    );
    const currentSnapshot = await getDocs(currentQuery);

    // Close current entry
    if (!currentSnapshot.empty) {
      const currentDoc = currentSnapshot.docs[0];
      batch.update(currentDoc.ref, {
        effectiveTo: now,
        isActive: false,
      });
    }

    // Create new entry
    const newEntry: ServiceCatalogEntry = {
      code,
      name: getServiceName(code),
      basePrice: newPrice,
      currency: 'GHS',
      effectiveFrom: now,
      effectiveTo: null,
      isActive: true,
      updatedBy: currentUser.uid,
      updatedAt: serverTimestamp(),
      changeId,
    };

    batch.set(doc(collection(db, 'serviceCatalog')), newEntry);
  }

  // Commit all changes
  await batch.commit();

  // Trigger notifications
  await triggerPriceChangeNotifications(changeId, updates);

  toast({
    title: 'Pricing updated',
    description: 'Service prices have been updated successfully.',
  });
}
```

**Notification Trigger Function:**
```typescript
async function triggerPriceChangeNotifications(
  changeId: string,
  updates: PricingUpdates
) {
  // Get all active technicians
  const techniciansQuery = query(
    collection(db, 'users'),
    where('role', '==', 'technician'),
    where('status', '==', 'active')
  );
  const techniciansSnapshot = await getDocs(techniciansQuery);

  // Get all customers with pending/future bookings
  const futureDate = new Date();
  const customersQuery = query(
    collection(db, 'bookings'),
    where('status', 'in', ['pending', 'confirmed']),
    where('preferredDate', '>=', futureDate)
  );
  const bookingsSnapshot = await getDocs(customersQuery);
  const customerIds = new Set(
    bookingsSnapshot.docs.map(doc => doc.data().customerId)
  );

  // Queue notifications (use Cloud Function or batch)
  const notifications = [];

  // Technician notifications
  for (const techDoc of techniciansSnapshot.docs) {
    notifications.push({
      userId: techDoc.id,
      type: 'price_update',
      title: 'Service pricing updated',
      message: 'Service prices have been updated. See details.',
      actionUrl: '/pricing',
      actionLabel: 'View Pricing',
      metadata: { changeId },
    });
  }

  // Customer notifications
  for (const customerId of customerIds) {
    notifications.push({
      userId: customerId,
      type: 'price_update',
      title: 'Service pricing update',
      message: `Service prices changed on ${formatDate(new Date())}. Your existing booking remains at the agreed price.`,
      metadata: { changeId },
    });
  }

  // Batch create notifications
  await batchCreateNotifications(notifications, changeId);
}
```


## Data Models

### 1. Service Catalog

**Firestore Collection:** `serviceCatalog`

```typescript
interface ServiceCatalogEntry {
  id: string; // Auto-generated
  code: 'installation' | 'maintenance' | 'repair' | 'inspection';
  name: string; // e.g., "AC Installation"
  basePrice: number; // e.g., 500
  currency: 'GHS';
  effectiveFrom: Timestamp; // When this price becomes active
  effectiveTo: Timestamp | null; // null = currently active
  isActive: boolean; // true for current version
  updatedBy: string; // Admin user ID
  updatedAt: Timestamp;
  changeId: string; // UUID for notification tracking
}
```

**Indexes:**
```
- code + isActive (for getting current price)
- code + effectiveFrom (for price history)
- changeId (for notification tracking)
```

**Query Examples:**
```typescript
// Get current active price for installation
const q = query(
  collection(db, 'serviceCatalog'),
  where('code', '==', 'installation'),
  where('isActive', '==', true),
  limit(1)
);

// Get price history for a service
const historyQ = query(
  collection(db, 'serviceCatalog'),
  where('code', '==', 'maintenance'),
  orderBy('effectiveFrom', 'desc')
);
```

### 2. Booking (Extended)

**Firestore Collection:** `bookings`

```typescript
interface Booking {
  // ... existing fields ...
  
  // NEW FIELDS (additive)
  serviceCode: 'installation' | 'maintenance' | 'repair' | 'inspection';
  priceAtBooking: number; // Snapshot from ServiceCatalog
  currency: 'GHS';
  
  // DEPRECATED (keep for backward compat, but don't use)
  servicePackage?: 'basic' | 'standard' | 'premium';
  agreedPrice?: number; // Use priceAtBooking instead
}
```

**Migration Strategy:**
```typescript
// Backfill existing bookings
async function backfillPriceAtBooking() {
  const bookingsSnapshot = await getDocs(
    query(collection(db, 'bookings'), where('priceAtBooking', '==', null))
  );

  const batch = writeBatch(db);
  
  for (const bookingDoc of bookingsSnapshot.docs) {
    const booking = bookingDoc.data();
    
    // Map old servicePackage to serviceCode
    const serviceCodeMap = {
      'basic': 'maintenance',
      'standard': 'repair',
      'premium': 'installation',
    };
    
    const serviceCode = serviceCodeMap[booking.servicePackage] || 'maintenance';
    const priceAtBooking = booking.agreedPrice || booking.finalCost || 150;
    
    batch.update(bookingDoc.ref, {
      serviceCode,
      priceAtBooking,
      currency: 'GHS',
    });
  }
  
  await batch.commit();
}
```

### 3. Technician Earning

**Firestore Collection:** `technicianEarnings`

```typescript
interface TechnicianEarning {
  id: string; // Auto-generated
  bookingId: string;
  technicianId: string;
  serviceCode: 'installation' | 'maintenance' | 'repair' | 'inspection';
  priceAtBooking: number; // Job price
  techShare: number; // priceAtBooking * 0.90
  rate: number; // 0.90 (90%)
  status: 'pending' | 'paid';
  paidAt?: Timestamp;
  paymentMethod?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
```
- technicianId + createdAt (for earnings list)
- technicianId + status (for pending/paid filter)
- bookingId (for lookup)
```

**Creation Logic:**
```typescript
async function createTechnicianEarning(booking: Booking) {
  const earning: TechnicianEarning = {
    bookingId: booking.id,
    technicianId: booking.technicianId!,
    serviceCode: booking.serviceCode,
    priceAtBooking: booking.priceAtBooking,
    techShare: booking.priceAtBooking * 0.90,
    rate: 0.90,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'technicianEarnings'), earning);
}
```

### 4. Platform Revenue

**Firestore Collection:** `platformRevenue`

```typescript
interface PlatformRevenue {
  id: string; // Auto-generated
  bookingId: string;
  serviceCode: 'installation' | 'maintenance' | 'repair' | 'inspection';
  priceAtBooking: number; // Job price
  platformShare: number; // priceAtBooking * 0.10
  rate: number; // 0.10 (10%)
  createdAt: Timestamp;
}
```

**Indexes:**
```
- createdAt (for revenue reports)
- serviceCode + createdAt (for service breakdown)
```

**Creation Logic:**
```typescript
async function createPlatformRevenue(booking: Booking) {
  const revenue: PlatformRevenue = {
    bookingId: booking.id,
    serviceCode: booking.serviceCode,
    priceAtBooking: booking.priceAtBooking,
    platformShare: booking.priceAtBooking * 0.10,
    rate: 0.10,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'platformRevenue'), revenue);
}
```

### 5. Price Change Notification

**Firestore Collection:** `priceChangeNotifications`

```typescript
interface PriceChangeNotification {
  id: string; // Format: `${changeId}_${userId}`
  changeId: string; // UUID from ServiceCatalog update
  userId: string;
  deliveredAt: Timestamp;
}
```

**Purpose:** Ensures each user receives exactly one notification per price change.

**Usage:**
```typescript
// Check before sending
const notificationId = `${changeId}_${userId}`;
const existingNotification = await getDoc(
  doc(db, 'priceChangeNotifications', notificationId)
);

if (!existingNotification.exists()) {
  // Send notification and mark as delivered
  await sendNotification(userId, changeId);
  await setDoc(
    doc(db, 'priceChangeNotifications', notificationId),
    {
      changeId,
      userId,
      deliveredAt: serverTimestamp(),
    }
  );
}
```


## Error Handling

### 1. Service Catalog Errors

**Scenario: Service Not Found**
```typescript
async function getCurrentServicePrice(code: string) {
  try {
    const q = query(
      collection(db, 'serviceCatalog'),
      where('code', '==', code),
      where('isActive', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error(`Service "${code}" not found in catalog`);
    }
    
    return snapshot.docs[0].data() as ServiceCatalogEntry;
  } catch (error) {
    console.error('Error fetching service price:', error);
    throw new Error('Unable to load service pricing. Please try again.');
  }
}
```

**Scenario: Concurrent Price Updates**
```typescript
async function updateServicePricing(updates: PricingUpdates) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await handleSavePricing(updates);
      return;
    } catch (error) {
      if (error.code === 'failed-precondition' && attempt < maxRetries - 1) {
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        throw error;
      }
    }
  }
}
```

### 2. Booking Creation Errors

**Scenario: Price Changed During Booking**
```typescript
async function createBookingWithPriceCheck(formData: BookingFormData) {
  // Get price at start of booking flow
  const initialPrice = await getCurrentServicePrice(formData.serviceCode);
  
  // ... user fills form ...
  
  // Re-check price before final submission
  const finalPrice = await getCurrentServicePrice(formData.serviceCode);
  
  if (initialPrice.basePrice !== finalPrice.basePrice) {
    // Price changed during booking
    return {
      success: false,
      error: 'price_changed',
      message: `The price for this service has changed from ${formatCurrency(initialPrice.basePrice)} to ${formatCurrency(finalPrice.basePrice)}. Please review and confirm.`,
      newPrice: finalPrice.basePrice,
    };
  }
  
  // Proceed with booking
  await createBooking({
    ...formData,
    priceAtBooking: finalPrice.basePrice,
  });
  
  return { success: true };
}
```

### 3. Earnings Calculation Errors

**Scenario: Missing priceAtBooking**
```typescript
async function calculateEarnings(booking: Booking) {
  if (!booking.priceAtBooking) {
    console.error('Missing priceAtBooking for booking:', booking.id);
    
    // Fallback to finalCost or agreedPrice
    const fallbackPrice = booking.finalCost || booking.agreedPrice || 0;
    
    if (fallbackPrice === 0) {
      throw new Error('Unable to calculate earnings: no price information');
    }
    
    // Log for manual review
    await logEarningsIssue({
      bookingId: booking.id,
      issue: 'missing_price_at_booking',
      fallbackPrice,
      timestamp: new Date(),
    });
    
    return {
      techShare: fallbackPrice * 0.90,
      platformShare: fallbackPrice * 0.10,
      usedFallback: true,
    };
  }
  
  return {
    techShare: booking.priceAtBooking * 0.90,
    platformShare: booking.priceAtBooking * 0.10,
    usedFallback: false,
  };
}
```

### 4. Notification Errors

**Scenario: Notification Delivery Failure**
```typescript
async function sendNotificationWithRetry(
  userId: string,
  notification: Notification,
  maxRetries = 3
) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        ...notification,
        timestamp: serverTimestamp(),
        read: false,
      });
      return { success: true };
    } catch (error) {
      attempt++;
      console.error(`Notification delivery attempt ${attempt} failed:`, error);
      
      if (attempt >= maxRetries) {
        // Log failed notification for manual review
        await logFailedNotification({
          userId,
          notification,
          error: error.message,
          attempts: attempt,
        });
        
        return { success: false, error };
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }
}
```

### 5. UI Error States

**Loading States:**
```tsx
{loading && (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
)}
```

**Error States:**
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

**Empty States:**
```tsx
{!loading && !error && items.length === 0 && (
  <EmptyState
    icon={Package}
    title="No items found"
    description="Try adjusting your filters"
  />
)}
```

**Retry Actions:**
```tsx
<Button 
  variant="outline" 
  onClick={handleRetry}
  disabled={retrying}
>
  {retrying ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Retrying...
    </>
  ) : (
    <>
      <RefreshCw className="mr-2 h-4 w-4" />
      Try Again
    </>
  )}
</Button>
```


## Testing Strategy

### 1. Unit Tests

**Service Catalog Functions:**
```typescript
describe('getCurrentServicePrice', () => {
  it('should return active price for valid service code', async () => {
    const price = await getCurrentServicePrice('installation');
    expect(price).toBeDefined();
    expect(price.isActive).toBe(true);
    expect(price.code).toBe('installation');
  });

  it('should throw error for invalid service code', async () => {
    await expect(getCurrentServicePrice('invalid')).rejects.toThrow();
  });
});

describe('createServiceCatalogVersion', () => {
  it('should close previous version and create new one', async () => {
    const updates = { installation: 550 };
    await updateServicePricing(updates);
    
    // Check old version is closed
    const oldVersions = await getInactiveVersions('installation');
    expect(oldVersions.length).toBeGreaterThan(0);
    
    // Check new version is active
    const newVersion = await getCurrentServicePrice('installation');
    expect(newVersion.basePrice).toBe(550);
    expect(newVersion.isActive).toBe(true);
  });
});
```

**Earnings Calculation:**
```typescript
describe('calculateEarnings', () => {
  it('should calculate 90/10 split correctly', () => {
    const booking = { priceAtBooking: 500 };
    const result = calculateEarnings(booking);
    
    expect(result.techShare).toBe(450);
    expect(result.platformShare).toBe(50);
  });

  it('should handle missing priceAtBooking with fallback', () => {
    const booking = { finalCost: 300 };
    const result = calculateEarnings(booking);
    
    expect(result.techShare).toBe(270);
    expect(result.usedFallback).toBe(true);
  });
});
```

**Notification Deduplication:**
```typescript
describe('sendPriceChangeNotification', () => {
  it('should send notification only once per user per changeId', async () => {
    const changeId = 'test-change-123';
    const userId = 'user-456';
    
    // First send
    await sendPriceChangeNotification(userId, changeId);
    const notifications1 = await getUserNotifications(userId);
    expect(notifications1.length).toBe(1);
    
    // Second send (should be skipped)
    await sendPriceChangeNotification(userId, changeId);
    const notifications2 = await getUserNotifications(userId);
    expect(notifications2.length).toBe(1); // Still 1
  });
});
```

### 2. Integration Tests

**Booking Flow with Price Snapshot:**
```typescript
describe('Booking Creation Flow', () => {
  it('should capture current price at booking time', async () => {
    // Set initial price
    await updateServicePricing({ maintenance: 150 });
    
    // Create booking
    const booking = await createBooking({
      serviceCode: 'maintenance',
      // ... other fields
    });
    
    expect(booking.priceAtBooking).toBe(150);
    
    // Change price
    await updateServicePricing({ maintenance: 200 });
    
    // Verify booking price unchanged
    const updatedBooking = await getBooking(booking.id);
    expect(updatedBooking.priceAtBooking).toBe(150); // Still 150
  });
});
```

**Job Completion Flow:**
```typescript
describe('Job Completion', () => {
  it('should create earnings and revenue entries', async () => {
    const booking = await createTestBooking({
      priceAtBooking: 500,
      technicianId: 'tech-123',
    });
    
    await completeJob(booking.id);
    
    // Check technician earning
    const earning = await getTechnicianEarning(booking.id);
    expect(earning.techShare).toBe(450);
    expect(earning.status).toBe('pending');
    
    // Check platform revenue
    const revenue = await getPlatformRevenue(booking.id);
    expect(revenue.platformShare).toBe(50);
  });
});
```

### 3. E2E Tests

**Admin Updates Pricing:**
```typescript
test('Admin can update service pricing', async ({ page }) => {
  await page.goto('/admin/settings');
  await page.click('text=Service Pricing');
  
  // Update installation price
  await page.fill('[data-testid="price-installation"]', '550');
  await page.click('button:has-text("Save Changes")');
  
  // Verify success message
  await expect(page.locator('text=Pricing updated')).toBeVisible();
  
  // Verify new price is active
  await page.goto('/book-service');
  await expect(page.locator('[data-service="installation"] .price')).toHaveText('GHS 550.00');
});
```

**Technician Views Earnings:**
```typescript
test('Technician sees correct earnings breakdown', async ({ page }) => {
  // Complete a job with known price
  await completeTestJob({ priceAtBooking: 500 });
  
  await page.goto('/technician/earnings');
  
  // Verify earnings display
  await expect(page.locator('[data-testid="tech-share"]')).toHaveText('GHS 450.00');
  await expect(page.locator('[data-testid="job-price"]')).toHaveText('GHS 500.00');
  
  // Verify no SERVICE_PACKAGES references
  await expect(page.locator('text=Basic Service')).not.toBeVisible();
  await expect(page.locator('text=Standard Service')).not.toBeVisible();
});
```

**Price Change Notification:**
```typescript
test('Users receive price change notification once', async ({ page }) => {
  // Update pricing as admin
  await updatePricingAsAdmin({ maintenance: 175 });
  
  // Login as technician
  await page.goto('/technician/dashboard');
  
  // Check notification
  await page.click('[aria-label="Notifications"]');
  await expect(page.locator('text=Service pricing updated')).toBeVisible();
  
  // Mark as read
  await page.click('text=Service pricing updated');
  
  // Logout and login again
  await page.click('button:has-text("Logout")');
  await loginAsTechnician(page);
  
  // Verify notification not shown again
  await page.click('[aria-label="Notifications"]');
  const notificationCount = await page.locator('text=Service pricing updated').count();
  expect(notificationCount).toBe(0);
});
```

### 4. Accessibility Tests

**Keyboard Navigation:**
```typescript
test('Technician Hub is keyboard navigable', async ({ page }) => {
  await page.goto('/technician/dashboard');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab'); // Focus first element
  await page.keyboard.press('Tab'); // Focus second element
  
  // Verify focus visible
  const focusedElement = await page.locator(':focus');
  await expect(focusedElement).toBeVisible();
  
  // Test ESC closes modals
  await page.click('button:has-text("View Details")');
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

**Screen Reader Compatibility:**
```typescript
test('Earnings table has proper ARIA labels', async ({ page }) => {
  await page.goto('/technician/earnings');
  
  // Check table structure
  await expect(page.locator('table')).toHaveAttribute('role', 'table');
  await expect(page.locator('thead')).toHaveAttribute('role', 'rowgroup');
  
  // Check column headers
  const headers = page.locator('th');
  await expect(headers).toHaveCount(7);
  
  // Check action buttons have labels
  const downloadButtons = page.locator('[aria-label*="Download"]');
  await expect(downloadButtons.first()).toHaveAttribute('aria-label');
});
```

**Color Contrast:**
```typescript
test('UI meets WCAG AA contrast requirements', async ({ page }) => {
  await page.goto('/technician/dashboard');
  
  // Run axe accessibility audit
  const results = await injectAxe(page);
  const violations = await checkA11y(page, null, {
    rules: {
      'color-contrast': { enabled: true },
    },
  });
  
  expect(violations.length).toBe(0);
});
```

### 5. Performance Tests

**Load Time:**
```typescript
test('Technician Dashboard loads within 2 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/technician/dashboard');
  await page.waitForSelector('[data-testid="dashboard-loaded"]');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2000);
});
```

**Lighthouse Score:**
```typescript
test('Technician Hub achieves Lighthouse accessibility score ≥ 90', async () => {
  const result = await lighthouse('http://localhost:3000/technician/dashboard', {
    onlyCategories: ['accessibility'],
  });
  
  expect(result.lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);
});
```


## API Design

### Public Endpoints

#### GET /api/catalog/services

Get current active service prices.

**Response:**
```json
{
  "services": [
    {
      "code": "installation",
      "name": "AC Installation",
      "basePrice": 500,
      "currency": "GHS",
      "effectiveFrom": "2025-01-15T10:00:00Z"
    },
    {
      "code": "maintenance",
      "name": "AC Maintenance",
      "basePrice": 150,
      "currency": "GHS",
      "effectiveFrom": "2025-01-15T10:00:00Z"
    },
    {
      "code": "repair",
      "name": "AC Repair",
      "basePrice": 200,
      "currency": "GHS",
      "effectiveFrom": "2025-01-15T10:00:00Z"
    },
    {
      "code": "inspection",
      "name": "AC Inspection",
      "basePrice": 100,
      "currency": "GHS",
      "effectiveFrom": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Implementation:**
```typescript
export async function GET(request: Request) {
  try {
    const services = await Promise.all(
      ['installation', 'maintenance', 'repair', 'inspection'].map(
        async (code) => {
          const q = query(
            collection(db, 'serviceCatalog'),
            where('code', '==', code),
            where('isActive', '==', true),
            limit(1)
          );
          const snapshot = await getDocs(q);
          return snapshot.docs[0]?.data();
        }
      )
    );

    return Response.json({ services: services.filter(Boolean) });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
```

#### GET /api/bookings/:id

Get booking details including price snapshot.

**Response:**
```json
{
  "id": "booking-123",
  "customerId": "user-456",
  "customerName": "John Doe",
  "serviceCode": "installation",
  "priceAtBooking": 500,
  "currency": "GHS",
  "status": "confirmed",
  "preferredDate": "2025-02-01T14:00:00Z",
  "address": "123 Main St, Accra",
  "technicianId": "tech-789",
  "technicianName": "Jane Smith"
}
```

#### GET /api/technicians/:id/earnings

Get technician earnings with filters.

**Query Parameters:**
- `from`: ISO date string (optional)
- `to`: ISO date string (optional)
- `status`: 'pending' | 'paid' | 'all' (default: 'all')
- `service`: service code (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```json
{
  "earnings": [
    {
      "id": "earning-123",
      "bookingId": "booking-456",
      "serviceCode": "installation",
      "priceAtBooking": 500,
      "techShare": 450,
      "rate": 0.90,
      "status": "pending",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "summary": {
    "totalEarnings": 450,
    "pendingEarnings": 450,
    "paidEarnings": 0,
    "count": 1
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**Implementation:**
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const status = searchParams.get('status') || 'all';
  const service = searchParams.get('service');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    let q = query(
      collection(db, 'technicianEarnings'),
      where('technicianId', '==', params.id),
      orderBy('createdAt', 'desc')
    );

    if (from) {
      q = query(q, where('createdAt', '>=', new Date(from)));
    }
    if (to) {
      q = query(q, where('createdAt', '<=', new Date(to)));
    }
    if (status !== 'all') {
      q = query(q, where('status', '==', status));
    }
    if (service) {
      q = query(q, where('serviceCode', '==', service));
    }

    const snapshot = await getDocs(q);
    const allEarnings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate summary
    const summary = {
      totalEarnings: allEarnings.reduce((sum, e) => sum + e.techShare, 0),
      pendingEarnings: allEarnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.techShare, 0),
      paidEarnings: allEarnings
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + e.techShare, 0),
      count: allEarnings.length,
    };

    // Paginate
    const startIndex = (page - 1) * limit;
    const earnings = allEarnings.slice(startIndex, startIndex + limit);

    return Response.json({
      earnings,
      summary,
      pagination: {
        page,
        limit,
        total: allEarnings.length,
        totalPages: Math.ceil(allEarnings.length / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
```

### Admin Endpoints

#### GET /api/admin/pricing

Get latest active service pricing (admin only).

**Response:**
```json
{
  "pricing": [
    {
      "code": "installation",
      "name": "AC Installation",
      "basePrice": 500,
      "currency": "GHS",
      "effectiveFrom": "2025-01-15T10:00:00Z",
      "updatedBy": "admin-123",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "lastUpdate": {
    "timestamp": "2025-01-15T10:00:00Z",
    "userName": "Admin User",
    "changeId": "uuid-123"
  }
}
```

#### POST /api/admin/pricing

Update service pricing (admin only).

**Request:**
```json
{
  "items": [
    {
      "code": "installation",
      "basePrice": 550
    },
    {
      "code": "maintenance",
      "basePrice": 175
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "changeId": "uuid-456",
  "updated": [
    {
      "code": "installation",
      "oldPrice": 500,
      "newPrice": 550
    },
    {
      "code": "maintenance",
      "oldPrice": 150,
      "newPrice": 175
    }
  ]
}
```

**Implementation:**
```typescript
export async function POST(request: Request) {
  // Verify admin role
  const user = await verifyAuth(request);
  if (user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { items } = await request.json();
  const changeId = uuidv4();
  const now = new Date();
  const updated = [];

  try {
    const batch = writeBatch(db);

    for (const item of items) {
      // Get current price
      const currentQ = query(
        collection(db, 'serviceCatalog'),
        where('code', '==', item.code),
        where('isActive', '==', true)
      );
      const currentSnapshot = await getDocs(currentQ);

      if (!currentSnapshot.empty) {
        const currentDoc = currentSnapshot.docs[0];
        const currentData = currentDoc.data();

        // Close current version
        batch.update(currentDoc.ref, {
          effectiveTo: now,
          isActive: false,
        });

        updated.push({
          code: item.code,
          oldPrice: currentData.basePrice,
          newPrice: item.basePrice,
        });
      }

      // Create new version
      const newEntry = {
        code: item.code,
        name: getServiceName(item.code),
        basePrice: item.basePrice,
        currency: 'GHS',
        effectiveFrom: now,
        effectiveTo: null,
        isActive: true,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
        changeId,
      };

      batch.set(doc(collection(db, 'serviceCatalog')), newEntry);
    }

    await batch.commit();

    // Trigger notifications (async, don't wait)
    triggerPriceChangeNotifications(changeId, updated).catch(console.error);

    return Response.json({
      success: true,
      changeId,
      updated,
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return Response.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}
```

### Event Handlers

#### onBookingCreate

Capture price snapshot when booking is created.

```typescript
export async function onBookingCreate(bookingData: BookingFormData) {
  // Get current price
  const catalogEntry = await getCurrentServicePrice(bookingData.serviceCode);

  // Create booking with price snapshot
  const booking = {
    ...bookingData,
    priceAtBooking: catalogEntry.basePrice,
    currency: 'GHS',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'bookings'), booking);
  return docRef.id;
}
```

#### onBookingComplete

Create earnings and revenue entries when job is completed.

```typescript
export async function onBookingComplete(bookingId: string) {
  const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
  const booking = bookingDoc.data() as Booking;

  if (!booking.priceAtBooking) {
    throw new Error('Missing priceAtBooking');
  }

  const batch = writeBatch(db);

  // Create technician earning
  const earningRef = doc(collection(db, 'technicianEarnings'));
  batch.set(earningRef, {
    bookingId,
    technicianId: booking.technicianId,
    serviceCode: booking.serviceCode,
    priceAtBooking: booking.priceAtBooking,
    techShare: booking.priceAtBooking * 0.90,
    rate: 0.90,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create platform revenue
  const revenueRef = doc(collection(db, 'platformRevenue'));
  batch.set(revenueRef, {
    bookingId,
    serviceCode: booking.serviceCode,
    priceAtBooking: booking.priceAtBooking,
    platformShare: booking.priceAtBooking * 0.10,
    rate: 0.10,
    createdAt: serverTimestamp(),
  });

  // Update booking status
  batch.update(bookingDoc.ref, {
    status: 'completed',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // Send completion notification to customer
  await sendCompletionNotification(booking.customerId, bookingId);
}
```

