import { sourceNode } from './sourceNode';
import { collectVariables } from './variable';
import { isSingleChild, esc, notNull } from '../utils';
import { Figure } from '../figure';

function wrapWithRef( options ) {
    const items = [];
    const res = JSON.parse( esc( options ) );

    for ( let key in res ) {
        items.push( `${key}: $( '${res[ key ]}' )` );
    }
    return `{${items.join( ', ' )}}`;
}

export default {
    ForStatement: ( { parent, node, figure, compile } ) => {
        node.reference = null;

        let templateName = figure.name + '_for' + figure.uniqid( 'template_name' );
        let childrenName = 'childLoop' + figure.uniqid( 'child_name' );
        let placeholder;

        if ( isSingleChild( parent, node ) ) {
            placeholder = parent.reference;
        } else {
            node.reference = placeholder = 'for' + figure.uniqid( 'placeholder' );
            figure.domRef = true;
            figure.declare( sourceNode( `const ${placeholder} = dom.comment( '${figure.uniqid( 'comment' )}' );` ) );
        }

        figure.addRuntimeImport( 'createLoopContext' );
        figure.addRuntimeImport( 'loop' );

        figure.declareContext(
            sourceNode( `const ${childrenName} = createLoopContext( this, ${placeholder} );` )
        );

        // for (

        let variablesOfExpression = collectVariables( figure.getScope(), node.expr );

        const loopSourceNode = sourceNode( node.loc, [
            `loop( ${childrenName}, ${templateName}, `,
            compile( node.expr ),
            node.options === null ? '' : `, ${wrapWithRef( node.options )}`,
            ' )'
        ] );
        if ( variablesOfExpression.length > 0 ) {
            figure.spot( variablesOfExpression ).add( loopSourceNode );
        }  else {
            figure.addOnUpdate(
                sourceNode( [ '        ', loopSourceNode ] )
            );
        }

        // ) {

        let subfigure = new Figure( templateName, figure );

        if ( node.body.length > 0 ) {
            subfigure.children = node.body.map( ( node ) => compile( node, subfigure ) )
                .filter( notNull );
            figure.addFigure( subfigure );
        }

        figure.addOnUpdate(
            sourceNode( node.loc, [
                `        ${childrenName}.onUpdate( __data__ );`
            ] )
        );

        if ( node.options && node.options.value ) {
            subfigure.spot( node.options.value ).onlyFromLoop = true;
        }

        if ( node.options && node.options.key ) {
            subfigure.spot( node.options.key ).onlyFromLoop = true;
        }

        // }

        return node.reference;
    }
};
