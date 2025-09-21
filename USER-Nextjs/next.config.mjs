/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5008",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "booking-stadium.online",
      },
    ],
  },
};

export default nextConfig;
