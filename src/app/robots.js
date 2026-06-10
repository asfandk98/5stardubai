// src/app/robots.js

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/payment/",
        ],
      },
    ],
    sitemap: "https://api.alainhotel.com/sitemap.xml",
  }
}