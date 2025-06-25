import {FC, useEffect, useState} from 'react';
import cn from "classnames";
import {IonButton, IonRippleEffect} from "@ionic/react";
import {Network} from "@capacitor/network";
import {useSelector} from "react-redux";
import {useHistory, useLocation} from "react-router";
import {getUseWifiSelector} from "../../store/common/selector";
import {getAddUuidUrl, getQrScanPatientUrl, getQrScanUrl, getSettingsUrl} from "../../hooks/url-generator";

import css from './no-wifi-connection-block.module.scss';

const WifiChecking: FC = () => {
    const [hide, setHide] = useState(true)
    const useWifi = useSelector(getUseWifiSelector);
    const {pathname} = useLocation();
    const history = useHistory();

    const check = async (wifi: boolean) => {
        const url_exceptions: Array<string> = [getAddUuidUrl(), getQrScanUrl(), getQrScanPatientUrl(), getSettingsUrl()];
        const status = await Network.getStatus();

        if(!url_exceptions.includes(pathname)) {
            if(wifi) {
                setHide(status.connectionType === 'wifi');
            } else {
                setHide(true);
            }
        } else {
            setHide(true);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => check(useWifi), 1500)
        return () => clearInterval(interval);
    }, [useWifi, pathname])

    return (
        <div className={cn(css.wrap, hide && css.hide)}>
            <img src="/img/logo.png" alt="logo" className={css.logo}/>
            <img src="/img/no-wifi.png" alt="wifi" className={css.wifi}/>

            <p>Bitte verbinden Sie das Telefon mit dem WIFI</p>

            <IonButton className={cn('myButton')} color="secondary" onClick={() => history.push(getSettingsUrl())}>
                <span>Zu den Einstellungen</span>
                <IonRippleEffect className="myDarkRipple" />
            </IonButton>
        </div>
    );
};

export default WifiChecking;
