/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    trailingSlash: true,
    sassOptions: {

    },
    typescript: {
        // Allow production builds to pass even when TypeScript has errors.
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
