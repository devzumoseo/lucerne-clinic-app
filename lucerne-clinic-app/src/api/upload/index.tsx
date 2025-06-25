import {getApiUrl, getKeySession, getMD5} from "../common";
import imageCompression from 'browser-image-compression';
import {SHA256} from "../../helpers/sha256";
import {getXmlErrorApi} from "../xml-error";
import {datadogError, datadogInfo, datadogInfoUpload} from "../datadog-info";

const XMLParser = require('react-xml-parser');

const toBase64 = (file:File) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString() || '');
    reader.onerror = error => reject(error);
});

const getPhotoSize: any = (file:File) => new Promise((resolve, reject) => {
    let img = new Image();
    img.src = window.URL.createObjectURL(file);
    img.onload = () => resolve({height: img.height, width: img.width});
    img.onerror = error => reject(error);
});

const calculateFormDataSize = (formData: FormData) => {
    let size = 0;
    // @ts-ignore
    for (let entry of formData.entries()) {
        const key = entry[0];
        const value = entry[1];

        // Check if the value is a File object
        if (value instanceof File) {
            size += value.size;
        } else {
            size += String(value).length;
        }
    }
    return size;
}

interface PhotoProps {
    uuid_upload: string;
    apiUrl: string;
    photo: File;
    upload_cat: string;
    uuid_sign: string;
    uuid: string;
    images_total: number;
    image_nr: number;
    id_cal: string;
    document_final?: number,
    document_uuid?: string,
}

export const sendPhotoApi = async (props: PhotoProps, th_width: number): Promise<any | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    let photoBase64 = await toBase64(props.photo);
    const size = await getPhotoSize(props.photo);
    const fileEx = props.photo.type.split('/');
    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);

        formData.append("password", str);
    }

    if(photoBase64) {
        const arr = String(photoBase64).split('base64,');
        if(arr?.length === 2) {
            photoBase64 = arr[1];
        }
    }

    formData.append("uuid_upload", props.uuid_upload);
    formData.append("id_cal", props.id_cal);
    formData.append("uuid", props.uuid);
    // formData.append("uuid_sign", props.uuid_sign);
    formData.append("upload_cat", props.upload_cat);

    formData.append("images_total", String(props.images_total));
    formData.append("image_nr", String(props.image_nr));

    formData.append("file_name", props.photo.name.replace(/\.[^/.]+$/, ""));
    formData.append("file_ext", fileEx?.length === 2 ? fileEx[1]: props.photo.type);
    formData.append("file_size", String(props.photo.size));
    size?.height && formData.append("file_height", String(size?.height));
    size?.width && formData.append("file_width", String(size?.width));
    formData.append("file_source", String(photoBase64));
    try {
        const compressedFile = await imageCompression(props.photo, {
            maxSizeMB: 0.5, maxWidthOrHeight: th_width, fileType: 'image/jpeg',
        });

        let thBase64 = await toBase64(new File([compressedFile], props.photo.name));
        const thSize = await getPhotoSize(new File([compressedFile], props.photo.name));
        const thFileEx = props.photo.type.split('/');

        if(thBase64) {
            const arr = String(thBase64).split('base64,');
            if(arr?.length === 2) {
                thBase64 = arr[1];
            }
        }

        formData.append("file_thumbnail_name", 'thumbnail_' + props.photo.name.replace(/\.[^/.]+$/, ""));
        formData.append("file_thumbnail_ext", thFileEx?.length === 2 ? thFileEx[1]: props.photo.type);
        formData.append("file_thumbnail_size", String(compressedFile.size));
        thSize?.height && formData.append("file_thumbnail_height", String(thSize?.height));
        thSize?.width && formData.append("file_thumbnail_width", String(thSize?.width));
        formData.append("file_thumbnail_source", String(thBase64));

    } catch (error) {
        console.log(error);
    }

    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        const upload =  await fetch(`${getApiUrl()}${props.apiUrl}`, fetchOptions);
        datadogInfo(`${getApiUrl()}${props.apiUrl}`, formData, upload);

        if(!upload?.ok) {
            datadogError(`${getApiUrl()}${props.apiUrl}`,formData, upload);

            throw new Error(String(upload.url) + ' ' +String(upload.status));
        }
        const upload_xml = await upload.text();
        const upload_json: any = new XMLParser().parseFromString(upload_xml);

        if(!!upload_xml) {
            if(upload_xml.substring(0,20) === '\x3C!-- " ---></TD></TD'|| upload_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: props.uuid, error_data: upload_xml});
            }
        }

        if(upload_json?.name === 'ok') {
            return 'ok';
        }

        if(upload_json?.name === 'error') {
            datadogError(`${getApiUrl()}${props.apiUrl}`,formData, upload_json);
            return upload_json;
        }

        return null;

    } catch (error: any) {
        datadogError(`${getApiUrl()}${props.apiUrl}`,formData, error);
        return null;
    }
}

