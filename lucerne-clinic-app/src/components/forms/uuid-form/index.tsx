import {FC, useEffect, useState} from 'react';
import cn from "classnames";
import {IonPopover, isPlatform} from '@ionic/react';
import {Device} from "@awesome-cordova-plugins/device";
import {useDispatch} from "react-redux";
import {IonButton, IonRippleEffect} from '@ionic/react';
import {RootDispatch} from "../../../store";
import {getQrScanUrl} from "../../../hooks/url-generator";
import {fadeAnimation} from "../../../animations/fade";
import {Clipboard} from "@awesome-cordova-plugins/clipboard";

import css from './uuid-form.module.scss';

const UUIDForm: FC = () => {
    const dispatch = useDispatch<RootDispatch>();
    const [uuID, setUuID] = useState('');
    const [isError, setIsError] = useState(false);

    const getUuId = () => {
        //TODO return On Prod or mobile
        // setUuID('4B7C5B7E-D56B-472C-930A-96B3E3795D42');
        // dispatch.common.changeUuID('4B7C5B7E-D56B-472C-930A-96B3E3795D42');
        // setIsError(false);
        // return;

        if (isPlatform('mobile') && Device.uuid) {
            setUuID(Device.uuid);
            dispatch.common.changeUuID(Device.uuid)
            setIsError(false);
        } else {
            setIsError(true)
        }
    }

    useEffect(() => {
        getUuId()
    }, [])

    const copy = () => {
        fetch(`https://api.tbapp.ch/app/conf/uuid.cfm?uuid=${uuID}`).then();
        Clipboard.copy(uuID).then();
    }

    return (
      <form className={css.form}>
        <img src="/img/logo.png" alt="logo" className={css.logo}/>
        <h1>UUID hinzufügen</h1>
        <p>Bitte fügen Sie die untenstehende UUID-Nummer in der TBA Software hinzu</p>

        <div className={css.box} id="uuidF" onClick={copy}>
            <span>{uuID}</span>

            <IonPopover trigger="uuidF" triggerAction="click" onClick={copy}
                        alignment="start" showBackdrop={false} >
                <p className={css.trg}>kopiert</p>
            </IonPopover>
        </div>

        {isError && <p className={css.errorText}>Ihre UUID kann nicht abgerufen werden. Bitte laden Sie die App neu und versuchen Sie es später erneut</p> }

        <IonButton className={cn('myButton', css.button)} color="secondary" disabled={isError}
                   routerLink={getQrScanUrl() as string}  routerAnimation={fadeAnimation}>
            <span>QR Scanner öffnen</span>
            <IonRippleEffect className="myDarkRipple"></IonRippleEffect>
        </IonButton>
      </form>
    );
};

export default UUIDForm;
