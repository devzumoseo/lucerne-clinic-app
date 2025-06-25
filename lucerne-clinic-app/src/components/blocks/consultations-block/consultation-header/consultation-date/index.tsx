import {FC, useEffect, useState} from 'react';
import cn from "classnames";
import {useDispatch, useSelector} from "react-redux";
import moment, {Moment} from "moment";
import 'moment/locale/de';
import {IonRippleEffect} from "@ionic/react";

import {RootDispatch} from "../../../../../store";
import {getConsultationDateSelector} from "../../../../../store/common/selector";

import css from './consultation-date.module.scss';

const ConsultationDate: FC<{disableBtn: boolean}> = ({disableBtn}) => {
    const dispatch = useDispatch<RootDispatch>();
    const [date, setDate]= useState<string | null> (null);
    const consultationDate = useSelector(getConsultationDateSelector);

    const setCurrentDate = () => {
        setDate(moment().locale("de").format('LL'))
        dispatch.common.changeDateConsultation(moment().locale("de").format('YYYYDDDD'))
    }

    useEffect(() => {
        consultationDate && setDate(moment(consultationDate, 'YYYYDDDD', 'de').locale("de").format('LL'));
    }, [consultationDate])

    useEffect(() => {
        setCurrentDate()
    }, [])

    const onChangeDate = (type: 'next' | 'prev') => {
        if(date) {
            let changedDate:string | Moment = date;

            if(type === 'next') {
                changedDate = moment(changedDate, 'LL', 'de').add('days', 1)
            }
            if(type === 'prev') {
                changedDate = moment(changedDate, 'LL', 'de').subtract(1, 'days')
            }

            if(moment.isMoment(changedDate) ) {
                setDate(moment(changedDate, 'LL', 'de').locale("de").format('LL'))
                dispatch.common.changeDateConsultation(moment(changedDate, 'LL', 'de').format('YYYYDDDD'))
            }
        }
    }

    return (
        <div className={css.wrap}>
            <div className={cn(css.arrow, disableBtn && css.disable, 'ion-activatable')} onClick={() => !disableBtn && onChangeDate('prev')}>
                <img src="/img/icon/arrow-left.svg" alt="arrow"/>
                <IonRippleEffect/>
            </div>

            <p>{date}</p>

            <div className={cn(css.arrow, disableBtn && css.disable, 'ion-activatable')} onClick={() => !disableBtn && onChangeDate('next')}>
                <img src="/img/icon/arrow-right.svg" alt="arrow"/>
                <IonRippleEffect/>
            </div>
        </div>
    );
};

export default ConsultationDate;
