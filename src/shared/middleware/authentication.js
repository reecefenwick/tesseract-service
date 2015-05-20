module.exports = {
        isAuthenticated: function(req, res, next) {
        // Check Auth - call next or respond with 401
        next();
    }
};