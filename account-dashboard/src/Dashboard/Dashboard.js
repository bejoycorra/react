import React, { useContext } from 'react';
import { number } from 'prop-types';
import { useTranslation } from 'react-i18next';
import getCustomer from '../Data/Queries/getCustomer.graphql';
import getCustomerSalesOrders from '../Orders/Queries/customerSalesOrders.graphql';
import { useQuery, useLazyQuery } from 'react-apollo';
import { NameForm } from './NameForm';
import { DefaultAddress } from '../AddressBook/DefaultAddress';
import { OrdersList } from '../Orders/OrdersList';
import { LoaderStore } from '@corratech/context-provider';
import { useTitle } from 'react-use';
import { Link } from 'react-router-dom';
import getCountry from '../Data/Queries/getCountry.graphql';
import './Dashboard.less';

export const Dashboard = props => {
    const {
        pageSize,
        configProductAddToCartGraphql,
        simpleProductAddToCartGraphql,
        addressTitle,
        pageTitle
    } = props;
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);
    //Customer data
    const [
        getCustomerData,
        {
            data: customerData,
            loading: customerDataLoading,
            error: customerDataError
        }
    ] = useLazyQuery(getCustomer, { fetchPolicy: 'no-cache' });

    useTitle(t(pageTitle));

    //Orders list
    const {
        data: ordersData,
        loading: dataLoading,
        error: dataFetchError
    } = useQuery(getCustomerSalesOrders, {
        fetchPolicy: 'no-cache',
        variables: {
            pageSize: pageSize
        }
    });

    const {
        data: dataCountry,
        loading: loadingCountry,
        error: errorCountry
    } = useQuery(getCountry);

    React.useEffect(() => {
        getCustomerData();
    }, []);

    if (customerDataLoading || dataLoading || loadingCountry) {
        return <LoadingIndicator />;
    }
    if (customerDataError || dataFetchError || errorCountry)
        return `Error: ${
            customerDataError
                ? customerDataError
                : dataFetchError
                ? dataFetchError
                : ''
        }`;

    const orderItems = ordersData.customerSalesOrders.items;

    if (customerData)
        return (
            <div
                className={`MyAccountWrapper content-wrapper ${props.className ||
                ''}`}
                css={props.css}
            >
                <h1 className={'my-account__page-title'}>{t('My Account')}</h1>
                <div className={'ContactInformation'}>
                    <h2 className={'my-account__block-title'}>
                        {t('Account Information')}
                    </h2>

                    <NameForm
                        customerData={customerData}
                        changeCallback={getCustomerData}
                        className={'dashboard-block'}
                    />

                    <div className={'dashboard-block'}>
                        <h2 className={'my-account__block-subtitle'}>
                            {t('Newsletters')}
                        </h2>
                        <div className={'dashboard-newsletter-block'}>
                            {customerData.customer.is_subscribed
                                ? t(
                                    'You are subscribed to "General Subscription".'
                                )
                                : t("You aren't subscribed to our newsletter.")}
                        </div>
                        <div className={'my-account__block-actions'}>
                            <Link
                                to={'/my-account/newsletter/'}
                                title={t(`Edit`)}
                            >
                                <span>{t(`Edit`)}</span>
                            </Link>
                        </div>
                    </div>

                    <div className={'dashboard-block'}>
                        <h2 className={'my-account__block-title'}>
                            {t(addressTitle)}
                            <Link
                                to={'/my-account/address'}
                                title={t('Manage addresses')}
                            >
                                <span className={'manage-address-button manage-address-link'}>
                                    {t('Manage Addresses')}
                                </span>
                            </Link>
                        </h2>
                        <DefaultAddress
                            address={customerData.customer.addresses}
                            dashboardPage={true}
                            countries={dataCountry.countries}
                        />
                    </div>
                    {orderItems && orderItems.length ? (
                        <div className={'dashboard-block'}>
                            <h2 className={'my-account__block-title'}>
                                {t('Recent orders')}
                                <Link
                                    to={'/my-account/orders/'}
                                    title={t('View All')}
                                >
                                    <span className={'manage-address-button recent-order-view-all'}>
                                        {t('View All')}
                                    </span>
                                </Link>
                            </h2>
                            <OrdersList
                                orderItems={orderItems}
                                configProductAddToCartGraphql={
                                    configProductAddToCartGraphql
                                }
                                simpleProductAddToCartGraphql={
                                    simpleProductAddToCartGraphql
                                }
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    else {
        return <LoadingIndicator />;
    }
};

Dashboard.propTypes = {
    pageSize: number
};

Dashboard.defaultProps = {
    pageSize: 5,
    pageTitle: 'My Account'
};
