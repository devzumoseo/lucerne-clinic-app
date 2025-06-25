import { createModel, RematchDispatch } from "@rematch/core";
import { RootModel } from "../index";
import {DetailStateType} from "./interface";

const defaultData = [{
  id: null,
  data: {
    clientDetail: null,
    session_timeout: {timer: '', time_from: new Date},
    attributes: {
      timeout: {timer: '', time_from: new Date},
      refresh: {timer: '', time_from: new Date},
      id_cal: '',
      notes: '',
      title: '',
      dt_cal: '',
      id_sm: '',
      cal_erp: {
        name: '',
        list: []
      },
      cal_survey: {
        name: '',
        list: []
      }
    }
  }
}];

const listDefaultData = [{
  id:  null,
  data:  null,
  refresh: {timer: '', time_from: new Date()}
}];

const initialState: DetailStateType = {
  details: defaultData,
  patients_list: listDefaultData
};

const model = createModel<RootModel>()({
  state: {
    ...initialState,
  },
  reducers: {
    setDefault: (state: DetailStateType) => {
      return { ...state,
        details: defaultData,
        patients_list: listDefaultData
      };
    },

    setClientDetail: (state: DetailStateType, payload: any) => {
      const index = state.details.findIndex(object => {
        return object.id === payload.id;
      });

      if (index !== -1) {
        state.details[index] = payload;
      } else {
        state.details = [...state.details, payload]
      }

      return { ...state, details: state.details };
    },

    setPatientList: (state: DetailStateType, payload: any) => {
      const index = state.patients_list.findIndex(object => {
        return object.id === payload.id;
      });

      if (index !== -1) {
        state.patients_list[index] = payload;
      } else {
        state.patients_list = [...state.patients_list, payload]
      }

      return { ...state, patients_list: state.patients_list };
    },
  },
  effects: (dispatch: RematchDispatch<any>) => ({
    changeClientDetail(data: any) {
      dispatch.detail.setClientDetail(data);
    },

    changePatientList(data: any) {
      dispatch.detail.setPatientList(data);
    }
  }),
});

export default model;
