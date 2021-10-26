import { visit } from '../visitor';
import { HTMLElements, SVGElements } from '../compiler/element';
import { ast } from '../parser';

export function useBlockWithCompound( ast ) {
    visit( ast, {
        UseBlockStatement: ( node ) => {
            if ( !node.withCustom ) {
                handleCustomComponentsInBlock( node );
            }
        }
    } );
}


function handleCustomComponentsInBlock( blockNode ) {
    visit( blockNode, {
        Element( node ) {
            if (
                !HTMLElements.includes( node.name ) &&
                !SVGElements.includes( node.name )
            ) {
                addBlockDataSpreadAttribute( node );
            }
        }
    } );
}

function addBlockDataSpreadAttribute( node ) {
    node.attributes = node.attributes.concat(
        new ast.SpreadAttributeNode( [
            new ast.IdentifierNode( 'blockData' )
        ] )
    );
}
