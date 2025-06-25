import { createModel, RematchDispatch } from "@rematch/core";
import {CommonStateType, UserType} from "./interface";
import { RootModel } from "../index";

const initialState: CommonStateType = {
  showLoading: false,
  uuID: '',
  uuIDSign: '',
  consultationsDate: null,
  isTestMode: false,
  wifiOnly: true,
  qrID: 0,
  session_timeout: {time: null, time_from: new Date()},
  userID: 0,
  userIDFromQr: 0,
  usersList: [],
  uploadData: {
    show: false,
    progress: 0,
    total: 0,
    current: 0,
    time: '0s'
  }
};

const model = createModel<RootModel>()({
  state: {
    ...initialState,
  },
  reducers: {
    setDefault: (state: CommonStateType) => {
      return { ...state,
        showLoading: false,
        uuID: '',
        uuIDSign: '',
        consultationsDate: null,
        isTestMode: false,
        wifiOnly: true,
        qrID: 0,
        session_timeout: {time: null, time_from: new Date()},
        userID: 0,
        userIDFromQr: 0,
        usersList: [],
        uploadData: {
          show: false,
          progress: 0,
          total: 0,
          current: 0,
          time: '0s'
        }
      };
    },

    setQrID: (state: CommonStateType, payload: number) => {
      return { ...state, qrID: payload };
    },

    setShowLoading: (state: CommonStateType, payload: boolean) => {
      return { ...state, showLoading: payload };
    },
    setUuID: (state: CommonStateType, payload: string) => {
      return { ...state, uuID: payload };
    },
    setUuIDSign: (state: CommonStateType, payload: string) => {
      return { ...state, uuIDSign: payload };
    },
    setDateConsultation: (state: CommonStateType, payload: string) => {
      return { ...state, consultationsDate: payload };
    },
    setTestMode: (state: CommonStateType, payload: boolean) => {
      return { ...state, isTestMode: payload };
    },
    setWifiOnly: (state: CommonStateType, payload: boolean) => {
      return { ...state, wifiOnly: payload };
    },
    setSessionTimeout: (state: CommonStateType, payload: {time: null| number, time_from: Date}) => {
      return { ...state, session_timeout: payload };
    },
    setSessionTimeoutTimeFrom: (state: CommonStateType) => {
      return { ...state, session_timeout: {time: state.session_timeout.time, time_from: new Date()} };
    },
    setUserID: (state: CommonStateType, payload: number) => {
      return { ...state, userID: payload };
    },
    setUserIDFromQr: (state: CommonStateType, payload: number) => {
      return { ...state, userIDFromQr: payload };
    },
    setUsersList: (state: CommonStateType, payload: Array<UserType>) => {
      return { ...state, usersList: payload };
    },
    setUploadData: (state: CommonStateType, payload) => {
      return { ...state, uploadData: payload };
    },
  },
  effects: (dispatch: RematchDispatch<any>) => ({
    toggleLoadingElement(data: boolean) {
      dispatch.common.setShowLoading(data);
    },
    changeQrID(data: number) {
      dispatch.common.setQrID(data);
    },
    changeUuID(data: string) {
      dispatch.common.setUuID(data);
    },
    changeUuIDSign(data: string) {
      dispatch.common.setUuIDSign(data);
    },
    changeDateConsultation(date: string) {
      dispatch.common.setDateConsultation(date);
    },
    changeTestMode(date: boolean) {
      dispatch.common.setTestMode(date);
    },
    changeWifiOnly(date: boolean) {
      dispatch.common.setWifiOnly(date);
    },
    changeSessionTimeout(date: {time: null| number, time_from: Date}) {
      dispatch.common.setSessionTimeout(date);
    },
    resetSessionTimeout() {
      dispatch.common.setSessionTimeoutTimeFrom();
    },
    changeUserID(id: number) {
      dispatch.common.setUserID(id);
    },
    changeUserIDFromQr(id: number) {
      dispatch.common.setUserIDFromQr(id);
    },
    changeUsersList(list: Array<UserType>) {
      dispatch.common.setUsersList(list);
    },
    changeUploadData(data) {
      dispatch.common.setUploadData(data);
    },
    clearAll() {
      dispatch.common.setDefault();
    },
  }),
});

export default model;
