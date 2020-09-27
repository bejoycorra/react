/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Reorder } from '../Reorder';
import { OrderItem } from './OrderItem';
import { Alert } from 'react-bootstrap';
import { AlertTriangle as Warning } from 'react-feather';
import './OrdersList.less';

export const OrdersList = props => {
    const {
        orderItems,
        css,
        className,
        warningIco,
        configProductAddToCartGraphql,
        simpleProductAddToCartGraphql
    } = { ...props };
    const [t] = useTranslation();

    return orderItems.length > 0 ? (
        <div className={'table-wrapper'}>
            <table
                className={`orders-list ${className || ''}`}
                cellSpacing="0"
                cellPadding="0"
                css={css}
            >
                <caption className="table-caption sr-only">
                    {t('Orders')}
                </caption>
                <thead>
                    <tr>
                        <th scope="col" className="col id">
                            {t('Order #')}
                        </th>
                        <th scope="col" className="col date">
                            {t('Date')}
                        </th>
                        <th scope="col" className="col date">
                            {t('Ship To')}
                        </th>
                        <th scope="col" className="col total">
                            {t('Order Total')}
                        </th>
                        <th scope="col" className="col status">
                            {t('Status')}
                        </th>
                        <th scope="col" className="col action">
                            {t('Action')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <OrderItem
                        items={orderItems}
                        configProductAddToCartGraphql={
                            configProductAddToCartGraphql
                        }
                        simpleProductAddToCartGraphql={
                            simpleProductAddToCartGraphql
                        }
                    />
                </tbody>
            </table>
        </div>
    ) : (
        <Alert variant={'warning'}>
            {warningIco}
            {t(` You have placed no orders.`)}
        </Alert>
    );
};
OrdersList.propTypes = {
    orderItems: PropTypes.array.isRequired,
    css: PropTypes.string
};

OrdersList.defaultProps = {
    warningIco: <Warning size={20} strokeWidth={'2'} color={'#c07600'} />
};
