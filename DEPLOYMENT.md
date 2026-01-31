# Beta Deployment Guide

This guide covers deploying the Alpha study app to production using Dokploy.

## Prerequisites

- Dokploy account and server setup
- Convex Cloud project
- Domain name (for SSL)
- Environment variables configured

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Convex
CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com

# OpenRouter (for AI generation)
OPENROUTER_API_KEY=your-openrouter-api-key

# Application
PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

## Deployment Steps

### 1. Convex Cloud Production Setup

```bash
# Login to Convex
npx convex login

# Deploy to production
npx convex deploy

# Set environment variables in Convex dashboard
npx convex env set BETTER_AUTH_SECRET your-secret
npx convex env set OPENROUTER_API_KEY your-api-key
```

### 2. Dokploy Configuration

1. **Create Application in Dokploy:**
   - Name: `alpha-web`
   - Build Type: `Dockerfile`
   - Dockerfile Path: `apps/web/Dockerfile`
   - Context Path: `.`

2. **Environment Variables:**
   Add all variables from `.env.production` to Dokploy

3. **Domains:**
   - Add your domain (e.g., `alpha.yourdomain.com`)
   - Enable HTTPS/SSL
   - Configure redirect from HTTP to HTTPS

4. **Health Check:**
   - Path: `/health`
   - Interval: 30s
   - Timeout: 10s

### 3. Docling Service

1. **Create separate application:**
   - Name: `alpha-docling`
   - Build Type: `Dockerfile`
   - Dockerfile Path: `apps/docling/Dockerfile`
   - Context Path: `apps/docling`

2. **Environment Variables:**
   - `MAX_WORKERS=4`

3. **Port:**
   - Container Port: `8000`

### 4. Database Migration

The Convex schema will be automatically deployed. No manual migration needed.

### 5. Post-Deployment Verification

```bash
# Check web app health
curl https://your-domain.com/health

# Check docling service
curl https://docling.your-domain.com/health
```

## Beta Flag Configuration

During beta, all users are treated as paid users. Set the following in Convex dashboard:

```bash
npx convex env set BETA_MODE true
```

This bypasses plan checks in the application code.

## Monitoring

- **Logs:** Available in Dokploy dashboard
- **Metrics:** Convex dashboard for database metrics
- **Errors:** Check Sentry integration (if configured)

## Rollback

If deployment fails:

1. In Dokploy, select previous deployment
2. Click "Deploy" to rollback
3. Check logs for errors

## SSL/TLS

Dokploy automatically manages SSL certificates via Let's Encrypt. Ensure:
- Domain DNS points to Dokploy server
- HTTPS is enabled in domain settings
- Certificate is valid (auto-renews)

## Backup Strategy

Convex Cloud provides automatic backups. For additional safety:
- Export critical data weekly
- Store exports in secure location
- Test restore process monthly
