/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.canva.com' },
      { protocol: 'https', hostname: '**.canva.us' },
      { protocol: 'https', hostname: 'notion.so' },
      { protocol: 'https', hostname: '**.notion.so' },
      { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com' },
      { protocol: 'https', hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com' },
    ],
  },
}

module.exports = nextConfig
