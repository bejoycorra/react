import React, { Fragment, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { useWindowSize } from '@magento/peregrine';
import orderDetails from '../Queries/orderDetails.graphql';
import getCountry from '../../Data/Queries/getCountry.graphql';
import canCreateRma from '../Queries/Rma/canCreateRma.graphql';
import dateFormat from 'dateformat';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoaderStore, useGlobalOptions } from '@corratech/context-provider';
import { Tabs, Tab, Button } from 'react-bootstrap';
import { ItemOrdered } from './ItemOrdered';
import { OrderInformation } from './OrderInformation';
import { OrderShipment } from './OrderShipment';
import { Invoices } from './Invoices';
import { TrackShipment } from './OrderShipment/TrackShipment';
import { Reorder } from '../Reorder';
import './OrderDetailsPage.less';
import { bool } from 'prop-types';
import { OrderReturns } from '../Returns/OrderReturns';

export const OrderDetailsPage = props => {
    const { showTrackingError } = props;

    const { orderId } = useParams();

    const [showCreate, setShowCreate] = useState(true);

    const LoadingIndicator = useContext(LoaderStore);

    const [t] = useTranslation();

    const windowSize = useWindowSize();

    const options = useGlobalOptions();

    const isMobile = windowSize.innerWidth <= (options.viewport.mobile || 767);

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

    const {
        data: dataReturns,
        loading: loadingReturns,
        error: errorReturns
    } = useQuery(canCreateRma, {
        fetchPolicy: 'no-cache',
        variables: {
            orderId: orderId
        }
    });

    const getAllTracking = (shipments = []) => {
        const allShipmentTracking = [];

        shipments.map(shipment => {
            if (shipment.tracks) allShipmentTracking.push(...shipment.tracks);
        });
        return allShipmentTracking;
    };

    if (loading || loadingCountry || loadingReturns) return <LoadingIndicator />;

    if (error || errorCountry || errorReturns) return `${t('Error: Something went wrong!')}`;

    const orderData = data.orderDetails;

    const canReturn = dataReturns.canCreateRma.is_return_available;

    const { items, ...rest } = orderData;

    return (
        <Fragment>
            {orderData && (
                <div className={'order-details-contianer'}>
                    <h1 className="my-account__page-title">
                        {t(`Order # ${orderData.increment_id}`)}
                        <span className="status-badge">{orderData.status}</span>
                    </h1>
                    <div className="order-date">
                        {showCreate && t('Order Date') + ': '}
                        {dateFormat(
                            new Date(orderData.created_at.replace(/-/g, '/')),
                            'mmmm d, yyyy'
                        )}
                        {showCreate && (
                            <span>{` (${orderData.customer_name})`}</span>
                        )}
                    </div>
                    <div className={'order-actions-toolbar'}>
                        <div className={'actions'}>
                            <div className={'actions-links-wrap'}>
                                <Reorder
                                    item={{ reorder_items: items, ...rest }}
                                    configProductAddToCartGraphql={
                                        props.configProductAddToCartGraphql
                                    }
                                    simpleProductAddToCartGraphql={
                                        props.simpleProductAddToCartGraphql
                                    }
                                />
                                {canReturn && (
                                    <Link
                                        to={`/my-account/orders/returns/${orderId}`}
                                        className="return-link"
                                        title={t('Return Order')}
                                    >
                                        {t('Return')}
                                    </Link>
                                )}
                            </div>
                            
                            {!isMobile && (
                                <a
                                    href={`/my-account/orders/print/${orderId}`}
                                    target="_blank"
                                    className="print-order-link"
                                    title={t('Print Order')}
                                >
                                    <Button size="lg" variant="link">
                                        {t('Print Order')}
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="order-data-tab my-account__block">
                        <Tabs
                            defaultActiveKey="orderitems"
                            transition={false}
                            onSelect={tab =>
                                setShowCreate(Boolean(tab === 'orderitems'))
                            }
                        >
                            <Tab eventKey="orderitems" title="Items Ordered">
                                <ItemOrdered itemData={orderData} />
                            </Tab>
                            {orderData.invoices && (
                                <Tab eventKey="invoices" title="Invoices">
                                    {!isMobile && (
                                        <a
                                            href={`/my-account/invoice/print/${orderId}`}
                                            target="_blank"
                                            className="print-order-link"
                                            title={t('Print Invoices')}
                                        >
                                            <Button size="lg" variant="link">
                                                {t('Print Invoices')}
                                            </Button>
                                        </a>
                                    )}
                                    {orderData.invoices.map((invoice, key) => {
                                        return (
                                            <Invoices
                                                key={key}
                                                invoice={invoice}
                                            />
                                        );
                                    })}
                                </Tab>
                            )}
                            {orderData.shipments && (
                                <Tab
                                    eventKey="ordershipments"
                                    title="Order Shipments"
                                >
                                    <TrackShipment
                                        shipmentNumber={''}
                                        tracks={getAllTracking(
                                            orderData.shipments
                                        )}
                                        linkText={t('Track all shipment')}
                                        showTrackingError={showTrackingError}
                                    />
                                    {orderData.shipments.map(
                                        (shipment, key) => {
                                            return (
                                                <OrderShipment
                                                    key={key}
                                                    shipment={shipment}
                                                    showTrackingError={
                                                        showTrackingError
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </Tab>
                            )}
                            {canReturn && (
                                <Tab eventKey="returns" title="Returns">
                                    <OrderReturns orderId={orderId}/>
                                </Tab>
                            )}
                        </Tabs>
                    </div>
                    <OrderInformation
                        orderData={orderData}
                        countries={dataCountry.countries}
                    />
                </div>
            )}
        </Fragment>
    );
};

OrderDetailsPage.propTypes = {
    showTrackingError: bool
};

OrderDetailsPage.defaultProps = {
    showTrackingError: true
};
