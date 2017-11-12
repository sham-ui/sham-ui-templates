import html from './html';
import svg from './svg';
import custom from './custom';

export const HTMLElements = (
    'a abbr address area article aside audio b base bdi bdo big blockquote body br ' +
    'button canvas caption cite code col colgroup data datalist dd del details dfn ' +
    'dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 ' +
    'h6 head header hr html i iframe img input ins kbd keygen label legend li link ' +
    'main map mark menu menuitem meta meter nav noscript object ol optgroup option ' +
    'output p param picture pre progress q rp rt ruby s samp script section select ' +
    'small source span strong style sub summary sup table tbody td textarea tfoot th ' +
    'thead time title tr track u ul var video wbr'
).split( ' ' );

export const SVGElements = (
    'circle clipPath defs ellipse feBlend feColorMatrix feComponentTransfer feComposite ' +
    'feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA ' +
    'feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset ' +
    'fePointLight feSpecularLighting feSpotLight feTile feTurbulence g line linearGradient mask ' +
    'path pattern polygon polyline radialGradient rect stop svg text tspan'
).split( ' ' );

export default {
    Element: ( path ) => {
        if ( HTMLElements.indexOf( path.node.name ) != -1 ) {
            return html.Element( path );
        } else if ( SVGElements.indexOf( path.node.name ) != -1 ) {
            return svg.Element( path );
        } else {
            return custom.Element( path );
        }
    }
};
