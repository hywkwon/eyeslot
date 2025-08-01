/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 환경 변수 추가
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL, // Vercel에서 설정한 Supabase URL
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY, // Vercel에서 설정한 Supabase anon key
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL, // 클라이언트에서 사용할 Supabase URL
  },

  // CORS 설정 추가
  async headers() {
    return [
      {
        source: '/api/:path*', // API 경로에 대해 CORS 설정을 추가
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://eyeslot.com', // eyeslot.com 도메인을 허용
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS', // 필요한 HTTP 메소드 허용
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization', // 필요한 헤더 허용
          },
        ],
      },
    ];
  },
};

export default nextConfig;
