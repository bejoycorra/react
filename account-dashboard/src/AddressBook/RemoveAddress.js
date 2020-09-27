import React, { useContext, useState, Fragment } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { addressList, deleteCustomerAddress } from './Queries';
import { RenderApolloError } from '@corratech/render-apollo-error';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { LoaderStore } from '@corratech/context-provider';
import { Link } from 'react-router-dom';
import { AlertContext } from '../Data/Context/AlertProvider';

export const RemoveAddress = props => {
    const { id, buttonTitle, buttonLoadingText, callback } = props;
    const { addMessage } = useContext(AlertContext);
    const [t] = useTranslation();

    const [show, setShow] = useState(false);
    const LoadingIndicator = useContext(LoaderStore);
    const [removeError, setRemoveError] = useState();
    /**
     * Update the cache data for the query recomended by
     * Apollo Doc after mutation.
     * #https://www.apollographql.com/docs/react/essentials/mutations/
     * Applied Refetch method to refetch data
     */

    const handleClose = () => setShow(false);
    const handleShow = e => {
        e.preventDefault();
        setShow(true);
    };

    const [
        deleteCustomerAddressAction,
        { loading: loadingRemoveAddress }
    ] = useMutation(deleteCustomerAddress);

    const removeAddress = async event => {
        handleClose();
        if (props.callFirst) props.callFirst();
        await deleteCustomerAddressAction({
            variables: {
                id
            }
        }).then(response => {
            if (!response.data.deleteCustomerAddress) {
                addMessage({
                    type: 'danger',
                    message: t('Something wrong happened')
                });
            } else {
                callback();
                addMessage({
                    type: 'success',
                    message: t('Address has been removed')
                });
            }
        });
    };

    const ConfirmModal = props => (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                {t('Are you sure you want to delete this address?')}
            </Modal.Body>
            <Modal.Footer>
                <Button size="sm" variant="primary" onClick={handleClose}>
                    {t('Cancel')}
                </Button>
                <Button size="sm" variant="primary" onClick={removeAddress}>
                    {t('OK')}
                </Button>
            </Modal.Footer>
        </Modal>
    );

    return (
        <Fragment>
            {ConfirmModal()}
            <Link
                to={'#'}
                onClick={handleShow}
                title={
                    !loadingRemoveAddress
                        ? t(buttonTitle)
                        : t(buttonLoadingText)
                }
                className={props.className || ''}
                css={props.css}
            >
                <span>
                    {!loadingRemoveAddress
                        ? t(buttonTitle)
                        : t(buttonLoadingText)}
                </span>
            </Link>
            {/*{removeError && <p className={'root-error'}>{removeError}</p>}*/}
        </Fragment>
    );
};

RemoveAddress.propTypes = {
    id: PropTypes.number.isRequired,
    buttonTitle: PropTypes.string,
    buttonLoadingText: PropTypes.string,
    callback: PropTypes.func.isRequired,
    callFirst: PropTypes.func
};

RemoveAddress.defaultProps = {
    buttonTitle: 'Remove',
    buttonLoadingText: 'Removing'
};
