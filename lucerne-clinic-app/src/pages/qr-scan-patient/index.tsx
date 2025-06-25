import { FC } from 'react';

import MainLayout from '../../layouts/main';
import QrScanPatientForm from "../../components/forms/qr-scan-patient-form";

const QrScanPatientPage: FC = () => {
    return (
        <MainLayout>
            <QrScanPatientForm />
        </MainLayout>
    );
};

export default QrScanPatientPage;