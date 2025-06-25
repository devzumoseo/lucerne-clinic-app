import {FC, useCallback, useEffect, useRef, useState} from 'react';
import cn from "classnames";
import {IonButton, IonRippleEffect, IonSelect, IonSelectOption, IonSpinner, useIonViewDidEnter} from "@ionic/react";
import {useHistory} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import moment from "moment/moment";
import Countdown from "react-countdown";
import {useParams} from "react-router-dom";
import {getErrorUrl} from "../../../hooks/url-generator";
import {getConsultationDetailApi} from "../../../api/consultation-detail";
import {
    getCommonSelector,
    getIsTestModeSelector,
    getQrIDSelector,
    getSessionTimeoutSelector
} from "../../../store/common/selector";
import {RootDispatch} from "../../../store";
import {
    getClientFileDetailSelector,
    getClientPhotoDetailSelector,
    getPatientDetailsSelector
} from "../../../store/detail/selector";
import EditPhotos from "./edit-photos";
import EditFiles from "./edit-files";
import {isExtensionWrong, isFileSizeWrong} from "../../../hooks/file-extension";
import {htmlDecode} from "../../../hooks/text-decode";
import {isErrorResponse} from "../../../hooks/is-error-respocse";
import {b64toBlob, startDocumentScanHook} from "../../../hooks/document-scanner";
import SmICon from "../../sm-icon";
import {takePhotoFromCamera} from "../../../hooks/take-photo";
import DocumentsPopup from "./documents-popup";
import AdvancedImagePicker from "cordova-plugin-advanced-imagepicker";
import {makeId} from "../../../hooks/make-id";
import EditScanAsPhotos from "./edit-scan-as-photos";

import css from './patient-info-block.module.scss';
import ProgressModal from "../../progress-modal";
import SurveyPopup from "./survey-popup";

function millisToMinutesAndSeconds(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
}

