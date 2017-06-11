"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
function createReducer(handlers, initialState) {
    return function (state, action) {
        if (state === void 0) { state = initialState; }
        var handler = handlers[action.type];
        return handler ? handler(state, action) : state;
    };
}
exports.createReducer = createReducer;
function bubbleHandler(handler, _a) {
    var diveIn = _a.diveIn, bubbleUp = _a.bubbleUp;
    return function (state, action) { return bubbleUp(state, handler(diveIn(state, action), action)); };
}
function flattenNode(node) {
    var result = __assign({}, (node.handlers || {}));
    for (var _i = 0, _a = node.children || []; _i < _a.length; _i++) {
        var child = _a[_i];
        var childrenHandlers = (child.children || []).reduce(function (handlers, child) { return Object.assign(handlers, flattenNode(child)); }, {});
        var combined = __assign({}, child.handlers, childrenHandlers);
        for (var _b = 0, _c = Object.keys(combined); _b < _c.length; _b++) {
            var actionType = _c[_b];
            result[actionType] = bubbleHandler(combined[actionType], child.statePipe);
        }
    }
    return result;
}
exports.flattenNode = flattenNode;
function createHandlers(reducer, actionTypes) {
    return actionTypes.reduce(function (handlers, action) {
        return Object.assign(handlers, (_a = {}, _a[action] = reducer, _a));
        var _a;
    }, {});
}
exports.createHandlers = createHandlers;
//# sourceMappingURL=index.js.map