import {FC, useState} from 'react';
import {IonCard, IonCardContent, IonRippleEffect} from "@ionic/react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useLocation} from "react-router";
import {getConsultationsUrl, getHomeUrl, getQrScanPatientUrl, getSettingsUrl} from "../../hooks/url-generator";
import {fadeAnimation} from "../../animations/fade";
import {getUserIDFromQrSelector, getUserInfoSelector, getUseWifiSelector} from "../../store/common/selector";
import {RootDispatch} from "../../store";
import css from './menu.module.scss'
import {htmlDecode} from "../../hooks/text-decode";
import UserSelect from "../../components/blocks/user-select";
import Back from "../../components/ui/back";
import cn from "classnames";

const Menu: FC = () => {
    const useWifi = useSelector(getUseWifiSelector);
    const userData = useSelector(getUserInfoSelector);
    const userIDFromQr = useSelector(getUserIDFromQrSelector);
    const dispatch = useDispatch<RootDispatch>();
    const history = useHistory();
    const location = useLocation();

    const [showUserSelect, setShowUserSelect] = useState(false);

    const removeMobile = async () => {
        await dispatch.common.setShowLoading(true);
        await dispatch.common.changeWifiOnly(true);
        localStorage.removeItem('key_session');
        setTimeout(async () => {
            await history.replace(getHomeUrl());
            await history.go(0);
        });
    }

    return (
        <>
            <menu className={css.menu}>

                {
                    location.pathname !== getConsultationsUrl() ?
                    <IonCard className={cn('ion-activatable', css.back)}>
                        <IonCardContent>
                            <Back />
                            <IonRippleEffect/>
                        </IonCardContent>
                    </IonCard> : ''
                }

                <IonCard className="ion-activatable" routerLink={getHomeUrl() as string} routerAnimation={fadeAnimation}>
                    <IonCardContent>
                        <img src="/img/icon/calendar.svg" alt="home"/>
                        <p>Agenda</p>
                        <IonRippleEffect/>
                    </IonCardContent>
                </IonCard>

                <IonCard className="ion-activatable" routerLink={getQrScanPatientUrl() as string} routerAnimation={fadeAnimation}>
                    <IonCardContent>
                        <img src="/img/icon/qr.svg" alt="scan"/>
                        <p>QR Scan</p>
                        <IonRippleEffect/>
                    </IonCardContent>
                </IonCard>


                {/*{*/}
                {/*    (!useWifi && userIDFromQr) ?*/}
                {/*    <IonCard className="ion-activatable" onClick={removeMobile}>*/}
                {/*        <IonCardContent>*/}
                {/*            <img src="/img/icon/denpa.svg" alt="denpa"/>*/}
                {/*            <p>Mobile</p>*/}
                {/*            <IonRippleEffect/>*/}
                {/*        </IonCardContent>*/}
                {/*    </IonCard> : ''*/}
                {/*}*/}

                {
                    <IonCard className="ion-activatable" onClick={() => setShowUserSelect(true)}>
                        <IonCardContent>
                            <img src="/img/icon/user.svg" alt="denpa"/>
                            <p>{userData?.user_fn ? htmlDecode(userData?.user_fn) : 'Alle'}</p>
                            <IonRippleEffect/>
                        </IonCardContent>
                    </IonCard>
                }

                <IonCard className="ion-activatable" routerLink={getSettingsUrl() as string} routerAnimation={fadeAnimation}>
                    <IonCardContent>
                        <img src="/img/icon/settings.svg" alt="settings"/>
                        <p>Info</p>
                        <IonRippleEffect/>
                    </IonCardContent>
                </IonCard>


            </menu>
            { showUserSelect && <UserSelect cancelEmit={() => setShowUserSelect(false)} /> }
        </>
    );
};

export default Menu;
