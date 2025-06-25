import {FC, useCallback} from 'react';
import {IonSpinner, useIonViewDidEnter, useIonViewWillLeave} from '@ionic/react';
import {useHistory} from "react-router";
import {useDispatch, useSelector} from "react-redux";

import {getErrorUrl, getPasswordUrl} from "../../../hooks/url-generator";
import Scanner from "../../ui/scanner";
import {RootDispatch} from "../../../store";
import {startQrScanHook, stopQrScanHook} from "../../../hooks/barcode-scanner";
import {getUUIDSelector} from "../../../store/common/selector";
import {getSystemCode} from "../../../api/common";

import css from './qr-scan-form.module.scss';

const isValidHttpUrl = (string: string) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return (url.protocol === "http:" || url.protocol === "https:") && string.charAt(string.length - 1) === '/';
}

const QrScanForm: FC = () => {
    const history = useHistory();
    const dispatch = useDispatch<RootDispatch>();
    const uuID = useSelector(getUUIDSelector);

    useIonViewWillLeave(() => {
        // @ts-ignore
        document.querySelector('body').classList.remove('scanner-active');
    })

    useIonViewDidEnter(() => {
        qrScan().then();
    })

    const qrScan = useCallback(async () => {
        //TODO return On Prod or mobile
        // const qrCodeBase64 = 'eyJJRF9RUiI6IjMwNCIsIlVVSURfU0lHTiI6IlBXVEtJNEg0WUIyWEYzNlAiLCJVU0VSX0lEIjoiMCIsIlVESUQiOiJYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFgiLCJTWVNURU0iOiIyIiwiTU9CSUxFX05FVFoiOiIwIiwiVVJMIjoiaHR0cHM6Ly9YTldDSVpRRlJPWU4udGJhcHAuY2gvIn0';
        const qrCodeBase64 = await startQrScanHook();
        let decodedStr: any;

        try {
            decodedStr = JSON.parse(atob(qrCodeBase64));
        } catch (e) {
            history.push(getErrorUrl('Falscher QR Code. Dieses base64 ist inkorrekt und kann nicht geparst werden :('));
            return;
        }

        if(Number.isInteger(Number(decodedStr?.SYSTEM))) {
            localStorage.setItem('system_code', decodedStr?.SYSTEM);

            if(decodedStr?.SYSTEM === '2') {
                localStorage.setItem('system_code', '1');
                localStorage.setItem('couple_data', 'true');
            } else  {
                localStorage.removeItem('couple_data')
            }

            await dispatch.common.changeTestMode(!Boolean(Number(getSystemCode())));
        } else {
            history.push(getErrorUrl('QR Code ungültig, Systemparameter fehlt'));
        }
        if(decodedStr?.USER_ID) {
            dispatch.common.changeUserID(Number(decodedStr?.USER_ID));
            dispatch.common.changeUserIDFromQr(Number(decodedStr?.USER_ID));
        }

        if(decodedStr?.ID_QR) {
            dispatch.common.changeQrID(Number(decodedStr.ID_QR))
        }

        if(decodedStr?.UDID === 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX') {
            dispatch.common.changeUuID('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX');
        }
        if(decodedStr?.UDID !== uuID && decodedStr?.UDID !== 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'){
            history.push(getErrorUrl('QR Code passt nicht zur GeräteID'));
            return;
        }

        if(decodedStr?.URL && isValidHttpUrl(String(decodedStr?.URL))) {
            localStorage.setItem('api_url', decodedStr.URL);
        } else {
            history.push(getErrorUrl("Die 'URL' muss in einem Stringformat daherkommen: 'http:!_!_example.com!_' oder 'https:!_!_example.com!_'"));
            return;
        }

        if(decodedStr?.ID_QR) {
            localStorage.setItem('qr_version', decodedStr.ID_QR);
        }

        // await dispatch.qr_code.changeQrData(decodedStr);
        // if(decodedStr?.KEY_EXA && !decodedStr?.KEY_PRO) {
        //    await dispatch.common.changeTestMode(true);
        // }

        if(qrCodeBase64 && decodedStr?.UUID_SIGN) {
            dispatch.qr_code.changeQrBase64String(qrCodeBase64);
            dispatch.common.changeUuIDSign(decodedStr.UUID_SIGN)

            const use_mobile_net = !!Number(decodedStr?.MOBILE_NETZ);
            dispatch.common.changeWifiOnly(!use_mobile_net);

            history.push(getPasswordUrl())
        } else {
            history.push(getErrorUrl('Falscher QR Code.'));
        }
    }, [startQrScanHook, getPasswordUrl, dispatch.qr_code, dispatch.common, uuID])

    const stopScan = async () => {
        await stopQrScanHook();
        history.goBack();
    }

    return (
        <form className={css.form} id="qrForm">
            <div className={css.titleGroup}>
            </div>
            <div className='qrScanText'>
                <div />
                <p>
                    Scannen <IonSpinner name="dots" color='white' />
                </p>
                <div className="stopQrScan" onClick={stopScan}>
                    <img src="/img/icon/close.svg" alt="close"/>
                </div>
            </div>

            <Scanner />
        </form>
    );
};

export default QrScanForm;
