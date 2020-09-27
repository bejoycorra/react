import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrencySymbol } from '../../../util/getCurrencySymbol';
import { setPriceZeroes } from '../../../util/setPriceZeroes';
import { OrderedTotals } from '../ItemOrdered/OrderedTotals';

export const Invoices = props => {
    const { invoice, key } = props;
    const [t] = useTranslation();

    const getPriceWithCurrency = (value, currency) => {
        return getCurrencySymbol(currency) + setPriceZeroes(value);
    };

    const getOrderItems = useMemo(
        () =>
            invoice.invoiced_items.map((item, key) => (
                <tr key={key}>
                    <td className="col name" data-th="Product Name">
                        <strong className="product name product-item-name">
                            {item.name}
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
                            {item.quantity_invoiced !== 0 && (
                                <li className="item">
                                    <span className="content">
                                        {item.quantity_invoiced}
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
        [invoice]
    );

    return (
        <div className="orderd-items-container" key={key}>
            <div className="orderd-item-head">
                <span>
                    <h3>{t(`Invoice #${invoice.number}`)}</h3>
                </span>
            </div>
            <table className="ordered-items">
                <thead>
                    <tr>
                        <th className="col name">{t('Product Name')}</th>
                        <th className="col sku">{t('SKU')}</th>
                        <th className="col price">{t('Price')}</th>
                        <th className="col qty">{t('Qty Invoiced')}</th>
                        <th className="col subtotal">{t('Subtotal')}</th>
                    </tr>
                </thead>
                <tbody>{invoice.invoiced_items && getOrderItems}</tbody>
                <OrderedTotals itemData={invoice} />
            </table>
        </div>
    );
};
