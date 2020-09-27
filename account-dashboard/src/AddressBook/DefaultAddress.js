import React, { Fragment } from 'react';
import { NoAddressFound } from './NoAddressFound';
import { useTranslation } from 'react-i18next';
import { Address } from '@corratech/address';
import PropTypes from 'prop-types';
import { EditAddress } from './EditAddress';

export const DefaultAddress = props => {
    const { address, dashboardPage, countries } = props;
    const [t] = useTranslation();

    //Filter Default Billing Address from address list
    const { 0: defaultBilling } = address.filter(value => {
        return value.default_billing;
    });

    //Filter Default Shipping Address from address list
    const { 0: defaultShipping } = address.filter(value => {
        return value.default_shipping;
    });

    return (
        /**
         * Default Address Container
         * TItle and Address would create the Default Container
         */
        <div
            className={`default-address-container ${props.className || ''}`}
            css={props.css}
        >
            {address.length > 0 ? (
                <Fragment>
                    {!defaultShipping && !defaultBilling && (
                        <NoAddressFound
                            title={t(
                                'No Default Shipping or Billing Address Found'
                            )}
                        />
                    )}
                    {defaultBilling && (
                        <div className={'address-list dashboard-block'}>
                            <Address
                                address={defaultBilling}
                                title={t('Default Billing Address')}
                                countries={countries}
                            />
                            <div className={'my-account__block-actions'}>
                                <EditAddress
                                    id={defaultBilling.id}
                                    editLabel={'Change Billing Address'}
                                />
                            </div>
                        </div>
                    )}
                    {defaultShipping && (
                        <div className={'address-list dashboard-block'}>
                            <Address
                                address={defaultShipping}
                                title={t('Default Shipping Address')}
                                countries={countries}
                            />
                            <div className={'my-account__block-actions'}>
                                <EditAddress
                                    id={defaultShipping.id}
                                    editLabel={'Change Shipping Address'}
                                />
                            </div>
                        </div>
                    )}
                </Fragment>
            ) : (
                <div> {t('No default addresses')} </div>
            )}
        </div>
    );
};

DefaultAddress.propTypes = {
    address: PropTypes.array,
    dashboardPage: PropTypes.bool,
    countries: PropTypes.array
};

DefaultAddress.defaultProps = {
    dashboardPage: false
};
