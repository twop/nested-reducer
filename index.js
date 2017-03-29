"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createReducer(handlers, initialState) {
    return (state = initialState, action) => {
        const handler = handlers[action.type];
        return handler ? handler(state, action) : state;
    };
}
exports.createReducer = createReducer;
function bubbleHandler(handler, { diveIn, bubbleUp }) {
    return (state, action) => bubbleUp(state, handler(diveIn(state, action), action));
}
function flattenNode(node) {
    const result = Object.assign({}, (node.handlers || {}));
    for (const child of node.children || []) {
        const childrenHandlers = (child.children || []).reduce((handlers, child) => Object.assign(handlers, flattenNode(child)), {});
        const combined = Object.assign({}, child.handlers, childrenHandlers);
        for (const actionType of Object.keys(combined)) {
            result[actionType] = bubbleHandler(combined[actionType], child.statePipe);
        }
    }
    return result;
}
exports.flattenNode = flattenNode;
function createHandlers(reducer, actionTypes) {
    return actionTypes.reduce((handlers, action) => Object.assign(handlers, { [action]: reducer }), {});
}
exports.createHandlers = createHandlers;
//# sourceMappingURL=index.js.map