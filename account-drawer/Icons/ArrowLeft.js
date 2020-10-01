import React from 'react';
import { string, number, oneOfType } from 'prop-types';

export const ArrowLeft = props => {
    const { color, size, ...otherProps } = props;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g
                id="arrow-left"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeWidth="2px"
            >
                <line x1="3" x2="29" y1="16" y2="16" />
                <line x1="3" x2="7" y1="16" y2="11" />
                <line x1="3" x2="7" y1="16" y2="21" />
            </g>
        </svg>
    );
};

ArrowLeft.propTypes = {
    color: string,
    size: oneOfType([string, number])
};

ArrowLeft.defaultProps = {
    color: '#000000',
    size: '22'
};
