import {FC} from 'react';
import cn from "classnames";
import {getPatientInfoUrl} from "../../../../hooks/url-generator";
import {IonCard, IonRippleEffect} from "@ionic/react";
import {ConsultationInterface} from "../../../../api/consultations";
import moment from "moment";
import {htmlDecode} from "../../../../hooks/text-decode";
import SmICon from "../../../sm-icon";
import {fadeAnimation} from "../../../../animations/fade";

import css from './consultation-item.module.scss';

const ConsultationItem: FC<{data: ConsultationInterface, active: boolean}> = ({data, active}) => {

    return (
        <div className={cn(css.wrap, 'ion-activatable', 'patient-el', active && css.active)}
             style={active ? {
                    background: '#' + data.color,
                    borderWidth: '4px',
                    borderColor: '#f70709'
                 }
                 :{background: '#' + data.color} }>
            <div className={css.group}>
                <p className={css.time}>
                    <span>{moment(data.dt_cal_s).format('HH:mm')}</span>
                </p>

                <p className={css.name}>
                    <span>{htmlDecode(data.title)}</span>
                </p>

                <SmICon iconId={data.id_sm} />
            </div>

            <p className={css.text}>{htmlDecode(data.notes)}</p>

            <IonRippleEffect/>
            <IonCard routerLink={getPatientInfoUrl(data.id_cal) as string} routerAnimation={fadeAnimation} />
        </div>
    );
};

export default ConsultationItem;
