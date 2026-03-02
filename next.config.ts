import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ✅ AMÉLIORÉ : ajout des domaines manquants (Resend, maps pour livraison)
          {
            key: 'Content-Security-Policy',
            value: [
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.supabase.co",
              "connect-src 'self' https://api.stripe.com https://*.supabase.co https://api.resend.com",
              "frame-src 'self' https://js.stripe.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "object-src 'none'",         // Bloque Flash et plugins obsolètes
              "base-uri 'self'",            // Empêche l'injection de balise <base>
              "form-action 'self'",         // Les formulaires ne postent que sur votre domaine
            ].join('; ')
          },

          // 🆕 Empêche votre site d'être intégré dans un iframe (clickjacking)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // 🆕 Empêche le navigateur de deviner le type MIME (injection de scripts)
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          // 🆕 Contrôle ce qui est envoyé dans le header Referer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // 🆕 Désactive les APIs navigateur non utilisées
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',           // Pas de caméra
              'microphone=()',       // Pas de micro
              'geolocation=(self)', // GPS uniquement sur votre domaine (livraison)
              'payment=(self https://js.stripe.com)', // Paiement uniquement via Stripe
            ].join(', ')
          },
        ],
      },

      // ✅ Le webhook ne doit jamais être mis en cache
      {
        source: '/api/webhook',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache' },
        ],
      },
    ]
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  compress: true,

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ['error'] } : false,
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "valkha",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // 🚀 LE CORRECTIF EST ICI : On interdit à Sentry d'alourdir le Middleware
  autoInstrumentMiddleware: false,
  
  // 🚀 BONUS : Nouvelle syntaxe pour cacher les source maps et alléger le build côté Vercel
  sourcemaps: {
    disable: true,
  },

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },
});