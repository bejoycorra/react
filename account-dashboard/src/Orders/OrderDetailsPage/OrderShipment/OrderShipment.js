import React, { useMemo, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { TrackShipment } from './TrackShipment/TrackShipment';
import { bool } from 'prop-types';

export const OrderShipment = props => {
    const { shipment, key, showTrackingError } = props;
    const [t] = useTranslation();

    const getOrderItems = useMemo(
        () =>
            shipment.shipped_items.map((item, keys) => (
                <tr key={keys}>
                    <td className="col name" data-th="Product Name">
                        <strong className="product name product-item-name">
                            {item.name}
                        </strong>
                        {item.product_options[0].config_options &&
                            item.product_options[0].config_options.map(
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
                    <td className="col qty" data-th="Qty">
                        <ul className="items-qty">
                            {item.quantity_shipped !== 0 && (
                                <li className="item">
                                    <span className="content">
                                        {item.quantity_shipped}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </td>
                </tr>
            )),
        [shipment]
    );

    return (
        <div className="orderd-items-container">
            <div className="orderd-item-head">
                <h3>
                    <span>{t(`Shipment #${shipment.number}`)}</span>
                    {shipment.tracks && (
                        <TrackShipment
                            shipmentNumber={`#${shipment.number}`}
                            tracks={shipment.tracks}
                            showTrackingError={showTrackingError}
                        />
                    )}
                </h3>
            </div>
            {shipment.tracks && (
                <div className="shipment-tracking-number-seq">
                    <strong>{t(`Tracking Number(s)`)}: </strong>
                    {shipment.tracks.map((track, key) => (
                        <Fragment>
                            <TrackShipment
                                key={key}
                                shipmentNumber={`#${shipment.number}`}
                                tracks={[track]}
                                linkText={String(track.track_number)}
                                showTrackingError={showTrackingError}
                            />
                            {key !== shipment.tracks.length - 1 && (
                                <span>,</span>
                            )}
                        </Fragment>
                    ))}
                </div>
            )}
            <table className="ordered-items">
                <thead>
                    <tr>
                        <th className="col name">{t('Product Name')}</th>
                        <th className="col sku">{t('SKU')}</th>
                        <th className="col qty">{t('Qty Shipped')}</th>
                    </tr>
                </thead>
                <tbody>{shipment && getOrderItems}</tbody>
            </table>
        </div>
    );
};

OrderShipment.propTypes = {
    showTrackingError: bool
};

OrderShipment.defaultProps = {
    key: 0
};
