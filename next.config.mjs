/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Vercel Blob (todas las stores)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Unsplash (seeds y placeholders)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Blogger (referencia legacy, opcional — sin uso activo)
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
