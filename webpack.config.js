const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    target: "node",
    entry: [path.resolve(__dirname, "src/App.ts")],
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        //clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ["ts-loader", 'source-map-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        /*new HtmlWebpackPlugin({
            inject: false,
            template: "./public/index.html",
            favicon: "./chess_XR.png"
        }),*/
        new CopyPlugin({
            patterns: [
                "public"
            ]
        }),
        new CleanWebpackPlugin(),
    ],
    mode: "development",
};
/*devServer: {
    https: {
        cert: fs.readFileSync("./cert.crt"),
        key: fs.readFileSync("./cert.key"),
        ca: fs.readFileSync("./ca.crt"),
    },
    host: "0.0.0.0",
    port: 8080,
    hot: true,
},*/