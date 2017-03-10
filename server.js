const http = require('http');
const pg = require('pg');
const express = require('express');
const browserify = require('browserify-middleware');
const geoViewport = require('geo-viewport');
const polyline = require('polyline');
const app = express();
const _ = require('underscore');
const env = require('./environment/development');
const geoJson = require('./modules/geoJson.js');

app.use(express.static('public'));

app.get('/bundle.js', browserify(__dirname + '/components/app.js', {
  mode: (process.env.NODE_ENV == 'production') ? 'production' : 'development',
  transform: ['babelify'],
  plugins: [{
    plugin: 'css-modulesify',
    options: { output: './public/bundle.css'}
  }]
}));

var pool = new pg.Pool({
  database: env.databaseName,
  max: 10,
  idleTimeoutMillis: 3000,
  user: env.dbUser
});

app.get('/api/:x1/:y1/:x2/:y2', function(request, response) {

  const query = `
    SELECT id, ST_AsGeoJson(geog) AS geog
    FROM trails
    WHERE ST_Intersects(geog,
      ST_MakeEnvelope(${request.params.x1}, ${request.params.y1}, ${request.params.x2}, ${request.params.y2})
    )
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();
      if (err) throw err;
      response.json(geoJson.make(result));
    })
  })
})

const getTrail = function(id, callback) {
  let query = `
    SELECT
      name,
      surface,
      ST_AsGeoJson(ST_Simplify(ST_LineMerge(geog::geometry), 0.0005)) as geog,
      ST_Length(geog) as distance,
      ST_AsGeoJson(ST_Centroid(geog::geometry)) as center,
      ST_AsGeoJson(ST_Envelope(geog::geometry)) as bounds
    FROM trails
    WHERE id = ${id}
    LIMIT 1
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();

      if (err) throw err;

      let r = result.rows[0]
      callback(Object.assign(result.rows[0], {bounds: geoJson.boxToBounds(JSON.parse(r.bounds))}));
    })
  })
}

app.get('/api/trails/:id', function(request, response) {
  getTrail(request.params.id, function(r){
    response.json({
      "name": r.name,
      "id": request.params.id,
      "surface": r.surface,
      "geography": JSON.parse(r.geog),
      "distance": r.distance,
      "center": JSON.parse(r.center).coordinates,
      "bounds": [[r.bounds[0],r.bounds[1]], [r.bounds[2], r.bounds[3]]]
    });
  })
})

app.get('/api/boundaries/:id', function(request, response) {
  let query = `
    SELECT
      name,
      ST_Area(geog) as area,
      ST_AsGeoJson(ST_Centroid(geog::geometry)) as center,
      ST_AsGeoJson(ST_Envelope(geog::geometry)) as bounds
    FROM boundaries
    WHERE id = ${request.params.id}
    LIMIT 1
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();

      if (err) throw err;

      const r = result.rows[0];
      const envelope = JSON.parse(r.bounds).coordinates[0];

      response.json({
        "name": r.name,
        "id": request.params.id,
        "area": r.area,
        "center": JSON.parse(r.center).coordinates,
        "bounds": [envelope[0], envelope[2]]
      });
    })
  })
})

app.get('/api/elevation/:id', function(request, response){
  const query = `
    select ST_AsGeoJson(geog) as geog
    FROM trails
    WHERE id = ${request.params.id}
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      if (err) throw err;

      var data = JSON.parse(result.rows[0].geog);
      var points = (data.type == "MultiLineString") ? _.flatten(data.coordinates, true) : data.coordinates;
      var elevations = [], distance = 0;

      points.forEach(function(point, i) {
        const query = `
          SELECT ST_Value(rast, ST_Transform(
            ST_GeomFromText(
              'POINT(${point[0]} ${point[1]})',
            4326), 4326)
          )
          FROM elevation
          WHERE rid=4
        `;
        client.query(query, function(err, result){
          if (err) throw err;
          if (result) elevations.push(result.rows[0].st_value);
          if (i + 1 >= points.length) {
            done();
            response.json(elevations);
          }
        })
      });
    });
  });
});

app.get('/api/boundaries/:x1/:y1/:x2/:y2', function(request, response) {
  const query = `
    SELECT id AS id, name AS name, ST_AsGeoJson(geog) AS geog
    FROM boundaries
    WHERE ST_Intersects(geog,
      ST_MakeEnvelope(${request.params.x1}, ${request.params.y1}, ${request.params.x2}, ${request.params.y2})
    )
  `
  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();
      if (err) throw err;
      response.json(geoJson.make(result));
    });
  });
});

app.get('/api/elevation-dump/:x1/:y1/:x2/:y2', function(request, response){
  const query = `
    select to_json(ST_DumpValues(ST_Clip(ST_Union(rast),
      ST_MakeEnvelope(${request.params.x1}, ${request.params.y1}, ${request.params.x2}, ${request.params.y2}, 4326)
    )))
    from elevation_detailed where ST_Intersects(rast,
      ST_MakeEnvelope(${request.params.x1}, ${request.params.y1}, ${request.params.x2}, ${request.params.y2}, 4326)
    );
  `;

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();
      if (err) throw err;
      console.log(result)
      const vertices = result.rows[0].to_json.valarray
      response.json({length: vertices.length, height: vertices[0].length, vertices: _.flatten(vertices)});
    });
  });
});

app.get('/api/trails/terrain/:id', function(request, response){
  getTrail(request.params.id, function(trail){
    const view = geoViewport.viewport(trail.bounds, [1024, 1024], 1, 17);
    const lineStr = polyline.fromGeoJSON(JSON.parse(trail.geog));
    const path = `/v4/mapbox.satellite/path-5+FFF700-0.75(${lineStr})/${view.center[0]},${view.center[1]},${view.zoom}/1024x1024.jpg?access_token=pk.eyJ1IjoiZml2ZWZvdXJ0aHMiLCJhIjoiY2lvMXM5MG45MWFhenUybTNkYzB1bzJ0MiJ9._5Rx_YN9mGwR8dwEB9D2mg`;

    http.get({
      host: 'api.mapbox.com',
      path: path
    }, function(r){
      let body = [];
      r.on('data', (chunk) => body.push(chunk)).on('end', () => {
        response.writeHead(200, {'Content-Type': 'image/jpg' });
        response.end(Buffer.concat(body), 'binary');
      })
    })
  })
});

app.listen(5000, function () {
  console.log('listening on port 5000');
});
