import {getApiUrl, getMD5} from "../common";
import {SHA256} from "../../helpers/sha256";
import {getXmlErrorApi} from "../xml-error";
import {datadogError, datadogInfo} from "../datadog-info";

const XMLParser = require('react-xml-parser');

interface AccessInterface {
    access_key: string,
    key_session: string,
    qr_version: number,
    timeout: {timer: string, time_from: Date}
}

export const getAccessApi = async (uuid: string, uuid_sign: string, isTestMode: boolean, wifiOnly: boolean): Promise<AccessInterface | null> => {
    const formData = new FormData();
    const formDataKey = new FormData();
    formData.append("uuid", uuid);
    formData.append("act", "request");
    formData.append("mobile", String(Number(!wifiOnly)));

    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);
    app_v && formDataKey.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(uuid + getMD5() + uuid_sign);
        formData.append("password", str);
    }

    // if(process.env.REACT_APP_USE_UUID_SIGN === 'true') {
    //     formData.append("uuid_sign", uuid_sign);
    //     formDataKey.append("uuid_sign", uuid_sign);
    // } else {
    //     const authCode = totpCode(uuid_sign);
    //     authCode && formData.append("auth_id", authCode);
    // }

    const accessOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        const access =  await fetch(
            `${getApiUrl()}${isTestMode ? 'access_exa.cfm' : 'access_pro.cfm'}`,
            accessOptions
        );
        if(!access?.ok) {
            datadogError(`${getApiUrl()}${isTestMode ? 'access_exa.cfm' : 'access_pro.cfm'}`,formData, access);
            throw new Error(String(access.url) + ' ' + String(access.status));
        }
        const access_key_xml = await access.text();
        const access_key: any = new XMLParser().parseFromString(access_key_xml);
        let qr_code;
        let timeout_data;

        datadogInfo(`${getApiUrl()}${isTestMode ? 'access_exa.cfm' : 'access_pro.cfm'}`, formData, access_key);

        if(isTestMode) {
            access_key.attributes.key = 'RIG4IEIH26RIUVHI';
        }

        if(!!access_key_xml) {
            if(access_key_xml.substring(0,20) === '\x3C!-- " ---></TD></TD'|| access_key_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: uuid, error_data: access_key_xml});
            }
        }

        if(access_key?.name === 'error') {
            return access_key
        }

        if(access_key?.children?.length) {
            if(access_key.children?.length) {
                const qr = access_key.children.find((v: any) => v.name === 'qr');
                const timeout = access_key.children.find((v: any) => v.name === 'Timeout');

                if(qr) {
                    qr_code =  qr.attributes?.version;
                }
                if(timeout) {
                    timeout_data =  timeout.attributes?.data;
                }
            }
        }

        const sha_access = await SHA256(uuid + getMD5() + access_key.attributes.key);
        // get key session
        formDataKey.append("uuid", uuid);
        // formDataKey.append("uuid_sign", uuid_sign);
        formDataKey.append("act", "open");
        formDataKey.append("password", sha_access);
        formDataKey.append("mobile", String(Number(!wifiOnly)));

        // if(process.env.REACT_APP_USE_UUID_SIGN === 'true') {
        //     formDataKey.append("key_sign", access_key.attributes.key);
        // } else {
        //     const auth_code_key_sign = totpCode(access_key.attributes.key);
        //     auth_code_key_sign && formDataKey.append("auth_id", auth_code_key_sign);
        // }

        const keyOptions: any = {
            method: 'POST',
            body: formDataKey,
            redirect: 'follow'
        };

        const key =  await fetch(`${getApiUrl()}access.cfm`, keyOptions);
        datadogInfo(`${getApiUrl()}access.cfm`, keyOptions, key);

        if(!key?.ok) {
            datadogError(`${getApiUrl()}access.cfm !key?.ok`,keyOptions, key);
            throw new Error(String(key.url) + ' ' + String(key.status));
        }
        const key_xml = await key.text();
        const key_session: any = new XMLParser().parseFromString(key_xml);

        if(!!key_xml) {
            if(key_xml.substring(0,20) === '\x3C!-- " ---></TD></TD' || key_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: uuid, error_data: key_xml});
            }
        }

        if(key_session?.name === 'error') {
            datadogError(`${getApiUrl()}access.cfm key_session?.name`,keyOptions, key_session);
            return key_session
        }

        if(access_key?.attributes?.key && key_session?.attributes?.key_session) {
            return {
                access_key: access_key.attributes.key,
                key_session: key_session.attributes.key_session,
                qr_version: qr_code ? Number(qr_code) : 0,
                timeout: {timer: timeout_data, time_from: new Date()}
            };
        } else {
            return null;
        }
    } catch (error) {
        datadogError(`${getApiUrl()}access.cfm error`,formData, error);
        console.log('error----', error);
        // let formDataString = '';
        // // @ts-ignore
        // for (const [key, value] of formData.entries()) {
        //     formDataString += `${key}: ${value}\n`;
        // }
        // // @ts-ignore
        // postLogErrorApi({uuid: uuid, error_data: error.toString() + '\n formData: \n' + formDataString}).then();
        //
        return null;
    }
}
