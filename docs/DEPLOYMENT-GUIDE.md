# AirPad MVP - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** 2025-10-30

---

## Prerequisites

### Required
- Node.js 18.x or higher
- npm 9.x or higher
- Modern web browser (Chrome 90+, Edge 90+)

### For Production
- Vercel account (recommended) or
- Any Node.js hosting platform
- HTTPS enabled (required for camera/microphone access)

---

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/airpad.git
cd airpad
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` to customize settings:

```env
# Enable/disable features
NEXT_PUBLIC_FEATURE_HAND_TRACKING=true
NEXT_PUBLIC_FEATURE_VOICE_COMMANDS=true

# Audio settings
NEXT_PUBLIC_DEFAULT_KIT=drums
NEXT_PUBLIC_DEFAULT_VOLUME=0.7

# Performance
NEXT_PUBLIC_RENDER_OPTIMIZATION=true
```

---

## Local Development

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build & Test Locally

```bash
# Full validation
npm run validate

# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Preview production build
npm start
```

---

## Production Deployment

### Option 1: Vercel (Recommended)

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Via GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Configure environment variables
4. Deploy automatically

**Environment Variables to Set:**
- `NEXT_PUBLIC_FEATURE_HAND_TRACKING=true`
- `NEXT_PUBLIC_FEATURE_VOICE_COMMANDS=true`
- `NEXT_PUBLIC_DEFAULT_KIT=drums`

### Option 2: Docker

```bash
# Build image
docker build -t airpad-mvp .

# Run container
docker run -p 3000:3000 airpad-mvp
```

### Option 3: Manual Node.js Hosting

```bash
# Build for production
npm run build

# Start production server
npm start
```

Requirements:
- Node.js 18+
- HTTPS certificate
- Port 3000 exposed (or configure)

---

## Performance Optimization

### Static Asset Optimization

Audio files are already optimized, but you can further compress:

```bash
# Install ffmpeg
# Then compress audio files (optional)
cd public/kits/drums
for file in *.wav; do
  ffmpeg -i "$file" -c:a pcm_s16le -ar 44100 "compressed_$file"
done
```

### CDN Configuration

For production, serve static assets from CDN:

1. Upload `public/kits/` to CDN
2. Update `getSamplePath()` in `lib/utils/helpers.ts`:

```typescript
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || ''
return `${CDN_URL}/kits/${kitType}/${config.samples[padIndex]}`
```

---

## Browser Permissions

### HTTPS Requirement

Camera and microphone access require HTTPS. Local development works on `http://localhost`, but production MUST use HTTPS.

### Permission Prompts

Users will see permission requests for:
1. **Camera Access** - Required for hand tracking
2. **Microphone Access** - Required for voice commands

**Graceful Degradation:**
- If camera denied: Hand tracking disabled, UI controls available
- If microphone denied: Voice commands disabled, manual buttons available

---

## Monitoring & Analytics

### Performance Monitoring

Enable in production:

```env
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

Access metrics via browser console:

```javascript
// In browser console
window.performanceMonitor?.logReport()
```

### Error Tracking (Optional)

Integrate Sentry or similar:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Troubleshooting

### Build Errors

**Error:** `Cannot find module 'tone'`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Error:** `MediaPipe not found`
```bash
# Solution: Reinstall MediaPipe
npm install @mediapipe/hands @mediapipe/camera_utils
```

### Runtime Issues

**Issue:** Audio not playing
- Check browser console for errors
- Verify HTTPS is enabled
- Check AudioContext state (should be "running")

**Issue:** Hand tracking not working
- Verify camera permissions granted
- Check lighting conditions
- Ensure hands are visible in frame

**Issue:** Voice commands not responding
- Verify microphone permissions
- Check Web Speech API support
- Try manual fallback buttons

---

## Security Considerations

### Content Security Policy

Add to `next.config.js`:

```javascript
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
]
```

### Rate Limiting

For production API endpoints (if added), implement rate limiting:

```bash
npm install express-rate-limit
```

---

## Scaling Considerations

### Current Architecture Limits

- **Concurrent Users:** Unlimited (client-side only)
- **Sample Storage:** ~3MB per user (browser cache)
- **No Backend Required:** Fully client-side MVP

### Future Scaling Options

1. **Backend API:** For user accounts, saved loops
2. **WebSocket Server:** For multi-player jams
3. **CDN:** For faster sample loading globally

---

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

### Adding New Kits

1. Add audio files to `public/kits/YOUR_KIT/`
2. Update `lib/utils/helpers.ts` `getKitConfig()`
3. Add to types: `types/audio.ts` `KitType`
4. Test and deploy

---

## Rollback Procedure

### Vercel

```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback DEPLOYMENT_URL
```

### Manual

```bash
# Checkout previous tag
git checkout v1.0.0

# Rebuild and redeploy
npm run build
npm start
```

---

## Support & Resources

- **Documentation:** `docs/` folder
- **Issues:** GitHub Issues
- **Performance:** Check `docs/INTEGRATION-REPORT.md`

---

## Checklist Before Deployment

- [ ] All tests passing (`npm run validate`)
- [ ] Environment variables configured
- [ ] HTTPS certificate installed
- [ ] Browser permissions tested
- [ ] Performance benchmarks acceptable
- [ ] Error tracking configured (optional)
- [ ] Monitoring enabled (optional)
- [ ] Backup/rollback plan ready

---

**Deployment Status:** ✅ Ready for Production

Last validated: 2025-10-30

