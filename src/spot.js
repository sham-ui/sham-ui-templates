import { unique } from './utils';
import { sourceNode } from './compiler/sourceNode';

export class Spot {
    constructor( variables ) {
        this.variables = unique( variables ).sort();
        this.reference = this.variables.join( '_' );
        this.declaredVariables = {};
        this.operators = [];
        this.length = this.variables.length;
        this.weight = this.length;
        this.cache = false;
        this.onlyFromLoop = false;
    }

    generateOperation() {
        let sn = sourceNode(
            `( ${this.variables.join( ', ' )} ) => `
        );

        const isMultiLineOperation = (
            this.declaredVariables > 0 ||
            this.operators.length > 1
        );
        if ( isMultiLineOperation ) {
            sn.add( '{\n' );
        }

        const space = isMultiLineOperation ? '                ' : '';
        Object.keys( this.declaredVariables ).forEach( name => {
            sn.add( `${space}let ${name};\n` );
        } );

        if ( this.operators.length > 0 ) {
            sn.add( space );
            sn.add( sourceNode( this.operators ).join( `;\n${space}` ) );
            if ( isMultiLineOperation ) {
                sn.add( ';' );
                sn.add( '\n' );
            }
        }

        if ( isMultiLineOperation ) {
            sn.add( '            }' );
        }


        return sn;
    }

    add( code ) {
        this.operators.push( code );
        return this;
    }

    declareVariable( name ) {
        this.declaredVariables[ name ] = true;
        return this;
    }
}
