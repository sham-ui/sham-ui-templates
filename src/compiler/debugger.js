export default {
    DebuggerStatement: ( { node, figure } ) => {
        node.reference = null;
        figure.withDebugger = true;
        return node.reference;
    }
};
