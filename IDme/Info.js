import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import projectConfig from 'UtilPath/getProjectConfigs';
import { useWindowSize } from '@magento/peregrine';

export const Info = props => {
    const { infoText, show, setShow } = props;

    const [t] = useTranslation();
    const windowSize = useWindowSize();
    const isMobile = windowSize.innerWidth <= projectConfig.viewport.mobile;

    const handleClose = () => setShow(false);
    return (
        <Modal show={show} onHide={handleClose} className={'idme-modal'}>
            <Modal.Header closeButton>
                <div className={'idme-head'}>
                    <h3>{t('What is Id.me!')}</h3>
                </div>
            </Modal.Header>
            <Modal.Body className={'idme-body'}>
                <div className={'idme-info'}>{infoText}</div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={handleClose}>Close</button>
            </Modal.Footer>
        </Modal>
    );
};
export default Info;
