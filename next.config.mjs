/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {

    },
    typescript: {
        // Allow production builds to pass even when TypeScript has errors.
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
