import { createSelector } from 'reselect';
import { RootState } from "../index";
import {CommonStateType, UserType} from "./interface";

const selectState = (state: RootState) => state.common;

export const getLoadingBlockSelector =
  createSelector(selectState, (data: CommonStateType) => data.showLoading);

export const getConsultationDateSelector =
    createSelector(selectState, (data: CommonStateType) => data.consultationsDate);

export const getCommonSelector =
    createSelector(selectState, (data: CommonStateType) => data);

export const getUUIDSelector =
    createSelector(selectState, (data: CommonStateType) => data.uuID);

export const getIsLoadingSelector =
    createSelector(selectState, (data: CommonStateType) => data.showLoading);

export const getIsTestModeSelector =
    createSelector(selectState, (data: CommonStateType) => data.isTestMode);

export const getUseWifiSelector =
    createSelector(selectState, (data: CommonStateType) => data.wifiOnly);

export const getQrIDSelector =
    createSelector(selectState, (data: CommonStateType) => data.qrID);

export const getSessionTimeout =
    createSelector(selectState, (data: CommonStateType) => data.session_timeout);

export const getSessionTimeoutSelector =
    createSelector(selectState, (data: CommonStateType) => data?.session_timeout?.time ? data?.session_timeout?.time : 0 );

export const getUserInfoSelector =
    createSelector(selectState, (data: CommonStateType): null | UserType => {
        if(Number.isInteger(data?.userID) && data?.usersList?.length ) {
            const result = data.usersList.find(val => Number(val?.user_id) === data.userID);

            if(result?.user_id) {
                return result;
            }
        }
        return null;
    });

export const getUserIDSelector =
    createSelector(selectState, (data: CommonStateType) => data.userID);
export const getUserIDFromQrSelector =
    createSelector(selectState, (data: CommonStateType) => data.qrID);

export const getUsersListSelector =
    createSelector(selectState, (data: CommonStateType): Array<UserType> => data.usersList);

export const getUploadSelector =
    createSelector(selectState, (data: CommonStateType) => data.uploadData);
