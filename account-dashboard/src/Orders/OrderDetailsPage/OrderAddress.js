import React, { Fragment } from 'react';

export const OrderAddress = props => {
    const { addresses, countries = [] } = props;

    const getCountries = id => {
        return countries.filter(value => {
            return String(value.id) === String(id);
        });
    };

    return (
        <Fragment>
            {addresses &&
                addresses.map((address, key) => (
                    <div className="order-address__block" key={key}>
                        <p>{address.name}</p>
                        {address.company && <p>{address.company}</p>}
                        <p>{`${address.street}, ${address.region}`}</p>
                        <p>{address.postcode}</p>
                        <p>
                            {
                                getCountries(address.country_id)[0]
                                    .full_name_locale
                            }
                        </p>
                        <a
                            href={`tel:${address.telephone}`}
                        >{`T: ${address.telephone}`}</a>
                    </div>
                ))}
        </Fragment>
    );
};
