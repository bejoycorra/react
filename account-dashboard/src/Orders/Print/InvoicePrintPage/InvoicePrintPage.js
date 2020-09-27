import React, { Fragment, useContext, useEffect, useRef } from 'react';
import { useQuery } from 'react-apollo';
import orderDetails from '@corratech/account-dashboard/src/Orders/Queries/orderDetails.graphql';
import getCountry from '@corratech/account-dashboard/src/Data/Queries/getCountry.graphql';
import dateFormat from 'dateformat';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoaderStore } from '@corratech/context-provider';
import { Invoices } from '@corratech/account-dashboard/src/Orders/OrderDetailsPage/Invoices';
import { OrderInformation } from '@corratech/account-dashboard/src/Orders/OrderDetailsPage/OrderInformation';
import './InvoicePrintPage.less';

export const InvoicePrintPage = props => {
    const { orderId } = useParams();
    const LoadingIndicator = useContext(LoaderStore);
    const [t] = useTranslation();
    const containerRef = useRef(null);

    const { data, loading, error } = useQuery(orderDetails, {
        fetchPolicy: 'no-cache',
        variables: {
            id: orderId
        }
    });

    const {
        data: dataCountry,
        loading: loadingCountry,
        error: errorCountry
    } = useQuery(getCountry);

    useEffect(() => {
        const printClassName = ['page-print', 'order-details-print-page'];

        document.body.classList.add(...printClassName);

        if (containerRef.current != null) {
            window.print();
        }

        return () => {
            document.documentElement.classList.remove(...printClassName);
        };
    }, [data, loadingCountry]);

    if (loading || loadingCountry) return <LoadingIndicator />;

    if (error || errorCountry) return `${t('Error: Something went wrong!')}`;

    const orderData = data.orderDetails;

    return (
        <Fragment>
            {orderData && dataCountry && (
                <div className={'order-print-contianer'} ref={containerRef}>
                    <div className={'order-details-contianer'}>
                        <h1 className="my-account__page-title">
                            {t(`Order # ${orderData.increment_id}`)}
                            <span className="status-badge">
                                {orderData.status}
                            </span>
                        </h1>
                        <div className="order-date">
                            {t('Order Date') + ': '}
                            {dateFormat(
                                new Date(
                                    orderData.created_at.replace(/-/g, '/')
                                ),
                                'mmmm d, yyyy'
                            )}
                            <span>{` (${orderData.customer_name})`}</span>
                        </div>
                        <div className="order-data-tab my-account__block">
                            {orderData.invoices.map((invoice, key) => {
                                return <Invoices key={key} invoice={invoice} />;
                            })}
                        </div>
                        <OrderInformation
                            orderData={orderData}
                            countries={dataCountry.countries}
                        />
                    </div>
                </div>
            )}
        </Fragment>
    );
};
