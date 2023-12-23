import React, { useEffect, useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import sanitize from "sanitize-filename";
import { IonPage, IonContent, IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonText, IonSelect, IonSelectOption, IonInput, IonButton, IonGrid, IonCol, IonRow, useIonAlert } from '@ionic/react';

import { copyForceToText } from "./util/copyForceToText";
import { useStorage } from "./util/useStorage";

import ModelCount from './ModelCount.js';
import CypherCount from './CypherCount.js';
import CardListViewer from './CardListViewer';
import LoadForceModal from './LoadForceModal';
import ForceEditor from './ForceEditor';
import RackEditor from './RackEditor';

import { factionsData, forceSizesData } from './data';

const forcesPath = "eschatonic-well/forces/";
const forcesExtension = ".esch";

const editorTabs = {force: 0, rack: 1, cards: 2}

function EditorView() {
    
    const [presentAlert] = useIonAlert();

    const [tabSelected, setTabSelected] = useStorage("tabSelected", editorTabs.force, sessionStorage);
    
    const [factionId, setFactionId] = useStorage("factionId", factionsData["all"], localStorage);
    const [forceSize, setForceSize] = useStorage("forceSize", forceSizesData["custom"], localStorage);

    const [forceName, setForceName] = useStorage("forceName", "New Force", localStorage);
    const [forceModelsData, setForceModelsData] = useStorage("forceModelsData", [], localStorage);
    const [forceCyphersData, setForceCyphersData] = useStorage("forceCyphersData", [], localStorage);
    const [specialIssueModelsData, setSpecialIssueModelsData] = useStorage("specialIssueModelsData", [], localStorage);
    const [specialIssueCyphersData, setSpecialIssueCyphersData] = useStorage("specialIssueCyphersData", [], localStorage);

    const [forcesDirty, setForcesDirty] = useState(true);
    const [loadForceButtons, setLoadForceButtons] = useState([]);

    useEffect(() => {
        createForcesDir().then(() => 
            listForces().then((result) => {
                if(forcesDirty && result) {
                    const newLoadForceButtons = [];
                    result.files.forEach((file, index) => {
                        const forceName = file.name.replace(forcesExtension, "");
                        newLoadForceButtons.push(<IonRow key={index}>
                            <IonCol><IonButton expand="full" onClick={() => loadForce(file.name)}><div>{forceName}</div></IonButton></IonCol>
                            <IonCol size="auto"><IonButton expand="full" onClick={() => deleteForce(file.name)}>DELETE</IonButton></IonCol>
                        </IonRow>);
                        setLoadForceButtons(newLoadForceButtons);
                    });
                    setForcesDirty(false);
                }
            })
        );
    }, [forcesDirty])
    
    function changeFaction(id) {
        setFactionId(id);
        clearForce();
    }

    function changeFactionConfirm(id) {
        if(factionId !== id) {
            presentAlert({
                header: 'Change Faction?',
                message: 'Changing faction will clear your force',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {},
                    },
                    {
                        text: 'OK',
                        role: 'confirm',
                        handler: () => changeFaction(id),
                    },
                ],
                onDidDismiss: () => {}
            })
        }
    }

    function changeForceSize(forceSizeId) {
        setForceSize(forceSizesData[forceSizeId]);
    }

    function clearForce() {
        setForceModelsData([]);
        setForceCyphersData([]);
        setSpecialIssueModelsData([]);
        setSpecialIssueCyphersData([]);
    }

    const createForcesDir = async () => {
        try {
            listForces();
            return;
        } catch (e) {
            const result = await Filesystem.mkdir({
                path: forcesPath,
                directory: Directory.Data,
                recursive: true
            });
            
            return result;
        }
    }

    const listForces = async () => {
        try {
            const result = await Filesystem.readdir({
                path: forcesPath,
                directory: Directory.Data
            });
            
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    const saveForce = async (forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData) => {
        const json = {
            "forceName": forceName,
            "factionId": factionId,
            "forceSize": forceSize,
            "forceModelsData": forceModelsData,
            "forceCyphersData": forceCyphersData,
            "specialIssueModelsData": specialIssueModelsData,
            "specialIssueCyphersData": specialIssueCyphersData
        };
        const filename = sanitize(forceName);
        try {
            const result = await Filesystem.writeFile({
                path: `${forcesPath}${filename}${forcesExtension}`,
                data: JSON.stringify(json),
                directory: Directory.Data,
                encoding: Encoding.UTF8,
                recursive: true
            });
            
            setForcesDirty(true);
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    const loadForce = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            //modal.current?.dismiss("", 'confirm');
            setForceName(json.forceName);
            setFactionId(json.factionId);
            setForceSize(json.forceSize);
            setForceModelsData(json.forceModelsData);
            setForceCyphersData(json.forceCyphersData);
            setSpecialIssueModelsData(json.specialIssueModelsData);
            setSpecialIssueCyphersData(json.specialIssueCyphersData);
        } catch (e) {
            console.log(e);
        }
    }

    const deleteForce = async (filename) => {
        try {
            const result = await Filesystem.deleteFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
            });
            setForcesDirty(true);
            // For some reason we need to clear out the buttons if it's the last force being deleted
            if((await listForces()).files.length === 0) {
                setLoadForceButtons([]);
            }
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    const factionSelectOptions = [];
    Object.entries(factionsData).forEach(([key, value]) => {
        if(!value.hidden) {
            factionSelectOptions.push(<IonSelectOption key={key} value={value.id}>{value.name}</IonSelectOption>);
        }
    });
    factionSelectOptions.push(<IonSelectOption key={"all"} value={"all"}>ALL</IonSelectOption>);

    const forceSizeOptions = [];
    Object.entries(forceSizesData).sort((a, b) => a[1].units-b[1].units).forEach(([key, value]) => {
        forceSizeOptions.push(<IonSelectOption key={key} value={value.id}>{`${value.name} ${value.id !== "custom" ? `(${value.units} / ${value.hero_solos})` : ""}`}</IonSelectOption>);
    });
    return (
        <IonPage>
            <IonContent>
                <LoadForceModal trigger={"open-load-modal"} loadForceButtons={loadForceButtons}></LoadForceModal>
                <IonText color="primary"><h3><IonSelect label="Faction:" justify="start" value={factionId} onIonChange={(e) => changeFactionConfirm(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                <IonText color="primary"><h3><IonSelect label="Force Size:" justify="start" value={forceSize.id} onIonChange={(e) => changeForceSize(e.detail.value)}>{forceSizeOptions}</IonSelect></h3></IonText>
                <IonText color="primary"><h2>Force Name: <IonInput type="text" value={forceName} onIonChange={(e) => setForceName(e.target.value)}/></h2></IonText>
                <IonGrid>
                    <IonRow>
                        <IonCol><IonButton expand="full" onClick={() => {saveForce(forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData)}}><div>SAVE</div></IonButton></IonCol>
                        <IonCol><IonButton expand="full" disabled={loadForceButtons.length === 0} id="open-load-modal">LOAD</IonButton></IonCol>
                        <IonCol><IonButton expand="full" onClick={() => {copyForceToText(forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData)}}><div>COPY TO TEXT</div></IonButton></IonCol>
                        <IonCol><IonButton expand="full" onClick={() => {
                            clearForce();
                            setForceName("New Force");
                        }}><div>CLEAR ALL</div></IonButton></IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol size={"auto"}>
                            <ModelCount models={forceModelsData} maxUnits={forceSize.units} freeHeroSolos={forceSize.hero_solos}/>
                        </IonCol>
                        <IonCol size={"auto"}>
                            <CypherCount cyphers={forceCyphersData}/>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                {tabSelected === editorTabs.force && <ForceEditor 
                    factionId={factionId}
                    forceName={forceName} 
                    forceModelsData={forceModelsData} 
                    setForceModelsData={setForceModelsData} 
                    specialIssueModelsData={specialIssueModelsData} 
                    setSpecialIssueModelsData={setSpecialIssueModelsData}
                ></ForceEditor>}
                
                {tabSelected === editorTabs.rack && <RackEditor 
                    factionId={factionId}
                    forceCyphersData={forceCyphersData}
                    setForceCyphersData={setForceCyphersData}
                    specialIssueCyphersData={specialIssueCyphersData} 
                    setSpecialIssueCyphersData={setSpecialIssueCyphersData}
                ></RackEditor>}

                {tabSelected === editorTabs.cards && <CardListViewer 
                    factionId={factionId}
                ></CardListViewer>}
            </IonContent>
            <IonFooter>
                <IonToolbar>
                    <IonSegment value={tabSelected} onIonChange={(e) => setTabSelected(e.detail.value)}>
                        <IonSegmentButton value={editorTabs.force}>
                            <IonLabel>Force</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value={editorTabs.rack}>
                            <IonLabel>Rack</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value={editorTabs.cards}>
                            <IonLabel>Cards</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
}

export default EditorView;
