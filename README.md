**Smart Bookmark**

A real-time bookmark management application built using Next.js (App Router) and Supabase.
This application allows users to securely log in using Google OAuth, manage personal bookmarks, and see updates in real time across multiple browser tabs.
🔗 Live Demo
https://smart-bookmark-ab.vercel.app


# Features
Google OAuth authentication (Supabase Auth)
Private, user-specific bookmarks
Add and delete bookmarks
Real-time updates across browser tabs
Row Level Security (RLS) enforced at database level
Deployed on Vercel


# Tech Stack
Frontend: Next.js (App Router), TypeScript, Tailwind CSS
Backend / Database: Supabase (PostgreSQL)
Authentication: Supabase Google OAuth
Realtime: Supabase postgres_changes subscription
Deployment: Vercel


# Architecture Overview
Authentication
Implemented using Supabase Google OAuth.
After login, user session is validated on page load.
Only authenticated users can access the main page.

Database Design
bookmarks table with:
id (uuid)
user_id (references auth.users)
title
url
created_at
Data Privacy
Row Level Security (RLS) is enabled on the bookmarks table.

Policies enforce:
Users can only select their own bookmarks.
Users can only insert bookmarks with their own user_id.
Users can only delete their own bookmarks.
Privacy is enforced at the database level, not just in frontend filtering.

Real-Time Updates:
Implemented using Supabase Realtime with postgres_changes.
Subscribed to changes on the bookmarks table.
Subscription is filtered by user_id to ensure only relevant updates are received.
Updates propagate instantly across open tabs without manual refresh.

Local Setup Instructions
Clone the repository:
git clone https://github.com/akankshabharti19/smart-bookmark
cd smart-bookmark
Install dependencies:
npm install

Create a .env.local file in the root directory:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key

Run the development server:
npm run dev
Open: http://localhost:3000


# Deployment
The application is deployed on Vercel.
Production configuration required:
Adding Vercel domain to Google Cloud OAuth settings.
Adding Vercel domain to Supabase Authentication URL configuration.
Setting environment variables in Vercel dashboard.


# Challenges Faced & Solutions
1. OAuth Redirect Configuration
Ensuring Google OAuth worked correctly in both local and production environments required properly configuring:
Google Cloud authorized origins
Supabase redirect URLs
Vercel domain

2. Controlled vs Uncontrolled Input Warning
Resolved by ensuring state values for input fields never became undefined, preventing React warnings.

3. Real-Time Subscription Not Triggering
Initially, the subscription was set up before the authenticated user was available.
This was resolved by separating:
Authentication logic
Real-time subscription logic into two different useEffect hooks.

4. Data Isolation
Verified privacy by testing with multiple Google accounts to ensure users cannot access each other’s bookmarks.


# Design Decisions
Chose database-level security (RLS) instead of frontend-only filtering.
Used filtered realtime subscriptions to reduce unnecessary updates.
Focused on correctness, security, and clarity over adding extra features.