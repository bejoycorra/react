import gql from 'graphql-tag';

export const updateCustomerName = gql`
    mutation updateCustomer(
        $firstname: String!
        $middlename: String
        $lastname: String!
        $email: String
        $password: String
    ) {
        updateCustomer(
            input: {
                firstname: $firstname
                middlename: $middlename
                lastname: $lastname
                email: $email
                password: $password
            }
        ) {
            customer {
                firstname
                middlename
                lastname
                email
            }
        }
    }
`;
