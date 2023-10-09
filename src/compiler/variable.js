import { visit } from '../visitor';

export function collectVariables( scope, node ) {
    const variables = [];
    if ( node ) {
        const functionArgs = createFunctionsArgs();
        const nodes = [].concat( node );
        nodes.forEach( ( node ) => {
            visit( node, {
                FunctionExpression( node ) {
                    const args = collectVariables( [], node.arguments );
                    functionArgs.push( args );
                },
                FunctionExpression_exit() {
                    functionArgs.pop();
                },
                Identifier( node ) {
                    if (
                        variables.indexOf( node.name ) === -1 &&
                        scope.indexOf( node.name ) === -1 &&
                        !functionArgs.has( node.name )
                    ) {
                        variables.push( node.name );
                    }
                }
            } );
        } );
    }
    return variables;
}


function createFunctionsArgs() {
    const scopes = [];
    return {
        push( args ) {
            scopes.push( args );
        },
        pop() {
            scopes.pop();
        },
        has( arg ) {
            for ( let i = scopes.length - 1; i >= 0; i-- ) {
                if ( scopes[ i ].indexOf( arg ) !== -1 ) {
                    return true;
                }
            }
            return false;
        }
    };
}
