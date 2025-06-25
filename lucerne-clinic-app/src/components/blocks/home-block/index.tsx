import {FC} from 'react';
import cn from "classnames";
import {IonCard, IonRippleEffect} from "@ionic/react";
import {useHistory} from "react-router";
import {getConsultationsUrl, getQrScanPatientUrl} from "../../../hooks/url-generator";

import css from './home-block.module.scss';
import {fadeAnimation} from "../../../animations/fade";

const HomeBlock: FC = () => {

    return (
        <div className={css.wrap}>
            <div className={css.titleGroup}>
                <h1>Willkommen!</h1>
                <img src="/img/logo.png" alt="logo"/>
            </div>

            <div className={cn('ion-activatable', css.box, css.qrBox)}>
                <div className={css.el}>
                    <img src="/img/icon/consultation.svg" alt="consultation"/>
                    <span>Konsultationen</span>
                </div>
                <IonRippleEffect className="myDarkRipple" />
                <IonCard routerLink={getConsultationsUrl() as string} routerAnimation={fadeAnimation}></IonCard>
            </div>

            <div className={cn('ion-activatable', css.box, css.qrBox)}>
                <div className={css.el}>
                    <img src="/img/icon/qr.svg" alt="qr"/>
                    <span>QR Code scannen</span>
                </div>
                <IonRippleEffect className="myDarkRipple" />
                <IonCard routerLink={getQrScanPatientUrl() as string} routerAnimation={fadeAnimation}></IonCard>
            </div>
        </div>
    );
};

export default HomeBlock;
