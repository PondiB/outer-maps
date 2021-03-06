import distance from "@turf/distance";

const reversePoints = points => {
  return [...points].reverse().map((point, i) => {
    return {
      ...point,
      distance: i == 0 ? 0 : points[i - 1].distance,
      elevationGain: point.elevationLoss,
      elevationLoss: point.elevationGain
    };
  });
};

//todo: this is spaghetti code

const connectPaths = (p1, p2) => {
  const arr = [p1[0], p1[p1.length - 1], p2[0], p2[p2.length - 1]].map(f => ({
    ...f,
    pid: f.id + ":" + f.index
  }));
  const [a1, a2, b1, b2] = arr;
  const [close1, close2] = arr
    .map(el => {
      const closestPoint = arr.filter(e => e.pid !== el.pid).sort((a1, b1) => {
        return (
          distance(a1.coordinates, el.coordinates) -
          distance(b1.coordinates, el.coordinates)
        );
      })[0];
      return {
        ...el,
        distance: distance(closestPoint.coordinates, el.coordinates)
      };
    })
    .sort((a, b) => a.distance - b.distance);

  if (close1.pid == a1.pid && close2.pid == b1.pid)
    return [...reversePoints(p1), ...p2];
  if (close1.pid == a1.pid && close2.pid == b2.pid)
    return [...reversePoints(p1), ...reversePoints(p2)];
  if (close1.pid == a2.pid && close2.pid == b2.pid)
    return [...p1, ...reversePoints(p2)];
  return [...p1, ...p2];
};

export default connectPaths;
