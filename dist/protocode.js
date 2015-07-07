

var ProtoCode = function(){};

ProtoCode.prototype.init = function (
    component_configs,
    route_configs,
    rivets_obj
) {
    this.component_configs = component_configs;
    this.route_configs = route_configs;

    this.use_rivets = false;
    if ( rivets_obj ) {
        this.use_rivets = true;
        this.rivets_obj = rivets_obj;
    }

    //give some kind of hook (without a framework)
    document.protocode = this;
    var me = this;
    $( document ).ready( function () {
        me.render();

        // make sure app iframe is loaded before setup
        $(".app").load( function () {
            me.iframeDOM = $(".app").contents();
            $(".app")[0].contentWindow.document.RouteState
                = RouteState;
            me.loadCompChildren( "index" );

            RouteState.config( me.route_configs );
            RouteState.listenToHash(
                function ( route , prev_route ) {
                    me.routeChanged( route , prev_route );
                    me.load_comps();
                    route.toElementClass( me.iframeDOM.find("body") );
                }
            );
        });

        $( window ).resize( function () {
            me.revealAppSize();
        });
        me.revealAppSize();
    });
}

ProtoCode.prototype.render = function ( route , prev_route ) {
    $('body').html(
        '<div class="protocode">' +
            '<div class="protocode_nav">' +
                '<div class="components"></div>' +
                '<div class="state"></div>' +
                '<div class="resizers">' +
                    '<div class="resizers_btn"' +
                        'onclick="$(\'.app\')' +
                            '.removeClass()' +
                            '.addClass(\'app\');' +
                            'protocode.revealAppSize();">web</div>' +
                    '<div class="resizers_btn"' +
                        'onclick="$(\'.app\')' +
                            '.removeClass()' +
                            '.addClass(\'app tablet\');' +
                            'protocode.revealAppSize();">tablet</div>' +
                    '<div class="resizers_btn"' +
                        'onclick="$(\'.app\')' +
                            '.removeClass()' +
                            '.addClass(\'app mobile\');' +
                            'protocode.revealAppSize();">mobile</div>' +
                '</div>' +
                '<div class="size_display"></div>' +
            '</div>' +
            '<iframe src="' + this.component_configs['index'].url + '?v' + Math.random()
                + '" class="app" id="app"></iframe>' +
        '</div>' +
        '<div class="codeModal"' +
            'onclick="$(this).hide()">' +
            '<div class="codeModal_content"' +
                'onclick="event.stopPropagation()"></div>' +
        '</div>'
    );
}


ProtoCode.prototype.routeChanged = function ( route , prev_route ) {
    var html = [];

    html.push(
        "<div class='state_item hand' "
        + "onclick='RouteState.replace({})'>"
        + "Clear All"
        + "</div>"
    );

    for ( var s in this.route_configs ) {
        if ( this.route_configs[s].values ) {
            if ( route[s] ) {
                var next_value = "";
                var index = this.route_configs[s].values.indexOf( route[s] );
                if ( index == this.route_configs[s].values.length-1 ) {
                    next_value = "";
                }else if ( index != -1 ) {
                    next_value = this.route_configs[s].values[index+1];
                }

                html.push(
                    "<div class='state_item active hand' "
                    + "onclick='RouteState.merge({"
                    + s + ":\"" + next_value + "\"})'>"
                    + s + ": " + route[s]
                    + "</div>"
                );
            }else{
                var next_value = this.route_configs[s].values[0];

                html.push(
                    "<div class='state_item hand' onclick='RouteState.merge({"
                    + s + ":\""+ next_value +"\"})'>"
                    + s + ": "
                    + "</div>"
                );
            }
        }else{
            html.push(
                "<div class='state_item' onclick='RouteState.merge({"
                + s + ":\"\"})'>"
                + s + ": (no values set)"
                + "</div>"
            );
        }
    }

    $(".state").html( html.join("<br/>") );
}

