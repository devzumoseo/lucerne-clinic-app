import {FC, useEffect} from "react";
import {
  IonApp,
  setupIonicReact
} from '@ionic/react';
import {Provider} from "react-redux";

import AppRoutes from './app-routes';

import store from "./store";
import MainPreference from "./components/main-preference";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import 'react-circular-progressbar/dist/styles.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Main styles */
import './styles/index.scss';

import ConnectionChecking from "./checkers/no-internet-connection-block";
import Loading from "./components/loading";
import {StyleTestMode} from "./components/style-test-mode";
import {App, AppState} from '@capacitor/app';
import { datadogLogs } from '@datadog/browser-logs'

setupIonicReact({
  mode: 'ios',
  swipeBackEnabled: false
});

// datadogLogs.init({
//     clientToken: process.env.REACT_APP_CLIENT_TOKEN ? process.env.REACT_APP_CLIENT_TOKEN : '',
//     site: 'datadoghq.eu',
//     service:"LC clinic",
//     env: 'prod',
//     version: '0',
// });

// localStorage.removeItem('key_session');
const AppDefault: FC = () => {
    // const dispatch = useDispatch<RootDispatch>();

    // useEffect(() => {
    //     const handleAppStateChanged = (state: AppState) => {
    //         if (state.isActive) {
    //             localStorage.removeItem('key_session');
    //             setTimeout(async () => {
    //                 window.location.reload();
    //             })
    //         }
    //     };
    //
    //     const listener = App.addListener('appStateChange', handleAppStateChanged);
    //
    //     return () => {
    //         listener.remove();
    //     };
    // }, []);


    return (
        <Provider store={store}>
            <IonApp>
                <AppRoutes />

                <ConnectionChecking />
                <Loading  />
                <MainPreference />
                <StyleTestMode/>
            </IonApp>
        </Provider>
    );
};

export default AppDefault;
