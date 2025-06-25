import {FC, useEffect, useState} from 'react';
import {
    IonButton,
    IonModal,
    IonRippleEffect,
    useIonToast,
    useIonViewWillLeave
} from "@ionic/react";
import cn from "classnames";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";
import {useParams} from "react-router-dom";

import {getClientPhotoDetailSelector, getPatientDetailsSelector} from "../../../../store/detail/selector";
import {sendPhotoApi} from "../../../../api/upload";
import {getErrorUrl} from "../../../../hooks/url-generator";
import {RootDispatch} from "../../../../store";
import {getCommonSelector, getQrIDSelector, getSessionTimeoutSelector} from "../../../../store/common/selector";
import {isErrorResponse} from "../../../../hooks/is-error-respocse";
import {getConsultationDetailApi} from "../../../../api/consultation-detail";

import css from './edit-photos.module.scss';

interface PropsInterface {
    files: Array<File>;
    emitCancel: () => void;
    emitPhotoChange: () => void;
    emitPhotoCameraChange: () => void;
    emitBack: () => void;
    onPhotoRemove: (e: null | Array<File>) => void;
    type: 'camera' | 'files';
    uploadCat: any;
}

const EditPhotos: FC<PropsInterface> = ({ files, emitCancel, emitPhotoChange, onPhotoRemove, emitPhotoCameraChange, type
                                            , uploadCat
}) => {
    const [photos, setPhotos] = useState<null | Array<File>>(null);
    const [apiUrl, setApiUrl] = useState<null | string>(null)
    const [openPicModal, seOpenPicModal] = useState(false)
    const [picForModal, sePicForModal] = useState<null | File>(null);
    const { id }: any = useParams();
    const clientPhotoDetail = useSelector((state: never) => getClientPhotoDetailSelector(state, id));
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
        files && setPhotos(files)
    }, [files])

    useEffect(() => {
        clientPhotoDetail?.url_upload && setApiUrl(clientPhotoDetail?.url_upload);
    }, [clientPhotoDetail])

    const removePhoto = (i: number) => {
        let result: null | Array<File> = null;

        if(photos) {
            result = photos.filter((val, n) => n !== i);
        }

        onPhotoRemove(result)
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
                    const res = detail_data.data.clientDetail.find(el => el.action === 'upload_pic');

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
        uploadCat = uploadCat?.value.find((el: any) => el.type === 'img');

        if(photos && apiUrl && uploadCat?.attributes?.id_cat && commonData?.uuID && commonData?.uuIDSign) {
            let thumb_width = 100;
            let new_uuid_upload;

            // dispatch.common.setShowLoading(true);

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

            // photos sending
            if(clientPhotoDetail?.file_thumb_width && clientPhotoDetail?.file_thumb_height) {
                thumb_width = (Number(clientPhotoDetail.file_thumb_width) + Number(clientPhotoDetail.file_thumb_height)) / 2
            }

            dispatch.common.changeUploadData({
                show: true,
                progress: 0,
                total: photos.length,
                current: 0,
                time: '0s'
            });
            let startTime = new Date().getTime();

            for (const photo of photos) {

                try {
                    const i = photos.indexOf(photo) + 1;

                    const request = sendPhotoApi({
                        photo: photo,
                        id_cal: id,
                        uuid_upload: new_uuid_upload ? new_uuid_upload : clientPhotoDetail.uuid_upload,
                        apiUrl, upload_cat: uploadCat?.attributes?.id_cat,
                        uuid: commonData.uuID,
                        uuid_sign: commonData.uuIDSign,
                        image_nr: i,
                        images_total: photos.length
                    }, thumb_width);

                    const result = await request;

                    dispatch.common.changeUploadData({
                        show: true,
                        progress: Math.round(((i) / (photos.length)) * 100),
                        total: photos.length,
                        current: i,
                        time: ((new Date().getTime() - startTime) / 1000).toFixed(2) + 's'
                    });

                    startTime = new Date().getTime();

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
                    message:'Fotos erfolgreich gesendet' ,
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

    const showModal = (file: File) => {
        sePicForModal(file);
        seOpenPicModal(true);
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
                {photos && photos?.length && <>
                  {photos.map((pic, i) =>
                    <div key={i} className={css.pic}>
                        <div className={css.picBox}>
                            <div style={{backgroundImage: `url(${URL.createObjectURL(pic)})`}} className={css.img} />
                        </div>

                        <div className={css.close} onClick={() => removePhoto(i)}>
                            <img src="/img/icon/close-small.svg" alt="close"/>
                        </div>
                        <div className={css.press} onClick={() => showModal(pic)}/>
                    </div>)}
                </>
                }

                <div className={cn('ion-activatable', css.addBtn)} onClick={
                    () => {
                        type === 'camera' ? emitPhotoCameraChange() : emitPhotoChange();
                    }}>
                    <img src="/img/icon/plus.svg" alt="plus"/>
                    <IonRippleEffect className="myDarkRipple" />
                </div>
            </div>

            <IonModal className="myModal picModal" isOpen={openPicModal} onIonModalDidDismiss={() => seOpenPicModal(false)}>
                <div className={css.picForModal}>
                    {picForModal && <img src={URL.createObjectURL(picForModal)} alt="picFormModal"
                                         onClick={() => seOpenPicModal(false)}
                                         className={css.picPic}/>}
                </div>
            </IonModal>
        </div>
    );
};

export default EditPhotos;
