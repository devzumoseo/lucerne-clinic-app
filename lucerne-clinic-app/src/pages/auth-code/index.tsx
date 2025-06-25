import { FC } from 'react';

import MainLayout from '../../layouts/main';

import AuthCodeForm from "../../components/forms/auth-code-form";

const AuthCodePage: FC = () => {
  return (
    <MainLayout>
      <AuthCodeForm />
    </MainLayout>
  );
};

export default AuthCodePage;
