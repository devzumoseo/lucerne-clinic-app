import {ConsultationInterface} from "../../api/consultations";

export interface DetailStateType {
  details: Array<{
    id: number | null,
    data: {
      clientDetail: any | null,
      session_timeout: {timer: string, time_from: Date}
      attributes: {
        timeout: {timer: string, time_from: Date},
        refresh: {timer: string, time_from: Date},
        id_cal: string;
        notes: string;
        title: string;
        dt_cal: string;
        id_sm: string;
        cal_erp: {
          name: string;
          list: Array<any>;
        };
        cal_survey: {
          name: string;
          list: Array<any>;
        };
      }
    }
  }>,
  patients_list: Array<{
    id: number | null,
    data: Array<ConsultationInterface> | null,
    refresh: {timer: string, time_from: Date}
  }>
}
