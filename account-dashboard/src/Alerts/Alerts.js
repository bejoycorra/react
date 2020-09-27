import React, { Fragment, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AlertContext } from '../Data/Context/AlertProvider';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
    Check as CheckIcon,
    AlertTriangle as Warning,
    X as ErrorIcon
} from 'react-feather';

export const Alerts = props => {
    const { WarningIco, ErrorIco, SuccessIco } = props;
    const { state, addMessage } = useContext(AlertContext);
    const [t] = useTranslation();

    return (
        <Fragment>
            {state.message && (
                <Alert variant={state.type}>
                    {state.type === 'warning' && (
                        <Fragment>{WarningIco}</Fragment>
                    )}
                    {state.type === 'success' && (
                        <Fragment>{SuccessIco}</Fragment>
                    )}
                    {state.type === 'danger' && <Fragment>{ErrorIco}</Fragment>}
                    {state.message}
                </Alert>
            )}
        </Fragment>
    );
};

Alerts.propTypes = {
    WarningIco: PropTypes.node,
    ErrorIco: PropTypes.node,
    SuccessIco: PropTypes.node
};

Alerts.defaultProps = {
    WarningIco: <Warning size={20} strokeWidth={'2'} color={'#c07600'} />,
    ErrorIco: <ErrorIcon size={20} strokeWidth={'2'} color={'#721c24'} />,
    SuccessIco: <CheckIcon size={20} strokeWidth={'2'} color={'#155724'} />
};