ProtoCode.prototype.revealDOMEle = function ( ele ) {
    //$(".app").contents().find( ele ).css("border","2px solid yellow");
}
ProtoCode.prototype.unrevealDOMEle = function ( ele ) {
    //$(".app").contents().find( ele ).css("border","");
}

ProtoCode.prototype.compsChanged = function ( all_comps ) {
    var html = [],comp;
    for ( var name in all_comps ) {
        comp = all_comps[name];
        html.push( "<div class='hand' "
            + "onmouseover='protocode.revealDOMEle(\""
            + comp.target_ele
            + "\")'"
            + "onmouseout='protocode.unrevealDOMEle(\""
            + comp.target_ele
            + "\")'"
            + "onclick='protocode.showCode(\""
            + comp.url +"\")'>"
            + name + "<div style='font-size: 12px;'>"
            + comp.url
            +"</div></div>"
        );
    }
    $(".components").html( html.join("<br/>"));
}

ProtoCode.prototype.htmlEntities = function (str) {
    return String(str).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/    /g, "\t" );
}

ProtoCode.prototype.showCode = function ( url ) {
    $(".codeModal").show();
    var me = this;
    $.ajax({
        url : url + "?" + Math.random()
        ,dataType: "text"
        ,success : function( content ) {
            $(".codeModal .codeModal_content").html(
                "<pre><code data-language='html''>" +
                me.htmlEntities( content ) +
                "</pre></code>"
            );
            Rainbow.color();
        }
    });
}

ProtoCode.prototype.revealAppSize = function () {
    $(".size_display").html(
        $(".app").width() + " width "
        + $(".app").height() + " height "
    );
}


// ================COMPONENT LOADING....
ProtoCode.prototype.skipped_comps = {};
ProtoCode.prototype.load_comps = function() {

    //figure out empty routes...
    for ( var name in RouteState.prev_route ) {
        if ( !RouteState.route[name] ) {
            this.loadComp(
                RouteState.route[name],
                RouteState.prev_route[name]
            );
        }
    }

    for ( var name in RouteState.route ) {
        if ( !RouteState.isFunction( RouteState.route[name] ) ) {
            this.loadComp(
                RouteState.route[name],
                RouteState.prev_route[name]
            );
        }
    }

    this.load_skipped();
}

// help with refreshing...loading things causes sync issues
ProtoCode.prototype.load_skipped = function() {
    for ( var name in this.skipped_comps ) {
        this.loadComp(
            this.skipped_comps[name].comp_str,
            this.skipped_comps[name].prev_comp_str
        );
    }
}

ProtoCode.prototype.cleanUpStaleComps = function() {
    // clean up stale references
    for ( var comp_ele in this.all_comps ) {
        if ( this.iframeDOM.find(comp_ele).length == 0 ) {
            delete this.all_comps[ comp_ele ];
        }
    }
}


ProtoCode.prototype.revertEleContent = function ( domEle_str ) {
    var domEle = this.iframeDOM.find( domEle_str );

    // see if there was something there before
    if (
        domEle
        && this.use_rivets
        && domEle.data( "rivets_view" )
    ) {
        domEle.data( "rivets_view" ).unbind();
    }

    if ( domEle_str == "body" ) {
        domEle.html( "" );
    }else{
        content = $("<div />");
        domEle = content.replaceAll( domEle );
        // only class names are accepted for now...
        domEle.addClass( domEle_str.replace(/\./g,'') );
    }
}
ProtoCode.prototype.changeEleContent = function ( domEle_str , content ) {
    var domEle = this.iframeDOM.find( domEle_str );

    // see if there was something there before
    if (
        domEle
        && this.use_rivets
        && domEle.data( "rivets_view" )
    ) {
        domEle.data( "rivets_view" ).unbind();
    }

    // body and empty content is special case
    if (
        domEle_str == "body"
        || content == ""
    ) {
        domEle.html( content );
    }else{
        // protect against all kinds of validation failures....
        try {
            contentEle = $(content);
        }catch( error ) {
            contentEle = $("<div>" + content + "</div>");
        }
        // just strings make it through this...
        if ( contentEle.length == 0 ) {
            contentEle = $("<div>" + content + "</div>");
        }

        domEle = contentEle.replaceAll( domEle );
        domEle.addClass( domEle_str.replace(/\./g,'') );
    }

    if (
        this.use_rivets
    ) {
        var view = rivets.bind( domEle , this.rivets_obj );
        domEle.data( "rivets_view" ,  view );
    }
}

