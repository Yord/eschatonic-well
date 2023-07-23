import React from 'react';

import HardPointList from './HardPointList';

function ForceModelList(props) {
    const { forceEntries, header, handleCardClicked, viewCardClicked, updateModelHardPoint } = props;

    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(forceGroups).sort().forEach(([key, value]) => {
        const entryComponents = [];
        value.forEach((entry, index) => {
            const weaponPointCost = entry.hard_points ? entry.hardPointOptions.reduce((totalPointCost, option) => totalPointCost + option.point_cost, 0) : undefined
            entryComponents.push(
                <li key={index}>
                    <button onClick={() => handleCardClicked(entry.id)}>{entry.name}</button>
                    {viewCardClicked && <button onClick={() => viewCardClicked(entry.modelId)}>VIEW</button>}
                    {entry.hard_points && <span>
                        {entry.weapon_points && <h6>Weapon Points: {weaponPointCost}/{entry.weapon_points}</h6>}
                        <HardPointList hard_points={entry.hard_points} onChangeHardPoint={(option, type, point_cost, hardPointIndex) => updateModelHardPoint(option, type, point_cost, hardPointIndex, entry.id)}/>
                    </span>}
                </li>
            );
        })
        forceGroupComponents.push(<div key={key}><h4>{key}</h4><li><ul>{entryComponents}</ul></li></div>)
    })
    return <><h3>{header}</h3><ul>{forceGroupComponents}</ul></>;
}

export default ForceModelList;