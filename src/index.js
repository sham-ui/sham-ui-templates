import { parser } from './parser';
import { compile } from './compiler';
import { entity } from './transform/entity';
import { defaultBlock } from './transform/defaultblock';
import { sfc } from './transform/sfc';
import { thisDollarSign } from './transform/this-dollar-sign';
import { whitespace } from './optimize/whitespace';
import { getTemplateName } from './utils';
import { drawGraph } from './graph';

export class Compiler {
    constructor( options = {} ) {
        this.options = Object.assign( {
            asModule: true,
            asSingleFileComponent: false,
            removeDataTest: true
        }, options );
        this.transforms = [ whitespace, entity, thisDollarSign, defaultBlock, sfc ];
        this.globals = [
            'window',
            'Array',
            'Object',
            'Math',
            'JSON',
            '$'
        ];
    }

    compile( filename, code ) {
        let ast = parser.parse( filename, code );

        // Transform.
        this.transforms.forEach( transform => transform( ast, this.options ) );

        return compile(
            this.options.asSingleFileComponent ?
                'Template' :
                getTemplateName( getBaseName( filename ) ),
            ast,
            this.options,
            this.globals
        );
    }

    drawAstTree( filename, code ) {
        let ast = parser.parse( filename, code );

        // Transform.
        this.transforms.forEach( transform => transform( ast, this.options ) );

        return drawGraph( ast );
    }
}

function getBaseName( name ) {
    return name.split( '/' ).pop().replace( /\.\w+$/, '' );
}
