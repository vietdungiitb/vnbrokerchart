const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

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
      },
      compress: true,
      port: 8080,
      hot: true,
      client: {
        overlay: false,
      },
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
  };
};
