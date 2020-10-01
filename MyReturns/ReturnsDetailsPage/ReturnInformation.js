import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
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

    const createMarkup = item => {
        return {__html: item};
    }
    return (
        <div className="return-information">​
            <div className="return-information__block">
                <div className="return-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Return Information')}
                    </h2>
                    <div className="order-information__sub-block">
                        <div className={'return-info-row'}>
                            <label>{t('ID') + ':'}</label>
                            {increment_id}
                        </div>
                        <div className={'return-info-row'}>
                            <label>{t('Order ID') + ':'}</label>
                            {order_increment_id}
                        </div>
                        <div className={'return-info-row'}>
                            <label>{t('Date Requested') + ':'}</label>
                            <span>
                                {dateFormat(
                                    new Date(date_requested.replace(/-/g, '/')),
                                    'm/d/yy'
                                )}
                            </span>
                        </div>
                        <div className={'return-info-row'}>
                            <label>{t('Email') + ':'} </label>
                            {customer_email}
                        </div>
                        <div className={'return-info-row'}>
                            <label>{customer_custom_email && t('Contact Email Address') + ':'}</label>
                            {customer_custom_email && (
                                <span> {customer_custom_email} </span>
                            )}
                        </div>

                    </div>
                </div>
                <div className="return-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Shipping Address')}
                    </h2>
                    <div className="order-information__sub-block">
                        <div dangerouslySetInnerHTML={createMarkup(return_address)} />
                    </div>
                </div>
            </div>
        </div>
    );
};