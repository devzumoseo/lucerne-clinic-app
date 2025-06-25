import {postLogErrorApi} from "../api/xml-error";

export const isErrorResponse = (data: any, qr?: number, uuid?: string): {type: 'error' | 'ok', value: string} => {
    if(data?.name === 'error') {
        let text = (data?.attributes?.code ? 'Fehlercode: ' + data.attributes.code + '. ' : '') +
            (data?.attributes?.error_txt ? data?.attributes?.error_txt : '') + data?.value;
        postLogErrorApi({uuid, error_data: 'ApiErrorAsResponse' + text + '\n\n /// \n\n'
                + JSON.stringify(data)}).then();

        return {type: 'error', value: text}
    }
    return {type: 'ok', value: ''}
}
