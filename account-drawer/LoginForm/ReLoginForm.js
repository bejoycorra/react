import {
    AuthStore,
    signIn,
    signOut,
    useGlobalOptions,
    useLoadingIndicator,
    useReAuthentication
} from '@corratech/context-provider';
import {
    combine,
    Field,
    isRequired,
    Message,
    TextInput,
    validateEmail
} from '@corratech/form-components';
import { Form } from 'informed';
import { bool, func, object, string } from 'prop-types';
import React, { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './LoginForm.less';

export const ReLoginForm = ({
    className,
    css,
    requiredText,
    invalidEmailText,
    setShowModal,
    email,
    setEmail,
    setShowForgotPassword,
    setTimeoutStored,
    timeoutStored,
    showKeepMeSignedIn
}) => {
    const [t] = useTranslation();
    const { authState, dispatch } = useContext(AuthStore);
    const [loading, setLoading] = useState(false);
    const LoadingIndicator = useLoadingIndicator();
    const { setExpiry, resetExpiry } = useReAuthentication();
    const [rememberMe, setRememberMe] = useState(false);
    const options = useGlobalOptions();

    const getPersistenceTimeSetting = () => {
        if (options.storeConfig && options.storeConfig.persistent_life_time) {
            return options.storeConfig.persistent_life_time * 1000;
        } else if (
            options['account-drawer'] &&
            options['account-drawer'].persistent_life_time
        ) {
            return options['account-drawer'].persistent_life_time * 1000;
        } else return 3600 * 1000 * 24;
    };

    const onEmailChange = value => {
        setEmail(value);
        hideErrorMessage();
    };

    const hideErrorMessage = () => {
        dispatch({
            type: 'SET_AUTH_ERROR',
            error: null
        });
    };

    const onSubmitHandle = async formState => {
        if (rememberMe === true) {
            setExpiry(getPersistenceTimeSetting());
        } else {
            resetExpiry();
        }
        setLoading(true);
        await signIn({
            credentials: {
                username: formState.email,
                password: formState.password
            },
            dispatch: dispatch,
            setShowModal: setShowModal
        });
        setLoading(false);
    };

    if (loading) return <LoadingIndicator />;

    return (
        <div
            aria-labelledby={'account-login-form-heading'}
            className={
                'account-login-form account-form-wrapper ' + (className || '')
            }
            css={css}
        >
            <Form onSubmit={onSubmitHandle}>
                <Field
                    label={t('Email')}
                    labelText={'email_address'}
                    required={true}
                >
                    <TextInput
                        type="email"
                        field="email"
                        autoComplete="email"
                        placeholder={t(`Please enter your email address`)}
                        id="email_address"
                        aria-required="true"
                        validate={combine([
                            {
                                fn: isRequired,
                                text: t(requiredText)
                            },
                            {
                                fn: validateEmail,
                                text: t(invalidEmailText)
                            }
                        ])}
                        initialValue={email}
                        validateOnBlur
                        onValueChange={onEmailChange}
                    />
                </Field>

                <Field
                    label={t(`Password`)}
                    labelText={`password`}
                    required={true}
                >
                    <TextInput
                        field="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder={t(`Password`)}
                        id="password"
                        aria-required="true"
                        validate={combine([
                            {
                                fn: isRequired,
                                text: t(requiredText)
                            }
                        ])}
                        validateOnChange
                        validateOnBlur
                        autoFocus
                        onValueChange={hideErrorMessage}
                    />
                </Field>

                {showKeepMeSignedIn && (
                    <div className="round">
                        <input
                            type="checkbox"
                            onClick={() => setRememberMe(!rememberMe)}
                            id="checkbox"
                            name="keep_signed_in"
                        />
                        <span className="label-checkbox">
                            {t('Keep me signed in')}
                        </span>
                    </div>
                )}

                {null !== authState.error && (
                    <Message fieldState={{ error: authState.error }} />
                )}

                <div className={'actions-toolbar'}>
                    <Button type="submit" size="lg" variant="primary" block>
                        {t('Sign In')}
                    </Button>

                    <Link
                        title={t('Forgot password?')}
                        to={'#'}
                        onClick={() => setShowForgotPassword(true)}
                        className={'forgot-password-link'}
                    >
                        {t('Forgot password?')}
                    </Link>
                </div>
            </Form>
            <Button
                onClick={() => {
                    if (timeoutStored) {
                        clearTimeout(timeoutStored);
                        setTimeoutStored(null);
                    }
                    setShowModal(false);
                }}
                size="lg"
                variant="link"
                block
            >
                {t('Close and Continue as Guest Customer')}
            </Button>
        </div>
    );
};

ReLoginForm.propTypes = {
    className: string,
    css: object,
    email: string,
    updateEmail: func,
    showLogin: bool,
    requiredText: string,
    invalidEmailText: string,
    showKeepMeSignedIn: bool
};

ReLoginForm.defaultProps = {
    requiredText: 'This field is required.',
    invalidEmailText:
        'Please enter a valid email, such as example@example.com.',
    showKeepMeSignedIn: true
};
