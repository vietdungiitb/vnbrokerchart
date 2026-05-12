const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const brandManifest = require("../brand/brand.manifest.json");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const devServerPort = Number(process.env.PORT || 3000);

  return {
    entry: {
      "react-stockcharts-demo": "./src/demo/index.tsx",
    },
    output: {
      path: path.resolve(__dirname, "../build"),
      filename: "[name].[contenthash].js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "react-stockcharts": path.resolve(__dirname, "../src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.csv$/i,
          type: "asset/source",
        },
        {
          test: /\.(js|jsx)$/,
          use: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/demo/index.html",
        filename: "index.html",
        title: brandManifest.siteTitle.vi,
        description: brandManifest.tagline.vi,
        themeColor: brandManifest.themeColor,
        backgroundColor: brandManifest.backgroundColor,
        author: "Phạm Việt Dũng",
        shortName: brandManifest.shortName,
        favicon: path.resolve(__dirname, "../brand/assets/favicon-32.png"),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "../build"),
      },
      proxy: {
        "/api": {
          target: process.env.VNINVEST_API_PROXY_TARGET || "http://127.0.0.1:80",
          changeOrigin: true,
        },
        // Native SaaS core-api endpoints use /core/v1/ prefix
        "/core": {
          target: process.env.VNINVEST_API_PROXY_TARGET || "http://127.0.0.1:80",
          changeOrigin: true,
        },
      },
      compress: true,
      port: devServerPort,
      hot: true,
      client: {
        overlay: false,
      },
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
  };
};
