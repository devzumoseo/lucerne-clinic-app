import {getApiUrl, getKeySession, getMD5} from "../common";
import {SHA256} from "../../helpers/sha256";
import {datadogError} from "../datadog-info";

export const getXmlErrorApi = async (props: any): Promise<any | null> => {
    if(!props?.uuid) {
        props.uuid = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
    }
    const keySession = getKeySession();
    const formData = new FormData();
    formData.append("uuid", props.uuid);
    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);

        formData.append("password", str);
    }

    props.error_data && formData.append("error_data", props.error_data);

    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    datadogError(`XML ERROR`,formData, props);

    try {
        formData.append("error_text", props?.error_data);
        await fetch(`https://xnwcizqfroyn.tbapp.ch/log.cfm`, fetchOptions);
    } catch(error) {
        console.log('error----111111', error);
    }
}


export const postLogErrorApi = async (props: any): Promise<any | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    formData.append("uuid", props.uuid);
    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);
        formData.append("password", str);
    }

    props.error_data && formData.append("error_data", props.error_data);

    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        formData.append("error_text", props?.error_data);
        await fetch(`https://xnwcizqfroyn.tbapp.ch/log.cfm`, fetchOptions);
    } catch(error) {
        console.log('error----111111', error);
    }
}
