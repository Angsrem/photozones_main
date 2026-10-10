import type { NextConfig } from "next";

// Content-Security-Policy.
// В dev добавляем 'unsafe-eval' для HMR webpack; в prod — строгий список источников.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://mc.yandex.ru https://yandex.ru https://yandex.st`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https:`,
  `media-src 'self' blob:`,
  `connect-src 'self' https://api.telegram.org https://api.resend.com https://mc.yandex.ru https://yandex.ru`,
  `frame-src https://yandex.ru https://mc.yandex.ru`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  images: {
    // В sandbox-окружении next/image endpoint добавляет Content-Disposition: attachment,
    // из-за чего браузер не отображает картинки inline. Отключаем оптимизацию —
    // изображения уже оптимизированы (JPEG, 72-214K).
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
