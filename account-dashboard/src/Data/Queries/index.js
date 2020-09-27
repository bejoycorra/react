import gql from 'graphql-tag';

export const requisitionListAvailable = gql`
    query {
        isActiveRequisitionList
    }
`;
