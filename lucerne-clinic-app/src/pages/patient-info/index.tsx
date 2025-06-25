import { FC } from 'react';

import MainLayout from '../../layouts/main';
import PatientInfoBlock from "../../components/blocks/patient-info-block";
import Menu from "../../layouts/menu";


const PatientInfoPage: FC = () => {
    return (
        <MainLayout>
            <PatientInfoBlock />
            <Menu />
        </MainLayout>
    );
};

export default PatientInfoPage;