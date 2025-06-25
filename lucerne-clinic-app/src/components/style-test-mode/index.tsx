import {FC, useEffect} from "react";
import {useSelector} from "react-redux";
import {getIsTestModeSelector} from "../../store/common/selector";

export const StyleTestMode: FC = () => {
    const isTestMode = useSelector(getIsTestModeSelector);

    useEffect(() => {
        const body = document.querySelector('body');

        if(body) {
            isTestMode ? body.classList.add('test-mode') :
                body.classList.remove('test-mode')
        }
    }, [isTestMode])

    return <></>
}