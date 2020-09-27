import React from 'react';
import { useTranslation } from 'react-i18next';

export const NoStoreCredit = props => {
    const [t] = useTranslation();

    return <p>{t('Store Credit curently not available')}</p>;
};
