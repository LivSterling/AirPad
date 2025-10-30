# Next.js Configuration Guide

This document explains the production optimizations and configuration settings in `next.config.js`.

## Overview

The AirPad MVP Next.js configuration is optimized for:
- **Performance**: Code splitting, minification, compression
- **Security**: HTTP headers, permissions policies
- **Audio/Media**: Optimized handling of audio files
- **Bundle Analysis**: Tools to monitor and optimize bundle size
- **Deployment**: Standalone output for production

## Configuration Sections

### 1. Core Settings

```javascript
reactStrictMode: true        // Enhanced development warnings
swcMinify: true             // Fast minification with SWC
compress: true              // Enable gzip compression
poweredByHeader: false      // Remove X-Powered-By for security
```

### 2. Production Optimizations

#### Source Maps
```javascript
productionBrowserSourceMaps: false
```
- **Purpose**: Reduce bundle size in production
- **Impact**: ~30-40% smaller bundles
- **Trade-off**: Harder to debug production issues (use staging with source maps enabled)

#### Console Removal
```javascript
compiler: {
  removeConsole: {
    exclude: ['error', 'warn']
  }
}
```
- **Purpose**: Remove console.log statements in production
- **Keeps**: error and warn logs for monitoring
- **Impact**: Cleaner production code, slight performance improvement

### 3. Image Optimization

```javascript
images: {
  domains: [],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
}
```

- **Formats**: Modern formats (AVIF, WebP) for smaller file sizes
- **Caching**: 60-second minimum cache TTL
- **Domains**: Add external image domains as needed

### 4. Runtime Configuration

#### Public Runtime Config (Client-Side)
```javascript
publicRuntimeConfig: {
  appName: 'AirPad MVP',
  appVersion: '0.1.0',
  mediapipeCdn: process.env.NEXT_PUBLIC_MEDIAPIPE_CDN,
  features: {
    handTracking: true,
    voiceControl: true,
    recording: true,
  }
}
```

**Access in code:**
```typescript
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
console.log(publicRuntimeConfig.appName) // 'AirPad MVP'
```

#### Server Runtime Config (Server-Side Only)
```javascript
serverRuntimeConfig: {
  // Server-only secrets
}
```

**Use for:** API keys, database credentials, server-side secrets

### 5. Security Headers

The configuration applies security headers to all routes:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-DNS-Prefetch-Control` | `on` | Enable DNS prefetching |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | `camera=self, microphone=self` | Restrict camera/mic access |

#### Audio File Caching

Audio files in `/Kits/` are cached aggressively:

```javascript
headers: [
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
  }
]
```

- **Cache Duration**: 1 year (31536000 seconds)
- **Immutable**: Files never change (use content hashing)
- **Impact**: Faster subsequent loads, reduced bandwidth

### 6. Webpack Customizations

#### Audio File Handling

```javascript
test: /\.(wav|mp3|ogg|flac)$/,
type: 'asset/resource',
generator: {
  filename: 'static/sounds/[hash][ext]',
}
```

- **Supported Formats**: WAV, MP3, OGG, FLAC
- **Output**: `static/sounds/` with content hashing
- **Benefit**: Efficient caching with unique filenames

#### Bundle Analyzer

Enabled when `ANALYZE=true` environment variable is set:

```bash
npm run analyze
```

**Output:**
- `analyze/client.html` - Client bundle analysis
- `analyze/server.html` - Server bundle analysis

**Use to:**
- Identify large dependencies
- Optimize code splitting
- Track bundle size growth

#### Code Splitting Strategy

Production builds use optimized code splitting:

```javascript
splitChunks: {
  cacheGroups: {
    tone: { priority: 40 },      // Tone.js (large audio library)
    mediapipe: { priority: 30 }, // MediaPipe libraries
    state: { priority: 20 },     // Zustand state management
    react: { priority: 10 },     // React core
    commons: { priority: 5 }     // Shared code
  }
}
```

**Benefits:**
- Parallel loading of dependencies
- Better caching (vendor code changes less frequently)
- Smaller initial bundle size

**Expected Bundle Sizes:**
- `tone.js`: ~200-300KB
- `mediapipe.js`: ~100-150KB
- `react.js`: ~150-200KB
- `main.js`: ~50-100KB

### 7. Output Configuration

```javascript
output: 'standalone'
```

- **Purpose**: Optimized for Docker and serverless deployment
- **Creates**: Self-contained production build
- **Includes**: All dependencies in `.next/standalone/`

## Environment-Specific Behavior

### Development Mode

```bash
NODE_ENV=development npm run dev
```

- ✅ Source maps enabled
- ✅ Console logs preserved
- ✅ Fast refresh enabled
- ✅ Detailed error messages
- ❌ No minification
- ❌ No code splitting optimization

### Production Mode

```bash
NODE_ENV=production npm run build
```

- ✅ Minification with SWC
- ✅ Code splitting optimized
- ✅ Console logs removed (except errors/warnings)
- ✅ Compression enabled
- ❌ Source maps disabled
- ❌ Fast refresh disabled

## Performance Impact

| Optimization | Bundle Size Reduction | Build Time Impact |
|--------------|----------------------|-------------------|
| Source map removal | -30-40% | None |
| Console removal | -2-5% | None |
| Code splitting | N/A | +10-20s |
| Minification | -40-50% | +20-30s |
| Compression | -60-70% (gzip) | Minimal |

**Overall Impact:**
- Production bundle: ~500-800KB gzipped (from ~2-3MB uncompressed)
- Initial load time: 2-4 seconds on 3G
- Subsequent loads: <1 second (cached)

## Troubleshooting

### Build Fails with "Cannot find module 'webpack-bundle-analyzer'"

```bash
npm install --save-dev webpack-bundle-analyzer
```

### Headers Not Applied

- Check that `async headers()` is properly defined
- Verify no conflicting headers in middleware
- Test with: `curl -I http://localhost:3000`

