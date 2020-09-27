import gql from 'graphql-tag';

export const deleteCustomerAddress = gql`
    mutation deleteCustomerAddress($id: Int!) {
        deleteCustomerAddress(id: $id)
    }
`;

export const addressList = gql`
    query Customer {
        customer {
            firstname
            lastname
            addresses {
                region {
                    region_code
                    region
                    region_id
                }
                id
                region_id
                country_id
                street
                company
                telephone
                fax
                postcode
                city
                firstname
                lastname
                middlename
                prefix
                suffix
                vat_id
                default_shipping
                default_billing
            }
        }
    }
`;
export const getCountry = gql`
    query {
        countries {
            id
            two_letter_abbreviation
            three_letter_abbreviation
            full_name_locale
            full_name_english
            available_regions {
                id
                code
                name
            }
        }
    }
`;
export const updateCustomerAddress = gql`
    mutation updateCustomerAddress($id: Int!, $input: CustomerAddressInput) {
        updateCustomerAddress(id: $id, input: $input) {
            region {
                region_code
                region
                region_id
            }
            id
            region_id
            country_id
            street
            company
            telephone
            fax
            postcode
            city
            firstname
            lastname
            middlename
            prefix
            suffix
            vat_id
            default_shipping
            default_billing
        }
    }
`;
export const createCustomerAddress = gql`
    mutation createCustomerAddress($input: CustomerAddressInput!) {
        createCustomerAddress(input: $input) {
            region {
                region_code
                region
                region_id
            }
            id
            region_id
            country_id
            street
            company
            telephone
            fax
            postcode
            city
            firstname
            lastname
            middlename
            prefix
            suffix
            vat_id
            default_shipping
            default_billing
        }
    }
`;
