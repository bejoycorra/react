import React, { useState, useCallback, useMemo, Fragment } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-bootstrap';
import { AlertTriangle as Warning } from 'react-feather';
import { bool } from 'prop-types';

export const TrackShipment = props => {
    const {
        tracks = [],
        shipmentNumber,
        linkText = 'Track this shipment',
        showTrackingError
    } = props;

    const [t] = useTranslation();
    const [show, setShow] = useState(false);

    const handleClose = useCallback(() => setShow(false), [show, tracks]);

    const TrackTableData = useMemo(
        () =>
            tracks.map((track, key) => (
                <div className="tracking-list-wrapper" key={key}>
                    <table className="tacking-table">
                        <tbody>
                            <tr>
                                <th className="col label">
                                    {t('Tracking Number')}:
                                </th>
                                <td className="col value">
                                    {track.tracking_url ? (
                                        <a
                                            href={track.tracking_url}
                                            target="_blank"
                                        >
                                            {track.track_number}
                                        </a>
                                    ) : (
                                        <span>{track.track_number}</span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <th className="col label">{t('Carrier')}:</th>
                                <td className="col value">{track.title}</td>
                            </tr>
                            {!track.tracking_url && showTrackingError && (
                                <tr>
                                    <th className="col label">{t('Error')}:</th>
                                    <td className="col value">
                                        {t(
                                            'Tracking information is currently not available.'
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )),
        [tracks]
    );

    return (
        <Fragment>
            <a href="javascript:;" onClick={() => setShow(true)}>
                {t(linkText)}
            </a>
            <Modal
                show={show}
                onHide={handleClose}
                dialogClassName={'shipment-tracking-modal'}
            >
                <Modal.Header>
                    <Modal.Title>{t('Tracking Information')}</Modal.Title>
                    <span className="tracking-number-hash">
                        {`Shipment ${shipmentNumber}`}
                    </span>
                </Modal.Header>
                {tracks.length ? (
                    <Modal.Body>{TrackTableData}</Modal.Body>
                ) : (
                    <Alert variant={'warning'}>
                        <Warning
                            size={20}
                            strokeWidth={'2'}
                            color={'#c07600'}
                        />
                        {t('There is no tracking available for this shipment.')}
                    </Alert>
                )}
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        {t('Close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

TrackShipment.propTypes = {
    showTrackingError: bool
};
