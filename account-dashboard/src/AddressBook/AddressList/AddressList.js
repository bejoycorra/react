import React, { useContext, useState } from 'react';
import { AddressRow } from './AddressRow';
import { RemoveAddress } from '../RemoveAddress';
import { EditAddress } from '../EditAddress';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { addressList } from '../Queries';
import { LoaderStore } from '@corratech/context-provider';

export const AddressList = props => {
    const { addresses, showAlert, countries } = props;
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);

    //e default address from the address array
    const [additionalAddresses, setAdditionalAddresses] = useState(
        addresses.filter(address => {
            return !address.default_billing && !address.default_shipping;
        })
    );

    const [getAddressList, { loading, error }] = useLazyQuery(addressList, {
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            setAdditionalAddresses(
                data.customer.addresses.filter(address => {
                    return (
                        !address.default_billing && !address.default_shipping
                    );
                })
            );
        }
    });

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return <p>{t('Something went wrong')}</p>;
    }

    return (
        <div
            className={`address-list table-wrapper ${props.className || ''}`}
            css={props.css}
        >
            {additionalAddresses.length ? (
                <table className={'orders-list address-table'}>
                    <thead>
                        <tr>
                            <th scope="col">{t('First Name')}</th>
                            <th scope="col">{t('Last Name')}</th>
                            <th scope="col">{t('Street Address')}</th>
                            <th scope="col">{t('City')}</th>
                            <th scope="col">{t('Country')}</th>
                            <th scope="col">{t('State')}</th>
                            <th scope="col">{t('Zip/Postal Code')}</th>
                            <th scope="col">{t('Phone')}</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {additionalAddresses.map((address, index) => {
                            return (
                                <AddressRow
                                    key={index}
                                    address={address}
                                    countries={countries}
                                    updateAddresses={getAddressList}
                                />
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div>{t('No Additional Addresses Found')}</div>
            )}
        </div>
    );
};

AddressList.propTypes = {
    addresses: PropTypes.array.isRequired,
    countries: PropTypes.array
};
