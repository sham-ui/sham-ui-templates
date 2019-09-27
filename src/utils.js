export function esc( str ) {
    return JSON.stringify( str );
}

export function size( obj ) {
    let size = 0,
        key;
    for ( key in obj ) {
        if ( obj.hasOwnProperty( key ) ) {
            size++;
        }
    }
    return size;
}

export function notNull( item ) {
    return item !== null;
}

export function unique( a ) {
    return a.reduce( function( p, c ) {
        if ( p.indexOf( c ) < 0 ) {
            p.push( c );
        }
        return p;
    }, [] );
}

export function isSingleChild( parent, node ) {
    if ( parent ) {
        if ( parent.type === 'Element' ) {
            if ( parent.body.length === 1 && parent.body[ 0 ] === node ) {
                return true;
            }
        }
    }
    return false;
}

export function getTemplateName( name ) {
    return name.replace( /\W+/g, '_' );
}

export function getStringLiteralValue( literal ) {
    return literal.value.replace( /^["']/, '' ).replace( /["']$/, '' );
}

export function arrayToObject( array, value = 1 ) {
    const obj = {};
    for ( let i = 0; i < array.length; i++ ) {
        obj[ array[ i ] ] = value;
    }
    return obj;
}

export function hyphensToCamelCase( str ) {
    return str.replace( /-([a-z])/g, ( g ) => g[ 1 ].toUpperCase() );
}
