import { FC } from 'react';

import MainLayout from '../../layouts/main';

import ConsultationsBlock from "../../components/blocks/consultations-block";
import Menu from "../../layouts/menu";

const ConsultationsPage: FC = () => {
    return (
        <MainLayout>
            <ConsultationsBlock />
            <Menu />
        </MainLayout>
    );
};

export default ConsultationsPage;