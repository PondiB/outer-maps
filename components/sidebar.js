import React from 'react';
import PropTypes from 'prop-types';
import TrailSidebar from './trailSidebar';
import BoundarySidebar from './boundarySidebar';
import cx from 'classnames';
import styles from '../styles/sidebar.css';
import spacing from '../styles/spacing.css';

const Sidebar = ({trails, firstTrail, boundary, loading}) => {
  const trailOrBoundary = () => {
    if (trails && trails.length) return <TrailSidebar firstTrail={trails[0]} trails={trails}/>
    if (boundary && boundary.selected) return <BoundarySidebar {...boundary}/>
  }

  const hasContent = () => ((boundary && boundary.selected) || (trails && trails.some(t => t.selected)))

  const name = () => {
    if (trails.length) return (trails.length > 1) ? `${trails.length} Trails` : trails[0].name;
    if (boundary) return boundary.name;
  }

  return (
    <div className={cx(styles.body, {[styles.active]: hasContent()})}>
      <div className={styles.content}>
        <div className={styles.title}>{name()}</div>
        {trailOrBoundary()}
      </div>
    </div>
  )
};

Sidebar.propTypes = {
  trails: PropTypes.array,
  boundary: PropTypes.object
}

export default Sidebar;
