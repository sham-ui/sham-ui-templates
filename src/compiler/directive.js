import { sourceNode } from './sourceNode';
import { collectVariables } from './variable';
import { compileToExpression } from './attribute';
import { hyphensToCamelCase } from '../utils';

export default {

    /**
     * Compile directive of regular nodes.
     *
     * @param {ElementNode} parent
     * @param {DirectiveNode} node
     * @param {Figure} figure
     * @param {Function} compile
     */
    Directive: ( { parent, node, figure, compile } ) => {
        var directive = hyphensToCamelCase( node.name ) + 'Directive' +
            figure.uniqid( 'directive_name' );

        figure.thisRef = true;
        figure.addDirective( sourceNode( node.loc, `var ${directive};` ) );
        figure.addRenderActions(
            sourceNode( node.loc, [
                `    if (${directive} === undefined) {\n`,
                `      ${directive} = new _this.directives.${node.name}(_this.parent || _this);\n`,
                '    }\n',
                `    ${directive}.bind(${parent.reference});`
            ] )
        );
        figure.addOnRemove(
            sourceNode( node.loc, [
                `    ${directive}.unbind(${parent.reference});`
            ] )
        );


        let [ expr ] = compileToExpression( figure, node, compile );
        var variables = collectVariables( figure.getScope(), expr );

        if ( variables.length === 0 ) {
            figure.addRenderActions(
                sourceNode( node.loc, [
                    `    ${directive}.update(`, (
                        expr ? compile( expr ) : 'undefined'
                    ), ');'
                ] )
            );
        } else {
            figure.spot( variables ).add(
                sourceNode( node.loc, [
                    `      ${directive}.update(`, compile( expr ), ')'
                ] )
            );
        }
    }
};
