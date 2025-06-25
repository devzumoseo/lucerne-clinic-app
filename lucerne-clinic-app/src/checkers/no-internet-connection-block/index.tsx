import {FC, useEffect, useState} from 'react';
import cn from "classnames";
import {Network} from "@capacitor/network";
import {IonIcon} from "@ionic/react";
import {sadOutline} from "ionicons/icons";

import css from './no-internet-connection-block.module.scss';

const ConnectionChecking: FC = () => {
    const [hide, setHide] = useState(true)

    useEffect(() => {
        const connectionCheck =  async () => {
            const status = await Network.getStatus();
            setHide(status.connected)
        }

        connectionCheck().then();
    }, []);

    Network.addListener('networkStatusChange', status => {
        setHide(status.connected)
    });

    return (
        <div className={cn(css.wrap, hide && css.hide)}>
            <img src="/img/logo.png" alt="logo" className={css.logo}/>

            <p>Keine Internetverbindung</p>

            <IonIcon icon={sadOutline} className={css.icon} />
        </div>
    );
};

export default ConnectionChecking;
