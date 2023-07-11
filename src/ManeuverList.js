import React from 'react';

import Maneuver from './Maneuver';

function ManeuverList(props) {
    const maneuverComponents = [];
    props.maneuvers.forEach((maneuverID, index) =>
        maneuverComponents.push(<li key={index}><Maneuver maneuverID={maneuverID} /></li>)
    )
    return <><h3>{props.header}</h3><ul>{maneuverComponents}</ul></>;
}

export default ManeuverList;