import {FC, useEffect, useState} from 'react';
import {IonButton, IonRippleEffect, useIonToast, useIonViewWillLeave} from "@ionic/react";
import cn from "classnames";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";

import {getClientFileDetailSelector, getPatientDetailsSelector} from "../../../../store/detail/selector";
import {sendFileApi} from "../../../../api/upload";
import {getErrorUrl} from "../../../../hooks/url-generator";
import {RootDispatch} from "../../../../store";
import {getCommonSelector, getQrIDSelector, getSessionTimeoutSelector} from "../../../../store/common/selector";
import {useParams} from "react-router-dom";
import {isErrorResponse} from "../../../../hooks/is-error-respocse";
import {getConsultationDetailApi} from "../../../../api/consultation-detail";

import css from './edit-files.module.scss';
import {getXmlErrorApi} from "../../../../api/xml-error";


interface PropsInterface {
    filesProp: Array<File>;
    emitCancel: () => void;
    emitFileChange: () => void;
    emitBack: () => void;
    onFileRemove: (e: null | Array<File>) => void;
    uploadCat: any;
}

const EditFiles: FC<PropsInterface> = ({filesProp, emitCancel, emitFileChange, onFileRemove, uploadCat}) => {
    const [files, setFiles] = useState<null | Array<File>>(null)
    const [apiUrl, setApiUrl] = useState<null | string>(null)
    const { id }: any = useParams();
    const clientFilesDetail = useSelector((state: never) => getClientFileDetailSelector(state, id));
    const patientDetail = useSelector((state: never) => getPatientDetailsSelector(state, id));
    const [present] = useIonToast();
    const history = useHistory();
    const dispatch = useDispatch<RootDispatch>();
    const commonData = useSelector(getCommonSelector);
    const [disable, setDisable] = useState(false);
    const qrID = useSelector(getQrIDSelector);
    const timeoutSelector = useSelector(getSessionTimeoutSelector);

    useIonViewWillLeave(() => {
        setDisable(false)
    });

    useEffect(() => {
        filesProp && setFiles(filesProp)
    }, [filesProp])

    useEffect(() => {
        clientFilesDetail?.url_upload && setApiUrl(clientFilesDetail?.url_upload);
    }, [clientFilesDetail])

    const removePhoto = (i: number) => {
        let result: null | Array<File> = null;

        if(files) {
            result = files.filter((val, n) => n !== i);
        }

        onFileRemove(result)
    }

    const dataLoading = async () => {
        if(commonData.uuID && commonData.uuIDSign) {
            dispatch.common.resetSessionTimeout();

            const detail = await getConsultationDetailApi({
                uuid: commonData.uuID,
                uuid_sign: commonData.uuIDSign,
                id_cal: id
            });

            // errors check
            const error_check = isErrorResponse(detail, qrID, commonData.uuID);
            if(error_check.type === 'error') {
                history.push(getErrorUrl(error_check.value));
                dispatch.common.setShowLoading(false);
                return;
            }

            // qr version check
            if(detail?.qr && qrID) {
                if(detail?.qr > qrID) {
                    history.push(getErrorUrl('Dieser Account wurde zurückgesetzt (QR-ID nicht aktuell)' ))
                    await dispatch.common.changeSessionTimeout({time: timeoutSelector ? timeoutSelector : 300, time_from: new Date()})
                    dispatch.common.setShowLoading(false);
                    return;
                }
            }

            // data loading
            if(detail?.list?.length) {
                const refresh = {timer: detail.attributes.refresh, time_from: new Date()};

                const detail_data = {
                    id: Number(id),
                    data: {
                        clientDetail: detail.list,
                        session_timeout: {timer: '', time_from: new Date},
                        attributes: {...detail.attributes, timeout: refresh, refresh: refresh}
                    }
                }

                dispatch.detail.changeClientDetail(detail_data);

                if(detail_data?.data?.clientDetail?.length) {
                    const res = detail_data.data.clientDetail.find(el => el.action === 'upload_doc');

                    return res?.uuid_upload ? res?.uuid_upload : null;
                }
            } else {
                history.push(getErrorUrl())
                dispatch.common.setShowLoading(false);
                return;
            }
        } else {
            history.push(getErrorUrl())
            dispatch.common.setShowLoading(false);
            return;
        }

        return null;
    }

    const send = async () => {
        uploadCat = uploadCat?.value.find((el: any) => el.type === 'file');

        if(files && apiUrl && uploadCat?.attributes?.id_cat && commonData?.uuID && commonData?.uuIDSign) {
            // dispatch.common.setShowLoading(true);
            let new_uuid_upload;

            const refresh_data = patientDetail?.data?.attributes?.timeout;
            let need_refresh = true;
            if(refresh_data?.time_from instanceof Date) {
                const time = refresh_data.time_from.getTime() + (Number(refresh_data.timer) * 1000);

                need_refresh = time < new Date().getTime();
            }

            if(patientDetail?.id && !need_refresh) {
                console.log('data loaded from store')
            } else {
                const response = await dataLoading();

                if(response) {
                    new_uuid_upload = response;
                }
            }

            dispatch.common.changeUploadData({
                show: true,
                progress: 0,
                total: files.length,
                current: 0,
                time: '0s'
            });
            let startTime = new Date().getTime();

            for (const file of files) {

                try {
                    const i = files.indexOf(file) + 1;

                    const request = sendFileApi({
                        photo: file,
                        id_cal: id,
                        uuid_upload: new_uuid_upload ? new_uuid_upload : clientFilesDetail.uuid_upload,
                        apiUrl,
                        upload_cat: uploadCat?.attributes?.id_cat,
                        uuid: commonData.uuID,
                        uuid_sign: commonData.uuIDSign,
                        image_nr: i,
                        images_total: files.length
                    });

                    const result = await request;

                    dispatch.common.changeUploadData({
                        show: true,
                        progress: Math.round(((i) / (files.length)) * 100),
                        total: files.length,
                        current: i,
                        time: ((new Date().getTime() - startTime) / 1000).toFixed(2) + 's'
                    });

                    startTime = new Date().getTime();

                    // await new Promise(resolve => setTimeout(resolve, 1000));

                    if(result !== 'ok') {
                        dispatch.common.changeUploadData({
                            show: false,
                            progress: 0,
                            total: 0,
                            current: 0,
                            time: '0s'
                        });
                        const error_check = isErrorResponse(result, qrID, commonData.uuID);
                        emitCancel()
                        if(error_check.type === 'error') {
                            history.push(getErrorUrl(error_check.value));
                        } else {
                            history.push(getErrorUrl('API Fehler, bitte später nochmals versuchen.'))
                        }
                        dispatch.common.setShowLoading(false);
                        return;
                    }
                } catch (e) {
                    dispatch.common.changeUploadData({
                        show: false,
                        progress: 0,
                        total: 0,
                        current: 0,
                        time: '0s'
                    });
                    emitCancel()
                    history.push(getErrorUrl('API Fehler, bitte später nochmals versuchen.'))
                    dispatch.common.setShowLoading(false);
                    return;
                }
            }

            dispatch.common.changeUploadData({
                show: false,
                progress: 0,
                total: 0,
                current: 0,
                time: '0s'
            });
            setDisable(true);
            dispatch.common.setShowLoading(false);
            emitCancel();
            setTimeout(() => {
                present({
                    message:'Dateien erfolgreich gesendet' ,
                    position: 'top',
                    mode: 'ios',
                    buttons:[{
                        icon: '/img/icon/close-white.svg',
                        role: 'cancel',
                    }]
                });
            }, 500)

        } else {
            dispatch.common.changeUploadData({
                show: false,
                progress: 0,
                total: 0,
                current: 0,
                time: '0s'
            });
            history.push(getErrorUrl())
        }
    }

    return (
        <div className={css.form}>
            <div className={css.btnGroup}>
                <IonButton className={cn('myButton danger')} color="danger" onClick={emitCancel}>
                    <img src="/img/icon/close.svg" alt="close"/>
                    <span>Abbrechen</span>
                    <IonRippleEffect className="myDarkRipple" />
                </IonButton>
                <IonButton className={cn('myButton')} color="secondary" onClick={send} disabled={disable}>
                    <img src="/img/icon/send.svg" alt="send"/>
                    <span>Senden</span>
                    <IonRippleEffect className="myDarkRipple" />
                </IonButton>
            </div>

            <div className={css.photos}>
                {files && <>
                    {files.map((pic, i) => <div key={i} className={css.pic}>
                        <div className={css.item}>
                            <img src="/img/file.png" alt="file"/>
                            <p>{pic.name}</p>
                        </div>
                        {
                            files?.length > 1 &&
                            <div className={css.close} onClick={() => removePhoto(i)}>
                                <img src="/img/icon/close-small.svg" alt="close"/>
                            </div>
                        }
                    </div>)}
                </>
                }

                <div className={cn('ion-activatable', css.addBtn)} onClick={emitFileChange}>
                    <img src="/img/icon/plus.svg" alt="plus"/>
                    <IonRippleEffect className="myDarkRipple" />
                </div>
            </div>
        </div>
    );
};

export default EditFiles;
