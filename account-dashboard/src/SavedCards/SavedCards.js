import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useTitle } from 'react-use';
import { useTranslation } from 'react-i18next';
import { jsx } from '@emotion/core';
import { LoaderStore } from '@corratech/context-provider';
import { FadeIn } from 'react-lazyload-fadein';
import { useQuery, useMutation } from 'react-apollo';
import GET_PAYMENT_DATA from './Queries/getPaymentData.graphql';
import DELETE_PAYMENT_DATA from './Queries/deletePaymentData.graphql';
import { RemoveIcon } from '@corratech/cart/src/Icons';
import { bool, func, number, object, string } from 'prop-types';
import { ModalConfirmation } from './ModalConfirmation';

export const SavedCards = props => {
    const { hasConfirmation } = props;
    const [t] = useTranslation();
    useTitle(t(props.savedCardsTitle));
    const [show, setShow] = useState(false);
    const [paymentData, setPaymentData] = useState([]);
    const LoadingIndicator = useContext(LoaderStore);
    const [hashId, setHashId] = useState(null);

    const handleShow = hashId => {
        setHashId(hashId);
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
    };

    const {
        loading: loadingPaymentData,
        error: errorPaymentData,
        data: defaultPaymentData
    } = useQuery(GET_PAYMENT_DATA, {
        fetchPolicy: 'no-cache',
        context: {
            fetchOptions: { method: 'GET' }
        },
        onCompleted: response => {
            setPaymentData(response.customerPaymentTokens.items);
        }
    });

    const [
        deletePayment,
        { loading: loadingNewData, newPaymentData, errorNewData }
    ] = useMutation(DELETE_PAYMENT_DATA, {
        onCompleted: response => {
            setPaymentData(
                response.deletePaymentToken.customerPaymentTokens.items
            );
        }
    });

    if (loadingPaymentData) {
        return LoadingIndicator ? <LoadingIndicator /> : null;
    }

    if (errorPaymentData) {
        return 'data error';
    }

    if (loadingNewData) {
        return LoadingIndicator ? <LoadingIndicator /> : null;
    }

    if (errorNewData) {
        return 'data error';
    }

    return (
        <div className={`saved-cards content-wrapper`}>
            <div className="account-header">
                <h1 className={'my-account__page-title'}>
                    {t('Stored Payment Methods')}
                </h1>
            </div>
            {hasConfirmation && show ? (
                <ModalConfirmation
                    handleClose={handleClose}
                    removeItem={deletePayment}
                    show={show}
                    hashId={hashId}
                />
            ) : null}
            <div className={'table-wrapper'}>
                <table
                    className={`saved-cards-list`}
                    cellSpacing="0"
                    cellPadding="0"
                >
                    <thead>
                        <tr>
                            <th scope="col" className="col numer">
                                {t('Card Number')}
                            </th>
                            <th scope="col" className="col expiration-date">
                                {t('Expiration Date')}
                            </th>
                            <th scope="col" className="col type">
                                {t('Type')}
                            </th>
                            <th scope="col" className="col action">
                                {t('Action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentData != null && paymentData != 0
                            ? paymentData.map((value, index) => {
                                  let cardValue = JSON.parse(value.details);
                                  return (
                                      <tr>
                                          <td data-th={'Card Number'}>
                                              {'ending'} {cardValue.maskedCC}
                                          </td>
                                          <td data-th={'Expiration Date'}>
                                              {cardValue.expirationDate}
                                          </td>
                                          <td data-th={'Type'}>
                                              <FadeIn height={30} duration={50}>
                                                  {onload => (
                                                      <img
                                                          alt={t(
                                                              'Selected payment type'
                                                          )}
                                                          src={require(`./cc_images/${cardValue.type.toLowerCase()}.png`)}
                                                          onLoad={onload}
                                                      />
                                                  )}
                                              </FadeIn>
                                          </td>
                                          <td
                                              data-th={'Action'}
                                              className={'table-actions'}
                                          >
                                              <a
                                                  className="delete-payment"
                                                  onClick={() => {
                                                      hasConfirmation
                                                          ? handleShow(
                                                                value.public_hash
                                                            )
                                                          : deletePayment({
                                                                variables: {
                                                                    public_hash:
                                                                        value.public_hash
                                                                }
                                                            });
                                                  }}
                                              >
                                                  <RemoveIcon
                                                      size={12}
                                                      strokeWidth={3}
                                                      className={'remove-icon'}
                                                  />
                                              </a>
                                          </td>
                                      </tr>
                                  );
                              })
                            : 'You have no stored payment methods.'}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

SavedCards.propTypes = {
    hasConfirmation: bool
};

SavedCards.defaultProps = {
    hasConfirmation: true
};
