//
// Traverse the files
//
var Q = require('q');
var fs = require('fs');
var config = require('../config');
var walker = require('walk');

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
function readFiles(lunar) {
  
  var deferred = Q.defer();

  var rootDir = config.root;
  var files = [];
  var walker = walk.walk(rootDir, options);
  walker.on("file", function (root, fileStats, next) {
    if (isJavascript(fileStats.name)) {
      files.push({root: fixPath(root), name: fileStats.name});
    }
    next();
  });

  walker.on("end", function () {
    console.log("all done");
    return deferred.resolve([lunar, rootDir, files]);
  });

  return deferred.promise;

};

// fix their paths (remove root prefix)

// if they are javascript files, add them to the lunar lib

function handleError(err) {
  console.log('We had an error:', err);
};

function isJavascript(file) {
  (/^[a-z0-9]+\.js$/).test(file)
}

function fixPath(path) {
  console.log('Path:', path);

  if (path.charAt(0) === '\/') {

  }
  return path;
}
