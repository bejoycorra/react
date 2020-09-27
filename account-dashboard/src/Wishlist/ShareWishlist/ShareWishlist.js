import React, { useContext, useEffect, useState } from 'react';
import {
    combine,
    Field,
    isRequired,
    TextArea,
    emailsSeparatedByComas
} from '@corratech/form-components';
import { useTranslation } from 'react-i18next';
import { Form } from 'informed';
import { Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { shareWishlist as shareWishlistQuery } from './Queries';
import { useMutation } from 'react-apollo';
import { LoaderStore } from '@corratech/context-provider';
import PropTypes from 'prop-types';
import { Check as CheckIcon } from 'react-feather';
import { useTitle } from 'react-use';

export const ShareWishlist = props => {
    const [t] = useTranslation();

    const [shareWishlist, { loading, error }] = useMutation(shareWishlistQuery);
    const [successMessage, setSuccessMessage] = useState(false);

    const LoadingIndicator = useContext(LoaderStore);

    useTitle(t('Wishlist Sharing'));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async formState => {
        setSuccessMessage(false);
        shareWishlist({
            variables: {
                wishlistId,
                emails: formState.share_wishlist_emails,
                message: formState.share_wishlist_message || ''
            }
        }).then(res => {
            if (res.data.shareWishlist.messages) {
                setSuccessMessage(res.data.shareWishlist.messages);
            }
        });
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) return <p>{t(props.alertError)}</p>;

    const { id: wishlistId } = useParams();

    return (
        <div className={'share-wishlist'}>
            <h1>{t(props.pageTitle)}</h1>
            <h3>{t(props.formTitle)}</h3>
            {successMessage ? (
                <Alert variant={'success'}>
                    {props.successIcon ? (
                        props.successIcon
                    ) : (
                        <CheckIcon size="14" strokeWidth={'4'} color={'#000'} />
                    )}
                    {t(props.alertSuccess)}
                </Alert>
            ) : (
                ''
            )}

            <Form onSubmit={handleSubmit}>
                <Field
                    label={t(props.emailFieldLabel)}
                    labelText="share_wishlist_emails"
                    required={true}
                >
                    <TextArea
                        field="share_wishlist_emails"
                        id="share_wishlist_emails"
                        autoFocus
                        validate={combine([
                            {
                                fn: isRequired,
                                text: t(props.requiredText)
                            },
                            {
                                fn: emailsSeparatedByComas,
                                text: t(props.emailFieldError)
                            }
                        ])}
                        validateOnBlur
                    />
                </Field>
                {props.showMessageField ? (
                    <Field
                        label={t('Message')}
                        labelText="share_wishlist_message"
                    >
                        <TextArea
                            field="share_wishlist_message"
                            id="share_wishlist_message"
                        />
                    </Field>
                ) : (
                    ''
                )}
                <Button
                    type={'submit'}
                    variant={'primary'}
                    size={'lg'}
                    title={t(props.buttonTitle)}
                >
                    {t(props.buttonTitle)}
                </Button>
            </Form>
        </div>
    );
};

ShareWishlist.propTypes = {
    pageTitle: PropTypes.string,
    requiredText: PropTypes.string,
    formTitle: PropTypes.string,
    alertError: PropTypes.string,
    alertSuccess: PropTypes.string,
    emailFieldLabel: PropTypes.string,
    emailFieldError: PropTypes.string,
    buttonTitle: PropTypes.string,
    showMessageField: PropTypes.bool
};

ShareWishlist.defaultProps = {
    pageTitle: 'Wishlist Sharing',
    requiredText: 'This is a required field.',
    formTitle: 'Sharing Information',
    alertError: 'Error while sharing your wishlist. Please try again.',
    alertSuccess: 'Wishlist was successfully shared!',
    emailFieldLabel: 'Email addresses, separated by commas',
    emailFieldError:
        'Please enter valid email addresses, separated by commas. For example, johndoe@domain.com, johnsmith@domain.com.',
    buttonTitle: 'Share Wishlist',
    showMessageField: true
};
