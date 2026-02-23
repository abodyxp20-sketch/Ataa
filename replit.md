# Ataa (عطاء) - AI School Exchange Platform

## Overview

Ataa is an Arabic-first AI-powered school resource exchange platform that enables students to donate and exchange educational materials. The application features intelligent content moderation using Google's Gemini AI for image analysis and semantic search, a gamification system with badges and social points, and a bilingual interface (Arabic/English) with RTL support.

The platform allows students to upload items they want to donate, which are then analyzed by AI for safety and automatically categorized. Teachers and admins can moderate submissions, while students can browse the marketplace, request items, and earn recognition through a points and badge system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript, using Vite as the build tool
- **Routing**: React Router DOM v7 with HashRouter for client-side navigation
- **Styling**: Tailwind CSS loaded via CDN with custom iOS 26-inspired design system featuring glassmorphism, squircle shapes, and mesh gradient backgrounds
- **Typography**: Cairo and Almarai fonts for Arabic, Inter for English text
- **Icons**: Lucide React icon library

### State Management
- React useState and useEffect hooks for local component state
- Props drilling for shared state across components
- localStorage-based persistence layer simulating a database

### Data Layer
- **Mock Firebase Implementation**: The `lib/firebase.ts` file implements a localStorage-based engine that mimics Firebase's API surface (auth, Firestore operations) without requiring actual Firebase setup
- **Data Operations**: CRUD operations via `getLocalData`, `setLocalData` helper functions
- **Auth Simulation**: Mock authentication with `onAuthStateChanged` pattern, supporting login/signup flows with special admin credentials

### AI Integration
- **Google Gemini AI** (`@google/genai` package) for:
  - Image analysis and safety moderation (detecting inappropriate content)
  - Auto-generation of item names and descriptions
  - Semantic search mapping natural language queries to filters
  - Admin dashboard insights generation
- API key configured via environment variable `GEMINI_API_KEY`

### Internationalization
- Bilingual support (Arabic `ar` / English `en`)
- RTL layout support with dynamic direction switching
- Translation strings centralized in `lib/translations.ts`

### Gamification System
- Social points earned through donations
- Badge system with unlockable achievements (First Giver, Eco Hero, Top Donor, Ataa Legend)
- Leaderboard functionality

### User Roles
- **Students**: Can donate items, browse marketplace, request items
- **Teachers**: Moderation access for approving/rejecting submissions
- **Admins**: Full administrative access with AI-powered insights dashboard

## External Dependencies

### AI Services
- **Google Gemini API**: Used for image analysis, content moderation, semantic search, and generating admin insights. Requires `GEMINI_API_KEY` environment variable.

### NPM Packages
- `@google/genai`: Google's Generative AI SDK for Gemini integration
- `react-router-dom`: Client-side routing
- `lucide-react`: Icon components
- `qrcode.react`: QR code generation for item exchange

### Data Storage
- Currently uses browser localStorage as a mock database
- Firebase-compatible API surface in place for potential migration to actual Firebase/Firestore

### External Assets
- Google Fonts (Cairo, Almarai, Inter)
- Tailwind CSS via CDN
- Unsplash images for hero sections