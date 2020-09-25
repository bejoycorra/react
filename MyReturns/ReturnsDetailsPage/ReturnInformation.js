import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

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
                        {increment_id}
                    </div>
                </div>
                <div className="return-information__tiles">
                    <h2 className={'my-account__block-subtitle'}>
                        {t('Shipping Address')}
                    </h2>
                    <div className="order-information__sub-block">
                        {return_address}
                    </div>
                </div>
            </div>
        </div>
    );
};
