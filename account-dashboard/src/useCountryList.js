import { useEffect, useMemo } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { Util } from '@magento/peregrine';

const { BrowserPersistence } = Util;
const storage = new BrowserPersistence();

export const useCountryList = props => {
    const { query, id, callback } = props;
    const storedCountryList = storage.getItem('country_list');
    const [runQuery, queryResult] = useLazyQuery(query);
    const { data, loading, error } = queryResult;

    useEffect(() => {
        if (!storedCountryList) {
            runQuery();
        }
    }, [runQuery]);

    useEffect(() => {
        if (data && data.countries) {
            storage.setItem('country_list', data);
            if (callback) {
                callback(data);
            }
        }
    }, [data]);

    const getList = () => {
        return (
            storage.getItem('country_list') &&
            storage.getItem('country_list').countries
        );
    };

    const getCountries = () => {
        if (id) {
            return (
                getList() &&
                getList().filter(value => {
                    return String(value.id) === String(id);
                })
            );
        }

        return getList();
    };

    let countries;
    if (loading) countries = 'Loading';
    else if (error) countries = null;
    else countries = getCountries();

    return {
        loading,
        error,
        countries
    };
};
