import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/terrain.css';
import center from '../styles/center.css';
import cx from 'classnames';
import LoadingSpinner from './loadingSpinner';
import {FlatMercatorViewport} from 'viewport-mercator-project';
import GeoViewport from '@mapbox/geo-viewport';
import pin from '../modules/pin';
import arrayEquals from '../modules/arrayEquals';
import Triangle from '../svg/triangle.svg';

export default class Terrain extends React.Component {

  projectPoints({points, bounds}) {
    if (!points || !bounds) return [];
    const tile = GeoViewport.viewport(bounds, [1024, 1024])
    const projecter = FlatMercatorViewport({longitude: tile.center[0], latitude: tile.center[1], zoom: tile.zoom - 1, width: 1024, height: 1024});
    return this.props.points.map(p => {
      return {...p, coordinates: projecter.project(p.coordinates)}
    });
  }

  pointCloseToEdge(point, buffer) {
    const canvas = this.refs.canvas;

    if (point[0] < buffer) return 'left';
    if (point[1] < buffer) return 'top';
    if (point[0] > canvas.width - buffer) return 'right';
    if (point[1] > canvas.height - buffer) return 'bottom';
  }

  drawPath(points) {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!points.length) return;

    ctx.moveTo(...points[0].coordinates);
    points.slice(1).forEach(p => ctx.lineTo(...p.coordinates))
    ctx.lineJoin = "round";
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'white';
    ctx.setLineDash([10, 10]);
    ctx.stroke();

    const image = new Image();
    const [x1, y1] = points[0].coordinates;
    const [x2, y2] = points[points.length - 1].coordinates;
    const pinWidth = 44;
    const pinHeight = 60;
    image.onload = () => {
      ctx.drawImage(image, x1 - pinWidth / 2, y1 - pinHeight - 2, pinWidth, pinHeight);
      ctx.drawImage(image, x2 - pinWidth / 2, y2 - pinHeight - 2, pinWidth, pinHeight);
    }
    image.src = pin;
  }

  isVisible() {
    return (this.props.satelliteImageUrl);
  }

  latLongElement(point, index) {
    const [x, y] = point.coordinates;
    return <div
      className={cx(styles.latLong, styles[this.pointCloseToEdge(point, 20)])}
      style={{left: (x / 1024) * 100 + '%', top: (y / 1024) * 100 + '%'}}>
        {this.props.points[index].coordinates[0].toString().slice(0, 7)},&nbsp;
        {this.props.points[index].coordinates[1].toString().slice(0, 5)}
        <Triangle className={cx(styles.triangle)} />
      </div>
  }

  latLongElementFirst() {
    if (!this.projectedPoints || !this.projectedPoints.length || !this.props.points) return '';
    return this.latLongElement(this.projectedPoints[0], 0);
  }

  latLongElementSecond() {
    if (!this.projectedPoints || !this.projectedPoints.length || !this.props.points) return '';
    return this.latLongElement(this.projectedPoints[this.projectedPoints.length - 1], this.projectedPoints.length - 1);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.points || !this.props.points || !arrayEquals(prevProps.points, this.props.points)) {
      this.projectedPoints = this.projectPoints(this.props);
      this.drawPath(this.projectedPoints);
    }
  }

  render() {
    return (
      <div className={cx(styles.terrain, styles.center)}>
        <img src={this.props.satelliteImageUrl} className={cx(styles.image, {[styles.visible]: this.isVisible()})}/>
        <canvas ref="canvas" width="1026" height="1026" className={cx(styles.canvas, {[styles.visible]: this.isVisible()})}></canvas>
        <div className={cx(styles.loadingSpinner, {[styles.visible]: !this.isVisible()})}><LoadingSpinner speed="1s"/></div>
        {this.latLongElementFirst()}
        {this.latLongElementSecond()}
      </div>
    )
  }
};

Terrain.propTypes = {
  points: PropTypes.array,
  satelliteImageUrl: PropTypes.string
}
