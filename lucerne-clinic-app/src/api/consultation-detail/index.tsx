import {getApiUrl, getKeySession, getMD5} from "../common";
import {totpCode} from "../../hooks/totp-code";
import {SHA256} from "../../helpers/sha256";
import {getXmlErrorApi, postLogErrorApi} from "../xml-error";
import {datadogError, datadogInfo} from "../datadog-info";

const XMLParser = require('react-xml-parser');

interface ConsultationProps {
    uuid: string;
    uuid_sign: string;
    id_cal: string;
}
export interface DetailProps {
    id_cal: string;
    notes: string;
    timeout: string;
    refresh: string;
    title: string;
}
export const getConsultationDetailApi = async (props: ConsultationProps): Promise<{attributes: DetailProps, list: Array<any>, qr: number | null} | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    formData.append("uuid", props.uuid);
    // formData.append("uuid_sign", props.uuid_sign);
    formData.append("id_cal", props.id_cal);

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
        const detail =  await fetch(`${getApiUrl()}cal_detail.cfm`, fetchOptions);
        const detail_xml = await detail.text();
        const detail_json: any = new XMLParser().parseFromString(detail_xml);

        datadogInfo(`${getApiUrl()}cal_detail.cfm`, formData, detail_json);

        if(!detail?.ok) {
            datadogError(`${getApiUrl()}cal_detail.cfm`, formData, detail);

            throw new Error(String(detail.url) + ' ' +String(detail.status));
        }

        if(!!detail_xml) {
            if(detail_xml.substring(0,20) === '\x3C!-- " ---></TD></TD' || detail_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: props?.uuid, error_data: detail_xml});
            }
        }

        if(detail_json?.name === 'error') {
            datadogError(`${getApiUrl()}cal_detail.cfm`, formData, detail_json);
            return detail_json
        }

        if(detail_json?.name === 'cal_detail' && detail_json?.children?.length && detail_json?.attributes?.timeout) {
            const qr_data = detail_json.children.find((data: any) => data.name === 'qr');
            let cal_erp = detail_json.children.find((data: any) => data.name === 'cal_erp');
            let cal_survey = detail_json.children.find((data: any) => data.name === 'cal_survey');
            const list = detail_json.children.map((data: any) => {
                return {
                    ...data.attributes,
                    list: data.children
                }
            })

            if(cal_erp &&  cal_erp?.name) {
                cal_erp = {name: cal_erp?.name, list: cal_erp?.children?.length ? cal_erp?.children : []}
            }
            if(cal_survey &&  cal_survey?.name) {
                cal_survey = {name: cal_survey?.name, list: cal_survey?.children?.length ? cal_survey?.children : []}
            }

            return {
                attributes: {...detail_json.attributes, cal_erp: cal_erp, cal_survey},
                list: list,
                qr: qr_data?.attributes?.version ? Number(qr_data.attributes.version) : null
            }
        }

        return null;

    } catch (error) {
        datadogError(`${getApiUrl()}cal_detail.cfm`, formData, error);
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
