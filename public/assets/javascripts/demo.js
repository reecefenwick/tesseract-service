$(function(){
    $('#demoUploadForm').ajaxForm({
        statusCode: {
            201: function(res) {
                console.log(res);
                setTimeout(function() {
                    fetchResults(res._id)
                }, 2000);
            },
            500: function(res) {
                alert('There was an error uploading the file')
            }
        }
    })
});

var fetchResults = function(_id) {
    $.ajax({
        type: "GET",
        url: "/job/" + _id,
        statusCode: {
            200: function(res) {
                if (res.complete) {
                    return displayResults(res.result || res.error)
                }

                setTimeout(function() {
                    fetchResults(_id)
                }, 1000);
            },
            500: function(res) {
                return alert('Something went wrong.')
            },
            404: function(res) {
                return alert('Job not found.')
            }
        }
    })
};

var displayResults = function(result) {
  $('#results').html(result).fadeIn(500);
};