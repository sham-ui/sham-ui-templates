import { compile, compileAsSFC, renderComponent } from './helpers';

it( 'should correct work with appendFilters ', async() => {
    window.Inner = compile`<p>{{ text | upperCase }}</p>`;
    const { html } = renderComponent(
        compileAsSFC`
        <template>
            <Inner text={{text}} />
        </template>
        
        <script>
            function extendContext() {
                this.ctx.appendFilters( {
                    upperCase: value => value.toUpperCase()
                } )
            }
        
            export default Component( extendContext, Template, function( options ) {
                options( {
                    text: '' 
                } );
            } );
        </script>
        `,
        {
            text: 'John Smith'
        }
    );
    expect( html ).toBe( '<p>JOHN SMITH</p><!--0-->' );

    delete window.Inner;
} );
