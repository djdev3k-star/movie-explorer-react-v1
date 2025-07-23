# Netlify Deployment Guide

This guide will help you deploy the Movie Trek application on Netlify.

## Prerequisites

1. A [GitHub](https://github.com) account
2. A [Netlify](https://netlify.com) account
3. A [TMDB](https://www.themoviedb.org/) API key

## Deployment Steps

### 1. Fork and Clone the Repository

1. Fork this repository to your GitHub account
2. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/movie-trek-react-v1.git
   cd movie-trek-react-v1
   ```

### 2. Prepare Your Environment Variables

1. Create a `.env` file in your project root:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
2. Add this file to `.gitignore` (should already be there)

### 3. Deploy to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select your forked repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### 4. Configure Environment Variables

1. Go to Site settings → Environment variables
2. Add the following variable:
   - Key: `TMDB_API_KEY`
   - Value: Your TMDB API key
3. Save the changes

### 5. Configure Build Settings

Your `netlify.toml` file should already contain the correct settings:

```toml
[build]
command = "npm run build"
publish = "dist"
functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 6. Deploy

1. Trigger a manual deploy:
   - Go to the "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
2. Wait for the build to complete
3. Your site will be live at `your-site-name.netlify.app`

## Troubleshooting

### Common Issues

1. **Build Fails**

   - Ensure all dependencies are installed
   - Check build logs for specific errors
   - Verify environment variables are set correctly

2. **API Calls Not Working**

   - Verify TMDB_API_KEY is set correctly in Netlify environment variables
   - Check browser console for API errors
   - Verify API endpoints in the Network tab

3. **Routing Issues**
   - Ensure redirects are properly configured in `netlify.toml`
   - Check if the site works locally with `npm run dev`

### Getting Help

If you encounter issues:

1. Check the build logs in Netlify
2. Review the browser console for errors
3. Open an issue in the repository
4. Search Netlify's documentation

## Maintaining Your Deployment

### Updates

When you make changes to your fork:

1. Commit your changes
2. Push to GitHub
3. Netlify will automatically rebuild and deploy

### Monitoring

1. Use Netlify's deploy logs to monitor builds
2. Check the "Functions" tab to monitor API proxy usage
3. Review site analytics in Netlify

## Security Notes

1. Never commit your `.env` file
2. Always use environment variables for sensitive data
3. Regularly rotate your API keys
4. Monitor your API usage on TMDB

## Additional Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
