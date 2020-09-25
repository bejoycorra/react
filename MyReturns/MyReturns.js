import React, { useContext, useEffect, useState, Fragment } from 'react';
import { number } from 'prop-types';
import { useLazyQuery } from 'react-apollo';
import { useTitle } from 'react-use';
import { useTranslation } from 'react-i18next';
import { LoaderStore } from '@corratech/context-provider';
import { ReturnsList } from './ReturnsList'; 
import { listReturnsByCustomer } from './Queries/listReturnsByCustomer.graphql';
import { PaginationToolbar } from '../PaginationToolbar';

export const MyReturns = props => {
    const [t] = useTranslation();
    const {
        pageSizeValue,
        warningIco,
        myReturnsTitle
    } = props;
    const [runQuery, queryResponse] = useLazyQuery(listReturnsByCustomer, {
        fetchPolicy: 'no-cache'
    });
    const { loading, error, data } = queryResponse;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [totalCount, setTotalCount] = useState(null);
    const [pageSize, setPageSize] = useState(pageSizeValue);
    const LoadingIndicator = useContext(LoaderStore);

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages,
        pageSize: pageSize,
        setPageSize,
        totalCount: totalCount
    };

    //Update the title
    useTitle(t(`${myReturnsTitle}`));

    useEffect(() => {
        runQuery({
            variables: {
                pageSize: Number(pageSize),
                currentPage: Number(currentPage)
            }
        });
    }, [runQuery, currentPage, pageSize]);

    /**
     * Handle error state
     * set the page to inital value
     */
    useEffect(() => {
        if (error && !loading && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currentPage, error, loading, setCurrentPage]);

    /**
     * When data gets updated
     */
    useEffect(() => {
        if (data) {
            const totalCount = data.listReturnsByCustomer
                ? data.listReturnsByCustomer.total_count
                : 1;
            const totalPageCount = Math.ceil(totalCount / pageSize);

            setTotalCount(totalCount);
            setTotalPages(totalPageCount);
        }
    }, [data, setTotalPages]);

    if (error) return `${t('Error:')} ${error}`;

    const { returns_by_customer } = data ? data.listReturnsByCustomer : [];
    return (
        <div className={props.className} css={props.css}>
            <h1>{t(`${myReturnsTitle}`)}</h1>
            {loading ? (
                <LoadingIndicator />
            ) : (
                <Fragment>
                    <ReturnsList
                       returnItems={returns_by_customer ? returns_by_customer : []}
                       warningIco={warningIco}
                   />
                </Fragment>
            )}
            <PaginationToolbar pageControl={pageControl} />
        </div>
    );
};

MyReturns.propTypes = {
    pageSizeValue: number
};

MyReturns.defaultProps = {
    pageSizeValue: 10
};
