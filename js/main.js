require([], function() {

    var isMobileInit = false;
    var loadMobile = function() {
        require([codingConfig.rootUrl + 'js/mobile.js'], function(mobile) {
            mobile.init();
            isMobileInit = true;
        });
    }
    var isPCInit = false;
    var loadPC = function() {
        require([codingConfig.rootUrl + 'js/pc.js'], function(pc) {
            pc.init();
            isPCInit = true;
        });
    }

    var browser = {
        versions: function() {
            var u = window.navigator.userAgent;
            return {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者安卓QQ浏览器
                iPad: u.indexOf('iPad') > -1, //是否为iPad
                webApp: u.indexOf('Safari') == -1, //是否为web应用程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') == -1 //是否为微信浏览器
            };
        }()
    }

    // TODO: HACK IE Bug
    // http://stackoverflow.com/questions/19377810/ie-10-11-make-fixed-backgrounds-jump-when-scrolling-with-mouse-wheel
    // 缺陷：导致scroll监听失效，所以移除在IE下的导航条
    $(function() {
        // 解决IE浏览器左侧扩展栏的BUG
        if (browser.versions.trident) {
            var $scroll = $("#scroll");
            $scroll.find('i.fa-arrow-up').on('click', function() {
                // 如果正在执行动画效果或者滚动条已经到顶部了不在重复执行动画
                if ($("body:animated").length > 0 || $('body').scrollTop() <= 0) return false;
                $('body').animate({
                    scrollTop: 0
                }, 1000);
                return false;
            });
            console.log("HACK IE BUG.")
            console.log("reference:")
            console.log("http://stackoverflow.com/questions/18907131/detecting-ie11-using-css-capability-feature-detection/27315792#27315792")
            console.log("http://stackoverflow.com/questions/19377810/ie-10-11-make-fixed-backgrounds-jump-when-scrolling-with-mouse-wheel");
        }
    })

    $(window).bind("resize", function() {
        if (isMobileInit && isPCInit) {
            $(window).unbind("resize");
            return;
        }
        var w = $(window).width();
        if (w >= 800) {
            loadPC();
        } else {
            loadMobile();
        }
    });

    if (browser.versions.mobile === true || $(window).width() < 800) {
        loadMobile();
    } else {
        loadPC();
    }

    //是否使用fancybox
    if (codingConfig.fancybox === true) {
        require([codingConfig.rootUrl + 'fancybox/jquery.fancybox.js'], function(pc) {
            var isFancy = $(".isFancy");
            if (isFancy.length != 0) {
                var imgArr = $(".article-inner img");
                for (var i = 0, len = imgArr.length; i < len; i++) {
                    var src = imgArr.eq(i).attr("src");
                    var title = imgArr.eq(i).attr("alt");
                    imgArr.eq(i).replaceWith("<a href='" + src + "' title='" + title + "' rel='fancy-group' class='fancy-ctn fancybox'><img src='" + src + "' title='" + title + "'></a>");
                }

                // FIX IE Fancybox BUG
                // http://stackoverflow.com/questions/13547007/fancybox2-fancybox-causes-page-to-to-jump-to-the-top/17458177#17458177
                $(".article-inner .fancy-ctn").fancybox({
                    helpers: {
                        overlay: {
                            locked: false
                        }
                    }
                });
            }
            //左侧分享微信图标弹出微信二维码
            var $weChat = $("a.wechat");
            if ($weChat.length > 0) {
                $weChat.attr('title', "使用“扫一扫”即可关注微信订阅号").fancybox({
                    helpers: {
                        overlay: {
                            locked: false
                        }
                    }
                });
            }
        });
    }
    //是否开启动画
    if (codingConfig.animate === true) {
        require([codingConfig.rootUrl + 'js/jquery.lazyload.js'], function() {
            //avatar
            $(".js-avatar").attr("src", $(".js-avatar").attr("lazy-src"));
            $(".js-avatar")[0].onload = function() {
                $(".js-avatar").addClass("show");
            }
        });

        if (codingConfig.isHome === true) {
            // 滚动条监听使用scrollreveal.js
            // https://github.com/jlmakes/scrollreveal.js
            // 使用cdn[//cdn.bootcss.com/scrollReveal.js/3.0.5/scrollreveal.js]
            require([
                '//cdn.bootcss.com/scrollReveal.js/3.0.5/scrollreveal.js'
            ], function(ScrollReveal) {
                // 更多animation:
                // http://daneden.github.io/animate.css/
                var animationNames = [
                        "pulse", "fadeIn", "fadeInRight", "flipInX", "lightSpeedIn", "rotateInUpLeft", "slideInUp", "zoomIn",
                    ],
                    len = animationNames.length,
                    randomAnimationName = animationNames[Math.ceil(Math.random() * len) - 1];

                // ie9 不支持css3 keyframe动画, safari不支持requestAnimationFrame, 不使用随机动画，切回原来的动画
                if (!window.requestAnimationFrame) {
                    $('.body-wrap > article').css({
                        opacity: 1
                    });

                    if (navigator.userAgent.match(/Safari/i)) {
                        function showArticle() {
                            $(".article").each(function() {
                                if ($(this).offset().top <= $(window).scrollTop() + $(window).height() && !($(this).hasClass('show'))) {
                                    $(this).removeClass("hidden").addClass("show");
                                    $(this).addClass("is-hiddened");
                                } else {
                                    if (!$(this).hasClass("is-hiddened")) {
                                        $(this).addClass("hidden");
                                    }
                                }
                            });
                        }
                        $(window).on('scroll', function() {
                            showArticle();
                        });
                        showArticle();
                    }
                    return;
                }
                // document.body有些浏览器不支持监听scroll，所以使用默认的document.documentElement
                ScrollReveal({
                    duration: 0,
                    afterReveal: function(domEl) {
                        // safari不支持requestAnimationFrame不支持document.documentElement的onscroll所以这里不会执行
                        // 初始状态设为opacity: 0, 动画效果更平滑一些(由于脚本加载是异步，页面元素渲染后在执行动画，感觉像是延时)
                        $(domEl).addClass('animated ' + randomAnimationName).css({
                            opacity: 1
                        });
                    }
                }).reveal('.body-wrap > article');

            });
        } else {
            $('.body-wrap > article').css({
                opacity: 1
            });
        }

    }

    // 是否新窗口打开链接
    if (codingConfig.open_in_new == true) {
        $(".article a[href]").attr("target", "_blank")
    }
    $(".archive-article-title").attr("target", "_blank");

    // 首页摘要内容不显示在正文中
    // TODO: 这里的操作在以后自定义自己的主题中需要主要预先处理
    // 或者更好的办法是用CSS处理
    // $('.article-entry #more').prev('p').hide();
    //已经使用下面的CSS解决
    // .article-entry p:first-child {
    //     display: none;
    // }
});