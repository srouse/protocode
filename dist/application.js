



var init = function () {
    RouteState.listenToHash( function ( route , prev_route ) {
        load_comps();
    });
};

var skipped_comps = {};
function load_comps () {

    //figure out empty routes...
    for ( var name in RouteState.prev_route ) {
        if ( !RouteState.route[name] ) {
            loadComp(
                RouteState.route[name],
                RouteState.prev_route[name]
            );
        }
    }

    for ( var name in RouteState.route ) {
        if ( !RouteState.isFunction( RouteState.route[name] ) ) {
            loadComp(
                RouteState.route[name],
                RouteState.prev_route[name]
            );
        }
    }

    load_skipped();
}

// help with refreshing...loading things causes sync issues
function load_skipped () {
    for ( var name in skipped_comps ) {
        loadComp(
            skipped_comps[name].comp_str,
            skipped_comps[name].prev_comp_str
        );
    }
}

function cleanUpStaleComps () {
    // clean up stale references
    for ( var comp_ele in all_comps ) {
        if ( $(comp_ele).length == 0 ) {
            delete all_comps[ comp_ele ];
        }
    }
}

var all_comps = {};
function loadComp ( comp_str , prev_comp_str ) {
    var comp = components[comp_str];

    if ( !comp ) {
        var prev_comp = components[prev_comp_str];
        if ( !prev_comp )
            return;
        $(prev_comp.target_ele).html("");
        delete all_comps[prev_comp.target_ele];
    }else{

        if ( $( comp.target_ele ).length == 0 ) {
            skipped_comps[comp_str] = {
                comp_str:comp_str,
                prev_comp_str:prev_comp_str
            };
        }else if (
            comp_str != prev_comp_str ||
            skipped_comps[comp_str]
        ) {
            all_comps[comp.target_ele] = comp;
            delete skipped_comps[comp_str];
            $.ajax({
                url : comp.url + "?" + Math.random()
                ,dataType: "text"
                ,success : function( content ) {
                    $( comp.target_ele ).html( content );
                    load_skipped();//reload missed comps

                    if ( comp.children ) {
                        for ( var c in comp.children ) {
                            loadComp( comp.children[c] , "" );
                        }
                    }

                    cleanUpStaleComps();
                }
            });
        }

        cleanUpStaleComps();
    }

    if ( window.top != window.self
            && window.top.document.domain == window.self.document.domain ) {
        window.top.compsChanged( all_comps );
    }
}
