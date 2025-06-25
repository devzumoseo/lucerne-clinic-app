import { FC } from 'react';

import MainLayout from '../../layouts/main';
import PasswordForm from "../../components/forms/password-form";

import css from './password-page.module.scss';

const PasswordPage: FC = () => {
    return (
        <div className={css.page}>
            <MainLayout>
                <PasswordForm />
            </MainLayout>
        </div>
    );
};

export default PasswordPage;
