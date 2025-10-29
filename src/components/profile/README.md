# Profile Dialog Component

A clean and focused profile management dialog component that allows users to view and edit their essential profile information.

## Features

### 📋 Profile Management
- **Profile Photo Upload**: Click the camera icon to upload a new profile picture
- **Personal Information**: Edit name, phone, date of birth, and bio
- **Address Information**: Manage shipping/service address details
- **Real-time Validation**: Form validation with error handling
- **Member Since**: Display account creation year
- **Customer Badge**: Shows user role clearly

## Usage

```tsx
import { ProfileDialog } from '@/components/profile/ProfileDialog';

function MyComponent() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <button onClick={() => setShowProfile(true)}>
        View Profile
      </button>
      
      <ProfileDialog 
        open={showProfile} 
        onOpenChange={setShowProfile} 
      />
    </>
  );
}
```

## Integration

The ProfileDialog is already integrated into the CustomerSidebar component. Users can access it by clicking on their profile section in the sidebar.

## Data Structure

The component works with the existing UserProfile interface and stores additional data in the `metadata` field:

```typescript
interface UserProfile {
  // ... existing fields
  metadata: {
    address?: string;
    city?: string;
    region?: string;
    dateOfBirth?: string;
    bio?: string;
  }
}
```

## Dependencies

- **UI Components**: Dialog, Avatar, Card, Button, Input, Label, Textarea, Select
- **Services**: `authService` for profile updates and image uploads
- **Hooks**: `useAuth` for user authentication state
- **Icons**: Lucide React icons for consistent iconography

## Styling

The component follows the established design system:
- **Colors**: Teal primary, neutral grays, status colors
- **Layout**: Responsive grid layouts with proper spacing
- **Typography**: Consistent font sizes and weights
- **Interactions**: Hover states and smooth transitions

## Error Handling

- **Form Validation**: Real-time validation with error messages
- **Network Errors**: Toast notifications for API failures
- **Image Upload**: Progress indicators and error handling
- **Graceful Degradation**: Fallbacks for missing data

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order and focus indicators
- **Color Contrast**: WCAG compliant color combinations