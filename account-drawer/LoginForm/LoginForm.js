import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { string, object, func, bool } from 'prop-types';
import {
    AuthStore,
    LoaderStore,
    signIn,
    useGlobalOptions
} from '@corratech/context-provider';
import { Form } from 'informed';
import {
    combine,
    isRequired,
    Message,
    validateEmail
} from '@corratech/form-components';
import { Field, TextInput } from '@corratech/form-components';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useQuery } from 'react-apollo';
import isEmailAvailable from './Queries/isEmailAvailable.graphql';
import { Button } from 'react-bootstrap';
import './LoginForm.less';
import { Eye, EyeOff } from 'react-feather';
import { useReAuthentication } from '@corratech/context-provider';

export const LoginForm = props => {
    const [t] = useTranslation();

    const {
        updateEmail,
        enteredEmail,
        forgotPasswordClick,
        showLogin,
        setEmailAvailable,
        className,
        css,
        showKeepMeSignedIn,
        EyeIcon,
        EyeOffIcon
    } = props;

    const { authState, dispatch } = useContext(AuthStore);

    const LoadingIndicator = useContext(LoaderStore);

    const [loading, setLoading] = useState(false);

    const [
        checkIsEmailAvailable,
        { loading: loadingCheckIsEmailAvailable, error }
    ] = useLazyQuery(isEmailAvailable, {
        fetchPolicy: 'no-cache',
        onCompleted: ({ isEmailAvailable }) => {
            setEmailAvailable({
                status: isEmailAvailable.is_email_available
            });
        }
    });

    const { setExpiry, resetExpiry } = useReAuthentication();

    const onEmailChange = value => {
        if (updateEmail) updateEmail(value);
        hideErrorMessage();
    };

    const hideErrorMessage = () => {
        dispatch({
            type: 'SET_AUTH_ERROR',
            error: null
        });
    };

    const [togglePassword, setTogglePassword] = useState(false);

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

    const onSubmitHandle = async formState => {
        if (showLogin) {
            if (rememberMe === true) {
                setExpiry(getPersistenceTimeSetting());
            } else {
                resetExpiry();
            }
            try {
                setLoading(true);
                await signIn({
                    credentials: {
                        username: formState.email,
                        password: formState.password
                    },
                    dispatch: dispatch
                });
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        } else {
            updateEmail(formState.email);
            await checkIsEmailAvailable({
                variables: {
                    email: formState.email
                }
            });
        }
    };

    if (loadingCheckIsEmailAvailable || loading) {
        return <LoadingIndicator />;
    }

    return (
        <div
            aria-labelledby={'account-login-form-heading'}
            className={
                'account-login-form account-form-wrapper ' + (className || '')
            }
            css={css}
        >
            {showLogin && (
                <div
                    id="account-login-form-heading"
                    className={'customer exist'}
                >
                    {t('You already have an account with us.')}
                </div>
            )}
            <Form onSubmit={onSubmitHandle}>
                <Field
                    label={t(`Email`)}
                    labelText={`email_address`}
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
                                text: t(props.requiredText)
                            },
                            {
                                fn: validateEmail,
                                text: t(props.invalidEmailText)
                            }
                        ])}
                        initialValue={enteredEmail}
                        validateOnBlur
                        onValueChange={onEmailChange}
                    />
                </Field>
                {showLogin && (
                    <Field
                        label={t(`Password`)}
                        labelText={`password`}
                        required={true}
                    >
                        <TextInput
                            field="password"
                            type={togglePassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder={t(`Password`)}
                            id="password"
                            aria-required="true"
                            validate={combine([
                                {
                                    fn: isRequired,
                                    text: t(props.requiredText)
                                }
                            ])}
                            validateOnChange
                            autoFocus
                            onValueChange={hideErrorMessage}
                        />
                        <a
                            className="password-eye"
                            onClick={() => setTogglePassword(!togglePassword)}
                        >
                            {togglePassword ? EyeOffIcon : EyeIcon}
                        </a>
                    </Field>
                )}
                {showLogin && showKeepMeSignedIn && (
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
                        {showLogin ? t('Sign In') : t('Continue')}
                    </Button>

                    {showLogin && (
                        <Link
                            title={t(`Forgot password?`)}
                            to={'#'}
                            onClick={forgotPasswordClick}
                            className={'forgot-password-link'}
                        >
                            {t(`Forgot password?`)}
                        </Link>
                    )}
                </div>
            </Form>
        </div>
    );
};

LoginForm.propTypes = {
    className: string,
    css: object,
    enteredEmail: string,
    updateEmail: func,
    showLogin: bool,
    requiredText: string,
    invalidEmailText: string
};

LoginForm.defaultProps = {
    requiredText: 'This field is required.',
    invalidEmailText:
        'Please enter a valid email, such as example@example.com.',
    EyeIcon: <Eye size="24" />,
    EyeOffIcon: <EyeOff size="24" />
};
