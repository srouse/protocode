


var component_configs = {
    index:{//this gets loaded into iframe...
        url:"myapp/index.html",
        children:["shell"]
    },
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
