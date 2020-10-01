import React, { useContext, useState } from 'react';
import { string, object, func, bool } from 'prop-types';
import { Form } from 'informed';
import { Field, TextInput, Checkbox } from '@corratech/form-components';
import {
    combine,
    validateEmail,
    validateConfirmPassword,
    isRequired
} from '@corratech/form-components';
import { PasswordField } from '@corratech/password-field';
import {
    AuthStore,
    createUser,
    LoaderStore,
    useSetNotification
} from '@corratech/context-provider';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';

import { ReactGoogleRecaptchaV3 } from "@corratech/google-recaptcha-v3";
require('./RegisterForm.less');

export const RegisterForm = props => {
    const [t] = useTranslation();

    const {
        className,
        css,
        enteredEmail,
        updateEmail,
        termsAndConditionsHandle,
        newsletterSubscriptionHandle,
        setIsOpenSidebar
    } = props;

    const { dispatch } = useContext(AuthStore);

    const LoadingIndicator = useContext(LoaderStore);

    const [isCaptchaEnabled, setisCaptchaEnabled] = useState(false);

    const [captchaIsValid, setCaptchaIsValid] = useState(false);
    
    const [captchaInValidMsg, setCaptchaInValidMsg] = useState('Captcha validation error');

    const [password, setPassword] = useState('');

    const [passwordIsValid, setPasswordIsValid] = useState(false);

    const [loading, setLoading] = useState(false);

    const { setNotification, clearNotification } = useSetNotification();

    const onEmailChange = value => {
        updateEmail(value);
    };
    const handleSubmit = formState => {

        if (isCaptchaEnabled && !captchaIsValid){
            setNotification(
                'danger',
                t(captchaInValidMsg),
                1000000
            );
            return null;
        }
        if (!passwordIsValid) {
            return null;
        }

        formState.password = password;
        formState.extension_attributes = {
            is_subscribed: formState.newsletter
        };
        delete formState.newsletter;

        setLoading(true);

        createUser(
            {
                accountInfo: formState,
                dispatch: dispatch
            },
            (state, errorMessage) => {
                if (state) {
                    setNotification(
                        'success',
                        t('Thank you for registering'),
                        1000000
                    );
                } else {
                    setNotification(
                        'danger',
                        t(errorMessage),
                        3600 * 1000 * 24
                    );
                    setLoading(false);
                }
            }
        );
    };

    const termsAndConditionsClick = () => {
        termsAndConditionsHandle();
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    return (
        <div
            aria-labelledby={'account-register-form-heading'}
            className={
                'account-register-form account-form-wrapper ' +
                (className || '')
            }
            css={css}
        >
            <div className={'title'}>
                {t('Please register by completing the form below.')}
            </div>
            <div>
                <ReactGoogleRecaptchaV3
                    setCaptchaIsValid = {setCaptchaIsValid}
                    recaptchaAction = 'customer_create'
                    setCaptchaInValidMsg = {setCaptchaInValidMsg}
                    setisCaptchaEnabled = {setisCaptchaEnabled}/>
            </div>
            <Form onSubmit={handleSubmit}>
                <Field
                    label={t(`Email`)}
                    labelText={`email_address`}
                    required={true}
                >
                    <TextInput
                        field="email"
                        type="email"
                        autoComplete="off"
                        placeholder={t(`Email`)}
                        initialValue={enteredEmail}
                        id="email_address"
                        aria-required="true"
                        validate={combine([
                            {
                                fn: isRequired,
                                text: t(props.requiredText)
                            },
                            {
                                fn: validateEmail,
                                text: t(props.invalidEmailText)
                            }
                        ])}
                        validateOnBlur
                        onValueChange={onEmailChange}
                    />
                </Field>
                <Field
                    label={t(`First Name`)}
                    labelText={`first_name`}
                    required={true}
                >
                    <TextInput
                        field="firstname"
                        type="text"
                        autoComplete="given-name"
                        placeholder={t(`First Name`)}
                        id="first_name"
                        aria-required="true"
                        validate={combine([
                            {
                                fn: isRequired,
                                text: t(props.requiredText)
                            }
                        ])}
                        validateOnBlur
                    />
                </Field>
                <Field
                    label={t(`Last Name`)}
                    labelText={`last_name`}
                    required={true}
                >
                    <TextInput
                        field="lastname"
                        type="text"
                        autoComplete="family-name"
                        placeholder={t(`Last Name`)}
                        id="last_name"
                        aria-required="true"
                        validate={combine([
                            {
                                fn: isRequired,
                                text: t(props.requiredText)
                            }
                        ])}
                        validateOnBlur
                    />
                </Field>
                <PasswordField
                    className={'input-password-wrapper'}
                    {...{
                        minLength: 8,
                        minScore: 2,
                        validate: {
                            isRequired: true,
                            validatePassword: true
                        }
                    }}
                    changeCallback={data => {
                        setPasswordIsValid(data.isValid);
                        setPassword(data.password);
                    }}
                    inputProps={{
                        name: 'password',
                        autoComplete: 'off',
                        placeholder: t(`Password`),
                        className: 'input-password'
                    }}
                    validatePasswordText={t(
                        'A password must contain at least 3 of the following: lowercase, uppercase, digits, special characters.'
                    )}
                />
                <Field
                    label={t(`Confirm Password`)}
                    labelText={`confirm_password`}
                    required={true}
                >
                    <TextInput
                        field="confirm"
                        type="password"
                        placeholder={t(`Confirm Password`)}
                        id="confirm_password"
                        aria-required="true"
                        validate={combine([
                            {
                                fn: isRequired,
                                text: t(props.requiredText)
                            },
                            {
                                fn: validateConfirmPassword,
                                text: t(props.passwordsMustMatchText)
                            }
                        ])}
                        validateOnChange
                        validateOnBlur
                    />
                </Field>

                {newsletterSubscriptionHandle && (
                    <Checkbox
                        field="newsletter"
                        label={<span>{t('Newsletter Subscription')}</span>}
                        initialValue={false}
                    />
                )}

                <Button type="submit" size="lg" variant="primary" block>
                    {t(props.submitButtonText)}
                </Button>
            </Form>

            {!!termsAndConditionsHandle && (
                <div className={'terms-conditions-link-wrapper'}>
                    {t(`By clicking on Create Account, you accept our`)}{' '}
                    <Button
                        className={'terms-conditions-link'}
                        variant="link"
                        onClick={() => {
                            termsAndConditionsClick();
                            setIsOpenSidebar(false);
                        }}
                    >
                        {t(`Terms & Conditions`)}
                    </Button>
                </div>
            )}
        </div>
    );
};

RegisterForm.propTypes = {
    className: string,
    css: object,
    enteredEmail: string,
    updateEmail: func.isRequired,
    requiredText: string,
    invalidEmailText: string,
    termsAndConditionsHandle: func,
    newsletterSubscriptionHandle: bool
};

RegisterForm.defaultProps = {
    requiredText: 'This field is required.',
    passwordsMustMatchText: 'Passwords must match.',
    invalidEmailText:
        'Please enter a valid email, such as example@example.com.',
    newsletterSubscriptionHandle: false
};
