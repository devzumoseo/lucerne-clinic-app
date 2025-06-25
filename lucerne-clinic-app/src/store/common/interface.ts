export interface UserType {
  name: string;
  user_fn: string;
  user_id: string;
  user_key: string;
  user_ln: string;
}

export interface CommonStateType {
  showLoading: boolean;
  uuID: string;
  uuIDSign: string;
  consultationsDate: string | null;
  isTestMode: boolean;
  wifiOnly: boolean;
  qrID: number;
  session_timeout: {time: number | null, time_from: Date}
  userID: number;
  userIDFromQr: number;
  usersList: Array<UserType> | [];
  uploadData: {
    show: boolean,
    progress: number,
    total: number,
    current: number,
    time: string
  }
}
