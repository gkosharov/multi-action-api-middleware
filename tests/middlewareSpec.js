/**
 * Created by g.kosharov on 8.4.2016 ã..
 */
import "babel-polyfill"
import ApiMiddleware from '../src/middleware'
import { CALL_API } from '../src/constants'

var scope = {};
scope.server = sinon.fakeServer.create();
describe('ApiMiddleware', ()=> {

    beforeEach(()=> {
        scope.sandbox = sinon.sandbox.create();
        scope.doDispatch = () => {};
        scope.doGetState = () => {};
        scope.nextHandler = ApiMiddleware({dispatch: scope.doDispatch, getState: scope.doGetState});
    });

    afterEach(()=> {
        scope.sandbox.restore();
        scope.server.restore();
    });

    it('should return a function to handle next', () => {
        expect(scope.nextHandler).toBeFunction();
        expect(scope.nextHandler.length).toEqual(1);
    });

    it('should return a function to handle action', () => {
        var actionHandler = scope.nextHandler();
        expect(actionHandler).toBeFunction();
        expect(actionHandler.length).toEqual(1);
    });


    it(' should pass actions to the next handler', done => {
        var apiAction = {
            [CALL_API]: {
                endpoint: "http://localhost:3000/api/entity/1",
                types: ['REQUEST', 'SUCCESS', 'FAIL']
            }
        };
        var doNext = (action) => {
            expect(action).toBeDefined();
            done();
        };
        var actionHandler = scope.nextHandler(doNext);

        actionHandler(apiAction).then(done);
    });

    it(' should throw error when no valid string endpoint is provided', done => {
        var apiAction = {
            [CALL_API]: {
                types: ['REQUEST', 'SUCCESS', 'FAIL']
            }
        };
        var doNext = ()=> {
        };
        var actionHandler = scope.nextHandler(doNext);

        expect(()=> {
            actionHandler(apiAction)
        }).toThrow(new Error('Specify a string endpoint URL.'));
        done();
    });

    it(' should throw error when no array of 3 action types', done => {
        var apiAction = {
            [CALL_API]: {
                endpoint: 'http://localhost:3000/api/entities/1',
                types: ['REQUEST']
            }
        };
        var doNext = scope.sandbox.spy();
        var actionHandler = scope.nextHandler(doNext);

        expect(()=> {
            actionHandler(apiAction)
        }).toThrowAnyError();
        done();
    });

    it(' should use an [CALL_API].endpoint function when present', () => {

        var endpointStub = scope.sandbox.stub();
        endpointStub.onCall(0).returns("http://localhost:3033/api/entity/1");
        var apiAction = {
            [CALL_API]: {
                endpoint: endpointStub,
                method: 'GET',
                types: ['REQUEST', 'SUCCESS', 'FAILURE']
            }
        };
        var doNext = scope.sandbox.spy();
        var actionHandler = scope.nextHandler(doNext);

        actionHandler(apiAction);
        expect(endpointStub).toHaveBeenCalled();
    });

    it(' should dispatch a success FSA on a successful API call with a non-empty JSON response', (done) => {
        scope.server.respondWith(
            "GET",
            "/entity/2",
            [
                200,
                { "Content-Type": "application/json" },
                '{ "stuff": "is", "awesome": "in here" }'
            ]
        );
        var apiAction = {
            [CALL_API]: {
                endpoint: '/entity/2',
                method: 'GET',
                types: [
                    'SOME_REQUEST',
                    'SUCCESS',
                    'FAIL'
                ]
            }
        };

        var doNext = (action) => {
            switch (action.type) {
                case 'SOME_REQUEST':
                    expect(action).toBeDefined();
                    break;
                case 'SUCCESS':
                    expect(action.payload).toBeNonEmptyObject();
                    done();
                    break;
                case 'FAIL':
                    expect(action.payload).toBeNonEmptyObject();
                    done();
                    break;
            }
        };

        var actionHandler = scope.nextHandler(doNext);

        actionHandler(apiAction).then(done);
        scope.server.respond();
    });

    it(' should dispatch afterSuccess after successful api call', (done) => {
        scope.server.respondWith(
            "GET",
            "/entity/2",
            [
                200,
                { "Content-Type": "application/json" },
                '{ "stuff": "is", "awesome": "in here" }'
            ]
        );
        var anotherActionCreator = ()=>{
            return {"type": "afterAction"};
        };
        var apiAction = {
            [CALL_API]: {
                endpoint: '/entity/2',
                method: 'GET',
                types: [
                    {
                        "type": 'REQUEST'
                    },
                    [
                        'SUCCESS',
                        (dispatch) => dispatch(anotherActionCreator)
                    ],
                    {
                        "type": 'FAIL'
                    }
                ]
            }
        };
        var doNext = (action) => {
            switch (action.type) {
                case 'SOME_REQUEST':
                    expect(action).toBeDefined();
                    break;
                case 'SUCCESS':
                    expect(action.payload).toBeNonEmptyObject();
                    done();
                    break;
                case 'FAIL':
                    expect(action.payload).toBeNonEmptyObject();
                    done();
                    break;
            }
        };

        var actionHandler = scope.nextHandler(doNext);

        actionHandler(apiAction).then(done);
        scope.server.respond();
    });
});