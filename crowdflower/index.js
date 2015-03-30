var request = require('request');
var baseUrl = "https://api.crowdflower.com/v1/";


API_KEY = "xq8tGbMQtwno8Sg5J3E1";
job_id = "708538";

var postTask = function(task, callback) {
    var url = baseUrl + "jobs/" + job_id + "/units.json"

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
