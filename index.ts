export type Action = { type: string; };
export type Reducer<TState> = (prevState: TState | undefined, action: Action) => TState;

export interface Handler<TState, TPayload> {
  (state: TState, payload: TPayload): TState;
}

export interface HandlerMap<TState> {
  [actionType: string]: Handler<TState, any>;
}

export interface StatePipe<TState, TParent> {
  diveIn(parent: TParent, action: Action): TState;
  bubbleUp(parent: TParent, newChild: TState): TParent;
}

export interface RootNode<TState> {
  handlers: HandlerMap<TState>;
  children?: ChildNode<any>[];
}

export interface ChildNode<TState> extends RootNode<TState> {
  statePipe: StatePipe<TState, any>;
}

export function createReducer<TState>(handlers: HandlerMap<TState>, initialState: TState): Reducer<TState> {
  return (state: TState = initialState, action: Action): TState => {
    const handler = handlers[action.type];
    return handler ? handler(state, action) : state;
  };
}

function bubbleHandler<TChild, TParent>(handler: Handler<TChild, any>, { diveIn, bubbleUp }: StatePipe<TChild, TParent>): Handler<TParent, any> {
  return (state: TParent, action: Action): TParent => bubbleUp(state, handler(diveIn(state, action), action));
}

export function flattenNode<TState>(node: RootNode<TState>): HandlerMap<TState> {
  const result: HandlerMap<TState> = { ...(node.handlers || {}) };

  for (const child of node.children || []) {
    const childrenHandlers: HandlerMap<any> = (child.children || []).reduce((handlers, child) => Object.assign(handlers, flattenNode(child)), {});

    const combined = { ...child.handlers, ...childrenHandlers };

    for (const actionType of Object.keys(combined)) {
      result[actionType] = bubbleHandler(combined[actionType], child.statePipe);
    }
  }

  return result;
}

export function createHandlers<T>(reducer: Reducer<T>, actionTypes: string[]): HandlerMap<T> {
  return actionTypes.reduce((handlers, action) => Object.assign(handlers, { [action]: reducer }), {});
}