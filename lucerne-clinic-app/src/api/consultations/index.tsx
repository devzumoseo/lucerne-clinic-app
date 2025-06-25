import {getApiUrl, getKeySession, getMD5} from "../common";
import {SHA256} from "../../helpers/sha256";
import {getXmlErrorApi, postLogErrorApi} from "../xml-error";
import {datadogError, datadogInfo} from "../datadog-info";

const XMLParser = require('react-xml-parser');

interface ConsultationProps {
    uuid: string;
    uuid_sign: string;
    yd_cal: string | null;
    user_id: number;
}

export interface ConsultationInterface {
    dt_cal_s: string;
    id_cal: string;
    id_color: string;
    ti_cal: string;
    title: string;
    name: string;
    color: string;
    notes: string;
    id_sm: string;
    refresh: number;
}

export const getConsultationsApi = async (props: ConsultationProps): Promise<Array<ConsultationInterface> | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    formData.append("uuid", props.uuid);
    formData.append("user_id", String(props.user_id));

    props.yd_cal && formData.append("yd_cal", props.yd_cal);

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
        const consultations =  await fetch(`${getApiUrl()}cal_list.cfm`, fetchOptions);
        const consultations_xml = await consultations.text();
        const consultations_json: any = new XMLParser().parseFromString(consultations_xml);

        datadogInfo(`${getApiUrl()}cal_list.cfm`, formData, consultations_json);

        if(!consultations?.ok) {
            datadogError(`${getApiUrl()}cal_list.cfm`,formData, consultations);
            throw new Error(String(consultations.url) + ' ' + String(consultations.status));
        }
        if(!!consultations_xml) {
            if(consultations_xml.substring(0,20) === '\x3C!-- " ---></TD></TD'||
                consultations_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: props?.uuid, error_data: consultations_xml});
            }
        }

        if(consultations_json?.name === 'error') {
            datadogError(`${getApiUrl()}cal_list.cfm`,formData, consultations_json);
            return consultations_json;
        }

        if(consultations_json?.children?.length && consultations_json?.children[0].name) {
            const colors = consultations_json.attributes.list_color.split(',');
            const refresh = consultations_json?.attributes?.refresh;
            const list = consultations_json.children.map((data: any) => {
                return {
                    name: data.name,
                    text: data.value,
                    ...data.attributes,
                    color: colors[Math.abs(Number(data.attributes.id_color)) - 1],
                    refresh: !!Number(refresh) ? Number(refresh) : 0
                }
            })

            return [...list, {name: 'refresh', refresh: !!Number(refresh) ? Number(refresh) : 0}]
        }

        return null;

    } catch (error) {
        datadogError(`${getApiUrl()}cal_list.cfm`,formData, error);
        // console.log('error----', error);
        // let formDataString = '';
        // // @ts-ignore
        // for (const [key, value] of formData.entries()) {
        //     formDataString += `${key}: ${value}\n`;
        // }
        // // @ts-ignore
        // postLogErrorApi({uuid: props?.uuid, error_data: error.toString() + '\n formData: \n' + formDataString}).then();
        //
        return null;
    }
}
