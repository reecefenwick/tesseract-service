var interval = null;
$(function(){
    $('#demoUploadForm').ajaxForm({
        statusCode: {
            200: function(res) {
                console.log(res);
                interval = setInterval(fetchResults(res._id), 3000);
            },
            500: function(res) {
                alert('There was an error uploading the file')
            }
        }
    })
});

var fetchResults = function(_id) {
    console.log('get');
    interval = setInterval(function(){
        $.ajax({
            type: "GET",
            url: "/job/" + _id,
            statusCode: {
                200: function(res) {
                    console.log(res.result);
                    if (res.result) {
                        clearInterval(interval);
                        interval = null;
                        displayResults(res.result)
                    }
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

var displayResults = function(result) {
  $('#results').html(result).fadeIn(500);
};