ProtoCode.prototype.all_comps = {};
ProtoCode.prototype.loadComp = function( comp_str , prev_comp_str ) {
    var comp = this.component_configs[comp_str];

    if ( !comp ) {

        var prev_comp = this.component_configs[prev_comp_str];
        if ( !prev_comp )
            return;

        //var domEle = this.iframeDOM.find( prev_comp.target_ele );
        this.revertEleContent(
            prev_comp.target_ele
        )

        delete this.all_comps[prev_comp.target_ele];

    }else{

        if ( this.iframeDOM.find( comp.target_ele ).length == 0 ) {

            this.skipped_comps[comp_str] = {
                comp_str:comp_str,
                prev_comp_str:prev_comp_str
            };

        }else if (
            comp_str != prev_comp_str ||
            this.skipped_comps[comp_str]
        ) {
            this.all_comps[comp.target_ele] = comp;
            delete this.skipped_comps[comp_str];
            var me = this;
            $.ajax({
                url : comp.url + "?" + Math.random()
                ,dataType: "text"
                ,success : function( content ) {
                    me.changeEleContent(
                        comp.target_ele,
                        content
                    )

                    me.load_skipped();//reload missed comps
                    me.loadCompChildren( comp_str );
                    me.cleanUpStaleComps();
                }
            });
        }
        this.cleanUpStaleComps();
    }
    this.compsChanged( this.all_comps );
}
ProtoCode.prototype.loadCompChildren = function( comp_str ) {
    var comp = this.component_configs[comp_str];

    if ( comp && comp.children ) {
        for ( var c in comp.children ) {
            this.loadComp( comp.children[c] , "" );
        }
    }
}

