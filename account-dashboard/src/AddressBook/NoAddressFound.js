import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
/**
 * No Address Component
 * @return {*}
 * @constructor
 */
export const NoAddressFound = props => {
    const { title } = props;
    const [t] = useTranslation();

    return (
        <div className={props.className || ''} css={props.css}>
            <div className={'no-address'}>{title}</div>
        </div>
    );
};

NoAddressFound.propTypes = {
    title: PropTypes.string
};
