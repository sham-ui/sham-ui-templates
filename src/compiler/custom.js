import { sourceNode } from './sourceNode';
import { collectVariables } from './variable';
import { isSingleChild, unique, notNull, getTemplateName } from '../utils';
import { compileToExpression } from './attribute';

export default {
    Element: ( { parent, node, figure, compile } ) => {
        node.reference = null;

        let templateName = getTemplateName( node.name );
        let childName = 'child' + figure.uniqid( 'child_name' );
        let placeholder;

        figure.addRuntimeImport( 'createChildContext' );
        figure.addRuntimeImport( 'insert' );

        if ( isSingleChild( parent, node ) ) {
            placeholder = parent.reference;
        } else {
            placeholder = 'custom' + figure.uniqid( 'placeholder' );
            node.reference = placeholder;
            figure.domRef = true;
            figure.declare( sourceNode( `const ${placeholder} = dom.comment( '${figure.uniqid( 'comment' )}' );` ) );
        }

        const blockRef = `${childName}_blocks`;
        figure.addBlock( blockRef );

        figure.declareContext( sourceNode( `const ${childName} = createChildContext( this, ${placeholder}, ${blockRef} );` ) );

        let dataObjects = [];
        let data = [];
        let variables = [];
        let hasSpreadAttribute = false;

        // Collect info about variables and attributes.
        for ( let attr of node.attributes ) {
            let [ expr ] = compileToExpression( figure, attr, compile );
            variables = variables.concat( collectVariables( figure.getScope(), expr ) );
            if ( attr.type === 'SpreadAttribute' ) {
                hasSpreadAttribute = true;
                if ( data.length === 0 && dataObjects.length === 0 ) {
                    dataObjects.push( '{}' ); // It's first spread
                } else if ( data.length > 0 ) {
                    dataObjects.push( `{ ${data.join( ', ' )} }` );
                    data = [];
                }
                dataObjects.push( compile( expr ) );
            } else {
                data.push( `[ $( '${attr.name}' ) ]: ${compile( expr )}` );
            }
        }
        if ( data.length > 0 ) {
            dataObjects.push( `{ ${data.join( ', ' )} }` );
        }

        variables = unique( variables );

        let options = '{}';
        if ( dataObjects.length === 1 ) {
            options = dataObjects[ 0 ];
        } else if ( dataObjects.length > 1 ) {
            options = `Object.assign( ${dataObjects.join( ', ' )} )`;
        }


        const mountCode = sourceNode( node.loc, `insert( ${childName}, ${templateName}, ${options} )` );

        // Add spot for custom attribute or insert on render if no variables in attributes.
        if ( variables.length > 0 ) {
            const spot = figure.spot( variables );
            spot.add( mountCode );
        } else if ( hasSpreadAttribute ) {
            figure.addOnUpdate( mountCode );
        } else {
            figure.addRenderActions( mountCode );
        }


        if ( node.body.length > 0 ) {
            node.addBlock = ( sn ) => {
                figure.addBlock( blockRef, sn );
            };
            figure.children = node.body
                .map( ( child ) => compile( child, figure ) )
                .filter( notNull );
            delete node.addBlock;
        }

        return node.reference;
    }
};