### Audio Files Not Caching

- Verify files are in `/Kits/` directory (case-sensitive)
- Check browser DevTools Network tab for Cache-Control header
- Clear browser cache and test again

### Bundle Too Large

1. Run bundle analyzer: `npm run analyze`
2. Identify large dependencies
3. Consider dynamic imports for large libraries
4. Review and remove unused dependencies

### Code Splitting Not Working

- Verify `NODE_ENV=production` is set
- Check webpack optimization config
- Run `npm run analyze` to visualize chunks

## Customization

### Adding New Audio Formats

Edit the webpack test regex:

```javascript
test: /\.(wav|mp3|ogg|flac|aac|m4a)$/,
```

### Adjusting Cache Duration

Edit the audio cache header:

```javascript
value: 'public, max-age=2592000, immutable', // 30 days
```

### Adding External Image Domains

```javascript
images: {
  domains: ['cdn.example.com', 'images.example.com'],
}
```

### Custom Code Splitting

Add new cache group:

```javascript
myLibrary: {
  name: 'my-library',
  test: /[\\/]node_modules[\\/](my-library)[\\/]/,
  priority: 25,
}
```

## Deployment Notes

### Vercel

- Configuration automatically optimized for Vercel
- No additional setup required
- Edge functions supported

### Docker

```dockerfile
# Use standalone output
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

CMD ["node", "server.js"]
```

### AWS/Azure/GCP

- Use `output: 'standalone'` build
- Deploy `.next/standalone/` directory
- Set `NODE_ENV=production`
- Configure CDN for static assets

## Monitoring

### Bundle Size Monitoring

Add to CI/CD:

```yaml
- name: Analyze Bundle
  run: npm run analyze
  
- name: Check Bundle Size
  run: |
    if [ $(wc -c < .next/static) -gt 1000000 ]; then
      echo "Bundle too large!"
      exit 1
    fi
```

### Performance Metrics

Use Next.js analytics:

```javascript
// pages/_app.tsx
export function reportWebVitals(metric) {
  console.log(metric)
  // Send to analytics service
}
```

## Next Steps

1. Monitor bundle size after adding new dependencies
2. Run `npm run analyze` monthly to track growth
3. Consider implementing dynamic imports for code splitting
4. Add performance budgets in CI/CD
5. Monitor Core Web Vitals in production


