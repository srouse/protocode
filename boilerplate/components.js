


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
    },
    navigator:{
        url:"myapp/navigator/navigator.html",
        css:"myapp/navigator/navigator.less",
        target_ele:".myappMainContentContainer"
    },
    notifications:{
        url:"myapp/notifications/notifications.html",
        css:"myapp/notifications/notifications.less",
        target_ele:".myappMainContentContainer"
    },
    search:{
        url:"myapp/search/search.html",
        css:"myapp/search/search.less",
        target_ele:".myappMainContentContainer"
    },
    profile:{
        url:"myapp/profile/profile.html",
        css:"myapp/profile/profile.less",
        target_ele:".myappMainContentContainer"
    }

};

// Configuration for your RouteState routes...
var route_configs = {

    // main content area
    page:{
        weight: 10,
        values:[
            "dashboard",
            "navigator",
            "notifications",
            "search",
            "profile"
        ]
    },

    // fake incoming notifications
    notifications:{
        values:["active"]
    },

    // fake search results
    search_results:{
        values:["show_results"]
    }

}
