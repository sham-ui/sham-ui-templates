import { getStringLiteralValue } from '../utils';
import { visit } from '../visitor';
import { HTMLElements, SVGElements } from '../compiler/element';
import { ast } from '../parser';

const uniqcounters = {};

export function useBlockWithCompound( ast ) {
    visit( ast, {
        UseBlockStatement: ( node ) => {
            if ( !node.withCustom ) {
                addUniqBlockDataName( node );
                handleCustomComponentsInBlock( node );
            }
        }
    } );
}

function addUniqBlockDataName( node ) {
    const blockName = getStringLiteralValue( node.name  );
    if ( !uniqcounters[ blockName ] ) {
        uniqcounters[ blockName ] = 0;
    }
    node.identifier = new ast.IdentifierNode(
        `dataForBlock_${blockName}_${uniqcounters[ blockName ]++}`
    );
}


function handleCustomComponentsInBlock( blockNode ) {
    visit( blockNode, {
        Element( node ) {
            if (
                !HTMLElements.includes( node.name ) &&
                !SVGElements.includes( node.name )
            ) {
                addBlockDataSpreadAttribute( blockNode, node );
            }
        }
    } );
}

function addBlockDataSpreadAttribute( blockNode, node ) {
    node.attributes = node.attributes.concat(
        new ast.SpreadAttributeNode( [
            new ast.IdentifierNode( blockNode.identifier.name )
        ] )
    );
}
