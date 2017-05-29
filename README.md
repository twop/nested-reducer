# nested-reducer

A small library to manage nested state in Redux applications.

# Install
```
$ nmp install --save nested-reducer
```

# Usage

Create reducer from handlers:
```typescript
  const handlers: HandlerMap<number> = {
      ["add"]: (state: number, payload: { num: number }): number => state + payload.num
  };

  const initialState = 0;
  const reducer: Reducer<number> = createReducer(handlers, initialState);
```

After that plug it in to Redux or NgRx:
```typescript
  const action = { type: "add", num: 1 };
  assert.equal(reducer(1, action), 2);
```

End to end:
```typescript
  type Child = { count: number };

  type Root = {
    childState: Child;
    rootState: string;
  };

  // handlers for nested state
  const childHandlers: HandlerMap<Child> = {
    ['addToChild']: (state: Child, payload: { count: number }): Child => ({ ...state, count: payload.count })
  };

  // handlers for 'rootState' property
  const rootHandlers: HandlerMap<Root> = {
    ['changeRoot']: (state: Root, payload: { rootState: string }): Root => ({ ...state, rootState: payload.rootState })
  };

  // define relationships between them
  const pipe: StatePipe<Child, Root> = {
    // how to navigate to child
    diveIn: (parent: Root, action: Action): Child => parent.childState,

    // how to construct a new root state from it
    bubbleUp: (parent: Root, newChild: Child): Root => ({ ...parent, childState: newChild })
  };

  // combine all
  const rootNode: RootNode<Root> =
    {
      handlers: rootHandlers,
      children: [{
        handlers: childHandlers,
        statePipe: pipe
      }]
    }

  const initialState: Root = {
    rootState: 'root',
    childState: { count: 0 }
  };

  // construct reducer function
  const reducer: Reducer<Root> = createReducer(flattenNode(rootNode), initialState);

  const addToChildAction = { type: 'addToChild', count: 100500 };
  const changeRootAction = { type: 'changeRoot', rootState: '100500' };

  // it handles child actions
  const afterAdd: Root = reducer(undefined, addToChildAction);
  assert.equal(afterAdd.childState.count, addToChildAction.count);

  // as well as action for the root object
  const afterChange: Root = reducer(undefined, changeRootAction);
  assert.equal(afterChange.rootState, changeRootAction.rootState);
```

# Caveats

At the moment, doesn't support handling the same action in multiple reducers.
```typescript
  const addHandler: HandlerMap<number> = {
    ['add']: (state: number, payload: number): number => state + payload
  };

  const addHistroyHandler: HandlerMap<string> = {
    ['add']: (state: string, payload: number): number => state + `+${payload}`
  };
```
Will not merge them properly. Ie will pick just one of them.