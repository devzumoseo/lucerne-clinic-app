import {FC} from 'react';
import {IonSpinner, useIonViewDidEnter, useIonViewWillLeave} from '@ionic/react';
import {useHistory} from "react-router";
import {getErrorUrl, getHomeUrl, getPatientInfoUrl} from "../../../hooks/url-generator";
import {startQrScanHook, stopQrScanHook} from "../../../hooks/barcode-scanner";
import ScannerPatient from "../../ui/scanner-pacient";

import css from './qr-scan-patient-form.module.scss';

const QrScanPatientForm: FC = () => {
    const history = useHistory();

    useIonViewWillLeave(() => {
        // @ts-ignore
        document.querySelector('body').classList.remove('scanner-active');
    })

    useIonViewDidEnter(() => {
        qrScan().then();
    })

    const qrScan = async () => {
        //TODO return On Prod or mobile
        // const qrResult = '122366';
        const qrResult = await startQrScanHook();
        const qrId  = Number(qrResult);

        if(Number.isInteger(qrId) && qrId !== 0){
            await history.replace(getPatientInfoUrl(qrResult));
        } else {
            history.push(getErrorUrl('Kein Termin erhalten'));
        }
    }

    const stopScan = async () => {
        await stopQrScanHook();
        history.push(getHomeUrl());
    }
    
    return (
        <form className={css.form} id="qrForm">

            <div className={css.titleGroup}></div>

            <div className='qrScanText'>
                <div />
                <p>
                    Scannen <IonSpinner name="dots" color='white' />
                </p>
                <div className="stopQrScan" onClick={stopScan}>
                    <img src="/img/icon/close.svg" alt="close"/>
                </div>
            </div>

            <ScannerPatient />
        </form>
    );
};

export default QrScanPatientForm;
