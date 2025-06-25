import { init, RematchDispatch, RematchRootState, Models } from "@rematch/core";
import createPersistPlugin from "@rematch/persist";
import storage from "redux-persist/lib/storage";

import common from "./common/model";
import qr_code from "./qr-code/model";
import detail from "./detail/model";

export interface RootModel extends Models<RootModel> {
    common: typeof common;
    qr_code: typeof qr_code;
    detail: typeof detail;
}

const models: RootModel = {
    common,
    qr_code,
    detail
};

const persistPlugin = createPersistPlugin({
    key: "root",
    storage,
    version: 10,
    whitelist: ["common", "detail", "qr_code"],
});

export type RootState = RematchRootState<RootModel>;
export type RootDispatch = RematchDispatch<RootModel>;

const store = init<any>({
    models,
    plugins: [persistPlugin],
});

export const { select } = store
export default store;
