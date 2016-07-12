var React = require('react');
var ReactDOM = require('react-dom');
var MapboxGL = require('mapbox-gl');
var _ = require('underscore');
import Tooltip from './tooltip';

MapboxGL.accessToken = 'pk.eyJ1IjoiZml2ZWZvdXJ0aHMiLCJhIjoiY2lvMXM5MG45MWFhenUybTNkYzB1bzJ0MiJ9._5Rx_YN9mGwR8dwEB9D2mg'

class Map extends React.Component {
  static watchEvents = {
    'onMapLoad': 'load',
    'onMapMoveEnd': 'moveend',
    'onMapMouseMove': 'mousemove'
  }

  loadTrailsWithinBox() {
    var bounds = this.mapboxed.getBounds();

    this.mapboxed.addSource('trails-data', {
      'type': 'geojson',
      'data': `/api/${bounds._sw.lng}/${bounds._sw.lat}/${bounds._ne.lng}/${bounds._ne.lat}`
    })

    var defaultLayerObject = {
      'id': 'trails',
      'source': 'trails-data',
      'type': 'line',
      'paint': {
        'line-color': '#47B05A',
        'line-width': 4
      }
    }

    var activeLayerObject = Object.assign({}, defaultLayerObject, {
      'id': 'trails-active',
      'paint': { 'line-color': '#FF9100'},
      "filter": ["==", "id", ""]
    })

    this.mapboxed.addLayer(defaultLayerObject).addLayer(activeLayerObject)
  }

  removeTrails() {
    this.mapboxed.removeSource('trails-data');
    this.mapboxed.removeLayer('trails');
    this.mapboxed.removeLayer('trails-active');
  }

  onMapLoad() {
    this.loadTrailsWithinBox();
  }

  onMapMoveEnd() {
    this.removeTrails();
    this.loadTrailsWithinBox();
  }

  onMapMouseMove(event) {
    var features = this.mapboxed.queryRenderedFeatures(event.point, { layers: ['trails'] });

    if (features.length) {
      var flatArray = _.flatten(["in", "id", features[0].properties.id, this.clickedTrailIds])

      this.mapboxed.getCanvas().style.cursor = 'pointer'
      this.mapboxed.setFilter("trails-active", flatArray)

    } else {
      this.mapboxed.getCanvas().style.cursor = 'default'
      this.mapboxed.setFilter("trails-active", _.flatten(["in", "id", this.clickedTrailIds]));
      overlay.classList.remove("visible")
    }
  }

  constructor() {
    super()
  }

  componentDidMount() {
    this.mapboxed = new MapboxGL.Map({
      container: 'mapbox-gl-element',
      style: 'mapbox://styles/mapbox/outdoors-v9',
      center: [-118.6686774, 36.7933829],
      zoom: 10
    });

    this._mapEvents()
  }

  _mapEvents() {
    Object.keys(Map.watchEvents).forEach(function(functionName){
      this.mapboxed.on(Map.watchEvents[functionName], function(event){
        if (this.mapboxed.loaded()) this[functionName](event)
      }.bind(this))
    }.bind(this))
  }

  render() {
    return (
      <div id="the-map">
        <div id="mapbox-gl-element"></div>
        <Tooltip />
      </div>
    );
  }
}

ReactDOM.render(<Map />, document.getElementById("map"));
