
fis.set('project.md5Connector', '-');

//FIS modjs模块化方案
fis.hook('module', {
    mode: 'commonJs'
});

// 所有环境下的配置
fis
    .match('*.js', {
        lint: fis.plugin('js')
    })
    .match(/^\/modules\/(.*)\.(js)$/i,{
        isMod: true,
        id: '$1',
        release: '/js/modules/$1.js'
    })
    .match(/^\/modules\/([^\/]+)\/\1\.(js)$/i,{
        id: '$1'
    })
    .match(/^\/modules\/.+\/images\/(.*)$/, {
        release: '/images/$1'
    })
    .match(/^\/(libs\/.*\.(?:js|swf))$/i, {
        release: '/js/$1'
    })
    .match('*.less', {
        parser: fis.plugin('less'),
        rExt: '.css'
    })
    .match('*.{less,css}', {
        useSprite: true,
        useCache: false
    })
    .match(/.*\.html/, {
        useCache : false
    })
    .match(/^\/page\/(.*)$/i, {
        release: '$1'
    })
    .match('_bak/**', {
        release: false
    })
    .match('README.md', {
        release: false
    });

fis.match('::package', {
    postpackager: fis.plugin('loader', {
        resourceType: 'mod',
        obtainStyle: false
    }),
    spriter: fis.plugin('csssprites')
});

fis
    .match('/libs/{modernizr.custom.js,mod.js}', {
        packTo: '/js/libs.js'
    })
    .match('/modules/{package,utils,app/widgets}/**.js', {
        packTo: '/js/widgets.js'
    })
    .match('/modules/app/{scale,main}.js', {
        packTo: '/js/home.js'
    })
    .match('/modules/app/others.js', {
        packTo: '/js/others.js'
    });

// 不同环境下的配置
fis.media('local')
    .match('*', {
        domain: 'http://80.mainsite.com:8081'
    });

fis.media('develop')
    .match('*', {
        domain: 'http://liulanqi.baidu.com/80'
    })
    .match('*.{js,less,css,jpg,png,gif}', {
        useHash: true
    })
    .match('/libs/**.js', {
        useHash: false
    });

fis.media('master')
    .match('*', {
        domain: 'http://liulanqi.baidu.com/80'
    })
    .match('*.js', {
        optimizer: fis.plugin('uglify-js')
    })
    .match('*.css', {
        optimizer: fis.plugin('clean-css')
    })
    .match('*.{js,less,css,jpg,png,gif}', {
        useHash: true
    })
    .match('/libs/**.js', {
        useHash: false
    });
	
