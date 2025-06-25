import {FC, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import { IonSelect, IonSelectOption} from "@ionic/react";
import {getUserIDSelector, getUsersListSelector} from "../../../store/common/selector";

import css from './user-select.module.scss';
import cn from "classnames";
import {htmlDecode} from "../../../hooks/text-decode";
import {RootDispatch} from "../../../store";

const UserSelect: FC<{cancelEmit: () => void}> = ({cancelEmit}) => {
    const currentUserID = useSelector(getUserIDSelector);
    const usersList = useSelector(getUsersListSelector);
    const select = useRef<HTMLIonSelectElement>(null);
    const dispatch = useDispatch<RootDispatch>();

    useEffect(() => {
        setTimeout(() => {
            select.current && select.current.open()
        }, 0)
    }, [])

    const onSelect = (e: any) => {
        dispatch.common.changeUserID(Number(e.detail.value));
        dispatch.detail.setDefault();
        cancelEmit()
    }

    return (
        <IonSelect className={cn('mySelect', css.select)} placeholder="Bitte wählen" interface="action-sheet"
                   onIonChange={onSelect} value={String(currentUserID)} ref={select}
                   cancelText='Abbrechen' onIonCancel={() => cancelEmit()}

        >
            <IonSelectOption key={String(0)}
                             value={String(0)}>
                <p>Alle</p>
            </IonSelectOption>
            {usersList?.length && usersList.map((val: any) =>
                <IonSelectOption key={String(val.user_id)}
                                 value={val.user_id}>
                    <p>{htmlDecode(val.user_fn)}</p>
                </IonSelectOption>
            )}
        </IonSelect>
    );
};

export default UserSelect;
