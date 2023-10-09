import { visit } from '../visitor';
import { ast } from '../parser';

export function stateDollarSign( ast ) {
    visit( ast, {
        MemberExpression: ( node ) => {
            if (
                !node.computed &&
                'Identifier' === node.object.type &&
                'state$' === node.object.name &&
                'Accessor' === node.property.type
            ) {
                replaceWithCallRef( node );
            }
        }
    } );
}

function replaceWithCallRef( node ) {
    node.computed = true;
    node.object = new ast.StateExpressionNode( node.object.loc );
    node.property = new ast.CallExpressionNode(
        new ast.IdentifierNode( '$' ),
        [ new ast.LiteralNode( `'${node.property.name}'` ) ]
    );
}
