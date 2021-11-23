const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "src/App.ts"), //path to the main .ts file
    output: {
        filename: "[name].js", //name for the js file that is created/compiled in memory
        path: path.resolve(__dirname, "dist"),
        //sourceMapFilename: "bundleName.js.map",
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
        https: {
            cert: fs.readFileSync("./cert.crt"),
            key: fs.readFileSync("./cert.key"),
            ca: fs.readFileSync("./ca.crt"),
        },
        //http: require.resolve("stream-http"),
        host: "0.0.0.0",
        port: 8080,
        hot: true,
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader", 'source-map-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
            favicon: "./chess_XR.png"
        }),
        new CleanWebpackPlugin(),
    ],
    mode: "development",
};