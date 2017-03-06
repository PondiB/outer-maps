'use strict'

const utils = require('./migrationUtils');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path').normalize;
const execSync = require('child_process').execSync;
const env = require('../environment/development');
const directoryName = "idaho_trails"
const workingDir = path(env.libDirectory + "/" + directoryName);

exports.up = function(next) {
  convertCrazyKmlAttributes();

  if (!fs.existsSync(path(workingDir + "/idaho-nonmotorized.shp"))) {
    execSync(`ogr2ogr -nlt LINESTRING -skipfailures idaho-nonmotorized.shp idaho-nonmotorized-converted.geojson`, {cwd: workingDir});
  };

  utils.uploadShapeFile({
    tableName: 'idaho_trails',
    directoryName: 'idaho_trails',
    filename: 'idaho-nonmotorized',
    srid: '4326'
  });

  utils.mergeIntoTrailsTable({
    baseTableName: 'trails',
    mergingTableName: 'idaho_trails',
    name: 'name',
    sourceId: 'sourceId',
    geog: 'geog',
    sourceUrl: 'http://data.gis.idaho.gov/datasets?q=trails',
  }, next);
};

exports.down = function(next) {
  utils.genericQuery("DELETE FROM trails WHERE source = 'http://data.gis.idaho.gov/datasets?q=trails'", next);
};

const convertCrazyKmlAttributes = function() {
  const readPath = path(env.libDirectory + "/" + directoryName + "/idaho-nonmotorized.geojson");
  const writePath = path(env.libDirectory + "/" + directoryName + "/idaho-nonmotorized-converted.geojson");


  if (fs.existsSync(writePath)) return;

  const parser = new xml2js.Parser({strict:false});
  const trails = JSON.parse(fs.readFileSync(readPath, 'utf8'));
  let newTrails = Object.assign({}, trails);

  trails.features.forEach((feature, i) => {
    const parsedAttributes = parser.parseString(feature.properties.description, function(err, result) {
      if (err) throw err;
      let name = result.HTML.BODY[0].TABLE[0].TR[1].TD[0].TABLE[0].TR[1].TD[1];

      newTrails.features[i].properties = {
        name: (name && name !== 'Null' && name !== '<Null>') ? name : '',
        sourceId: i,
      }
    })
  });

  fs.writeFileSync(writePath, JSON.stringify(newTrails));
}
