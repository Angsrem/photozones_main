import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // В sandbox-окружении next/image endpoint добавляет Content-Disposition: attachment,
    // из-за чего браузер не отображает картинки inline. Отключаем оптимизацию —
    // изображения уже оптимизированы (JPEG, 72-214K).
    unoptimized: true,
  },
};

export default nextConfig;
