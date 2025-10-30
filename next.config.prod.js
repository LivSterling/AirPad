/** @type {import('next').NextConfig} */

// Production-optimized Next.js configuration
const nextConfig = {
  reactStrictMode: true,
  
  // Transpile packages that need it
  transpilePackages: ['tone'],
  
  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Performance & security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Permissions Policy for camera and microphone
          {
            key: 'Permissions-Policy',
            value: 'camera=self, microphone=self, geolocation=()'
          }
        ],
      },
      // Cache static assets aggressively
      {
        source: '/kits/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  // Output configuration
  output: 'standalone',
  
  // Experimental features
  experimental: {
    optimizeCss: true,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Tone.js separate chunk (large library)
            tone: {
              name: 'tone',
              test: /[\\/]node_modules[\\/]tone[\\/]/,
              priority: 30
            },
            // MediaPipe separate chunk
            mediapipe: {
              name: 'mediapipe',
              test: /[\\/]node_modules[\\/]@mediapipe[\\/]/,
              priority: 30
            },
            // Common chunk for frequently used code
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
      }
    }
    
    return config
  },
}

module.exports = nextConfig

