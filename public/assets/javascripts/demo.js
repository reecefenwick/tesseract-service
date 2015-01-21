$(function(){
    $('#demoUploadForm').ajaxForm({
        statusCode: {
            200: function(res) {
                console.log(res);
                fetchResults(res._id, function(result) {
                    console.log(result);
                })
            },
            500: function(res) {
                alert('There was an error uploading the file')
            }
        }
    })
});

var fetchResults = function(_id, callback) {
    console.log('get')
    setInterval(function(){
        $.ajax({
            type: "GET",
            url: "/job/" + _id,
            statusCode: {
                200: function(res) {
                    if (res.body.result) return callback(result);
                },
                500: function(res) {
                    return alert('Something went wrong.')
                },
                404: function(res) {
                    return alert('Job not found.')
                }
            }
        })
    }, 3000);

};

var displayResults = function(results) {
  $('#results').html(results);
};