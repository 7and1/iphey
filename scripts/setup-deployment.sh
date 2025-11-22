#!/bin/bash
set -e

echo "🚀 IPhey Deployment Setup Script"
echo "=================================="
echo ""

# Check if .deploy.env exists
if [ ! -f .deploy.env ]; then
    echo "❌ Error: .deploy.env file not found"
    echo "📝 Please copy .deploy.env.example to .deploy.env and fill in your credentials"
    echo ""
    echo "   cp .deploy.env.example .deploy.env"
    echo "   # Then edit .deploy.env with your actual credentials"
    exit 1
fi

# Load environment variables from .deploy.env
echo "📥 Loading credentials from .deploy.env..."
export $(cat .deploy.env | grep -v '^#' | grep -v '^$' | xargs)

# Validate required variables
if [ -z "$GITHUB_TOKEN" ] || [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "   Please ensure GITHUB_TOKEN, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_ACCOUNT_ID are set in .deploy.env"
    exit 1
fi

# Get GitHub username
GITHUB_USERNAME=$(gh api user -q .login 2>/dev/null || echo "")
if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: Unable to get GitHub username. Please ensure you're logged in with 'gh auth login'"
    exit 1
fi

echo "✅ GitHub username: $GITHUB_USERNAME"
echo ""

# Check if repo already exists on GitHub
REPO_NAME="iphey"
REPO_EXISTS=$(gh repo view "$GITHUB_USERNAME/$REPO_NAME" --json name -q .name 2>/dev/null || echo "")

if [ -z "$REPO_EXISTS" ]; then
    echo "📦 Creating GitHub repository: $GITHUB_USERNAME/$REPO_NAME (public)..."
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --description="IPhey - Browser Fingerprint & Digital Identity Inspector"
    echo "✅ Repository created"
else
    echo "✅ Repository already exists: $GITHUB_USERNAME/$REPO_NAME"
    # Add remote if not exists
    if ! git remote get-url origin &> /dev/null; then
        git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    fi
fi

echo ""

# Set GitHub secrets
echo "🔐 Setting GitHub secrets..."

gh secret set CLOUDFLARE_API_TOKEN --body "$CLOUDFLARE_API_TOKEN" --repo "$GITHUB_USERNAME/$REPO_NAME"
echo "✅ CLOUDFLARE_API_TOKEN set"

gh secret set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID" --repo "$GITHUB_USERNAME/$REPO_NAME"
echo "✅ CLOUDFLARE_ACCOUNT_ID set"

# Set NEXT_PUBLIC_API_URL if provided
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
    gh secret set NEXT_PUBLIC_API_URL --body "$NEXT_PUBLIC_API_URL" --repo "$GITHUB_USERNAME/$REPO_NAME"
    echo "✅ NEXT_PUBLIC_API_URL set"
fi

echo ""
echo "🎯 Committing and pushing code..."

# Add all files
git add .

# Create initial commit if no commits yet
if ! git rev-parse HEAD &> /dev/null; then
    git commit --no-verify -m "Initial commit: IPhey - Browser Fingerprint & Digital Identity Inspector

- Complete SEO optimization with 1000+ words content
- Cookie consent banner
- Footer with proper credits
- Multilingual support removed (English only)
- Cloudflare Pages deployment configured
- GitHub Actions CI/CD setup"
    echo "✅ Initial commit created"
else
    # Check if there are changes to commit
    if ! git diff-index --quiet HEAD --; then
        git commit --no-verify -m "Update deployment configuration"
        echo "✅ Changes committed"
    else
        echo "ℹ️  No changes to commit"
    fi
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main
echo "✅ Code pushed to GitHub"

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Visit https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "   2. Go to Actions tab to see the deployment workflow"
echo "   3. Once deployed, visit your Cloudflare Pages dashboard to get the URL"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://iphey.pages.dev (or your custom domain)"
echo ""