export const sendScanApi = async (props: PhotoProps, th_width: number): Promise<any | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    let photoBase64 = await toBase64(props.photo);
    const size = await getPhotoSize(props.photo);
    const fileEx = props.photo.type.split('/');
    const app_v = process.env.REACT_APP_VERSION;

    formData.append("document_final", String(props.document_final));
    formData.append("document_uuid", String(props.document_uuid));

    app_v && formData.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);
        formData.append("password", str);
    }

    if(photoBase64) {
        const arr = String(photoBase64).split('base64,');
        if(arr?.length === 2) {
            photoBase64 = arr[1];
        }
    }

    formData.append("uuid_upload", props.uuid_upload);
    formData.append("id_cal", props.id_cal);
    formData.append("uuid", props.uuid);
    formData.append("upload_cat", props.upload_cat);

    formData.append("images_total", String(props.images_total));
    formData.append("image_nr", String(props.image_nr));

    formData.append("file_name", props.photo.name.replace(/\.[^/.]+$/, ""));
    formData.append("file_ext", fileEx?.length === 2 ? fileEx[1]: props.photo.type);
    formData.append("file_size", String(props.photo.size));
    size?.height && formData.append("file_height", String(size?.height));
    size?.width && formData.append("file_width", String(size?.width));
    formData.append("file_source", String(photoBase64));

    if(formData.get('file_ext') === 'png') {
        formData.append("file_ext", 'jpg');
    }
    try {
        const compressedFile = await imageCompression(props.photo, {
            maxSizeMB: 0.5, maxWidthOrHeight: th_width, fileType: 'image/jpeg',
        });

        let thBase64 = await toBase64(new File([compressedFile], props.photo.name));
        const thSize = await getPhotoSize(new File([compressedFile], props.photo.name));
        const thFileEx = props.photo.type.split('/');

        if(thBase64) {
            const arr = String(thBase64).split('base64,');
            if(arr?.length === 2) {
                thBase64 = arr[1];
            }
        }

        formData.append("file_thumbnail_name", 'thumbnail_' + props.photo.name.replace(/\.[^/.]+$/, ""));
        formData.append("file_thumbnail_ext", thFileEx?.length === 2 ? thFileEx[1]: props.photo.type);
        formData.append("file_thumbnail_size", String(compressedFile.size));
        thSize?.height && formData.append("file_thumbnail_height", String(thSize?.height));
        thSize?.width && formData.append("file_thumbnail_width", String(thSize?.width));
        formData.append("file_thumbnail_source", String(thBase64));

        if(formData.get('file_thumbnail_ext') === 'png') {
            formData.append("file_thumbnail_ext", 'jpg');
        }

    } catch (error) {
        console.log(error);
    }

    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        const upload =  await fetch(`${getApiUrl()}${props.apiUrl}`, fetchOptions);

        if(!upload?.ok) {
            datadogError(`${getApiUrl()}${props.apiUrl}`,formData, upload);
            throw new Error(String(upload.url) + ' ' + String(upload.status));
        }
        const upload_xml = await upload.text();
        const upload_json: any = new XMLParser().parseFromString(upload_xml);

        const logRequest = {...Object.fromEntries(formData),
            file_thumbnail_source: formData?.get('file_thumbnail_source')?.slice(0, 250) + '...',
            file_source: formData?.get('file_source')?.slice(0, 250) + '...',
        }

        datadogInfoUpload(`${getApiUrl()}${props.apiUrl}`, {
            requestHeader: {contentLength: calculateFormDataSize(formData)},
            responseHeader: {
                contentLength: upload.headers.get("content-length"),
                contentType:upload.headers.get("content-type"),
                contentDate:upload.headers.get("content-date")
            },
            request: logRequest,
            response: upload_json?.attributes?.log ? String(upload_json?.attributes?.log).slice(0, 50) + '...' : '',
        }).then();

        if(!!upload_xml) {
            if(upload_xml.substring(0,20) === '\x3C!-- " ---></TD></TD'|| upload_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: props.uuid, error_data: upload_xml});
            }
        }

        if(upload_json?.name === 'ok') {
            return 'ok';
        }

        if(upload_json?.name === 'error') {
            datadogError(`${getApiUrl()}${props.apiUrl}`,formData, upload_json);
            return upload_json;
        }

        return null;

    } catch (error: any) {
        datadogError(`${getApiUrl()}${props.apiUrl}`,formData, error);
        return null;
    }
}

interface FileProps {
    uuid_upload: string;
    apiUrl: string;
    photo: File;
    upload_cat: string;
    uuid_sign: string;
    uuid: string;
    images_total: number;
    image_nr: number;
    id_cal: string;
}

