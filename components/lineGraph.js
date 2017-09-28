import React from 'react';
import cx from 'classnames';
import styles from '../styles/lineGraph.css';
import {metersToMiles} from '../modules/conversions'
import label from '../styles/label.css';
import spacing from '../styles/spacing.css';

const width = 275;
const height = 100;

export default class LineGraph extends React.Component {

  distances() {
    var points = this.props.elevations;
    return points.map(p => p.distanceFromPreviousPoint).reduce((a, p) => a.concat(p + a[a.length - 1] || 0), []);
  }

  pointsToPathString() {
    const elevations = this.props.elevations.map(e => e.elevation);
    const maxElevation = Math.max(...elevations);
    const elevationWindow = maxElevation - Math.min(...elevations);
    const distances = this.distances();
    const fullDistance = distances[distances.length - 1];
    const relativePoints = elevations.map((elevation, i) => [((maxElevation - elevation)/elevationWindow), (distances[i]/fullDistance)]);

    return relativePoints.reduce((a,p,i) => a + `${p[1] * width},${p[0] * height} `, `0,${height} `) + `${width},${height}`;
  }

  textMarker({stepWidth, step, iterations, every}) {
    if (step % every !== 0) return;
    return <text x={stepWidth * step + 2} y={7} fill="#D5D5D5" fontSize="7px">{step + 1}</text>
  }

  mileMarker({stepWidth, step, iterations, leftOver}) {
    let every = 1;
    if (iterations > 7) every = 2;
    if (iterations > 20) every = 5;
    if (iterations > 50) every = 10;
    return <g key={step}>
      <rect
        x={stepWidth * step}
        width={(step == iterations - 1) ? stepWidth - leftOver : stepWidth}
        height={height}
        fill={(Math.floor(step / every) % 2 !== 0) ? "transparent" : "#EAEAEA"}
      />
      {this.textMarker({stepWidth, step, iterations, every})}
    </g>
  }

  mileMarkers(){
    const distances = this.distances();
    const miles = metersToMiles(distances[distances.length - 1]);
    const iterations = Math.ceil(miles);
    const stepWidth = parseInt(width / miles) + ((width % miles) / miles);
    const leftOver = stepWidth * iterations - width;
    let markers = [];
    for (let step = 0; step < iterations; step++) {
      markers.push(this.mileMarker({stepWidth, step, iterations, leftOver}));
    }
    return markers;
  }

  viewBox() {
    return `0 0 ${width} ${height}`;
  }

  render() {
    return (
      <div className={spacing.marginTop}>
        <div className={label.label}>Altitude Change</div>
        <svg viewBox={this.viewBox()} overflow="hidden" className={styles.lineGraph}>
          <g>{this.mileMarkers()}</g>
          <polyline points={this.pointsToPathString()} fill="#344632"/>
        </svg>
      </div>
    )
  }
};
