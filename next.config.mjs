const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const normalizedBasePath = rawBasePath
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    basePath: normalizedBasePath,
    assetPrefix: normalizedBasePath || undefined,
    trailingSlash: true,
    sassOptions: {

    },
    typescript: {
        // Allow production builds to pass even when TypeScript has errors.
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
