import {FC, useCallback, useEffect, useState} from 'react';
import cn from "classnames";
import {useHistory, useLocation} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {
    getCommonSelector,
    getIsTestModeSelector,
    getQrIDSelector,
    getSessionTimeout
} from "../../store/common/selector";
import {getErrorUrl} from "../../hooks/url-generator";
import Countdown from "react-countdown";
import {RootDispatch} from "../../store";
import {getAccessApi} from "../../api/access";
import {IonButton, IonRippleEffect, useIonViewDidEnter, useIonViewDidLeave} from "@ionic/react";
import {isErrorResponse} from "../../hooks/is-error-respocse";
import {getUsersApi} from "../../api/users";

import css from './token-session-timeout.module.scss';

const TokenSessionTimeout: FC = () => {
    const [showDom, setShowDom] = useState(true);
    const [show, setShow] = useState(false);
    const timeout = useSelector(getSessionTimeout);
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch<RootDispatch>();
    const commonData = useSelector(getCommonSelector);
    const isTestMode = useSelector(getIsTestModeSelector);
    const qrID = useSelector(getQrIDSelector);

    useEffect(() => {
        reload()
    }, [timeout])

    useIonViewDidLeave(() => {
        setShowDom(false)
        setShow(false);
    })

    useIonViewDidEnter(() => {
        const checkUserData = () => {
            const session = localStorage.getItem('key_session')

            if (!session) {
                sessionDataGeneration().then()
            }
        }

        checkUserData();
    }, [isTestMode, commonData.uuID, commonData.uuIDSign, commonData.wifiOnly])

    const sessionIsOld = async () => {
        dispatch.common.setShowLoading(true);
        const current_url = window.location.href;

        localStorage.removeItem('key_session');
        await sessionDataGeneration();

        setTimeout(() => {
            // history.push(current_url);
            dispatch.common.setShowLoading(false);
            window.location.href = current_url;
        });
    }
    const reload = () => {
        setShowDom(false)
        setTimeout(() => setShowDom(true))
    }

    const sessionDataGeneration = useCallback(async () => {
        dispatch.common.setShowLoading(true);

        if(commonData.uuID && commonData.uuIDSign) {
            dispatch.common.setShowLoading(true);

            const access = await getAccessApi(commonData.uuID, commonData.uuIDSign, isTestMode, commonData.wifiOnly);

            const error_check = isErrorResponse(access, qrID, commonData.uuID);

            if(error_check.type === 'error') {
                console.log(333, error_check)
                // localStorage.removeItem('key_session');
                setTimeout(() =>  history.push(getErrorUrl(error_check.value)))
                localStorage.removeItem('key_session');
                // await dispatch.common.changeSessionTimeout({time: 4000, time_from: new Date()});
                dispatch.common.setShowLoading(false);
                return null;
            }

            if (access?.key_session) {
                if(access?.qr_version && qrID) {
                    if(access?.qr_version > qrID) {
                        history.push(getErrorUrl('Dieser Account wurde zurückgesetzt (QR-ID nicht aktuell)' ))
                        dispatch.common.setShowLoading(false);
                        setShow(false);
                        await dispatch.common.changeSessionTimeout({time: 4000, time_from: new Date()});
                        return;
                    }
                }

                if(access?.timeout?.timer && !!Number(access?.timeout?.timer)) {
                    await dispatch.common.changeSessionTimeout({time: Number(access?.timeout?.timer), time_from: new Date()})
                    // await dispatch.common.changeSessionTimeout({time: 10, time_from: new Date()})
                    setShow(false);
                } else {
                    await dispatch.common.changeSessionTimeout({time: null, time_from: new Date()})
                }

                localStorage.setItem('key_session', access.key_session);
            } else {
                history.push(getErrorUrl('Keine Rückmeldung vom Server erhalten'));
            }
        } else {
            history.push(getErrorUrl())
        }

        await getUser();

        dispatch.common.setShowLoading(false);
    }, [commonData.uuID, commonData.uuIDSign, isTestMode, commonData.wifiOnly])


    const getUser = async () => {
        try{
            const users = await getUsersApi({uuid: commonData.uuID, uuid_sign: commonData.uuIDSign});

            const error_check = isErrorResponse(users, qrID, commonData.uuID);

            if(error_check.type === 'error') {
                history.push(getErrorUrl('Error Endpoint user_list.cfm'));
                return;
            }

            if(users?.length) {
                dispatch.common.changeUsersList(users);
            } else {
                history.push(getErrorUrl('Keine User übermittelt'));
                dispatch.common.changeUsersList([])
            }
        } catch (e) {
            console.log('error---', e)
        }
    }

    return (
        <div className={cn(css.wrap, (!show && !!Number(timeout?.time) || location.pathname === getErrorUrl()) && css.hide)}>
            <img src="/img/logo.png" alt="logo" className={css.logo}/>
            <p>Keine Serverbindung.</p>

            {showDom && <>
                {
                    !!Number(timeout?.time) && timeout?.time_from &&
                    <Countdown date={new Date(timeout.time_from).getTime() + (Number(timeout.time) * 1000)}
                               onComplete={() => setShow(true)} className={css.time} onStart={() => setShow(false)}
                    />
                }
            </>}

            <IonButton className={cn('myButton')} color="secondary" onClick={sessionIsOld}>
                <span>Neu verbinden</span>
                <IonRippleEffect className="myDarkRipple" />
            </IonButton>
        </div>
    );
};

export default TokenSessionTimeout;
