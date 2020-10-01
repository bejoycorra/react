import React, { useContext, useState } from 'react';
import { string, object } from 'prop-types';
import { Form } from 'informed';
import {
    Field,
    TextInput,
    validateConfirmPassword
} from '@corratech/form-components';
import { combine, isRequired } from '@corratech/form-components';
import { PasswordField } from '@corratech/password-field';
import { changePassword, LoaderStore } from '@corratech/context-provider';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from 'react-bootstrap';
import { Check as CheckIcon, X as ErrorIcon } from 'react-feather';
require('./ResetPasswordForm.less');

export const ResetPasswordForm = props => {
    const [t] = useTranslation();

    const {
        className,
        css,
        enteredEmail,
        resetToken,
        SuccessIcon,
        ErrorIcon
    } = props;

    const LoadingIndicator = useContext(LoaderStore);

    const [password, setPassword] = useState('');

    const [passwordIsValid, setPasswordIsValid] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    const [showError, setShowError] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async formState => {
        formState.password = password;

        try {
            setLoading(true);

            await changePassword(
                {
                    email: enteredEmail,
                    resetToken: resetToken,
                    newPassword: password
                },
                (state, errorMessage) => {
                    state ? setShowSuccess(true) : setShowError(errorMessage);
                    setLoading(false);
                }
            );
        } catch (error) {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <Alert variant={'success'}>
                {SuccessIcon}
                {t(props.successText)}
            </Alert>
        );
    }

    if (showError) {
        return (
            <Alert variant={'danger'}>
                {ErrorIcon}
                <strong>{t(`Error.`)}</strong> {showError}
            </Alert>
        );
    }

    if (loading) {
        return <LoadingIndicator />;
    }

    return (
        <div
            aria-labelledby={'account-reset-password-heading'}
            className={
                'account-reset-form account-form-wrapper ' + (className || '')
            }
            css={css}
        >
            <div id="account-reset-password-heading" className={'title'}>
                {t(props.title)}
            </div>

            <p className={'sub-title'}>{t(props.subtitle)}</p>

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
                        id="email_address"
                        aria-required="true"
                        initialValue={enteredEmail}
                        disabled
                    />
                </Field>
                <PasswordField
                    className={'input-password-wrapper'}
                    {...props.passwordRequirements}
                    changeCallback={data => {
                        setPassword(data.password);
                        setPasswordIsValid(data.isValid);
                    }}
                    inputProps={{
                        name: 'password',
                        autoComplete: 'off',
                        placeholder: t(`Password`),
                        className: 'input-password'
                    }}
                    validatePasswordText={t(props.validatePasswordText)}
                />
                <div className={'confirm-reset-password'}>
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
                </div>

                <Button type="submit" size="lg" variant="primary" block>
                    {t(props.changePasswordButtonText)}
                </Button>
            </Form>
        </div>
    );
};

ResetPasswordForm.propTypes = {
    className: string,
    css: object,
    resetToken: string,
    enteredEmail: string,
    requiredText: string,
    successText: string,
    title: string,
    subtitle: string,
    validatePasswordText: string,
    changePasswordButtonText: string,
    passwordRequirements: object,
    SuccessIcon: object,
    ErrorIcon: object
};

ResetPasswordForm.defaultProps = {
    requiredText: 'This field is required.',
    successText: 'Password Successfully Reset',
    title: 'Reset Password',
    subtitle: 'Reset your password below.',
    validatePasswordText:
        'A password must contain at least 3 of the following: lowercase, uppercase, digits, special characters.',
    changePasswordButtonText: 'Change Password',
    passwordRequirements: {
        minLength: 8,
        minScore: 2,
        validate: {
            isRequired: true,
            validatePassword: true
        }
    },
    SuccessIcon: <CheckIcon size={14} strokeWidth={'4'} color={'#000'} />,
    ErrorIcon: <ErrorIcon size={14} strokeWidth={'4'} color={'#B70020'} />,
    passwordsMustMatchText: 'Passwords must match.'
};
