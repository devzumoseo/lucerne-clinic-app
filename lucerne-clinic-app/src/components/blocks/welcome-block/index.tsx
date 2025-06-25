import {FC} from 'react';
import cn from "classnames";
import {IonButton, IonRippleEffect} from "@ionic/react";
import {fadeAnimation} from "../../../animations/fade";
import Back from "../../ui/back";
import {getHomeUrl} from "../../../hooks/url-generator";

import css from './welcome-block.module.scss';

const WelcomeBlock: FC = () => {

    return (
        <div className={css.content}>
            <div className={css.titleGroup}>
                <Back />
                <h1>Willkommen!</h1>
            </div>

            <img src="/img/logo.png" alt="logo" className={css.logo}/>

            <img src="/img/party.png" alt="party" className={css.party}/>
            <p>Der QR Code wurde erfolgreich gescannt.</p>

            <IonButton className={cn('myButton', css.button)} color="secondary"
                       routerLink={getHomeUrl() as string}  routerAnimation={fadeAnimation}>
                <span>Weiter</span>
                <IonRippleEffect className="myDarkRipple"></IonRippleEffect>
            </IonButton>
        </div>
    );
};

export default WelcomeBlock;
