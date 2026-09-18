# Deployment Guide

## Production Checklist

- [ ] Environment variables configured in your hosting provider
- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Static host configured for the built app
- [ ] Error monitoring configured (optional)

## Build

```bash
npm install
npm run build
```

The generated output will be in the `dist/` folder.

## Environment Variables

Required variables for production:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Static Hosting

This repository no longer includes a Vercel GitHub Actions deployment workflow. You can deploy the app using any static host that supports Vite builds, for example:

- Netlify
- Cloudflare Pages
- GitHub Pages
- Vercel via manual deploy

Typical steps:

1. Run `npm run build`.
2. Upload the `dist/` folder to your static host.
3. Add the environment variables in the host UI.
4. Publish the site.

## Troubleshooting

### Build errors

1. Clear dependencies and reinstall:

```bash
rm -rf node_modules
npm install
```

2. Check TypeScript errors:

```bash
npx tsc --noEmit
```

### Runtime errors

1. Check the browser console
2. Verify Supabase credentials
3. Check network requests in DevTools
4. Review Supabase logs

## Security

- Never commit `.env.local` files
- Use environment variables for secrets
- Keep RLS enabled on Supabase tables
- Only use anonymous keys in the frontend
- Keep service-role keys server-side only