export const sendFileApi = async (props: FileProps): Promise<any | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    let fileBase64 = await toBase64(props.photo);
    const fileEx = props.photo.type.split('/');
    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);

        formData.append("password", str);
    }

    if(fileBase64) {
        const arr = String(fileBase64).split('base64,');
        if(arr?.length === 2) {
            fileBase64 = arr[1];
        }
    }

    formData.append("uuid_upload", props.uuid_upload);
    formData.append("id_cal", props.id_cal);
    formData.append("uuid", props.uuid);
    formData.append("upload_cat", props.upload_cat);

    formData.append("files_total", String(props.images_total));
    formData.append("file_nr", String(props.image_nr));

    formData.append("file_name", props.photo.name.replace(/\.[^/.]+$/, ""));
    formData.append("file_ext", fileEx?.length === 2 ? fileEx[1]: props.photo.type);
    formData.append("file_size", String(props.photo.size));
    formData.append("file_source", String(fileBase64));

    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        const upload =  await fetch(`${getApiUrl()}${props.apiUrl}`, fetchOptions);
        datadogInfo(`${getApiUrl()}${props.apiUrl}`, formData, upload);

        if(!upload?.ok) {
            datadogError(`${getApiUrl()}${props.apiUrl}`,formData, upload);

            throw new Error(String(upload.url) + ' ' +String(upload.status));
        }
        const upload_xml = await upload.text();
        const upload_json: any = new XMLParser().parseFromString(upload_xml);

        if(!!upload_xml) {
            if(upload_xml.substring(0,20) === '\x3C!-- " ---></TD></TD'|| upload_xml.substring(0,80) === '\r\n<meta charset="iso-8859-2" />\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\x3C!-- " ---></TD></TD>') {
                await getXmlErrorApi({uuid: props.uuid, error_data: upload_xml});
            }
        }

        if(upload_json?.name === 'ok') {
            return 'ok';
        }

        if(upload_json?.name === 'error') {
            datadogError(`${getApiUrl()}${props.apiUrl}`,formData, upload_json);
            return upload_json;
        }

        return null;

    } catch (error: any) {
        datadogError(`${getApiUrl()}${props.apiUrl}`,formData, error);
        return null;
    }
}


export const downloadFileApi = async (props: {id_cal: string, id_adr: string | null, id_dmls: string, id_akte: string, yd_cal: string, uuid_sign: string, uuid: string}): Promise<any | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);

    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);

        formData.append("password", str);
    }

    formData.append("uuid", props.uuid);
    formData.append("id_dms", props.id_dmls);
    formData.append("id_cal", props.id_cal);
    props.id_adr &&formData.append("id_adr", props.id_adr);
    formData.append("id_akte", props.id_akte);
    formData.append("yd_cal", props.yd_cal);
    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        const upload =  await fetch(`${getApiUrl()}download_erp.cfm`, fetchOptions);
        datadogInfo(`${getApiUrl()}download_erp.cfm`, formData, upload);

        if(!upload?.ok) {
            datadogError(`${getApiUrl()}download_erp.cfm`,formData, upload);

            throw new Error(String(upload.url) + ' ' +String(upload.status));
        }
        const res = await upload.text();
        const res_json: any = new XMLParser().parseFromString(res);

        return res_json?.value ? res_json : null;

    } catch (error: any) {
        datadogError(`${getApiUrl()}download_erp.cfm`,formData, error);
        return null;
    }
}

export const uploadFileApi = async (props: {uuid_sign: string, uuid: string, file: string, size: string, uuid_file: string}): Promise<any | null> => {
    const keySession = getKeySession();
    const formData = new FormData();
    const app_v = process.env.REACT_APP_VERSION;
    app_v && formData.append("app_version", app_v);
    if(getMD5()) {
        const str: string = await SHA256(props.uuid + getMD5() + keySession);

        formData.append("password", str);
    }

    if(props.file) {
        const arr = String(props.file).split('base64,');
        if(arr?.length === 2) {
            props.file = arr[1];
        }
    }

    formData.append("uuid", props.uuid);
    formData.append("uuid_file", props.uuid_file);
    formData.append("file_size", String(props.size));
    formData.append("file_source", props.file);

    const fetchOptions: any = {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    };

    try {
        const upload =  await fetch(`${getApiUrl()}upload_erp.cfm`, fetchOptions);
        datadogInfo(`${getApiUrl()}upload_erp.cfm`, formData, upload);

        if(!upload?.ok) {
            datadogError(`${getApiUrl()}upload_erp.cfm`,formData, upload);

            throw new Error(String(upload.url) + ' ' +String(upload.status));
        }
        const res = await upload.text();
        return res ? res : null;

    } catch (error: any) {
        datadogError(`${getApiUrl()}upload_erp.cfm`,formData, error);
        return null;
    }
}
