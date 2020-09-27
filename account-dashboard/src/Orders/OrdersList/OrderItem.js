import React, { Fragment, useMemo, useCallback } from 'react';
import { oneOf, array, object } from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dateFormat from 'dateformat';
import { getCurrencySymbol } from '../../util/getCurrencySymbol';
import { setPriceZeroes } from '../../util/setPriceZeroes';
import { Button } from 'react-bootstrap';
import { Reorder } from '../Reorder';
import { OrdersList } from './OrdersList';

export const OrderItem = props => {
    const {
        items,
        configProductAddToCartGraphql,
        simpleProductAddToCartGraphql
    } = props;
    const [t] = useTranslation();
    const history = useHistory();

    const handleOrderRoutes = useCallback(
        id => {
            if (history) history.push(`/my-account/orders/view/${id}`);
        },
        [items]
    );

    const OrderItems = useMemo(
        () =>
            items &&
            items.map(item => (
                <tr key={item.id}>
                    <td data-th="Order #" scope="row">
                        {item.increment_id}
                    </td>
                    <td data-th="Date">
                        {dateFormat(
                            new Date(item.created_at.replace(/-/g, '/')),
                            'm/d/yy'
                        )}
                    </td>
                    <td data-th="Ship To">
                        <span className="ship-to">
                            {item.ship_to ? (
                                <Fragment>
                                    {Array.isArray(item.ship_to) ? (
                                        <Fragment>
                                            {item.ship_to[0].name}
                                        </Fragment>
                                    ) : (
                                        <Fragment>{item.ship_to.name}</Fragment>
                                    )}
                                </Fragment>
                            ) : (
                                'N/A'
                            )}
                        </span>
                    </td>
                    <td data-th="Order Total">
                        <span className="grand-total">
                            {getCurrencySymbol(item.grand_total.currency)}
                            {setPriceZeroes(item.grand_total.value)}
                        </span>
                    </td>
                    <td data-th="Status">{item.status}</td>
                    <td data-th="Action" className={'table-actions'}>
                        <Button
                            size="lg"
                            variant="link"
                            className="view-order-link primary-link"
                            onClick={() => handleOrderRoutes(item.id)}
                        >
                            <span>{t('View Order')}</span>
                        </Button>
                        <Reorder
                            item={item}
                            configProductAddToCartGraphql={
                                configProductAddToCartGraphql
                            }
                            simpleProductAddToCartGraphql={
                                simpleProductAddToCartGraphql
                            }
                        />
                    </td>
                </tr>
            )),
        [items]
    );

    return <Fragment>{OrderItems}</Fragment>;
};

OrderItem.proptypes = {
    items: oneOf([object, array])
};
