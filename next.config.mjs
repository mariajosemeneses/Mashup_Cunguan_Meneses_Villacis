/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://us-east-1.aws.data.mongodb-api.com/app/data-nukkzxu/endpoint/data/v1/:path*', // Proxy a tu API de MongoDB
            },
        ]
    },
};

export default nextConfig;
