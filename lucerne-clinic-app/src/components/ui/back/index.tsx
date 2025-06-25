import { FC } from 'react';
import cn from "classnames";
import {IonBackButton, IonRippleEffect} from "@ionic/react";
import {getHomeUrl} from "../../../hooks/url-generator";

import css from './back.module.scss';

const Back: FC<{isFade?:boolean}> = ({isFade}) => {

    return (
        <div className={cn('ion-activatable', css.back)}>
            <img src="/img/icon/back.svg" alt="back"/>
            <IonRippleEffect className="myDarkRipple"/>
            <IonBackButton className={css.backButton} defaultHref={getHomeUrl()}  />
        </div>
    );
};

export default Back;
