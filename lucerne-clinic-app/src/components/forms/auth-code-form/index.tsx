import {FC, useState} from 'react';

import css from './auth-code.module.scss';
import Back from "../../ui/back";
import {IonButton, IonInput, IonItem, IonRippleEffect} from "@ionic/react";
import cn from "classnames";
import {getHomeUrl} from "../../../hooks/url-generator";
import {useHistory} from "react-router";
import {fadeAnimation} from "../../../animations/fade";

const AuthCodeForm: FC = () => {
    const history = useHistory();
    const [isError, setIsError] = useState(false);
    const [value, setInputValue] = useState('');

    const send = () => {
        if(value?.length !== 6) {
            setIsError(true);
            return;
        }

        localStorage.setItem('auth_code', value);
        history.push(getHomeUrl());
    }

    const onInput = (e: any) => {
        setInputValue(e.target.value);

        if(e.target.value.length === 6) {
            setIsError(false)
        }
    }

    return (
    <form className={css.form}>
        <div className={css.titleGroup}>
            <Back />
            <h1>Authentication Code</h1>
        </div>
        <p>Um den Authentifizierungscode zu finden, müssen Sie die Authenticator-Anwendung öffnen</p>

        <IonInput placeholder="Code eingeben" className={css.input} type={'number'} onInput={onInput}></IonInput>

        {/*<IonItem fill="outline" className={css.inputWrap}>*/}
        {/*    <IonInput placeholder="Code eingeben" className={css.input} type={'number'} onInput={onInput}></IonInput>*/}
        {/*</IonItem>*/}
        {isError && !value && <p className={css.errorText}>Bitte schreibe Authentication Code</p> }
        {isError && value && <p className={css.errorText}>Falscher Code</p> }

        <IonButton className={cn('myButton', css.button)} color="secondary" disabled={isError}
                   onClick={send}  routerAnimation={fadeAnimation}>
            <span>Weiter</span>
            <IonRippleEffect className="myDarkRipple"></IonRippleEffect>
        </IonButton>
    </form>
    );
};

export default AuthCodeForm;
