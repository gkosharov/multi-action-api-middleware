/**
 * Created by g.kosharov on 8.4.2016 ã..
 */

import fetch from 'isomorphic-fetch';
/**
 * Fetches an API response and normalizes the resulting JSON according to schema.
 *
 * @function callApi
 * @access private
 * @param {string} endpoint - The URL endpoint for the request
 * @param {object} options - The options for the request
 * @returns {Promise}
 */
export default function callApi(endpoint, options) {

    return fetch(endpoint, options)
        .then((response) => {
            if (response.ok) {
                return Promise.resolve(response);
            } else {
                return Promise.reject(response);
            }
        })
        .then((response) => {
            const contentType = response.headers.get('Content-Type');
            if (contentType && ~contentType.indexOf('json')) {
                return response.json().then((json) => {
                    return Promise.resolve(json)
                });
            } else {
                return Promise.resolve();
            }
        },
        (response) => {
            const contentType = response.headers.get('Content-Type');
            if (contentType && ~contentType.indexOf('json')) {
                return response.json().then((json) => {
                    return Promise.reject({status: response.status, text: response.statusText, content: json});
                });
            } else {
                return Promise.reject({status: response.status, text: response.statusText, content: response});
            }
        });
}
