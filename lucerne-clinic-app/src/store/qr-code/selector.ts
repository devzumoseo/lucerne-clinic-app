import { createSelector } from 'reselect';
import { RootState } from "../index";
import { QrCodeStateType} from "./interface";

const selectState = (state: RootState) => state.qr_code;

export const haveProdAndDevKeysSelector =
  createSelector(selectState, (val: QrCodeStateType) => val?.data?.KEY_EXA && val?.data?.KEY_PRO);

