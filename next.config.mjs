/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    sassOptions: {

    },
    typescript: {
        // Allow production builds to pass even when TypeScript has errors.
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
