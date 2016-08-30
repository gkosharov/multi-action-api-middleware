# multi-action-api-middleware

Redux api middleware for dispatching simultaneous actions.

## Usage

An example action creator for a descriptor of parallel actions dispatched on success:

```
import { CALL_API } from 'multi-action-api-middleware'

export function fetchResource(id) {
    return {
        [CALL_API]: {
            types: [
                RESOURCE_REQUEST,
                [
                    RESOURCE_SUCCESS,
                    (dispatch) => dispatch(fetchAnotherResource.apply(undefined, [id + 1]))
                ],
                RESOURCE_FAILURE
            ],
            method: 'GET',
            endpoint: "/api/entity/" + id 
        }
    };
}


export function fetchAnotherResource(id) {
    return {
        [CALL_API]: {
            types: [
                ANOTHER_RESOURCE_REQUEST,
                ANOTHER_RESOURCE_SUCCESS,
                ANOTHER_RESOURCE_FAIL
            ],
            method: 'GET',
            endpoint: "/api/entity/" + id 
        }
    };
}
```


