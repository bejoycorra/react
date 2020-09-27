import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useLazyQuery, useQuery } from 'react-apollo';
import { TextInput, Field, isRequired } from '@corratech/form-components';
import { Button } from 'react-bootstrap';
import { Form } from 'informed';
import { Alert } from 'react-bootstrap';
import giftCardAccount from './Queries/giftCardAccount.graphql';
import redeemGiftCardBalanceAsStoreCredit from './Queries/redeemGiftCardBalanceAsStoreCredit.graphql';
import storeCreditStatus from './Queries/storeCreditStatus.graphql';
import { getCurrencySymbol } from '../util/getCurrencySymbol';
import { setPriceZeroes } from '../util/setPriceZeroes';
import { AlertContext } from '../Data/Context/AlertProvider';
import { LoaderStore } from '@corratech/context-provider';
import { useTitle } from 'react-use';

import './GiftCard.less';

export const GiftCard = props => {
    const [t] = useTranslation();
    const { state, addMessage } = useContext(AlertContext);
    const LoadingIndicator = useContext(LoaderStore);
    const [giftCardBalance, setGiftCardBalance] = useState(false);
    const {
        loading: loadingStatus,
        error: errorStatus,
        data: dataStatus
    } = useQuery(storeCreditStatus, { fetchPolicy: 'no-cache' });
    const [checkGiftCardAccount, { loading, error, data }] = useLazyQuery(
        giftCardAccount,
        {
            fetchPolicy: 'no-cache',
            onError: error => {
                addMessage({
                    type: 'danger',
                    message: t(` Please enter a valid gift card code.`)
                });
            }
        }
    );

    const [redeemGiftCard, { loading: redeemLoding }] = useMutation(
        redeemGiftCardBalanceAsStoreCredit,
        {
            onError: error => {
                addMessage({
                    type: 'danger',
                    message: t(` We cannot redeem this gift card.`)
                });
            }
        }
    );

    useEffect(() => {
        if (data) setGiftCardBalance(true);
    }, [data]);

    const getPriceWithCurrency = (value, currency) => {
        return getCurrencySymbol(currency) + setPriceZeroes(value);
    };

    const handleGiftCardBalance = async formApi => {
        //reset the message
        addMessage({ message: null });
        if (!(formApi.getValue('giftcard') || '').trim()) {
            formApi.setError('giftcard', 'This is a required field.');
            return false;
        }

        await checkGiftCardAccount({
            variables: {
                giftCardCode: formApi.getValue('giftcard')
            }
        });
    };

    const handleRedeemCard = async formApi => {
        //reset the message
        setGiftCardBalance(false);
        addMessage({ message: null });
        if (!(formApi.getValue('giftcard') || '').trim()) {
            formApi.setError('giftcard', 'This is a required field.');
            return false;
        }

        await redeemGiftCard({
            variables: {
                giftCardCode: formApi.getValue('giftcard')
            }
        }).then(response => {
            if (response && response.data.redeemGiftCardBalanceAsStoreCredit) {
                
                addMessage({
                    type: 'success',
                    message: t(` Gift card `+formApi.getValue('giftcard')+` was redeemed.`)
                });
            }
            formApi.setValue('giftcard', '');
        });
    };

    let pageTitle = t('Gift Card');

    useTitle(pageTitle);

    if (loadingStatus) return <LoadingIndicator />;
    if (errorStatus) return <p>{t('Error Loading Gift Card')}</p>;

    return (
        <div
            className={`store-credit content-wrapper ${props.className || ''}`}
        >
            <div className="account-header">
                <h1 className={'my-account__page-title'}>Gift Card</h1>
            </div>
            <div className="giftcard-container">
                {giftCardBalance && data && data.giftCardAccount && (
                    <div className="giftcard-balance">
                        <p>
                            {t('Gift Card')} :{' '}
                            <b>{data.giftCardAccount.code}</b>
                        </p>
                        <p>
                            {t('Current Balance')} :{' '}
                            <b>
                                {getPriceWithCurrency(
                                    data.giftCardAccount.balance.value,
                                    data.giftCardAccount.balance.currency
                                )}
                            </b>
                        </p>
                        {data.giftCardAccount.expiration_date && (
                            <p>
                                Expires:{' '}
                                <b>{data.giftCardAccount.expiration_date}</b>
                            </p>
                        )}
                    </div>
                )}
                <Form
                    render={({ formApi }) => (
                        <>
                            <div className={'my-account__block'}>
                                <Field
                                    label={t(`Enter gift card code`)}
                                    required={true}
                                >
                                    <TextInput
                                        type={'text'}
                                        field="giftcard"
                                        validate={isRequired}
                                        validateOnChange
                                    />
                                </Field>
                                <div className="button-containers">
                                    {dataStatus.customer.store_credit
                                        .enabled && (
                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                handleRedeemCard(formApi)
                                            }
                                            disabled={redeemLoding}
                                        >
                                            {t(`Redeem Gift Card`)}
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            handleGiftCardBalance(formApi)
                                        }
                                        disabled={loading}
                                    >
                                        {t(`Check status and balance`)}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                />
            </div>
        </div>
    );
};
