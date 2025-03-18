import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zero Paper User",
    short_name: "ZeroPaper",
    description: "Manage your receipts digitally",
    start_url: "/",
    display: "standalone",
    background_color: "#1B9D65",
    theme_color: "#1B9D65",
    icons: [
      {
        src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/App%20Icon-XYlf8BBgRgRnCU5wYnIMyUgwQkrYA2.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/App%20Icon-XYlf8BBgRgRnCU5wYnIMyUgwQkrYA2.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}

