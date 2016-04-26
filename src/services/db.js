/**
 * Wrapper for Loki DB
 */
module.exports = ["$window", function ($window) {
    return new $window.loki('db');
}]
