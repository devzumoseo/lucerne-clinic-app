import {FC, useEffect, useState} from 'react';
import cn from "classnames";
import {IonBackButton, IonButton, IonCard, IonRippleEffect} from "@ionic/react";
import {useParams} from "react-router-dom";
import {getHomeUrl, getQrScanPatientUrl, getQrScanUrl, getSettingsUrl} from "../../../hooks/url-generator";
import {fadeAnimation} from "../../../animations/fade";
import {useHistory} from "react-router";

import css from './something-wrong-block.module.scss';
import {useSelector} from "react-redux";
import {getCommonSelector} from "../../../store/common/selector";
import { datadogErrorPage} from "../../../api/datadog-info";

const SomethingWrongBlock: FC = () => {
    const [error, setError] = useState('Entschuldigung, etwas stimmt nicht');
    const [goHome, setGoHome] = useState(false);
    const [goQr, setGoQr] = useState(false);
    const params: any = useParams();
    const history = useHistory();
    const app_v = process.env.REACT_APP_VERSION;
    const commonData = useSelector(getCommonSelector);

    const reloadAndGoHome = async () => {
        localStorage.removeItem('key_session');
        await history.push(getHomeUrl());
    }

    const reloadAndGoQr = async () => {
        await history.push(getQrScanUrl());
        await history.go(0);
    }

    useEffect(() => {
        if(params?.error_text) {
            setError(params.error_text.replaceAll('!_', '/'))

            if(params.error_text === 'Key Session Fehler') {
                setGoHome(true)
            }

            if(params.error_text === 'Dieser Account wurde zurückgesetzt (QR-ID nicht aktuell)') {
                setGoQr(true)
            } else {
                setGoQr(false)
            }

            datadogErrorPage(params.error_text)
        }

        // postLogErrorApi({uuid: commonData.uuID,
        //     error_data: error.toString() + '\n ErrorPage: \n' + params.error_text}).then();

    }, [params])

    return (
        <div className={css.wrap}>
            <p className={css.appVersion}>{app_v}</p>
            <img src="/img/logo.png" alt="logo" className={css.logo}/>
            <h1>Etwas ist schief gelaufen...</h1>

            <p className={css.errorText}>{error}</p>

            <IonButton className={cn('myButton', css.button)} color="secondary"
                       onClick={() => {
                           goHome && reloadAndGoHome();
                           goQr && reloadAndGoQr();
                       }}>
                {goQr && <span>QR-Code erneut scannen</span>}
                {goHome && <span>Bitte neu laden</span>}
                {!goQr && !goHome && <span>Versuchen Sie es nochmal</span>}
                <IonRippleEffect className="myDarkRipple"/>
                {!goHome && !goQr && <IonBackButton className={css.backButton} defaultHref={getHomeUrl()}
                                           routerAnimation={fadeAnimation} />}
            </IonButton>

            <IonButton className={cn('myButton', css.remove)} color="secondary" >
                <span>Zu den Einstellungen</span>
                <IonCard className={css.backButton} routerLink={getSettingsUrl() as string} routerAnimation={fadeAnimation}></IonCard>
            </IonButton>
        </div>
    );
};

export default SomethingWrongBlock;
