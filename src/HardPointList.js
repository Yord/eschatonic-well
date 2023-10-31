import React from 'react';
import { IonText, IonItem, IonList } from '@ionic/react';

import HardPoint from './HardPoint';

function HardPointList(props) {
    const { hard_points, hardPointOptions } = props;
    const hardPointComponents = [];
    hard_points.forEach((hard_point, index) =>
        hardPointComponents.push(<IonItem key={index}><HardPoint hard_point={hard_point} index={index} selectedOption={hardPointOptions[index]} onChangeHardPoint={props.onChangeHardPoint.bind(this)}/></IonItem>)
    )
    return <><IonText><h3>{props.header}</h3></IonText><IonList>{hardPointComponents}</IonList></>;
}

export default HardPointList;