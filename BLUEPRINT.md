# CallTree Emergency Communication System - Blueprint

## 📋 System Overview

A hierarchical emergency notification system that allows organizations to rapidly disseminate critical information through a structured calling tree, track responses in real-time, and maintain business continuity during emergencies.

---

## 🎯 Core Concepts

### What is a Calling Tree?
- **Hierarchical Structure**: Root initiator → Level 1 contacts → Level 2 contacts → etc.
- **Cascading Notifications**: Each person notifies their designated contacts
- **Response Tracking**: Monitor who received, read, and acknowledged messages
- **Failover Logic**: If someone doesn't respond, their contacts are notified by backup person
- **Efficiency**: 1 person contacts 3 people, those 3 contact 9, those 9 contact 27 (exponential reach)

---

## 🏗️ System Architecture

### Headless Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐  │
│  │   Web    │    │   iOS    │    │      Android         │  │
│  │  Admin   │    │   App    │    │        App           │  │
│  └────┬─────┘    └────┬─────┘    └──────────┬───────────┘  │
└───────┼───────────────┼──────────────────────┼──────────────┘
        │               │                      │
        └───────────────┼──────────────────────┘
                        │
                  ┌─────▼──────┐
                  │  Supabase  │
                  │    API     │
                  │ (REST/GQL) │
                  └─────┬──────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼─────┐   ┌────▼────┐   ┌─────▼──────┐
   │  Auth    │   │Database │   │   Storage  │
   │ Service  │   │(Postgres│   │   (S3)     │
   └──────────┘   │   +RLS) │   └────────────┘
                  └────┬────┘
                       │
              ┌────────┼───────────────┐
              │        │               │
         ┌────▼────┐   │    ┌─────────▼──────┐
         │Real-time│   │    │  Edge          │
         │Subscr.  │   │    │  Functions     │
         └─────────┘   │    │  (Push/Logic)  │
                       │    └────────────────┘
              ┌────────▼──────────┐
              │  External Services│
              │  FCM / APNs       │
              └───────────────────┘
