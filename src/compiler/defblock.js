import { sourceNode } from './sourceNode';
import { getStringLiteralValue } from '../utils';
import { collectVariables } from './variable';

export default {
    DefBlockStatement: ( { node, compile, figure } ) => {
        const name = getStringLiteralValue( node.name );
        const placeholder = `${name}BlockNode`;
        node.reference = placeholder;
        figure.domRef = true;
        figure.declare(
            sourceNode( `const ${placeholder} = dom.comment( '${figure.uniqid( 'comment' )}' );` )
        );

        const variables = collectVariables( figure.getScope(), node.expression );

        const blockRef = `block_${name}_${figure.uniqid( 'block' )}`;

        figure.spot( variables ).add(
            sourceNode( node.loc,
                [
                    '{\n',
                    `                const ${blockRef} = this.blocks[ $( '${name}' ) ];\n`,
                    `                if ( ${blockRef} ) {\n`,
                    `                    ${blockRef}( ${placeholder}, this, ${compile( node.expression )} );\n`,
                    '                }\n',
                    '            }'
                ]
            )
        );
        return node.reference;
    }
};
