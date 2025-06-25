import {FC, useCallback, useEffect} from 'react';
import {useHistory} from "react-router";
import {getConsultationsUrl, getErrorUrl} from "../../hooks/url-generator";
import {useDispatch, useSelector} from "react-redux";
import {getCommonSelector, getIsTestModeSelector, getQrIDSelector} from "../../store/common/selector";
import {RootDispatch} from "../../store";
import {getAccessApi} from "../../api/access";
import {isErrorResponse} from "../../hooks/is-error-respocse";
import {getUsersApi} from "../../api/users";

const LoggedRedirect: FC = () => {
    const commonData = useSelector(getCommonSelector);
    const history = useHistory();
    const dispatch = useDispatch<RootDispatch>();
    const isTestMode = useSelector(getIsTestModeSelector);
    const qrID = useSelector(getQrIDSelector);

    useEffect(() => {
        sessionDataGeneration().then()
    }, [])

    const sessionDataGeneration = useCallback(async () => {
        dispatch.common.setShowLoading(true);

        if(commonData.uuID && commonData.uuIDSign) {
            dispatch.common.setShowLoading(true);

            const access = await getAccessApi(commonData.uuID, commonData.uuIDSign, isTestMode, commonData.wifiOnly);

            const error_check = isErrorResponse(access, qrID, commonData.uuID);
            if(error_check.type === 'error') {
                localStorage.setItem('key_session', '');
                await dispatch.common.changeSessionTimeout({time: 4000, time_from: new Date()});
                history.push(getErrorUrl(error_check.value));
                dispatch.common.setShowLoading(false);
                return;
            }

            if (access?.key_session) {
                if(access?.qr_version && qrID) {
                    if(access?.qr_version > qrID) {
                        history.push(getErrorUrl('Dieser Account wurde zurückgesetzt (QR-ID nicht aktuell)' ))
                        dispatch.common.setShowLoading(false);
                        return;
                    }
                }

                if(access?.timeout?.timer && !!Number(access?.timeout?.timer)) {
                    await dispatch.common.changeSessionTimeout({time: Number(access?.timeout?.timer), time_from: new Date()})
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
        history.push(getConsultationsUrl());
    }, [commonData.uuID, commonData.uuIDSign, isTestMode, commonData.wifiOnly])


    const getUser = async () => {
        try{
            const users = await getUsersApi({uuid: commonData.uuID, uuid_sign: commonData.uuIDSign});

            const error_check = isErrorResponse(users, qrID, commonData.uuID);

            if(users?.length) {
                dispatch.common.changeUsersList(users);
            }
        } catch (e) {
            console.log('error---', e)
        }
    }

    return <></>;
};

export default LoggedRedirect;
