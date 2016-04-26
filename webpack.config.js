module.exports = {
    // entry: ["./src/main.js"],
    entry: ["./src/main.js"],
    output: {
        path: __dirname,
        filename: "vocab.js"
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel?presets[]=es2015' },
            { test: /\.html$/, loader: 'html' }
        ]
    },
    resolve: {
        extensions: ["", ".web.js", ".js"]
    }
}
