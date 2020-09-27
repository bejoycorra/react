import React, { Fragment, useMemo, useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { usePagination } from '@magento/peregrine/lib/talons/Pagination/usePagination';
import { Tiles } from './Tiles';
import { ItemsCount } from './ItemsCount';
import { DropDownLimit } from './DropDownLimit';
import './PaginationToolbarStyle.less';

export const PaginationToolbar = props => {
    const {
        currentPage,
        setPage,
        totalPages,
        pageSize,
        totalCount
    } = props.pageControl;

    const talonProps = usePagination({
        currentPage,
        setPage,
        totalPages
    });

    const {
        handleLeftSkip,
        handleRightSkip,
        handleNavBack,
        handleNavForward,
        isActiveLeft,
        isActiveRight,
        tiles
    } = talonProps;

    const navigationTiles = useMemo(
        () =>
            tiles.map(tileNumber => {
                return (
                    <Tiles
                        isActive={tileNumber === currentPage}
                        key={tileNumber}
                        number={tileNumber}
                        onClick={setPage}
                    />
                );
            }),
        [currentPage, tiles, setPage]
    );

    if (!totalCount) return null;

    return (
        <div className="pagination-toolbar">
            {props.showToolbar && (
                <ItemsCount
                    talonProps={talonProps}
                    pageControl={props.pageControl}
                />
            )}
            {totalPages > 1 && (
                <Pagination>
                    {isActiveLeft && (
                        <Pagination.Prev
                            onClick={handleNavBack}
                            className="previous"
                        >
                            <ChevronLeft size="20" />
                        </Pagination.Prev>
                    )}
                    {navigationTiles}
                    {isActiveRight && (
                        <Pagination.Next
                            onClick={handleNavForward}
                            className="next"
                        >
                            <ChevronRight size="20" />
                        </Pagination.Next>
                    )}
                </Pagination>
            )}
            {props.showToolbar && (
                <DropDownLimit
                    setPageSize={props.pageControl.setPageSize}
                    pageSize={pageSize}
                    setPage={setPage}
                    ItemsToShow={props.ItemsToShow}
                />
            )}
        </div>
    );
};

PaginationToolbar.defaultProps = {
    ItemsToShow: [
        {
            label: '10',
            value: 10
        },
        {
            label: '20',
            value: 20
        },
        {
            label: '50',
            value: 50
        }
    ],
    showToolbar: true
};
