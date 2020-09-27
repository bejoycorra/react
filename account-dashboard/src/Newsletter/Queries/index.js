import gql from 'graphql-tag';

export const newsletterMutation = gql`
    mutation updateCustomer($is_subscribed: Boolean!) {
        updateCustomer(input: { is_subscribed: $is_subscribed }) {
            customer {
                is_subscribed
            }
        }
    }
`;
