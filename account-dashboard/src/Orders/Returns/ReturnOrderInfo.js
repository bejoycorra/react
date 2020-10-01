import React, {useContext, useEffect, useState} from 'react';
import {useQuery} from "react-apollo";
import {LoaderStore} from "@corratech/context-provider";
import orderDetails from '../Queries/orderDetails.graphql';
import getCountry from '../../Data/Queries/getCountry.graphql';
import {OrderAddress} from "../OrderDetailsPage/OrderAddress";
import {useTranslation} from "react-i18next";
import {useParams} from "react-router-dom";

export const ReturnOrderInfo = props => {
    const [t] = useTranslation();
    const orderId = props.orderId;
    const LoadingIndicator = useContext(LoaderStore);
    const [orderData, setOrderData] = useState(false);

    const { data, loading, error } = useQuery(orderDetails, {
        fetchPolicy: 'no-cache',
        variables: { id: orderId }
    });

    useEffect(() => {
        if (data) {
            setOrderData(data.orderDetails)
        }
    }, [data]);
    
    const { data: dataCountry, loading: loadingCountry, error: errorCountry } = useQuery(getCountry);

    if (loading || loadingCountry) return <LoadingIndicator />;
    if (error || errorCountry) return `${t('Error: Something went wrong!')}`;

    return (
        <>
            <div className={'return-order'}>{t(`New Return for Order # ${orderData.increment_id}`)}</div>
            <div className="return-order-details">
                <div className={'return-order-col'}>
                    <div className={'return-order-row'}>
                        <h4>{t('Order ID')}</h4>
                        <span>{orderData.increment_id}</span>
                    </div>
                    <div className={'return-order-row'}>
                        <h4>{t('Email')}</h4>
                        <span>{orderData.customer_email}</span>
                    </div>
                </div>
                <div className={'return-order-col'}>
                    <h4>{t('Customer Name')}</h4>
                    <span>{orderData.customer_name}</span>
                </div>
            </div>
            <div className="return-order-shipping-address">
                <h2 className={'my-account__block-title'}>
                    {t('Shipping Address')}
                </h2>
                <OrderAddress
                    addresses={orderData.shipping}
                    countries={dataCountry.countries}
                />
            </div>
        </>
    );
};
