module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    devServer: {
        overlay: {
            warnings: false,
            errors: false
        },
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    }
};
