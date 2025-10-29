# Technician Team System Design

## Research Summary

### Industry Best Practices (2024)

**Team Structure Patterns:**
- **Small Companies (1-5 techs)**: Every technician is a generalist
- **Medium Companies (6-20 techs)**: Specialization by service type (installation, repair, maintenance)
- **Large Companies (20+ techs)**: Teams with leads, skill-based routing, supervisor hierarchy

**Key Roles Identified:**
1. **Apprentice/Trainee** - Learning the trade, shadows experienced techs
2. **Junior Technician** - 1-3 years experience, handles basic repairs
3. **Technician** - 3-5 years experience, independent service work
4. **Senior Technician** - 5-7 years experience, handles complex diagnostics
5. **Lead Technician** - 7+ years experience, leads teams, mentors juniors
6. **Supervisor** - Manages multiple teams, coordinates dispatch

**Modern Dispatch Trends:**
- **Skill-Based Routing**: Match job requirements to technician expertise
- **AI-Powered Scheduling**: Optimize by location, skills, availability
- **Team Assignment**: Complex jobs assigned to lead + assistant(s)
- **First-Time Fix Rate**: Priority metric for quality service

---

## Supremo AC Platform Implementation

### Phase 1: Technician Levels & Skills

#### Technician Levels
```typescript
type TechnicianLevel =
  | 'trainee'      // 0-1 year, learning
  | 'junior'       // 1-3 years, basic repairs
  | 'technician'   // 3-5 years, independent work
  | 'senior'       // 5-7 years, complex diagnostics
  | 'lead'         // 7+ years, team leadership
  | 'supervisor';  // Manages multiple teams
```

#### Skills & Certifications
```typescript
type TechnicianSkill =
  | 'ac_installation'
  | 'ac_repair'
  | 'refrigeration'
  | 'electrical'
  | 'preventive_maintenance'
  | 'emergency_service'
  | 'commercial_systems'
  | 'residential_systems'
  | 'ductwork'
  | 'hvac_controls';

interface Certification {
  name: string;
  issuingOrg: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
}
```

#### Extended Technician Profile
```typescript
interface TechnicianProfile {
  // Existing user fields
  uid: string;
  displayName: string;
  email: string;
  role: 'technician';

  // New technician-specific fields
  level: TechnicianLevel;
  yearsOfExperience: number;
  skills: TechnicianSkill[];
  certifications: Certification[];

  // Team assignment
  teamId?: string;
  isTeamLead: boolean;

  // Availability
  isAvailable: boolean;
  serviceAreas: string[]; // Cities/zones they cover
  maxJobsPerDay: number;

  // Performance metrics
  totalJobsCompleted: number;
  averageRating: number;
  firstTimeFixRate: number; // Percentage

  // Specialization
  primarySpecialization: TechnicianSkill;
  canWorkAlone: boolean; // Based on level
}
```

---

### Phase 2: Team Structure

#### Team Model
```typescript
interface Team {
  id: string;
  name: string;
  leadTechnicianId: string;
  leadTechnicianName: string;

  // Team members
  memberIds: string[];
  memberProfiles: Array<{
    uid: string;
    name: string;
    level: TechnicianLevel;
    role: 'lead' | 'member';
  }>;

  // Team capabilities
  serviceAreas: string[];
  specializations: TechnicianSkill[];
  maxConcurrentJobs: number;

  // Team status
  isActive: boolean;
  currentJobs: string[]; // Booking IDs

  // Performance
  totalJobsCompleted: number;
  averageRating: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### Phase 3: Enhanced Job Assignment

#### Assignment Types
```typescript
type AssignmentType =
  | 'individual'  // Single technician
  | 'team'        // Full team (lead + members)
  | 'pair';       // Two technicians (mentor + trainee)

interface JobAssignment {
  bookingId: string;
  assignmentType: AssignmentType;

  // Individual assignment
  technicianId?: string;
  technicianName?: string;

  // Team assignment
  teamId?: string;
  teamName?: string;
  leadTechnicianId?: string;
  assistantTechnicianIds?: string[];

