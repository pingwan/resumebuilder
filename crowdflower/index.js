var request = require('request');
// Base url of each request
var baseUrl = "https://api.crowdflower.com/v1/";
// API key (private)
var API_KEY = "xq8tGbMQtwno8Sg5J3E1";
// Identifier of the job the data will be added to
var job_id = "708538";

var postTask = function(task, callback) {
    // build URL
    var url = baseUrl + "jobs/" + job_id + "/units.json"

    // Make request
    request
        .post(url, {form:{
            key: API_KEY,
            unit: {
                data: task,
                state: 'new'
            }
        }},callback);
};


module.exports = {
    postTask: postTask
};
