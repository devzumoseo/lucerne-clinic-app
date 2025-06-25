import { createModel, RematchDispatch } from "@rematch/core";
import { QrCodeStateType } from "./interface";
import { RootModel } from "../index";

const initialState: QrCodeStateType = {
  qrBase64String: 'eyJVVUlEX1NJR04iOiIxNzM2NjQyODk1NUU4QjFCRDI3MzI3NjREMzAxMzhBOCIsIkRFVklDRSI6Ikx1a2FzIE1vYmlsZSIsIlVESUQiOiI4M0MzODA5NTgzMzczQkMxQ0Q0MjE5QzMwNTE0ODlBNCIsIktFWV9QUk8iOiJEQkQzQTE4OEQwRDdCOTBEM0Y0RjkyQTJBNDBEMTQxRDVFMzlGMjRGN0I3MEQ2MkNDRDkzNzg1ODQyQkM4NjczOTJGOUZFRTIzMDYwODNCQzFDN0FFMUVFNUQyQkNDMDM2NjFEQTQ0MkIxQUJERTA1MDU2Q0I5RENEMjhCODM2MSIsIktFWV9FWEEiOiIwODU4QkU3ODNFQTZDRThBQjY5MjE2RTk3OUJEMUE0NTVEQ0UyMTM3QkI4NjE3NDgzMDZENDFENkYyRDdCN0E2RjkwMDFFRkU5QTI2MDkzNEYwMzZGRjIzMTc1REFDMkYxMTJFNkMwNTU0MzY4OUVDNDg2RDhFQUE5NURGQkU0RCIsIk1PQklMRV9ORVRaIjoiMCIsIlVSTCI6ImFwaS50YmFwcC5jaC9hcHAvIn0===',
  data: null
};

const model = createModel<RootModel>()({
  state: {
    ...initialState,
  },
  reducers: {
    setDefault: (state: QrCodeStateType) => {
      return { ...state,
        qrBase64String: 'eyJVVUlEX1NJR04iOiIxNzM2NjQyODk1NUU4QjFCRDI3MzI3NjREMzAxMzhBOCIsIkRFVklDRSI6Ikx1a2FzIE1vYmlsZSIsIlVESUQiOiI4M0MzODA5NTgzMzczQkMxQ0Q0MjE5QzMwNTE0ODlBNCIsIktFWV9QUk8iOiJEQkQzQTE4OEQwRDdCOTBEM0Y0RjkyQTJBNDBEMTQxRDVFMzlGMjRGN0I3MEQ2MkNDRDkzNzg1ODQyQkM4NjczOTJGOUZFRTIzMDYwODNCQzFDN0FFMUVFNUQyQkNDMDM2NjFEQTQ0MkIxQUJERTA1MDU2Q0I5RENEMjhCODM2MSIsIktFWV9FWEEiOiIwODU4QkU3ODNFQTZDRThBQjY5MjE2RTk3OUJEMUE0NTVEQ0UyMTM3QkI4NjE3NDgzMDZENDFENkYyRDdCN0E2RjkwMDFFRkU5QTI2MDkzNEYwMzZGRjIzMTc1REFDMkYxMTJFNkMwNTU0MzY4OUVDNDg2RDhFQUE5NURGQkU0RCIsIk1PQklMRV9ORVRaIjoiMCIsIlVSTCI6ImFwaS50YmFwcC5jaC9hcHAvIn0===',
        data: null
      };
    },
    setQrBase64String: (state: QrCodeStateType, payload: string) => {
      return { ...state, qrBase64String: payload };
    },
    setQrData: (state: QrCodeStateType, payload: any) => {
      return { ...state, data: payload };
    },
  },
  effects: (dispatch: RematchDispatch<any>) => ({
    changeQrBase64String(str: string) {
      dispatch.qr_code.setQrBase64String(str);
    },
    changeQrData(data: any) {
      dispatch.qr_code.setQrData(data);
    },
  }),
});

export default model;
