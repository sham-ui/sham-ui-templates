import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { notNull, getTemplateName } from '../utils';

export default {
    UseBlockStatement: ( { node, parent, figure, compile } ) => {
        node.reference = null;

        if ( !parent || 'Element' !== parent.type ) {
            throw new Error( 'Usage {% block %} only with custom Component' );
        }

        figure.addRuntimeImport(  'createBlockContext' );
        figure.addRuntimeImport( 'insert' );

        const parentName = getTemplateName( parent.name );
        const blockName = node.name;
        const templateName = `${figure.name}_${parentName}_block_${blockName}_${figure.uniqid( 'template_name' )}`;
        const childName = 'child' + figure.uniqid( 'child_name' );
        figure.declareContext( `const ${childName} = createBlockContext( this );` );

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

        compileBody( node.loc, node.body, templateName, childName );

        parent.addBlock(
            sourceNode( node.loc, [
                `        [ $( '${blockName}' ) ]: ( node, block, blockData ) => `,
                `insert( ${childName}.setup( block, node ), ${templateName}, this._dataForBlock( { [ $( '${node.identifier.name}' ) ]:  blockData } ) )`
            ] )
        );

        return node.reference;
    }
};
