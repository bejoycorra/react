import React from 'react';
import { func, bool } from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { RemoveIcon } from '@corratech/cart/src/Icons';

export const ModalConfirmation = props => {
    const { handleClose, removeItem, show } = props;

    const [t] = useTranslation();

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header>
                <button type="button" className={'close'} onClick={handleClose}>
                    <RemoveIcon
                        size={24}
                        strokeWidth={3}
                        className={'remove-icon'}
                    />
                </button>
            </Modal.Header>
            <Modal.Body>
                {t('Are you sure you would like to remove?')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" size="sm" onClick={handleClose}>
                    {t('Cancel')}
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        handleClose();
                        removeItem({
                            variables: {
                                public_hash: props.hashId
                            }
                        });
                    }}
                >
                    {t('Yes')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ModalConfirmation.propTypes = {
    handleClose: func,
    removeItem: func,
    show: bool
};
