import React, { Fragment, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { string, object, func, bool } from 'prop-types';
import { Form } from 'informed';
import { combine, validateEmail, isRequired } from '@corratech/form-components';
import { Field, TextInput } from '@corratech/form-components';
import { resetPassword, LoaderStore, useSetNotification } from '@corratech/context-provider';
import { ReactGoogleRecaptchaV3 } from "@corratech/google-recaptcha-v3";
import { Alert, Button } from 'react-bootstrap';
import { Check as CheckIcon, X as ErrorIcon } from 'react-feather';
require('./ForgotPasswordForm.less');

export const ForgotPasswordForm = props => {
    const [t] = useTranslation();

    const {
        enteredEmail,
        updateEmail,
        signInClick,
        className,
        css,
        SuccessIcon,
        ErrorIcon
    } = props;

    const LoadingIndicator = useContext(LoaderStore);

    const [loading, setLoading] = useState(false);

    const [showError, setShowError] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    const { setNotification, clearNotification } = useSetNotification();

    const [isCaptchaEnabled, setisCaptchaEnabled] = useState(false);

    const [captchaIsValid, setCaptchaIsValid] = useState(false);
    
    const [captchaInValidMsg, setCaptchaInValidMsg] = useState('Captcha validation error');

    const onValueChange = value => {
        if (updateEmail) updateEmail(value);
    };

    useEffect(() => {
        if (showSuccess && props.onSuccess) {
            props.onSuccess();
        }
    }, [showSuccess]);

    if (loading) {
        return <LoadingIndicator />;
    }

    return (
        <Fragment>
            {props.shouldShowSuccessAlert && showSuccess && (
                <Alert variant={'success'}>
                    {SuccessIcon}
                    {t(props.successTextBeforeEmail)} {enteredEmail}{' '}
                    {t(props.successTextAfterEmail)}
                </Alert>
            )}
            {showError && (
                <Alert variant={'danger'}>
                    {ErrorIcon}
                    <strong>{t(`Error.`)}</strong> {t(`Something went wrong`)}
                </Alert>
            )}
            <div
                aria-labelledby={'account-login-form-heading'}
                className={
                    'account-form-forgot-password account-form-wrapper ' +
                    (className || '')
                }
                css={css}
            >
                <div>
                    <ReactGoogleRecaptchaV3
                        setCaptchaIsValid = {setCaptchaIsValid}
                        recaptchaAction = 'customer_forgot_password'
                        setCaptchaInValidMsg = {setCaptchaInValidMsg}
                        setisCaptchaEnabled = {setisCaptchaEnabled}/>
                </div>
                <Form
                    id="account-login-form-heading"
                    onSubmit={formState => {

                        if (isCaptchaEnabled && !captchaIsValid){
                            setNotification(
                                'danger',
                                t(captchaInValidMsg),
                                10000
                            );
                            return null;
                        }
                        
                        setLoading(true);
                        resetPassword(
                            {
                                email: enteredEmail,
                                template: 'email_reset'
                            },
                            state => {
                                if (state) {
                                    setLoading(false);
                                    setShowSuccess(true);
                                } else {
                                    setLoading(false);
                                    setShowError(true);
                                }
                            }
                        );
                    }}
                >
                    <div id="account-login-form-heading" className={'title'}>
                        {t(props.promptText)}
                    </div>

                    {props.showSubTitle ? (
                        <p className={'sub-title'}>{t(props.subTitleText)}</p>
                    ) : (
                        ''
                    )}

                    <Field
                        label={t(`Email`)}
                        labelText={`email_address`}
                        required={true}
                    >
                        <TextInput
                            type="email"
                            field="email"
                            autoComplete="email"
                            initialValue={enteredEmail}
                            placeholder={t(props.placeholderText)}
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
                            onValueChange={onValueChange}
                        />
                    </Field>
                    <Button type="submit" size="lg" variant="primary" block>
                        {t('Send')}
                    </Button>
                </Form>

                <div className={'signin-link-wrapper'}>
                    {t(props.loginText)}{' '}
                    <Button
                        onClick={signInClick}
                        className={'signin-link'}
                        variant="link"
                    >
                        {t(props.loginButtonText)}
                    </Button>
                </div>
            </div>
        </Fragment>
    );
};

ForgotPasswordForm.propTypes = {
    className: string,
    css: object,
    enteredEmail: string,
    signInClick: func.isRequired,
    updateEmail: func,
    requiredText: string,
    invalidEmailText: string,
    placeholderText: string,
    promptText: string,
    loginText: string,
    successTextBeforeEmail: string,
    successTextAfterEmail: string,
    loginButtonText: string,
    shouldShowSuccessAlert: bool,
    onSuccess: func,
    SuccessIcon: object,
    ErrorIcon: object,
    subTitleText: string
};

ForgotPasswordForm.defaultProps = {
    requiredText: 'This field is required.',
    invalidEmailText: 'Please enter a valid email, such as example@example.com',
    placeholderText: 'We will send you an email to reset your password.',
    promptText: 'Recover your password',
    loginText: 'Oops, I remember now!',
    successTextBeforeEmail: 'If there is an account associated with',
    successTextAfterEmail:
        ' you will receive an email with a link to reset your password.',
    loginButtonText: 'Sign in',
    shouldShowSuccessAlert: true,
    SuccessIcon: <CheckIcon size={14} strokeWidth={'4'} color={'#000'} />,
    ErrorIcon: <ErrorIcon size={14} strokeWidth={'4'} color={'#B70020'} />,
    subTitleText: 'We will send you an email to reset your password.'
};
