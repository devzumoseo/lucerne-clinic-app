import { createSelector } from 'reselect';
import { RootState } from "../index";
import {DetailStateType} from "./interface";
import moment from "moment/moment";
import {ConsultationInterface} from "../../api/consultations";

const selectState = (state: RootState) => state.detail;

export const getClientPhotoDetailSelector =
    createSelector(
        selectState,
        (_: DetailStateType, id: number) => id,
        (store: DetailStateType, id: number) => {
            id = Number(id)
            const data = store.details.find(el => el.id === id);
            if(data) {
                if(data?.data?.clientDetail?.length) {
                    let value =  data?.data?.clientDetail.find((val: any) => {
                        return val.action === 'upload_pic'
                    })
                    return value ? value : null
                }
            }

            return null;
        });

export const getClientFileDetailSelector =
    createSelector(
        selectState,
        (_: DetailStateType, id: number) => id,
        (store: DetailStateType, id: number) => {
            id = Number(id)
            const data = store.details.find(el => el.id === id);
            if(data) {
                if(data?.data?.clientDetail?.length) {
                    let value =  data?.data?.clientDetail.find((val: any) => {
                        return val.action === 'upload_doc'
                    })
                    return value ? value : null
                }
            }

            return null;
        });

export const getPatientDetailsSelector = createSelector(
        selectState,
        (_: DetailStateType, id: number) => id,
        (store: DetailStateType, id: number) => {
            id = Number(id)
            const result = store.details.find(el => el.id === id)

            console.log(123, result)
            return result ? result : null;
        });

export const getPatientsListSelector = createSelector(
    selectState,
    (_: DetailStateType, id: number) => id,
    (store: DetailStateType, id: number) => {
        id = Number(id);
        let result = store.patients_list.find(el => el.id === id)

        if(result?.data?.length) {
            const is_same = moment(result.data[0].dt_cal_s, "YYYY-MM-DD HH:mm:ss").isSame(moment(), 'day');

            if(is_same) {
                result.data = [...result.data, {
                    dt_cal_s: moment().format("YYYY-MM-DD HH:mm:ss"),
                    id_cal: 'time',
                    id_color: 'string;',
                    ti_cal: 'string;',
                    title: 'string;',
                    name: 'string;',
                    color: 'string;',
                    notes: 'string;',
                    id_sm: 'string;',
                    refresh: 0
                }].sort((a,b) =>
                    moment(a.dt_cal_s, 'YYYY-MM-DD HH:mm:ss').valueOf() -
                    moment(b.dt_cal_s, 'YYYY-MM-DD HH:mm:ss').valueOf())
            }
        }

        return result ? result: null;
    });
