import React, { useContext, useEffect, useState, Fragment } from 'react';

export const Policies = props => {
    const { policies, verifyIdme } = props;

    const verifyIdmeButton = props => {
        console.log(props);
        verifyIdme(props);
    };
    return (
        <div>
            <ul style={{ display: 'flex', padding: 5 }}>
                {policies.map(policy => (
                    <li
                        key={policy.name}
                        style={{ display: 'flex', padding: 5 }}
                    >
                        <a
                            onClick={() => verifyIdmeButton(policy)}
                            //href={policy.popup_url}
                            target={'_blank'}
                        >
                            <img
                                style={{ height: 30 }}
                                src={policy.img_src}
                                alt={policy.name}
                            />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default Policies;
