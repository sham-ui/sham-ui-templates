import { compile, compileAsSFC, compileWithOptions, renderComponent } from './helpers';

beforeEach( () => {
    window.LinkTo = compile`
        <a href={{url}}>
            {% defblock %}
        </a>
    `;

    window.DisplayContent = compile`
        {% if condition %}
            {% defblock %}
        {% endif %}
    `;
    window.TextContent = compile`
        <span>
            {% defblock %}
        </span>
    `;
} );

afterEach( () => {
    delete window.LinkTo;
    delete window.DisplayContent;
    delete window.TextContent;
} );

it( 'should work with {% default %}', () => {
    const { html } = renderComponent(
        compile`
            <div>
                <LinkTo>
                    {% default %}
                        Text for content
                    {% end default %}
                </LinkTo>
            </div>
        `,
        {}
    );
    expect( html ).toBe(
        '<div><a> Text for content <!--0--></a></div>'
    );
} );

it( 'should work with two named blocks', () => {
    window.CustomPanel = compile`
        <div>
            <div class="title">
                {% defblock title %}
            </div>
            <div class="content">
                {% defblock %}
            </div>
        </div>
    `;
    const { html } = renderComponent(
        compile`
            <div>
                <CustomPanel>
                    {% title %}
                        Text for title
                    {% end title %}

                    {% default %}
                        Text for content
                    {% end default %}
                </CustomPanel>
            </div>
        `,
        {}
    );
    expect( html ).toBe(
        // eslint-disable-next-line max-len
        '<div><div><div class="title"> Text for title <!--0--></div><div class="content"> Text for content <!--1--></div></div></div>'
    );
    delete window.CustomPanel;
} );

