import {FC, useEffect, useRef, useState} from 'react';
import {IonButton, IonButtons, IonDatetime, IonModal, IonRippleEffect} from "@ionic/react";
import moment from "moment/moment";
import {customizeCalendarStyle} from "../../../../hooks/calendar-style";
import Back from "../../../ui/back";
import {useDispatch} from "react-redux";
import {RootDispatch} from "../../../../store";

import css from './consultation-header.module.scss';
import cn from "classnames";
import ConsultationDate from "./consultation-date";

const ConsultationsHeader: FC<{disableBtn: boolean}> = ({disableBtn}) => {
    const calendar = useRef<HTMLIonDatetimeElement>(null);
    const dispatch = useDispatch<RootDispatch>();
    const modal = useRef<HTMLIonModalElement>(null);
    const [showCalendar, setShowCalendar] = useState(false);

    const confirm = (e: any) => {
        modal.current?.dismiss();

        if(e?.detail?.value) {
            dispatch.common.changeDateConsultation(moment(e?.detail?.value).format('YYYYDDDD'))
        }
    }

    return (
        <div className={cn(css.content, 'patient-head')}>
            {/*<Back />*/}
            <div style={{minWidth: '26px'}} />

            <ConsultationDate disableBtn={disableBtn} />

            <div className={cn(css.calendar, disableBtn && css.disable)} id="open-calendar-modal">
                <img src="/img/icon/calendar.svg" alt="calendar"/>
                <IonRippleEffect/>
            </div>

            <IonModal className="myModal calendarModal" trigger="open-calendar-modal" ref={modal}
                      onIonModalDidPresent={() => {!disableBtn && customizeCalendarStyle(calendar); setShowCalendar(true)}}
                      onIonModalWillPresent={() => setTimeout(() => !disableBtn && customizeCalendarStyle(calendar), 100)}>
                <IonDatetime ref={calendar} mode='md' className="a" locale='de-DE' onIonChange={confirm}
                             firstDayOfWeek={1} style={{opacity: showCalendar}}
                             presentation="date" color="secondary" showDefaultButtons={false} showDefaultTimeLabel={false}>
                </IonDatetime>
            </IonModal>
        </div>
    );
};

export default ConsultationsHeader;