```

---

## 👥 User Roles & Permissions

### 1. **Super Administrator**
- Full system access
- Manage organizations (if multi-tenant)
- System-wide settings and configurations
- Billing and subscription management

### 2. **Organization Administrator**
- Manage organization settings
- Create/edit calling trees
- Manage all users within organization
- Create and send emergency notifications
- Access all reports and analytics
- Manage documents and resources
- Configure organization branding

### 3. **Department Administrator**
- Manage users within their department(s)
- Create calling trees for their department
- Send notifications to their department
- View department-specific reports

### 4. **Incident Commander**
- Initiate emergency notifications
- Monitor response status in real-time
- Escalate notifications
- Cannot modify calling tree structure

### 5. **Team Leader/Manager**
- View their position in calling tree
- See their direct reports/contacts
- Manually trigger notifications to their contacts (if enabled)
- View limited reports for their team

### 6. **Standard User/Employee**
- Receive notifications
- Respond to notifications (Safe/Help Needed/Unable to Respond)
- View own notification history
- Update personal contact information
- Access emergency resources/documents

### 7. **Read-Only Observer**
- View notification dashboard
- See response statistics
- Cannot send notifications or modify data

---

## 🎨 Key Features

### A. Calling Tree Management

#### Tree Structure Features:
1. **Visual Tree Builder**
   - Drag-and-drop interface to build hierarchy
   - Visualize entire tree structure
   - Multiple tree configurations per organization (e.g., "Fire Emergency," "Active Shooter," "Severe Weather")
   
2. **Tree Types**:
   - **Linear Cascade**: Each person contacts N people below them
   - **Department-Based**: Organized by org structure
   - **Geographic**: Based on location/office
   - **Role-Based**: Based on job functions
   - **Custom**: Manually defined relationships

3. **Branching Logic**:
   - Define number of contacts per level
   - Set timeout periods (e.g., if no response in 5 min, notify backup)
   - Backup contacts if primary doesn't respond
   - Skip offline/unavailable users

4. **Tree Templates**:
   - Save tree configurations as templates
   - Clone and modify existing trees
   - Import/export tree structures

---

### B. Emergency Notification System

#### Message Types:
- **Emergency Alert**: Critical immediate action
- **Warning**: Important but not immediate
- **Information**: General updates
- **All-Clear**: Situation resolved
- **Test**: Practice drill

#### Message Components:
- Title/Subject (required)
- Body text (rich text with formatting)
- Priority level (Critical/High/Normal/Low)
- Severity indicator with color coding
- Attached documents/images
- Action buttons (Acknowledge/Safe/Need Help/Custom)
- Expiration time
- GPS location (if relevant)
- External links

---

### C. Response Tracking & Management

#### Response Options:
- ✅ **Safe/OK**: User is safe
- 🆘 **Need Assistance**: User needs help
- ❌ **Unable to Comply**: Cannot follow instructions
- 📍 **Check-In**: Confirm current location
- 💬 **Custom Response**: Free text option

#### Real-Time Dashboard:
1. **Overview Metrics**:
   - Total recipients
   - Messages delivered
   - Messages read
   - Responses received (by type)
   - Non-responders
   - Average response time

2. **Visual Representation**:
   - Tree visualization with color-coded status
   - Progress bar
   - Real-time update feed
   - Geographic map view (if location enabled)

---

### D. User Management

#### User Profiles:
- Personal information (name, employee ID, department)
- Contact information (email, mobile)
- Role within organization
- Department/team assignment
- Location/office
- Manager/supervisor
- Emergency contacts

#### Bulk User Management:
- CSV import/export
- Active Directory/LDAP integration (future)
- SSO integration (SAML, OAuth)
- Automated user provisioning
- Automatic deactivation (leavers)

---

### E. Document & Resource Management

#### Document Library:
- Emergency procedures documents
- Floor plans and evacuation maps
- Contact lists
- Safety protocols
- Training materials

#### Document Features:
- Categorize by type/emergency
- Assign to specific groups
- Version control
- Offline access in mobile apps
- Quick access from notification

---

### F. Reporting & Analytics

#### Standard Reports:
1. **Notification History**:
   - All sent notifications
   - Delivery and response rates
   - Time-to-respond metrics

2. **User Engagement**:
   - Response patterns by user
   - Non-responsive users
   - App usage statistics

3. **Drill Reports**:
   - Test notification results
   - Improvement tracking over time
   - Compliance reporting

4. **Audit Logs**:
   - All system actions
   - User activities
   - Configuration changes
   - Access logs

---

## 📱 Application Structure

### 1. Backend Services (Supabase)

#### Core Components:
- **PostgreSQL Database**: All data storage with Row Level Security
- **Supabase Auth**: User authentication with social providers
- **Supabase Storage**: Document and image storage
- **Supabase Realtime**: WebSocket subscriptions for live updates
- **Edge Functions**: Serverless functions for business logic
- **Auto-generated APIs**: REST and GraphQL endpoints

---

### 2. Web Admin Application

#### Technology Stack:
- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand + React Query
- **UI Library**: Tailwind CSS + shadcn/ui
- **Real-time**: Supabase Realtime
- **Charts**: Recharts
- **Tree Visualization**: React Flow

#### Key Pages:
1. **Dashboard** - Overview and quick actions
2. **Calling Trees** - Visual tree builder
3. **Send Notification** - Compose and send
4. **Active Notifications** - Real-time monitoring
5. **Notification History** - Past notifications
6. **User Management** - CRUD operations
7. **Documents** - Resource library
8. **Reports** - Analytics and exports
9. **Settings** - Organization configuration
10. **Audit Logs** - Activity tracking

---

### 3. Mobile Applications (iOS & Android)

#### Technology Stack:
- **Framework**: React Native + Expo
- **UI**: React Native Paper or NativeBase
- **Navigation**: React Navigation
- **Push Notifications**: Expo Push Notifications
- **Offline Storage**: AsyncStorage + SQLite

#### Key Screens:
1. **Onboarding** - Activation and setup
2. **Home/Dashboard** - Current status
3. **Notifications List** - All notifications
4. **Notification Detail** - Full message and response
5. **Documents** - Resource library with offline access
6. **Maps** - Emergency maps viewer
7. **Profile** - User information
8. **Settings** - App preferences

---

## 🔔 Push Notification Strategy

### Implementation with Expo:
1. **Device Registration**: Generate and store Expo push tokens
2. **Sending**: Edge Function calls Expo Push API
3. **Receiving**: Expo handles delivery to FCM/APNs
4. **Response**: App sends back to Supabase API

### Notification Payload:
```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "Emergency Alert",
  "body": "Fire alarm activated in Building A",
  "data": {
    "notification_id": "123",
    "type": "emergency",
    "priority": "critical"
  },
  "sound": "default",
  "priority": "high",
  "badge": 1
}
```

---

## 🔄 Calling Tree Execution Flow

1. **Initiation**: Authorized user triggers notification
2. **Level 0**: System logs initiator
3. **Level 1**: Send to first level contacts, start timer
4. **Monitor**: Track responses and timeouts
5. **Level 2**: After responses/timeout, cascade to next level
6. **Continue**: Repeat until all levels notified
7. **Complete**: Generate summary report

### Failover Logic:
- Primary doesn't respond → Backup notified
- Backup doesn't respond → Escalate to admin
- Offline user → Skip to their contacts

---

## 🔒 Security & Compliance

### Security Measures:
1. **Data Encryption**: TLS 1.3, encrypted storage
2. **Authentication**: Social OAuth, MFA optional
3. **Authorization**: Row Level Security (RLS) policies
4. **Privacy**: GDPR compliance, data minimization
5. **Audit**: Comprehensive logging

### Row Level Security (RLS):
- Users can only see data from their organization
- Role-based access enforced at database level
- Document access controlled by group membership
- Audit logs protect against tampering

---

## 📊 Database Schema Overview

### Core Tables:
1. **organizations** - Organization data
2. **profiles** - User profiles (extends auth.users)
3. **roles** - System roles
4. **departments** - Organizational units
5. **calling_trees** - Tree configurations
6. **tree_nodes** - Tree structure (self-referential)
7. **notifications** - Notification messages
8. **notification_recipients** - Delivery tracking
9. **notification_responses** - User responses
10. **documents** - Resource library
11. **device_tokens** - Push notification tokens
12. **audit_logs** - Activity tracking

---

## 🚀 Deployment Architecture

### Infrastructure:
- **Backend**: Supabase (managed PostgreSQL, Auth, Storage, Realtime)
- **Web Hosting**: Vercel or Netlify (free tier)
- **Mobile**: Expo EAS Build & Submit
- **Monitoring**: Sentry (error tracking), Supabase Dashboard
- **CDN**: Cloudflare (optional, for assets)

---

## 📈 Scalability Considerations

1. **Database**: Indexes, materialized views, partitioning
2. **Caching**: React Query caching, Supabase caching
3. **Real-time**: Filtered subscriptions, pagination
4. **Push Notifications**: Batch processing, queue system
5. **Storage**: CDN for documents, image optimization

---

## 🧪 Testing Strategy

### Testing Levels:
1. **Unit Tests**: Business logic, utilities
2. **Integration Tests**: API calls, database operations
3. **E2E Tests**: Complete workflows
4. **Mobile Tests**: UI testing, notification handling
5. **Load Tests**: Concurrent users, bulk notifications
6. **Security Tests**: RLS policies, unauthorized access

---

## 🎯 MVP Features (Phase 1)

### Must-Have:
- ✅ User authentication (Google, Apple)
- ✅ Basic user management
- ✅ Create simple calling tree
- ✅ Assign users to tree nodes
- ✅ Send emergency notification
- ✅ Push notifications on mobile
- ✅ Respond with basic options
- ✅ Real-time response tracking
- ✅ Basic reporting

### Phase 2 (Post-MVP):
- Document management
- Advanced analytics
- Message templates
- Scheduled notifications
- Audit logs
- Offline mobile support

---

## 💡 Technical Best Practices

1. **API Design**: RESTful with Supabase conventions
2. **Mobile**: Test on physical devices for push notifications
3. **Real-time**: Use Supabase Realtime with proper filters
4. **Database**: Leverage RLS for security
5. **Performance**: Optimize queries, implement pagination
6. **Error Handling**: Graceful degradation, user-friendly messages
7. **Accessibility**: WCAG 2.1 AA compliance

---

## 🎨 UI/UX Principles

### Design Principles:
1. **Clarity in Crisis**: High contrast, large buttons, minimal steps
2. **Accessibility**: Screen reader support, keyboard navigation
3. **Cross-Platform Consistency**: Same features, platform-appropriate UX
4. **Mobile-First**: Thumb-friendly, offline capable, low data
5. **Speed**: Fast launch, instant response, cached content

### Color Coding:
- 🔴 **Red**: Critical emergency
- 🟠 **Orange**: Warning
- 🔵 **Blue**: Information
- 🟢 **Green**: All-clear/Safe
- ⚫ **Gray**: No response/Inactive

---

## 📱 Supabase Free Tier Optimization

### Limits:
- Database: 500 MB
- Storage: 1 GB
- Edge Functions: 500K invocations/month
- Bandwidth: 5 GB/month

### Optimization Strategies:
1. Efficient schema design
2. Archive old data (90+ days)
3. Compress images
4. Batch Edge Function calls
5. Implement client-side caching
6. Use database triggers instead of functions where possible

---

## 🔮 Future Enhancements

1. Multi-language support
2. SMS/Voice fallback (paid)
3. Geofencing alerts
4. AI-powered insights
5. Third-party integrations
6. White-labeling
7. Advanced workflow automation
8. Mobile offline mode enhancements

---

## 📚 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Supabase | Database, Auth, Storage, Realtime |
| **Web Frontend** | React + TypeScript | Admin portal |
| **Mobile** | React Native + Expo | iOS & Android apps |
| **UI Library** | Tailwind + shadcn/ui | Web components |
| **State Management** | Zustand + React Query | Global state + server state |
| **Push Notifications** | Expo Push | Mobile notifications |
| **Visualization** | React Flow + Recharts | Tree builder + Analytics |
| **Hosting** | Vercel/Netlify | Web deployment |
| **Monitoring** | Sentry | Error tracking |

---

## 🎓 Key References

- Supabase Documentation: https://supabase.com/docs
- React Native Expo: https://docs.expo.dev/
- Push Notifications: https://docs.expo.dev/push-notifications/overview/
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- React Flow: https://reactflow.dev/
- Tailwind CSS: https://tailwindcss.com/
- shadcn/ui: https://ui.shadcn.com/

---

*This blueprint serves as the comprehensive technical foundation for the CallTree Emergency Communication System.*


