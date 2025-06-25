import { FC } from 'react';
import {useSelector} from "react-redux";
import {getLoadingBlockSelector} from "../../store/common/selector";

import css from './loading.module.scss';

const Loading: FC = () => {
    const showLoading = useSelector(getLoadingBlockSelector);

    return (
        <>
            {showLoading && <div className={css.wrap}>
                <div className={css.ldsSpinner}>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                </div>

                <p>
                    Laden
                </p>
            </div>}
        </>
    );
};

export default Loading;
