import { FC } from 'react';

import MainLayout from '../../layouts/main';
import QrScanForm from "../../components/forms/qr-scan-form";

const QrScanPage: FC = () => {
    return (
        <MainLayout>
            <QrScanForm />
        </MainLayout>
    );
};

export default QrScanPage;