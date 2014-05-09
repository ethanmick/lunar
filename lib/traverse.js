//
// Traverse the files
//
var Q = require('q');
var fs = require('fs');
var config = require('../config');
var walk = require('walk');
var async = require('async');
var readline = require('readline');
var stream = require('stream');

exports.traverse = function() {

  createLunar()
    .then(readFiles)
    .spread(writeFiles)
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
  var options = {
    followLinks: false,
    filters: ["Temp", "_Temp"]
  };
  var walker = walk.walk(rootDir, options);
  walker.on("file", function (root, fileStats, next) {
    if (isJavascript(fileStats.name)) {
      files.push({root: fixPath(root, rootDir, lunar), oldRoot: root,  name: fileStats.name});
    }
    next();
  });

  walker.on("end", function () {
    console.log("all done");
    return deferred.resolve([lunar, rootDir, files]);
  });

  return deferred.promise;

};

function writeFiles(lunar, rootDir, files) {
  console.log('files', files);

  var deferred = Q.defer();
  
  async.each(files, function(file, callback) {

    fs.mkdir(file.root, function(err) {

      var oldPathToFile = file.oldRoot + '/' + file.name;
      var newPathToFile = file.root + file.name;

      console.log('Reading from: ' + oldPathToFile + ' and writing to: ' + newPathToFile);

      var instream = fs.createReadStream(oldPathToFile);
      var outstream = fs.createWriteStream(newPathToFile);
      var rl = readline.createInterface(instream, outstream);

      var lineNum = 0;
      var lastLine = undefined;
      rl.on('line', function(line) {
	if (lineNum === 0) {
	  outstream.write(new Buffer('var __lunar = {}\n'));
	}

	if (canInstrument(line, lastLine)) {
	  outstream.write(new Buffer('__lunar[' + lineNum + '] = 0;\n'));
	  outstream.write(new Buffer(line + '\n'));
	} else {
	  outstream.write(new Buffer(line + '\n'));
	}

	if (isCode(line)) {
	  lastLine = line;
	}

	lineNum++;
      });

      rl.on('close', function() {
	console.log('Closing file: ', file.name);
	outstream.end();
	// do something on finish here
	callback();
      });

      rl.on('error', function(err) {
	console.log('Got an error:', err);
      });

    });

  }, function(err) {
    if (err) return deferred.reject(err);
    console.log('Done Created files!');
    return deferred.resolve();
  });

  return deferred.promise;

};

// fix their paths (remove root prefix)

// if they are javascript files, add them to the lunar lib

function handleError(err) {
  console.log('We had an error:', err);
};

function isJavascript(file) {
  return (/^[a-z0-9]+\.js$/).test(file)
}

function fixPath(path, top, lunar) {
  var regex = new RegExp('^(' + top + '\/?)', 'i');
  return path.replace(regex, lunar + '/');
}

function canInstrument(line, lastLine) {
  console.log('Last Line: ', lastLine);
  console.log('Line:', line);
  return line.trim().charAt(0) != '.' &&
    isCode(line) &&
    lastLine &&
    lastLine.indexOf(';') == -1;
}

function isCode(line) {
  return line.trim().length != 0 && line.trim().indexOf('//') != 0;
}
