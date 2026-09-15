# 📱 iPhone Deployment Guide - Travel Expense Tracker

## Complete Step-by-Step Setup (Takes ~15 minutes)

---

## STEP 1: Create Supabase Account (Database)

### 1.1 Sign Up
1. Open this link: https://supabase.com
2. Tap "Start your project for free"
3. Tap "Continue with GitHub"
4. Authorize Supabase to access your GitHub
5. Create your account

### 1.2 Create a New Project
1. You'll see "New project" button
2. Tap it
3. Fill in:
   - Project name: travel-expense-tracker
   - Database password: Save this somewhere safe!
   - Region: Choose closest to you
4. Tap "Create new project" (wait 2-3 minutes for setup)

### 1.3 Get Your Keys
1. Once project is ready, go to Settings (bottom left)
2. Click API
3. Copy these values and SAVE THEM:
   - Project URL
   - Anon public key

### 1.4 Run Database Setup
1. In Supabase, click SQL Editor (left menu)
2. Click New Query
3. Copy entire SQL migration from database/migrations/001_init.sql
4. Paste into the query editor
5. Tap the blue play button to run
6. Wait for Success message

Supabase is ready!

---

## STEP 2: Deploy to Vercel

### 2.1 Sign Up for Vercel
1. Open: https://vercel.com/signup
2. Tap "Continue with GitHub"
3. Authorize and create account

### 2.2 Import Your Repository
1. You'll see your repositories
2. Find travel-expense-tracker
3. Tap Import

### 2.3 Set Environment Variables
1. You'll see "Environment Variables" section
2. Add Variable 1:
   - Name: VITE_SUPABASE_URL
   - Value: [Paste your Project URL from Step 1.3]
3. Add Variable 2:
   - Name: VITE_SUPABASE_ANON_KEY
   - Value: [Paste your Anon public key from Step 1.3]

### 2.4 Deploy
1. Tap Deploy
2. Wait 2-3 minutes for build to complete
3. You'll see a success message with your URL

Your app is LIVE!

---

## STEP 3: Test Your App

1. Click the URL Vercel gave you
2. Your Travel Expense Tracker opens!
3. Sign up with your email
4. Create your first trip
5. Add some expenses

---

## You're Done!

Your App is now live on the internet!