/* Rainbow v1.1.9 rainbowco.de */
window.Rainbow=function(){function q(a){var b,c=a.getAttribute&&a.getAttribute("data-language")||0;if(!c){a=a.attributes;for(b=0;b<a.length;++b)if("data-language"===a[b].nodeName)return a[b].nodeValue}return c}function B(a){var b=q(a)||q(a.parentNode);if(!b){var c=/\blang(?:uage)?-(\w+)/;(a=a.className.match(c)||a.parentNode.className.match(c))&&(b=a[1])}return b}function C(a,b){for(var c in e[d]){c=parseInt(c,10);if(a==c&&b==e[d][c]?0:a<=c&&b>=e[d][c])delete e[d][c],delete j[d][c];if(a>=c&&a<e[d][c]||
b>c&&b<e[d][c])return!0}return!1}function r(a,b){return'<span class="'+a.replace(/\./g," ")+(l?" "+l:"")+'">'+b+"</span>"}function s(a,b,c,h){var f=a.exec(c);if(f){++t;!b.name&&"string"==typeof b.matches[0]&&(b.name=b.matches[0],delete b.matches[0]);var k=f[0],i=f.index,u=f[0].length+i,g=function(){function f(){s(a,b,c,h)}t%100>0?f():setTimeout(f,0)};if(C(i,u))g();else{var m=v(b.matches),l=function(a,c,h){if(a>=c.length)h(k);else{var d=f[c[a]];if(d){var e=b.matches[c[a]],i=e.language,g=e.name&&e.matches?
e.matches:e,j=function(b,d,e){var i;i=0;var g;for(g=1;g<c[a];++g)f[g]&&(i=i+f[g].length);d=e?r(e,d):d;k=k.substr(0,i)+k.substr(i).replace(b,d);l(++a,c,h)};i?n(d,i,function(a){j(d,a)}):typeof e==="string"?j(d,d,e):w(d,g.length?g:[g],function(a){j(d,a,e.matches?e.name:0)})}else l(++a,c,h)}};l(0,m,function(a){b.name&&(a=r(b.name,a));if(!j[d]){j[d]={};e[d]={}}j[d][i]={replace:f[0],"with":a};e[d][i]=u;g()})}}else h()}function v(a){var b=[],c;for(c in a)a.hasOwnProperty(c)&&b.push(c);return b.sort(function(a,
b){return b-a})}function w(a,b,c){function h(b,k){k<b.length?s(b[k].pattern,b[k],a,function(){h(b,++k)}):D(a,function(a){delete j[d];delete e[d];--d;c(a)})}++d;h(b,0)}function D(a,b){function c(a,b,h,e){if(h<b.length){++x;var g=b[h],l=j[d][g],a=a.substr(0,g)+a.substr(g).replace(l.replace,l["with"]),g=function(){c(a,b,++h,e)};0<x%250?g():setTimeout(g,0)}else e(a)}var h=v(j[d]);c(a,h,0,b)}function n(a,b,c){var d=m[b]||[],f=m[y]||[],b=z[b]?d:d.concat(f);w(a.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/&(?![\w\#]+;)/g,
"&amp;"),b,c)}function o(a,b,c){if(b<a.length){var d=a[b],f=B(d);return!(-1<(" "+d.className+" ").indexOf(" rainbow "))&&f?(f=f.toLowerCase(),d.className+=d.className?" rainbow":"rainbow",n(d.innerHTML,f,function(k){d.innerHTML=k;j={};e={};p&&p(d,f);setTimeout(function(){o(a,++b,c)},0)})):o(a,++b,c)}c&&c()}function A(a,b){var a=a&&"function"==typeof a.getElementsByTagName?a:document,c=a.getElementsByTagName("pre"),d=a.getElementsByTagName("code"),f,e=[];for(f=0;f<d.length;++f)e.push(d[f]);for(f=0;f<
c.length;++f)c[f].getElementsByTagName("code").length||e.push(c[f]);o(e,0,b)}var j={},e={},m={},z={},d=0,y=0,t=0,x=0,l,p;return{extend:function(a,b,c){1==arguments.length&&(b=a,a=y);z[a]=c;m[a]=b.concat(m[a]||[])},b:function(a){p=a},a:function(a){l=a},color:function(a,b,c){if("string"==typeof a)return n(a,b,c);if("function"==typeof a)return A(0,a);A(a,b)}}}();document.addEventListener?document.addEventListener("DOMContentLoaded",Rainbow.color,!1):window.attachEvent("onload",Rainbow.color);
Rainbow.onHighlight=Rainbow.b;Rainbow.addClass=Rainbow.a;

/**
 * HTML patterns
 *
 * @author Craig Campbell
 * @version 1.0.9
 */
Rainbow.extend('html', [
    {
        'name': 'source.php.embedded',
        'matches': {
            2: {
                'language': 'php'
            }
        },
        'pattern': /&lt;\?=?(?!xml)(php)?([\s\S]*?)(\?&gt;)/gm
    },
    {
        'name': 'source.css.embedded',
        'matches': {
            1: {
                'matches': {
                    1: 'support.tag.style',
                    2: [
                        {
                            'name': 'entity.tag.style',
                            'pattern': /^style/g
                        },
                        {
                            'name': 'string',
                            'pattern': /('|")(.*?)(\1)/g
                        },
                        {
                            'name': 'entity.tag.style.attribute',
                            'pattern': /(\w+)/g
                        }
                    ],
                    3: 'support.tag.style'
                },
                'pattern': /(&lt;\/?)(style.*?)(&gt;)/g
            },
            2: {
                'language': 'css'
            },
            3: 'support.tag.style',
            4: 'entity.tag.style',
            5: 'support.tag.style'
        },
        'pattern': /(&lt;style.*?&gt;)([\s\S]*?)(&lt;\/)(style)(&gt;)/gm
    },
    {
        'name': 'source.js.embedded',
        'matches': {
            1: {
                'matches': {
                    1: 'support.tag.script',
                    2: [
                        {
                            'name': 'entity.tag.script',
                            'pattern': /^script/g
                        },

                        {
                            'name': 'string',
                            'pattern': /('|")(.*?)(\1)/g
                        },
                        {
                            'name': 'entity.tag.script.attribute',
                            'pattern': /(\w+)/g
                        }
                    ],
                    3: 'support.tag.script'
                },
                'pattern': /(&lt;\/?)(script.*?)(&gt;)/g
            },
            2: {
                'language': 'javascript'
            },
            3: 'support.tag.script',
            4: 'entity.tag.script',
            5: 'support.tag.script'
        },
        'pattern': /(&lt;script(?! src).*?&gt;)([\s\S]*?)(&lt;\/)(script)(&gt;)/gm
    },
    {
        'name': 'comment.html',
        'pattern': /&lt;\!--[\S\s]*?--&gt;/g
    },
    {
        'matches': {
            1: 'support.tag.open',
            2: 'support.tag.close'
        },
        'pattern': /(&lt;)|(\/?\??&gt;)/g
    },
    {
        'name': 'support.tag',
        'matches': {
            1: 'support.tag',
            2: 'support.tag.special',
            3: 'support.tag-name'
        },
        'pattern': /(&lt;\??)(\/|\!?)(\w+)/g
    },
    {
        'matches': {
            1: 'support.attribute'
        },
        'pattern': /([a-z-]+)(?=\=)/gi
    },
    {
        'matches': {
            1: 'support.operator',
            2: 'string.quote',
            3: 'string.value',
            4: 'string.quote'
        },
        'pattern': /(=)('|")(.*?)(\2)/g
    },
    {
        'matches': {
            1: 'support.operator',
            2: 'support.value'
        },
        'pattern': /(=)([a-zA-Z\-0-9]*)\b/g
    },
    {
        'matches': {
            1: 'support.attribute'
        },
        'pattern': /\s(\w+)(?=\s|&gt;)(?![\s\S]*&lt;)/g
    }
], true);

/**
 * CSS patterns
 *
 * @author Craig Campbell
 * @version 1.0.9
 */
Rainbow.extend('css', [
    {
        'name': 'comment',
        'pattern': /\/\*[\s\S]*?\*\//gm
    },
    {
        'name': 'constant.hex-color',
        'pattern': /#([a-f0-9]{3}|[a-f0-9]{6})(?=;|\s|,|\))/gi
    },
    {
        'matches': {
            1: 'constant.numeric',
            2: 'keyword.unit'
        },
        'pattern': /(\d+)(px|em|cm|s|%)?/g
    },
    {
        'name': 'string',
        'pattern': /('|")(.*?)\1/g
    },
    {
        'name': 'support.css-property',
        'matches': {
            1: 'support.vendor-prefix'
        },
        'pattern': /(-o-|-moz-|-webkit-|-ms-)?[\w-]+(?=\s?:)(?!.*\{)/g
    },
    {
        'matches': {
            1: [
                {
                    'name': 'entity.name.sass',
                    'pattern': /&amp;/g
                },
                {
                    'name': 'direct-descendant',
                    'pattern': /&gt;/g
                },
                {
                    'name': 'entity.name.class',
                    'pattern': /\.[\w\-_]+/g
                },
                {
                    'name': 'entity.name.id',
                    'pattern': /\#[\w\-_]+/g
                },
                {
                    'name': 'entity.name.pseudo',
                    'pattern': /:[\w\-_]+/g
                },
                {
                    'name': 'entity.name.tag',
                    'pattern': /\w+/g
                }
            ]
        },
        'pattern': /([\w\ ,\n:\.\#\&\;\-_]+)(?=.*\{)/g
    },
    {
        'matches': {
            2: 'support.vendor-prefix',
            3: 'support.css-value'
        },
        'pattern': /(:|,)\s*(-o-|-moz-|-webkit-|-ms-)?([a-zA-Z-]*)(?=\b)(?!.*\{)/g
    }
], true);
