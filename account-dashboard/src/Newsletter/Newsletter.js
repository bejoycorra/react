import React, { useState, useContext, Fragment, useEffect } from 'react';
import getCustomer from './Queries/getCustomer.graphql';
import updateCustomer from './Queries/updateCustomer.graphql';
import { useQuery, useMutation } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import { LoaderStore } from '@corratech/context-provider';
import { useTitle } from 'react-use';
import { Checkbox } from '@corratech/form-components';
import { Form } from 'informed';
import { AlertContext } from '../Data/Context/AlertProvider';

export const Newsletter = props => {
    const { state, addMessage } = useContext(AlertContext);
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);
    const [hasSubscribed, setHasSubscribed] = useState(false);

    //Update the title
    useTitle(t(props.newsletterTitle));

    const { data, loading, error } = useQuery(getCustomer, {
        fetchPolicy: 'no-cache'
    });

    useEffect(() => {
        if (data) setHasSubscribed(data.customer.is_subscribed);
    }, [data]);

    const [updateNewsletter, { loading: loadingMutation }] = useMutation(
        updateCustomer,
        {
            onCompleted: data => {
                let is_subscribed = data.updateCustomer.customer.is_subscribed;

                addMessage({
                    message:
                        is_subscribed || (!is_subscribed && !hasSubscribed)
                            ? t('We have updated your subscription.')
                            : t(
                                  'We have removed your newsletter subscription.'
                              ),
                    type: 'success'
                });
            },
            onError: error => {
                addMessage({
                    message: t('Something went wrong'),
                    type: 'danger'
                });
            }
        }
    );

    const handleSubmit = async is_subscribed => {
        await updateNewsletter({ variables: { is_subscribed: is_subscribed } });
    };

    if (loading) return <LoadingIndicator />;
    if (error) return `Error: ${error ? error : ''}`;

    return (
        <div
            className={`content-wrapper MyAccountWrapper ${props.className ||
                ''}`}
            css={props.css}
        >
            <div className={'content-wrapper MyAccountWrapper'}>
                <h1 className={'my-account__page-title'}>
                    {t(props.newsletterTitle)}
                </h1>
                <Form
                    render={({ formApi }) => (
                        <Fragment>
                            <div className={'form-field my-account__block'}>
                                <Checkbox
                                    field="newsletter-subscription"
                                    label={
                                        <span>
                                            {t('Newsletter Subscription')}
                                        </span>
                                    }
                                    initialValue={data.customer.is_subscribed}
                                />
                            </div>
                            <div className={'form-field'}>
                                <Button
                                    type={'submit'}
                                    className={'form-button'}
                                    disabled={loadingMutation}
                                    onClick={() =>
                                        handleSubmit(
                                            formApi.getValue(
                                                'newsletter-subscription'
                                            )
                                        )
                                    }
                                >
                                    {loadingMutation ? t('Saving') : t('Save')}
                                </Button>
                            </div>
                        </Fragment>
                    )}
                />
            </div>
        </div>
    );
};
