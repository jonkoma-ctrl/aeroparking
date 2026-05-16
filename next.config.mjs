/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Vercel Blob (todas las stores)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Unsplash (seeds y placeholders)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Blogger (imagen actual del Hero, default seed)
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
      // Higgsfield CDN (imágenes generadas con Nano Banana)
      { protocol: "https", hostname: "d8j0ntlcm91z4.cloudfront.net" },
    ],
  },
};

export default nextConfig;
