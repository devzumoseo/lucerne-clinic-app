import { FC } from 'react';

import MainLayout from '../../layouts/main';
import Menu from "../../layouts/menu";
import SettingsBlock from "../../components/blocks/settings-block";

const SettingsPage: FC = () => {
    return (
        <MainLayout>
            <SettingsBlock />
            <Menu />
        </MainLayout>
    );
};

export default SettingsPage;