module.exports = {
  apps: [
    {
      name: "oforo-ai",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      cwd: "/var/www/oforo-website",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      error_file: "/var/log/pm2/oforo-error.log",
      out_file: "/var/log/pm2/oforo-out.log",
      time: true,
    },
  ],
};
