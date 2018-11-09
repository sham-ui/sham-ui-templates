import { sourceNode } from './sourceNode';
import { collectVariables } from './variable';
import { isSingleChild, esc, notNull } from '../utils';
import { Figure } from '../figure';

export default {
    ForStatement: ( { parent, node, figure, compile } ) => {
        node.reference = null;

        let templateName = figure.name + '_for' + figure.uniqid( 'template_name' );
        let childrenName = 'children' + figure.uniqid( 'child_name' );
        let placeholder;

        if ( isSingleChild( parent, node ) ) {
            placeholder = parent.reference;
        } else {
            node.reference = placeholder = 'for' + figure.uniqid( 'placeholder' );
            figure.declare( sourceNode( `var ${placeholder} = document.createComment('for');` ) );
        }

        figure.declare( sourceNode( `var ${childrenName} = new __UI__.Map();` ) );

        // for (

        let variablesOfExpression = collectVariables( figure.getScope(), node.expr );

        figure.thisRef = true;
        figure.spot( variablesOfExpression ).add(
            sourceNode( node.loc, [
                `      __UI__.loop(_this, ${placeholder}, ${childrenName}, ${templateName}, `,
                compile( node.expr ),
                (
                    node.options === null ? `` : [ `, `, esc( node.options ) ]
                ),
                `)`
            ] )
        );


        // ) {

        let subfigure = new Figure( templateName, figure );

        if ( node.body.length > 0 ) {
            subfigure.children = node.body.map( ( node ) => compile( node, subfigure ) )
                .filter( notNull );
            figure.addFigure( subfigure );
            subfigure.stateNeed = true;
        }

        figure.addOnUpdate(
            node.options === null ?
                sourceNode( node.loc, [
                    `    ${childrenName}.forEach(function (view) {\n`,
                    `      view.update(view.__state__);\n`,
                    `    });`
                ] ) :
                // TODO: Remove double update on foreach.
                // Simple solution is to use Object.assign({}, __data__, view.__state__),
                // But this isn't supported in a lot of browsers for now.
                // Also i have solution for this what may come in next v5 version...
                sourceNode( node.loc, [
                    `    ${childrenName}.forEach(function (view) {\n`,
                    `      view.update(view.__state__);\n`,
                    `      view.update(__data__);\n`,
                    `      view.update(view.__state__);\n`,
                    `    });`
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
