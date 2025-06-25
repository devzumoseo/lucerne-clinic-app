import { FC } from 'react';

import css from './scanner.module.scss';

const ScannerPatient: FC = () => {

    return (
        <div className={css.content}>
            <div className={css.box}>
                <img src="/img/qr-example.png" alt="qr"/>
            </div>
        </div>
    );
};

export default ScannerPatient;
