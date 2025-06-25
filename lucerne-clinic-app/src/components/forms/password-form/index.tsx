import {FC, useEffect, useState} from 'react';
import cn from "classnames";
import {IonButton, IonRippleEffect} from "@ionic/react";
import {useHistory} from "react-router";
import Back from "../../ui/back";
import {getHomeUrl} from "../../../hooks/url-generator";

import css from './welcome-block.module.scss';
import {MD5} from "../../../helpers/md5";

const PasswordForm: FC = () => {
   const [password, setPassword] = useState('');
   const [repeat, setRepeat] = useState('');
   const [sent, setSent] = useState(false);
   const [skipCount, setSkipCount] = useState(true);
   const [formError, setFormError] = useState<'empty' | 'not-same' | 'not-strong' | null>(null);
   const history = useHistory();

   useEffect(() => {
       if (skipCount) {
           setSkipCount(false);
           return;
       }
       validationCheck();
   }, [password]);

   const validationCheck = (): 'ok' | undefined => {
       if(!password) {
           setFormError("empty");
           return;
       }

       // if(password !== repeat) {
       //     setFormError("not-same");
       //     return;
       // }

       // const re = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
       // const strong = re.test(password);
       //
       // if(!strong) {
       //     setFormError("not-strong");
       //     return;
       // }

       setFormError(null);
       return 'ok'
   }

   const send = () => {
       setSent(true);
       if(validationCheck() === 'ok') {
           console.log('pass', MD5(password))
           localStorage.setItem('md5', MD5(password));
           history.push(getHomeUrl());
       }
    }


    return (
        <div className={css.content}>
            <div className={css.titleGroup}>
                <Back />
                <h1>Bitte Passwort eingeben</h1>
            </div>


            <p>Passwort:</p>
            <input type="password" placeholder='••••••••••'
                   className={cn((
                           (formError === 'empty' && !password && sent) ||
                           (formError === 'not-strong' && sent)
                       ) && css.error
                   )}
                   onInput={(e: any) => setPassword(e.target.value)}/>

            {/*<p>Wiederholen Sie das Passwort:</p>*/}
            {/*<input type="password" placeholder='••••••••••'*/}
            {/*       className={cn((*/}
            {/*               (formError === 'empty' && !repeat && sent) ||*/}
            {/*               (formError === 'not-same' && sent)) &&*/}
            {/*           css.error*/}
            {/*       )}*/}
            {/*       onInput={(e: any) => setRepeat(e.target.value)}*/}
            {/*/>*/}

            <div className={css.lon} />
            {
                    sent && formError ?
                        <>
                            {
                                formError === 'empty' ?
                                    <p className={css.errText}>Wählen Sie ihr Passwort</p> : ''
                            }
                            {
                                formError === 'not-same' ?
                                    <p className={css.errText}>Die Passwörter sind nicht gleich</p> : ''
                            }
                            {
                                formError === 'not-strong' ?
                                    <p className={css.errText}>Das Passwort muss aus 6 Zeichen, einem Grossbuchstaben und einer Zahl bestehen</p> : ''
                            }
                        </>
                    : ''
            }
            <IonButton className={cn('myButton', css.button)} color="secondary" disabled={!!formError && sent}
                       onClick={send}
            >
                <span>Weiter</span>
                <IonRippleEffect className="myDarkRipple"></IonRippleEffect>
            </IonButton>
        </div>
    );
};

export default PasswordForm;
