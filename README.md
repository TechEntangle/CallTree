# CallTree - Emergency Communication System

A hierarchical emergency notification system that allows organizations to rapidly disseminate critical information through a structured calling tree.

## 🎯 Overview

CallTree enables organizations to send emergency notifications that cascade through a hierarchical structure, ensuring rapid and efficient communication during critical situations. The system includes real-time response tracking, automatic escalation, and comprehensive analytics.

## 🏗️ Project Structure

```
CallTree/
├── backend/          # Supabase migrations and edge functions
├── web/             # React admin portal (Vite + TypeScript)
├── mobile/          # React Native mobile app (Expo)
├── shared/          # Shared types and utilities
├── docs/            # Documentation
├── BLUEPRINT.md     # System architecture and design
├── PROJECT_PLAN.md  # Development plan with tasks
└── CREDENTIALS.md   # Supabase and OAuth credentials (not in git)
```

## 🛠️ Tech Stack

### Backend
- **Supabase**: PostgreSQL database, Authentication, Real-time, Storage
- **Row Level Security (RLS)**: Database-level security
- **Edge Functions**: Serverless functions for business logic

### Web (Admin Portal)
- **React 18** with TypeScript
- **Vite**: Build tool and dev server
- **Tailwind CSS** + **shadcn/ui**: Styling and components
- **React Query**: Server state management
- **Zustand**: Client state management
- **React Flow**: Visual tree builder
- **Recharts**: Analytics and charts

### Mobile (iOS & Android)
- **React Native** with Expo
- **TypeScript**: Type safety
- **React Navigation**: Navigation
- **Expo Push Notifications**: Push notifications
- **React Native Paper**: UI components

### Authentication
- **Social OAuth**: Google Sign-In, Apple Sign-In
- **Supabase Auth**: Authentication provider

## ✨ Key Features

- **Visual Calling Tree Builder**: Drag-and-drop interface to create notification hierarchies
- **Push Notifications**: Real-time notifications on iOS and Android
- **Cascade Logic**: Automatic level-by-level notification progression
- **Response Tracking**: Real-time monitoring of notification responses
- **Timeout & Escalation**: Automatic backup contact activation
- **Document Management**: Emergency resources and evacuation maps
- **Analytics & Reporting**: Comprehensive notification performance metrics
- **Multi-tenant**: Support for multiple organizations
- **Role-Based Access Control**: Granular permissions system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Git
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Supabase account

### Installation

Coming soon...

## 📱 Mobile App

- **iOS**: Available on TestFlight (coming soon)
- **Android**: Available on Google Play (coming soon)

## 🔐 Security

⚠️ **IMPORTANT**: This repository is **PRIVATE**. Never commit sensitive files:
- `CREDENTIALS.md` (git-ignored) - Contains all API keys and passwords
- `.env*` files (git-ignored) - Environment variables

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

**Security Features:**
- Row Level Security (RLS) on all database tables
- OAuth 2.0 for authentication (Google + Apple Sign-In)
- Encrypted data at rest and in transit
- GDPR compliant

## 📄 License

MIT License - See LICENSE file for details

## 👥 Authors

- **TechEntangle** - [GitHub](https://github.com/TechEntangle)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📞 Support

For support, email support@calltree.app or open an issue on GitHub.

---

**Built with ❤️ for emergency preparedness and rapid communication**

