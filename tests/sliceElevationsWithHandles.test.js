import sliceElevationsWithHandles from "../modules/sliceElevationsWithHandles";

const trail1 = {
  id: 1,
  points: [1000, 1001, 1002, 1001, 1000]
};

const trail2 = {
  id: 2,
  points: [1000, 1001, 1002]
};

const handles = [{ trailId: 1, index: 1 }, { trailId: 1, index: 3 }];

test("slices an array of points", () => {
  const newArray = sliceElevationsWithHandles(trail1, handles);
  expect(newArray.points.length).toBe(2);
});

test("does not slice an array it does not belong to", () => {
  const newArray = sliceElevationsWithHandles(trail2, handles);
  expect(newArray.points.length).toBe(3);
});
