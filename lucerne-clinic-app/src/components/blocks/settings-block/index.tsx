import {FC, useState} from 'react';
import {IonButton, IonPopover, IonRippleEffect, IonToggle, useIonAlert, useIonToast} from "@ionic/react";
import {useHistory} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import cn from "classnames";
import {Clipboard} from "@awesome-cordova-plugins/clipboard";

import {RootDispatch} from "../../../store";
import {
    getIsTestModeSelector, getQrIDSelector,
    getUseWifiSelector,
    getUUIDSelector
} from "../../../store/common/selector";
import {getAddUuidUrl, getHomeUrl, getQrScanUrl} from "../../../hooks/url-generator";
import {fadeAnimation} from "../../../animations/fade";
import {haveProdAndDevKeysSelector} from "../../../store/qr-code/selector";

import UserSelect from "../user-select";
import {getCoupleData, getSystemCode} from "../../../api/common";

import css from './settings-block.module.scss';
import {MD5} from "../../../helpers/md5";

const SettingsBlock: FC = () => {
    const [show, setShow] = useState(true);
    const [showUserSelect, setShowUserSelect] = useState(false);
    const dispatch = useDispatch<RootDispatch>();
    const isTestMode = useSelector(getIsTestModeSelector);
    const isWifiOnly = useSelector(getUseWifiSelector);
    const haveAllKeys = useSelector(haveProdAndDevKeysSelector);
    const [presentAlert] = useIonAlert();
    const history = useHistory();
    const uuID = useSelector(getUUIDSelector);
    const qrID = useSelector(getQrIDSelector);
    const [present] = useIonToast();

    const reload = () => {
        setShow(false);
        setTimeout(() => setShow(true));
    }

    const onSelect = async (e: any) => {
        await presentAlert({
            header: isTestMode ? 'Sie werden den Produktionsmodus verwenden' : 'Sie werden den Testmodus verwenden',
            cssClass: 'custom-alert',
            buttons: [
                {
                    text: 'Abbrechen',
                    cssClass: 'alert-button-cancel',
                    handler: () => {
                        dispatch.common.changeTestMode(isTestMode);
                        reload();
                    }
                },
                {
                    text: 'Ok',
                    cssClass: 'alert-button-confirm',
                    handler: async () => {
                        await dispatch.common.setShowLoading(true);
                        await dispatch.detail.setDefault();
                        await dispatch.common.changeTestMode(e.detail.checked);
                        localStorage.removeItem('key_session');
                        setTimeout(async () => {
                            await history.push(getHomeUrl());
                        })
                    }
                },
            ],
        })
    }

    const changeWifi = async (e: any) => {
        await dispatch.common.setShowLoading(true);
        await dispatch.common.changeWifiOnly(!e.detail.checked);
        localStorage.removeItem('key_session');
        setTimeout(async () => {
            await history.push(getHomeUrl());
        })
    }

    const changeDataType = async () => {
        const type = getSystemCode() === '1' ? '0' : '1';
        localStorage.setItem('system_code', type);

        await dispatch.common.setShowLoading(true);
        await dispatch.detail.setDefault();
        await dispatch.common.changeTestMode(!Boolean(Number(getSystemCode())))
        localStorage.removeItem('key_session');
        setTimeout(async () => {
            await history.push(getHomeUrl());
            window.location.reload();
        })
    }

    const copy = async () => {
        Clipboard.copy(uuID).then();
        await fetch(`https://api.tbapp.ch/app/conf/uuid.cfm?uuid=${uuID}`);
    }

    const clearStore = async () => {
        await presentAlert({
            header: 'Bist du dir sicher? Alle App-Speicherdaten werden gelöscht und die App wird neu geladen',
            cssClass: 'custom-alert',
            buttons: [
                {
                    text: 'Abbrechen',
                    cssClass: 'alert-button-cancel',
                },
                {
                    text: 'Ok',
                    cssClass: 'alert-button-confirm',
                    handler: async () => {
                        const body = document.querySelector('body');

                        await sessionStorage.clear();
                        await localStorage.clear();

                        await dispatch.common.clearAll()
                        await dispatch.qr_code.setDefault()
                        await dispatch.detail.setDefault()

                        body && body.classList.remove('test-mode');

                        caches.keys().then(async (names) => {
                            names.forEach((name) => {
                                caches.delete(name);
                            });

                            await history.push(getAddUuidUrl());
                            window.location.reload();
                        });
                    }
                },
            ],
        })
    }

    const changePassword = async () => {
        await presentAlert({
            header: 'Neues Passwort',
            inputs: [{
                type: 'password',
                placeholder: '••••••••',
                label: 'pas'
            }],
            cssClass: 'custom-alert',
            onDidPresent: () => {
                const body = document.querySelector('body');
                body && body.classList.add('disable-scroll');
            },
            onDidDismiss: () => {
                const body = document.querySelector('body');
                body && body.classList.remove('disable-scroll');
            },
            buttons: [
                {
                    text: 'Abbrechen',
                    cssClass: 'alert-button-cancel',
                },
                {
                    text: 'Speichern',
                    cssClass: 'alert-button-confirm',
                    handler: async (e) => {
                        const pas = e[0];
                        console.log(e[0]);

                        if(!pas) {
                            await present({
                                message:'Wählen Sie ihr Passwort',
                                color: 'danger',
                                position: 'top',
                                mode: 'ios',
                                duration: 3000,
                            });
                            return false;
                        }
                        // const re = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
                        // const strong = re.test(pas);
                        //
                        // if(!strong) {
                        //     await present({
                        //         message: 'Das Passwort muss aus 6 Zeichen, einem Grossbuchstaben und einer Zahl bestehen',
                        //         position: 'top',
                        //         color: 'danger',
                        //         mode: 'ios',
                        //         duration: 3000,
                        //     });
                        //     return false;
                        // }

                        localStorage.removeItem('key_session');
                        localStorage.setItem('md5', MD5(pas));
                        await present({
                            message:'Passwort wurde erfolgreich geändert',
                            position: 'top',
                            mode: 'ios',
                            duration: 5000,
                        });
                    }
                },
            ],
        })
    }

    return (
        <div className={css.wrap}>
            {show &&
                <>
                    {
                        getSystemCode() ? <div className={css.line}>
                            {getCoupleData() ?
                                <>
                                    <p className={css.title}>Produktive Daten</p>
                                    <IonToggle mode="ios" className={css.check} name='network'
                                               checked={!!Number(getSystemCode())} onIonChange={changeDataType} />
                                </>
                                :
                                <>
                                    {getSystemCode() === '0' ? <p className={css.title}>Testdaten</p> : ''}
                                    {getSystemCode() === '1' ? <p className={css.title}>Produktive Daten</p> : ''}
                                </>
                            }
                        </div> : ''
                    }

                    {
                        haveAllKeys &&
                        <div className={css.line}>
                            <p className={css.title}>Testmodus verwenden?</p>
                            <IonToggle mode="ios" className={css.check} name='test'
                                       checked={isTestMode} onIonChange={onSelect} />
                        </div>
                    }

                    <div className={css.line}>
                        <p className={css.title}>Mobilenetzwerk verwenden?</p>
                        <IonToggle mode="ios" className={css.check} name='network'
                                   checked={!isWifiOnly} onIonChange={changeWifi} />
                    </div>

                    <div className={css.line}>
                        <p className={css.title}>QR Version</p>
                        <p className={css.title}>{qrID}</p>
                    </div>

                    <div className={cn(css.line, css.uuidBox)}>
                        <div className={css.uuid}>
                            <p className={css.title}>UUID des Geräts:</p>
                            <div className={css.box} id="uuidL" onClick={copy}>
                                <span>{uuID}</span>

                                <IonPopover trigger="uuidL" triggerAction="click"
                                            alignment="start" showBackdrop={false} >
                                    <p className={css.trg}>kopiert</p>
                                </IonPopover>
                            </div>
                        </div>
                    </div>

                    <div className={css.line}>
                        <IonButton className={cn('ion-activatable', css.scan)} routerLink={getQrScanUrl() as string} routerAnimation={fadeAnimation}>
                            <p><img src="/img/icon/qr.svg" alt="qr"/> Scan QR Code</p>
                            <img src="/img/icon/arrow-right.svg" alt="qr"/>
                            <IonRippleEffect/>
                        </IonButton>
                    </div>

                    {
                        <div className={css.line}>
                            <IonButton className={cn('ion-activatable', css.user)} onClick={() => setShowUserSelect(true)}  id="open-user-modal-s">
                                <p><img src="/img/icon/user.svg" alt="user" className={css.userImg}/> Benutzer wechseln</p>
                                <img src="/img/icon/arrow-right.svg" alt="qr"/>
                                <IonRippleEffect className="myDarkRipple" />
                            </IonButton>
                        </div>
                    }

                    <div className={css.line} onClick={changePassword}>
                        <p className={css.title}>Passwort ändern</p>
                    </div>

                    <IonButton className={cn('myButton danger', css.remove)}
                               color="danger" onClick={clearStore}>
                        Konfig löschen
                    </IonButton>


                    { showUserSelect && <UserSelect cancelEmit={() => setShowUserSelect(false)} /> }
                </>
            }
        </div>
    );
};

export default SettingsBlock;
