import {FC, useEffect, useState} from 'react';

import MainLayout from '../../layouts/main';
import {useIonViewDidEnter, useIonViewDidLeave} from "@ionic/react";
import {useSelector} from "react-redux";
import {getIsLoadingSelector} from "../../store/common/selector";
import {useHistory} from "react-router";
import {getConsultationsUrl} from "../../hooks/url-generator";

const HomePage: FC = () => {
    const isLoading = useSelector(getIsLoadingSelector);
    const [onPage, setOnPage] = useState(false);
    const history = useHistory();

    useIonViewDidEnter(() => {
        setOnPage(true);
    }, [isLoading]);

    useIonViewDidLeave(() => {
        setOnPage(false);
    })

    useEffect(() => {
        if(!isLoading && onPage) {
            history.push(getConsultationsUrl());
        }
    }, [onPage, isLoading]);

    return (
        <MainLayout>
            {/*<HomeBlock />*/}
            {/*<Menu />*/}
        </MainLayout>
    );
};

export default HomePage;
