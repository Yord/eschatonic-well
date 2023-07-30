import React from 'react';

import HardPoint from './HardPoint';

function HardPointList(props) {
    const { hard_points, hardPointOptions } = props;
    const hardPointComponents = [];
    hard_points.forEach((hard_point, index) =>
        hardPointComponents.push(<li key={index}><HardPoint hard_point={hard_point} index={index} selectedOption={hardPointOptions[index]} onChangeHardPoint={props.onChangeHardPoint.bind(this)}/></li>)
    )
    return <><h3>{props.header}</h3><ul>{hardPointComponents}</ul></>;
}

export default HardPointList;