import React, { Fragment, useMemo, useCallback } from 'react';
import { oneOf, array, object } from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dateFormat from 'dateformat';
import { getCurrencySymbol } from '../../util/getCurrencySymbol';
import { Button } from 'react-bootstrap';

export const ReturnItems = props => {
    const {
        items
    } = props;
    const [t] = useTranslation();
    const history = useHistory();

    const handleReturnRoutes = useCallback(
        id => {
            if (history) history.push(`/my-account/returns/view/${id}`);
        },
        [items]
    );

    const ReturnItems = useMemo(
        () =>
            items &&
            items.map(item => (
                <tr key={item.id}>
                    <td data-th="Return #" scope="row">
                        {item.increment_id}
                    </td>
                    <td data-th="Date">
                        {dateFormat(
                            new Date(item.date_requested.replace(/-/g, '/')),
                            'm/d/yy'
                        )}
                    </td>
                    <td data-th="Ship From">
                        <span className="ship-from">
                            {item.ship_from}
                        </span>
                    </td>
                    <td data-th="Status">{item.status}</td>
                    <td data-th="Action" className={'table-actions'}>
                        <Button
                            size="lg"
                            variant="link"
                            className="view-return-link primary-link"
                            onClick={() => handleReturnRoutes(item.id)}
                        >
                            <span>{t('View Return')}</span>
                        </Button>
                    </td>
                </tr>
            )),
        [items]
    );

    return <Fragment>{ReturnItems}</Fragment>;
};

ReturnItems.proptypes = {
    items: oneOf([object, array])
};
