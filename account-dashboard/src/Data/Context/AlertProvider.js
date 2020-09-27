import React, {
    createContext,
    useReducer,
    useCallback,
    useEffect
} from 'react';
import { useHistory } from 'react-router-dom';

//Setting inital state for Message
const initialState = {
    message: null,
    type: 'success',
    presist: false
};

export const AlertContext = React.createContext(initialState);

const ADD_MESSAGE = 'ADD_MESSAGE';

const reducer = (state, action) => {
    switch (action.type) {
        case ADD_MESSAGE:
            return { ...state, ...action.payload };
            break;
        default:
            return state;
            break;
    }
};

export const AlertProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const history = useHistory();

    const addMessage = useCallback(payload => {
        dispatch({ payload, type: ADD_MESSAGE });
    });

    /**
     * Remove message when the route happens
     * Presisit the message if message needs to dispalay
     * after route
     */
    useEffect(() => {
        if (!state.presist) addMessage({ message: null });

        return () => addMessage({ presist: false });
    }, [history.location]);

    return (
        <AlertContext.Provider
            value={{
                state,
                addMessage
            }}
        >
            {children}
        </AlertContext.Provider>
    );
};
