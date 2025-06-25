import {FC, useEffect, useState} from 'react';
import {IonAlert, useIonToast} from "@ionic/react";
import {useDispatch} from "react-redux";
import {RootDispatch} from "../../../../store";
import css from './survey-popup.module.scss';

interface PropsInterface {
    emitCancel: () => void;
    list: Array<any> | undefined;
    uuid_sign: string;
    uuid: string;
    id_adr: string | null;
    id_cal: string;
}

const SurveyPopup: FC<PropsInterface> = ({id_cal, emitCancel, list, uuid_sign, uuid, id_adr}) => {
    const [showPopup, setShowPopup] = useState(true);
    const dispatch = useDispatch<RootDispatch>();
    const [present] = useIonToast();

    useEffect(() => {
        setShowPopup(true);
    }, []);


    const send = async (e: any) => {
        window.open(e.attributes.url,'_system', 'location=yes');
        emitCancel();
    }
    
    return (
        <div className={css.group}>
            <IonAlert
                isOpen={showPopup}
                header="Patientenaufnahme: "
                cssClass="custom-alert myDocAlert1"
                backdropDismiss={false}
                buttons={[{
                    text: 'Abbrechen',
                    cssClass: 'aalert-button-cancel',
                    handler: () => {
                        setShowPopup(false);
                        emitCancel();
                        dispatch.common.setShowLoading(false);
                    }
                }]}
                inputs={list?.map(el => {
                    return {
                        handler: () => {
                           send(el);
                        },
                        label: el?.attributes?.name,
                        type: 'radio',
                        value: {url: el?.attributes?.url},
                    }
                })}
            />
        </div>
    );
};

export default SurveyPopup;
