'use strict'

const utils = require('./migrationUtils');

exports.up = function(next) {
  utils.uploadShapeFile({
    tableName: 'national_mvum_trails',
    directoryName: 'national_mvum_trails',
    filename: 'S_USA.Trail_MVUM',
    srid: '4269'
  });

  utils.mergeIntoTrailsTable({
    baseTableName: 'trails',
    mergingTableName: 'national_mvum_trails',
    name: 'name',
    sourceId: 'id',
    geog: 'geog',
    sourceUrl: 'https://data.fs.usda.gov/geodata/edw/edw_resources/meta/S_USA.Road_MVUM.xml',
  }, next);
};

exports.down = function(next) {
  utils.genericQuery("DELETE FROM trails WHERE source = 'https://data.fs.usda.gov/geodata/edw/edw_resources/meta/S_USA.Road_MVUM.xml'", next);
};