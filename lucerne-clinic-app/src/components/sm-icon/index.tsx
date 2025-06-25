import { FC } from 'react';

import css from './sm-icon.module.scss';

const SmICon: FC<{iconId: string}> = ({iconId}) => {
    return (
        <>
            {iconId &&
                <div className={css.box}>
                    <img src={`/img/eps/camera_${iconId}.svg`} alt="eps" className={css.icon}/>
                </div>
            }
        </>
    );
};

export default SmICon;
