export const mapBoxLayers = [
  {
    'id': 'handles-center',
    'source': 'handles',
    'type': 'circle',
    'before': 'handles',
    'paint': {
      "circle-radius": 4,
      "circle-color": "#FF9100"
    }
  },

  {
    'id': 'handles-outline',
    'source': 'handles',
    'type': 'circle',
    'before': 'handles-center',
    'paint': {
      "circle-radius": 6,
      "circle-color": "#FFF"
    }
  },

  {
    'id': 'handles',
    'source': 'handles',
    'type': 'circle',
    'paint': {
      "circle-radius": 8,
      "circle-color": "rgba(0,0,0,0)"
    }
  },

  {
    'id': 'labels',
    'source': 'labels',
    'type': 'symbol',
    "layout": {
      "text-field": "{name}",
      'symbol-placement': 'line',
      'text-size': {'stops': [[10, 9], [12, 11]]},
      'text-max-angle': 180,
      'symbol-spacing': 500
    },
    "paint": {
      "text-color": "rgba(0,33,4,1)",
      'text-halo-color': 'hsla(0, 0%, 100%, 100%)',
      'text-halo-width': 1,
      'text-halo-blur': 0.5,
    },
    "filter": ["all", ["in", "type", "hike", "horse"], ["!=", "name", ""]]
  },

  {
    'id': 'trails',
    'source': 'trails',
    'type': 'line',
    'paint': {
      'line-color': 'transparent',
      'line-width': 15
    },
    "filter": ["in", "type", "hike", "horse", "bike", "atv", "motorcycle", "trail"]
  },

  {
    'id': 'trails-core-line',
    'source': 'trails',
    'type': 'line',
    'before': 'hedges',
    'line': {
      'line-cap': 'round',
      'line-join': 'bevel'
    },
    'paint': {
      'line-color': 'rgba(0,103,14,1)',
      'line-width': 1,
      'line-dasharray': [4, 1]
    },
    "filter": ["all", ["in", "type", "hike", "trail", "horse"], ["!=", "name", ""]]
  },

  {
    'id': 'bike-core-line',
    'source': 'trails',
    'type': 'line',
    'before': 'hedges',
    'line': {
      'line-cap': 'round',
      'line-join': 'bevel'
    },
    'paint': {
      'line-color': 'rgba(160,160,160,1)',
      'line-width': 1,
      'line-dasharray': [4, 1]
    },
    "filter": ["all", ["in", "type", "bike"], ["!=", "name", ""]]
  },

  {
    'id': 'trails-outline',
    'source': 'trails',
    'type': 'line',
    'before': 'trails-core-line',
    'line': {
      'line-cap': 'round',
      'line-join': 'bevel'
    },
    'paint': {
      'line-color': 'rgba(250,250,250,1)',
      'line-width': 3
    },
    "filter": ["all", ["in", "type", "hike", "horse", "bike", "trail"], ["!=", "name", ""]]
  },

  {
    'id': 'atv-and-motorcycle-core-line',
    'source': 'trails',
    'type': 'line',
    'before': 'roads',
    'line': {
      'line-cap': 'round',
      'line-join': 'bevel'
    },
    'paint': {
      'line-color': 'rgba(180,180,180,1)',
      'line-width': 1,
      'line-dasharray': [2, 1]
    },
    "filter": ["any", ["in", "type", "atv", "motorcycle"], ["==", "name", ""]]
  },

  {
    'id': 'trails-active',
    'source': 'trails-active',
    'type': 'line',
    'before': 'handles-outline',
    'line': {
      'line-cap': 'round',
      'line-join': 'bevel'
    },
    'paint': {
      'line-color': '#FF9100',
      'line-width': 2,
    }
  }
]
