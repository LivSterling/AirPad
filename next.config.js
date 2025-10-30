/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Use SWC for faster minification
  swcMinify: true,

  // Transpile packages that use ES modules
  transpilePackages: ['tone'],

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },

  // Image optimization
  images: {
    domains: [], // Add external image domains if needed
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Power settings for development
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Public runtime configuration (accessible in browser)
  publicRuntimeConfig: {
    appName: 'AirPad MVP',
    appVersion: '0.1.0',
    mediapipeCdn: process.env.NEXT_PUBLIC_MEDIAPIPE_CDN || 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    features: {
      handTracking: process.env.NEXT_PUBLIC_FEATURE_HAND_TRACKING === 'true',
      voiceControl: process.env.NEXT_PUBLIC_FEATURE_VOICE_CONTROL === 'true',
      recording: process.env.NEXT_PUBLIC_FEATURE_RECORDING === 'true',
    },
  },

  // Server runtime configuration (server-side only)
  serverRuntimeConfig: {
    // Server-only secrets go here
  },

  // HTTP headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Permissions Policy for camera and microphone
          {
            key: 'Permissions-Policy',
            value: 'camera=self, microphone=self',
          },
        ],
      },
      {
        // Cache audio files for better performance
        source: '/Kits/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Optimize for audio and media files
  webpack: (config, { isServer, dev }) => {
    // Audio file handling
    config.module.rules.push({
      test: /\.(wav|mp3|ogg|flac)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/sounds/[hash][ext]',
      },
    });

    // Bundle analyzer (only when ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: true,
        })
      );
    }

    // Optimization for production
    if (!dev && !isServer) {
      // Code splitting optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Tone.js in separate chunk (it's large)
            tone: {
              name: 'tone',
              test: /[\\/]node_modules[\\/](tone)[\\/]/,
              priority: 40,
            },
            // MediaPipe in separate chunk
            mediapipe: {
              name: 'mediapipe',
              test: /[\\/]node_modules[\\/](@mediapipe)[\\/]/,
              priority: 30,
            },
            // Zustand and other state management
            state: {
              name: 'state',
              test: /[\\/]node_modules[\\/](zustand)[\\/]/,
              priority: 20,
            },
            // React and related libraries
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 10,
            },
            // Common vendor chunk
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 5,
            },
          },
        },
      };
    }

    return config;
  },

  // Output configuration
  output: 'standalone', // Optimized for deployment
}

module.exports = nextConfig
