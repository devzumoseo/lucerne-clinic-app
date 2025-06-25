import { IonContent, IonPage } from '@ionic/react';
import { FC, ReactNode } from 'react';

import css from './main.module.scss'

interface propsInterface {
  children: ReactNode;
}

const MainLayout: FC<propsInterface> = ({ children }) => {
  return (
    <IonPage>
        <IonContent className={css.content}>
            {children}
        </IonContent>
    </IonPage>
  );
};

export default MainLayout;
