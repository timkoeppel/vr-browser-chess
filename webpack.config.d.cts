import HtmlWebpackPlugin = require("html-webpack-plugin");
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyPlugin = require("copy-webpack-plugin");
export const target: string;
export const entry: string[];
export namespace output {
    const filename: string;
    const path: string;
    const clean: boolean;
}
export namespace resolve {
    const extensions: string[];
}
export const devtool: string;
export namespace module {
    const rules: {
        test: RegExp;
        use: string[];
        exclude: RegExp;
    }[];
}
export const plugins: (HtmlWebpackPlugin | CleanWebpackPlugin | CopyPlugin)[];
export const mode: string;
