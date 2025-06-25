import {FC, useCallback, useEffect, useRef, useState} from 'react';
import css from './documents-popup.module.scss';
import {IonAlert, useIonAlert, useIonToast} from "@ionic/react";
import {downloadFileApi, uploadFileApi} from "../../../../api/upload";
import {useDispatch, useSelector} from "react-redux";
import {getConsultationDateSelector} from "../../../../store/common/selector";
import {RootDispatch} from "../../../../store";
import {getErrorUrl} from "../../../../hooks/url-generator";
import {useHistory} from "react-router";
import {b64toBlob, blobUrlToBase64, getBlobUrlFileSize} from "../../../../helpers/base-to-blob";
import PdfEditor from "./pdf-editor";
import { createRoot } from 'react-dom/client';

interface PropsInterface {
    emitCancel: () => void;
    list: Array<any> | undefined;
    uuid_sign: string;
    uuid: string;
    id_adr: string | null;
    id_cal: string;
}

function createDivAndRenderComponent(component: any) {
    console.log(1)
    const container = document.createElement('div');
    container.id = 'my_iframe_pdf';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(component);
}

let fileUuid = '';

const DocumentsPopup: FC<PropsInterface> = ({id_cal, emitCancel, list, uuid_sign, uuid, id_adr}) => {
    const [showPopup, setShowPopup] = useState(true);
    const consultationDate = useSelector(getConsultationDateSelector);
    const dispatch = useDispatch<RootDispatch>();
    const history = useHistory();
    const [present] = useIonToast();

    useEffect(() => {
        setShowPopup(true);
    }, []);

    useEffect(() => {
        const listen = async (e: any) => {
            console.log('Button clicked!', e.data);
            if(e.data?.type === 'close') {
                close();
            }
            if(e.data?.type === 'reload') {
                // reload();
                const iframe = document.getElementById('my_iframe');
                // @ts-ignore
                iframe && iframe?.contentWindow?.location?.reload();
            }
            if(e.data?.type === 'send') {
               send(e);
            }
        };

        // Add the event listener when the component mounts
        window.addEventListener('message', listen);

        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('message', listen);
        };

    }, []);
    

    const downloadPopup = async (name: string, dmls: string, akte: string) => {
        try {
            dispatch.common.setShowLoading(true);
            const base64 = await downloadFileApi({id_cal, id_adr, id_dmls: dmls, id_akte: akte,
                yd_cal: consultationDate? consultationDate : '', uuid_sign,
                uuid: uuid});

            let bbb = base64.value;
            const arr = String(base64.value).split('base64,');
            if(arr?.length === 2) {
                bbb = 'data:application/pdf;base64,' + arr[1];
            }
            const bb = await b64toBlob(bbb);

            if(bb) { createDivAndRenderComponent(<PdfEditor file={bb} />)}
        } catch (e) {
            dispatch.common.setShowLoading(false);
            emitCancel();
            history.push(getErrorUrl('Dokumentgenerierungsfehler, versuchen Sie es später erneut'));
        }

    }

    const close = () => {
        const element = document.getElementById('my_iframe_pdf');
        if (element) {
            setShowPopup(false);
            dispatch.common.setShowLoading(false);
            emitCancel();
            element.remove();
        }
    }

    const send = async (e: any) => {
        const size = await getBlobUrlFileSize(e.data.value);

        blobUrlToBase64(e.data.value).then(async (base64) => {
            dispatch.common.setShowLoading(true);

            await uploadFileApi({
                uuid: uuid,
                uuid_sign,
                file: String(base64),
                size: String(size),
                uuid_file: fileUuid
            });
            dispatch.common.setShowLoading(false);
            close();
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
        });
    }
    
    return (
        <div className={css.group}>
            <IonAlert
                isOpen={showPopup}
                header="ERP Dokumente: "
                cssClass="custom-alert myDocAlert"
                backdropDismiss={false}
                buttons={[{
                    text: 'Abbrechen',
                    cssClass: 'aalert-button-cancel',
                    handler: () => {
                        setShowPopup(false);
                        emitCancel();
                        dispatch.common.setShowLoading(false);
                    }
                }]}
                inputs={list?.map(el => {
                    return {
                        handler: () => {
                            fileUuid = el?.attributes?.id_akte;
                            setShowPopup(false);
                            downloadPopup(el?.attributes?.name, el?.attributes?.id_dms, el?.attributes?.id_akte);
                        },
                        label: el?.attributes?.name,
                        type: 'radio',
                        value: {id_dmls: el?.attributes?.id_dms, id_akte: el?.attributes?.id_akte},
                    }
                })}
            />
        </div>
    );
};

export default DocumentsPopup;
