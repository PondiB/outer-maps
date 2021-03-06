import bbox from "@turf/bbox";
import GeoViewport from "@mapbox/geo-viewport";
import { getWeather } from "../services/getNOAAWeather";
import fetchWithCache from "../services/fetchWithCache";

const selectTrail = ({ properties, geometry }) => {
  return (dispatch, getState) => {
    const cachedTrail = getState().trails.find(t => t.id == properties.id);
    const bounds = bbox(JSON.parse(properties.bounds));
    const { center, zoom } = GeoViewport.viewport(bounds, [1024, 800]);

    if (!cachedTrail)
      dispatch({ type: "ADD_TRAIL", center, bounds, properties, geometry });
    if (!cachedTrail || !cachedTrail.elevationDataRequested)
      dispatch(
        getElevationData({ id: properties.id, center, zoom, reducer: "trail" })
      );
    if (!cachedTrail || !cachedTrail.weatherDataRequested)
      dispatch(getWeatherData({ ...properties, center, reducer: "trail" }));
    if (cachedTrail) return dispatch({ type: "SELECT_TRAIL", ...cachedTrail });
  };
};

const selectBoundary = ({ properties, geometry }) => {
  return (dispatch, getState) => {
    const cachedBoundary = getState().boundaries.find(
      b => b.id == properties.id
    );
    const bounds = bbox(JSON.parse(properties.bounds));

    if (!cachedBoundary)
      dispatch({ type: "ADD_BOUNDARY", properties, geometry, bounds });
    if (!cachedBoundary || !cachedBoundary.elevationDataRequested)
      dispatch(getElevationData({ id: properties.id, reducer: "boundary" }));
    if (!cachedBoundary || !cachedBoundary.weatherDataRequested)
      dispatch(
        getWeatherData({
          ...properties,
          center: geometry.coordinates,
          reducer: "boundary"
        })
      );
    if (cachedBoundary)
      return dispatch({ type: "SELECT_BOUNDARY", id: properties.id });
  };
};

const unselectTrail = id => {
  return dispatch => {
    dispatch({ type: "REMOVE_TRAIL_HANDLES", id });
    return dispatch({ type: "UNSELECT_TRAIL", id });
  };
};

const clearSelected = () => {
  return dispatch => dispatch({ type: "CLEAR_SELECTED" });
};

const getElevationData = ({ id, reducer }) => {
  return dispatch => {
    dispatch({
      type: `SET_${reducer.toUpperCase()}_ELEVATION_DATA_REQUESTED`,
      id
    });

    return fetchWithCache({ path: `/api/${reducer}/${id}`, extension: "json" })
      .then(response => response.json())
      .then(response => {
        dispatch({
          type: `SET_${reducer.toUpperCase()}_ELEVATION_DATA`,
          ...response,
          id
        });
      });
  };
};

const getWeatherData = ({ id, center, station1, reducer }) => {
  return dispatch => {
    dispatch({
      type: `SET_${reducer.toUpperCase()}_WEATHER_IMAGE_REQUESTED`,
      id
    });
    getWeather({
      x: center[1],
      y: center[0],
      stationId: station1,
      dataSetId: "NORMAL_DLY",
      dataTypeIds: [
        "DLY-TMAX-NORMAL",
        "DLY-TMIN-NORMAL",
        "DLY-PRCP-PCTALL-GE001HI",
        "DLY-PRCP-PCTALL-GE050HI"
      ]
    }).then(response => {
      return dispatch({
        type: `SET_${reducer.toUpperCase()}_WEATHER_DATA`,
        ...response,
        id: id
      });
    });
  };
};

export { selectTrail, selectBoundary, unselectTrail, clearSelected };
