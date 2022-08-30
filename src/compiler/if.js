import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { collectVariables } from './variable';
import { isSingleChild, notNull } from '../utils';

export default {
    IfStatement: ( { parent, node, figure, compile } ) => {
        node.reference = null;

        let templateNameForThen = figure.name + '_if' + figure.uniqid( 'template_name' );
        let templateNameForOtherwise = figure.name + '_else' + figure.uniqid( 'template_name' );
        let childNameForThen = 'childThen' + figure.uniqid( 'child_name' );
        let childNameForOtherwise = 'childElse' + figure.uniqid( 'child_name' );
        let placeholder;

        if ( isSingleChild( parent, node ) ) {
            placeholder = parent.reference;
        } else {
            node.reference = placeholder = 'for' + figure.uniqid( 'placeholder' );
            figure.domRef = true;
            figure.declare( sourceNode( `const ${placeholder} = dom.comment( '${figure.uniqid( 'comment' )}' );` ) );
        }

        figure.addRuntimeImport( 'createChildContext' );
        figure.addRuntimeImport( 'cond' );

        figure.declareContext( `const ${childNameForThen} = createChildContext( this, ${placeholder} );` );

        if ( node.otherwise ) {
            figure.declareContext( `const ${childNameForOtherwise} = createChildContext( this, ${placeholder} );` );
        }

        // if (

        const variablesOfExpression = collectVariables( figure.getScope(), node.cond );

        if ( variablesOfExpression.length > 0 ) {
            figure.spot( variablesOfExpression ).add(
                sourceNode( node.loc, [
                    node.otherwise ? 'result = ' : '',
                    `cond( ${childNameForThen}, ${templateNameForThen}, `, compile( node.cond ), ' )'
                ] )
            );

            if ( node.otherwise ) {
                figure.spot( variablesOfExpression ).add(
                    sourceNode( node.loc, [
                        `cond( ${childNameForOtherwise}, ${templateNameForOtherwise}, !result )`
                    ] )
                ).declareVariable( 'result' );
            }
        } else {
            figure.addOnUpdate(
                sourceNode( node.loc, [
                    '        ',
                    `cond( ${childNameForThen}, ${templateNameForThen}, ${ compile( node.cond ) }  )`,
                    node.otherwise ? ';' : ''
                ] )
            );

            if ( node.otherwise ) {
                figure.addOnUpdate(
                    sourceNode( node.loc, [
                        '        ',
                        `cond( ${childNameForOtherwise}, ${templateNameForOtherwise}, !( ${compile( node.cond )} ) );`
                    ] )
                );
            }
        }

        // ) then {

        let compileBody = ( loc, body, templateName, childName ) => {
            let subfigure = new Figure( templateName, figure );
            subfigure.children = body.map( node => compile( node, subfigure ) ).filter( notNull );
            figure.addFigure( subfigure );

            figure.addOnUpdate(
                sourceNode( loc, [
                    `        ${childName}.onUpdate( __data__ );`
                ] )
            );
        };

        compileBody( node.loc, node.then, templateNameForThen, childNameForThen );

        // } else {

        if ( node.otherwise ) {
            compileBody( node.loc,
                node.otherwise,
                templateNameForOtherwise,
                childNameForOtherwise );
        }

        // }

        return node.reference;
    }
};
