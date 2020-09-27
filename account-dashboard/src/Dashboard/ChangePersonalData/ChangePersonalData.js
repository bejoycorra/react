import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Field,
    TextInput,
    isRequired,
    combine
} from '@corratech/form-components';
import PropTypes from 'prop-types';

export const ChangePersonalData = props => {
    const [t] = useTranslation();

    const {
        customer,
        setCustomerFirstname,
        setCustomerMiddlename,
        setCustomerLastname,
        hasMiddleName
    } = props;

    return (
        <div
            className={`change-data-form ${props.className || ''}`}
            css={props.css}
        >
            <Field
                label={t('First Name')}
                labelText={'firstname'}
                required={true}
            >
                <TextInput
                    type={'text'}
                    field="firstname"
                    id={'firstname'}
                    initialValue={customer.firstname}
                    onChange={event => {
                        setCustomerFirstname(event.target.value);
                    }}
                    validate={combine([
                        { fn: isRequired, text: t(props.requiredText) }
                    ])}
                    validateOnBlur
                />
            </Field>
            {hasMiddleName && (
                <Field label={t('Middle Name')} labelText={'middlename'}>
                    <TextInput
                        type={'text'}
                        field="middlename"
                        id={'middlename'}
                        initialValue={customer.middlename}
                        onChange={event => {
                            setCustomerMiddlename(event.target.value);
                        }}
                    />
                </Field>
            )}
            <Field
                label={t('Last Name')}
                labelText={'lastname'}
                required={true}
            >
                <TextInput
                    type={'text'}
                    field="lastname"
                    id={'lastname'}
                    initialValue={customer.lastname}
                    onChange={event => {
                        setCustomerLastname(event.target.value);
                    }}
                    validate={combine([
                        { fn: isRequired, text: t(props.requiredText) }
                    ])}
                    validateOnBlur
                />
            </Field>
        </div>
    );
};

ChangePersonalData.propTypes = {
    customer: PropTypes.object.isRequired,
    setCustomerFirstname: PropTypes.func.isRequired,
    setCustomerMiddlename: PropTypes.func.isRequired,
    setCustomerLastname: PropTypes.func.isRequired
};

ChangePersonalData.defaultProps = {
    hasMiddleName: false,
    requiredText: 'This is required field'
};
