import { FC } from 'react';

import MainLayout from '../../layouts/main';
import WelcomeBlock from "../../components/blocks/welcome-block";

const WelcomeScreenPage: FC = () => {
    return (
        <MainLayout>
            <WelcomeBlock />
        </MainLayout>
    );
};

export default WelcomeScreenPage;