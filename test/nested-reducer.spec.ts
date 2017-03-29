import { suite, test } from "mocha-typescript";
import { assert } from "chai"

import {
    Action,
    createHandlers,
    createReducer,
    flattenNode,
    RootNode,
    HandlerMap,
    Reducer
} from '../';

@suite
class NestedReducerTests
{
  @test createReducer_HandlesDirectActions()
  {
    const handlers =
      {
        ["add"]: (state: number, payload: { num: number }): number => state + payload.num
      };

    const reducer: Reducer<number> = createReducer(handlers, 0);
    const action = { type: "add", num: 1 };

    assert.equal(reducer(1, action), 2);
  }

  @test createReducer_SetsInitialState()
  {
    type State = { num: number };
    const initialState: State = Object.freeze({ num: 1 });
    const reducer: Reducer<State> = createReducer({}, initialState);

    const action = { type: "sometype", num: 0 };

    assert.deepEqual(reducer(undefined, action), initialState);
  }

  @test createHandlers_InsertsAllKeys()
  {
    type MyAction = { type: string, num: number };
    const reducer: Reducer<number> = (state: number, action: MyAction) => state + action.num;

    const actionTypes = ["one, two"];

    const action: MyAction = { type: "doesnt matter", num: 1 };
    
    const handlers: HandlerMap<number> = createHandlers(reducer, actionTypes);

    for (const actionType of actionTypes)
    {
      assert.deepEqual(handlers[actionType](1, action), 2);
    }
  }

  @test flattenNode_BubbleUpHandler()
  {
    type State = { num: number };
    const initialState: State = Object.freeze({ num: 1 });

    const childHandlers =
      {
        ["add"]: (state: number, payload: { num: number }): number => state + payload.num
      };

    const rootNode: RootNode<State> =
      {
        handlers: {},
        children: [
          {
            handlers: childHandlers,
            statePipe: {
              diveIn: (parent: State, action: Action) => parent.num,
              bubbleUp: (parent: State, newChild: number) => partialAssign({ ...parent }, { num: newChild })
            }
          }]
      }

    const handler = flattenNode(rootNode)["add"];
    assert.ok(handler);

    const newState: State = handler(initialState, { num: 1 });
    assert.deepEqual(newState, { num: 2 });
  }
}

export function partialAssign<T extends Object>(obj: T, props: Partial<T>): T
{
  return Object.assign(obj, props);
}