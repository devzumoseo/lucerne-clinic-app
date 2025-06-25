import {FC, useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {IonSpinner, useIonViewDidEnter} from "@ionic/react";
import {useHistory} from "react-router";
import cn from "classnames";
import moment from "moment";

import { getConsultationsApi} from "../../../api/consultations";
import {
    getCommonSelector,
    getConsultationDateSelector,
    getQrIDSelector,
    getSessionTimeoutSelector,
} from "../../../store/common/selector";
import {getErrorUrl} from "../../../hooks/url-generator";

import ConsultationsHeader from "./consultation-header";
import ConsultationItem from "./consultation-item";
import {RootDispatch} from "../../../store";
import {isErrorResponse} from "../../../hooks/is-error-respocse";
import {getPatientsListSelector} from "../../../store/detail/selector";

import css from './consultation.module.scss';

const ConsultationsBlock: FC = () => {
    const commonData = useSelector(getCommonSelector);
    const consultationDate = useSelector(getConsultationDateSelector);
    const patients = useSelector((state: never) => getPatientsListSelector(state, Number(consultationDate)));
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<RootDispatch>();
    const qrID = useSelector(getQrIDSelector);
    const timeoutSelector = useSelector(getSessionTimeoutSelector);

    useIonViewDidEnter(async () => {
        if(timeoutSelector && Number.isInteger(timeoutSelector)) {
            await dispatch.common.changeSessionTimeout({time: Number(timeoutSelector), time_from: new Date()})
        }
    })

    const listDataGeneration = useCallback(async () => {
        setLoading(true);
        if(commonData.uuID && commonData.uuIDSign) {
            dispatch.common.resetSessionTimeout();

            const patientsList = await getConsultationsApi({
                uuid: commonData.uuID,
                uuid_sign: commonData.uuIDSign,
                yd_cal: consultationDate,
                user_id: commonData.userID
            });

            // error check
            const error_check = isErrorResponse(patientsList, qrID, commonData.uuID);
            if(error_check.type === 'error') {
                history.push(getErrorUrl(error_check.value));
                setLoading(false);
                return;
            }

            // qr-check
            if(patientsList?.length) {
                const qr_data: any = patientsList.find((el: any) => el.name === 'qr')
                const qr_el = qr_data?.version ? Number(qr_data.version) : null;

                if(qr_el && qrID) {
                    if(qr_el > qrID) {
                        history.push(getErrorUrl('Dieser Account wurde zurückgesetzt (QR-ID nicht aktuell)' ))
                        await dispatch.common.changeSessionTimeout({time: timeoutSelector ? timeoutSelector : 300, time_from: new Date()})
                        setLoading(false);
                        return;
                    }
                }
            }

            // data loading
            if(patientsList?.length) {
                const list_data = patientsList.filter(val => val.name === 'cal');
                const refresh_el = patientsList.find(val => val.name === 'refresh');

                dispatch.detail.changePatientList({
                    id: Number(consultationDate),
                    data: list_data,
                    refresh: {
                        timer: Number.isInteger(refresh_el?.refresh) ? refresh_el?.refresh : 0,
                        time_from: new Date()}
                })

            }
        } else {
            history.push(getErrorUrl())
        }

        setLoading(false);
    }, [commonData.uuID, commonData.uuIDSign, consultationDate, commonData.userID])

    useEffect(() => {
        if(commonData.uuID && commonData.uuIDSign && consultationDate) {
            const refresh_data = patients?.refresh;
            let need_refresh = true;

            if(refresh_data?.time_from instanceof Date) {
                const time = refresh_data.time_from.getTime() + (Number(refresh_data.timer) * 1000);

                need_refresh = time < new Date().getTime();
            }

            if(patients?.id && !need_refresh) {
                console.log('data loaded from store')
            } else {
                listDataGeneration().then();
            }
        }
    }, [commonData.uuID, commonData.uuIDSign, consultationDate, qrID, commonData.userID])

    const closestTime = (arr: any, arr_time: any) => {
        if(arr.length) {
            const now: any = moment().format("HH:mm");
            arr_time = moment(arr_time).format('HH:mm');
            arr = arr.filter((v: any) => v.id_cal !== 'time').map((v: any) => moment(v.dt_cal_s).format("HH:mm"));

            const res = arr.find((v: any) => v === now);


            return arr_time === res;
        }

        return false;
    }

    const haveClosestTime = (arr: any) =>{
        if(arr?.length) {
            const now: any = moment().format("HH:mm");
            arr = arr.filter((v: any) => v.id_cal !== 'time').map((v: any) => moment(v.dt_cal_s).format("HH:mm"));

            const res =  arr.find((v: any) => v === now);

            return !!res
        }

        return false;
    }

    return (
        <>
            <ConsultationsHeader disableBtn={loading} />

            {
                loading ? <IonSpinner name="dots" className='center-mrg' /> :

                    <>
                        {
                            patients?.data?.length ?   <>{
                                patients.data.map((item, i) =>
                                    item.id_cal === 'time' ? <div key={i + 'time'} className={cn('redLine', css.redLine, haveClosestTime(patients.data) && css.hide)} />:
                                        <ConsultationItem key={item.id_cal}  data={item}
                                            active={closestTime(patients.data, item.dt_cal_s) && haveClosestTime(patients.data)}
                                        />
                                )
                            }</> : <p className='center-mrg'>Nichts gefunden</p>
                        }
                    </>
            }
            <>{haveClosestTime(patients?.data)}</>
        </>
    );
};

export default ConsultationsBlock;
