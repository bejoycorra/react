import React, { useContext, useState } from 'react';
import { NoAddressFound } from './NoAddressFound';
import { DefaultAddress } from './DefaultAddress';
import { AddressList } from '../AddressBook';
import { addressList } from './Queries';
import { useQuery } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { AddressForm } from './AddressForms';
import { LoaderStore } from '@corratech/context-provider';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { Check as CheckIcon } from 'react-feather';
import { useTitle } from 'react-use';
import { Button } from 'react-bootstrap';
import getCountry from '../Data/Queries/getCountry.graphql';
import './address-book.less';

export const AddressBook = props => {
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);
    const { loading, error, data, refetch, networkStatus } = useQuery(
        addressList,
        {
            notifyOnNetworkStatusChange: true,
            fetchPolicy: 'no-cache'
        }
    );
    const {
        data: dataCountry,
        loading: loadingCountry,
        error: errorCountry
    } = useQuery(getCountry);

    useTitle(t(props.addressTitle));

    //Loading state for fetching data
    if (loading || networkStatus === 4 || loadingCountry) {
        return <LoadingIndicator />;
    }
    if (error || errorCountry || errorCountry)
        return <p>{t('Error Loading Address List')}</p>;

    const { addresses } = data.customer;

    //If User has no address should dispaly no address component.
    if (!addresses.length) {
        return (
            <div>
                <AddressForm updateAddresses={refetch} addressValidationName={props.addressValidationName}/>
            </div>
        );
    }

    return (
        <div
            className={`address-book content-wrapper ${props.className || ''}`}
        >
            <div className={'address-header'}>
                <h1 className={'my-account__page-title'}>{props.addressTitle}</h1>
            </div>

            <div className={'address-dashboard-block my-account__block'}>
                <div className={'default-address-contanier'}>
                    <h2 className={'my-account__block-title'}>
                        Default Addresses
                    </h2>
                    <DefaultAddress
                        address={addresses}
                        countries={dataCountry.countries}
                    />
                </div>
            </div>
            <div className={'address-dashboard-block my-account__block'}>
                <div className={'address-list-container'}>
                    <h2 className={'my-account__block-title'}>
                        {t(`Additional Address Entries`)}
                    </h2>
                    <AddressList
                        addresses={addresses}
                        countries={dataCountry.countries}
                    />
                </div>
            </div>
            <div className={'add-new-address'}>
                <Link
                    to={'/my-account/address/new'}
                    title={t('Add New Address')}
                    className={'btn btn-primary'}
                >
                    <span>{t('Add New Address')}</span>
                </Link>
            </div>
        </div>
    );
};
