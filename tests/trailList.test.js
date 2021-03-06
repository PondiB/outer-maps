import React from "react";
import TrailList from "../components/trailList.js";
import renderer from "react-test-renderer";
import theme from "../styles/theme";
import { ThemeProvider } from "emotion-theming";

// the data piped into this is really complicated and probably a smell.

const trails = [
  {
    name: "fun trail",
    hasElevationData: true,
    id: 100,
    points: [
      {
        distanceFromPreviousPoint: 5
      },
      {
        distanceFromPreviousPoint: 2
      }
    ]
  },
  {
    name: "not fun trail",
    hasElevationData: false,
    id: 101,
    points: [
      {
        distanceFromPreviousPoint: 50
      },
      {
        distanceFromPreviousPoint: 1
      }
    ]
  },
  {
    name: "super fun trail",
    hasElevationData: true,
    id: 102,
    points: [
      {
        distanceFromPreviousPoint: 50000
      },
      {
        distanceFromPreviousPoint: 11
      }
    ]
  }
];

it("renders", () => {
  const tree = renderer
    .create(
      <ThemeProvider theme={theme}>
        <TrailList unselectTrail={() => {}} trails={trails} />
      </ThemeProvider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
