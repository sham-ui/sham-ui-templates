import { sourceNode } from './sourceNode';

export default {
    /**
     * @return {null}
     */
    ImportStatement: ( { node, figure } ) => {
        // TODO: Add support for ES2015 imports.
        figure.root().addImport(
            sourceNode( node.loc,
                `var ${node.identifier.name} = __requireDefault(require(${node.path.value}));` )
        );

        figure.addToScope( node.identifier.name );

        return null;
    }
};