function groupBy(list: any, keyGetter: any) {
    const map = new Map();
    list.forEach((item: any) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

const PatientInfoBlock: FC = () => {
    const history = useHistory();
    const commonData = useSelector(getCommonSelector);
    const [loading, setLoading] = useState(false);
    const [showDocumentsPopup, setShowDocumentsPopup] = useState(false);
    const [showSurveyPopup, setShowSurveyPopup] = useState(false);
    const [isDocumentScan, setIsDocumentScan] = useState(false);
    const [showDom, setShowDom] = useState(true);
    const [type, setType] = useState<'camera' | 'files'>('camera');
    const { id }: any = useParams();
    const dispatch = useDispatch<RootDispatch>();
    const clientPhotoDetail = useSelector((state: never) => getClientPhotoDetailSelector(state, id));
    const clientFilesDetail = useSelector((state: never) => getClientFileDetailSelector(state, id));
    const patientDetail: any = useSelector((state: never) => getPatientDetailsSelector(state, id));
    const qrID = useSelector(getQrIDSelector);
    const isTestMode = useSelector(getIsTestModeSelector);
    const timeoutSelector = useSelector(getSessionTimeoutSelector);

    const [imgFileEx, setImgFilesEx] = useState('image/*');
    const [imgFileSize, setImgFileSize] = useState(10000000);

    const [photos, setPhotos] = useState<null | Array<File>>(null);
    const [photosScan, setPhotosScan] = useState<null | Array<{id_typ: string, list: Array<File>}>>(null);

    const filesRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<null | Array<File>>(null);
    const [filesEx, setFilesEx] = useState('*');
    const [fileSize, setFileSize] = useState(10000000);

    const [uploadCat, seUploadCat] = useState<null | any>(null);
    const [types, setTypes] = useState<null | Array<any>>(null);
    const [hasError, setHasError] = useState(false);


    useIonViewDidEnter(() => {
        defaultData();
    })

    useIonViewDidEnter(async() => {
        setHasError(false);
        seUploadCat(null);
        setShowDocumentsPopup(false);
        clearFiles();

        if(timeoutSelector && Number.isInteger(timeoutSelector)) {
            dispatch.common.changeSessionTimeout({time: timeoutSelector, time_from: new Date()})
        }
    })

    const defaultData = () => {
        // setLoading(false)
        // setShowDocumentsPopup(false)
        // setShowSurveyPopup(false)
        // setIsDocumentScan(false)
        // setShowDom(false)
        // setType('camera')
        // setImgFilesEx('image/*')
        // setPhotos(null)
        // setPhotosScan(null)
        // setFiles(null)
        // setFilesEx('*')
        // setFileSize(10000000)
        // seUploadCat(null)
        // setTypes(null)
        // setHasError(false)
        dispatch.common.changeUploadData({
            show: false,
            progress: 0,
            total: 0,
            current: 0,
            time: '0s'
        })
    }

    useEffect(() => {
        if(clientFilesDetail?.list && clientPhotoDetail?.list) {
            const file_types = clientFilesDetail.list.map((val: any) => {
                return {...val, type: 'file'};
            });
            const img_types = clientPhotoDetail.list.map((val: any) => {
                return {...val, type: 'img'};
            });

            const grouped: any = groupBy([...file_types, ...img_types], (val: any) => val.attributes.name);

            setTypes(Array.from(grouped, ([key, value]) => ({ key, value })));
        }
    }, [clientFilesDetail])

    const checkValid = useCallback(() => {

        if(photos) {
            checkExp(photos, imgFileEx);
            checkSize(photos, imgFileSize);
        }

        if(files) {
            checkExp(files, filesEx);
            checkSize(files, fileSize);
        }

        if(photosScan?.length) {
            const list = photosScan.map(el => el.list).flat();
            checkSize(list, imgFileSize);
        }
    }, [ photos,photosScan , imgFileEx, imgFileSize, files, fileSize, filesEx])

    useEffect(() => {
        checkValid()
    }, [photos, files])

    // counter refresh
    useEffect(() => {
        reload();
    }, [patientDetail?.data?.attributes?.refresh?.time_from])

    const reload = () => {
        setShowDom(false);
        setTimeout(() => setShowDom(true))
    }

    useEffect(() => {
        if(clientPhotoDetail?.file_ext) {
            const parsed = clientPhotoDetail.file_ext.split(',').map((el: string) => '.' + el).join(', ');
            parsed && setImgFilesEx(parsed);
        }

        if(clientFilesDetail?.file_ext) {
            const parsed = clientFilesDetail.file_ext.split(',').map((el: string) => '.' + el).join(', ');

            parsed && setFilesEx(parsed);
        }

        if(clientPhotoDetail?.file_max_size) {
            setImgFileSize(Number(clientPhotoDetail.file_max_size));
        }

        if(clientFilesDetail?.file_max_size) {
            setFileSize(Number(clientFilesDetail.file_max_size));
        }
    }, [clientPhotoDetail, clientFilesDetail])

    const checkExp = (files: Array<File>, exp: string) => {
        const wrongExp = isExtensionWrong(exp, files)

        if(wrongExp) {
            history.push(getErrorUrl(`${wrongExp} nicht zugelassenes Dateiformat. Bitte verwenden Sie: ${exp} files`))
            clearFiles();
        }
    }

    const checkSize = (files: Array<File>, maxSize: number) => {
        const wrongSize = isFileSizeWrong(maxSize, files);

        if(wrongSize) {
            history.push(getErrorUrl(`Ihre Dateigrösse ist ${(wrongSize/1024).toFixed(2)}kb . Maximale Dateigrösse ist ${(maxSize/1024).toFixed(2)}kb`))
            clearFiles();
        }
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
                setLoading(false);
                return;
            }

            // qr version check
            if(detail?.qr && qrID) {
                if(detail?.qr > qrID) {
                    history.push(getErrorUrl('Dieser Account wurde zurückgesetzt (QR-ID nicht aktuell)' ))
                    await dispatch.common.changeSessionTimeout({time: timeoutSelector ? timeoutSelector : 300, time_from: new Date()})
                    setLoading(false);
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
            } else {
                history.push(getErrorUrl())
            }
        } else {
            history.push(getErrorUrl())
        }
    }

    const dataGeneration = useCallback(async () => {
        setLoading(true);
        const refresh_data = patientDetail?.data?.attributes?.timeout;
        let need_refresh = true;

        if(refresh_data?.time_from instanceof Date) {
            const time = refresh_data.time_from.getTime() + (Number(refresh_data.timer) * 1000);

            need_refresh = time < new Date().getTime();
        }

        if(patientDetail?.id && !need_refresh) {
            console.log('data loaded from store')
        } else {
            await dataLoading();
        }

        setLoading(false);
    }, [commonData.uuID, commonData.uuIDSign, id, patientDetail, qrID])

    useEffect(() => {
        if(id) {
            dataGeneration().then();
        }
    }, [commonData.uuID, commonData.uuIDSign, id])


    const typesCheck = () => {
        setHasError(!uploadCat);
        if(!uploadCat) {
            return;
        }
    }
    const onSelectFiles = (e: any) => {
        setHasError(!uploadCat);
        if(!uploadCat) {
            return;
        }

        if (!e.target.files || e.target.files.length === 0) { return; }

        setFiles(Array.from(e.target.files))
    }

    const onEditFiles = (e: any) => {
        if (!e.target.files || e.target.files.length === 0) { return; }

        if (files?.length && Array.from(e.target.files)?.length) {
            const arr: Array<any> = [...files, ...Array.from(e.target.files)]
            setFiles(arr)
        }
    }

    const clearFiles = () => {
        setPhotos(null);
        setPhotosScan(null);
        setFiles(null);
    }

    const clearAndBack = () => {
        clearFiles();
        history.goBack();
    }

    const startScanning = async (id_typ: string) => {
        setHasError(!uploadCat);
        if(!uploadCat) {
            return;
        }

        setIsDocumentScan(true);

        let result: any = [];

        try{
            result = await startDocumentScanHook();
        } catch (e) {
            history.push(getErrorUrl('keinen Zugriff hat, laden Sie bitte die App neu'));
        }

        if(photosScan?.length && result?.length) {
            const search = photosScan.find(el => el.id_typ === id_typ);

            if(search?.id_typ) {
                let arr: Array<any> = [...photosScan, {id_typ, list: [...search.list, ...result]}];
                // @ts-ignore
                arr = [...new Map(arr.map(item => [item.id_typ, item])).values()];
                setPhotosScan(arr)
            } else {
                let arr: Array<any> = [...photosScan, {id_typ, list: [...result]}];
                setPhotosScan(arr)
            }
        }

        if(!photosScan?.length && result?.length) {
            const arr: Array<any> = [{id_typ: id_typ, list: result}]
            setPhotosScan(arr)
        }
    }

    const getPhotos = async () => {
        setHasError(!uploadCat);
        if(!uploadCat) {
            return;
        }

        setIsDocumentScan(false);
        setType('files');
        try {
            AdvancedImagePicker.present({
                mediaType: 'IMAGE',
                showCameraTile: false,
                asBase64: true,
                asJpeg: true,
                max: 20
            }, (images) => {
                let result: File[] = [];

                if(images?.length) {
                    for(let img of images) {
                        const blob = b64toBlob(img?.src, 'image/jpg');
                        const file =  new File([blob], makeId(6) + '.jpg',{type: "image/jpg"});
                        result.push(file);
                    }
                }

                if(photos?.length && result?.length) {
                    const arr: Array<any> = [...photos, ...result]
                    setPhotos(arr)
                }

                if(!photos?.length && result?.length) {
                    const arr: Array<any> = [...result]
                    setPhotos(arr)
                }
                setLoading(false)
            },  (error) => {
                setLoading(false)
            });

        } catch (e) {
            setLoading(false);
            history.push(getErrorUrl(JSON.stringify(e)));
        }
    }


    const getPhoto = useCallback(async () => {
        setHasError(!uploadCat);
        if(!uploadCat) {
            return;
        }


        setType('camera');
        setIsDocumentScan(false);
        const result = await takePhotoFromCamera();

        if(!result?.size) { return; }

        const photos_arr = photos?.length ? photos : [];
        const arr: Array<any> = [...photos_arr, result];

        await setPhotos(arr);

    }, [photos, uploadCat])

    const prevPhotosLength = useRef(0);

    useEffect(() => {
        if(type === 'camera' && photos && photos?.length > prevPhotosLength.current) {
            getPhoto().then()
        }

        prevPhotosLength.current = photos?.length ? photos.length : 0;
    }, [type, photos])

    const changeUploadCat = (e: any) => {
        seUploadCat(e.detail.value);

        setTimeout(() => {
            setHasError(false);
        })
    }

    const checkSelectedTyp = useCallback((typ: 'file' | 'img') => {
        return !uploadCat?.value?.find((el: any) => el?.type === typ);
    }, [uploadCat]);

    const filterTyp = useCallback((arr: Array<any> | null, typ: 'file' | 'img') => {
        const el = types?.filter((el: any) => !!el?.value.find((e: any) => e?.type === typ));

        return el?.length ? el : [];
    }, [types]);

    return (
        <div className={cn(css.wrap, 'patient-page')}>
            <div className={css.titleGroup}>
                <h1>{(!loading && patientDetail?.data?.attributes?.title) ?
                    <>
                        {htmlDecode(patientDetail?.data?.attributes?.title)}
                        <div className={css.photoType}><SmICon iconId={patientDetail?.data?.attributes?.id_sm ? patientDetail?.data?.attributes?.id_sm : ''} /></div>
                    </> :
                    <IonSpinner name="dots" className='center-mrg' /> }</h1>
            </div>

            {
                !loading &&
                    <>
                        {patientDetail?.data?.attributes?.dt_cal && <div className={css.date}>
                            <img src="/img/icon/calendar.svg" alt="calendar"/>
                            <p>{moment(patientDetail?.data?.attributes?.dt_cal).format('l HH:mm')}</p>
                        </div>}
                        <p className={css.text}>{patientDetail?.data?.attributes?.notes &&
                            htmlDecode(patientDetail?.data?.attributes?.notes)}</p>

                        <div className={cn(css.time, !isTestMode && css.hideTime)}>Verbleibende Zeit:
                            <>{
                                patientDetail?.data?.attributes?.refresh?.time_from instanceof Date &&
                                patientDetail?.data?.attributes?.refresh?.timer &&
                                showDom ?
                                    <Countdown date={patientDetail?.data?.attributes?.refresh?.time_from?.getTime() +
                                        (Number(patientDetail?.data?.attributes?.refresh?.timer) * 1000)}
                                               renderer={props => <div>{millisToMinutesAndSeconds(props.total)}</div>}
                                    />
                                :
                                    <div>Zeit fehlt</div>}</>
                        </div>

                        <div className={cn((photos?.length || files?.length || photosScan?.length) && css.hide, css.btnGroup)}>

                            <IonButton className={cn('myButton', css.button, css.upload)} color="secondary"
                                       onClick={() => setShowDocumentsPopup(true)}
                                disabled={!patientDetail?.data?.attributes?.cal_erp?.list?.length}
                            >
                                <img src="/img/icon/upload-file.svg" alt="scan"/>
                                <span>ERP Dokumente</span>
                                <IonRippleEffect className="myDarkRipple"/>
                            </IonButton>

                            <IonButton className={cn('myButton', css.button, css.upload)} color="secondary"
                                       onClick={() => setShowSurveyPopup(true)}
                                       disabled={!patientDetail?.data?.attributes?.cal_survey?.list?.length}
                            >
                                <img src="/img/icon/link-alt-svgrepo-com.svg" alt="scan"/>
                                <span>Patientenaufnahme</span>
                                <IonRippleEffect className="myDarkRipple"/>
                            </IonButton>

                            <IonButton className={cn('myButton', css.button, css.scan)} color="secondary" onClick={() => startScanning(makeId(6))}
                                disabled={(checkSelectedTyp('file') && uploadCat) || hasError}
                            >
                                <img src="/img/icon/scan-icon.svg" alt="scan"/>
                                <span>Dokument scannen</span>
                                <IonRippleEffect className="myDarkRipple"/>
                            </IonButton>

                            <IonButton className={cn('myButton', css.button)} color="secondary"
                                       disabled={(checkSelectedTyp('file') && uploadCat) || hasError}>
                                <img src="/img/icon/file.svg" alt="file"/>
                                <span>Dokument hochladen</span>
                                <IonRippleEffect className="myDarkRipple"/>
                                <input type="file" className={css.btnInput} multiple={true}
                                       accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf"
                                       onChange={onSelectFiles} onClick={(e: any) => {e.target.value = null}} />
                                <input type="file" className={css.btnInput} multiple={true} style={{zIndex: -99}}
                                       accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf"
                                       onChange={onEditFiles} onClick={(e: any) => e.target.value = null} ref={filesRef}
                                />
                                {!uploadCat && <div className={css.typeWrap} onClick={typesCheck} />}
                            </IonButton>

                            <IonButton className={cn('myButton', css.button)} color="secondary" onClick={getPhotos}
                                       disabled={(checkSelectedTyp('img') && uploadCat) || hasError}>
                                <img src="/img/icon/gallery.svg" alt="gallery"/>
                                <span>Bild von Galerie hochladen</span>
                                <IonRippleEffect className="myDarkRipple"/>
                            </IonButton>

                            <IonButton className={cn('myButton', css.button, css.last)} color="secondary" onClick={getPhoto}
                                       disabled={(checkSelectedTyp('img') && uploadCat) || hasError}>
                                <img src="/img/icon/camera.svg" alt="camera"/>
                                <span>Foto machen</span>
                                <IonRippleEffect className="myDarkRipple"/>
                            </IonButton>

                        </div>

                        {
                            (!photos?.length && !files?.length && !photosScan?.length) ?
                            <>
                                <p className={cn(css.selectTitle, hasError && css.etext)}>Typ:</p>
                                <IonSelect className={cn('mySelect', css.select,hasError && 'hasError')} placeholder="Bitte wählen" interface="action-sheet"
                                           onIonChange={changeUploadCat} value={uploadCat}
                                           cancelText='Abbrechen' selectedText={uploadCat?.key}
                                >
                                    {types?.map((val: any) =>
                                        <IonSelectOption key={val?.key}
                                                         value={val}>{htmlDecode(val.key)}</IonSelectOption>
                                    )}
                                </IonSelect>

                            </> : ''
                        }

                        {
                            (files?.length) ?
                            <>
                                <p className={cn(css.selectTitle, hasError && css.etext)}>Typ:</p>
                                <IonSelect className={cn('mySelect', css.select,hasError && 'hasError')} placeholder="Bitte wählen" interface="action-sheet"
                                           onIonChange={changeUploadCat} value={uploadCat}
                                           cancelText='Abbrechen'
                                >
                                    {filterTyp(types, 'file')?.map((val: any) =>
                                        <IonSelectOption key={val?.key}
                                                         value={val}>{htmlDecode(val.key)}</IonSelectOption>
                                    )}
                                </IonSelect>

                            </> : ''
                        }

                        {
                            (photos?.length || photosScan?.length) ?
                            <>
                                <p className={cn(css.selectTitle, hasError && css.etext)}>Typ:</p>
                                {
                                    uploadCat?.value[0]?.type === 'file' ?
                                        <IonSelect className={cn('mySelect', css.select,hasError && 'hasError')} placeholder="Bitte wählen" interface="action-sheet"
                                               onIonChange={changeUploadCat} value={uploadCat}
                                               cancelText='Abbrechen'
                                        >
                                            {filterTyp(types, 'file')?.map((val: any) =>
                                                <IonSelectOption key={val?.key}
                                                                 value={val}>{htmlDecode(val.key)}</IonSelectOption>)}
                                        </IonSelect>
                                        :
                                        <IonSelect className={cn('mySelect', css.select,hasError && 'hasError')} placeholder="Bitte wählen" interface="action-sheet"
                                                   onIonChange={changeUploadCat} value={uploadCat}
                                                   cancelText='Abbrechen'
                                        >
                                            {filterTyp(types, 'img')?.map((val: any) =>
                                                <IonSelectOption key={val?.key}
                                                                 value={val}>{htmlDecode(val.key)}</IonSelectOption>)}
                                        </IonSelect>
                                }

                            </> : ''
                        }

                        {photos?.length ?
                            <EditPhotos files={photos} emitCancel={clearFiles} type={type}
                                        emitBack={clearAndBack} onPhotoRemove={setPhotos}
                                        emitPhotoChange={getPhotos}
                                        emitPhotoCameraChange={getPhoto} uploadCat={uploadCat}
                            />
                            : ''}

                        {photosScan?.length ?
                            <EditScanAsPhotos onDocumentScanEmit={startScanning}
                                                                files={photosScan} emitCancel={clearFiles}
                                                                emitBack={clearAndBack} onPhotoRemove={setPhotosScan}
                                                                uploadCat={uploadCat}
                            />
                            : ''}

                            {files?.length ? <EditFiles filesProp={files} emitCancel={clearFiles}
                                             emitBack={clearAndBack} onFileRemove={setFiles}
                                             emitFileChange={() => filesRef?.current?.click()}
                                                    uploadCat={uploadCat}
                        />: ''}
                    </>
            }

            {
                showDocumentsPopup ?
                    <DocumentsPopup id_cal={id} id_adr={patientDetail?.data?.attributes?.id_adr} uuid_sign={commonData.uuIDSign} uuid={commonData.uuID}
                        list={patientDetail?.data?.attributes?.cal_erp?.list} emitCancel={() => setShowDocumentsPopup(false)}/>
                :''
            }

            {
                showSurveyPopup ?
                    <SurveyPopup id_cal={id} id_adr={patientDetail?.data?.attributes?.id_adr} uuid_sign={commonData.uuIDSign} uuid={commonData.uuID}
                                    list={patientDetail?.data?.attributes?.cal_survey?.list} emitCancel={() => setShowSurveyPopup(false)}/>
                    :''
            }

            <ProgressModal />
        </div>
    );
};

export default PatientInfoBlock;
