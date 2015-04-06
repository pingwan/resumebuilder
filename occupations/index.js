'use strict';

var parse = require('csv-parse');
var transform = require('stream-transform');
var fs = require('fs');
var ld = require('levenshtein');
var Title = require('./models/title.occupation.model.js');
var Group = require('./models/group.occupation.model.js');
var crowdflower = require('crowdflower');

// globals
var titles = [];
var groups = [];

// Writes groups to DB
var GrouptoDb = transform(function(el, callback) {
    // Make group from supplied data
    var group = new Group(el);
    group.save(function(err) {
        if(err) {
            console.log("Something went wrong");
        } else {
            groups.push(group);
        }
    });
    callback(null, JSON.stringify(el));
});
// Writes titles to DB
var TitletoDb = transform(function(el, callback) {
    // Make title from supplied data
    var title = new Title(el);

    title.save(function(err) {
        if(err) {
            console.log("Something went wrong");
        } else {
            titles.push(title);
        }
    });
    callback(null, JSON.stringify(el));
});
// gets titles either from the db, otherwise from file
var getTitle = function(callback) {
    Title.find({}, function(err, title){
        // No groups in DB
        if(err || title.length < 1) {
            readTitleFromFile().pipe(TitletoDb).on('finish', callback);
        } else {
            titles = title;
            callback();
        }
    })
};
// gets groups either from the db, otherwise from file
var getGroup = function(callback) {
    Group.find({}, function(err, grps){
        // No groups in DB
        if(err || grps.length < 1) {
            readGroupsFromFile().pipe(GrouptoDb).on('finish', callback);
        } else {
            groups = grps;
            callback();
        }
    })
};

// Function to read titles from a file and pipe them to the db
var readTitleFromFile = function() {
    var parser = parse({delimiter: ','});
    var titleStream = fs.createReadStream(__dirname + "/job titles.csv");
    var toObj = transform(function (el, callback) {
        var title = {
            code: el[0].replace('-', ''),
            name: el[2]
        };
        titles.push(title);
        callback(null, title);
    });

    return titleStream.pipe(parser).pipe(toObj)//.pipe(toDb);
};

// Function to read groups from a file and pipe them to the db
var readGroupsFromFile = function() {
    var parser = parse({delimiter:','});
    var groupStream = fs.createReadStream(__dirname+'/job groups.csv');
    var toObj = transform(function (el, callback) {
        var group = {
            code: el[0].replace('-', ''),
            name: el[1]
        };
        groups.push(group);
        callback(null, group);
    });

    return groupStream.pipe(parser).pipe(toObj);
};

// Function to find the closes related
var getMin = function(query, collection) {
    var mindist = 999999;
    var minobj = {min:{code:999999}, distance:9999};
    var exact = false;

    // Loop over all known groups
    for(var i = 0; i < collection.length; i++) {
        var lev = new ld(query.toLowerCase(), collection[i].name.toLowerCase());
        var dist = lev.distance;
        // check if the group contains the searched group
        if(collection[i].name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            // check if the found group is closer to the query
            if(!exact || dist < mindist) {
                minobj = {
                    min: collection[i],
                    distance: 0
                };
                mindist = dist;
            }
            exact = true;
        }
        // for as long as no exact match has been found, look for close resemblances.
        if(!exact) {
            var lev = new ld(query.toLowerCase(), collection[i].name.toLowerCase());
            var dist = lev.distance;
            if(dist<mindist) {
                minobj = {
                    min: collection[i],
                    distance: dist
                };
                mindist = dist;
            }
        }
    }
    return minobj;
};

// get the code that belongs to a title
var getTitleCode = function(title, callback) {
    getTitle(function() {
        var proposal = getMin(title, titles);
        if(proposal.distance > 5 || proposal.distance >= title.length){
            crowdflower.postTask({'entry_title':title},callback);
        } else {
            callback(proposal.min);
        }
    });
};

// get the code that belongs to a group
var getGroupCode = function(group, callback) {
    getGroup(function() {
        var proposal = getMin(group, groups);
        if(proposal.distance > 5 || proposal.distance >= group.length) {
            callback({message: "Code could not be found"})
        } else {
            callback(proposal.min);
        }
    });
};

// calculate the resemblance. Each level of the code that is the same will increase the score by one.
// score from 0 through 4
var getResemblance = function(code1, code2) {
    var majorGroup1 = code1.slice(0,2);
    var minorGroup1 = code1.slice(2,3);
    var broadOccup1 = code1.slice(3,5);
    var smallOccup1 = code1.slice(-1);

    var majorGroup2 = code2.slice(0,2);
    var minorGroup2 = code2.slice(2,3);
    var broadOccup2 = code2.slice(3,5);
    var smallOccup2 = code2.slice(-1);

    var score = 0;
    if(majorGroup1 == majorGroup2) {
        score++;
        if(minorGroup1 == minorGroup2) {
            score++;
            if(broadOccup1 == broadOccup2) {
                score++;
                if(smallOccup1 == smallOccup2) {
                    score++;
                }
            }
        }
    }
    return score;
};

module.exports = exports = {
    getTitleCode: getTitleCode,
    getGroupCode: getGroupCode,
    getResemblance: getResemblance

};