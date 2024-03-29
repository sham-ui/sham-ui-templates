import { compileAsSFC, renderComponent, compile } from './helpers';

it( 'should single file component work', async() => {
    expect.assertions( 2 );
    const { component, html } = await renderComponent(
        compileAsSFC`
        <template>
            {% if loaded %}
                Loaded!
            {% endif %}
        </template>
        
        <script>
            export default Component( Template );
        </script>
        `,
        {
            loaded: false
        }
    );
    expect( html ).toBe( '<!--0-->' );
    component.update( { loaded: true } );
    expect( component.ctx.container.innerHTML ).toBe( ' Loaded! <!--0-->' );
} );

it( 'should single file component correct work with options', async() => {
    expect.assertions( 2 );
    const { component, html } = await renderComponent(
        compileAsSFC`
        <template>
            {% if loaded %}
                {{text}}
            {% endif %}
        </template>
        
        <script>
            export default Component( Template, function( options ) {
                const text = $(); 
                options( {
                    [ text ]: {
                        get() {
                            return 'Text for content'
                        }
                    }
                } );
            } );
        </script>
        `,
        {
            loaded: false
        }
    );
    expect( html ).toBe( '<!--0-->' );
    component.update( { loaded: true } );
    expect( component.ctx.container.innerHTML ).toBe( 'Text for content<!--0-->' );
} );

it( 'should single file component correct work with imports', async() => {
    expect.assertions( 1 );
    const { html } = await renderComponent(
        compileAsSFC`
        <template>
            {% import upperCase from 'upper-case' %}

            <section>
                {{ upperCase(text) | upperCase }}
            </section>
        </template>
        
        <script>
            export default Component( Template, function( options ) {
                const text = $();
                options( { 
                    [ text ]: 'default text' 
                } );
            } );
        </script>
        `,
        {
            text: 'upper'
        }
    );
    expect( html ).toBe( '<section>UPPER</section>' );
} );


it( 'should single file component correct work with context in blocks', async() => {
    expect.assertions( 1 );
    window.CustomPanel = compile`
        <div>
            <div class="title">
                {% defblock title %}
            </div>
        </div>
    `;
    const { html } = await renderComponent(
        compileAsSFC`
        <template>
            <CustomPanel>
                {% title %}
                    {{this.title()}}
                {% end title %}
            </CustomPanel>
        </template>
        
        <script>
            export default Component( Template, function() {
                this.title = () => {
                    return 'Title text'
                };
            } );
        </script>
        `
    );
    expect( html ).toBe(
        '<div><div class="title"> Title text <!--0--></div></div><!--0-->'
    );

    delete window.CustomPanel;
} );

it( 'should work with class property in expressions', () => {
    const { html } = renderComponent(
        compileAsSFC`
        <template>
            <span>{{this.user}}</span>
        </template>
        
        <script>
            export default Component( Template, function() {
                this.user = 'John Smith'; 
            } );
        </script>
        `
    );
    expect( html ).toBe( '<span>John Smith</span>' );
} );

it( 'should work with class property in if', () => {
    const { html } = renderComponent(
        compileAsSFC`
        <template>
            {% if this.isVisible %}
                <span>{{user}}</span>
            {% endif %}
        </template>
        
        <script>
            export default Component( Template, function() {
                this.isVisible = true;
            } );
        </script>
        `,
        {
            user: 'Joh Smith'
        }
    );
    expect( html ).toBe( '<span>Joh Smith</span><!--0-->' );
} );

it( 'should work with owner method', () => {
    window.Inner = compile`<p>{{label}}: {{dataGetter.bind( this, value )()}}</p>`;

    const { html, component } = renderComponent(
        compileAsSFC`
        <template>
            {% if show %}
                <Inner 
                    label={{label}}
                    value={{1}}
                    dataGetter={{this$.increment}}
                />
            {% endif %}
        </template>
        
        <script>
            export default Component( Template, function() {
                this$.increment = ( value ) => value + 1;
            } );
        </script>
        `,
        {
            label: 'Value',
            show: true
        }
    );
    expect( html ).toBe( '<p>Value: 2</p><!--0--><!--0-->' );
    component.update( { show: false } );
    component.update( { show: true } );
    expect(  document.querySelector( 'body' ).innerHTML ).toBe(
        '<p>Value: 2</p><!--0--><!--0-->'
    );

    delete window.Inner;
} );

