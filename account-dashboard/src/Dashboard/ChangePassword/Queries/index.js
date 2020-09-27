import gql from 'graphql-tag';

export const changeCustomerPassword = gql`
    mutation changeCustomerPassword(
        $currentPassword: String!
        $newPassword: String!
    ) {
        changeCustomerPassword(
            currentPassword: $currentPassword
            newPassword: $newPassword
        ) {
            id
            email
        }
    }
`;
