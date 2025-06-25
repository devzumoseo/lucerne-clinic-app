import {htmlDecode} from "./text-decode";

export const getAddUuidUrl = () => {
  return '/add-uuid';
};

export const getAuthCodeUrl = () => {
  return '/auth-code';
};

export const getQrScanUrl = () => {
  return '/qr-scan';
};

export const getQrScanPatientUrl = () => {
  return '/qr-scan-patient';
};

export const getPasswordUrl = () => {
  return '/password';
};

export const getWelcomeUrl = () => {
  return '/welcome-screen';
};

export const getConsultationsUrl = () => {
  return '/consultations';
};

export const getPatientInfoUrl = (id: string | number) => {
  return  `/patient-info/${id}`
};

export const getHomeUrl = () => {
  return `/home`;
};

export const getLoggedRedirectUrl = () => {
  return `/logged-redirect`;
};

export const getSettingsUrl = () => {
  return `/settings`;
};

export const getErrorUrl = (error_text?: string, go_home?: string) => {
  if(error_text) {
    error_text = htmlDecode(error_text);
    error_text = error_text.replaceAll('&','')
        .replaceAll('#','')
        .replaceAll('?','')
        .replaceAll('/','');
  }

  return `/something-wrong${error_text ? '/' + error_text : ''}${go_home ? '/go_home': ''}`;
};