it( 'should work with component arguments', () => {
    const { html, component } = renderComponent(
        compile`
            <div>
                <LinkTo url={{url}}>
                    {% default %}
                        Text for {{url}}
                    {% end default %}
                </LinkTo>
            </div>
        `,
        {
            url: 'http://example.com'
        }
    );
    expect( html ).toBe(
        '<div><a href="http://example.com"> Text for http://example.com <!--0--></a></div>'
    );

    component.update( {
        url: 'http://foo.example.com'
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://foo.example.com"> Text for http://foo.example.com <!--0--></a></div>'
    );
} );

it( 'should work with component default block', () => {
    const { html, component } = renderComponent(
        compile`
            <div>
                <LinkTo url={{url}}>
                    Text for {{url}}
                </LinkTo>
            </div>
        `,
        {
            url: 'http://example.com'
        }
    );
    expect( html ).toBe(
        '<div><a href="http://example.com"> Text for http://example.com<!--0--></a></div>'
    );

    component.update( {
        url: 'http://foo.example.com'
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div><a href="http://foo.example.com"> Text for http://foo.example.com<!--0--></a></div>'
    );
} );

it( 'should remove block in if', () => {
    window.VisibleBlock = compile`
        {% if visible %}
            <div class="content">
                {% defblock %}
            </div>
        {% endif %}
    `;
    const { html, component } = renderComponent(
        compile`
            <VisibleBlock visible={{visible}}>
                Text content for {{data}}
            </VisibleBlock>
        `,
        {
            visible: true,
            data: 'foo'
        }
    );
    expect( html ).toBe(
        '<div class="content"> Text content for foo<!--0--></div><!--0--><!--0-->'
    );

    component.update( {
        visible: false,
        data: 'foz'
    } );
    expect( component.ctx.container.innerHTML ).toBe( '<!--0--><!--0-->' );

    component.update( {
        visible: true,
        data: 'foo'
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        '<div class="content"> Text content for foo<!--0--></div><!--0--><!--0-->'
    );
    delete window.VisibleBlock;
} );

it( 'should work with two nested if', () => {
    window.BigRedButton = compile`
        {% if big %}
            {% if red %} 
                <button class="big red">This button big={{big}}, red={{red}}{% defblock %}</button>
            {% endif %}
        {% endif %}
    `;
    const { html, component } = renderComponent(
        compile`
            <BigRedButton big={{big}} red={{red}}>
                big && red
            </BigRedButton>
        `,
        {
            big: false,
            red: false
        }
    );
    expect( html ).toBe( '<!--0--><!--0-->' );

    component.update( {
        big: true
    } );
    expect( component.ctx.container.innerHTML ).toBe( '<!--0--><!--0--><!--0-->' );

    component.update( {
        red: true
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<button class="big red">This button big=true, red=true big &amp;&amp; red <!--0--></button><!--0--><!--0--><!--0-->'
    );
    delete window.BigRedButton;
} );

it( 'should work with defblock nested in useblock', () => {
    window.LoadedContainer = compile`
        {% if loaded %}
            {% defblock %}
        {% endif %}
    `;
    window.LoadedVisibleContainer = compile`
        <LoadedContainer loaded={{loaded}}>
            {% if visible %}
                {% defblock %}
            {% endif %}
        </LoadedContainer>
    `;
    window.RedLoadedVisibleContainer = compile`
        <LoadedVisibleContainer loaded={{loaded}} visible={{visible}}>
            {% if red %}
                {% defblock %}            
            {% endif %}
        </LoadedVisibleContainer>
    `;
    const { html, component } = renderComponent(
        compile`
            <RedLoadedVisibleContainer loaded={{loaded}} visible={{visible}} red={{red}}>
                red && loaded & visible
            </RedLoadedVisibleContainer>
        `,
        {
            red: false,
            loaded: false,
            visible: false
        }
    );
    expect( html ).toBe(
        // eslint-disable-next-line max-len
        '<!--0--><!--0--><!--0--><!--0-->'
    );

    component.update( {
        loaded: true
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        '<!--0--><!--0--><!--0--><!--0--><!--0--><!--0-->'
    );

    component.update( {
        visible: true
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        '<!--0--><!--0--><!--0--><!--0--><!--0--><!--0--><!--0--><!--0-->'
    );
    component.update( {
        red: true
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        ' red &amp;&amp; loaded &amp; visible <!--0--><!--0--><!--0--><!--0--><!--0--><!--0--><!--0--><!--0--><!--0-->'
    );
    delete window.LoadedContainer;
    delete window.LoadedVisibleContainer;
    delete window.RedLoadedVisibleContainer;
} );

it( 'should work with for', () => {
    const { html, component } = renderComponent(
        compile`
            <ul>
                {% for url of links %}
                    <li>
                        <LinkTo url={{url}}>Text for {{url}}</LinkTo>
                    </li>
                {% endfor %}
            </ul>
            <LinkTo url="http://example.com">Home</LinkTo>
        `,
        {
            links: [
                'http://foo.example.com',
                'http://bar.example.com',
                'http://baz.example.com'
            ]
        }
    );
    expect( html ).toBe(
        '<ul>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://foo.example.com">Text for http://foo.example.com<!--0--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://bar.example.com">Text for http://bar.example.com<!--0--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://baz.example.com">Text for http://baz.example.com<!--0--></a></li>' +
        '</ul>' +
        '<a href="http://example.com">Home<!--0--></a><!--0-->'
    );

    component.update( {
        links: [
            'http://baz.example.com',
            'http://bar.example.com',
            'http://foo.example.com'
        ]
    } );
    expect( component.ctx.container.innerHTML ).toBe(
        '<ul>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://baz.example.com">Text for http://baz.example.com<!--0--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://bar.example.com">Text for http://bar.example.com<!--0--></a></li>' +
            // eslint-disable-next-line max-len
            '<li><a href="http://foo.example.com">Text for http://foo.example.com<!--0--></a></li>' +
        '</ul>' +
        '<a href="http://example.com">Home<!--0--></a><!--0-->'
    );
} );

it( 'should work useblock if was update from block component', () => {
    const { component, DI } = renderComponent(
        compile`
            <DisplayContent>
                Content
            </DisplayContent>
        `,
        {

        }
    );
    expect( component.ctx.container.textContent.trim() ).toBe( '' );

    const displayContent = Array.from( DI.resolve( 'sham-ui:store' ).byId.values() ).find(
        x => x instanceof window.DisplayContent
    );
    displayContent.update( { condition: true } );
    expect( component.ctx.container.textContent.trim() ).toBe( 'Content' );

    displayContent.update( { condition: false } );
    expect( component.ctx.container.textContent.trim() ).toBe( '' );
} );


it( 'should correct resolve owner', () => {
    const { component } = renderComponent(
        compileAsSFC`
            <template>
                <TextContent>
                    <TextContent>
                        {{this._text()}}
                    </TextContent>
                </TextContent>
            </template>
            
            <script>
                export default Component( Template, function( options ) {
                    options( {
                        text: () => 'Text for content'
                    } );
                    this._text = () => this.options.text();
                } )
            </script>
        `
    );
    expect( component.ctx.container.textContent.trim() ).toBe( 'Text for content' );
} );


it( 'should work with compound components pattern', () => {
    window.SelectItems = compileAsSFC`
        <template>
            {% defblock this.dataForBlock( selected, onChange ) %}
        </template>
        <script>
            export default Component( Template, function( options ) { 
                const state = options( {
                    onChange() {},
                    selected: -1
                } );
                
                this.dataForBlock = ( selected, onChange ) => ( {
                    selected,
                    onSelect( item ) {
                        state.selected = item;
                        onChange( item )
                    }
                } )
            } );
        </script>
    `;
    window.Item = compileWithOptions( {
        asSingleFileComponent: true,
        asModule: false,
        removeDataTest: false
    } )`
        <template>
            <button :onclick={{this.onClick}} class={{selected == item ? 'active' : '' }} data-test-btn={{item}}>
                {{item}}
            </button>
        </template>
        <script>
            export default Component( Template, function( options ) { 
                const state = options( {
                    onSelect() {},
                    item: null,
                    selected: -1
                } );
                
                this.onClick = ( e ) => state.onSelect( state.item );
            } );
        </script>
    `;

    const onChange = jest.fn();
    const { component, html } = renderComponent(
        compile`
            <SelectItems selected={{selected}} onChange={{onChange}}>
                {% for item of items %}
                    <Item item={{item}}/>
                {% endfor %}
            </SelectItems>
        `,
        {
            onChange,
            items: [ 1, 2, 3 ],
            selected: 1
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
    expect( html ).toBe(
        '<button data-test-btn="1" class="active">1</button>' +
        '<!--0--><button data-test-btn="2" class="">2</button>' +
        '<!--0--><button data-test-btn="3" class="">3</button><!--0--><!--0--><!--0--><!--0-->'
    );
    component.ctx.container.querySelector( '[data-test-btn="2"]' ).click();
    expect( component.ctx.container.innerHTML ).toBe(
        '<button data-test-btn="1" class="">1</button>' +
        '<!--0--><button data-test-btn="2" class="active">2</button>' +
        '<!--0--><button data-test-btn="3" class="">3</button><!--0--><!--0--><!--0--><!--0-->'
    );
    expect( onChange ).toHaveBeenCalledTimes( 1 );
    expect( onChange ).toHaveBeenCalledWith( 2 );

    delete window.SelectItems;
    delete window.Item;
} );

it( 'should work with block data', () => {
    window.Label = compile`
        <span>{% defblock { text: text + '!' } %}</span>
    `;

    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}>
                {% default with labelData %}
                    Block data: {{labelData.text}}
                {% end default %}
            </Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span> Block data: foo! <!--0--></span><!--0-->' );

    delete window.Label;
} );

it( 'should work wit {% blockName %} syntax', () => {
    window.Label = compile`
        <span>{% defblock content %}</span>
    `;

    const { html } = renderComponent(
        compile`
            <Label>
                {% content %}
                    Block data: {{ text }}
                {% end content %}
            </Label>
        `,
        {
            text: 'foo'
        }
    );
    expect( html ).toBe( '<span> Block data: foo <!--0--></span><!--0-->' );

    delete window.Label;
} );

it( 'should work wit {% blockName %} syntax and block data', () => {
    window.Label = compile`
        <span>{% defblock content { text: text + '!' } %}</span>
    `;

    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}>
                {% content with labelData %}
                    Block data: {{labelData.text}}
                {% end content %}
            </Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span> Block data: foo! <!--0--></span><!--0-->' );

    delete window.Label;
} );

it( 'should work with default blocks & usage block', () => {
    window.Label = compile`
        <span>
            {{ text }}
            {% block %}
                Default value
            {% endblock %}
        </span>
    `;
    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}>
                Not default!
            </Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span>foo Not default! <!--0--></span><!--0-->' );

} );

it( 'should work with default blocks & not usage block', () => {
    window.Label = compile`
        <span>
            {{ text }}
            {% block content %}
                Default value
            {% endblock %}
        </span>
    `;
    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}></Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span>foo Default value <!--0--></span><!--0-->' );
} );

it( 'should work with default block "default" & not usage block', () => {
    window.Label = compile`
        <span>
            {{ text }}
            {% block %}
                Default value
            {% endblock %}
        </span>
    `;
    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}></Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span>foo Default value <!--0--></span><!--0-->' );
} );

it( 'should work with default block "default" & not usage block in onetag component', () => {
    window.Label = compile`
        <span>
            {{ text }}
            {% block %}
                Default value
            {% endblock %}
        </span>
    `;
    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}/>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span>foo Default value <!--0--></span><!--0-->' );
} );


it( 'should work with default block with variable & not usage block', () => {
    window.Label = compile`
        <span>
            {% block %}
                Default value and {{text}}
            {% endblock %}
        </span>
    `;
    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}></Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span> Default value and foo <!--0--></span><!--0-->' );
} );

it( 'should work with default block with variable & usage block', () => {
    window.Label = compile`
        <span>
            {% block %}
                Default value and {{text}}
            {% endblock %}
        </span>
    `;
    const { html } = renderComponent(
        compile`
            <Label text={{textForLabel}}>
                Custom
            </Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    expect( html ).toBe( '<span> Custom <!--0--></span><!--0-->' );
} );

it( 'should work with default block with variable & update', () => {
    window.Label = compile`
        <span>
            {% block %}
                Default value and {{text}}
            {% endblock %}
        </span>
    `;
    const { component } = renderComponent(
        compile`
            <Label text={{textForLabel}}></Label>
        `,
        {
            textForLabel: 'foo'
        }
    );
    component.update( { textForLabel: 'bar' } );
    expect( component.ctx.container.innerHTML ).toBe(
        '<span> Default value and bar <!--0--></span><!--0-->'
    );
} );

it( 'should work with default block two level & usage inner level', () => {
    window.Label = compile`
        {% block buttons %}
            {% block ok %}
                {{ ok }}
            {% endblock %}
        
            {% block cancel %}
                Cancel
            {% endblock %}
        {% endblock %}
    `;
    const { html } = renderComponent(
        compile`
            <Label ok={{textForOk}}>
                {% ok %}
                    Confirm
                {% end ok %}
            </Label>
        `,
        {
            textForOk: 'foo'
        }
    );
    expect( html ).toBe(
        '  Confirm <!--0-->  Cancel <!--1--> <!--0--><!--0-->'
    );
} );


it( 'should work with default block two level & usage outer level', () => {
    window.Label = compile`
        {% block buttons %}
            {% block ok %}
                {{ ok }}
            {% endblock %}
        
            {% block cancel %}
                Cancel
            {% endblock %}
        {% endblock %}
    `;
    const { html } = renderComponent(
        compile`
            <Label ok={{textForOk}}>
                {% buttons %}
                    Loader
                {% end buttons %}
            </Label>
        `,
        {
            textForOk: 'foo'
        }
    );
    expect( html ).toBe( ' Loader <!--0--><!--0-->' );
} );


it( 'should work with default block two level & not usage', () => {
    window.Label = compile`
        {% block buttons %}
            {% block ok %}
                {{ ok }}
            {% endblock %}
        
            {% block cancel %}
                Cancel
            {% endblock %}
        {% endblock %}
    `;
    const { html } = renderComponent(
        compile`
            <Label ok={{textForOk}}/>
        `,
        {
            textForOk: 'OK'
        }
    );
    expect( html ).toBe( '  OK <!--0-->  Cancel <!--1--> <!--0--><!--0-->' );
} );
