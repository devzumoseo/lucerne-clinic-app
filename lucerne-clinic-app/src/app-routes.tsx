import {FC} from "react";
import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router';

import AddUUIDPage from './pages/add-uuid';
import ConsultationsPage from "./pages/consultations";
import QrScanPage from "./pages/qr-scan";
import WelcomeScreenPage from "./pages/welcome-screen";
import PatientInfoPage from "./pages/patient-info";
import HomePage from "./pages/home";
import ErrorPage from "./pages/error-page";
import SettingsPage from "./pages/settings";
import {CheckDefaultRoute} from "./checkers/check-default-route";

import {
  getAddUuidUrl, getAuthCodeUrl,
  getConsultationsUrl, getErrorUrl, getHomeUrl, getLoggedRedirectUrl, getPasswordUrl,
  getPatientInfoUrl, getQrScanPatientUrl,
  getQrScanUrl, getSettingsUrl,
  getWelcomeUrl
} from './hooks/url-generator';
import WifiChecking from "./checkers/no-wifi-connection-block";
import QrScanPatientPage from "./pages/qr-scan-patient";
import TokenSessionTimeout from "./checkers/token-session-timeout";
import LoggedRedirect from "./pages/logged-redirect";
import {fadeAnimation} from "./animations/fade";
import AuthCodePage from "./pages/auth-code";
import PasswordPage from "./pages/password-page";

const AppRoutes: FC = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet animation={fadeAnimation}>
        <Route exact path={getAddUuidUrl()}><AddUUIDPage /></Route>
        <Route exact path={getAuthCodeUrl()}><AuthCodePage /></Route>
        <Route exact path={getQrScanUrl()}><QrScanPage /></Route>
        <Route exact path={getQrScanPatientUrl()}><QrScanPatientPage /></Route>
        <Route exact path={getPasswordUrl()}><PasswordPage /></Route>

        <Route exact path={getWelcomeUrl()}>
          <WelcomeScreenPage />
          <WifiChecking />
        </Route>
        <Route exact path={getConsultationsUrl()}>F
          <ConsultationsPage />
          <WifiChecking />
          <TokenSessionTimeout />
        </Route>
        <Route exact path={getPatientInfoUrl(':id')}>
          <PatientInfoPage />
          <WifiChecking />
          <TokenSessionTimeout />
        </Route>
        <Route exact path={getHomeUrl()}>
          <HomePage />
          <WifiChecking />
          <TokenSessionTimeout />
        </Route>
        <Route exact path={getLoggedRedirectUrl()}>
          <LoggedRedirect />
          <TokenSessionTimeout />
        </Route>

        <Route exact path={getSettingsUrl()}>
          <SettingsPage />
          {/*<WifiChecking />*/}
          {/*<TokenSessionTimeout />*/}
        </Route>


        <Route exact path={getErrorUrl()}><ErrorPage /></Route>
        <Route exact path={getErrorUrl(':error_text')}><ErrorPage /></Route>
        <Route exact path="/" ><CheckDefaultRoute /></Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default AppRoutes;
