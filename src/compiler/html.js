import { sourceNode } from './sourceNode';
import { notNull } from '../utils';

export default {
    Element: ( { node, figure, compile } ) => {
        node.reference = node.name + figure.uniqid();

        figure.domRef = true;
        figure.declare(
            sourceNode( node.loc,
                `const ${node.reference} = dom.el( '${node.name}' );` )
        );

        let children = node.body.map( ( child ) => compile( child ) ).filter( notNull );

        for ( let child of children ) {
            figure.construct(
                sourceNode( `${node.reference}.appendChild( ${child} );` )
            );
        }

        node.attributes.map( ( child ) => compile( child ) );

        return node.reference;
    }
};
