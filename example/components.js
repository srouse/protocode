


var components = {

    shell:{
        url:"myapp/shell/shell.html",
        css:"myapp/shell/shell.less",
        target_ele:"body"
    },


    dashboard:{
        url:"myapp/dashboard/dashboard.html",
        css:"myapp/dashboard/dashboard.less",
        target_ele:".myappMainContentContainer"
    }

};

// Configuration for your RouteState routes...
var route_configs = {

    // main content area
    page:{
        weight: 10,
        values:[
            "dashboard"
        ]
    },

    // fake incoming notifications
    notifications:{
        values:["active"]
    },

    // fake search results
    search_results:{
        values:["show_results"],
        show_in_hash:false
    }

}
