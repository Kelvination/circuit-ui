# Deploy Bouncy Game to Vercel

This guide shows you how to deploy the Bouncy Game to Vercel for free.

## Option 1: Vercel GitHub Integration (Recommended - Easiest)

This method automatically deploys your game whenever you push to GitHub.

### Steps:

1. **Push your code to GitHub** (already done!)
   - Your game is on branch: `claude/mobile-browser-game-011CUKGnFQhsMkCjELGidZpQ`

2. **Visit Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in (it's free)

3. **Import your GitHub repository**
   - Click "Add New Project"
   - Click "Import Git Repository"
   - Select your `circuit-ui` repository
   - Click "Import"

4. **Configure the project**
   - Vercel will auto-detect the settings from `vercel.json`
   - **Important**: Make sure these settings are correct:
     - Build Command: `pnpm build:game`
     - Output Directory: `dist-game`
     - Install Command: `pnpm install`

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - You'll get a free `.vercel.app` URL!

6. **Access on your phone**
   - Open the provided URL on your mobile device
   - Add to home screen for a native app-like experience

### Future Deployments

Once set up, Vercel will automatically redeploy whenever you push to your repository!

## Option 2: Vercel CLI (Manual)

If you prefer using the command line:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the project root**
   ```bash
   vercel --prod
   ```

4. **Follow the prompts**
   - Confirm the settings
   - Your game will be deployed!

## Option 3: Deploy Standalone HTML File

The easiest option if you just want to test:

1. **Use the standalone file**
   - Open `game/bouncy-game-standalone.html`
   - This file works anywhere without building

2. **Upload to any static host**
   - GitHub Pages
   - Netlify Drop
   - Surge.sh
   - Or any web hosting service

3. **Or use Claude Artifacts**
   - Copy the contents of `bouncy-game-standalone.html`
   - Paste into Claude chat
   - Ask Claude to create an artifact
   - Publish and get a `claude.site` URL

## Custom Domain (Optional)

Once deployed to Vercel, you can add a custom domain:

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build fails on Vercel
- Check that `pnpm` is being used (not npm)
- Verify `vercel.json` settings are correct
- Check build logs for specific errors

### Game doesn't load
- Clear browser cache
- Check browser console for errors
- Verify all assets are in the `dist-game` folder

### Can't access on mobile
- Make sure you're using HTTPS (Vercel provides this automatically)
- Try opening in different browsers
- Check if mobile data/WiFi is working

## Your Deployed URLs

Once deployed, you'll get:
- Production URL: `https://your-project.vercel.app`
- Preview URLs for each branch/commit
- Automatic SSL certificate (HTTPS)

Enjoy your game!
