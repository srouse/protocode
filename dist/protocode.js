
function routeChanged ( route , prev_route ) {
    //var html = ["width" + $(window).width() + "|height" + $(window).height()];
    var html = [];

    html.push(
        "<div class='state_item hand' onclick='RouteState.replace({})'>"
        + "Clear All"
        + "</div>"
    );

    for ( var s in route_configs ) {

        if ( route_configs[s].values ) {
            if ( route[s] ) {
                var next_value = "";
                var index = route_configs[s].values.indexOf( route[s] );
                if ( index == route_configs[s].values.length-1 ) {
                    next_value = "";
                }else if ( index != -1 ) {
                    next_value = route_configs[s].values[index+1];
                }

                html.push(
                    "<div class='state_item active hand' "
                    + "onclick='RouteState.merge({"
                    + s + ":\"" + next_value + "\"})'>"
                    + s + ": " + route[s]
                    + "</div>"
                );
            }else{
                var next_value = route_configs[s].values[0];

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

function revealDOMEle ( ele ) {
    $(".app").contents().find( ele ).css("border","2px solid yellow");
}
function unrevealDOMEle ( ele ) {
    $(".app").contents().find( ele ).css("border","");
}

function compsChanged( all_comps ) {
    var html = [],comp;
    for ( var name in all_comps ) {
        comp = all_comps[name];
        html.push( "<div class='hand' "
            + "onmouseover='revealDOMEle(\""
            + comp.target_ele
            + "\")'"
            + "onmouseout='unrevealDOMEle(\""
            + comp.target_ele
            + "\")'"
            + "onclick='showCode(\""
            + comp.url +"\")'>"
            + name + "<div style='font-size: 12px;'>"
            + comp.url
            +"</div></div>"
        );
    }
    $(".components").html( html.join("<br/>"));
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/    /g, "\t" );
}

function showCode( url ) {
    $(".codeModal").show();
    $.ajax({
        url : url + "?" + Math.random()
        ,dataType: "text"
        ,success : function( content ) {
            $(".codeModal .codeModal_content").html(
                "<pre><code data-language='html''>" +
                htmlEntities( content ) +
                "</pre></code>"
            );
            Rainbow.color();
        }
    });
}

function revealAppSize() {
    $(".size_display").html(
        $(".app").width() + " width "
        + $(".app").height() + " height "
    );
}

$( document ).ready( function () {
    RouteState.config( route_configs );
    RouteState.listenToHash( function ( route , prev_route ) {
        routeChanged( route , prev_route );
    });

    $( window ).resize( function () {
        revealAppSize();
    });
    revealAppSize();
});
