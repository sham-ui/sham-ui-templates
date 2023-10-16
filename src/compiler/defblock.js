import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { collectVariables } from './variable';
import { notNull } from '../utils';

export default {
    DefBlockStatement: ( { node, compile, figure } ) => {
        const name = node.name;
        const placeholder = `${name}BlockNode`;
        node.reference = placeholder;
        figure.domRef = true;
        figure.declare(
            sourceNode( `const ${placeholder} = dom.comment( '${figure.uniqid( 'comment' )}' );` )
        );

        const variables = collectVariables( figure.getScope(), node );

        const blockRef = `block_${name}_${figure.uniqid( 'block' )}`;

        let defaultChildName;
        let defaultTemplateName;

        const hasDefault = node.body.length > 0;

        if ( hasDefault ) {
            figure.addRuntimeImport( 'createChildContext' );
            figure.addRuntimeImport( 'insert' );
            defaultChildName = `child_block_${name}_default_${figure.uniqid( 'child_name' )}`;
            defaultTemplateName = `${figure.name}_block_${name}_default${figure.uniqid( 'template_name' )}`;
            figure.declareContext( sourceNode( `const ${defaultChildName} = createChildContext( this, ${placeholder} );` ) );
            const subfigure = new Figure( defaultTemplateName, figure );
            subfigure.children = node.body
                .map( childNode => compile( childNode, subfigure ) )
                .filter( notNull )
            ;
            figure.addFigure( subfigure );
            figure.addOnUpdate(
                sourceNode( node.loc, [
                    `        ${defaultChildName}.onUpdate( __data__ );`
                ] )
            );
        }

        figure.spot( variables ).add(
            sourceNode( node.loc,
                [
                    '{\n',
                    `                const ${blockRef} = this.ctx.blocks[ $( '${name}' ) ];\n`,
                    `                if ( ${blockRef} ) {\n`,
                    `                    ${blockRef}( ${placeholder}, this, ${ compile( node.expression ) } );\n`,
                    ...(
                        hasDefault > 0 ?
                            [
                                '                } else { \n',
                                // eslint-disable-next-line max-len
                                `                     insert( ${defaultChildName}, ${defaultTemplateName} );\n`,
                                '                }\n'
                            ] :
                            [ '                }\n' ]
                    ),
                    '            }'
                ]
            )
        );
        return node.reference;
    }
};
