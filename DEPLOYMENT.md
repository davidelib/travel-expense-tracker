# Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites
- Vercel account (free tier available)
- GitHub repository connected to Vercel
- Supabase project with database configured

### Steps

1. **Connect Repository**
   - Go to vercel.com and sign in
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Build Settings**
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at a vercel.app domain

### Custom Domain
- Go to "Domains" in Vercel project settings
- Add your custom domain
- Update DNS settings as instructed by Vercel

## Deploy to Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

## Local Testing Before Deployment

```bash
npm run build
npm run preview
```

This will build the production version and allow you to test it locally.
