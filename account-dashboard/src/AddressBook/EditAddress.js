import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export const EditAddress = props => {
    const { id, editLabel } = props;
    const [t] = useTranslation();

    return (
        <Link
            to={`${'/my-account/address/edit'}/${id}`}
            title={t(editLabel)}
            className={props.className || ''}
            css={props.css}
        >
            <span>{t(editLabel)}</span>
        </Link>
    );
};

EditAddress.propTypes = {
    id: PropTypes.number.isRequired,
    editLabel: PropTypes.string
};

EditAddress.defaultProps = {
    editLabel: 'Edit'
};
