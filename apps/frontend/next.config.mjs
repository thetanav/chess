import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        // Point to monorepo workspace root so Next is resolvable
        root: path.join(__dirname, '..', '..'),
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'pbs.twimg.com' },
        ],
    },
};

export default nextConfig;
