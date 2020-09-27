import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { RenderApolloError } from '@corratech/render-apollo-error';
import {
    Field,
    TextInput,
    isRequired,
    combine,
    validateConfirmPassword,
    validateEmail
} from '@corratech/form-components';
import { PasswordField } from '@corratech/password-field';
import { useMutation } from 'react-apollo';
import { Button } from 'react-bootstrap';
import './ChangePassword.less';
import { changeCustomerPassword as changePasswordQuery } from './Queries';

export const ChangePassword = props => {
    const [t] = useTranslation();

    const { passwordRequirements, separatedForm, email, callbacks } = props;

    const [
        changeCustomerPassword,
        { data: changePasswordData, error: changePasswordError }
    ] = useMutation(changePasswordQuery);

    const [isChangingPassword, setIsChangingPassword] = useState(false),
        [oldPassword, setOldPassword] = useState(''),
        [newPassword, setNewPassword] = useState(''),
        [confirmPassword, setConfirmPassword] = useState(''),
        [passwordIsValid, setPasswordIsValid] = useState(false);

    const changePassword = (oldPassword, newPassword) => {
        changeCustomerPassword({
            variables: {
                currentPassword: oldPassword,
                newPassword
            }
        });
    };

    const passwordsEntered = () => {
        return (
            !!oldPassword &&
            !!newPassword &&
            !!confirmPassword &&
            newPassword !== '' &&
            confirmPassword !== '' &&
            oldPassword !== ''
        );
    };

    const changePasswordComponent = separatedForm ? (
        <div
            className={`change-password-form ${props.className || ''}`}
            css={props.css}
        >
            {!isChangingPassword ? (
                <Button
                    size="lg"
                    variant="primary"
                    onClick={() => setIsChangingPassword(true)}
                >
                    {t('Change Password')}
                </Button>
            ) : (
                <form
                    onSubmit={event => {
                        event.preventDefault();
                        changePassword(oldPassword, newPassword);
                        setIsChangingPassword(false);
                    }}
                >
                    <Button
                        onClick={() => setIsChangingPassword(false)}
                        size="lg"
                        variant="primary"
                    >
                        {t('Cancel')}
                    </Button>
                    <Field
                        label={t('Current Password')}
                        labelText={'currentpassword'}
                    >
                        <TextInput
                            type={'password'}
                            field="currentpassword"
                            id="currentpassword"
                            validate={combine([
                                { fn: isRequired, text: t(props.requiredText) }
                            ])}
                            validateOnBlur
                            onChange={event =>
                                setOldPassword(event.target.value)
                            }
                        />
                    </Field>
                    <PasswordField
                        {...passwordRequirements}
                        changeCallback={data => {
                            setNewPassword(data.password);
                            setPasswordIsValid(data.isValid);
                        }}
                        inputProps={{
                            name: 'newpassword',
                            autoComplete: 'off'
                        }}
                        placeHolderText={t('New Password')}
                    />
                    <Field
                        label={t('Confirm New Password')}
                        labelText={'confirmpassword'}
                    >
                        <TextInput
                            type={'password'}
                            field="confirmpassword"
                            id={'confirmpassword'}
                            validate={combine([
                                { fn: isRequired, text: t(props.requiredText) }
                            ])}
                            validateOnBlur
                            onChange={event =>
                                setConfirmPassword(event.target.value)
                            }
                        />
                    </Field>
                    {passwordsEntered() && newPassword !== confirmPassword ? (
                        <div className={'message-root'}>
                            <span className={'root_error'}>
                                {t('Please enter the same value again.')}
                            </span>
                        </div>
                    ) : null}
                    <Button
                        size="lg"
                        variant="primary"
                        disabled={
                            !(
                                passwordsEntered() &&
                                newPassword === confirmPassword &&
                                passwordIsValid
                            )
                        }
                        type="submit"
                    >
                        {t('Submit')}
                    </Button>
                </form>
            )}
            {changePasswordError ? (
                <>
                    <RenderApolloError error={changePasswordError} />
                </>
            ) : null}
            {changePasswordData && !changePasswordError ? (
                <>
                    <span className={'success'}>
                        {t('You successfully changed your password!')}
                    </span>
                </>
            ) : null}
        </div>
    ) : (
        <div
            className={`change-password-form ${props.className || ''}`}
            css={props.css}
        >
            {props.openEmailChangeForm && (
                <Field label={t('Email')} labelText={'email'} required={true}>
                    <TextInput
                        type={'email'}
                        id={'email'}
                        field="email"
                        initialValue={email}
                        validate={combine([
                            { fn: isRequired, text: t(props.requiredText) },
                            {
                                fn: validateEmail,
                                text: t(props.invalidEmailText)
                            }
                        ])}
                        validateOnBlur
                        onChange={event => {
                            callbacks['setEmailAddress'](event.target.value);
                        }}
                    />
                </Field>
            )}
            <Field
                label={t('Current Password')}
                labelText={'currentpassword'}
                required={true}
            >
                <TextInput
                    type={'password'}
                    id={'currentpassword'}
                    field="currentpassword"
                    validate={combine([
                        { fn: isRequired, text: t(props.requiredText) }
                    ])}
                    validateOnBlur
                    onChange={event => {
                        setOldPassword(event.target.value);
                        callbacks['setOldPassword'](event.target.value);
                    }}
                />
            </Field>
            {props.openPasswordForm && (
                <Fragment>
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
                            callbacks['setNewPassword'](data.password);
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
                        placeHolderText={`New Password`}
                        requiredText={t(`This is a required field`)}
                    />
                    <Field
                        label={t('Confirm New Password')}
                        labelText={'confirmpassword'}
                        required={true}
                    >
                        <TextInput
                            type={'password'}
                            field="confirm"
                            id={'confirm_password'}
                            validate={combine([
                                { fn: isRequired, text: t(props.requiredText) },
                                {
                                    fn: validateConfirmPassword,
                                    text: t(props.passwordsMustMatchText)
                                }
                            ])}
                            validateOnBlur
                            validateOnChange
                            onChange={event => {
                                setConfirmPassword(event.target.value);
                                callbacks['setConfirmPassword'](
                                    event.target.value
                                );
                            }}
                        />
                    </Field>

                    <div className={'change-password-note'}>
                        {newPassword !== confirmPassword &&
                        newPassword !== '' &&
                        confirmPassword !== '' ? (
                            <div className={'message-root'}>
                                <span className={'root_error'}>
                                    {t('Please enter the same value again.')}
                                </span>
                            </div>
                        ) : null}
                    </div>
                </Fragment>
            )}
        </div>
    );

    return changePasswordComponent;
};

ChangePassword.propTypes = {
    passwordRequirements: PropTypes.object.isRequired,
    separatedForm: PropTypes.bool,
    email: PropTypes.string,
    callbacks: PropTypes.shape({
        setPasswordIsStrong: PropTypes.func,
        setOldPassword: PropTypes.func,
        setNewPassword: PropTypes.func,
        setConfirmPassword: PropTypes.func,
        setEmailAddress: PropTypes.func
    }),
    requiredText: PropTypes.string,
    passwordsMustMatchText: PropTypes.string,
    invalidEmailText: PropTypes.string
};

ChangePassword.defaultProps = {
    separatedForm: true,
    email: '',
    callbacks: {
        setPasswordIsStrong: () => {},
        setOldPassword: () => {},
        setNewPassword: () => {},
        setConfirmPassword: () => {},
        setEmailAddress: () => {}
    },
    requiredText: 'This is a required field',
    passwordsMustMatchText: 'Passwords must match',
    invalidEmailText: 'Please enter a valid email, such as example@example.com'
};
