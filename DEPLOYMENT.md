# Deployment Guide

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (optional)

## Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run preview
```

## Environment Variables

Required variables for production:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## Troubleshooting

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

### Runtime Errors

1. Check browser console for errors
2. Verify Supabase credentials
3. Check network requests in DevTools
4. Review Supabase logs at https://supabase.com/dashboard

## Performance Optimization

- All assets are optimized by Vite
- CSS Modules prevent style conflicts
- React components use proper code splitting
- Images should be optimized before use

## Security

- Never commit .env files
- Use environment variables for secrets
- Enable RLS on Supabase tables
- Regularly update dependencies
