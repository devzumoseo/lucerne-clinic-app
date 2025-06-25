import {getApiUrl, getKeySession, getMD5} from "../common";
import {SHA256} from "../../helpers/sha256";
import {getXmlErrorApi, postLogErrorApi} from "../xml-error";
import {datadogError, datadogInfo} from "../datadog-info";
const XMLParser = require('react-xml-parser');


export const getUsersApi = async (props: any): Promise<any | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    formData.append("uuid", props.uuid);
    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);

        formData.append("password", str);
    }

    // if(process.env.REACT_APP_USE_UUID_SIGN === 'true') {
    //     keySession && formData.append("key_session", keySession);
    //     formData.append("uuid_sign", props.uuid_sign);
    // } else {
    //     if(keySession) {
    //         const authCode = totpCode(keySession);
    //         authCode && formData.append("auth_id", authCode);
    //     }
    // }

    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        let result: any = []
        const data =  await fetch(`${getApiUrl()}user_list.cfm`, fetchOptions);
        datadogInfo(`${getApiUrl()}user_list.cfm`, formData, data);

        if(!data?.ok) {
            datadogError(`${getApiUrl()}user_list.cfm`,formData, data);

            throw new Error(String(data.url) + ' ' +String(data.status));
        }
        const users_xml = await data.text();
        const users_json: any = new XMLParser().parseFromString(users_xml);

        if(!!users_xml) {
            if(users_xml.substring(0,20) === '\x3C!-- " ---></TD></TD'|| users_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: props?.uuid, error_data: users_xml});
            }
        }

        if(users_json?.name === 'error') {
            datadogError(`${getApiUrl()}user_list.cfm`,formData, users_json);

            return users_json
        }

        if(users_json?.children?.length) {
            result = users_json.children.map((val: any) => {
                return {...val.attributes, name: val.name};
            })
        }
        return result;


    } catch (error) {
        datadogError(`${getApiUrl()}user_list.cfm`,formData, error);
        // console.log('error----', error);
        // let formDataString = '';
        // // @ts-ignore
        // for (const [key, value] of formData.entries()) {
        //     formDataString += `${key}: ${value}\n`;
        // }
        // // @ts-ignore
        // postLogErrorApi({uuid: props.uuid, error_data: error.toString() + '\n formData: \n' + formDataString}).then();
        return null;
    }
}
