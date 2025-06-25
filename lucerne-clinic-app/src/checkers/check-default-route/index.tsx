import {FC, useEffect} from "react";
import {useSelector} from "react-redux";
import {getCommonSelector} from "../../store/common/selector";
import {useHistory} from "react-router";
import {getAddUuidUrl, getLoggedRedirectUrl} from "../../hooks/url-generator";
import {getMD5} from "../../api/common";

export const CheckDefaultRoute: FC = () => {
    const commonData = useSelector(getCommonSelector);
    const history = useHistory();

    useEffect(() => {
        if(commonData?.uuID && commonData?.uuIDSign && getMD5()) {
            history.push(getLoggedRedirectUrl());
        } else {
            history.push(getAddUuidUrl());
        }
    }, [])

    return <></>
}
