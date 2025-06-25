import {FC, useEffect} from 'react';
import {useDispatch} from "react-redux";
import {RootDispatch} from "../../store";

const MainPreference: FC = () => {
    const dispatch = useDispatch<RootDispatch>();

    useEffect(() => {
        dispatch.common.toggleLoadingElement(false);
    }, [])
    return <></>;
};

export default MainPreference;
