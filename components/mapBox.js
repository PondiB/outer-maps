import React from "react";
import PropTypes from "prop-types";
import { fromJS, is } from "immutable";
import MapboxGL from "mapbox-gl";
import { accessToken } from "../data/mapboxStaticData";
import styles from "../styles/mapbox.css";
import mapboxStyles from "../public/dist/mapbox-styles.json";
import debounce from "lodash.debounce";
const WATCH_EVENTS = [
  "mousedown",
  "mouseup",
  "click",
  "dblclick",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mouseover",
  "mouseout",
  "contextmenu",
  "touchstart",
  "touchend",
  "touchcancel"
];

export default class MapBox extends React.PureComponent {
  updateSources(newSources = []) {
    newSources.forEach(
      function(source) {
        this.mapboxed.getSource(source.id).setData(source.data);
      }.bind(this)
    );
  }

  updateFilters(filters) {
    filters.forEach(f => {
      this.mapboxed.setFilter(f.id, f.filter);
    });
  }

  componentDidMount() {
    MapboxGL.accessToken = accessToken;

    this.mapboxed = new MapboxGL.Map({
      container: "mapbox-gl-element",
      style: mapboxStyles,
      center: [-121.06, 48.35],
      zoom: 8,
      maxZoom: 14
    });

    this.mapEvents();
    this.mapboxed.addControl(new MapboxGL.NavigationControl());
  }

  componentDidUpdate(prevProps) {
    if (!is(fromJS(prevProps.sources), fromJS(this.props.sources))) {
      this.updateSources(this.props.sources);
    }

    if (this.props.filters && prevProps.filters !== this.props.filters) {
      this.updateFilters(this.props.filters);
    }

    if (this.props.flyTo && prevProps.flyTo !== this.props.flyTo) {
      this.mapboxed.flyTo(this.props.flyTo);
    }

    this.mapboxed.getCanvas().style.cursor = this.props.pointer
      ? "pointer"
      : "";
  }

  mapEvents() {
    WATCH_EVENTS.forEach(eventName => {
      if (!this.props[eventName]) return;

      this.mapboxed.on(
        eventName,
        debounce(
          event => {
            const eventMod = Object.assign({}, event, {
              features: event.point
                ? this.mapboxed.queryRenderedFeatures(event.point, {
                  layers: this.props.watchLayers
                })
                : null
            });
            this.props[eventName](eventMod);
          },
          2,
          { leading: true }
        )
      );
    });
  }

  render() {
    return <div className={styles.body} id="mapbox-gl-element" />;
  }
}

MapBox.propTypes = {
  sources: PropTypes.array,
  filters: PropTypes.array,
  flyTo: PropTypes.object,
  pointer: PropTypes.number,
  watchLayers: PropTypes.array
};
