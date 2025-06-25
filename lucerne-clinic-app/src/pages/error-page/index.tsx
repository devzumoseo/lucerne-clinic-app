import { FC } from 'react';

import MainLayout from '../../layouts/main';
import SomethingWrongBlock from "../../components/blocks/something-wrong-block";

const ErrorPage: FC = () => {
    return (
        <MainLayout>
            <SomethingWrongBlock />
        </MainLayout>
    );
};

export default ErrorPage;