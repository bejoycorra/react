import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrencySymbol } from '../../../util/getCurrencySymbol';
import { setPriceZeroes } from '../../../util/setPriceZeroes';

export const OrderedTotals = props => {
    const { itemData } = props;
    const [t] = useTranslation();

    const getPriceWithCurrency = (value, currency) => {
        return getCurrencySymbol(currency) + setPriceZeroes(value);
    };

    return (
        <tfoot>
            <tr className="subtotal">
                <th colSpan="4" className="mark" scope="row">
                    {t('Subtotal')}
                </th>
                <td className="amount" data-th="Subtotal">
                    <span className="price">
                        {getPriceWithCurrency(
                            itemData.subtotal.value,
                            itemData.subtotal.currency
                        )}
                    </span>
                </td>
            </tr>
            {itemData.discount_amount.value !== 0 && (
                <tr className="discount">
                    <th colSpan="4" className="mark" scope="row">
                        {t('Discount')}
                    </th>
                    <td className="amount" data-th="Discount">
                        <span className="price">
                            -
                            {getPriceWithCurrency(
                                String(itemData.discount_amount.value).replace(
                                    '-',
                                    ''
                                ),
                                itemData.discount_amount.currency
                            )}
                        </span>
                    </td>
                </tr>
            )}
            {itemData.tax_amount.value !== 0 && (
                <tr className="tax-amount">
                    <th colSpan="4" className="mark" scope="row">
                        {t('Tax')}
                    </th>
                    <td className="amount" data-th="Tax">
                        <span className="price">
                            {getPriceWithCurrency(
                                itemData.tax_amount.value,
                                itemData.tax_amount.currency
                            )}
                        </span>
                    </td>
                </tr>
            )}
            <tr className="shipping">
                <th colSpan="4" className="mark" scope="row">
                    {t('Shipping & Handling')}
                </th>
                <td className="amount" data-th="Shipping & Handling">
                    <span className="price">
                        {getPriceWithCurrency(
                            itemData.shipping_amount.value,
                            itemData.shipping_amount.currency
                        )}
                    </span>
                </td>
            </tr>
            {itemData.customer_balance_amount.value && (
                <tr className="tax-amount">
                    <th colSpan="4" className="mark" scope="row">
                        {t('Store Credit')}
                    </th>
                    <td className="amount" data-th="Tax">
                        <span className="price">
                            -
                            {getPriceWithCurrency(
                                String(
                                    itemData.customer_balance_amount.value
                                ).replace('-', ''),
                                itemData.customer_balance_amount.currency
                            )}
                        </span>
                    </td>
                </tr>
            )}
            {itemData.gift_cards && (
                <Fragment>
                    {itemData.gift_cards.map((giftCard, key) => (
                        <tr className="tax-amount">
                            <th colSpan="4" className="mark" scope="row">
                                {t(`Gift Card (${giftCard.code})`)}
                            </th>
                            <td className="amount" data-th="Tax">
                                <span className="price">
                                    -
                                    {getPriceWithCurrency(
                                        String(giftCard.amount.value).replace(
                                            '-',
                                            ''
                                        ),
                                        giftCard.amount.currency
                                    )}
                                </span>
                            </td>
                        </tr>
                    ))}
                </Fragment>
            )}
            <tr className="grand_total">
                <th colSpan="4" className="mark" scope="row">
                    <strong>{t('Grand Total')}</strong>
                </th>
                <td className="amount" data-th="Grand Total">
                    <strong>
                        <span className="price">
                            {getPriceWithCurrency(
                                itemData.grand_total.value,
                                itemData.grand_total.currency
                            )}
                        </span>
                    </strong>
                </td>
            </tr>
        </tfoot>
    );
};
