import { combineReducers } from 'redux';

const lastHoveredTrailInitialState = {
  name: '',
  source: '',
  contactX: 0,
  contactY: 0
};

const lastHoveredTrail = (state = lastHoveredTrailInitialState, action) => {
  switch (action.type) {
    case 'SWAP_HOVERED_TRAIL':
      return {
        name: action.name,
        source: action.source,
        contactX: action.contactX,
        contactY: action.contactY
      };
    default: return state;
  }
};

const tooltipVisibilityInitialState = { visibility: false };

const tooltipVisibility = (state = tooltipVisibilityInitialState, action) => {
  switch (action.type) {
    case 'HIDE_TOOLTIP':
      return { visibility: false };
    case 'SHOW_TOOLTIP':
      return { visibility: true };
    default: return state;
  }
}

export default combineReducers({lastHoveredTrail, tooltipVisibility});
