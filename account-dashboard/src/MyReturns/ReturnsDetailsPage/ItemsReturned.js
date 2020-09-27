import React, { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ItemsReturned = props => {
    const { itemData, returnItemsTitle } = props;
    const [t] = useTranslation();
    const { items } = itemData;
    debugger
    const getReturnItems = useMemo(
        () =>
            items.map((item, key) => (
                <tr key={key}>
                    <td className="col name" data-th="Product Name">
                        <strong className="product name product-item-name">
                            {item.name}
                        </strong>
                        {item.item_options &&
                        item.item_options.map(
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
                    <td className="col condition" data-th="condition">
                        {item.condition}
                    </td>
                    <td className="col resolution" data-th="resolution">
                        {item.resolution}
                    </td>
                    <td className="col qty" data-th="Request Qty">

                        {item.request_qty !== 0 && (

                            <span className="content">
                                        {item.request_qty}
                                    </span>
                        )}
                    </td>
                    <td className="col qty" data-th="Qty">

                        {item.qty !== 0 && (

                            <span className="content">
                                        {item.qty}
                                    </span>
                        )}
                    </td>
                    <td className="col status" data-th="status">
                        {item.status}
                    </td>
                </tr>
            )),
        [items]
    );

    return (
        <div className="returned-items-container">
            <div>{t(returnItemsTitle)}</div>
            <table className="returned-items">
                <thead>
                <tr>
                    <th className="col name">{t('Product Name')}</th>
                    <th className="col sku">{t('SKU')}</th>
                    <th className="col condition">{t('Condition')}</th>
                    <th className="col resolution">{t('Resolution')}</th>
                    <th className="col qty">{t('Request Qty')}</th>
                    <th className="col qty">{t('Qty')}</th>
                    <th className="col status">{t('Status')}</th>
                </tr>
                </thead>
                <tbody>{items && getReturnItems}</tbody>
            </table>
        </div>
    );
};
