import React, { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import { OrderedTotals } from './OrderedTotals';
import { getCurrencySymbol } from '../../../util/getCurrencySymbol';
import { setPriceZeroes } from '../../../util/setPriceZeroes';

export const ItemOrdered = props => {
    const { itemData } = props;
    const [t] = useTranslation();
    const { items } = itemData;

    const getPriceWithCurrency = (value, currency) => {
        return getCurrencySymbol(currency) + setPriceZeroes(value);
    };

    const getOrderItems = useMemo(
        () =>
            items.map((item, key) => (
                <tr key={key}>
                    <td className="col name" data-th="Product Name">
                        <strong className="product name product-item-name">
                            {item.title}
                        </strong>
                        {item.product_options[0].config_options &&
                            item.product_options[0].config_options.map(
                                (productOption, key) => (
                                    <dl className="item-options" key={key}>
                                        <dt>
                                            <b>{productOption.label}</b>
                                        </dt>
                                        <dd>{productOption.value}</dd>
                                    </dl>
                                )
                            )}
                    </td>
                    <td className="col sku" data-th="SKU">
                        {item.sku}
                    </td>
                    <td className="col price" data-th="Price">
                        <span className="cart-price">
                            <span className="price">
                                {getPriceWithCurrency(
                                    item.price.value,
                                    item.price.currency
                                )}
                            </span>
                        </span>
                    </td>
                    <td className="col qty" data-th="Qty">
                        <ul className="items-qty">
                            {item.qty_ordered !== 0 && (
                                <li className="item">
                                    <span className="title">
                                        {t('Ordered')}:
                                    </span>
                                    <span className="content">
                                        {item.qty_ordered}
                                    </span>
                                </li>
                            )}
                            {item.qty_shipped !== 0 && (
                                <li className="item">
                                    <span className="title">
                                        {t('Shipped')}:
                                    </span>
                                    <span className="content">
                                        {item.qty_shipped}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </td>
                    <td className="col subtotal" data-th="Subtotal">
                        <span
                            className="price-excluding-tax"
                            data-label="Excl. Tax"
                        >
                            <span className="cart-price">
                                <span className="price">
                                    {getPriceWithCurrency(
                                        item.row_total.value,
                                        item.row_total.currency
                                    )}
                                </span>{' '}
                            </span>
                        </span>
                    </td>
                </tr>
            )),
        [items]
    );

    return (
        <div className="orderd-items-container">
            <table className="ordered-items">
                <thead>
                    <tr>
                        <th className="col name">{t('Product Name')}</th>
                        <th className="col sku">{t('SKU')}</th>
                        <th className="col price">{t('Price')}</th>
                        <th className="col qty">{t('Qty')}</th>
                        <th className="col subtotal">{t('Subtotal')}</th>
                    </tr>
                </thead>
                <tbody>{items && getOrderItems}</tbody>
                <OrderedTotals itemData={itemData} />
            </table>
        </div>
    );
};
