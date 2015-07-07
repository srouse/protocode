

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
