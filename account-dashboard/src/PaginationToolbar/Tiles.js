import React, { useCallback } from 'react';
import { bool, number, func } from 'prop-types';
import Pagination from 'react-bootstrap/Pagination';

export const Tiles = props => {
    const { isActive, number, onClick } = props;

    const handleClick = useCallback(() => onClick(number), [onClick, number]);

    return (
        <Pagination.Item onClick={handleClick} active={isActive}>
            {number}
        </Pagination.Item>
    );
};

Tiles.propTypes = {
    isActive: bool,
    number: number,
    onClick: func
};
