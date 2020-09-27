import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EditAddress, RemoveAddress } from '../../../';
import getCountryName from '../Queries/getCountryName.graphql';
import { useQuery } from 'react-apollo';
import { LoaderStore } from '@corratech/context-provider';
import { useTranslation } from 'react-i18next';
import '@corratech/account-dashboard/src/AddressBook/address-book.less';

/**
 * Renders the Address grid
 * @param props => Address Object
 * @return {*}
 * @constructor
 */
export const AddressRow = props => {
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);
    const { address, loading, error, countries } = { ...props };

    const getCountries = id => {
        return countries.filter(value => {
            return String(value.id) === String(id);
        });
    };

    return (
        <>
            <tr className={props.className} css={props.css}>
                <td data-th={t('First Name')}>{address.firstname}</td>
                <td data-th={t('Last Name')}>{address.lastname}</td>
                <td data-th={t('Street Address')}>
                    <span>{address.street[0]}</span>
                    {address.street[1] && <span>, {address.street[1]}</span>}
                </td>
                <td data-th={t('City')}>{address.city}</td>
                <td data-th={t('Country')}>
                    {getCountries(address.country_id)[0].full_name_locale}
                </td>
                <td data-th={t('State')}>
                    <span className="mobile-label">{t('State')}</span>
                    <span>{address.region.region}</span>
                </td>
                <td data-th={t('Zip/Postal Code')}>{address.postcode}</td>
                <td data-th={t('Phone')}>
                    <a className="phone-num" href={'tel:' + address.telephone}>
                        {address.telephone}
                    </a>
                </td>
                <td data-th={t('Actions')} className={'table-actions'}>
                    <EditAddress
                        className={'address-action-edit primary-link'}
                        id={address.id}
                    />
                    <RemoveAddress
                        className={'address-action -delete'}
                        id={address.id}
                        buttonTitle={'Delete'}
                        buttonLoadingText={'Deleting'}
                        callback={props.updateAddresses}
                    />
                </td>
            </tr>
        </>
    );
};

AddressRow.propTypes = {
    address: PropTypes.object.isRequired,
    title: PropTypes.string,
    css: PropTypes.object
};
