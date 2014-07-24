var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

module.exports = function () {
  var bowerContents;
  try {
    bowerContents = require(process.cwd() + path.sep + 'bower.json');
  } catch (e) {
    console.log('No bower.json meta file detected. I`m outta here');
    process.exit(128);
  }

  var requiredDependencies = bowerContents.dependencies || {};
  var devDependencies = bowerContents.devDependencies || {};

  var installedDependencies = {};
  var conflictedDependencies = {};

  // laod the bower meta (in case the components directory differs from the default)
  var bowerMeta = {};
  try {
    bowerMeta = JSON.parse(fs.readFileSync(process.cwd() + path.sep + '.bowerrc', 'utf-8'));
    bowerMeta.directory = bowerMeta.directory ? bowerMeta.directory : 'bower_components';
  } catch (e) {
    bowerMeta = {directory: 'bower_components'};
  };


  // is there a components folder?, otherwise we can exit because we have nothing to do
  if(!fs.existsSync(bowerMeta.directory)) {
    console.log('No bower components folder detected. I`m outta here');
    process.exit(0);
  }

  // validates a dependency
  var validateDependency = function (dependency, basePath, metaData) {
    var depPath = basePath + path.sep + dependency;
    // nothing to do if the dependency folder does not exist  
    if (!fs.existsSync(depPath)) return false;
  
    var meta;
    try {
      meta = require(depPath + path.sep + 'bower.json');
    } catch (e) {
      try {
        meta = require(depPath + path.sep + '.bower.json');
      } catch (e) {
        console.log('No bower.json/.bower.json meta file in module. Error. I`m outta here');
        process.exit(128);
      }
    }
  
    // check if this is a tagged git repo, then split to get the version
    var _version = metaData.split('#');
    var requestedVersion = metaData;
    if (Array.isArray(_version) && _version.length === 2) {
      requestedVersion = _version[1];
    }
  
    // check if requested version & installed version differ
    // if so, kill installed version
    if (requestedVersion !== meta.version) {
      console.log('Mismatch detected:', dependency, 'Inst.:', meta.version, 'Req.:', requestedVersion, 'Cleaning up!');
      rimraf.sync(depPath);
    }
  };

  var realpath = fs.realpathSync(bowerMeta.directory);
  // validate all requested runtime dependencies
  Object.keys(requiredDependencies).forEach(function (dependency) {
    validateDependency(dependency, realpath, requiredDependencies[dependency]);
  });

  // validate all requested dev dependencies
  Object.keys(devDependencies).forEach(function (dependency) {
    validateDependency(dependency, realpath, devDependencies[dependency]);
  });

  console.log('All done. Thanks for watching!');
};