  // Assignment logic
  assignedBy: string; // Admin/Supervisor UID
  assignedAt: Timestamp;
  requiredSkills: TechnicianSkill[];
  estimatedDuration: number; // Hours
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
}
```

#### Smart Assignment Logic
```typescript
interface AssignmentRecommendation {
  technicianId: string;
  technicianName: string;
  level: TechnicianLevel;
  matchScore: number; // 0-100
  reasons: string[];
  availability: 'available' | 'busy' | 'unavailable';
  currentWorkload: number;
  estimatedArrivalTime: string;
  distanceFromJob: number; // Kilometers
}
```

---

### Phase 4: Admin Dashboard Features

#### 1. Technician Dropdown (Immediate)
- **Location**: Admin job assignment modal
- **Features**:
  - List all active technicians
  - Show availability status (🟢 available, 🟡 busy, 🔴 unavailable)
  - Display current workload (X jobs today)
  - Filter by skills
  - Filter by service area
  - Search by name
  - Sort by match score, distance, availability

#### 2. Team Management Page
- **Create Teams**: Assign lead + members
- **View Teams**: List all teams with status
- **Edit Teams**: Add/remove members, update specializations
- **Team Performance**: Stats dashboard per team

#### 3. Smart Dispatch Board
- **Drag & Drop**: Assign jobs by dragging to technician/team
- **Auto-Suggest**: AI recommendations based on skills, location, workload
- **Calendar View**: Technician schedules, team availability
- **Real-Time Updates**: Live status of all technicians

---

### Phase 5: Technician Collaboration

#### Team Job Workflow
1. **Admin assigns job to team** → Lead + assistants notified
2. **Lead accepts job** → Coordinates with team members
3. **Team arrives on site** → Lead marks team as "arrived"
4. **Collaborative work** →
   - Lead oversees, does complex work
   - Assistants handle support tasks (parts, measurements, cleanup)
   - Trainee observes and learns
5. **Service report** → Lead submits, can note team contributions
6. **Earnings split** → Commission divided by role:
   - Lead: 40%
   - Senior/Tech: 30%
   - Junior: 20%
   - Trainee: 10%

#### Team Communication
- In-app chat per job
- Voice notes for on-site coordination
- Photo sharing (before/after, issues found)
- Real-time location sharing

---

### Phase 6: Skill-Based Routing

#### Job Complexity Assessment
```typescript
function assessJobComplexity(booking: Booking): {
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  requiredSkills: TechnicianSkill[];
  recommendTeamSize: number;
  estimatedDuration: number;
} {
  // Simple: Filter cleaning, minor repairs (1-2 hours, 1 tech)
  // Moderate: Standard repairs, installations (2-4 hours, 1 tech)
  // Complex: Major repairs, ductwork (4-6 hours, 2 techs)
  // Expert: Commercial systems, complex diagnostics (6+ hours, team with lead)
}
```

#### Auto-Assignment Algorithm
```typescript
function findBestTechnician(
  job: JobRequirements,
  availableTechnicians: TechnicianProfile[]
): AssignmentRecommendation[] {
  return availableTechnicians
    .filter(tech => tech.isAvailable && tech.canWorkAlone)
    .map(tech => ({
      technicianId: tech.uid,
      matchScore: calculateMatchScore(job, tech),
      reasons: [
        hasRequiredSkills(job.skills, tech.skills) ? '✓ Has required skills' : '',
        coversServiceArea(job.location, tech.serviceAreas) ? '✓ Covers area' : '',
        tech.level >= job.minLevel ? `✓ ${tech.level} level` : '',
        tech.currentJobs < tech.maxJobsPerDay ? '✓ Available capacity' : ''
      ].filter(Boolean)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
```

---

## Implementation Roadmap

### Sprint 1: Foundation (Days 1-3)
- [x] Research industry best practices ✅
- [ ] Create technician & team types
- [ ] Extend UserProfile with technician fields
- [ ] Create Team data model

### Sprint 2: Admin UI (Days 4-6)
- [ ] Technician dropdown in job assignment
- [ ] Team creation/management page
- [ ] Skill management UI
- [ ] Certification upload

### Sprint 3: Assignment Logic (Days 7-9)
- [ ] Job complexity assessment
- [ ] Skill-based matching algorithm
- [ ] Team assignment workflow
- [ ] Earnings split calculation

### Sprint 4: Collaboration (Days 10-12)
- [ ] Team job coordination UI
- [ ] Multi-technician service reports
- [ ] Team chat/communication
- [ ] Team performance analytics

### Sprint 5: Optimization (Days 13-15)
- [ ] Smart dispatch recommendations
- [ ] Calendar/schedule view
- [ ] Workload balancing
- [ ] Performance metrics dashboard

---

## Success Metrics

1. **First-Time Fix Rate** → Target: 85%+
2. **Average Response Time** → Target: < 2 hours for emergency
3. **Technician Utilization** → Target: 6-8 jobs/day
4. **Customer Satisfaction** → Target: 4.5+ stars
5. **Team Efficiency** → Team jobs completed 30% faster than individual

---

## Firestore Schema Changes

### Collections to Add:
1. `teams` - Team documents
2. `technician_schedules` - Daily availability
3. `team_chats` - In-app messaging per job

### Fields to Add to Existing Collections:

**users (technician profiles):**
```javascript
{
  // ... existing fields
  technicianLevel: 'senior',
  yearsOfExperience: 6,
  skills: ['ac_repair', 'electrical', 'preventive_maintenance'],
  certifications: [...],
  teamId: 'team_abc123',
  isTeamLead: false,
  isAvailable: true,
  serviceAreas: ['Accra', 'Tema'],
  maxJobsPerDay: 8,
  totalJobsCompleted: 243,
  averageRating: 4.7,
  firstTimeFixRate: 88.5
}
```

**bookings:**
```javascript
{
  // ... existing fields
  assignmentType: 'team',
  teamId: 'team_abc123',
  leadTechnicianId: 'tech_001',
  assistantTechnicianIds: ['tech_002', 'tech_003'],
  requiredSkills: ['ac_installation', 'electrical'],
  complexity: 'complex',
  estimatedDuration: 6
}
```

---

## Security Considerations

### Firestore Rules:
```javascript
// Only admins and supervisors can create/edit teams
match /teams/{teamId} {
  allow read: if isAuthenticated();
  allow create, update: if hasRole('admin') || hasRole('supervisor');
  allow delete: if hasRole('admin');
}

// Technicians can only view their own team
match /teams/{teamId} {
  allow read: if request.auth.uid in resource.data.memberIds;
}

// Team chats only accessible to team members and customer
match /team_chats/{chatId} {
  allow read, write: if request.auth.uid in resource.data.participants;
}
```

---

## Next Steps

Start with the immediate need:
1. ✅ Create technician types and team models
2. ✅ Implement technician dropdown in admin dashboard
3. ✅ Add basic team management

Then expand to full team collaboration system!
