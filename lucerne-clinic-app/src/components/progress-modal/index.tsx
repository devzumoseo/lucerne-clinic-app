import {FC} from 'react';
import {buildStyles, CircularProgressbar} from "react-circular-progressbar";

import css from './progress-modal.module.scss';
import {useSelector} from "react-redux";
import {getUploadSelector} from "../../store/common/selector";

const ProgressModal: FC = () => {
    const data = useSelector(getUploadSelector);

    return (
        data?.show ? <>
            <div className={css.wrap}>
                <h3>
                    Hochladen
                    <div className={css.loader}>
                        <div className={css.dot} />
                        <div className={css.dot} />
                        <div className={css.dot} />
                    </div>
                </h3>

                <p className={css.line}>Gesamt: {data.total}</p>
                <p className={css.line}>Hochgeladen: {data.current}</p>
                <p className={css.line}>Antwortzeit: {data.time}</p>

                <div className={css.spin}>
                    <CircularProgressbar value={data.progress} text={`${data.progress}%`}
                                         styles={buildStyles({
                                             textSize: '18px',
                                             pathTransitionDuration: 0.5,
                                             pathColor: `#9D7754`,
                                             textColor: '#9D7754',
                                             trailColor: '#d6d6d6',
                                         })}
                    />
                </div>
            </div>
        </> : <></>
    );
};

export default ProgressModal;
