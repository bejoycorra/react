import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@corratech/form-components';

export const DropDownLimit = props => {
    const { setPageSize, pageSize, setPage, ItemsToShow = [] } = props;
    const [t] = useTranslation();

    const handleChange = useCallback(
        value => {
            setPageSize(value);
            setPage(1);
        },
        [ItemsToShow, pageSize, setPage]
    );

    return (
        <div className="pagination-dropdown">
            <span className="pagination-dropdown-text">{t('Show')}</span>
            <Select
                items={ItemsToShow}
                field="region"
                id="region"
                onValueChange={handleChange}
            />
            <span className="pagination-dropdown-text">{t('per page')}</span>
        </div>
    );
};
