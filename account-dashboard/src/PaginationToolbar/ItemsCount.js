import React from 'react';
import { useTranslation } from 'react-i18next';

export const ItemsCount = props => {
    const [t] = useTranslation();
    const { pageSize, totalPages, currentPage, totalCount } = props.pageControl;
    const itemsStart = (currentPage - 1) * Number(pageSize) + 1;
    const itemEnd = Math.min(itemsStart + Number(pageSize) - 1, totalCount);

    return (
        <div className="items-count">
            <span>
                {t(`Items ${itemsStart} to ${itemEnd} of ${totalCount} total`)}
            </span>
        </div>
    );
};
