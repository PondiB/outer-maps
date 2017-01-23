import React from 'react'

export default class LineGraph extends React.Component {

  pointsToPathString() {
    var points = this.props.points;
    var elevations = points.map(e => e[0]);
    var distances = points.map(e => e[1]);
    var maxElevation = Math.max(...elevations);
    var elevationWindow = maxElevation - Math.min(...elevations);
    var fullDistance = distances[distances.length - 1];
    var relativePoints = points.map((point) => [((maxElevation - point[0])/elevationWindow), (point[1]/fullDistance)]);

    return relativePoints.reduce((a,p,i) => a + `${p[1] * 200},${p[0] * 100} `, "0,100 ") + "200,100";
  }

  render() {
    if (!this.props.points) return null;

    console.log(this.pointsToPathString())

    return (
      <svg width="200" height="100" viewBox="0 0 200 100">
        <polyline points={this.pointsToPathString()} strokeWidth="2" stroke="black"/>
      </svg>
    )
  }
};