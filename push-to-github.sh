#!/bin/bash
# Script to push CIVIZ project to GitHub

echo "🚀 Pushing CIVIZ project to GitHub..."
echo ""
echo "You'll be prompted for:"
echo "  Username: alcabal-1"
echo "  Password: Your GitHub Personal Access Token (starts with ghp_)"
echo ""
echo "If you don't have a token yet:"
echo "1. Go to: https://github.com/settings/tokens/new"
echo "2. Name: CIVIZ Token"
echo "3. Check 'repo' scope"
echo "4. Generate and copy the token"
echo ""
read -p "Press Enter when ready to push..."

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your project is now on GitHub at:"
    echo "   https://github.com/alcabal-1/civiz-web"
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo "   Make sure you're using your token (ghp_...) as the password, not your GitHub password."
fi