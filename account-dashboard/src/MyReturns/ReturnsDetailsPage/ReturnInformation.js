import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import renderHTML from 'react-render-html';
import dateFormat from "dateformat";

export const ReturnInformation = props => {
    const [t] = useTranslation();
    const {
        entity_id,
        increment_id,
        status,
        order_increment_id,
        order_id,
        date_requested,
        return_address,
        customer_email,
        customer_custom_email,
    } = props.returnData;

    return (
        <div className="return-information">

            <div className="return-information__block">
                <div className="return-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Return Information')}
                    </h2>
                    <div className="order-information__sub-block">
                        <span> {t('ID') + ':'} {increment_id}  </span> <br />
                        <span> {t('Order ID') + ':'} {order_increment_id} </span> <br />
                        <span> {t('Date Requested') + ':'}
                        {dateFormat(
                        new Date(date_requested.replace(/-/g, '/')),
                        'm/d/yy'
                    )} </span> <br />
                        <span> {t('Email') + ':'} {customer_email} </span> <br />
                        {customer_custom_email && t('Contact Email Address') + ':'}
                        {customer_custom_email && (
                            <span> {customer_custom_email} </span>
                        )}
                    </div>
                </div>
                <div className="return-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Shipping Address')}
                    </h2>
                    <div className="order-information__sub-block">
                        {renderHTML(return_address)}
                    </div>
                </div>
            </div>
        </div>
    );
};
