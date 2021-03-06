export declare type Action = {
    type: string;
};
export declare type Reducer<TState> = (prevState: TState | undefined, action: Action) => TState;
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
export declare function createReducer<TState>(handlers: HandlerMap<TState>, initialState: TState): Reducer<TState>;
export declare function flattenNode<TState>(node: RootNode<TState>): HandlerMap<TState>;
export declare function createHandlers<T>(reducer: Reducer<T>, actionTypes: string[]): HandlerMap<T>;
