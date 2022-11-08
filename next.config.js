/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  redirects() {
    return [
      {
        source: "/",
        destination: "/preview",
        permanent: false,
      },
    ];
  },
};
