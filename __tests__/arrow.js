import { compile, renderComponent } from './helpers';

/*
 <Dummy
 onUpdate={{
 ( value, a ) => state$.text=value + ( a + b)
 }}
 />
 {{ a => a + b}}
 {{ a + ( b ) }}
 {{ (a, b) }}
 {{ ( c  + d ) }}
 {{ (c ? d : w ) }}
 {{ (a => a)(a) }}


 {{ ( a, b ) => ( a + b + c ) }}
 */


it( 'should render expression with IIFE', async() => {
    expect.assertions( 2 );
    const { html, text } = await renderComponent(
        compile`
            <div>{{ ( a => 2 * a)(1) }}</div>
            <div>{{ ( ( a ) => 2 * a)(1) }}</div>
            <div>{{ ( a => 2 * a)(foo) }}</div>
            <div>{{ ( ( a ) => 2 * a)(foo) }}</div>
            <div>{{ (( a, b ) => (a + b))(1, 2) }}</div>
            <div>{{ (( a, b ) => (a + b))(foo, bar) }}</div>
            <div>{{ (a => a + bar)(foo) }}</div>
            <div>{{ ((a) => a + bar)(foo) }}</div>
        `,
        {
            foo: 1,
            bar: 2
        }
    );
    expect( html ).toBe(
        // eslint-disable-next-line max-len
        '<div>2</div><div>2</div><div>2</div><div>2</div><div>3</div><div>3</div><div>3</div><div>3</div>'
    );
    expect( text ).toBe( '22223333' );
} );


it( 'should work with attr', async() => {
    expect.assertions( 2 );
    window.Label = compile`<span>{{text( "John" )}}</span>`;

    const { html, text } = await renderComponent(
        compile`<Label text={{ name => name + '!' }}/>`,
        {
            foo: 1,
            bar: 2
        }
    );
    expect( html ).toBe( '<span>John!</span><!--0-->' );
    expect( text ).toBe( 'John!' );

    delete window.Label;
} );


it( 'should work with state$', async() => {
    expect.assertions( 2 );
    const { component, html } = await renderComponent(
        compile`<button :onclick={{ () => state$.counter++ }}>{{counter}}</button>`,
        {
            counter: 0
        },
        {
            directives: {
                onclick: class {
                    constructor() {
                        this.handler = null;
                        this.callback = this.callback.bind( this );
                    }

                    callback( event ) {
                        this.handler( event );
                    }

                    bind( node ) {
                        node.addEventListener( 'click', this.callback );
                    }

                    unbind( node ) {
                        node.removeEventListener( 'click', this.callback );
                    }

                    update( handler ) {
                        this.handler = handler;
                    }
                }
            }
        }
    );
    expect( html ).toBe( '<button>0</button>' );
    component.ctx.container.querySelector( 'button' ).click();
    expect( component.ctx.container.innerHTML ).toBe( '<button>1</button>' );
} );
