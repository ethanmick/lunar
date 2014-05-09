//
// Traverse the files
//
var Q = require('q');
var fs = require('fs');
var config = require('../config');

exports.traverse = function() {

  createLunar()
    .fail(handleError)
    .done();
};


// create the lunar directory of it doesn't exist
function createLunar() {
  var deferred = Q.defer();

  fs.mkdir(config.lunar, function(err) {
    if (err && err.code != 'EEXIST') return deferred.reject(err);
    return deferred.resolve(config.lunar);
  });

  return deferred.promise;
};

// traverse all files in config.root

// fix their paths (remove root prefix)

// if they are javascript files, add them to the lunar lib

function handleError(err) {
  console.log('We had an error:', err);
};
