import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { OrderAddress } from './OrderAddress';

export const OrderInformation = props => {
    const [t] = useTranslation();
    const {
        shipping,
        billing,
        shipping_description,
        payment
    } = props.orderData;

    return (
        <div className="order-information">
            <h2 className="my-account__block-title">
                {t('Order Information')}
            </h2>
            <div className="order-information__block">
                <div className="order-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Shipping Address')}
                    </h2>
                    <OrderAddress
                        addresses={shipping}
                        countries={props.countries}
                    />
                </div>
                <div className="order-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Shipping Method')}
                    </h2>
                    <div className="order-information__sub-block">
                        {shipping_description}
                    </div>
                </div>
                <div className="order-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Billing Address')}
                    </h2>
                    <OrderAddress
                        addresses={billing}
                        countries={props.countries}
                    />
                </div>
                <div className="order-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Payment Method')}
                    </h2>
                    <div className="order-information__sub-block">
                        {payment &&
                            payment.map((value, key) => (
                                <Fragment key={key}>
                                    {value.payment_method_title}
                                    {value.cc_type && (
                                        <table className="credit-card-info">
                                            <tbody>
                                                <tr>
                                                    <th>
                                                        {t('Credit Card Type')}
                                                    </th>
                                                    <td>{value.cc_type}</td>
                                                </tr>
                                                <tr>
                                                    <th>
                                                        {t(
                                                            'Credit Card Number'
                                                        )}
                                                    </th>
                                                    <td>{`xxxx-${value.cc_number}`}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </Fragment>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
