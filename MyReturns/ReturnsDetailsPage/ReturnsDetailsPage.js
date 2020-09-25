import React, { Fragment, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { useWindowSize } from '@magento/peregrine';
import returnDetails from '../Queries/returnDetails.graphql';
import dateFormat from 'dateformat';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoaderStore, useGlobalOptions } from '@corratech/context-provider';
import { ReturnInformation } from './ReturnInformation';
import './ReturnDetailsPage.less';
import { bool } from 'prop-types';

export const ReturnsDetailsPage = props => {
    const { returnId } = useParams();

    const LoadingIndicator = useContext(LoaderStore);

    const [t] = useTranslation();

    const windowSize = useWindowSize();

    const options = useGlobalOptions();

    const isMobile = windowSize.innerWidth <= (options.viewport.mobile || 767);

    const { data, loading, error } = useQuery(returnDetails, {
        fetchPolicy: 'no-cache',
        variables: {
            id: returnId
        }
    });

    if (loading ) return <LoadingIndicator />;

    if (error) return `${t('Error: Something went wrong!')}`;
    
    const returnData = data.returnDetails;
    return (
        <Fragment>
            {returnData && (
                <div className={'return-details-contianer'}>
                    <h1 className="my-account__page-title">
                        {t(`Return # ${returnData.increment_id}`)}
                        <span className="status-badge">{returnData.status}</span>
                    </h1>

                    <div className="return-data-tab my-account__block">
                        <ReturnInformation
                            returnData={returnData}
                        />
                    </div>

                </div>
            )}
        </Fragment>
    );
};
