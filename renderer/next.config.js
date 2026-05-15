/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true
    },
    trailingSlash: true,
    // تجاوز مشكلة ignoreDeprecations
    experimental: {
        workerThreads: false,
        cpus: 1
    }
};

module.exports = nextConfig;