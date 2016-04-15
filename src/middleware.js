import {CALL_API} from './constants'
import callApi from './callApi'
import isArray from 'lodash/lang/isArray'
import forEach from 'lodash/collection/forEach'
import isFunction from 'lodash/lang/isFunction'
import isObject from 'lodash/lang/isObject'
import merge from 'lodash/object/merge'

/**
 * @typedef {function} ReduxMiddleware
 * @param {Object} store
 * @returns {ReduxNextHandler}
 *
 * @typedef {function} ReduxNextHandler
 * @param {function} next
 * @returns {ReduxActionHandler}
 *
 * @typedef {function} ReduxActionHandler
 * @param {object} action
 * @returns undefined
 */

/**
 * A Redux middleware that interprets actions with CALL_API info specified.
 * Performs the call and promises when such actions are dispatched.
 *
 * @type {ReduxMiddleware}
 * @access public
 */

export default store => next => action => {

    const callAPI = action[CALL_API];
    /*if (!isRSAA(action)) {
        return next(action);
    }*/
    let options = {};
    let { endpoint } = callAPI;
    const { types, bailout } = callAPI;

    if (typeof endpoint === 'function') {
        endpoint = endpoint(store.getState());
    }

    if (typeof endpoint !== 'string') {
        throw new Error('Specify a string endpoint URL.');
    }

    if (!Array.isArray(types) || types.length !== 3) {
        throw new Error('Expected an array of three action types.');
    }

    if (typeof bailout !== 'undefined' && typeof bailout !== 'function') {
        throw new Error('Expected bailout to either be undefined or a function.');
    }

    if (bailout && bailout(store.getState())) {
        return Promise.resolve();
    }

    if (callAPI.method && callAPI.method == "POST") {
        options = Object.assign({}, options, {method: "POST"});
    }

    if (callAPI.headers) {
        options = Object.assign({}, options, {headers: callAPI.headers});
    }

    if (action.payload) {
        options = Object.assign({}, options, {body: JSON.stringify(action.payload)});
    }

    function actionWith(data, payload) {
        const finalPayload = Object.assign({}, action.payload, payload);
        if (data.payload && isFunction(data.payload)) {
            data.payload = data.payload(action, store.getState(), payload);
        }
        const finalAction = {...action, payload: finalPayload, ...data};

        delete finalAction[CALL_API];
        return finalAction;
    }

    const [requestType, successType, failureType] = types;
    next(actionWith({type: requestType}));

    return callApi(endpoint, options).then(
            payload => {
            if (isArray(successType)) {
                forEach(successType, function (subAction, index) {
                    if (isFunction(subAction)) {
                        subAction(store.dispatch, store.getState);
                    } else if (isObject(subAction) && subAction.type) {
                        next(actionWith(subAction, payload));
                    } else {
                        next(actionWith({type: subAction}, payload));
                    }
                });
            } else {
                if (isObject(successType) && successType.type) {
                    next(actionWith(successType, payload));
                } else {
                    next(actionWith({type: successType}, payload));
                }
            }
        },
        (error) => next(actionWith({
            type: failureType,
            payload: error,
            error: true
        }))
    );
}
