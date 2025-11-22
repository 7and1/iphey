# IPhey Deployment Guide

This guide explains how to deploy IPhey to Cloudflare Pages using GitHub Actions.

## 🔐 Security Note

This project uses GitHub Secrets to store sensitive credentials securely. The deployment process never exposes API tokens in the codebase.

## 📋 Prerequisites

1. **GitHub Account** - You need a GitHub account to host the repository
2. **Cloudflare Account** - Sign up at [cloudflare.com](https://www.cloudflare.com/)
3. **GitHub CLI** - Install from [cli.github.com](https://cli.github.com/)

## 🚀 Quick Deployment

### Step 1: Setup Credentials

Copy the example environment file and fill in your credentials:

```bash
cp .deploy.env.example .deploy.env
```

Edit `.deploy.env` with your actual credentials:

```bash
# GitHub Personal Access Token
GITHUB_TOKEN=your_github_token_here

# Cloudflare API Token & Account ID
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here

# Production API URL (optional)
NEXT_PUBLIC_API_URL=https://api.iphey.org
```

### Step 2: Get Cloudflare Credentials

1. **Account ID**: Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Select your account → Copy Account ID from the sidebar
2. **API Token**: Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens) → Create Token → Use "Edit Cloudflare Workers" template

### Step 3: Get GitHub Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Generate and copy the token

### Step 4: Run Deployment Script

```bash
# Login to GitHub CLI (if not already logged in)
gh auth login

# Run the deployment setup script
./scripts/setup-deployment.sh
```

The script will:
- ✅ Create a public GitHub repository
- ✅ Set GitHub secrets securely
- ✅ Commit and push your code
- ✅ Trigger the first deployment via GitHub Actions

## 📦 Manual Deployment (Alternative)

If you prefer to set things up manually:

### 1. Create GitHub Repository

```bash
gh repo create iphey --public --source=. --remote=origin
```

### 2. Set GitHub Secrets

```bash
gh secret set CLOUDFLARE_API_TOKEN --body "your_token_here"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "your_account_id_here"
gh secret set NEXT_PUBLIC_API_URL --body "https://api.iphey.org"
```

### 3. Push Code

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## 🔄 Continuous Deployment

Once set up, every push to the `main` branch will automatically:

1. Build the Next.js application
2. Deploy to Cloudflare Pages
3. Make the site available at `https://iphey.pages.dev`

## 🌐 Custom Domain

To use a custom domain:

1. Go to Cloudflare Pages Dashboard
2. Select your project (iphey)
3. Go to "Custom domains" tab
4. Add your domain (e.g., `iphey.org`)
5. Follow DNS configuration instructions

## 📊 Monitoring Deployments

- **GitHub Actions**: https://github.com/your-username/iphey/actions
- **Cloudflare Pages**: https://dash.cloudflare.com/pages

## 🛠️ Local Development

The deployment configuration doesn't affect local development:

```bash
# Start development servers
npm run dev          # Backend API (port 4310)
npm run web:dev      # Frontend (port 3002)
```

## 🔍 Troubleshooting

### Build Fails with "Command not found: wrangler"

The GitHub Action uses `cloudflare/wrangler-action@v3` which includes wrangler. No additional setup needed.

### Secrets Not Working

Verify secrets are set correctly:

```bash
gh secret list
```

Re-set a secret if needed:

```bash
gh secret set SECRET_NAME --body "new_value"
```

### Deployment Shows Old Content

Clear Cloudflare Pages cache:

1. Go to Cloudflare Pages Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Retry deployment" on the latest deployment

## 📝 Files Reference

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `wrangler.toml` - Cloudflare Pages configuration
- `.deploy.env.example` - Template for credentials (safe to commit)
- `.deploy.env` - Actual credentials (gitignored, never committed)
- `apps/web-next/next.config.mjs` - Next.js static export config

## 🔒 Security Best Practices

1. ✅ Never commit `.deploy.env` to Git (already in `.gitignore`)
2. ✅ Use GitHub Secrets for CI/CD (done automatically by script)
3. ✅ Rotate tokens regularly
4. ✅ Use minimal permission scopes for tokens
5. ✅ Review GitHub Actions logs for any exposed secrets

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
