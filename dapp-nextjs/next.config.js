/** @type {import('next').NextConfig} */
const withPlugins = require("next-compose-plugins");

/** eslint-disable @typescript-eslint/no-var-requires */
const withTM = require("next-transpile-modules")([
  "@solana/wallet-adapter-base",
  // Uncomment wallets you want to use
  // "@solana/wallet-adapter-bitpie",
  // "@solana/wallet-adapter-coin98",
  // "@solana/wallet-adapter-ledger",
  // "@solana/wallet-adapter-mathwallet",
  "@solana/wallet-adapter-phantom",
  // "@solana/wallet-adapter-react",
  "@solana/wallet-adapter-solflare",
  // "@solana/wallet-adapter-sollet",
  // "@solana/wallet-adapter-solong",
  // "@solana/wallet-adapter-torus",
  // "@solana/wallet-adapter-wallets",
  "@qpools/sdk",
  // "@project-serum/sol-wallet-adapter",
  // "@solana/wallet-adapter-ant-design",
]);

// add this if you need LESS
// also install less and less-loader
// const withLess = require("next-with-less");

const plugins = [
  // add this if you need LESS
  // [withLess, {
  //   lessLoaderOptions: {
  //     /* ... */
  //   },
  // }],
  [
    withTM,
    {
      webpack5: true,
      reactStrictMode: true,
    },
  ],
];

const nextConfig = {
  env: {
    NEXT_PUBLIC_CLUSTER_URL: process.env.NEXT_PUBLIC_CLUSTER_URL,
    NEXT_PUBLIC_CLUSTER_NAME: process.env.NEXT_PUBLIC_CLUSTER_NAME,
    NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID,
    // NODE_PATH: process.env.NODE_PATH
  },
  // distDir: "build",
  swcMinify: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      // FIX this
      // Disable minimize to make it work with Candy Machine template
      // minimization brakes Public Key names
      config.optimization.minimize = false;
    }
    return config;
  },
  images: {
    domains: [
        'registry.saber.so',
        'spl-token-icons.static-assets.ship.capital',
        'cdn.jsdelivr.net',
    ],
  }
};

module.exports = withPlugins(plugins, nextConfig);
