module.exports = app => {
    function test(request, response) {
        response.send("Hi!");
    }

    app.get('/api/test', test);
};