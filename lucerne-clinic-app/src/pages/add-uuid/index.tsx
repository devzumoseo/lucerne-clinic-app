import { FC } from 'react';

import MainLayout from '../../layouts/main';

import UUIDForm from '../../components/forms/uuid-form';

const AddUUIDPage: FC = () => {
  return (
    <MainLayout>
      <UUIDForm />
    </MainLayout>
  );
};

export default AddUUIDPage;
