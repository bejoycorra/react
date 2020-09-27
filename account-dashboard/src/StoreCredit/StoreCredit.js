import React, { useContext, Fragment, lazy } from 'react';
import { bool } from 'prop-types';
import dateFormat from 'dateformat';
import { useQuery } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import getStoreCredit from './Queries/getStoreCredit.graphql';
import { addressList } from '../AddressBook/Queries';
import { LoaderStore } from '@corratech/context-provider';
import { Link } from 'react-router-dom';
import { setPriceZeroes } from '../util/setPriceZeroes';
import { getCurrencySymbol } from '../util/getCurrencySymbol';
import { useTitle } from 'react-use';

import './StoreCredit.less';
const NoStoreCredit = lazy(() => import('./NoStoreCredit'));

const getCurrencyWithValue = (value, currency) => {
    const minusValues = String(value).includes('-');
    return minusValues
        ? `-${getCurrencySymbol(currency)}${setPriceZeroes(
              String(value).replace('-', '')
          )}`
        : getCurrencySymbol(currency) + setPriceZeroes(String(value));
};

export const StoreCredit = props => {
    const [t] = useTranslation();
    const { showHistory } = props;
    const LoadingIndicator = useContext(LoaderStore);
    const { loading, error, data } = useQuery(getStoreCredit, {
        fetchPolicy: 'no-cache'
    });
    let pageTitle = t('Store Credit');

    useTitle(pageTitle);
    const CreditHistory = items => (
        <Fragment>
            {items &&
                items.map((item, key) => {
                    return (
                        <tr key={key}>
                            <td data-th={t('Action')}>{item.action}</td>
                            <td data-th={t('Balance Change')}>
                                {getCurrencyWithValue(
                                    item.balance_change.value,
                                    item.balance_change.currency
                                )}
                            </td>
                            <td data-th={t('Balance')}>
                                {getCurrencyWithValue(
                                    item.actual_balance.value,
                                    item.actual_balance.currency
                                )}
                            </td>
                            <td data-th={t('Date')}>
                                {dateFormat(
                                    new Date(
                                        item.date_time_changed.replace(
                                            /-/g,
                                            '/'
                                        )
                                    ),
                                    'm/d/yy, h:MM TT'
                                )}
                            </td>
                        </tr>
                    );
                })}
        </Fragment>
    );

    if (loading) return <LoadingIndicator />;

    //Handle error case
    if (error) return <p>{t('Error Loading Store Credit')}</p>;

    const { store_credit } = data.customer;

    if (!store_credit.enabled) {
        return <NoStoreCredit />;
    }

    return (
        <div
            className={`store-credit content-wrapper ${props.className || ''}`}
        >
            <div className="account-header">
                <h1 className={'my-account__page-title'}>
                    {t('Store Credit')}
                </h1>
            </div>
            <div className="store-credit-balance">
                <div className="store-credit-row">
                    <div className="credit-coloumn my-account__block">
                        <h2 className="store-head my-account__block-title">
                            {t('Balance')}
                        </h2>
                        <div className={'store-container'}>
                            {getCurrencySymbol(
                                store_credit.current_balance.currency
                            )}
                            {setPriceZeroes(store_credit.current_balance.value)}
                        </div>
                    </div>
                    <div className="credit-coloumn my-account__block">
                        <h2 className="store-head my-account__block-title">
                            {t('Redeem Gift Card')}
                        </h2>
                        <div className="store-container">
                            {t('Have a gift card? ')}
                            <Link to={'/my-account/gift-card/'}>
                                {t('Click here')}
                            </Link>
                            {t(' to redeem it.')}
                        </div>
                    </div>
                </div>
                {showHistory && store_credit.balance_history.items.length ? (
                    <div className="store">
                        <h2 className="store-head my-account__block-title">
                            {t('Balance History')}
                        </h2>
                        <div className="store-history table-wrapper">
                            <table className={'orders-list'}>
                                <thead>
                                    <tr>
                                        <th>{t('Action')}</th>
                                        <th>{t('Balance Change')}</th>
                                        <th>{t('Balance')}</th>
                                        <th>{t('Date')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CreditHistory(
                                        store_credit.balance_history.items
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

StoreCredit.propTypes = {
    showHistory: bool
};

StoreCredit.defaultProps = {
    showHistory: true
};
