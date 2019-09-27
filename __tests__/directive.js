import { compile, renderComponent } from './helpers';

beforeEach( () => {
    window.Custom = compile`
        <div id="custom" :ref={{name}}>{{name}}</div>
    `;
    window.Ref = class {
        constructor( component ) {
            this.component = component;
            this.node = null;
            this.name = null;
        }

        bind( node ) {
            this.node = node;
        }

        unbind() {
            this.node = null;
            if ( this.name ) {
                delete this.component[ this.name ];
            }
            this.name = null;
        }

        update( name ) {
            this.name = name;
            this.component[ name ] = this.node;
        }
    };
} );

afterEach( () => {
    delete window.Custom;
    delete window.Ref;
} );


it( 'should be trimmed from html', async() =>{
    expect.assertions( 1 );

    function directiveMock() {
        return function() {
            this.bind = function() {};
            this.update = function() {};
            this.unbind = function() {};
        };
    }

    const directives = {
        fade: directiveMock(),
        show: directiveMock(),
        content: directiveMock()
    };

    const { html } = await renderComponent(
        compile`
            <div :fade/>
            <div :show={{ visible }}/>
            <div :content="come {{ text }}"/>
        `,
        {
            directives
        }
    );
    expect( html ).toBe( '<div></div><div></div><div></div>' );
} );

it( 'methods bind, update, unbind should be called', async() => {
    expect.assertions( 4 );

    const directive = jest.fn();
    directive.prototype.bind = jest.fn();
    directive.prototype.update = jest.fn();
    directive.prototype.unbind = jest.fn();

    const directives = { directive };

    const { component } = await renderComponent(
        compile`<div :directive={{ value }}/>`,
        {
            directives,
            value: true
        }
    );
    expect( directive ).toHaveBeenCalledWith( component );
    expect( directive.prototype.bind ).toHaveBeenCalledWith( component.nodes[ 0 ] );
    expect( directive.prototype.update ).toHaveBeenCalledWith( true );

    component.remove();

    expect( directive.prototype.unbind ).toHaveBeenCalledWith( component.nodes[ 0 ] );
} );

it( 'ref directive', async() => {
    expect.assertions( 9 );

    const { component } = await renderComponent(
        compile`
            <div>
                <div id="foo" :ref="foo">
                    {% if test %}
                        <div id="test-true" :ref={{ test + "Inner"}}></div>
                    {% else %}
                        <div id="test-false" :ref={{ test + "Inner"}}></div>
                    {% endif %}
                </div>            
            </div>
        `,
        {
            directives: {
                ref: window.Ref
            },
            test: true
        }
    );
    expect( component.foo.id ).toBe( 'foo' );
    expect( component.trueInner.id ).toBe( 'test-true' );
    expect( component.falseInner ).toBe( undefined );

    component.update( { test: false } );

    expect( component.foo.id ).toBe( 'foo' );
    expect( component.trueInner ).toBe( undefined );
    expect( component.falseInner.id ).toBe( 'test-false' );

    component.remove();

    expect( component.foo ).toBe( undefined );
    expect( component.trueInner ).toBe( undefined );
    expect( component.falseInner ).toBe( undefined );
} );

it( 'ref directive with custom tag', async() => {
    expect.assertions( 5 );

    const { component, html } = await renderComponent(
        compile`
            <div>
                <div id="foo" :ref="foo">
                    {% if test %}
                        <Custom name="foo"/>
                    {% else %}
                        <Custom name="bar"/>
                    {% endif %}
                </div>            
            </div>
        `,
        {
            directives: {
                ref: window.Ref
            },
            test: true
        }
    );
    expect( html ).toBe(
        '<div><div id="foo"><div id="custom">foo</div><!--Custom--></div></div>'
    );
    expect( component.foo.id ).toBe( 'foo' );
    expect( component.bar ).toBe( undefined );

    component.update( { test: false } );

    expect( component.foo.id ).toBe( 'foo' );
    expect( component.bar ).toBe( undefined );
} );

