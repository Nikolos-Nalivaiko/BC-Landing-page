(() => {
    "use strict";
    class Preloader {
        constructor(preloaderElement, contentElement) {
            this.preloader = preloaderElement;
            this.content = contentElement;
        }
        hide() {
            this.preloader.style.opacity = "0";
            setTimeout((() => {
                this.preloader.style.display = "none";
                this.content.style.display = "block";
                setTimeout((() => {
                    this.content.style.opacity = "1";
                    document.body.style.overflow = "auto";
                }), 50);
            }), 1e3);
        }
    }
    function ssr_window_esm_isObject(obj) {
        return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
    }
    function extend(target, src) {
        if (target === void 0) target = {};
        if (src === void 0) src = {};
        Object.keys(src).forEach((key => {
            if (typeof target[key] === "undefined") target[key] = src[key]; else if (ssr_window_esm_isObject(src[key]) && ssr_window_esm_isObject(target[key]) && Object.keys(src[key]).length > 0) extend(target[key], src[key]);
        }));
    }
    const ssrDocument = {
        body: {},
        addEventListener() {},
        removeEventListener() {},
        activeElement: {
            blur() {},
            nodeName: ""
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        getElementById() {
            return null;
        },
        createEvent() {
            return {
                initEvent() {}
            };
        },
        createElement() {
            return {
                children: [],
                childNodes: [],
                style: {},
                setAttribute() {},
                getElementsByTagName() {
                    return [];
                }
            };
        },
        createElementNS() {
            return {};
        },
        importNode() {
            return null;
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        }
    };
    function ssr_window_esm_getDocument() {
        const doc = typeof document !== "undefined" ? document : {};
        extend(doc, ssrDocument);
        return doc;
    }
    const ssrWindow = {
        document: ssrDocument,
        navigator: {
            userAgent: ""
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        },
        history: {
            replaceState() {},
            pushState() {},
            go() {},
            back() {}
        },
        CustomEvent: function CustomEvent() {
            return this;
        },
        addEventListener() {},
        removeEventListener() {},
        getComputedStyle() {
            return {
                getPropertyValue() {
                    return "";
                }
            };
        },
        Image() {},
        Date() {},
        screen: {},
        setTimeout() {},
        clearTimeout() {},
        matchMedia() {
            return {};
        },
        requestAnimationFrame(callback) {
            if (typeof setTimeout === "undefined") {
                callback();
                return null;
            }
            return setTimeout(callback, 0);
        },
        cancelAnimationFrame(id) {
            if (typeof setTimeout === "undefined") return;
            clearTimeout(id);
        }
    };
    function ssr_window_esm_getWindow() {
        const win = typeof window !== "undefined" ? window : {};
        extend(win, ssrWindow);
        return win;
    }
    function utils_classesToTokens(classes) {
        if (classes === void 0) classes = "";
        return classes.trim().split(" ").filter((c => !!c.trim()));
    }
    function deleteProps(obj) {
        const object = obj;
        Object.keys(object).forEach((key => {
            try {
                object[key] = null;
            } catch (e) {}
            try {
                delete object[key];
            } catch (e) {}
        }));
    }
    function utils_nextTick(callback, delay) {
        if (delay === void 0) delay = 0;
        return setTimeout(callback, delay);
    }
    function utils_now() {
        return Date.now();
    }
    function utils_getComputedStyle(el) {
        const window = ssr_window_esm_getWindow();
        let style;
        if (window.getComputedStyle) style = window.getComputedStyle(el, null);
        if (!style && el.currentStyle) style = el.currentStyle;
        if (!style) style = el.style;
        return style;
    }
    function utils_getTranslate(el, axis) {
        if (axis === void 0) axis = "x";
        const window = ssr_window_esm_getWindow();
        let matrix;
        let curTransform;
        let transformMatrix;
        const curStyle = utils_getComputedStyle(el);
        if (window.WebKitCSSMatrix) {
            curTransform = curStyle.transform || curStyle.webkitTransform;
            if (curTransform.split(",").length > 6) curTransform = curTransform.split(", ").map((a => a.replace(",", "."))).join(", ");
            transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
        } else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
            matrix = transformMatrix.toString().split(",");
        }
        if (axis === "x") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); else curTransform = parseFloat(matrix[4]);
        if (axis === "y") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); else curTransform = parseFloat(matrix[5]);
        return curTransform || 0;
    }
    function utils_isObject(o) {
        return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
    }
    function isNode(node) {
        if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") return node instanceof HTMLElement;
        return node && (node.nodeType === 1 || node.nodeType === 11);
    }
    function utils_extend() {
        const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
        const noExtend = [ "__proto__", "constructor", "prototype" ];
        for (let i = 1; i < arguments.length; i += 1) {
            const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
            if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
                const keysArray = Object.keys(Object(nextSource)).filter((key => noExtend.indexOf(key) < 0));
                for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
                    const nextKey = keysArray[nextIndex];
                    const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== void 0 && desc.enumerable) if (utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]); else if (!utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) {
                        to[nextKey] = {};
                        if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]);
                    } else to[nextKey] = nextSource[nextKey];
                }
            }
        }
        return to;
    }
    function utils_setCSSProperty(el, varName, varValue) {
        el.style.setProperty(varName, varValue);
    }
    function animateCSSModeScroll(_ref) {
        let {swiper, targetPosition, side} = _ref;
        const window = ssr_window_esm_getWindow();
        const startPosition = -swiper.translate;
        let startTime = null;
        let time;
        const duration = swiper.params.speed;
        swiper.wrapperEl.style.scrollSnapType = "none";
        window.cancelAnimationFrame(swiper.cssModeFrameID);
        const dir = targetPosition > startPosition ? "next" : "prev";
        const isOutOfBound = (current, target) => dir === "next" && current >= target || dir === "prev" && current <= target;
        const animate = () => {
            time = (new Date).getTime();
            if (startTime === null) startTime = time;
            const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
            const easeProgress = .5 - Math.cos(progress * Math.PI) / 2;
            let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
            if (isOutOfBound(currentPosition, targetPosition)) currentPosition = targetPosition;
            swiper.wrapperEl.scrollTo({
                [side]: currentPosition
            });
            if (isOutOfBound(currentPosition, targetPosition)) {
                swiper.wrapperEl.style.overflow = "hidden";
                swiper.wrapperEl.style.scrollSnapType = "";
                setTimeout((() => {
                    swiper.wrapperEl.style.overflow = "";
                    swiper.wrapperEl.scrollTo({
                        [side]: currentPosition
                    });
                }));
                window.cancelAnimationFrame(swiper.cssModeFrameID);
                return;
            }
            swiper.cssModeFrameID = window.requestAnimationFrame(animate);
        };
        animate();
    }
    function utils_elementChildren(element, selector) {
        if (selector === void 0) selector = "";
        const children = [ ...element.children ];
        if (element instanceof HTMLSlotElement) children.push(...element.assignedElements());
        if (!selector) return children;
        return children.filter((el => el.matches(selector)));
    }
    function elementIsChildOf(el, parent) {
        const isChild = parent.contains(el);
        if (!isChild && parent instanceof HTMLSlotElement) {
            const children = [ ...parent.assignedElements() ];
            return children.includes(el);
        }
        return isChild;
    }
    function showWarning(text) {
        try {
            console.warn(text);
            return;
        } catch (err) {}
    }
    function utils_createElement(tag, classes) {
        if (classes === void 0) classes = [];
        const el = document.createElement(tag);
        el.classList.add(...Array.isArray(classes) ? classes : utils_classesToTokens(classes));
        return el;
    }
    function elementPrevAll(el, selector) {
        const prevEls = [];
        while (el.previousElementSibling) {
            const prev = el.previousElementSibling;
            if (selector) {
                if (prev.matches(selector)) prevEls.push(prev);
            } else prevEls.push(prev);
            el = prev;
        }
        return prevEls;
    }
    function elementNextAll(el, selector) {
        const nextEls = [];
        while (el.nextElementSibling) {
            const next = el.nextElementSibling;
            if (selector) {
                if (next.matches(selector)) nextEls.push(next);
            } else nextEls.push(next);
            el = next;
        }
        return nextEls;
    }
    function elementStyle(el, prop) {
        const window = ssr_window_esm_getWindow();
        return window.getComputedStyle(el, null).getPropertyValue(prop);
    }
    function utils_elementIndex(el) {
        let child = el;
        let i;
        if (child) {
            i = 0;
            while ((child = child.previousSibling) !== null) if (child.nodeType === 1) i += 1;
            return i;
        }
        return;
    }
    function utils_elementParents(el, selector) {
        const parents = [];
        let parent = el.parentElement;
        while (parent) {
            if (selector) {
                if (parent.matches(selector)) parents.push(parent);
            } else parents.push(parent);
            parent = parent.parentElement;
        }
        return parents;
    }
    function utils_elementOuterSize(el, size, includeMargins) {
        const window = ssr_window_esm_getWindow();
        if (includeMargins) return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
        return el.offsetWidth;
    }
    let support;
    function calcSupport() {
        const window = ssr_window_esm_getWindow();
        const document = ssr_window_esm_getDocument();
        return {
            smoothScroll: document.documentElement && document.documentElement.style && "scrollBehavior" in document.documentElement.style,
            touch: !!("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
    }
    function getSupport() {
        if (!support) support = calcSupport();
        return support;
    }
    let deviceCached;
    function calcDevice(_temp) {
        let {userAgent} = _temp === void 0 ? {} : _temp;
        const support = getSupport();
        const window = ssr_window_esm_getWindow();
        const platform = window.navigator.platform;
        const ua = userAgent || window.navigator.userAgent;
        const device = {
            ios: false,
            android: false
        };
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
        const windows = platform === "Win32";
        let macos = platform === "MacIntel";
        const iPadScreens = [ "1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810" ];
        if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
            ipad = ua.match(/(Version)\/([\d.]+)/);
            if (!ipad) ipad = [ 0, 1, "13_0_0" ];
            macos = false;
        }
        if (android && !windows) {
            device.os = "android";
            device.android = true;
        }
        if (ipad || iphone || ipod) {
            device.os = "ios";
            device.ios = true;
        }
        return device;
    }
    function getDevice(overrides) {
        if (overrides === void 0) overrides = {};
        if (!deviceCached) deviceCached = calcDevice(overrides);
        return deviceCached;
    }
    let browser;
    function calcBrowser() {
        const window = ssr_window_esm_getWindow();
        const device = getDevice();
        let needPerspectiveFix = false;
        function isSafari() {
            const ua = window.navigator.userAgent.toLowerCase();
            return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
        }
        if (isSafari()) {
            const ua = String(window.navigator.userAgent);
            if (ua.includes("Version/")) {
                const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num => Number(num)));
                needPerspectiveFix = major < 16 || major === 16 && minor < 2;
            }
        }
        const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
        const isSafariBrowser = isSafari();
        const need3dFix = isSafariBrowser || isWebView && device.ios;
        return {
            isSafari: needPerspectiveFix || isSafariBrowser,
            needPerspectiveFix,
            need3dFix,
            isWebView
        };
    }
    function getBrowser() {
        if (!browser) browser = calcBrowser();
        return browser;
    }
    function Resize(_ref) {
        let {swiper, on, emit} = _ref;
        const window = ssr_window_esm_getWindow();
        let observer = null;
        let animationFrame = null;
        const resizeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("beforeResize");
            emit("resize");
        };
        const createObserver = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            observer = new ResizeObserver((entries => {
                animationFrame = window.requestAnimationFrame((() => {
                    const {width, height} = swiper;
                    let newWidth = width;
                    let newHeight = height;
                    entries.forEach((_ref2 => {
                        let {contentBoxSize, contentRect, target} = _ref2;
                        if (target && target !== swiper.el) return;
                        newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
                        newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
                    }));
                    if (newWidth !== width || newHeight !== height) resizeHandler();
                }));
            }));
            observer.observe(swiper.el);
        };
        const removeObserver = () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            if (observer && observer.unobserve && swiper.el) {
                observer.unobserve(swiper.el);
                observer = null;
            }
        };
        const orientationChangeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("orientationchange");
        };
        on("init", (() => {
            if (swiper.params.resizeObserver && typeof window.ResizeObserver !== "undefined") {
                createObserver();
                return;
            }
            window.addEventListener("resize", resizeHandler);
            window.addEventListener("orientationchange", orientationChangeHandler);
        }));
        on("destroy", (() => {
            removeObserver();
            window.removeEventListener("resize", resizeHandler);
            window.removeEventListener("orientationchange", orientationChangeHandler);
        }));
    }
    function Observer(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const observers = [];
        const window = ssr_window_esm_getWindow();
        const attach = function(target, options) {
            if (options === void 0) options = {};
            const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            const observer = new ObserverFunc((mutations => {
                if (swiper.__preventObserver__) return;
                if (mutations.length === 1) {
                    emit("observerUpdate", mutations[0]);
                    return;
                }
                const observerUpdate = function observerUpdate() {
                    emit("observerUpdate", mutations[0]);
                };
                if (window.requestAnimationFrame) window.requestAnimationFrame(observerUpdate); else window.setTimeout(observerUpdate, 0);
            }));
            observer.observe(target, {
                attributes: typeof options.attributes === "undefined" ? true : options.attributes,
                childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
                characterData: typeof options.characterData === "undefined" ? true : options.characterData
            });
            observers.push(observer);
        };
        const init = () => {
            if (!swiper.params.observer) return;
            if (swiper.params.observeParents) {
                const containerParents = utils_elementParents(swiper.hostEl);
                for (let i = 0; i < containerParents.length; i += 1) attach(containerParents[i]);
            }
            attach(swiper.hostEl, {
                childList: swiper.params.observeSlideChildren
            });
            attach(swiper.wrapperEl, {
                attributes: false
            });
        };
        const destroy = () => {
            observers.forEach((observer => {
                observer.disconnect();
            }));
            observers.splice(0, observers.length);
        };
        extendParams({
            observer: false,
            observeParents: false,
            observeSlideChildren: false
        });
        on("init", init);
        on("destroy", destroy);
    }
    var eventsEmitter = {
        on(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            events.split(" ").forEach((event => {
                if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
                self.eventsListeners[event][method](handler);
            }));
            return self;
        },
        once(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            function onceHandler() {
                self.off(events, onceHandler);
                if (onceHandler.__emitterProxy) delete onceHandler.__emitterProxy;
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                handler.apply(self, args);
            }
            onceHandler.__emitterProxy = handler;
            return self.on(events, onceHandler, priority);
        },
        onAny(handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            if (self.eventsAnyListeners.indexOf(handler) < 0) self.eventsAnyListeners[method](handler);
            return self;
        },
        offAny(handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsAnyListeners) return self;
            const index = self.eventsAnyListeners.indexOf(handler);
            if (index >= 0) self.eventsAnyListeners.splice(index, 1);
            return self;
        },
        off(events, handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            events.split(" ").forEach((event => {
                if (typeof handler === "undefined") self.eventsListeners[event] = []; else if (self.eventsListeners[event]) self.eventsListeners[event].forEach(((eventHandler, index) => {
                    if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) self.eventsListeners[event].splice(index, 1);
                }));
            }));
            return self;
        },
        emit() {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            let events;
            let data;
            let context;
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
            if (typeof args[0] === "string" || Array.isArray(args[0])) {
                events = args[0];
                data = args.slice(1, args.length);
                context = self;
            } else {
                events = args[0].events;
                data = args[0].data;
                context = args[0].context || self;
            }
            data.unshift(context);
            const eventsArray = Array.isArray(events) ? events : events.split(" ");
            eventsArray.forEach((event => {
                if (self.eventsAnyListeners && self.eventsAnyListeners.length) self.eventsAnyListeners.forEach((eventHandler => {
                    eventHandler.apply(context, [ event, ...data ]);
                }));
                if (self.eventsListeners && self.eventsListeners[event]) self.eventsListeners[event].forEach((eventHandler => {
                    eventHandler.apply(context, data);
                }));
            }));
            return self;
        }
    };
    function updateSize() {
        const swiper = this;
        let width;
        let height;
        const el = swiper.el;
        if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) width = swiper.params.width; else width = el.clientWidth;
        if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) height = swiper.params.height; else height = el.clientHeight;
        if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) return;
        width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
        height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
        if (Number.isNaN(width)) width = 0;
        if (Number.isNaN(height)) height = 0;
        Object.assign(swiper, {
            width,
            height,
            size: swiper.isHorizontal() ? width : height
        });
    }
    function updateSlides() {
        const swiper = this;
        function getDirectionPropertyValue(node, label) {
            return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
        }
        const params = swiper.params;
        const {wrapperEl, slidesEl, size: swiperSize, rtlTranslate: rtl, wrongRTL} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
        const slides = utils_elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
        const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
        let snapGrid = [];
        const slidesGrid = [];
        const slidesSizesGrid = [];
        let offsetBefore = params.slidesOffsetBefore;
        if (typeof offsetBefore === "function") offsetBefore = params.slidesOffsetBefore.call(swiper);
        let offsetAfter = params.slidesOffsetAfter;
        if (typeof offsetAfter === "function") offsetAfter = params.slidesOffsetAfter.call(swiper);
        const previousSnapGridLength = swiper.snapGrid.length;
        const previousSlidesGridLength = swiper.slidesGrid.length;
        let spaceBetween = params.spaceBetween;
        let slidePosition = -offsetBefore;
        let prevSlideSize = 0;
        let index = 0;
        if (typeof swiperSize === "undefined") return;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        swiper.virtualSize = -spaceBetween;
        slides.forEach((slideEl => {
            if (rtl) slideEl.style.marginLeft = ""; else slideEl.style.marginRight = "";
            slideEl.style.marginBottom = "";
            slideEl.style.marginTop = "";
        }));
        if (params.centeredSlides && params.cssMode) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
        }
        const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
        if (gridEnabled) swiper.grid.initSlides(slides); else if (swiper.grid) swiper.grid.unsetSlides();
        let slideSize;
        const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key => typeof params.breakpoints[key].slidesPerView !== "undefined")).length > 0;
        for (let i = 0; i < slidesLength; i += 1) {
            slideSize = 0;
            let slide;
            if (slides[i]) slide = slides[i];
            if (gridEnabled) swiper.grid.updateSlide(i, slide, slides);
            if (slides[i] && elementStyle(slide, "display") === "none") continue;
            if (params.slidesPerView === "auto") {
                if (shouldResetSlideSize) slides[i].style[swiper.getDirectionLabel("width")] = ``;
                const slideStyles = getComputedStyle(slide);
                const currentTransform = slide.style.transform;
                const currentWebKitTransform = slide.style.webkitTransform;
                if (currentTransform) slide.style.transform = "none";
                if (currentWebKitTransform) slide.style.webkitTransform = "none";
                if (params.roundLengths) slideSize = swiper.isHorizontal() ? utils_elementOuterSize(slide, "width", true) : utils_elementOuterSize(slide, "height", true); else {
                    const width = getDirectionPropertyValue(slideStyles, "width");
                    const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
                    const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
                    const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
                    const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
                    const boxSizing = slideStyles.getPropertyValue("box-sizing");
                    if (boxSizing && boxSizing === "border-box") slideSize = width + marginLeft + marginRight; else {
                        const {clientWidth, offsetWidth} = slide;
                        slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
                    }
                }
                if (currentTransform) slide.style.transform = currentTransform;
                if (currentWebKitTransform) slide.style.webkitTransform = currentWebKitTransform;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
            } else {
                slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
                if (slides[i]) slides[i].style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
            }
            if (slides[i]) slides[i].swiperSlideSize = slideSize;
            slidesSizesGrid.push(slideSize);
            if (params.centeredSlides) {
                slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
            } else {
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
                slidePosition = slidePosition + slideSize + spaceBetween;
            }
            swiper.virtualSize += slideSize + spaceBetween;
            prevSlideSize = slideSize;
            index += 1;
        }
        swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
        if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
        if (params.setWrapperSize) wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
        if (gridEnabled) swiper.grid.updateWrapperSize(slideSize, snapGrid);
        if (!params.centeredSlides) {
            const newSlidesGrid = [];
            for (let i = 0; i < snapGrid.length; i += 1) {
                let slidesGridItem = snapGrid[i];
                if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
                if (snapGrid[i] <= swiper.virtualSize - swiperSize) newSlidesGrid.push(slidesGridItem);
            }
            snapGrid = newSlidesGrid;
            if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) snapGrid.push(swiper.virtualSize - swiperSize);
        }
        if (isVirtual && params.loop) {
            const size = slidesSizesGrid[0] + spaceBetween;
            if (params.slidesPerGroup > 1) {
                const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
                const groupSize = size * params.slidesPerGroup;
                for (let i = 0; i < groups; i += 1) snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
            }
            for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
                if (params.slidesPerGroup === 1) snapGrid.push(snapGrid[snapGrid.length - 1] + size);
                slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
                swiper.virtualSize += size;
            }
        }
        if (snapGrid.length === 0) snapGrid = [ 0 ];
        if (spaceBetween !== 0) {
            const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
            slides.filter(((_, slideIndex) => {
                if (!params.cssMode || params.loop) return true;
                if (slideIndex === slides.length - 1) return false;
                return true;
            })).forEach((slideEl => {
                slideEl.style[key] = `${spaceBetween}px`;
            }));
        }
        if (params.centeredSlides && params.centeredSlidesBounds) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
            snapGrid = snapGrid.map((snap => {
                if (snap <= 0) return -offsetBefore;
                if (snap > maxSnap) return maxSnap + offsetAfter;
                return snap;
            }));
        }
        if (params.centerInsufficientSlides) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
            if (allSlidesSize + offsetSize < swiperSize) {
                const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
                snapGrid.forEach(((snap, snapIndex) => {
                    snapGrid[snapIndex] = snap - allSlidesOffset;
                }));
                slidesGrid.forEach(((snap, snapIndex) => {
                    slidesGrid[snapIndex] = snap + allSlidesOffset;
                }));
            }
        }
        Object.assign(swiper, {
            slides,
            snapGrid,
            slidesGrid,
            slidesSizesGrid
        });
        if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
            const addToSnapGrid = -swiper.snapGrid[0];
            const addToSlidesGrid = -swiper.slidesGrid[0];
            swiper.snapGrid = swiper.snapGrid.map((v => v + addToSnapGrid));
            swiper.slidesGrid = swiper.slidesGrid.map((v => v + addToSlidesGrid));
        }
        if (slidesLength !== previousSlidesLength) swiper.emit("slidesLengthChange");
        if (snapGrid.length !== previousSnapGridLength) {
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            swiper.emit("snapGridLengthChange");
        }
        if (slidesGrid.length !== previousSlidesGridLength) swiper.emit("slidesGridLengthChange");
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        swiper.emit("slidesUpdated");
        if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
            const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
            const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
            if (slidesLength <= params.maxBackfaceHiddenSlides) {
                if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
            } else if (hasClassBackfaceClassAdded) swiper.el.classList.remove(backFaceHiddenClass);
        }
    }
    function updateAutoHeight(speed) {
        const swiper = this;
        const activeSlides = [];
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let newHeight = 0;
        let i;
        if (typeof speed === "number") swiper.setTransition(speed); else if (speed === true) swiper.setTransition(swiper.params.speed);
        const getSlideByIndex = index => {
            if (isVirtual) return swiper.slides[swiper.getSlideIndexByData(index)];
            return swiper.slides[index];
        };
        if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) if (swiper.params.centeredSlides) (swiper.visibleSlides || []).forEach((slide => {
            activeSlides.push(slide);
        })); else for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
        } else activeSlides.push(getSlideByIndex(swiper.activeIndex));
        for (i = 0; i < activeSlides.length; i += 1) if (typeof activeSlides[i] !== "undefined") {
            const height = activeSlides[i].offsetHeight;
            newHeight = height > newHeight ? height : newHeight;
        }
        if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
    }
    function updateSlidesOffset() {
        const swiper = this;
        const slides = swiper.slides;
        const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
        for (let i = 0; i < slides.length; i += 1) slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
    }
    const toggleSlideClasses$1 = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesProgress(translate) {
        if (translate === void 0) translate = this && this.translate || 0;
        const swiper = this;
        const params = swiper.params;
        const {slides, rtlTranslate: rtl, snapGrid} = swiper;
        if (slides.length === 0) return;
        if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
        let offsetCenter = -translate;
        if (rtl) offsetCenter = translate;
        swiper.visibleSlidesIndexes = [];
        swiper.visibleSlides = [];
        let spaceBetween = params.spaceBetween;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        for (let i = 0; i < slides.length; i += 1) {
            const slide = slides[i];
            let slideOffset = slide.swiperSlideOffset;
            if (params.cssMode && params.centeredSlides) slideOffset -= slides[0].swiperSlideOffset;
            const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const slideBefore = -(offsetCenter - slideOffset);
            const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
            const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
            const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
            if (isVisible) {
                swiper.visibleSlides.push(slide);
                swiper.visibleSlidesIndexes.push(i);
            }
            toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
            toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
            slide.progress = rtl ? -slideProgress : slideProgress;
            slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
        }
    }
    function updateProgress(translate) {
        const swiper = this;
        if (typeof translate === "undefined") {
            const multiplier = swiper.rtlTranslate ? -1 : 1;
            translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
        }
        const params = swiper.params;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        let {progress, isBeginning, isEnd, progressLoop} = swiper;
        const wasBeginning = isBeginning;
        const wasEnd = isEnd;
        if (translatesDiff === 0) {
            progress = 0;
            isBeginning = true;
            isEnd = true;
        } else {
            progress = (translate - swiper.minTranslate()) / translatesDiff;
            const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
            const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
            isBeginning = isBeginningRounded || progress <= 0;
            isEnd = isEndRounded || progress >= 1;
            if (isBeginningRounded) progress = 0;
            if (isEndRounded) progress = 1;
        }
        if (params.loop) {
            const firstSlideIndex = swiper.getSlideIndexByData(0);
            const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
            const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
            const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
            const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
            const translateAbs = Math.abs(translate);
            if (translateAbs >= firstSlideTranslate) progressLoop = (translateAbs - firstSlideTranslate) / translateMax; else progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
            if (progressLoop > 1) progressLoop -= 1;
        }
        Object.assign(swiper, {
            progress,
            progressLoop,
            isBeginning,
            isEnd
        });
        if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
        if (isBeginning && !wasBeginning) swiper.emit("reachBeginning toEdge");
        if (isEnd && !wasEnd) swiper.emit("reachEnd toEdge");
        if (wasBeginning && !isBeginning || wasEnd && !isEnd) swiper.emit("fromEdge");
        swiper.emit("progress", progress);
    }
    const toggleSlideClasses = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesClasses() {
        const swiper = this;
        const {slides, params, slidesEl, activeIndex} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const getFilteredSlide = selector => utils_elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
        let activeSlide;
        let prevSlide;
        let nextSlide;
        if (isVirtual) if (params.loop) {
            let slideIndex = activeIndex - swiper.virtual.slidesBefore;
            if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
            if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
            activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
        } else activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`); else if (gridEnabled) {
            activeSlide = slides.filter((slideEl => slideEl.column === activeIndex))[0];
            nextSlide = slides.filter((slideEl => slideEl.column === activeIndex + 1))[0];
            prevSlide = slides.filter((slideEl => slideEl.column === activeIndex - 1))[0];
        } else activeSlide = slides[activeIndex];
        if (activeSlide) if (!gridEnabled) {
            nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !nextSlide) nextSlide = slides[0];
            prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !prevSlide === 0) prevSlide = slides[slides.length - 1];
        }
        slides.forEach((slideEl => {
            toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
            toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
            toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
        }));
        swiper.emitSlidesClasses();
    }
    const processLazyPreloader = (swiper, imageEl) => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
        const slideEl = imageEl.closest(slideSelector());
        if (slideEl) {
            let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (!lazyEl && swiper.isElement) if (slideEl.shadowRoot) lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`); else requestAnimationFrame((() => {
                if (slideEl.shadowRoot) {
                    lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                    if (lazyEl) lazyEl.remove();
                }
            }));
            if (lazyEl) lazyEl.remove();
        }
    };
    const unlazy = (swiper, index) => {
        if (!swiper.slides[index]) return;
        const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
        if (imageEl) imageEl.removeAttribute("loading");
    };
    const preload = swiper => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        let amount = swiper.params.lazyPreloadPrevNext;
        const len = swiper.slides.length;
        if (!len || !amount || amount < 0) return;
        amount = Math.min(amount, len);
        const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
        const activeIndex = swiper.activeIndex;
        if (swiper.params.grid && swiper.params.grid.rows > 1) {
            const activeColumn = activeIndex;
            const preloadColumns = [ activeColumn - amount ];
            preloadColumns.push(...Array.from({
                length: amount
            }).map(((_, i) => activeColumn + slidesPerView + i)));
            swiper.slides.forEach(((slideEl, i) => {
                if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
            }));
            return;
        }
        const slideIndexLastInView = activeIndex + slidesPerView - 1;
        if (swiper.params.rewind || swiper.params.loop) for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
            const realIndex = (i % len + len) % len;
            if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
        } else for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) unlazy(swiper, i);
    };
    function getActiveIndexByTranslate(swiper) {
        const {slidesGrid, params} = swiper;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        let activeIndex;
        for (let i = 0; i < slidesGrid.length; i += 1) if (typeof slidesGrid[i + 1] !== "undefined") {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) activeIndex = i; else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) activeIndex = i + 1;
        } else if (translate >= slidesGrid[i]) activeIndex = i;
        if (params.normalizeSlideIndex) if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
        return activeIndex;
    }
    function updateActiveIndex(newActiveIndex) {
        const swiper = this;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        const {snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex} = swiper;
        let activeIndex = newActiveIndex;
        let snapIndex;
        const getVirtualRealIndex = aIndex => {
            let realIndex = aIndex - swiper.virtual.slidesBefore;
            if (realIndex < 0) realIndex = swiper.virtual.slides.length + realIndex;
            if (realIndex >= swiper.virtual.slides.length) realIndex -= swiper.virtual.slides.length;
            return realIndex;
        };
        if (typeof activeIndex === "undefined") activeIndex = getActiveIndexByTranslate(swiper);
        if (snapGrid.indexOf(translate) >= 0) snapIndex = snapGrid.indexOf(translate); else {
            const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
            snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
        }
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        if (activeIndex === previousIndex && !swiper.params.loop) {
            if (snapIndex !== previousSnapIndex) {
                swiper.snapIndex = snapIndex;
                swiper.emit("snapIndexChange");
            }
            return;
        }
        if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
            swiper.realIndex = getVirtualRealIndex(activeIndex);
            return;
        }
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        let realIndex;
        if (swiper.virtual && params.virtual.enabled && params.loop) realIndex = getVirtualRealIndex(activeIndex); else if (gridEnabled) {
            const firstSlideInColumn = swiper.slides.filter((slideEl => slideEl.column === activeIndex))[0];
            let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
            if (Number.isNaN(activeSlideIndex)) activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
            realIndex = Math.floor(activeSlideIndex / params.grid.rows);
        } else if (swiper.slides[activeIndex]) {
            const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
            if (slideIndex) realIndex = parseInt(slideIndex, 10); else realIndex = activeIndex;
        } else realIndex = activeIndex;
        Object.assign(swiper, {
            previousSnapIndex,
            snapIndex,
            previousRealIndex,
            realIndex,
            previousIndex,
            activeIndex
        });
        if (swiper.initialized) preload(swiper);
        swiper.emit("activeIndexChange");
        swiper.emit("snapIndexChange");
        if (swiper.initialized || swiper.params.runCallbacksOnInit) {
            if (previousRealIndex !== realIndex) swiper.emit("realIndexChange");
            swiper.emit("slideChange");
        }
    }
    function updateClickedSlide(el, path) {
        const swiper = this;
        const params = swiper.params;
        let slide = el.closest(`.${params.slideClass}, swiper-slide`);
        if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) [ ...path.slice(path.indexOf(el) + 1, path.length) ].forEach((pathEl => {
            if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) slide = pathEl;
        }));
        let slideFound = false;
        let slideIndex;
        if (slide) for (let i = 0; i < swiper.slides.length; i += 1) if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
        }
        if (slide && slideFound) {
            swiper.clickedSlide = slide;
            if (swiper.virtual && swiper.params.virtual.enabled) swiper.clickedIndex = parseInt(slide.getAttribute("data-swiper-slide-index"), 10); else swiper.clickedIndex = slideIndex;
        } else {
            swiper.clickedSlide = void 0;
            swiper.clickedIndex = void 0;
            return;
        }
        if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) swiper.slideToClickedSlide();
    }
    var update = {
        updateSize,
        updateSlides,
        updateAutoHeight,
        updateSlidesOffset,
        updateSlidesProgress,
        updateProgress,
        updateSlidesClasses,
        updateActiveIndex,
        updateClickedSlide
    };
    function getSwiperTranslate(axis) {
        if (axis === void 0) axis = this.isHorizontal() ? "x" : "y";
        const swiper = this;
        const {params, rtlTranslate: rtl, translate, wrapperEl} = swiper;
        if (params.virtualTranslate) return rtl ? -translate : translate;
        if (params.cssMode) return translate;
        let currentTranslate = utils_getTranslate(wrapperEl, axis);
        currentTranslate += swiper.cssOverflowAdjustment();
        if (rtl) currentTranslate = -currentTranslate;
        return currentTranslate || 0;
    }
    function setTranslate(translate, byController) {
        const swiper = this;
        const {rtlTranslate: rtl, params, wrapperEl, progress} = swiper;
        let x = 0;
        let y = 0;
        const z = 0;
        if (swiper.isHorizontal()) x = rtl ? -translate : translate; else y = translate;
        if (params.roundLengths) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        swiper.previousTranslate = swiper.translate;
        swiper.translate = swiper.isHorizontal() ? x : y;
        if (params.cssMode) wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y; else if (!params.virtualTranslate) {
            if (swiper.isHorizontal()) x -= swiper.cssOverflowAdjustment(); else y -= swiper.cssOverflowAdjustment();
            wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        }
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== progress) swiper.updateProgress(translate);
        swiper.emit("setTranslate", swiper.translate, byController);
    }
    function minTranslate() {
        return -this.snapGrid[0];
    }
    function maxTranslate() {
        return -this.snapGrid[this.snapGrid.length - 1];
    }
    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
        if (translate === void 0) translate = 0;
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (translateBounds === void 0) translateBounds = true;
        const swiper = this;
        const {params, wrapperEl} = swiper;
        if (swiper.animating && params.preventInteractionOnTransition) return false;
        const minTranslate = swiper.minTranslate();
        const maxTranslate = swiper.maxTranslate();
        let newTranslate;
        if (translateBounds && translate > minTranslate) newTranslate = minTranslate; else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate; else newTranslate = translate;
        swiper.updateProgress(newTranslate);
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            if (speed === 0) wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate; else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: -newTranslate,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: -newTranslate,
                    behavior: "smooth"
                });
            }
            return true;
        }
        if (speed === 0) {
            swiper.setTransition(0);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionEnd");
            }
        } else {
            swiper.setTransition(speed);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionStart");
            }
            if (!swiper.animating) {
                swiper.animating = true;
                if (!swiper.onTranslateToWrapperTransitionEnd) swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
                    if (!swiper || swiper.destroyed) return;
                    if (e.target !== this) return;
                    swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
                    swiper.onTranslateToWrapperTransitionEnd = null;
                    delete swiper.onTranslateToWrapperTransitionEnd;
                    swiper.animating = false;
                    if (runCallbacks) swiper.emit("transitionEnd");
                };
                swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
            }
        }
        return true;
    }
    var translate = {
        getTranslate: getSwiperTranslate,
        setTranslate,
        minTranslate,
        maxTranslate,
        translateTo
    };
    function setTransition(duration, byController) {
        const swiper = this;
        if (!swiper.params.cssMode) {
            swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
            swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
        }
        swiper.emit("setTransition", duration, byController);
    }
    function transitionEmit(_ref) {
        let {swiper, runCallbacks, direction, step} = _ref;
        const {activeIndex, previousIndex} = swiper;
        let dir = direction;
        if (!dir) if (activeIndex > previousIndex) dir = "next"; else if (activeIndex < previousIndex) dir = "prev"; else dir = "reset";
        swiper.emit(`transition${step}`);
        if (runCallbacks && activeIndex !== previousIndex) {
            if (dir === "reset") {
                swiper.emit(`slideResetTransition${step}`);
                return;
            }
            swiper.emit(`slideChangeTransition${step}`);
            if (dir === "next") swiper.emit(`slideNextTransition${step}`); else swiper.emit(`slidePrevTransition${step}`);
        }
    }
    function transitionStart(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        if (params.cssMode) return;
        if (params.autoHeight) swiper.updateAutoHeight();
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "Start"
        });
    }
    function transitionEnd(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        swiper.animating = false;
        if (params.cssMode) return;
        swiper.setTransition(0);
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "End"
        });
    }
    var transition = {
        setTransition,
        transitionStart,
        transitionEnd
    };
    function slideTo(index, speed, runCallbacks, internal, initial) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") index = parseInt(index, 10);
        const swiper = this;
        let slideIndex = index;
        if (slideIndex < 0) slideIndex = 0;
        const {params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled} = swiper;
        if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) return false;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
        let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        const translate = -snapGrid[snapIndex];
        if (params.normalizeSlideIndex) for (let i = 0; i < slidesGrid.length; i += 1) {
            const normalizedTranslate = -Math.floor(translate * 100);
            const normalizedGrid = Math.floor(slidesGrid[i] * 100);
            const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
            if (typeof slidesGrid[i + 1] !== "undefined") {
                if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) slideIndex = i; else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) slideIndex = i + 1;
            } else if (normalizedTranslate >= normalizedGrid) slideIndex = i;
        }
        if (swiper.initialized && slideIndex !== activeIndex) {
            if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) return false;
            if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) if ((activeIndex || 0) !== slideIndex) return false;
        }
        if (slideIndex !== (previousIndex || 0) && runCallbacks) swiper.emit("beforeSlideChangeStart");
        swiper.updateProgress(translate);
        let direction;
        if (slideIndex > activeIndex) direction = "next"; else if (slideIndex < activeIndex) direction = "prev"; else direction = "reset";
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        const isInitialVirtual = isVirtual && initial;
        if (!isInitialVirtual && (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate)) {
            swiper.updateActiveIndex(slideIndex);
            if (params.autoHeight) swiper.updateAutoHeight();
            swiper.updateSlidesClasses();
            if (params.effect !== "slide") swiper.setTranslate(translate);
            if (direction !== "reset") {
                swiper.transitionStart(runCallbacks, direction);
                swiper.transitionEnd(runCallbacks, direction);
            }
            return false;
        }
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            const t = rtl ? translate : -translate;
            if (speed === 0) {
                if (isVirtual) {
                    swiper.wrapperEl.style.scrollSnapType = "none";
                    swiper._immediateVirtual = true;
                }
                if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
                    swiper._cssModeVirtualInitialSet = true;
                    requestAnimationFrame((() => {
                        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                    }));
                } else wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                if (isVirtual) requestAnimationFrame((() => {
                    swiper.wrapperEl.style.scrollSnapType = "";
                    swiper._immediateVirtual = false;
                }));
            } else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: t,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: t,
                    behavior: "smooth"
                });
            }
            return true;
        }
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit("beforeTransitionStart", speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (speed === 0) swiper.transitionEnd(runCallbacks, direction); else if (!swiper.animating) {
            swiper.animating = true;
            if (!swiper.onSlideToWrapperTransitionEnd) swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
                if (!swiper || swiper.destroyed) return;
                if (e.target !== this) return;
                swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
                swiper.onSlideToWrapperTransitionEnd = null;
                delete swiper.onSlideToWrapperTransitionEnd;
                swiper.transitionEnd(runCallbacks, direction);
            };
            swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        }
        return true;
    }
    function slideToLoop(index, speed, runCallbacks, internal) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") {
            const indexAsNumber = parseInt(index, 10);
            index = indexAsNumber;
        }
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
        let newIndex = index;
        if (swiper.params.loop) if (swiper.virtual && swiper.params.virtual.enabled) newIndex += swiper.virtual.slidesBefore; else {
            let targetSlideIndex;
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                targetSlideIndex = swiper.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex))[0].column;
            } else targetSlideIndex = swiper.getSlideIndexByData(newIndex);
            const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
            const {centeredSlides} = swiper.params;
            let slidesPerView = swiper.params.slidesPerView;
            if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
                slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
                if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
            }
            let needLoopFix = cols - targetSlideIndex < slidesPerView;
            if (centeredSlides) needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
            if (internal && centeredSlides && swiper.params.slidesPerView !== "auto" && !gridEnabled) needLoopFix = false;
            if (needLoopFix) {
                const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
                swiper.loopFix({
                    direction,
                    slideTo: true,
                    activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
                    slideRealIndex: direction === "next" ? swiper.realIndex : void 0
                });
            }
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                newIndex = swiper.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex))[0].column;
            } else newIndex = swiper.getSlideIndexByData(newIndex);
        }
        requestAnimationFrame((() => {
            swiper.slideTo(newIndex, speed, runCallbacks, internal);
        }));
        return swiper;
    }
    function slideNext(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {enabled, params, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let perGroup = params.slidesPerGroup;
        if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
        const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "next"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
            if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
                requestAnimationFrame((() => {
                    swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
                }));
                return true;
            }
        }
        if (params.rewind && swiper.isEnd) return swiper.slideTo(0, speed, runCallbacks, internal);
        return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }
    function slidePrev(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params, snapGrid, slidesGrid, rtlTranslate, enabled, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "prev"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
        }
        const translate = rtlTranslate ? swiper.translate : -swiper.translate;
        function normalize(val) {
            if (val < 0) return -Math.floor(Math.abs(val));
            return Math.floor(val);
        }
        const normalizedTranslate = normalize(translate);
        const normalizedSnapGrid = snapGrid.map((val => normalize(val)));
        let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
        if (typeof prevSnap === "undefined" && params.cssMode) {
            let prevSnapIndex;
            snapGrid.forEach(((snap, snapIndex) => {
                if (normalizedTranslate >= snap) prevSnapIndex = snapIndex;
            }));
            if (typeof prevSnapIndex !== "undefined") prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
        let prevIndex = 0;
        if (typeof prevSnap !== "undefined") {
            prevIndex = slidesGrid.indexOf(prevSnap);
            if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
            if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
                prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
                prevIndex = Math.max(prevIndex, 0);
            }
        }
        if (params.rewind && swiper.isBeginning) {
            const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
            return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
        } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
            requestAnimationFrame((() => {
                swiper.slideTo(prevIndex, speed, runCallbacks, internal);
            }));
            return true;
        }
        return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }
    function slideReset(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }
    function slideToClosest(speed, runCallbacks, internal, threshold) {
        if (runCallbacks === void 0) runCallbacks = true;
        if (threshold === void 0) threshold = .5;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let index = swiper.activeIndex;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
        const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        if (translate >= swiper.snapGrid[snapIndex]) {
            const currentSnap = swiper.snapGrid[snapIndex];
            const nextSnap = swiper.snapGrid[snapIndex + 1];
            if (translate - currentSnap > (nextSnap - currentSnap) * threshold) index += swiper.params.slidesPerGroup;
        } else {
            const prevSnap = swiper.snapGrid[snapIndex - 1];
            const currentSnap = swiper.snapGrid[snapIndex];
            if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) index -= swiper.params.slidesPerGroup;
        }
        index = Math.max(index, 0);
        index = Math.min(index, swiper.slidesGrid.length - 1);
        return swiper.slideTo(index, speed, runCallbacks, internal);
    }
    function slideToClickedSlide() {
        const swiper = this;
        if (swiper.destroyed) return;
        const {params, slidesEl} = swiper;
        const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
        let slideToIndex = swiper.clickedIndex;
        let realIndex;
        const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
        if (params.loop) {
            if (swiper.animating) return;
            realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
            if (params.centeredSlides) if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex); else if (slideToIndex > swiper.slides.length - slidesPerView) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex);
        } else swiper.slideTo(slideToIndex);
    }
    var slide = {
        slideTo,
        slideToLoop,
        slideNext,
        slidePrev,
        slideReset,
        slideToClosest,
        slideToClickedSlide
    };
    function loopCreate(slideRealIndex) {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        const initSlides = () => {
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            slides.forEach(((el, index) => {
                el.setAttribute("data-swiper-slide-index", index);
            }));
        };
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
        const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
        const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
        const addBlankSlides = amountOfSlides => {
            for (let i = 0; i < amountOfSlides; i += 1) {
                const slideEl = swiper.isElement ? utils_createElement("swiper-slide", [ params.slideBlankClass ]) : utils_createElement("div", [ params.slideClass, params.slideBlankClass ]);
                swiper.slidesEl.append(slideEl);
            }
        };
        if (shouldFillGroup) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else if (shouldFillGrid) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else initSlides();
        swiper.loopFix({
            slideRealIndex,
            direction: params.centeredSlides ? void 0 : "next"
        });
    }
    function loopFix(_temp) {
        let {slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex, byController, byMousewheel} = _temp === void 0 ? {} : _temp;
        const swiper = this;
        if (!swiper.params.loop) return;
        swiper.emit("beforeLoopFix");
        const {slides, allowSlidePrev, allowSlideNext, slidesEl, params} = swiper;
        const {centeredSlides} = params;
        swiper.allowSlidePrev = true;
        swiper.allowSlideNext = true;
        if (swiper.virtual && params.virtual.enabled) {
            if (slideTo) if (!params.centeredSlides && swiper.snapIndex === 0) swiper.slideTo(swiper.virtual.slides.length, 0, false, true); else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true); else if (swiper.snapIndex === swiper.snapGrid.length - 1) swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
            swiper.allowSlidePrev = allowSlidePrev;
            swiper.allowSlideNext = allowSlideNext;
            swiper.emit("loopFix");
            return;
        }
        let slidesPerView = params.slidesPerView;
        if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
            slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
            if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
        }
        const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
        let loopedSlides = slidesPerGroup;
        if (loopedSlides % slidesPerGroup !== 0) loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
        loopedSlides += params.loopAdditionalSlides;
        swiper.loopedSlides = loopedSlides;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        if (slides.length < slidesPerView + loopedSlides) showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"); else if (gridEnabled && params.grid.fill === "row") showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
        const prependSlidesIndexes = [];
        const appendSlidesIndexes = [];
        let activeIndex = swiper.activeIndex;
        if (typeof activeSlideIndex === "undefined") activeSlideIndex = swiper.getSlideIndex(slides.filter((el => el.classList.contains(params.slideActiveClass)))[0]); else activeIndex = activeSlideIndex;
        const isNext = direction === "next" || !direction;
        const isPrev = direction === "prev" || !direction;
        let slidesPrepended = 0;
        let slidesAppended = 0;
        const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
        const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
        const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate === "undefined" ? -slidesPerView / 2 + .5 : 0);
        if (activeColIndexWithShift < loopedSlides) {
            slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
            for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) {
                    const colIndexToPrepend = cols - index - 1;
                    for (let i = slides.length - 1; i >= 0; i -= 1) if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
                } else prependSlidesIndexes.push(cols - index - 1);
            }
        } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
            slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
            for (let i = 0; i < slidesAppended; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) slides.forEach(((slide, slideIndex) => {
                    if (slide.column === index) appendSlidesIndexes.push(slideIndex);
                })); else appendSlidesIndexes.push(index);
            }
        }
        swiper.__preventObserver__ = true;
        requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
        if (isPrev) prependSlidesIndexes.forEach((index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.prepend(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        }));
        if (isNext) appendSlidesIndexes.forEach((index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.append(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        }));
        swiper.recalcSlides();
        if (params.slidesPerView === "auto") swiper.updateSlides(); else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) swiper.slides.forEach(((slide, slideIndex) => {
            swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
        }));
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        if (slideTo) if (prependSlidesIndexes.length > 0 && isPrev) {
            if (typeof slideRealIndex === "undefined") {
                const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
                const diff = newSlideTranslate - currentSlideTranslate;
                if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                    swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
                    if (setTranslate) {
                        swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                        swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                    }
                }
            } else if (setTranslate) {
                const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
                swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
                swiper.touchEventsData.currentTranslate = swiper.translate;
            }
        } else if (appendSlidesIndexes.length > 0 && isNext) if (typeof slideRealIndex === "undefined") {
            const currentSlideTranslate = swiper.slidesGrid[activeIndex];
            const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
            const diff = newSlideTranslate - currentSlideTranslate;
            if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
                if (setTranslate) {
                    swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                    swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                }
            }
        } else {
            const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
            swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.controller && swiper.controller.control && !byController) {
            const loopParams = {
                slideRealIndex,
                direction,
                setTranslate,
                activeSlideIndex,
                byController: true
            };
            if (Array.isArray(swiper.controller.control)) swiper.controller.control.forEach((c => {
                if (!c.destroyed && c.params.loop) c.loopFix({
                    ...loopParams,
                    slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
                });
            })); else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) swiper.controller.control.loopFix({
                ...loopParams,
                slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
            });
        }
        swiper.emit("loopFix");
    }
    function loopDestroy() {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        swiper.recalcSlides();
        const newSlidesOrder = [];
        swiper.slides.forEach((slideEl => {
            const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
            newSlidesOrder[index] = slideEl;
        }));
        swiper.slides.forEach((slideEl => {
            slideEl.removeAttribute("data-swiper-slide-index");
        }));
        newSlidesOrder.forEach((slideEl => {
            slidesEl.append(slideEl);
        }));
        swiper.recalcSlides();
        swiper.slideTo(swiper.realIndex, 0);
    }
    var loop = {
        loopCreate,
        loopFix,
        loopDestroy
    };
    function setGrabCursor(moving) {
        const swiper = this;
        if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        el.style.cursor = "move";
        el.style.cursor = moving ? "grabbing" : "grab";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    function unsetGrabCursor() {
        const swiper = this;
        if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    var grabCursor = {
        setGrabCursor,
        unsetGrabCursor
    };
    function closestElement(selector, base) {
        if (base === void 0) base = this;
        function __closestFrom(el) {
            if (!el || el === ssr_window_esm_getDocument() || el === ssr_window_esm_getWindow()) return null;
            if (el.assignedSlot) el = el.assignedSlot;
            const found = el.closest(selector);
            if (!found && !el.getRootNode) return null;
            return found || __closestFrom(el.getRootNode().host);
        }
        return __closestFrom(base);
    }
    function preventEdgeSwipe(swiper, event, startX) {
        const window = ssr_window_esm_getWindow();
        const {params} = swiper;
        const edgeSwipeDetection = params.edgeSwipeDetection;
        const edgeSwipeThreshold = params.edgeSwipeThreshold;
        if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
            if (edgeSwipeDetection === "prevent") {
                event.preventDefault();
                return true;
            }
            return false;
        }
        return true;
    }
    function onTouchStart(event) {
        const swiper = this;
        const document = ssr_window_esm_getDocument();
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        const data = swiper.touchEventsData;
        if (e.type === "pointerdown") {
            if (data.pointerId !== null && data.pointerId !== e.pointerId) return;
            data.pointerId = e.pointerId;
        } else if (e.type === "touchstart" && e.targetTouches.length === 1) data.touchId = e.targetTouches[0].identifier;
        if (e.type === "touchstart") {
            preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
            return;
        }
        const {params, touches, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (swiper.animating && params.preventInteractionOnTransition) return;
        if (!swiper.animating && params.cssMode && params.loop) swiper.loopFix();
        let targetEl = e.target;
        if (params.touchEventsTarget === "wrapper") if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
        if ("which" in e && e.which === 3) return;
        if ("button" in e && e.button > 0) return;
        if (data.isTouched && data.isMoved) return;
        const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
        const eventPath = e.composedPath ? e.composedPath() : e.path;
        if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) targetEl = eventPath[0];
        const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
        const isTargetShadow = !!(e.target && e.target.shadowRoot);
        if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
            swiper.allowClick = true;
            return;
        }
        if (params.swipeHandler) if (!targetEl.closest(params.swipeHandler)) return;
        touches.currentX = e.pageX;
        touches.currentY = e.pageY;
        const startX = touches.currentX;
        const startY = touches.currentY;
        if (!preventEdgeSwipe(swiper, e, startX)) return;
        Object.assign(data, {
            isTouched: true,
            isMoved: false,
            allowTouchCallbacks: true,
            isScrolling: void 0,
            startMoving: void 0
        });
        touches.startX = startX;
        touches.startY = startY;
        data.touchStartTime = utils_now();
        swiper.allowClick = true;
        swiper.updateSize();
        swiper.swipeDirection = void 0;
        if (params.threshold > 0) data.allowThresholdMove = false;
        let preventDefault = true;
        if (targetEl.matches(data.focusableElements)) {
            preventDefault = false;
            if (targetEl.nodeName === "SELECT") data.isTouched = false;
        }
        if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl) document.activeElement.blur();
        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) e.preventDefault();
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) swiper.freeMode.onTouchStart();
        swiper.emit("touchStart", e);
    }
    function onTouchMove(event) {
        const document = ssr_window_esm_getDocument();
        const swiper = this;
        const data = swiper.touchEventsData;
        const {params, touches, rtlTranslate: rtl, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && event.pointerType === "mouse") return;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        if (e.type === "pointermove") {
            if (data.touchId !== null) return;
            const id = e.pointerId;
            if (id !== data.pointerId) return;
        }
        let targetTouch;
        if (e.type === "touchmove") {
            targetTouch = [ ...e.changedTouches ].filter((t => t.identifier === data.touchId))[0];
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        } else targetTouch = e;
        if (!data.isTouched) {
            if (data.startMoving && data.isScrolling) swiper.emit("touchMoveOpposite", e);
            return;
        }
        const pageX = targetTouch.pageX;
        const pageY = targetTouch.pageY;
        if (e.preventedByNestedSwiper) {
            touches.startX = pageX;
            touches.startY = pageY;
            return;
        }
        if (!swiper.allowTouchMove) {
            if (!e.target.matches(data.focusableElements)) swiper.allowClick = false;
            if (data.isTouched) {
                Object.assign(touches, {
                    startX: pageX,
                    startY: pageY,
                    currentX: pageX,
                    currentY: pageY
                });
                data.touchStartTime = utils_now();
            }
            return;
        }
        if (params.touchReleaseOnEdges && !params.loop) if (swiper.isVertical()) {
            if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
                data.isTouched = false;
                data.isMoved = false;
                return;
            }
        } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) return;
        if (document.activeElement) if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
            data.isMoved = true;
            swiper.allowClick = false;
            return;
        }
        if (data.allowTouchCallbacks) swiper.emit("touchMove", e);
        touches.previousX = touches.currentX;
        touches.previousY = touches.currentY;
        touches.currentX = pageX;
        touches.currentY = pageY;
        const diffX = touches.currentX - touches.startX;
        const diffY = touches.currentY - touches.startY;
        if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
        if (typeof data.isScrolling === "undefined") {
            let touchAngle;
            if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) data.isScrolling = false; else if (diffX * diffX + diffY * diffY >= 25) {
                touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
                data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
            }
        }
        if (data.isScrolling) swiper.emit("touchMoveOpposite", e);
        if (typeof data.startMoving === "undefined") if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) data.startMoving = true;
        if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
            data.isTouched = false;
            return;
        }
        if (!data.startMoving) return;
        swiper.allowClick = false;
        if (!params.cssMode && e.cancelable) e.preventDefault();
        if (params.touchMoveStopPropagation && !params.nested) e.stopPropagation();
        let diff = swiper.isHorizontal() ? diffX : diffY;
        let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
        if (params.oneWayMovement) {
            diff = Math.abs(diff) * (rtl ? 1 : -1);
            touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
        }
        touches.diff = diff;
        diff *= params.touchRatio;
        if (rtl) {
            diff = -diff;
            touchesDiff = -touchesDiff;
        }
        const prevTouchesDirection = swiper.touchesDirection;
        swiper.swipeDirection = diff > 0 ? "prev" : "next";
        swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
        const isLoop = swiper.params.loop && !params.cssMode;
        const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
        if (!data.isMoved) {
            if (isLoop && allowLoopFix) swiper.loopFix({
                direction: swiper.swipeDirection
            });
            data.startTranslate = swiper.getTranslate();
            swiper.setTransition(0);
            if (swiper.animating) {
                const evt = new window.CustomEvent("transitionend", {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        bySwiperTouchMove: true
                    }
                });
                swiper.wrapperEl.dispatchEvent(evt);
            }
            data.allowMomentumBounce = false;
            if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(true);
            swiper.emit("sliderFirstMove", e);
        }
        let loopFixed;
        (new Date).getTime();
        if (data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
            Object.assign(touches, {
                startX: pageX,
                startY: pageY,
                currentX: pageX,
                currentY: pageY,
                startTranslate: data.currentTranslate
            });
            data.loopSwapReset = true;
            data.startTranslate = data.currentTranslate;
            return;
        }
        swiper.emit("sliderMove", e);
        data.isMoved = true;
        data.currentTranslate = diff + data.startTranslate;
        let disableParentSwiper = true;
        let resistanceRatio = params.resistanceRatio;
        if (params.touchReleaseOnEdges) resistanceRatio = 0;
        if (diff > 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) swiper.loopFix({
                direction: "prev",
                setTranslate: true,
                activeSlideIndex: 0
            });
            if (data.currentTranslate > swiper.minTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
            }
        } else if (diff < 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) swiper.loopFix({
                direction: "next",
                setTranslate: true,
                activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
            });
            if (data.currentTranslate < swiper.maxTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
            }
        }
        if (disableParentSwiper) e.preventedByNestedSwiper = true;
        if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && !swiper.allowSlideNext) data.currentTranslate = data.startTranslate;
        if (params.threshold > 0) if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
            if (!data.allowThresholdMove) {
                data.allowThresholdMove = true;
                touches.startX = touches.currentX;
                touches.startY = touches.currentY;
                data.currentTranslate = data.startTranslate;
                touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
                return;
            }
        } else {
            data.currentTranslate = data.startTranslate;
            return;
        }
        if (!params.followFinger || params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode) swiper.freeMode.onTouchMove();
        swiper.updateProgress(data.currentTranslate);
        swiper.setTranslate(data.currentTranslate);
    }
    function onTouchEnd(event) {
        const swiper = this;
        const data = swiper.touchEventsData;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        let targetTouch;
        const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
        if (!isTouchEvent) {
            if (data.touchId !== null) return;
            if (e.pointerId !== data.pointerId) return;
            targetTouch = e;
        } else {
            targetTouch = [ ...e.changedTouches ].filter((t => t.identifier === data.touchId))[0];
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        }
        if ([ "pointercancel", "pointerout", "pointerleave", "contextmenu" ].includes(e.type)) {
            const proceed = [ "pointercancel", "contextmenu" ].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
            if (!proceed) return;
        }
        data.pointerId = null;
        data.touchId = null;
        const {params, touches, rtlTranslate: rtl, slidesGrid, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (data.allowTouchCallbacks) swiper.emit("touchEnd", e);
        data.allowTouchCallbacks = false;
        if (!data.isTouched) {
            if (data.isMoved && params.grabCursor) swiper.setGrabCursor(false);
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(false);
        const touchEndTime = utils_now();
        const timeDiff = touchEndTime - data.touchStartTime;
        if (swiper.allowClick) {
            const pathTree = e.path || e.composedPath && e.composedPath();
            swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
            swiper.emit("tap click", e);
            if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) swiper.emit("doubleTap doubleClick", e);
        }
        data.lastClickTime = utils_now();
        utils_nextTick((() => {
            if (!swiper.destroyed) swiper.allowClick = true;
        }));
        if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
            data.isTouched = false;
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        let currentPos;
        if (params.followFinger) currentPos = rtl ? swiper.translate : -swiper.translate; else currentPos = -data.currentTranslate;
        if (params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled) {
            swiper.freeMode.onTouchEnd({
                currentPos
            });
            return;
        }
        const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
        let stopIndex = 0;
        let groupSize = swiper.slidesSizesGrid[0];
        for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
            const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
            if (typeof slidesGrid[i + increment] !== "undefined") {
                if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
                    stopIndex = i;
                    groupSize = slidesGrid[i + increment] - slidesGrid[i];
                }
            } else if (swipeToLast || currentPos >= slidesGrid[i]) {
                stopIndex = i;
                groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
            }
        }
        let rewindFirstIndex = null;
        let rewindLastIndex = null;
        if (params.rewind) if (swiper.isBeginning) rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1; else if (swiper.isEnd) rewindFirstIndex = 0;
        const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
        const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (timeDiff > params.longSwipesMs) {
            if (!params.longSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (swiper.swipeDirection === "next") if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment); else swiper.slideTo(stopIndex);
            if (swiper.swipeDirection === "prev") if (ratio > 1 - params.longSwipesRatio) swiper.slideTo(stopIndex + increment); else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) swiper.slideTo(rewindLastIndex); else swiper.slideTo(stopIndex);
        } else {
            if (!params.shortSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
            if (!isNavButtonTarget) {
                if (swiper.swipeDirection === "next") swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
                if (swiper.swipeDirection === "prev") swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
            } else if (e.target === swiper.navigation.nextEl) swiper.slideTo(stopIndex + increment); else swiper.slideTo(stopIndex);
        }
    }
    function onResize() {
        const swiper = this;
        const {params, el} = swiper;
        if (el && el.offsetWidth === 0) return;
        if (params.breakpoints) swiper.setBreakpoint();
        const {allowSlideNext, allowSlidePrev, snapGrid} = swiper;
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        swiper.allowSlideNext = true;
        swiper.allowSlidePrev = true;
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateSlidesClasses();
        const isVirtualLoop = isVirtual && params.loop;
        if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) swiper.slideTo(swiper.slides.length - 1, 0, false, true); else if (swiper.params.loop && !isVirtual) swiper.slideToLoop(swiper.realIndex, 0, false, true); else swiper.slideTo(swiper.activeIndex, 0, false, true);
        if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
            clearTimeout(swiper.autoplay.resizeTimeout);
            swiper.autoplay.resizeTimeout = setTimeout((() => {
                if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) swiper.autoplay.resume();
            }), 500);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
    }
    function onClick(e) {
        const swiper = this;
        if (!swiper.enabled) return;
        if (!swiper.allowClick) {
            if (swiper.params.preventClicks) e.preventDefault();
            if (swiper.params.preventClicksPropagation && swiper.animating) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    }
    function onScroll() {
        const swiper = this;
        const {wrapperEl, rtlTranslate, enabled} = swiper;
        if (!enabled) return;
        swiper.previousTranslate = swiper.translate;
        if (swiper.isHorizontal()) swiper.translate = -wrapperEl.scrollLeft; else swiper.translate = -wrapperEl.scrollTop;
        if (swiper.translate === 0) swiper.translate = 0;
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== swiper.progress) swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
        swiper.emit("setTranslate", swiper.translate, false);
    }
    function onLoad(e) {
        const swiper = this;
        processLazyPreloader(swiper, e.target);
        if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) return;
        swiper.update();
    }
    function onDocumentTouchStart() {
        const swiper = this;
        if (swiper.documentTouchHandlerProceeded) return;
        swiper.documentTouchHandlerProceeded = true;
        if (swiper.params.touchReleaseOnEdges) swiper.el.style.touchAction = "auto";
    }
    const events = (swiper, method) => {
        const document = ssr_window_esm_getDocument();
        const {params, el, wrapperEl, device} = swiper;
        const capture = !!params.nested;
        const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
        const swiperMethod = method;
        if (!el || typeof el === "string") return;
        document[domMethod]("touchstart", swiper.onDocumentTouchStart, {
            passive: false,
            capture
        });
        el[domMethod]("touchstart", swiper.onTouchStart, {
            passive: false
        });
        el[domMethod]("pointerdown", swiper.onTouchStart, {
            passive: false
        });
        document[domMethod]("touchmove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("pointermove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("touchend", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerup", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointercancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("touchcancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerout", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerleave", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("contextmenu", swiper.onTouchEnd, {
            passive: true
        });
        if (params.preventClicks || params.preventClicksPropagation) el[domMethod]("click", swiper.onClick, true);
        if (params.cssMode) wrapperEl[domMethod]("scroll", swiper.onScroll);
        if (params.updateOnWindowResize) swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true); else swiper[swiperMethod]("observerUpdate", onResize, true);
        el[domMethod]("load", swiper.onLoad, {
            capture: true
        });
    };
    function attachEvents() {
        const swiper = this;
        const {params} = swiper;
        swiper.onTouchStart = onTouchStart.bind(swiper);
        swiper.onTouchMove = onTouchMove.bind(swiper);
        swiper.onTouchEnd = onTouchEnd.bind(swiper);
        swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
        if (params.cssMode) swiper.onScroll = onScroll.bind(swiper);
        swiper.onClick = onClick.bind(swiper);
        swiper.onLoad = onLoad.bind(swiper);
        events(swiper, "on");
    }
    function detachEvents() {
        const swiper = this;
        events(swiper, "off");
    }
    var events$1 = {
        attachEvents,
        detachEvents
    };
    const isGridEnabled = (swiper, params) => swiper.grid && params.grid && params.grid.rows > 1;
    function setBreakpoint() {
        const swiper = this;
        const {realIndex, initialized, params, el} = swiper;
        const breakpoints = params.breakpoints;
        if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
        const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
        if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
        const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : void 0;
        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const wasMultiRow = isGridEnabled(swiper, params);
        const isMultiRow = isGridEnabled(swiper, breakpointParams);
        const wasGrabCursor = swiper.params.grabCursor;
        const isGrabCursor = breakpointParams.grabCursor;
        const wasEnabled = params.enabled;
        if (wasMultiRow && !isMultiRow) {
            el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        } else if (!wasMultiRow && isMultiRow) {
            el.classList.add(`${params.containerModifierClass}grid`);
            if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") el.classList.add(`${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        }
        if (wasGrabCursor && !isGrabCursor) swiper.unsetGrabCursor(); else if (!wasGrabCursor && isGrabCursor) swiper.setGrabCursor();
        [ "navigation", "pagination", "scrollbar" ].forEach((prop => {
            if (typeof breakpointParams[prop] === "undefined") return;
            const wasModuleEnabled = params[prop] && params[prop].enabled;
            const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
            if (wasModuleEnabled && !isModuleEnabled) swiper[prop].disable();
            if (!wasModuleEnabled && isModuleEnabled) swiper[prop].enable();
        }));
        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
        const wasLoop = params.loop;
        if (directionChanged && initialized) swiper.changeDirection();
        utils_extend(swiper.params, breakpointParams);
        const isEnabled = swiper.params.enabled;
        const hasLoop = swiper.params.loop;
        Object.assign(swiper, {
            allowTouchMove: swiper.params.allowTouchMove,
            allowSlideNext: swiper.params.allowSlideNext,
            allowSlidePrev: swiper.params.allowSlidePrev
        });
        if (wasEnabled && !isEnabled) swiper.disable(); else if (!wasEnabled && isEnabled) swiper.enable();
        swiper.currentBreakpoint = breakpoint;
        swiper.emit("_beforeBreakpoint", breakpointParams);
        if (initialized) if (needsReLoop) {
            swiper.loopDestroy();
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (!wasLoop && hasLoop) {
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (wasLoop && !hasLoop) swiper.loopDestroy();
        swiper.emit("breakpoint", breakpointParams);
    }
    function getBreakpoint(breakpoints, base, containerEl) {
        if (base === void 0) base = "window";
        if (!breakpoints || base === "container" && !containerEl) return;
        let breakpoint = false;
        const window = ssr_window_esm_getWindow();
        const currentHeight = base === "window" ? window.innerHeight : containerEl.clientHeight;
        const points = Object.keys(breakpoints).map((point => {
            if (typeof point === "string" && point.indexOf("@") === 0) {
                const minRatio = parseFloat(point.substr(1));
                const value = currentHeight * minRatio;
                return {
                    value,
                    point
                };
            }
            return {
                value: point,
                point
            };
        }));
        points.sort(((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10)));
        for (let i = 0; i < points.length; i += 1) {
            const {point, value} = points[i];
            if (base === "window") {
                if (window.matchMedia(`(min-width: ${value}px)`).matches) breakpoint = point;
            } else if (value <= containerEl.clientWidth) breakpoint = point;
        }
        return breakpoint || "max";
    }
    var breakpoints = {
        setBreakpoint,
        getBreakpoint
    };
    function prepareClasses(entries, prefix) {
        const resultClasses = [];
        entries.forEach((item => {
            if (typeof item === "object") Object.keys(item).forEach((classNames => {
                if (item[classNames]) resultClasses.push(prefix + classNames);
            })); else if (typeof item === "string") resultClasses.push(prefix + item);
        }));
        return resultClasses;
    }
    function addClasses() {
        const swiper = this;
        const {classNames, params, rtl, el, device} = swiper;
        const suffixes = prepareClasses([ "initialized", params.direction, {
            "free-mode": swiper.params.freeMode && params.freeMode.enabled
        }, {
            autoheight: params.autoHeight
        }, {
            rtl
        }, {
            grid: params.grid && params.grid.rows > 1
        }, {
            "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
        }, {
            android: device.android
        }, {
            ios: device.ios
        }, {
            "css-mode": params.cssMode
        }, {
            centered: params.cssMode && params.centeredSlides
        }, {
            "watch-progress": params.watchSlidesProgress
        } ], params.containerModifierClass);
        classNames.push(...suffixes);
        el.classList.add(...classNames);
        swiper.emitContainerClasses();
    }
    function removeClasses() {
        const swiper = this;
        const {el, classNames} = swiper;
        if (!el || typeof el === "string") return;
        el.classList.remove(...classNames);
        swiper.emitContainerClasses();
    }
    var classes = {
        addClasses,
        removeClasses
    };
    function checkOverflow() {
        const swiper = this;
        const {isLocked: wasLocked, params} = swiper;
        const {slidesOffsetBefore} = params;
        if (slidesOffsetBefore) {
            const lastSlideIndex = swiper.slides.length - 1;
            const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
            swiper.isLocked = swiper.size > lastSlideRightEdge;
        } else swiper.isLocked = swiper.snapGrid.length === 1;
        if (params.allowSlideNext === true) swiper.allowSlideNext = !swiper.isLocked;
        if (params.allowSlidePrev === true) swiper.allowSlidePrev = !swiper.isLocked;
        if (wasLocked && wasLocked !== swiper.isLocked) swiper.isEnd = false;
        if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? "lock" : "unlock");
    }
    var checkOverflow$1 = {
        checkOverflow
    };
    var defaults = {
        init: true,
        direction: "horizontal",
        oneWayMovement: false,
        swiperElementNodeName: "SWIPER-CONTAINER",
        touchEventsTarget: "wrapper",
        initialSlide: 0,
        speed: 300,
        cssMode: false,
        updateOnWindowResize: true,
        resizeObserver: true,
        nested: false,
        createElements: false,
        eventsPrefix: "swiper",
        enabled: true,
        focusableElements: "input, select, option, textarea, button, video, label",
        width: null,
        height: null,
        preventInteractionOnTransition: false,
        userAgent: null,
        url: null,
        edgeSwipeDetection: false,
        edgeSwipeThreshold: 20,
        autoHeight: false,
        setWrapperSize: false,
        virtualTranslate: false,
        effect: "slide",
        breakpoints: void 0,
        breakpointsBase: "window",
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: false,
        centeredSlides: false,
        centeredSlidesBounds: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: true,
        centerInsufficientSlides: false,
        watchOverflow: true,
        roundLengths: false,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: true,
        allowTouchMove: true,
        threshold: 5,
        touchMoveStopPropagation: false,
        touchStartPreventDefault: true,
        touchStartForcePreventDefault: false,
        touchReleaseOnEdges: false,
        uniqueNavElements: true,
        resistance: true,
        resistanceRatio: .85,
        watchSlidesProgress: false,
        grabCursor: false,
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        loop: false,
        loopAddBlankSlides: true,
        loopAdditionalSlides: 0,
        loopPreventsSliding: true,
        rewind: false,
        allowSlidePrev: true,
        allowSlideNext: true,
        swipeHandler: null,
        noSwiping: true,
        noSwipingClass: "swiper-no-swiping",
        noSwipingSelector: null,
        passiveListeners: true,
        maxBackfaceHiddenSlides: 10,
        containerModifierClass: "swiper-",
        slideClass: "swiper-slide",
        slideBlankClass: "swiper-slide-blank",
        slideActiveClass: "swiper-slide-active",
        slideVisibleClass: "swiper-slide-visible",
        slideFullyVisibleClass: "swiper-slide-fully-visible",
        slideNextClass: "swiper-slide-next",
        slidePrevClass: "swiper-slide-prev",
        wrapperClass: "swiper-wrapper",
        lazyPreloaderClass: "swiper-lazy-preloader",
        lazyPreloadPrevNext: 0,
        runCallbacksOnInit: true,
        _emitClasses: false
    };
    function moduleExtendParams(params, allModulesParams) {
        return function extendParams(obj) {
            if (obj === void 0) obj = {};
            const moduleParamName = Object.keys(obj)[0];
            const moduleParams = obj[moduleParamName];
            if (typeof moduleParams !== "object" || moduleParams === null) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (params[moduleParamName] === true) params[moduleParamName] = {
                enabled: true
            };
            if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) params[moduleParamName].auto = true;
            if ([ "pagination", "scrollbar" ].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) params[moduleParamName].auto = true;
            if (!(moduleParamName in params && "enabled" in moduleParams)) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) params[moduleParamName].enabled = true;
            if (!params[moduleParamName]) params[moduleParamName] = {
                enabled: false
            };
            utils_extend(allModulesParams, obj);
        };
    }
    const prototypes = {
        eventsEmitter,
        update,
        translate,
        transition,
        slide,
        loop,
        grabCursor,
        events: events$1,
        breakpoints,
        checkOverflow: checkOverflow$1,
        classes
    };
    const extendedDefaults = {};
    class swiper_core_Swiper {
        constructor() {
            let el;
            let params;
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") params = args[0]; else [el, params] = args;
            if (!params) params = {};
            params = utils_extend({}, params);
            if (el && !params.el) params.el = el;
            const document = ssr_window_esm_getDocument();
            if (params.el && typeof params.el === "string" && document.querySelectorAll(params.el).length > 1) {
                const swipers = [];
                document.querySelectorAll(params.el).forEach((containerEl => {
                    const newParams = utils_extend({}, params, {
                        el: containerEl
                    });
                    swipers.push(new swiper_core_Swiper(newParams));
                }));
                return swipers;
            }
            const swiper = this;
            swiper.__swiper__ = true;
            swiper.support = getSupport();
            swiper.device = getDevice({
                userAgent: params.userAgent
            });
            swiper.browser = getBrowser();
            swiper.eventsListeners = {};
            swiper.eventsAnyListeners = [];
            swiper.modules = [ ...swiper.__modules__ ];
            if (params.modules && Array.isArray(params.modules)) swiper.modules.push(...params.modules);
            const allModulesParams = {};
            swiper.modules.forEach((mod => {
                mod({
                    params,
                    swiper,
                    extendParams: moduleExtendParams(params, allModulesParams),
                    on: swiper.on.bind(swiper),
                    once: swiper.once.bind(swiper),
                    off: swiper.off.bind(swiper),
                    emit: swiper.emit.bind(swiper)
                });
            }));
            const swiperParams = utils_extend({}, defaults, allModulesParams);
            swiper.params = utils_extend({}, swiperParams, extendedDefaults, params);
            swiper.originalParams = utils_extend({}, swiper.params);
            swiper.passedParams = utils_extend({}, params);
            if (swiper.params && swiper.params.on) Object.keys(swiper.params.on).forEach((eventName => {
                swiper.on(eventName, swiper.params.on[eventName]);
            }));
            if (swiper.params && swiper.params.onAny) swiper.onAny(swiper.params.onAny);
            Object.assign(swiper, {
                enabled: swiper.params.enabled,
                el,
                classNames: [],
                slides: [],
                slidesGrid: [],
                snapGrid: [],
                slidesSizesGrid: [],
                isHorizontal() {
                    return swiper.params.direction === "horizontal";
                },
                isVertical() {
                    return swiper.params.direction === "vertical";
                },
                activeIndex: 0,
                realIndex: 0,
                isBeginning: true,
                isEnd: false,
                translate: 0,
                previousTranslate: 0,
                progress: 0,
                velocity: 0,
                animating: false,
                cssOverflowAdjustment() {
                    return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
                },
                allowSlideNext: swiper.params.allowSlideNext,
                allowSlidePrev: swiper.params.allowSlidePrev,
                touchEventsData: {
                    isTouched: void 0,
                    isMoved: void 0,
                    allowTouchCallbacks: void 0,
                    touchStartTime: void 0,
                    isScrolling: void 0,
                    currentTranslate: void 0,
                    startTranslate: void 0,
                    allowThresholdMove: void 0,
                    focusableElements: swiper.params.focusableElements,
                    lastClickTime: 0,
                    clickTimeout: void 0,
                    velocities: [],
                    allowMomentumBounce: void 0,
                    startMoving: void 0,
                    pointerId: null,
                    touchId: null
                },
                allowClick: true,
                allowTouchMove: swiper.params.allowTouchMove,
                touches: {
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    diff: 0
                },
                imagesToLoad: [],
                imagesLoaded: 0
            });
            swiper.emit("_swiper");
            if (swiper.params.init) swiper.init();
            return swiper;
        }
        getDirectionLabel(property) {
            if (this.isHorizontal()) return property;
            return {
                width: "height",
                "margin-top": "margin-left",
                "margin-bottom ": "margin-right",
                "margin-left": "margin-top",
                "margin-right": "margin-bottom",
                "padding-left": "padding-top",
                "padding-right": "padding-bottom",
                marginRight: "marginBottom"
            }[property];
        }
        getSlideIndex(slideEl) {
            const {slidesEl, params} = this;
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            const firstSlideIndex = utils_elementIndex(slides[0]);
            return utils_elementIndex(slideEl) - firstSlideIndex;
        }
        getSlideIndexByData(index) {
            return this.getSlideIndex(this.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === index))[0]);
        }
        recalcSlides() {
            const swiper = this;
            const {slidesEl, params} = swiper;
            swiper.slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        }
        enable() {
            const swiper = this;
            if (swiper.enabled) return;
            swiper.enabled = true;
            if (swiper.params.grabCursor) swiper.setGrabCursor();
            swiper.emit("enable");
        }
        disable() {
            const swiper = this;
            if (!swiper.enabled) return;
            swiper.enabled = false;
            if (swiper.params.grabCursor) swiper.unsetGrabCursor();
            swiper.emit("disable");
        }
        setProgress(progress, speed) {
            const swiper = this;
            progress = Math.min(Math.max(progress, 0), 1);
            const min = swiper.minTranslate();
            const max = swiper.maxTranslate();
            const current = (max - min) * progress + min;
            swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        emitContainerClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const cls = swiper.el.className.split(" ").filter((className => className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0));
            swiper.emit("_containerClasses", cls.join(" "));
        }
        getSlideClasses(slideEl) {
            const swiper = this;
            if (swiper.destroyed) return "";
            return slideEl.className.split(" ").filter((className => className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0)).join(" ");
        }
        emitSlidesClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const updates = [];
            swiper.slides.forEach((slideEl => {
                const classNames = swiper.getSlideClasses(slideEl);
                updates.push({
                    slideEl,
                    classNames
                });
                swiper.emit("_slideClass", slideEl, classNames);
            }));
            swiper.emit("_slideClasses", updates);
        }
        slidesPerViewDynamic(view, exact) {
            if (view === void 0) view = "current";
            if (exact === void 0) exact = false;
            const swiper = this;
            const {params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex} = swiper;
            let spv = 1;
            if (typeof params.slidesPerView === "number") return params.slidesPerView;
            if (params.centeredSlides) {
                let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
                let breakLoop;
                for (let i = activeIndex + 1; i < slides.length; i += 1) if (slides[i] && !breakLoop) {
                    slideSize += Math.ceil(slides[i].swiperSlideSize);
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
                for (let i = activeIndex - 1; i >= 0; i -= 1) if (slides[i] && !breakLoop) {
                    slideSize += slides[i].swiperSlideSize;
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
            } else if (view === "current") for (let i = activeIndex + 1; i < slides.length; i += 1) {
                const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
                if (slideInView) spv += 1;
            } else for (let i = activeIndex - 1; i >= 0; i -= 1) {
                const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
                if (slideInView) spv += 1;
            }
            return spv;
        }
        update() {
            const swiper = this;
            if (!swiper || swiper.destroyed) return;
            const {snapGrid, params} = swiper;
            if (params.breakpoints) swiper.setBreakpoint();
            [ ...swiper.el.querySelectorAll('[loading="lazy"]') ].forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl);
            }));
            swiper.updateSize();
            swiper.updateSlides();
            swiper.updateProgress();
            swiper.updateSlidesClasses();
            function setTranslate() {
                const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
                const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
                swiper.setTranslate(newTranslate);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
            let translated;
            if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
                setTranslate();
                if (params.autoHeight) swiper.updateAutoHeight();
            } else {
                if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
                    const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
                    translated = swiper.slideTo(slides.length - 1, 0, false, true);
                } else translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
                if (!translated) setTranslate();
            }
            if (params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
            swiper.emit("update");
        }
        changeDirection(newDirection, needUpdate) {
            if (needUpdate === void 0) needUpdate = true;
            const swiper = this;
            const currentDirection = swiper.params.direction;
            if (!newDirection) newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
            if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") return swiper;
            swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
            swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
            swiper.emitContainerClasses();
            swiper.params.direction = newDirection;
            swiper.slides.forEach((slideEl => {
                if (newDirection === "vertical") slideEl.style.width = ""; else slideEl.style.height = "";
            }));
            swiper.emit("changeDirection");
            if (needUpdate) swiper.update();
            return swiper;
        }
        changeLanguageDirection(direction) {
            const swiper = this;
            if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
            swiper.rtl = direction === "rtl";
            swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
            if (swiper.rtl) {
                swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "rtl";
            } else {
                swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "ltr";
            }
            swiper.update();
        }
        mount(element) {
            const swiper = this;
            if (swiper.mounted) return true;
            let el = element || swiper.params.el;
            if (typeof el === "string") el = document.querySelector(el);
            if (!el) return false;
            el.swiper = swiper;
            if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) swiper.isElement = true;
            const getWrapperSelector = () => `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
            const getWrapper = () => {
                if (el && el.shadowRoot && el.shadowRoot.querySelector) {
                    const res = el.shadowRoot.querySelector(getWrapperSelector());
                    return res;
                }
                return utils_elementChildren(el, getWrapperSelector())[0];
            };
            let wrapperEl = getWrapper();
            if (!wrapperEl && swiper.params.createElements) {
                wrapperEl = utils_createElement("div", swiper.params.wrapperClass);
                el.append(wrapperEl);
                utils_elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl => {
                    wrapperEl.append(slideEl);
                }));
            }
            Object.assign(swiper, {
                el,
                wrapperEl,
                slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
                hostEl: swiper.isElement ? el.parentNode.host : el,
                mounted: true,
                rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
                rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
                wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
            });
            return true;
        }
        init(el) {
            const swiper = this;
            if (swiper.initialized) return swiper;
            const mounted = swiper.mount(el);
            if (mounted === false) return swiper;
            swiper.emit("beforeInit");
            if (swiper.params.breakpoints) swiper.setBreakpoint();
            swiper.addClasses();
            swiper.updateSize();
            swiper.updateSlides();
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            if (swiper.params.grabCursor && swiper.enabled) swiper.setGrabCursor();
            if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true); else swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
            if (swiper.params.loop) swiper.loopCreate();
            swiper.attachEvents();
            const lazyElements = [ ...swiper.el.querySelectorAll('[loading="lazy"]') ];
            if (swiper.isElement) lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
            lazyElements.forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl); else imageEl.addEventListener("load", (e => {
                    processLazyPreloader(swiper, e.target);
                }));
            }));
            preload(swiper);
            swiper.initialized = true;
            preload(swiper);
            swiper.emit("init");
            swiper.emit("afterInit");
            return swiper;
        }
        destroy(deleteInstance, cleanStyles) {
            if (deleteInstance === void 0) deleteInstance = true;
            if (cleanStyles === void 0) cleanStyles = true;
            const swiper = this;
            const {params, el, wrapperEl, slides} = swiper;
            if (typeof swiper.params === "undefined" || swiper.destroyed) return null;
            swiper.emit("beforeDestroy");
            swiper.initialized = false;
            swiper.detachEvents();
            if (params.loop) swiper.loopDestroy();
            if (cleanStyles) {
                swiper.removeClasses();
                if (el && typeof el !== "string") el.removeAttribute("style");
                if (wrapperEl) wrapperEl.removeAttribute("style");
                if (slides && slides.length) slides.forEach((slideEl => {
                    slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
                    slideEl.removeAttribute("style");
                    slideEl.removeAttribute("data-swiper-slide-index");
                }));
            }
            swiper.emit("destroy");
            Object.keys(swiper.eventsListeners).forEach((eventName => {
                swiper.off(eventName);
            }));
            if (deleteInstance !== false) {
                if (swiper.el && typeof swiper.el !== "string") swiper.el.swiper = null;
                deleteProps(swiper);
            }
            swiper.destroyed = true;
            return null;
        }
        static extendDefaults(newDefaults) {
            utils_extend(extendedDefaults, newDefaults);
        }
        static get extendedDefaults() {
            return extendedDefaults;
        }
        static get defaults() {
            return defaults;
        }
        static installModule(mod) {
            if (!swiper_core_Swiper.prototype.__modules__) swiper_core_Swiper.prototype.__modules__ = [];
            const modules = swiper_core_Swiper.prototype.__modules__;
            if (typeof mod === "function" && modules.indexOf(mod) < 0) modules.push(mod);
        }
        static use(module) {
            if (Array.isArray(module)) {
                module.forEach((m => swiper_core_Swiper.installModule(m)));
                return swiper_core_Swiper;
            }
            swiper_core_Swiper.installModule(module);
            return swiper_core_Swiper;
        }
    }
    Object.keys(prototypes).forEach((prototypeGroup => {
        Object.keys(prototypes[prototypeGroup]).forEach((protoMethod => {
            swiper_core_Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
        }));
    }));
    swiper_core_Swiper.use([ Resize, Observer ]);
    class Modal {
        constructor(modalSelector) {
            this.modal = document.querySelector(modalSelector);
            if (this.modal) {
                this.closeButton = this.modal.querySelector("[data-close]");
                this.overlay = this.modal.querySelector(".popup__wrapper");
                this.initEvents();
            }
        }
        initEvents() {
            if (this.closeButton) this.closeButton.addEventListener("click", (() => this.closeModal()));
            document.addEventListener("keydown", (event => {
                if (event.key === "Escape") this.closeModal();
            }));
            if (this.overlay) this.overlay.addEventListener("click", (event => {
                if (event.target === this.overlay) this.closeModal();
            }));
        }
        openModal() {
            if (this.modal) {
                document.body.classList.add("popup-show");
                this.modal.classList.add("popup_show");
            }
        }
        closeModal() {
            if (this.modal) {
                document.body.classList.remove("popup-show");
                this.modal.classList.remove("popup_show");
            }
        }
    }
    /**!
 * Sortable 1.15.3
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly) symbols = symbols.filter((function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            }));
            keys.push.apply(keys, symbols);
        }
        return keys;
    }
    function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            if (i % 2) ownKeys(Object(source), true).forEach((function(key) {
                _defineProperty(target, key, source[key]);
            })); else if (Object.getOwnPropertyDescriptors) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); else ownKeys(Object(source)).forEach((function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            }));
        }
        return target;
    }
    function _typeof(obj) {
        "@babel/helpers - typeof";
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") _typeof = function(obj) {
            return typeof obj;
        }; else _typeof = function(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        return _typeof(obj);
    }
    function _defineProperty(obj, key, value) {
        if (key in obj) Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
        }); else obj[key] = value;
        return obj;
    }
    function _extends() {
        _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
            }
            return target;
        };
        return _extends.apply(this, arguments);
    }
    function _objectWithoutPropertiesLoose(source, excluded) {
        if (source == null) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;
        for (i = 0; i < sourceKeys.length; i++) {
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            target[key] = source[key];
        }
        return target;
    }
    function _objectWithoutProperties(source, excluded) {
        if (source == null) return {};
        var target = _objectWithoutPropertiesLoose(source, excluded);
        var key, i;
        if (Object.getOwnPropertySymbols) {
            var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
            for (i = 0; i < sourceSymbolKeys.length; i++) {
                key = sourceSymbolKeys[i];
                if (excluded.indexOf(key) >= 0) continue;
                if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
                target[key] = source[key];
            }
        }
        return target;
    }
    var version = "1.15.3";
    function userAgent(pattern) {
        if (typeof window !== "undefined" && window.navigator) return !!navigator.userAgent.match(pattern);
    }
    var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
    var Edge = userAgent(/Edge/i);
    var FireFox = userAgent(/firefox/i);
    var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
    var IOS = userAgent(/iP(ad|od|hone)/i);
    var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
    var captureMode = {
        capture: false,
        passive: false
    };
    function on(el, event, fn) {
        el.addEventListener(event, fn, !IE11OrLess && captureMode);
    }
    function off(el, event, fn) {
        el.removeEventListener(event, fn, !IE11OrLess && captureMode);
    }
    function matches(el, selector) {
        if (!selector) return;
        selector[0] === ">" && (selector = selector.substring(1));
        if (el) try {
            if (el.matches) return el.matches(selector); else if (el.msMatchesSelector) return el.msMatchesSelector(selector); else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
        } catch (_) {
            return false;
        }
        return false;
    }
    function getParentOrHost(el) {
        return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
    }
    function closest(el, selector, ctx, includeCTX) {
        if (el) {
            ctx = ctx || document;
            do {
                if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) return el;
                if (el === ctx) break;
            } while (el = getParentOrHost(el));
        }
        return null;
    }
    var R_SPACE = /\s+/g;
    function toggleClass(el, name, state) {
        if (el && name) if (el.classList) el.classList[state ? "add" : "remove"](name); else {
            var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
            el.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
        }
    }
    function css(el, prop, val) {
        var style = el && el.style;
        if (style) if (val === void 0) {
            if (document.defaultView && document.defaultView.getComputedStyle) val = document.defaultView.getComputedStyle(el, ""); else if (el.currentStyle) val = el.currentStyle;
            return prop === void 0 ? val : val[prop];
        } else {
            if (!(prop in style) && prop.indexOf("webkit") === -1) prop = "-webkit-" + prop;
            style[prop] = val + (typeof val === "string" ? "" : "px");
        }
    }
    function matrix(el, selfOnly) {
        var appliedTransforms = "";
        if (typeof el === "string") appliedTransforms = el; else do {
            var transform = css(el, "transform");
            if (transform && transform !== "none") appliedTransforms = transform + " " + appliedTransforms;
        } while (!selfOnly && (el = el.parentNode));
        var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
        return matrixFn && new matrixFn(appliedTransforms);
    }
    function find(ctx, tagName, iterator) {
        if (ctx) {
            var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
            if (iterator) for (;i < n; i++) iterator(list[i], i);
            return list;
        }
        return [];
    }
    function getWindowScrollingElement() {
        var scrollingElement = document.scrollingElement;
        if (scrollingElement) return scrollingElement; else return document.documentElement;
    }
    function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
        if (!el.getBoundingClientRect && el !== window) return;
        var elRect, top, left, bottom, right, height, width;
        if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
            elRect = el.getBoundingClientRect();
            top = elRect.top;
            left = elRect.left;
            bottom = elRect.bottom;
            right = elRect.right;
            height = elRect.height;
            width = elRect.width;
        } else {
            top = 0;
            left = 0;
            bottom = window.innerHeight;
            right = window.innerWidth;
            height = window.innerHeight;
            width = window.innerWidth;
        }
        if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
            container = container || el.parentNode;
            if (!IE11OrLess) do {
                if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
                    var containerRect = container.getBoundingClientRect();
                    top -= containerRect.top + parseInt(css(container, "border-top-width"));
                    left -= containerRect.left + parseInt(css(container, "border-left-width"));
                    bottom = top + elRect.height;
                    right = left + elRect.width;
                    break;
                }
            } while (container = container.parentNode);
        }
        if (undoScale && el !== window) {
            var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
            if (elMatrix) {
                top /= scaleY;
                left /= scaleX;
                width /= scaleX;
                height /= scaleY;
                bottom = top + height;
                right = left + width;
            }
        }
        return {
            top,
            left,
            bottom,
            right,
            width,
            height
        };
    }
    function isScrolledPast(el, elSide, parentSide) {
        var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
        while (parent) {
            var parentSideVal = getRect(parent)[parentSide], visible = void 0;
            if (parentSide === "top" || parentSide === "left") visible = elSideVal >= parentSideVal; else visible = elSideVal <= parentSideVal;
            if (!visible) return parent;
            if (parent === getWindowScrollingElement()) break;
            parent = getParentAutoScrollElement(parent, false);
        }
        return false;
    }
    function getChild(el, childNum, options, includeDragEl) {
        var currentChild = 0, i = 0, children = el.children;
        while (i < children.length) {
            if (children[i].style.display !== "none" && children[i] !== sortable_esm_Sortable.ghost && (includeDragEl || children[i] !== sortable_esm_Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
                if (currentChild === childNum) return children[i];
                currentChild++;
            }
            i++;
        }
        return null;
    }
    function lastChild(el, selector) {
        var last = el.lastElementChild;
        while (last && (last === sortable_esm_Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) last = last.previousElementSibling;
        return last || null;
    }
    function index(el, selector) {
        var index = 0;
        if (!el || !el.parentNode) return -1;
        while (el = el.previousElementSibling) if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== sortable_esm_Sortable.clone && (!selector || matches(el, selector))) index++;
        return index;
    }
    function getRelativeScrollOffset(el) {
        var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
        if (el) do {
            var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
            offsetLeft += el.scrollLeft * scaleX;
            offsetTop += el.scrollTop * scaleY;
        } while (el !== winScroller && (el = el.parentNode));
        return [ offsetLeft, offsetTop ];
    }
    function indexOfObject(arr, obj) {
        for (var i in arr) {
            if (!arr.hasOwnProperty(i)) continue;
            for (var key in obj) if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
        }
        return -1;
    }
    function getParentAutoScrollElement(el, includeSelf) {
        if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
        var elem = el;
        var gotSelf = false;
        do {
            if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
                var elemCSS = css(elem);
                if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
                    if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
                    if (gotSelf || includeSelf) return elem;
                    gotSelf = true;
                }
            }
        } while (elem = elem.parentNode);
        return getWindowScrollingElement();
    }
    function sortable_esm_extend(dst, src) {
        if (dst && src) for (var key in src) if (src.hasOwnProperty(key)) dst[key] = src[key];
        return dst;
    }
    function isRectEqual(rect1, rect2) {
        return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
    }
    var _throttleTimeout;
    function throttle(callback, ms) {
        return function() {
            if (!_throttleTimeout) {
                var args = arguments, _this = this;
                if (args.length === 1) callback.call(_this, args[0]); else callback.apply(_this, args);
                _throttleTimeout = setTimeout((function() {
                    _throttleTimeout = void 0;
                }), ms);
            }
        };
    }
    function cancelThrottle() {
        clearTimeout(_throttleTimeout);
        _throttleTimeout = void 0;
    }
    function scrollBy(el, x, y) {
        el.scrollLeft += x;
        el.scrollTop += y;
    }
    function clone(el) {
        var Polymer = window.Polymer;
        var $ = window.jQuery || window.Zepto;
        if (Polymer && Polymer.dom) return Polymer.dom(el).cloneNode(true); else if ($) return $(el).clone(true)[0]; else return el.cloneNode(true);
    }
    function getChildContainingRectFromElement(container, options, ghostEl) {
        var rect = {};
        Array.from(container.children).forEach((function(child) {
            var _rect$left, _rect$top, _rect$right, _rect$bottom;
            if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl) return;
            var childRect = getRect(child);
            rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : 1 / 0, childRect.left);
            rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : 1 / 0, childRect.top);
            rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -1 / 0, childRect.right);
            rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -1 / 0, childRect.bottom);
        }));
        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;
        rect.x = rect.left;
        rect.y = rect.top;
        return rect;
    }
    var expando = "Sortable" + (new Date).getTime();
    function AnimationStateManager() {
        var animationCallbackId, animationStates = [];
        return {
            captureAnimationState: function captureAnimationState() {
                animationStates = [];
                if (!this.options.animation) return;
                var children = [].slice.call(this.el.children);
                children.forEach((function(child) {
                    if (css(child, "display") === "none" || child === sortable_esm_Sortable.ghost) return;
                    animationStates.push({
                        target: child,
                        rect: getRect(child)
                    });
                    var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
                    if (child.thisAnimationDuration) {
                        var childMatrix = matrix(child, true);
                        if (childMatrix) {
                            fromRect.top -= childMatrix.f;
                            fromRect.left -= childMatrix.e;
                        }
                    }
                    child.fromRect = fromRect;
                }));
            },
            addAnimationState: function addAnimationState(state) {
                animationStates.push(state);
            },
            removeAnimationState: function removeAnimationState(target) {
                animationStates.splice(indexOfObject(animationStates, {
                    target
                }), 1);
            },
            animateAll: function animateAll(callback) {
                var _this = this;
                if (!this.options.animation) {
                    clearTimeout(animationCallbackId);
                    if (typeof callback === "function") callback();
                    return;
                }
                var animating = false, animationTime = 0;
                animationStates.forEach((function(state) {
                    var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
                    if (targetMatrix) {
                        toRect.top -= targetMatrix.f;
                        toRect.left -= targetMatrix.e;
                    }
                    target.toRect = toRect;
                    if (target.thisAnimationDuration) if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
                    if (!isRectEqual(toRect, fromRect)) {
                        target.prevFromRect = fromRect;
                        target.prevToRect = toRect;
                        if (!time) time = _this.options.animation;
                        _this.animate(target, animatingRect, toRect, time);
                    }
                    if (time) {
                        animating = true;
                        animationTime = Math.max(animationTime, time);
                        clearTimeout(target.animationResetTimer);
                        target.animationResetTimer = setTimeout((function() {
                            target.animationTime = 0;
                            target.prevFromRect = null;
                            target.fromRect = null;
                            target.prevToRect = null;
                            target.thisAnimationDuration = null;
                        }), time);
                        target.thisAnimationDuration = time;
                    }
                }));
                clearTimeout(animationCallbackId);
                if (!animating) {
                    if (typeof callback === "function") callback();
                } else animationCallbackId = setTimeout((function() {
                    if (typeof callback === "function") callback();
                }), animationTime);
                animationStates = [];
            },
            animate: function animate(target, currentRect, toRect, duration) {
                if (duration) {
                    css(target, "transition", "");
                    css(target, "transform", "");
                    var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
                    target.animatingX = !!translateX;
                    target.animatingY = !!translateY;
                    css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
                    this.forRepaintDummy = repaint(target);
                    css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
                    css(target, "transform", "translate3d(0,0,0)");
                    typeof target.animated === "number" && clearTimeout(target.animated);
                    target.animated = setTimeout((function() {
                        css(target, "transition", "");
                        css(target, "transform", "");
                        target.animated = false;
                        target.animatingX = false;
                        target.animatingY = false;
                    }), duration);
                }
            }
        };
    }
    function repaint(target) {
        return target.offsetWidth;
    }
    function calculateRealTime(animatingRect, fromRect, toRect, options) {
        return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
    }
    var plugins = [];
    var sortable_esm_defaults = {
        initializeByDefault: true
    };
    var PluginManager = {
        mount: function mount(plugin) {
            for (var option in sortable_esm_defaults) if (sortable_esm_defaults.hasOwnProperty(option) && !(option in plugin)) plugin[option] = sortable_esm_defaults[option];
            plugins.forEach((function(p) {
                if (p.pluginName === plugin.pluginName) throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
            }));
            plugins.push(plugin);
        },
        pluginEvent: function pluginEvent(eventName, sortable, evt) {
            var _this = this;
            this.eventCanceled = false;
            evt.cancel = function() {
                _this.eventCanceled = true;
            };
            var eventNameGlobal = eventName + "Global";
            plugins.forEach((function(plugin) {
                if (!sortable[plugin.pluginName]) return;
                if (sortable[plugin.pluginName][eventNameGlobal]) sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
                    sortable
                }, evt));
                if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) sortable[plugin.pluginName][eventName](_objectSpread2({
                    sortable
                }, evt));
            }));
        },
        initializePlugins: function initializePlugins(sortable, el, defaults, options) {
            plugins.forEach((function(plugin) {
                var pluginName = plugin.pluginName;
                if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
                var initialized = new plugin(sortable, el, sortable.options);
                initialized.sortable = sortable;
                initialized.options = sortable.options;
                sortable[pluginName] = initialized;
                _extends(defaults, initialized.defaults);
            }));
            for (var option in sortable.options) {
                if (!sortable.options.hasOwnProperty(option)) continue;
                var modified = this.modifyOption(sortable, option, sortable.options[option]);
                if (typeof modified !== "undefined") sortable.options[option] = modified;
            }
        },
        getEventProperties: function getEventProperties(name, sortable) {
            var eventProperties = {};
            plugins.forEach((function(plugin) {
                if (typeof plugin.eventProperties !== "function") return;
                _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
            }));
            return eventProperties;
        },
        modifyOption: function modifyOption(sortable, name, value) {
            var modifiedValue;
            plugins.forEach((function(plugin) {
                if (!sortable[plugin.pluginName]) return;
                if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
            }));
            return modifiedValue;
        }
    };
    function dispatchEvent(_ref) {
        var sortable = _ref.sortable, rootEl = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex = _ref.oldIndex, newIndex = _ref.newIndex, oldDraggableIndex = _ref.oldDraggableIndex, newDraggableIndex = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
        sortable = sortable || rootEl && rootEl[expando];
        if (!sortable) return;
        var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
        if (window.CustomEvent && !IE11OrLess && !Edge) evt = new CustomEvent(name, {
            bubbles: true,
            cancelable: true
        }); else {
            evt = document.createEvent("Event");
            evt.initEvent(name, true, true);
        }
        evt.to = toEl || rootEl;
        evt.from = fromEl || rootEl;
        evt.item = targetEl || rootEl;
        evt.clone = cloneEl;
        evt.oldIndex = oldIndex;
        evt.newIndex = newIndex;
        evt.oldDraggableIndex = oldDraggableIndex;
        evt.newDraggableIndex = newDraggableIndex;
        evt.originalEvent = originalEvent;
        evt.pullMode = putSortable ? putSortable.lastPutMode : void 0;
        var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
        for (var option in allEventProperties) evt[option] = allEventProperties[option];
        if (rootEl) rootEl.dispatchEvent(evt);
        if (options[onName]) options[onName].call(sortable, evt);
    }
    var _excluded = [ "evt" ];
    var pluginEvent = function pluginEvent(eventName, sortable) {
        var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
        PluginManager.pluginEvent.bind(sortable_esm_Sortable)(eventName, sortable, _objectSpread2({
            dragEl,
            parentEl,
            ghostEl,
            rootEl,
            nextEl,
            lastDownEl,
            cloneEl,
            cloneHidden,
            dragStarted: moved,
            putSortable,
            activeSortable: sortable_esm_Sortable.active,
            originalEvent,
            oldIndex,
            oldDraggableIndex,
            newIndex,
            newDraggableIndex,
            hideGhostForTarget: _hideGhostForTarget,
            unhideGhostForTarget: _unhideGhostForTarget,
            cloneNowHidden: function cloneNowHidden() {
                cloneHidden = true;
            },
            cloneNowShown: function cloneNowShown() {
                cloneHidden = false;
            },
            dispatchSortableEvent: function dispatchSortableEvent(name) {
                _dispatchEvent({
                    sortable,
                    name,
                    originalEvent
                });
            }
        }, data));
    };
    function _dispatchEvent(info) {
        dispatchEvent(_objectSpread2({
            putSortable,
            cloneEl,
            targetEl: dragEl,
            rootEl,
            oldIndex,
            oldDraggableIndex,
            newIndex,
            newDraggableIndex
        }, info));
    }
    var dragEl, parentEl, ghostEl, rootEl, nextEl, lastDownEl, cloneEl, cloneHidden, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex, activeGroup, putSortable, tapEvt, touchEvt, lastDx, lastDy, tapDistanceLeft, tapDistanceTop, moved, lastTarget, lastDirection, targetMoveDistance, ghostRelativeParent, awaitingDragStarted = false, ignoreNextClick = false, sortables = [], pastFirstInvertThresh = false, isCircumstantialInvert = false, ghostRelativeParentInitialScroll = [], _silent = false, savedInputChecked = [];
    var documentExists = typeof document !== "undefined", PositionGhostAbsolutely = IOS, CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float", supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div"), supportCssPointerEvents = function() {
        if (!documentExists) return;
        if (IE11OrLess) return false;
        var el = document.createElement("x");
        el.style.cssText = "pointer-events:auto";
        return el.style.pointerEvents === "auto";
    }(), _detectDirection = function _detectDirection(el, options) {
        var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
        if (elCSS.display === "flex") return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
        if (elCSS.display === "grid") return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
        if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
            var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
            return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
        }
        return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
    }, _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
        var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
        return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
    }, _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
        var ret;
        sortables.some((function(sortable) {
            var threshold = sortable[expando].options.emptyInsertThreshold;
            if (!threshold || lastChild(sortable)) return;
            var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
            if (insideHorizontally && insideVertically) return ret = sortable;
        }));
        return ret;
    }, _prepareGroup = function _prepareGroup(options) {
        function toFn(value, pull) {
            return function(to, from, dragEl, evt) {
                var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
                if (value == null && (pull || sameGroup)) return true; else if (value == null || value === false) return false; else if (pull && value === "clone") return value; else if (typeof value === "function") return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt); else {
                    var otherGroup = (pull ? to : from).options.group.name;
                    return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
                }
            };
        }
        var group = {};
        var originalGroup = options.group;
        if (!originalGroup || _typeof(originalGroup) != "object") originalGroup = {
            name: originalGroup
        };
        group.name = originalGroup.name;
        group.checkPull = toFn(originalGroup.pull, true);
        group.checkPut = toFn(originalGroup.put);
        group.revertClone = originalGroup.revertClone;
        options.group = group;
    }, _hideGhostForTarget = function _hideGhostForTarget() {
        if (!supportCssPointerEvents && ghostEl) css(ghostEl, "display", "none");
    }, _unhideGhostForTarget = function _unhideGhostForTarget() {
        if (!supportCssPointerEvents && ghostEl) css(ghostEl, "display", "");
    };
    if (documentExists && !ChromeForAndroid) document.addEventListener("click", (function(evt) {
        if (ignoreNextClick) {
            evt.preventDefault();
            evt.stopPropagation && evt.stopPropagation();
            evt.stopImmediatePropagation && evt.stopImmediatePropagation();
            ignoreNextClick = false;
            return false;
        }
    }), true);
    var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
        if (dragEl) {
            evt = evt.touches ? evt.touches[0] : evt;
            var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
            if (nearest) {
                var event = {};
                for (var i in evt) if (evt.hasOwnProperty(i)) event[i] = evt[i];
                event.target = event.rootEl = nearest;
                event.preventDefault = void 0;
                event.stopPropagation = void 0;
                nearest[expando]._onDragOver(event);
            }
        }
    };
    var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
        if (dragEl) dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    };
    function sortable_esm_Sortable(el, options) {
        if (!(el && el.nodeType && el.nodeType === 1)) throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
        this.el = el;
        this.options = options = _extends({}, options);
        el[expando] = this;
        var defaults = {
            group: null,
            sort: true,
            disabled: false,
            store: null,
            handle: null,
            draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
            swapThreshold: 1,
            invertSwap: false,
            invertedSwapThreshold: null,
            removeCloneOnHide: true,
            direction: function direction() {
                return _detectDirection(el, this.options);
            },
            ghostClass: "sortable-ghost",
            chosenClass: "sortable-chosen",
            dragClass: "sortable-drag",
            ignore: "a, img",
            filter: null,
            preventOnFilter: true,
            animation: 0,
            easing: null,
            setData: function setData(dataTransfer, dragEl) {
                dataTransfer.setData("Text", dragEl.textContent);
            },
            dropBubble: false,
            dragoverBubble: false,
            dataIdAttr: "data-id",
            delay: 0,
            delayOnTouchOnly: false,
            touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
            forceFallback: false,
            fallbackClass: "sortable-fallback",
            fallbackOnBody: false,
            fallbackTolerance: 0,
            fallbackOffset: {
                x: 0,
                y: 0
            },
            supportPointer: sortable_esm_Sortable.supportPointer !== false && "PointerEvent" in window && !Safari,
            emptyInsertThreshold: 5
        };
        PluginManager.initializePlugins(this, el, defaults);
        for (var name in defaults) !(name in options) && (options[name] = defaults[name]);
        _prepareGroup(options);
        for (var fn in this) if (fn.charAt(0) === "_" && typeof this[fn] === "function") this[fn] = this[fn].bind(this);
        this.nativeDraggable = options.forceFallback ? false : supportDraggable;
        if (this.nativeDraggable) this.options.touchStartThreshold = 1;
        if (options.supportPointer) on(el, "pointerdown", this._onTapStart); else {
            on(el, "mousedown", this._onTapStart);
            on(el, "touchstart", this._onTapStart);
        }
        if (this.nativeDraggable) {
            on(el, "dragover", this);
            on(el, "dragenter", this);
        }
        sortables.push(this.el);
        options.store && options.store.get && this.sort(options.store.get(this) || []);
        _extends(this, AnimationStateManager());
    }
    sortable_esm_Sortable.prototype = {
        constructor: sortable_esm_Sortable,
        _isOutsideThisEl: function _isOutsideThisEl(target) {
            if (!this.el.contains(target) && target !== this.el) lastTarget = null;
        },
        _getDirection: function _getDirection(evt, target) {
            return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
        },
        _onTapStart: function _onTapStart(evt) {
            if (!evt.cancelable) return;
            var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
            _saveInputCheckedState(el);
            if (dragEl) return;
            if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) return;
            if (originalTarget.isContentEditable) return;
            if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") return;
            target = closest(target, options.draggable, el, false);
            if (target && target.animated) return;
            if (lastDownEl === target) return;
            oldIndex = index(target);
            oldDraggableIndex = index(target, options.draggable);
            if (typeof filter === "function") {
                if (filter.call(this, evt, target, this)) {
                    _dispatchEvent({
                        sortable: _this,
                        rootEl: originalTarget,
                        name: "filter",
                        targetEl: target,
                        toEl: el,
                        fromEl: el
                    });
                    pluginEvent("filter", _this, {
                        evt
                    });
                    preventOnFilter && evt.cancelable && evt.preventDefault();
                    return;
                }
            } else if (filter) {
                filter = filter.split(",").some((function(criteria) {
                    criteria = closest(originalTarget, criteria.trim(), el, false);
                    if (criteria) {
                        _dispatchEvent({
                            sortable: _this,
                            rootEl: criteria,
                            name: "filter",
                            targetEl: target,
                            fromEl: el,
                            toEl: el
                        });
                        pluginEvent("filter", _this, {
                            evt
                        });
                        return true;
                    }
                }));
                if (filter) {
                    preventOnFilter && evt.cancelable && evt.preventDefault();
                    return;
                }
            }
            if (options.handle && !closest(originalTarget, options.handle, el, false)) return;
            this._prepareDragStart(evt, touch, target);
        },
        _prepareDragStart: function _prepareDragStart(evt, touch, target) {
            var dragStartFn, _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument;
            if (target && !dragEl && target.parentNode === el) {
                var dragRect = getRect(target);
                rootEl = el;
                dragEl = target;
                parentEl = dragEl.parentNode;
                nextEl = dragEl.nextSibling;
                lastDownEl = target;
                activeGroup = options.group;
                sortable_esm_Sortable.dragged = dragEl;
                tapEvt = {
                    target: dragEl,
                    clientX: (touch || evt).clientX,
                    clientY: (touch || evt).clientY
                };
                tapDistanceLeft = tapEvt.clientX - dragRect.left;
                tapDistanceTop = tapEvt.clientY - dragRect.top;
                this._lastX = (touch || evt).clientX;
                this._lastY = (touch || evt).clientY;
                dragEl.style["will-change"] = "all";
                dragStartFn = function dragStartFn() {
                    pluginEvent("delayEnded", _this, {
                        evt
                    });
                    if (sortable_esm_Sortable.eventCanceled) {
                        _this._onDrop();
                        return;
                    }
                    _this._disableDelayedDragEvents();
                    if (!FireFox && _this.nativeDraggable) dragEl.draggable = true;
                    _this._triggerDragStart(evt, touch);
                    _dispatchEvent({
                        sortable: _this,
                        name: "choose",
                        originalEvent: evt
                    });
                    toggleClass(dragEl, options.chosenClass, true);
                };
                options.ignore.split(",").forEach((function(criteria) {
                    find(dragEl, criteria.trim(), _disableDraggable);
                }));
                on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
                on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
                on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
                on(ownerDocument, "mouseup", _this._onDrop);
                on(ownerDocument, "touchend", _this._onDrop);
                on(ownerDocument, "touchcancel", _this._onDrop);
                if (FireFox && this.nativeDraggable) {
                    this.options.touchStartThreshold = 4;
                    dragEl.draggable = true;
                }
                pluginEvent("delayStart", this, {
                    evt
                });
                if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
                    if (sortable_esm_Sortable.eventCanceled) {
                        this._onDrop();
                        return;
                    }
                    on(ownerDocument, "mouseup", _this._disableDelayedDrag);
                    on(ownerDocument, "touchend", _this._disableDelayedDrag);
                    on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
                    on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
                    on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
                    options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
                    _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
                } else dragStartFn();
            }
        },
        _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
            var touch = e.touches ? e.touches[0] : e;
            if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) this._disableDelayedDrag();
        },
        _disableDelayedDrag: function _disableDelayedDrag() {
            dragEl && _disableDraggable(dragEl);
            clearTimeout(this._dragStartTimer);
            this._disableDelayedDragEvents();
        },
        _disableDelayedDragEvents: function _disableDelayedDragEvents() {
            var ownerDocument = this.el.ownerDocument;
            off(ownerDocument, "mouseup", this._disableDelayedDrag);
            off(ownerDocument, "touchend", this._disableDelayedDrag);
            off(ownerDocument, "touchcancel", this._disableDelayedDrag);
            off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
            off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
            off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
        },
        _triggerDragStart: function _triggerDragStart(evt, touch) {
            touch = touch || evt.pointerType == "touch" && evt;
            if (!this.nativeDraggable || touch) if (this.options.supportPointer) on(document, "pointermove", this._onTouchMove); else if (touch) on(document, "touchmove", this._onTouchMove); else on(document, "mousemove", this._onTouchMove); else {
                on(dragEl, "dragend", this);
                on(rootEl, "dragstart", this._onDragStart);
            }
            try {
                if (document.selection) _nextTick((function() {
                    document.selection.empty();
                })); else window.getSelection().removeAllRanges();
            } catch (err) {}
        },
        _dragStarted: function _dragStarted(fallback, evt) {
            awaitingDragStarted = false;
            if (rootEl && dragEl) {
                pluginEvent("dragStarted", this, {
                    evt
                });
                if (this.nativeDraggable) on(document, "dragover", _checkOutsideTargetEl);
                var options = this.options;
                !fallback && toggleClass(dragEl, options.dragClass, false);
                toggleClass(dragEl, options.ghostClass, true);
                sortable_esm_Sortable.active = this;
                fallback && this._appendGhost();
                _dispatchEvent({
                    sortable: this,
                    name: "start",
                    originalEvent: evt
                });
            } else this._nulling();
        },
        _emulateDragOver: function _emulateDragOver() {
            if (touchEvt) {
                this._lastX = touchEvt.clientX;
                this._lastY = touchEvt.clientY;
                _hideGhostForTarget();
                var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
                var parent = target;
                while (target && target.shadowRoot) {
                    target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
                    if (target === parent) break;
                    parent = target;
                }
                dragEl.parentNode[expando]._isOutsideThisEl(target);
                if (parent) do {
                    if (parent[expando]) {
                        var inserted = void 0;
                        inserted = parent[expando]._onDragOver({
                            clientX: touchEvt.clientX,
                            clientY: touchEvt.clientY,
                            target,
                            rootEl: parent
                        });
                        if (inserted && !this.options.dragoverBubble) break;
                    }
                    target = parent;
                } while (parent = getParentOrHost(parent));
                _unhideGhostForTarget();
            }
        },
        _onTouchMove: function _onTouchMove(evt) {
            if (tapEvt) {
                var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
                if (!sortable_esm_Sortable.active && !awaitingDragStarted) {
                    if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) return;
                    this._onDragStart(evt, true);
                }
                if (ghostEl) {
                    if (ghostMatrix) {
                        ghostMatrix.e += dx - (lastDx || 0);
                        ghostMatrix.f += dy - (lastDy || 0);
                    } else ghostMatrix = {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: 1,
                        e: dx,
                        f: dy
                    };
                    var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
                    css(ghostEl, "webkitTransform", cssMatrix);
                    css(ghostEl, "mozTransform", cssMatrix);
                    css(ghostEl, "msTransform", cssMatrix);
                    css(ghostEl, "transform", cssMatrix);
                    lastDx = dx;
                    lastDy = dy;
                    touchEvt = touch;
                }
                evt.cancelable && evt.preventDefault();
            }
        },
        _appendGhost: function _appendGhost() {
            if (!ghostEl) {
                var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
                if (PositionGhostAbsolutely) {
                    ghostRelativeParent = container;
                    while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) ghostRelativeParent = ghostRelativeParent.parentNode;
                    if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
                        if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
                        rect.top += ghostRelativeParent.scrollTop;
                        rect.left += ghostRelativeParent.scrollLeft;
                    } else ghostRelativeParent = getWindowScrollingElement();
                    ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
                }
                ghostEl = dragEl.cloneNode(true);
                toggleClass(ghostEl, options.ghostClass, false);
                toggleClass(ghostEl, options.fallbackClass, true);
                toggleClass(ghostEl, options.dragClass, true);
                css(ghostEl, "transition", "");
                css(ghostEl, "transform", "");
                css(ghostEl, "box-sizing", "border-box");
                css(ghostEl, "margin", 0);
                css(ghostEl, "top", rect.top);
                css(ghostEl, "left", rect.left);
                css(ghostEl, "width", rect.width);
                css(ghostEl, "height", rect.height);
                css(ghostEl, "opacity", "0.8");
                css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
                css(ghostEl, "zIndex", "100000");
                css(ghostEl, "pointerEvents", "none");
                sortable_esm_Sortable.ghost = ghostEl;
                container.appendChild(ghostEl);
                css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
            }
        },
        _onDragStart: function _onDragStart(evt, fallback) {
            var _this = this;
            var dataTransfer = evt.dataTransfer;
            var options = _this.options;
            pluginEvent("dragStart", this, {
                evt
            });
            if (sortable_esm_Sortable.eventCanceled) {
                this._onDrop();
                return;
            }
            pluginEvent("setupClone", this);
            if (!sortable_esm_Sortable.eventCanceled) {
                cloneEl = clone(dragEl);
                cloneEl.removeAttribute("id");
                cloneEl.draggable = false;
                cloneEl.style["will-change"] = "";
                this._hideClone();
                toggleClass(cloneEl, this.options.chosenClass, false);
                sortable_esm_Sortable.clone = cloneEl;
            }
            _this.cloneId = _nextTick((function() {
                pluginEvent("clone", _this);
                if (sortable_esm_Sortable.eventCanceled) return;
                if (!_this.options.removeCloneOnHide) rootEl.insertBefore(cloneEl, dragEl);
                _this._hideClone();
                _dispatchEvent({
                    sortable: _this,
                    name: "clone"
                });
            }));
            !fallback && toggleClass(dragEl, options.dragClass, true);
            if (fallback) {
                ignoreNextClick = true;
                _this._loopId = setInterval(_this._emulateDragOver, 50);
            } else {
                off(document, "mouseup", _this._onDrop);
                off(document, "touchend", _this._onDrop);
                off(document, "touchcancel", _this._onDrop);
                if (dataTransfer) {
                    dataTransfer.effectAllowed = "move";
                    options.setData && options.setData.call(_this, dataTransfer, dragEl);
                }
                on(document, "drop", _this);
                css(dragEl, "transform", "translateZ(0)");
            }
            awaitingDragStarted = true;
            _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
            on(document, "selectstart", _this);
            moved = true;
            if (Safari) css(document.body, "user-select", "none");
        },
        _onDragOver: function _onDragOver(evt) {
            var dragRect, targetRect, revert, vertical, el = this.el, target = evt.target, options = this.options, group = options.group, activeSortable = sortable_esm_Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, _this = this, completedFired = false;
            if (_silent) return;
            function dragOverEvent(name, extra) {
                pluginEvent(name, _this, _objectSpread2({
                    evt,
                    isOwner,
                    axis: vertical ? "vertical" : "horizontal",
                    revert,
                    dragRect,
                    targetRect,
                    canSort,
                    fromSortable,
                    target,
                    completed,
                    onMove: function onMove(target, after) {
                        return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after);
                    },
                    changed
                }, extra));
            }
            function capture() {
                dragOverEvent("dragOverAnimationCapture");
                _this.captureAnimationState();
                if (_this !== fromSortable) fromSortable.captureAnimationState();
            }
            function completed(insertion) {
                dragOverEvent("dragOverCompleted", {
                    insertion
                });
                if (insertion) {
                    if (isOwner) activeSortable._hideClone(); else activeSortable._showClone(_this);
                    if (_this !== fromSortable) {
                        toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
                        toggleClass(dragEl, options.ghostClass, true);
                    }
                    if (putSortable !== _this && _this !== sortable_esm_Sortable.active) putSortable = _this; else if (_this === sortable_esm_Sortable.active && putSortable) putSortable = null;
                    if (fromSortable === _this) _this._ignoreWhileAnimating = target;
                    _this.animateAll((function() {
                        dragOverEvent("dragOverAnimationComplete");
                        _this._ignoreWhileAnimating = null;
                    }));
                    if (_this !== fromSortable) {
                        fromSortable.animateAll();
                        fromSortable._ignoreWhileAnimating = null;
                    }
                }
                if (target === dragEl && !dragEl.animated || target === el && !target.animated) lastTarget = null;
                if (!options.dragoverBubble && !evt.rootEl && target !== document) {
                    dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
                    !insertion && nearestEmptyInsertDetectEvent(evt);
                }
                !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
                return completedFired = true;
            }
            function changed() {
                newIndex = index(dragEl);
                newDraggableIndex = index(dragEl, options.draggable);
                _dispatchEvent({
                    sortable: _this,
                    name: "change",
                    toEl: el,
                    newIndex,
                    newDraggableIndex,
                    originalEvent: evt
                });
            }
            if (evt.preventDefault !== void 0) evt.cancelable && evt.preventDefault();
            target = closest(target, options.draggable, el, true);
            dragOverEvent("dragOver");
            if (sortable_esm_Sortable.eventCanceled) return completedFired;
            if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) return completed(false);
            ignoreNextClick = false;
            if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
                vertical = this._getDirection(evt, target) === "vertical";
                dragRect = getRect(dragEl);
                dragOverEvent("dragOverValid");
                if (sortable_esm_Sortable.eventCanceled) return completedFired;
                if (revert) {
                    parentEl = rootEl;
                    capture();
                    this._hideClone();
                    dragOverEvent("revert");
                    if (!sortable_esm_Sortable.eventCanceled) if (nextEl) rootEl.insertBefore(dragEl, nextEl); else rootEl.appendChild(dragEl);
                    return completed(true);
                }
                var elLastChild = lastChild(el, options.draggable);
                if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
                    if (elLastChild === dragEl) return completed(false);
                    if (elLastChild && el === evt.target) target = elLastChild;
                    if (target) targetRect = getRect(target);
                    if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
                        capture();
                        if (elLastChild && elLastChild.nextSibling) el.insertBefore(dragEl, elLastChild.nextSibling); else el.appendChild(dragEl);
                        parentEl = el;
                        changed();
                        return completed(true);
                    }
                } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
                    var firstChild = getChild(el, 0, options, true);
                    if (firstChild === dragEl) return completed(false);
                    target = firstChild;
                    targetRect = getRect(target);
                    if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
                        capture();
                        el.insertBefore(dragEl, firstChild);
                        parentEl = el;
                        changed();
                        return completed(true);
                    }
                } else if (target.parentNode === el) {
                    targetRect = getRect(target);
                    var targetBeforeFirstSwap, direction = 0, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
                    if (lastTarget !== target) {
                        targetBeforeFirstSwap = targetRect[side1];
                        pastFirstInvertThresh = false;
                        isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
                    }
                    direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
                    var sibling;
                    if (direction !== 0) {
                        var dragIndex = index(dragEl);
                        do {
                            dragIndex -= direction;
                            sibling = parentEl.children[dragIndex];
                        } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
                    }
                    if (direction === 0 || sibling === target) return completed(false);
                    lastTarget = target;
                    lastDirection = direction;
                    var nextSibling = target.nextElementSibling, after = false;
                    after = direction === 1;
                    var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
                    if (moveVector !== false) {
                        if (moveVector === 1 || moveVector === -1) after = moveVector === 1;
                        _silent = true;
                        setTimeout(_unsilent, 30);
                        capture();
                        if (after && !nextSibling) el.appendChild(dragEl); else target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
                        if (scrolledPastTop) scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
                        parentEl = dragEl.parentNode;
                        if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
                        changed();
                        return completed(true);
                    }
                }
                if (el.contains(dragEl)) return completed(false);
            }
            return false;
        },
        _ignoreWhileAnimating: null,
        _offMoveEvents: function _offMoveEvents() {
            off(document, "mousemove", this._onTouchMove);
            off(document, "touchmove", this._onTouchMove);
            off(document, "pointermove", this._onTouchMove);
            off(document, "dragover", nearestEmptyInsertDetectEvent);
            off(document, "mousemove", nearestEmptyInsertDetectEvent);
            off(document, "touchmove", nearestEmptyInsertDetectEvent);
        },
        _offUpEvents: function _offUpEvents() {
            var ownerDocument = this.el.ownerDocument;
            off(ownerDocument, "mouseup", this._onDrop);
            off(ownerDocument, "touchend", this._onDrop);
            off(ownerDocument, "pointerup", this._onDrop);
            off(ownerDocument, "touchcancel", this._onDrop);
            off(document, "selectstart", this);
        },
        _onDrop: function _onDrop(evt) {
            var el = this.el, options = this.options;
            newIndex = index(dragEl);
            newDraggableIndex = index(dragEl, options.draggable);
            pluginEvent("drop", this, {
                evt
            });
            parentEl = dragEl && dragEl.parentNode;
            newIndex = index(dragEl);
            newDraggableIndex = index(dragEl, options.draggable);
            if (sortable_esm_Sortable.eventCanceled) {
                this._nulling();
                return;
            }
            awaitingDragStarted = false;
            isCircumstantialInvert = false;
            pastFirstInvertThresh = false;
            clearInterval(this._loopId);
            clearTimeout(this._dragStartTimer);
            _cancelNextTick(this.cloneId);
            _cancelNextTick(this._dragStartId);
            if (this.nativeDraggable) {
                off(document, "drop", this);
                off(el, "dragstart", this._onDragStart);
            }
            this._offMoveEvents();
            this._offUpEvents();
            if (Safari) css(document.body, "user-select", "");
            css(dragEl, "transform", "");
            if (evt) {
                if (moved) {
                    evt.cancelable && evt.preventDefault();
                    !options.dropBubble && evt.stopPropagation();
                }
                ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
                if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
                if (dragEl) {
                    if (this.nativeDraggable) off(dragEl, "dragend", this);
                    _disableDraggable(dragEl);
                    dragEl.style["will-change"] = "";
                    if (moved && !awaitingDragStarted) toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
                    toggleClass(dragEl, this.options.chosenClass, false);
                    _dispatchEvent({
                        sortable: this,
                        name: "unchoose",
                        toEl: parentEl,
                        newIndex: null,
                        newDraggableIndex: null,
                        originalEvent: evt
                    });
                    if (rootEl !== parentEl) {
                        if (newIndex >= 0) {
                            _dispatchEvent({
                                rootEl: parentEl,
                                name: "add",
                                toEl: parentEl,
                                fromEl: rootEl,
                                originalEvent: evt
                            });
                            _dispatchEvent({
                                sortable: this,
                                name: "remove",
                                toEl: parentEl,
                                originalEvent: evt
                            });
                            _dispatchEvent({
                                rootEl: parentEl,
                                name: "sort",
                                toEl: parentEl,
                                fromEl: rootEl,
                                originalEvent: evt
                            });
                            _dispatchEvent({
                                sortable: this,
                                name: "sort",
                                toEl: parentEl,
                                originalEvent: evt
                            });
                        }
                        putSortable && putSortable.save();
                    } else if (newIndex !== oldIndex) if (newIndex >= 0) {
                        _dispatchEvent({
                            sortable: this,
                            name: "update",
                            toEl: parentEl,
                            originalEvent: evt
                        });
                        _dispatchEvent({
                            sortable: this,
                            name: "sort",
                            toEl: parentEl,
                            originalEvent: evt
                        });
                    }
                    if (sortable_esm_Sortable.active) {
                        if (newIndex == null || newIndex === -1) {
                            newIndex = oldIndex;
                            newDraggableIndex = oldDraggableIndex;
                        }
                        _dispatchEvent({
                            sortable: this,
                            name: "end",
                            toEl: parentEl,
                            originalEvent: evt
                        });
                        this.save();
                    }
                }
            }
            this._nulling();
        },
        _nulling: function _nulling() {
            pluginEvent("nulling", this);
            rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = sortable_esm_Sortable.dragged = sortable_esm_Sortable.ghost = sortable_esm_Sortable.clone = sortable_esm_Sortable.active = null;
            savedInputChecked.forEach((function(el) {
                el.checked = true;
            }));
            savedInputChecked.length = lastDx = lastDy = 0;
        },
        handleEvent: function handleEvent(evt) {
            switch (evt.type) {
              case "drop":
              case "dragend":
                this._onDrop(evt);
                break;

              case "dragenter":
              case "dragover":
                if (dragEl) {
                    this._onDragOver(evt);
                    _globalDragOver(evt);
                }
                break;

              case "selectstart":
                evt.preventDefault();
                break;
            }
        },
        toArray: function toArray() {
            var el, order = [], children = this.el.children, i = 0, n = children.length, options = this.options;
            for (;i < n; i++) {
                el = children[i];
                if (closest(el, options.draggable, this.el, false)) order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
            }
            return order;
        },
        sort: function sort(order, useAnimation) {
            var items = {}, rootEl = this.el;
            this.toArray().forEach((function(id, i) {
                var el = rootEl.children[i];
                if (closest(el, this.options.draggable, rootEl, false)) items[id] = el;
            }), this);
            useAnimation && this.captureAnimationState();
            order.forEach((function(id) {
                if (items[id]) {
                    rootEl.removeChild(items[id]);
                    rootEl.appendChild(items[id]);
                }
            }));
            useAnimation && this.animateAll();
        },
        save: function save() {
            var store = this.options.store;
            store && store.set && store.set(this);
        },
        closest: function closest$1(el, selector) {
            return closest(el, selector || this.options.draggable, this.el, false);
        },
        option: function option(name, value) {
            var options = this.options;
            if (value === void 0) return options[name]; else {
                var modifiedValue = PluginManager.modifyOption(this, name, value);
                if (typeof modifiedValue !== "undefined") options[name] = modifiedValue; else options[name] = value;
                if (name === "group") _prepareGroup(options);
            }
        },
        destroy: function destroy() {
            pluginEvent("destroy", this);
            var el = this.el;
            el[expando] = null;
            off(el, "mousedown", this._onTapStart);
            off(el, "touchstart", this._onTapStart);
            off(el, "pointerdown", this._onTapStart);
            if (this.nativeDraggable) {
                off(el, "dragover", this);
                off(el, "dragenter", this);
            }
            Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), (function(el) {
                el.removeAttribute("draggable");
            }));
            this._onDrop();
            this._disableDelayedDragEvents();
            sortables.splice(sortables.indexOf(this.el), 1);
            this.el = el = null;
        },
        _hideClone: function _hideClone() {
            if (!cloneHidden) {
                pluginEvent("hideClone", this);
                if (sortable_esm_Sortable.eventCanceled) return;
                css(cloneEl, "display", "none");
                if (this.options.removeCloneOnHide && cloneEl.parentNode) cloneEl.parentNode.removeChild(cloneEl);
                cloneHidden = true;
            }
        },
        _showClone: function _showClone(putSortable) {
            if (putSortable.lastPutMode !== "clone") {
                this._hideClone();
                return;
            }
            if (cloneHidden) {
                pluginEvent("showClone", this);
                if (sortable_esm_Sortable.eventCanceled) return;
                if (dragEl.parentNode == rootEl && !this.options.group.revertClone) rootEl.insertBefore(cloneEl, dragEl); else if (nextEl) rootEl.insertBefore(cloneEl, nextEl); else rootEl.appendChild(cloneEl);
                if (this.options.group.revertClone) this.animate(dragEl, cloneEl);
                css(cloneEl, "display", "");
                cloneHidden = false;
            }
        }
    };
    function _globalDragOver(evt) {
        if (evt.dataTransfer) evt.dataTransfer.dropEffect = "move";
        evt.cancelable && evt.preventDefault();
    }
    function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
        var evt, retVal, sortable = fromEl[expando], onMoveFn = sortable.options.onMove;
        if (window.CustomEvent && !IE11OrLess && !Edge) evt = new CustomEvent("move", {
            bubbles: true,
            cancelable: true
        }); else {
            evt = document.createEvent("Event");
            evt.initEvent("move", true, true);
        }
        evt.to = toEl;
        evt.from = fromEl;
        evt.dragged = dragEl;
        evt.draggedRect = dragRect;
        evt.related = targetEl || toEl;
        evt.relatedRect = targetRect || getRect(toEl);
        evt.willInsertAfter = willInsertAfter;
        evt.originalEvent = originalEvent;
        fromEl.dispatchEvent(evt);
        if (onMoveFn) retVal = onMoveFn.call(sortable, evt, originalEvent);
        return retVal;
    }
    function _disableDraggable(el) {
        el.draggable = false;
    }
    function _unsilent() {
        _silent = false;
    }
    function _ghostIsFirst(evt, vertical, sortable) {
        var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
        var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
        var spacer = 10;
        return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
    }
    function _ghostIsLast(evt, vertical, sortable) {
        var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
        var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
        var spacer = 10;
        return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
    }
    function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
        var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
        if (!invertSwap) if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
            if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) pastFirstInvertThresh = true;
            if (!pastFirstInvertThresh) {
                if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) return -lastDirection;
            } else invert = true;
        } else if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) return _getInsertDirection(target);
        invert = invert || invertSwap;
        if (invert) if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
        return 0;
    }
    function _getInsertDirection(target) {
        if (index(dragEl) < index(target)) return 1; else return -1;
    }
    function _generateId(el) {
        var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
        while (i--) sum += str.charCodeAt(i);
        return sum.toString(36);
    }
    function _saveInputCheckedState(root) {
        savedInputChecked.length = 0;
        var inputs = root.getElementsByTagName("input");
        var idx = inputs.length;
        while (idx--) {
            var el = inputs[idx];
            el.checked && savedInputChecked.push(el);
        }
    }
    function _nextTick(fn) {
        return setTimeout(fn, 0);
    }
    function _cancelNextTick(id) {
        return clearTimeout(id);
    }
    if (documentExists) on(document, "touchmove", (function(evt) {
        if ((sortable_esm_Sortable.active || awaitingDragStarted) && evt.cancelable) evt.preventDefault();
    }));
    sortable_esm_Sortable.utils = {
        on,
        off,
        css,
        find,
        is: function is(el, selector) {
            return !!closest(el, selector, el, false);
        },
        extend: sortable_esm_extend,
        throttle,
        closest,
        toggleClass,
        clone,
        index,
        nextTick: _nextTick,
        cancelNextTick: _cancelNextTick,
        detectDirection: _detectDirection,
        getChild,
        expando
    };
    sortable_esm_Sortable.get = function(element) {
        return element[expando];
    };
    sortable_esm_Sortable.mount = function() {
        for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) plugins[_key] = arguments[_key];
        if (plugins[0].constructor === Array) plugins = plugins[0];
        plugins.forEach((function(plugin) {
            if (!plugin.prototype || !plugin.prototype.constructor) throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
            if (plugin.utils) sortable_esm_Sortable.utils = _objectSpread2(_objectSpread2({}, sortable_esm_Sortable.utils), plugin.utils);
            PluginManager.mount(plugin);
        }));
    };
    sortable_esm_Sortable.create = function(el, options) {
        return new sortable_esm_Sortable(el, options);
    };
    sortable_esm_Sortable.version = version;
    var scrollEl, scrollRootEl, lastAutoScrollX, lastAutoScrollY, touchEvt$1, pointerElemChangedInterval, autoScrolls = [], scrolling = false;
    function AutoScrollPlugin() {
        function AutoScroll() {
            this.defaults = {
                scroll: true,
                forceAutoScrollFallback: false,
                scrollSensitivity: 30,
                scrollSpeed: 10,
                bubbleScroll: true
            };
            for (var fn in this) if (fn.charAt(0) === "_" && typeof this[fn] === "function") this[fn] = this[fn].bind(this);
        }
        AutoScroll.prototype = {
            dragStarted: function dragStarted(_ref) {
                var originalEvent = _ref.originalEvent;
                if (this.sortable.nativeDraggable) on(document, "dragover", this._handleAutoScroll); else if (this.options.supportPointer) on(document, "pointermove", this._handleFallbackAutoScroll); else if (originalEvent.touches) on(document, "touchmove", this._handleFallbackAutoScroll); else on(document, "mousemove", this._handleFallbackAutoScroll);
            },
            dragOverCompleted: function dragOverCompleted(_ref2) {
                var originalEvent = _ref2.originalEvent;
                if (!this.options.dragOverBubble && !originalEvent.rootEl) this._handleAutoScroll(originalEvent);
            },
            drop: function drop() {
                if (this.sortable.nativeDraggable) off(document, "dragover", this._handleAutoScroll); else {
                    off(document, "pointermove", this._handleFallbackAutoScroll);
                    off(document, "touchmove", this._handleFallbackAutoScroll);
                    off(document, "mousemove", this._handleFallbackAutoScroll);
                }
                clearPointerElemChangedInterval();
                clearAutoScrolls();
                cancelThrottle();
            },
            nulling: function nulling() {
                touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
                autoScrolls.length = 0;
            },
            _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
                this._handleAutoScroll(evt, true);
            },
            _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
                var _this = this;
                var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
                touchEvt$1 = evt;
                if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
                    autoScroll(evt, this.options, elem, fallback);
                    var ogElemScroller = getParentAutoScrollElement(elem, true);
                    if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
                        pointerElemChangedInterval && clearPointerElemChangedInterval();
                        pointerElemChangedInterval = setInterval((function() {
                            var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
                            if (newElem !== ogElemScroller) {
                                ogElemScroller = newElem;
                                clearAutoScrolls();
                            }
                            autoScroll(evt, _this.options, newElem, fallback);
                        }), 10);
                        lastAutoScrollX = x;
                        lastAutoScrollY = y;
                    }
                } else {
                    if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
                        clearAutoScrolls();
                        return;
                    }
                    autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
                }
            }
        };
        return _extends(AutoScroll, {
            pluginName: "scroll",
            initializeByDefault: true
        });
    }
    function clearAutoScrolls() {
        autoScrolls.forEach((function(autoScroll) {
            clearInterval(autoScroll.pid);
        }));
        autoScrolls = [];
    }
    function clearPointerElemChangedInterval() {
        clearInterval(pointerElemChangedInterval);
    }
    var autoScroll = throttle((function(evt, options, rootEl, isFallback) {
        if (!options.scroll) return;
        var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
        var scrollCustomFn, scrollThisInstance = false;
        if (scrollRootEl !== rootEl) {
            scrollRootEl = rootEl;
            clearAutoScrolls();
            scrollEl = options.scroll;
            scrollCustomFn = options.scrollFn;
            if (scrollEl === true) scrollEl = getParentAutoScrollElement(rootEl, true);
        }
        var layersOut = 0;
        var currentParent = scrollEl;
        do {
            var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
            if (el === winScroller) {
                canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
                canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
            } else {
                canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
                canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
            }
            var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
            var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
            if (!autoScrolls[layersOut]) for (var i = 0; i <= layersOut; i++) if (!autoScrolls[i]) autoScrolls[i] = {};
            if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
                autoScrolls[layersOut].el = el;
                autoScrolls[layersOut].vx = vx;
                autoScrolls[layersOut].vy = vy;
                clearInterval(autoScrolls[layersOut].pid);
                if (vx != 0 || vy != 0) {
                    scrollThisInstance = true;
                    autoScrolls[layersOut].pid = setInterval(function() {
                        if (isFallback && this.layer === 0) sortable_esm_Sortable.active._onTouchMove(touchEvt$1);
                        var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
                        var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
                        if (typeof scrollCustomFn === "function") if (scrollCustomFn.call(sortable_esm_Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") return;
                        scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
                    }.bind({
                        layer: layersOut
                    }), 24);
                }
            }
            layersOut++;
        } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
        scrolling = scrollThisInstance;
    }), 30);
    var drop = function drop(_ref) {
        var originalEvent = _ref.originalEvent, putSortable = _ref.putSortable, dragEl = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
        if (!originalEvent) return;
        var toSortable = putSortable || activeSortable;
        hideGhostForTarget();
        var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
        var target = document.elementFromPoint(touch.clientX, touch.clientY);
        unhideGhostForTarget();
        if (toSortable && !toSortable.el.contains(target)) {
            dispatchSortableEvent("spill");
            this.onSpill({
                dragEl,
                putSortable
            });
        }
    };
    function Revert() {}
    Revert.prototype = {
        startIndex: null,
        dragStart: function dragStart(_ref2) {
            var oldDraggableIndex = _ref2.oldDraggableIndex;
            this.startIndex = oldDraggableIndex;
        },
        onSpill: function onSpill(_ref3) {
            var dragEl = _ref3.dragEl, putSortable = _ref3.putSortable;
            this.sortable.captureAnimationState();
            if (putSortable) putSortable.captureAnimationState();
            var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
            if (nextSibling) this.sortable.el.insertBefore(dragEl, nextSibling); else this.sortable.el.appendChild(dragEl);
            this.sortable.animateAll();
            if (putSortable) putSortable.animateAll();
        },
        drop
    };
    _extends(Revert, {
        pluginName: "revertOnSpill"
    });
    function Remove() {}
    Remove.prototype = {
        onSpill: function onSpill(_ref4) {
            var dragEl = _ref4.dragEl, putSortable = _ref4.putSortable;
            var parentSortable = putSortable || this.sortable;
            parentSortable.captureAnimationState();
            dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
            parentSortable.animateAll();
        },
        drop
    };
    _extends(Remove, {
        pluginName: "removeOnSpill"
    });
    sortable_esm_Sortable.mount(new AutoScrollPlugin);
    sortable_esm_Sortable.mount(Remove, Revert);
    function isString(str) {
        return typeof str === "string" || str instanceof String;
    }
    function core_utils_isObject(obj) {
        var _obj$constructor;
        return typeof obj === "object" && obj != null && (obj == null || (_obj$constructor = obj.constructor) == null ? void 0 : _obj$constructor.name) === "Object";
    }
    function pick(obj, keys) {
        if (Array.isArray(keys)) return pick(obj, ((_, k) => keys.includes(k)));
        return Object.entries(obj).reduce(((acc, _ref) => {
            let [k, v] = _ref;
            if (keys(v, k)) acc[k] = v;
            return acc;
        }), {});
    }
    const DIRECTION = {
        NONE: "NONE",
        LEFT: "LEFT",
        FORCE_LEFT: "FORCE_LEFT",
        RIGHT: "RIGHT",
        FORCE_RIGHT: "FORCE_RIGHT"
    };
    function forceDirection(direction) {
        switch (direction) {
          case DIRECTION.LEFT:
            return DIRECTION.FORCE_LEFT;

          case DIRECTION.RIGHT:
            return DIRECTION.FORCE_RIGHT;

          default:
            return direction;
        }
    }
    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    }
    function objectIncludes(b, a) {
        if (a === b) return true;
        const arrA = Array.isArray(a), arrB = Array.isArray(b);
        let i;
        if (arrA && arrB) {
            if (a.length != b.length) return false;
            for (i = 0; i < a.length; i++) if (!objectIncludes(a[i], b[i])) return false;
            return true;
        }
        if (arrA != arrB) return false;
        if (a && b && typeof a === "object" && typeof b === "object") {
            const dateA = a instanceof Date, dateB = b instanceof Date;
            if (dateA && dateB) return a.getTime() == b.getTime();
            if (dateA != dateB) return false;
            const regexpA = a instanceof RegExp, regexpB = b instanceof RegExp;
            if (regexpA && regexpB) return a.toString() == b.toString();
            if (regexpA != regexpB) return false;
            const keys = Object.keys(a);
            for (i = 0; i < keys.length; i++) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
            for (i = 0; i < keys.length; i++) if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;
            return true;
        } else if (a && b && typeof a === "function" && typeof b === "function") return a.toString() === b.toString();
        return false;
    }
    class ActionDetails {
        constructor(opts) {
            Object.assign(this, opts);
            while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) --this.oldSelection.start;
            if (this.insertedCount) while (this.value.slice(this.cursorPos) !== this.oldValue.slice(this.oldSelection.end)) if (this.value.length - this.cursorPos < this.oldValue.length - this.oldSelection.end) ++this.oldSelection.end; else ++this.cursorPos;
        }
        get startChangePos() {
            return Math.min(this.cursorPos, this.oldSelection.start);
        }
        get insertedCount() {
            return this.cursorPos - this.startChangePos;
        }
        get inserted() {
            return this.value.substr(this.startChangePos, this.insertedCount);
        }
        get removedCount() {
            return Math.max(this.oldSelection.end - this.startChangePos || this.oldValue.length - this.value.length, 0);
        }
        get removed() {
            return this.oldValue.substr(this.startChangePos, this.removedCount);
        }
        get head() {
            return this.value.substring(0, this.startChangePos);
        }
        get tail() {
            return this.value.substring(this.startChangePos + this.insertedCount);
        }
        get removeDirection() {
            if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;
            return (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) && this.oldSelection.end === this.oldSelection.start ? DIRECTION.RIGHT : DIRECTION.LEFT;
        }
    }
    function holder_IMask(el, opts) {
        return new holder_IMask.InputMask(el, opts);
    }
    function maskedClass(mask) {
        if (mask == null) throw new Error("mask property should be defined");
        if (mask instanceof RegExp) return holder_IMask.MaskedRegExp;
        if (isString(mask)) return holder_IMask.MaskedPattern;
        if (mask === Date) return holder_IMask.MaskedDate;
        if (mask === Number) return holder_IMask.MaskedNumber;
        if (Array.isArray(mask) || mask === Array) return holder_IMask.MaskedDynamic;
        if (holder_IMask.Masked && mask.prototype instanceof holder_IMask.Masked) return mask;
        if (holder_IMask.Masked && mask instanceof holder_IMask.Masked) return mask.constructor;
        if (mask instanceof Function) return holder_IMask.MaskedFunction;
        console.warn("Mask not found for mask", mask);
        return holder_IMask.Masked;
    }
    function normalizeOpts(opts) {
        if (!opts) throw new Error("Options in not defined");
        if (holder_IMask.Masked) {
            if (opts.prototype instanceof holder_IMask.Masked) return {
                mask: opts
            };
            const {mask = void 0, ...instanceOpts} = opts instanceof holder_IMask.Masked ? {
                mask: opts
            } : core_utils_isObject(opts) && opts.mask instanceof holder_IMask.Masked ? opts : {};
            if (mask) {
                const _mask = mask.mask;
                return {
                    ...pick(mask, ((_, k) => !k.startsWith("_"))),
                    mask: mask.constructor,
                    _mask,
                    ...instanceOpts
                };
            }
        }
        if (!core_utils_isObject(opts)) return {
            mask: opts
        };
        return {
            ...opts
        };
    }
    function createMask(opts) {
        if (holder_IMask.Masked && opts instanceof holder_IMask.Masked) return opts;
        const nOpts = normalizeOpts(opts);
        const MaskedClass = maskedClass(nOpts.mask);
        if (!MaskedClass) throw new Error("Masked class is not found for provided mask " + nOpts.mask + ", appropriate module needs to be imported manually before creating mask.");
        if (nOpts.mask === MaskedClass) delete nOpts.mask;
        if (nOpts._mask) {
            nOpts.mask = nOpts._mask;
            delete nOpts._mask;
        }
        return new MaskedClass(nOpts);
    }
    holder_IMask.createMask = createMask;
    class MaskElement {
        get selectionStart() {
            let start;
            try {
                start = this._unsafeSelectionStart;
            } catch {}
            return start != null ? start : this.value.length;
        }
        get selectionEnd() {
            let end;
            try {
                end = this._unsafeSelectionEnd;
            } catch {}
            return end != null ? end : this.value.length;
        }
        select(start, end) {
            if (start == null || end == null || start === this.selectionStart && end === this.selectionEnd) return;
            try {
                this._unsafeSelect(start, end);
            } catch {}
        }
        get isActive() {
            return false;
        }
    }
    holder_IMask.MaskElement = MaskElement;
    const KEY_Z = 90;
    const KEY_Y = 89;
    class HTMLMaskElement extends MaskElement {
        constructor(input) {
            super();
            this.input = input;
            this._onKeydown = this._onKeydown.bind(this);
            this._onInput = this._onInput.bind(this);
            this._onBeforeinput = this._onBeforeinput.bind(this);
            this._onCompositionEnd = this._onCompositionEnd.bind(this);
        }
        get rootElement() {
            var _this$input$getRootNo, _this$input$getRootNo2, _this$input;
            return (_this$input$getRootNo = (_this$input$getRootNo2 = (_this$input = this.input).getRootNode) == null ? void 0 : _this$input$getRootNo2.call(_this$input)) != null ? _this$input$getRootNo : document;
        }
        get isActive() {
            return this.input === this.rootElement.activeElement;
        }
        bindEvents(handlers) {
            this.input.addEventListener("keydown", this._onKeydown);
            this.input.addEventListener("input", this._onInput);
            this.input.addEventListener("beforeinput", this._onBeforeinput);
            this.input.addEventListener("compositionend", this._onCompositionEnd);
            this.input.addEventListener("drop", handlers.drop);
            this.input.addEventListener("click", handlers.click);
            this.input.addEventListener("focus", handlers.focus);
            this.input.addEventListener("blur", handlers.commit);
            this._handlers = handlers;
        }
        _onKeydown(e) {
            if (this._handlers.redo && (e.keyCode === KEY_Z && e.shiftKey && (e.metaKey || e.ctrlKey) || e.keyCode === KEY_Y && e.ctrlKey)) {
                e.preventDefault();
                return this._handlers.redo(e);
            }
            if (this._handlers.undo && e.keyCode === KEY_Z && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                return this._handlers.undo(e);
            }
            if (!e.isComposing) this._handlers.selectionChange(e);
        }
        _onBeforeinput(e) {
            if (e.inputType === "historyUndo" && this._handlers.undo) {
                e.preventDefault();
                return this._handlers.undo(e);
            }
            if (e.inputType === "historyRedo" && this._handlers.redo) {
                e.preventDefault();
                return this._handlers.redo(e);
            }
        }
        _onCompositionEnd(e) {
            this._handlers.input(e);
        }
        _onInput(e) {
            if (!e.isComposing) this._handlers.input(e);
        }
        unbindEvents() {
            this.input.removeEventListener("keydown", this._onKeydown);
            this.input.removeEventListener("input", this._onInput);
            this.input.removeEventListener("beforeinput", this._onBeforeinput);
            this.input.removeEventListener("compositionend", this._onCompositionEnd);
            this.input.removeEventListener("drop", this._handlers.drop);
            this.input.removeEventListener("click", this._handlers.click);
            this.input.removeEventListener("focus", this._handlers.focus);
            this.input.removeEventListener("blur", this._handlers.commit);
            this._handlers = {};
        }
    }
    holder_IMask.HTMLMaskElement = HTMLMaskElement;
    class HTMLInputMaskElement extends HTMLMaskElement {
        constructor(input) {
            super(input);
            this.input = input;
        }
        get _unsafeSelectionStart() {
            return this.input.selectionStart != null ? this.input.selectionStart : this.value.length;
        }
        get _unsafeSelectionEnd() {
            return this.input.selectionEnd;
        }
        _unsafeSelect(start, end) {
            this.input.setSelectionRange(start, end);
        }
        get value() {
            return this.input.value;
        }
        set value(value) {
            this.input.value = value;
        }
    }
    holder_IMask.HTMLMaskElement = HTMLMaskElement;
    class HTMLContenteditableMaskElement extends HTMLMaskElement {
        get _unsafeSelectionStart() {
            const root = this.rootElement;
            const selection = root.getSelection && root.getSelection();
            const anchorOffset = selection && selection.anchorOffset;
            const focusOffset = selection && selection.focusOffset;
            if (focusOffset == null || anchorOffset == null || anchorOffset < focusOffset) return anchorOffset;
            return focusOffset;
        }
        get _unsafeSelectionEnd() {
            const root = this.rootElement;
            const selection = root.getSelection && root.getSelection();
            const anchorOffset = selection && selection.anchorOffset;
            const focusOffset = selection && selection.focusOffset;
            if (focusOffset == null || anchorOffset == null || anchorOffset > focusOffset) return anchorOffset;
            return focusOffset;
        }
        _unsafeSelect(start, end) {
            if (!this.rootElement.createRange) return;
            const range = this.rootElement.createRange();
            range.setStart(this.input.firstChild || this.input, start);
            range.setEnd(this.input.lastChild || this.input, end);
            const root = this.rootElement;
            const selection = root.getSelection && root.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        get value() {
            return this.input.textContent || "";
        }
        set value(value) {
            this.input.textContent = value;
        }
    }
    holder_IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;
    class InputHistory {
        constructor() {
            this.states = [];
            this.currentIndex = 0;
        }
        get currentState() {
            return this.states[this.currentIndex];
        }
        get isEmpty() {
            return this.states.length === 0;
        }
        push(state) {
            if (this.currentIndex < this.states.length - 1) this.states.length = this.currentIndex + 1;
            this.states.push(state);
            if (this.states.length > InputHistory.MAX_LENGTH) this.states.shift();
            this.currentIndex = this.states.length - 1;
        }
        go(steps) {
            this.currentIndex = Math.min(Math.max(this.currentIndex + steps, 0), this.states.length - 1);
            return this.currentState;
        }
        undo() {
            return this.go(-1);
        }
        redo() {
            return this.go(+1);
        }
        clear() {
            this.states.length = 0;
            this.currentIndex = 0;
        }
    }
    InputHistory.MAX_LENGTH = 100;
    class InputMask {
        constructor(el, opts) {
            this.el = el instanceof MaskElement ? el : el.isContentEditable && el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" ? new HTMLContenteditableMaskElement(el) : new HTMLInputMaskElement(el);
            this.masked = createMask(opts);
            this._listeners = {};
            this._value = "";
            this._unmaskedValue = "";
            this._rawInputValue = "";
            this.history = new InputHistory;
            this._saveSelection = this._saveSelection.bind(this);
            this._onInput = this._onInput.bind(this);
            this._onChange = this._onChange.bind(this);
            this._onDrop = this._onDrop.bind(this);
            this._onFocus = this._onFocus.bind(this);
            this._onClick = this._onClick.bind(this);
            this._onUndo = this._onUndo.bind(this);
            this._onRedo = this._onRedo.bind(this);
            this.alignCursor = this.alignCursor.bind(this);
            this.alignCursorFriendly = this.alignCursorFriendly.bind(this);
            this._bindEvents();
            this.updateValue();
            this._onChange();
        }
        maskEquals(mask) {
            var _this$masked;
            return mask == null || ((_this$masked = this.masked) == null ? void 0 : _this$masked.maskEquals(mask));
        }
        get mask() {
            return this.masked.mask;
        }
        set mask(mask) {
            if (this.maskEquals(mask)) return;
            if (!(mask instanceof holder_IMask.Masked) && this.masked.constructor === maskedClass(mask)) {
                this.masked.updateOptions({
                    mask
                });
                return;
            }
            const masked = mask instanceof holder_IMask.Masked ? mask : createMask({
                mask
            });
            masked.unmaskedValue = this.masked.unmaskedValue;
            this.masked = masked;
        }
        get value() {
            return this._value;
        }
        set value(str) {
            if (this.value === str) return;
            this.masked.value = str;
            this.updateControl("auto");
        }
        get unmaskedValue() {
            return this._unmaskedValue;
        }
        set unmaskedValue(str) {
            if (this.unmaskedValue === str) return;
            this.masked.unmaskedValue = str;
            this.updateControl("auto");
        }
        get rawInputValue() {
            return this._rawInputValue;
        }
        set rawInputValue(str) {
            if (this.rawInputValue === str) return;
            this.masked.rawInputValue = str;
            this.updateControl();
            this.alignCursor();
        }
        get typedValue() {
            return this.masked.typedValue;
        }
        set typedValue(val) {
            if (this.masked.typedValueEquals(val)) return;
            this.masked.typedValue = val;
            this.updateControl("auto");
        }
        get displayValue() {
            return this.masked.displayValue;
        }
        _bindEvents() {
            this.el.bindEvents({
                selectionChange: this._saveSelection,
                input: this._onInput,
                drop: this._onDrop,
                click: this._onClick,
                focus: this._onFocus,
                commit: this._onChange,
                undo: this._onUndo,
                redo: this._onRedo
            });
        }
        _unbindEvents() {
            if (this.el) this.el.unbindEvents();
        }
        _fireEvent(ev, e) {
            const listeners = this._listeners[ev];
            if (!listeners) return;
            listeners.forEach((l => l(e)));
        }
        get selectionStart() {
            return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
        }
        get cursorPos() {
            return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
        }
        set cursorPos(pos) {
            if (!this.el || !this.el.isActive) return;
            this.el.select(pos, pos);
            this._saveSelection();
        }
        _saveSelection() {
            if (this.displayValue !== this.el.value) console.warn("Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.");
            this._selection = {
                start: this.selectionStart,
                end: this.cursorPos
            };
        }
        updateValue() {
            this.masked.value = this.el.value;
            this._value = this.masked.value;
            this._unmaskedValue = this.masked.unmaskedValue;
            this._rawInputValue = this.masked.rawInputValue;
        }
        updateControl(cursorPos) {
            const newUnmaskedValue = this.masked.unmaskedValue;
            const newValue = this.masked.value;
            const newRawInputValue = this.masked.rawInputValue;
            const newDisplayValue = this.displayValue;
            const isChanged = this.unmaskedValue !== newUnmaskedValue || this.value !== newValue || this._rawInputValue !== newRawInputValue;
            this._unmaskedValue = newUnmaskedValue;
            this._value = newValue;
            this._rawInputValue = newRawInputValue;
            if (this.el.value !== newDisplayValue) this.el.value = newDisplayValue;
            if (cursorPos === "auto") this.alignCursor(); else if (cursorPos != null) this.cursorPos = cursorPos;
            if (isChanged) this._fireChangeEvents();
            if (!this._historyChanging && (isChanged || this.history.isEmpty)) this.history.push({
                unmaskedValue: newUnmaskedValue,
                selection: {
                    start: this.selectionStart,
                    end: this.cursorPos
                }
            });
        }
        updateOptions(opts) {
            const {mask, ...restOpts} = opts;
            const updateMask = !this.maskEquals(mask);
            const updateOpts = this.masked.optionsIsChanged(restOpts);
            if (updateMask) this.mask = mask;
            if (updateOpts) this.masked.updateOptions(restOpts);
            if (updateMask || updateOpts) this.updateControl();
        }
        updateCursor(cursorPos) {
            if (cursorPos == null) return;
            this.cursorPos = cursorPos;
            this._delayUpdateCursor(cursorPos);
        }
        _delayUpdateCursor(cursorPos) {
            this._abortUpdateCursor();
            this._changingCursorPos = cursorPos;
            this._cursorChanging = setTimeout((() => {
                if (!this.el) return;
                this.cursorPos = this._changingCursorPos;
                this._abortUpdateCursor();
            }), 10);
        }
        _fireChangeEvents() {
            this._fireEvent("accept", this._inputEvent);
            if (this.masked.isComplete) this._fireEvent("complete", this._inputEvent);
        }
        _abortUpdateCursor() {
            if (this._cursorChanging) {
                clearTimeout(this._cursorChanging);
                delete this._cursorChanging;
            }
        }
        alignCursor() {
            this.cursorPos = this.masked.nearestInputPos(this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT));
        }
        alignCursorFriendly() {
            if (this.selectionStart !== this.cursorPos) return;
            this.alignCursor();
        }
        on(ev, handler) {
            if (!this._listeners[ev]) this._listeners[ev] = [];
            this._listeners[ev].push(handler);
            return this;
        }
        off(ev, handler) {
            if (!this._listeners[ev]) return this;
            if (!handler) {
                delete this._listeners[ev];
                return this;
            }
            const hIndex = this._listeners[ev].indexOf(handler);
            if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
            return this;
        }
        _onInput(e) {
            this._inputEvent = e;
            this._abortUpdateCursor();
            const details = new ActionDetails({
                value: this.el.value,
                cursorPos: this.cursorPos,
                oldValue: this.displayValue,
                oldSelection: this._selection
            });
            const oldRawValue = this.masked.rawInputValue;
            const offset = this.masked.splice(details.startChangePos, details.removed.length, details.inserted, details.removeDirection, {
                input: true,
                raw: true
            }).offset;
            const removeDirection = oldRawValue === this.masked.rawInputValue ? details.removeDirection : DIRECTION.NONE;
            let cursorPos = this.masked.nearestInputPos(details.startChangePos + offset, removeDirection);
            if (removeDirection !== DIRECTION.NONE) cursorPos = this.masked.nearestInputPos(cursorPos, DIRECTION.NONE);
            this.updateControl(cursorPos);
            delete this._inputEvent;
        }
        _onChange() {
            if (this.displayValue !== this.el.value) this.updateValue();
            this.masked.doCommit();
            this.updateControl();
            this._saveSelection();
        }
        _onDrop(ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        _onFocus(ev) {
            this.alignCursorFriendly();
        }
        _onClick(ev) {
            this.alignCursorFriendly();
        }
        _onUndo() {
            this._applyHistoryState(this.history.undo());
        }
        _onRedo() {
            this._applyHistoryState(this.history.redo());
        }
        _applyHistoryState(state) {
            if (!state) return;
            this._historyChanging = true;
            this.unmaskedValue = state.unmaskedValue;
            this.el.select(state.selection.start, state.selection.end);
            this._saveSelection();
            this._historyChanging = false;
        }
        destroy() {
            this._unbindEvents();
            this._listeners.length = 0;
            delete this.el;
        }
    }
    holder_IMask.InputMask = InputMask;
    class ChangeDetails {
        static normalize(prep) {
            return Array.isArray(prep) ? prep : [ prep, new ChangeDetails ];
        }
        constructor(details) {
            Object.assign(this, {
                inserted: "",
                rawInserted: "",
                tailShift: 0,
                skip: false
            }, details);
        }
        aggregate(details) {
            this.inserted += details.inserted;
            this.rawInserted += details.rawInserted;
            this.tailShift += details.tailShift;
            this.skip = this.skip || details.skip;
            return this;
        }
        get offset() {
            return this.tailShift + this.inserted.length;
        }
        get consumed() {
            return Boolean(this.rawInserted) || this.skip;
        }
        equals(details) {
            return this.inserted === details.inserted && this.tailShift === details.tailShift && this.rawInserted === details.rawInserted && this.skip === details.skip;
        }
    }
    holder_IMask.ChangeDetails = ChangeDetails;
    class ContinuousTailDetails {
        constructor(value, from, stop) {
            if (value === void 0) value = "";
            if (from === void 0) from = 0;
            this.value = value;
            this.from = from;
            this.stop = stop;
        }
        toString() {
            return this.value;
        }
        extend(tail) {
            this.value += String(tail);
        }
        appendTo(masked) {
            return masked.append(this.toString(), {
                tail: true
            }).aggregate(masked._appendPlaceholder());
        }
        get state() {
            return {
                value: this.value,
                from: this.from,
                stop: this.stop
            };
        }
        set state(state) {
            Object.assign(this, state);
        }
        unshift(beforePos) {
            if (!this.value.length || beforePos != null && this.from >= beforePos) return "";
            const shiftChar = this.value[0];
            this.value = this.value.slice(1);
            return shiftChar;
        }
        shift() {
            if (!this.value.length) return "";
            const shiftChar = this.value[this.value.length - 1];
            this.value = this.value.slice(0, -1);
            return shiftChar;
        }
    }
    class Masked {
        constructor(opts) {
            this._value = "";
            this._update({
                ...Masked.DEFAULTS,
                ...opts
            });
            this._initialized = true;
        }
        updateOptions(opts) {
            if (!this.optionsIsChanged(opts)) return;
            this.withValueRefresh(this._update.bind(this, opts));
        }
        _update(opts) {
            Object.assign(this, opts);
        }
        get state() {
            return {
                _value: this.value,
                _rawInputValue: this.rawInputValue
            };
        }
        set state(state) {
            this._value = state._value;
        }
        reset() {
            this._value = "";
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this.resolve(value, {
                input: true
            });
        }
        resolve(value, flags) {
            if (flags === void 0) flags = {
                input: true
            };
            this.reset();
            this.append(value, flags, "");
            this.doCommit();
        }
        get unmaskedValue() {
            return this.value;
        }
        set unmaskedValue(value) {
            this.resolve(value, {});
        }
        get typedValue() {
            return this.parse ? this.parse(this.value, this) : this.unmaskedValue;
        }
        set typedValue(value) {
            if (this.format) this.value = this.format(value, this); else this.unmaskedValue = String(value);
        }
        get rawInputValue() {
            return this.extractInput(0, this.displayValue.length, {
                raw: true
            });
        }
        set rawInputValue(value) {
            this.resolve(value, {
                raw: true
            });
        }
        get displayValue() {
            return this.value;
        }
        get isComplete() {
            return true;
        }
        get isFilled() {
            return this.isComplete;
        }
        nearestInputPos(cursorPos, direction) {
            return cursorPos;
        }
        totalInputPositions(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            return Math.min(this.displayValue.length, toPos - fromPos);
        }
        extractInput(fromPos, toPos, flags) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            return this.displayValue.slice(fromPos, toPos);
        }
        extractTail(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
        }
        appendTail(tail) {
            if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
            return tail.appendTo(this);
        }
        _appendCharRaw(ch, flags) {
            if (!ch) return new ChangeDetails;
            this._value += ch;
            return new ChangeDetails({
                inserted: ch,
                rawInserted: ch
            });
        }
        _appendChar(ch, flags, checkTail) {
            if (flags === void 0) flags = {};
            const consistentState = this.state;
            let details;
            [ch, details] = this.doPrepareChar(ch, flags);
            if (ch) {
                details = details.aggregate(this._appendCharRaw(ch, flags));
                if (!details.rawInserted && this.autofix === "pad") {
                    const noFixState = this.state;
                    this.state = consistentState;
                    let fixDetails = this.pad(flags);
                    const chDetails = this._appendCharRaw(ch, flags);
                    fixDetails = fixDetails.aggregate(chDetails);
                    if (chDetails.rawInserted || fixDetails.equals(details)) details = fixDetails; else this.state = noFixState;
                }
            }
            if (details.inserted) {
                let consistentTail;
                let appended = this.doValidate(flags) !== false;
                if (appended && checkTail != null) {
                    const beforeTailState = this.state;
                    if (this.overwrite === true) {
                        consistentTail = checkTail.state;
                        for (let i = 0; i < details.rawInserted.length; ++i) checkTail.unshift(this.displayValue.length - details.tailShift);
                    }
                    let tailDetails = this.appendTail(checkTail);
                    appended = tailDetails.rawInserted.length === checkTail.toString().length;
                    if (!(appended && tailDetails.inserted) && this.overwrite === "shift") {
                        this.state = beforeTailState;
                        consistentTail = checkTail.state;
                        for (let i = 0; i < details.rawInserted.length; ++i) checkTail.shift();
                        tailDetails = this.appendTail(checkTail);
                        appended = tailDetails.rawInserted.length === checkTail.toString().length;
                    }
                    if (appended && tailDetails.inserted) this.state = beforeTailState;
                }
                if (!appended) {
                    details = new ChangeDetails;
                    this.state = consistentState;
                    if (checkTail && consistentTail) checkTail.state = consistentTail;
                }
            }
            return details;
        }
        _appendPlaceholder() {
            return new ChangeDetails;
        }
        _appendEager() {
            return new ChangeDetails;
        }
        append(str, flags, tail) {
            if (!isString(str)) throw new Error("value should be string");
            const checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
            if (flags != null && flags.tail) flags._beforeTailState = this.state;
            let details;
            [str, details] = this.doPrepare(str, flags);
            for (let ci = 0; ci < str.length; ++ci) {
                const d = this._appendChar(str[ci], flags, checkTail);
                if (!d.rawInserted && !this.doSkipInvalid(str[ci], flags, checkTail)) break;
                details.aggregate(d);
            }
            if ((this.eager === true || this.eager === "append") && flags != null && flags.input && str) details.aggregate(this._appendEager());
            if (checkTail != null) details.tailShift += this.appendTail(checkTail).tailShift;
            return details;
        }
        remove(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            this._value = this.displayValue.slice(0, fromPos) + this.displayValue.slice(toPos);
            return new ChangeDetails;
        }
        withValueRefresh(fn) {
            if (this._refreshing || !this._initialized) return fn();
            this._refreshing = true;
            const rawInput = this.rawInputValue;
            const value = this.value;
            const ret = fn();
            this.rawInputValue = rawInput;
            if (this.value && this.value !== value && value.indexOf(this.value) === 0) {
                this.append(value.slice(this.displayValue.length), {}, "");
                this.doCommit();
            }
            delete this._refreshing;
            return ret;
        }
        runIsolated(fn) {
            if (this._isolated || !this._initialized) return fn(this);
            this._isolated = true;
            const state = this.state;
            const ret = fn(this);
            this.state = state;
            delete this._isolated;
            return ret;
        }
        doSkipInvalid(ch, flags, checkTail) {
            return Boolean(this.skipInvalid);
        }
        doPrepare(str, flags) {
            if (flags === void 0) flags = {};
            return ChangeDetails.normalize(this.prepare ? this.prepare(str, this, flags) : str);
        }
        doPrepareChar(str, flags) {
            if (flags === void 0) flags = {};
            return ChangeDetails.normalize(this.prepareChar ? this.prepareChar(str, this, flags) : str);
        }
        doValidate(flags) {
            return (!this.validate || this.validate(this.value, this, flags)) && (!this.parent || this.parent.doValidate(flags));
        }
        doCommit() {
            if (this.commit) this.commit(this.value, this);
        }
        splice(start, deleteCount, inserted, removeDirection, flags) {
            if (inserted === void 0) inserted = "";
            if (removeDirection === void 0) removeDirection = DIRECTION.NONE;
            if (flags === void 0) flags = {
                input: true
            };
            const tailPos = start + deleteCount;
            const tail = this.extractTail(tailPos);
            const eagerRemove = this.eager === true || this.eager === "remove";
            let oldRawValue;
            if (eagerRemove) {
                removeDirection = forceDirection(removeDirection);
                oldRawValue = this.extractInput(0, tailPos, {
                    raw: true
                });
            }
            let startChangePos = start;
            const details = new ChangeDetails;
            if (removeDirection !== DIRECTION.NONE) {
                startChangePos = this.nearestInputPos(start, deleteCount > 1 && start !== 0 && !eagerRemove ? DIRECTION.NONE : removeDirection);
                details.tailShift = startChangePos - start;
            }
            details.aggregate(this.remove(startChangePos));
            if (eagerRemove && removeDirection !== DIRECTION.NONE && oldRawValue === this.rawInputValue) if (removeDirection === DIRECTION.FORCE_LEFT) {
                let valLength;
                while (oldRawValue === this.rawInputValue && (valLength = this.displayValue.length)) details.aggregate(new ChangeDetails({
                    tailShift: -1
                })).aggregate(this.remove(valLength - 1));
            } else if (removeDirection === DIRECTION.FORCE_RIGHT) tail.unshift();
            return details.aggregate(this.append(inserted, flags, tail));
        }
        maskEquals(mask) {
            return this.mask === mask;
        }
        optionsIsChanged(opts) {
            return !objectIncludes(this, opts);
        }
        typedValueEquals(value) {
            const tval = this.typedValue;
            return value === tval || Masked.EMPTY_VALUES.includes(value) && Masked.EMPTY_VALUES.includes(tval) || (this.format ? this.format(value, this) === this.format(this.typedValue, this) : false);
        }
        pad(flags) {
            return new ChangeDetails;
        }
    }
    Masked.DEFAULTS = {
        skipInvalid: true
    };
    Masked.EMPTY_VALUES = [ void 0, null, "" ];
    holder_IMask.Masked = Masked;
    class ChunksTailDetails {
        constructor(chunks, from) {
            if (chunks === void 0) chunks = [];
            if (from === void 0) from = 0;
            this.chunks = chunks;
            this.from = from;
        }
        toString() {
            return this.chunks.map(String).join("");
        }
        extend(tailChunk) {
            if (!String(tailChunk)) return;
            tailChunk = isString(tailChunk) ? new ContinuousTailDetails(String(tailChunk)) : tailChunk;
            const lastChunk = this.chunks[this.chunks.length - 1];
            const extendLast = lastChunk && (lastChunk.stop === tailChunk.stop || tailChunk.stop == null) && tailChunk.from === lastChunk.from + lastChunk.toString().length;
            if (tailChunk instanceof ContinuousTailDetails) if (extendLast) lastChunk.extend(tailChunk.toString()); else this.chunks.push(tailChunk); else if (tailChunk instanceof ChunksTailDetails) {
                if (tailChunk.stop == null) {
                    let firstTailChunk;
                    while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
                        firstTailChunk = tailChunk.chunks.shift();
                        firstTailChunk.from += tailChunk.from;
                        this.extend(firstTailChunk);
                    }
                }
                if (tailChunk.toString()) {
                    tailChunk.stop = tailChunk.blockIndex;
                    this.chunks.push(tailChunk);
                }
            }
        }
        appendTo(masked) {
            if (!(masked instanceof holder_IMask.MaskedPattern)) {
                const tail = new ContinuousTailDetails(this.toString());
                return tail.appendTo(masked);
            }
            const details = new ChangeDetails;
            for (let ci = 0; ci < this.chunks.length; ++ci) {
                const chunk = this.chunks[ci];
                const lastBlockIter = masked._mapPosToBlock(masked.displayValue.length);
                const stop = chunk.stop;
                let chunkBlock;
                if (stop != null && (!lastBlockIter || lastBlockIter.index <= stop)) {
                    if (chunk instanceof ChunksTailDetails || masked._stops.indexOf(stop) >= 0) details.aggregate(masked._appendPlaceholder(stop));
                    chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
                }
                if (chunkBlock) {
                    const tailDetails = chunkBlock.appendTail(chunk);
                    details.aggregate(tailDetails);
                    const remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
                    if (remainChars) details.aggregate(masked.append(remainChars, {
                        tail: true
                    }));
                } else details.aggregate(masked.append(chunk.toString(), {
                    tail: true
                }));
            }
            return details;
        }
        get state() {
            return {
                chunks: this.chunks.map((c => c.state)),
                from: this.from,
                stop: this.stop,
                blockIndex: this.blockIndex
            };
        }
        set state(state) {
            const {chunks, ...props} = state;
            Object.assign(this, props);
            this.chunks = chunks.map((cstate => {
                const chunk = "chunks" in cstate ? new ChunksTailDetails : new ContinuousTailDetails;
                chunk.state = cstate;
                return chunk;
            }));
        }
        unshift(beforePos) {
            if (!this.chunks.length || beforePos != null && this.from >= beforePos) return "";
            const chunkShiftPos = beforePos != null ? beforePos - this.from : beforePos;
            let ci = 0;
            while (ci < this.chunks.length) {
                const chunk = this.chunks[ci];
                const shiftChar = chunk.unshift(chunkShiftPos);
                if (chunk.toString()) {
                    if (!shiftChar) break;
                    ++ci;
                } else this.chunks.splice(ci, 1);
                if (shiftChar) return shiftChar;
            }
            return "";
        }
        shift() {
            if (!this.chunks.length) return "";
            let ci = this.chunks.length - 1;
            while (0 <= ci) {
                const chunk = this.chunks[ci];
                const shiftChar = chunk.shift();
                if (chunk.toString()) {
                    if (!shiftChar) break;
                    --ci;
                } else this.chunks.splice(ci, 1);
                if (shiftChar) return shiftChar;
            }
            return "";
        }
    }
    class PatternCursor {
        constructor(masked, pos) {
            this.masked = masked;
            this._log = [];
            const {offset, index} = masked._mapPosToBlock(pos) || (pos < 0 ? {
                index: 0,
                offset: 0
            } : {
                index: this.masked._blocks.length,
                offset: 0
            });
            this.offset = offset;
            this.index = index;
            this.ok = false;
        }
        get block() {
            return this.masked._blocks[this.index];
        }
        get pos() {
            return this.masked._blockStartPos(this.index) + this.offset;
        }
        get state() {
            return {
                index: this.index,
                offset: this.offset,
                ok: this.ok
            };
        }
        set state(s) {
            Object.assign(this, s);
        }
        pushState() {
            this._log.push(this.state);
        }
        popState() {
            const s = this._log.pop();
            if (s) this.state = s;
            return s;
        }
        bindBlock() {
            if (this.block) return;
            if (this.index < 0) {
                this.index = 0;
                this.offset = 0;
            }
            if (this.index >= this.masked._blocks.length) {
                this.index = this.masked._blocks.length - 1;
                this.offset = this.block.displayValue.length;
            }
        }
        _pushLeft(fn) {
            this.pushState();
            for (this.bindBlock(); 0 <= this.index; --this.index, this.offset = ((_this$block = this.block) == null ? void 0 : _this$block.displayValue.length) || 0) {
                var _this$block;
                if (fn()) return this.ok = true;
            }
            return this.ok = false;
        }
        _pushRight(fn) {
            this.pushState();
            for (this.bindBlock(); this.index < this.masked._blocks.length; ++this.index, this.offset = 0) if (fn()) return this.ok = true;
            return this.ok = false;
        }
        pushLeftBeforeFilled() {
            return this._pushLeft((() => {
                if (this.block.isFixed || !this.block.value) return;
                this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_LEFT);
                if (this.offset !== 0) return true;
            }));
        }
        pushLeftBeforeInput() {
            return this._pushLeft((() => {
                if (this.block.isFixed) return;
                this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
                return true;
            }));
        }
        pushLeftBeforeRequired() {
            return this._pushLeft((() => {
                if (this.block.isFixed || this.block.isOptional && !this.block.value) return;
                this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
                return true;
            }));
        }
        pushRightBeforeFilled() {
            return this._pushRight((() => {
                if (this.block.isFixed || !this.block.value) return;
                this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_RIGHT);
                if (this.offset !== this.block.value.length) return true;
            }));
        }
        pushRightBeforeInput() {
            return this._pushRight((() => {
                if (this.block.isFixed) return;
                this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
                return true;
            }));
        }
        pushRightBeforeRequired() {
            return this._pushRight((() => {
                if (this.block.isFixed || this.block.isOptional && !this.block.value) return;
                this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
                return true;
            }));
        }
    }
    class PatternFixedDefinition {
        constructor(opts) {
            Object.assign(this, opts);
            this._value = "";
            this.isFixed = true;
        }
        get value() {
            return this._value;
        }
        get unmaskedValue() {
            return this.isUnmasking ? this.value : "";
        }
        get rawInputValue() {
            return this._isRawInput ? this.value : "";
        }
        get displayValue() {
            return this.value;
        }
        reset() {
            this._isRawInput = false;
            this._value = "";
        }
        remove(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this._value.length;
            this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
            if (!this._value) this._isRawInput = false;
            return new ChangeDetails;
        }
        nearestInputPos(cursorPos, direction) {
            if (direction === void 0) direction = DIRECTION.NONE;
            const minPos = 0;
            const maxPos = this._value.length;
            switch (direction) {
              case DIRECTION.LEFT:
              case DIRECTION.FORCE_LEFT:
                return minPos;

              case DIRECTION.NONE:
              case DIRECTION.RIGHT:
              case DIRECTION.FORCE_RIGHT:
              default:
                return maxPos;
            }
        }
        totalInputPositions(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this._value.length;
            return this._isRawInput ? toPos - fromPos : 0;
        }
        extractInput(fromPos, toPos, flags) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this._value.length;
            if (flags === void 0) flags = {};
            return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || "";
        }
        get isComplete() {
            return true;
        }
        get isFilled() {
            return Boolean(this._value);
        }
        _appendChar(ch, flags) {
            if (flags === void 0) flags = {};
            if (this.isFilled) return new ChangeDetails;
            const appendEager = this.eager === true || this.eager === "append";
            const appended = this.char === ch;
            const isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && (!flags.raw || !appendEager) && !flags.tail;
            const details = new ChangeDetails({
                inserted: this.char,
                rawInserted: isResolved ? this.char : ""
            });
            this._value = this.char;
            this._isRawInput = isResolved && (flags.raw || flags.input);
            return details;
        }
        _appendEager() {
            return this._appendChar(this.char, {
                tail: true
            });
        }
        _appendPlaceholder() {
            const details = new ChangeDetails;
            if (this.isFilled) return details;
            this._value = details.inserted = this.char;
            return details;
        }
        extractTail() {
            return new ContinuousTailDetails("");
        }
        appendTail(tail) {
            if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
            return tail.appendTo(this);
        }
        append(str, flags, tail) {
            const details = this._appendChar(str[0], flags);
            if (tail != null) details.tailShift += this.appendTail(tail).tailShift;
            return details;
        }
        doCommit() {}
        get state() {
            return {
                _value: this._value,
                _rawInputValue: this.rawInputValue
            };
        }
        set state(state) {
            this._value = state._value;
            this._isRawInput = Boolean(state._rawInputValue);
        }
        pad(flags) {
            return this._appendPlaceholder();
        }
    }
    class PatternInputDefinition {
        constructor(opts) {
            const {parent, isOptional, placeholderChar, displayChar, lazy, eager, ...maskOpts} = opts;
            this.masked = createMask(maskOpts);
            Object.assign(this, {
                parent,
                isOptional,
                placeholderChar,
                displayChar,
                lazy,
                eager
            });
        }
        reset() {
            this.isFilled = false;
            this.masked.reset();
        }
        remove(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.value.length;
            if (fromPos === 0 && toPos >= 1) {
                this.isFilled = false;
                return this.masked.remove(fromPos, toPos);
            }
            return new ChangeDetails;
        }
        get value() {
            return this.masked.value || (this.isFilled && !this.isOptional ? this.placeholderChar : "");
        }
        get unmaskedValue() {
            return this.masked.unmaskedValue;
        }
        get rawInputValue() {
            return this.masked.rawInputValue;
        }
        get displayValue() {
            return this.masked.value && this.displayChar || this.value;
        }
        get isComplete() {
            return Boolean(this.masked.value) || this.isOptional;
        }
        _appendChar(ch, flags) {
            if (flags === void 0) flags = {};
            if (this.isFilled) return new ChangeDetails;
            const state = this.masked.state;
            let details = this.masked._appendChar(ch, this.currentMaskFlags(flags));
            if (details.inserted && this.doValidate(flags) === false) {
                details = new ChangeDetails;
                this.masked.state = state;
            }
            if (!details.inserted && !this.isOptional && !this.lazy && !flags.input) details.inserted = this.placeholderChar;
            details.skip = !details.inserted && !this.isOptional;
            this.isFilled = Boolean(details.inserted);
            return details;
        }
        append(str, flags, tail) {
            return this.masked.append(str, this.currentMaskFlags(flags), tail);
        }
        _appendPlaceholder() {
            if (this.isFilled || this.isOptional) return new ChangeDetails;
            this.isFilled = true;
            return new ChangeDetails({
                inserted: this.placeholderChar
            });
        }
        _appendEager() {
            return new ChangeDetails;
        }
        extractTail(fromPos, toPos) {
            return this.masked.extractTail(fromPos, toPos);
        }
        appendTail(tail) {
            return this.masked.appendTail(tail);
        }
        extractInput(fromPos, toPos, flags) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.value.length;
            return this.masked.extractInput(fromPos, toPos, flags);
        }
        nearestInputPos(cursorPos, direction) {
            if (direction === void 0) direction = DIRECTION.NONE;
            const minPos = 0;
            const maxPos = this.value.length;
            const boundPos = Math.min(Math.max(cursorPos, minPos), maxPos);
            switch (direction) {
              case DIRECTION.LEFT:
              case DIRECTION.FORCE_LEFT:
                return this.isComplete ? boundPos : minPos;

              case DIRECTION.RIGHT:
              case DIRECTION.FORCE_RIGHT:
                return this.isComplete ? boundPos : maxPos;

              case DIRECTION.NONE:
              default:
                return boundPos;
            }
        }
        totalInputPositions(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.value.length;
            return this.value.slice(fromPos, toPos).length;
        }
        doValidate(flags) {
            return this.masked.doValidate(this.currentMaskFlags(flags)) && (!this.parent || this.parent.doValidate(this.currentMaskFlags(flags)));
        }
        doCommit() {
            this.masked.doCommit();
        }
        get state() {
            return {
                _value: this.value,
                _rawInputValue: this.rawInputValue,
                masked: this.masked.state,
                isFilled: this.isFilled
            };
        }
        set state(state) {
            this.masked.state = state.masked;
            this.isFilled = state.isFilled;
        }
        currentMaskFlags(flags) {
            var _flags$_beforeTailSta;
            return {
                ...flags,
                _beforeTailState: (flags == null || (_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.masked) || (flags == null ? void 0 : flags._beforeTailState)
            };
        }
        pad(flags) {
            return new ChangeDetails;
        }
    }
    PatternInputDefinition.DEFAULT_DEFINITIONS = {
        0: /\d/,
        a: /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
        "*": /./
    };
    class MaskedRegExp extends Masked {
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            const mask = opts.mask;
            if (mask) opts.validate = value => value.search(mask) >= 0;
            super._update(opts);
        }
    }
    holder_IMask.MaskedRegExp = MaskedRegExp;
    class MaskedPattern extends Masked {
        constructor(opts) {
            super({
                ...MaskedPattern.DEFAULTS,
                ...opts,
                definitions: Object.assign({}, PatternInputDefinition.DEFAULT_DEFINITIONS, opts == null ? void 0 : opts.definitions)
            });
        }
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            opts.definitions = Object.assign({}, this.definitions, opts.definitions);
            super._update(opts);
            this._rebuildMask();
        }
        _rebuildMask() {
            const defs = this.definitions;
            this._blocks = [];
            this.exposeBlock = void 0;
            this._stops = [];
            this._maskedBlocks = {};
            const pattern = this.mask;
            if (!pattern || !defs) return;
            let unmaskingBlock = false;
            let optionalBlock = false;
            for (let i = 0; i < pattern.length; ++i) {
                if (this.blocks) {
                    const p = pattern.slice(i);
                    const bNames = Object.keys(this.blocks).filter((bName => p.indexOf(bName) === 0));
                    bNames.sort(((a, b) => b.length - a.length));
                    const bName = bNames[0];
                    if (bName) {
                        const {expose, repeat, ...bOpts} = normalizeOpts(this.blocks[bName]);
                        const blockOpts = {
                            lazy: this.lazy,
                            eager: this.eager,
                            placeholderChar: this.placeholderChar,
                            displayChar: this.displayChar,
                            overwrite: this.overwrite,
                            autofix: this.autofix,
                            ...bOpts,
                            repeat,
                            parent: this
                        };
                        const maskedBlock = repeat != null ? new holder_IMask.RepeatBlock(blockOpts) : createMask(blockOpts);
                        if (maskedBlock) {
                            this._blocks.push(maskedBlock);
                            if (expose) this.exposeBlock = maskedBlock;
                            if (!this._maskedBlocks[bName]) this._maskedBlocks[bName] = [];
                            this._maskedBlocks[bName].push(this._blocks.length - 1);
                        }
                        i += bName.length - 1;
                        continue;
                    }
                }
                let char = pattern[i];
                let isInput = char in defs;
                if (char === MaskedPattern.STOP_CHAR) {
                    this._stops.push(this._blocks.length);
                    continue;
                }
                if (char === "{" || char === "}") {
                    unmaskingBlock = !unmaskingBlock;
                    continue;
                }
                if (char === "[" || char === "]") {
                    optionalBlock = !optionalBlock;
                    continue;
                }
                if (char === MaskedPattern.ESCAPE_CHAR) {
                    ++i;
                    char = pattern[i];
                    if (!char) break;
                    isInput = false;
                }
                const def = isInput ? new PatternInputDefinition({
                    isOptional: optionalBlock,
                    lazy: this.lazy,
                    eager: this.eager,
                    placeholderChar: this.placeholderChar,
                    displayChar: this.displayChar,
                    ...normalizeOpts(defs[char]),
                    parent: this
                }) : new PatternFixedDefinition({
                    char,
                    eager: this.eager,
                    isUnmasking: unmaskingBlock
                });
                this._blocks.push(def);
            }
        }
        get state() {
            return {
                ...super.state,
                _blocks: this._blocks.map((b => b.state))
            };
        }
        set state(state) {
            if (!state) {
                this.reset();
                return;
            }
            const {_blocks, ...maskedState} = state;
            this._blocks.forEach(((b, bi) => b.state = _blocks[bi]));
            super.state = maskedState;
        }
        reset() {
            super.reset();
            this._blocks.forEach((b => b.reset()));
        }
        get isComplete() {
            return this.exposeBlock ? this.exposeBlock.isComplete : this._blocks.every((b => b.isComplete));
        }
        get isFilled() {
            return this._blocks.every((b => b.isFilled));
        }
        get isFixed() {
            return this._blocks.every((b => b.isFixed));
        }
        get isOptional() {
            return this._blocks.every((b => b.isOptional));
        }
        doCommit() {
            this._blocks.forEach((b => b.doCommit()));
            super.doCommit();
        }
        get unmaskedValue() {
            return this.exposeBlock ? this.exposeBlock.unmaskedValue : this._blocks.reduce(((str, b) => str += b.unmaskedValue), "");
        }
        set unmaskedValue(unmaskedValue) {
            if (this.exposeBlock) {
                const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
                this.exposeBlock.unmaskedValue = unmaskedValue;
                this.appendTail(tail);
                this.doCommit();
            } else super.unmaskedValue = unmaskedValue;
        }
        get value() {
            return this.exposeBlock ? this.exposeBlock.value : this._blocks.reduce(((str, b) => str += b.value), "");
        }
        set value(value) {
            if (this.exposeBlock) {
                const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
                this.exposeBlock.value = value;
                this.appendTail(tail);
                this.doCommit();
            } else super.value = value;
        }
        get typedValue() {
            return this.exposeBlock ? this.exposeBlock.typedValue : super.typedValue;
        }
        set typedValue(value) {
            if (this.exposeBlock) {
                const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
                this.exposeBlock.typedValue = value;
                this.appendTail(tail);
                this.doCommit();
            } else super.typedValue = value;
        }
        get displayValue() {
            return this._blocks.reduce(((str, b) => str += b.displayValue), "");
        }
        appendTail(tail) {
            return super.appendTail(tail).aggregate(this._appendPlaceholder());
        }
        _appendEager() {
            var _this$_mapPosToBlock;
            const details = new ChangeDetails;
            let startBlockIndex = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index;
            if (startBlockIndex == null) return details;
            if (this._blocks[startBlockIndex].isFilled) ++startBlockIndex;
            for (let bi = startBlockIndex; bi < this._blocks.length; ++bi) {
                const d = this._blocks[bi]._appendEager();
                if (!d.inserted) break;
                details.aggregate(d);
            }
            return details;
        }
        _appendCharRaw(ch, flags) {
            if (flags === void 0) flags = {};
            const blockIter = this._mapPosToBlock(this.displayValue.length);
            const details = new ChangeDetails;
            if (!blockIter) return details;
            for (let block, bi = blockIter.index; block = this._blocks[bi]; ++bi) {
                var _flags$_beforeTailSta;
                const blockDetails = block._appendChar(ch, {
                    ...flags,
                    _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
                });
                details.aggregate(blockDetails);
                if (blockDetails.consumed) break;
            }
            return details;
        }
        extractTail(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            const chunkTail = new ChunksTailDetails;
            if (fromPos === toPos) return chunkTail;
            this._forEachBlocksInRange(fromPos, toPos, ((b, bi, bFromPos, bToPos) => {
                const blockChunk = b.extractTail(bFromPos, bToPos);
                blockChunk.stop = this._findStopBefore(bi);
                blockChunk.from = this._blockStartPos(bi);
                if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;
                chunkTail.extend(blockChunk);
            }));
            return chunkTail;
        }
        extractInput(fromPos, toPos, flags) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            if (flags === void 0) flags = {};
            if (fromPos === toPos) return "";
            let input = "";
            this._forEachBlocksInRange(fromPos, toPos, ((b, _, fromPos, toPos) => {
                input += b.extractInput(fromPos, toPos, flags);
            }));
            return input;
        }
        _findStopBefore(blockIndex) {
            let stopBefore;
            for (let si = 0; si < this._stops.length; ++si) {
                const stop = this._stops[si];
                if (stop <= blockIndex) stopBefore = stop; else break;
            }
            return stopBefore;
        }
        _appendPlaceholder(toBlockIndex) {
            const details = new ChangeDetails;
            if (this.lazy && toBlockIndex == null) return details;
            const startBlockIter = this._mapPosToBlock(this.displayValue.length);
            if (!startBlockIter) return details;
            const startBlockIndex = startBlockIter.index;
            const endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;
            this._blocks.slice(startBlockIndex, endBlockIndex).forEach((b => {
                if (!b.lazy || toBlockIndex != null) {
                    var _blocks2;
                    details.aggregate(b._appendPlaceholder((_blocks2 = b._blocks) == null ? void 0 : _blocks2.length));
                }
            }));
            return details;
        }
        _mapPosToBlock(pos) {
            let accVal = "";
            for (let bi = 0; bi < this._blocks.length; ++bi) {
                const block = this._blocks[bi];
                const blockStartPos = accVal.length;
                accVal += block.displayValue;
                if (pos <= accVal.length) return {
                    index: bi,
                    offset: pos - blockStartPos
                };
            }
        }
        _blockStartPos(blockIndex) {
            return this._blocks.slice(0, blockIndex).reduce(((pos, b) => pos += b.displayValue.length), 0);
        }
        _forEachBlocksInRange(fromPos, toPos, fn) {
            if (toPos === void 0) toPos = this.displayValue.length;
            const fromBlockIter = this._mapPosToBlock(fromPos);
            if (fromBlockIter) {
                const toBlockIter = this._mapPosToBlock(toPos);
                const isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
                const fromBlockStartPos = fromBlockIter.offset;
                const fromBlockEndPos = toBlockIter && isSameBlock ? toBlockIter.offset : this._blocks[fromBlockIter.index].displayValue.length;
                fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);
                if (toBlockIter && !isSameBlock) {
                    for (let bi = fromBlockIter.index + 1; bi < toBlockIter.index; ++bi) fn(this._blocks[bi], bi, 0, this._blocks[bi].displayValue.length);
                    fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
                }
            }
        }
        remove(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            const removeDetails = super.remove(fromPos, toPos);
            this._forEachBlocksInRange(fromPos, toPos, ((b, _, bFromPos, bToPos) => {
                removeDetails.aggregate(b.remove(bFromPos, bToPos));
            }));
            return removeDetails;
        }
        nearestInputPos(cursorPos, direction) {
            if (direction === void 0) direction = DIRECTION.NONE;
            if (!this._blocks.length) return 0;
            const cursor = new PatternCursor(this, cursorPos);
            if (direction === DIRECTION.NONE) {
                if (cursor.pushRightBeforeInput()) return cursor.pos;
                cursor.popState();
                if (cursor.pushLeftBeforeInput()) return cursor.pos;
                return this.displayValue.length;
            }
            if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
                if (direction === DIRECTION.LEFT) {
                    cursor.pushRightBeforeFilled();
                    if (cursor.ok && cursor.pos === cursorPos) return cursorPos;
                    cursor.popState();
                }
                cursor.pushLeftBeforeInput();
                cursor.pushLeftBeforeRequired();
                cursor.pushLeftBeforeFilled();
                if (direction === DIRECTION.LEFT) {
                    cursor.pushRightBeforeInput();
                    cursor.pushRightBeforeRequired();
                    if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
                    cursor.popState();
                    if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
                    cursor.popState();
                }
                if (cursor.ok) return cursor.pos;
                if (direction === DIRECTION.FORCE_LEFT) return 0;
                cursor.popState();
                if (cursor.ok) return cursor.pos;
                cursor.popState();
                if (cursor.ok) return cursor.pos;
                return 0;
            }
            if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
                cursor.pushRightBeforeInput();
                cursor.pushRightBeforeRequired();
                if (cursor.pushRightBeforeFilled()) return cursor.pos;
                if (direction === DIRECTION.FORCE_RIGHT) return this.displayValue.length;
                cursor.popState();
                if (cursor.ok) return cursor.pos;
                cursor.popState();
                if (cursor.ok) return cursor.pos;
                return this.nearestInputPos(cursorPos, DIRECTION.LEFT);
            }
            return cursorPos;
        }
        totalInputPositions(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            let total = 0;
            this._forEachBlocksInRange(fromPos, toPos, ((b, _, bFromPos, bToPos) => {
                total += b.totalInputPositions(bFromPos, bToPos);
            }));
            return total;
        }
        maskedBlock(name) {
            return this.maskedBlocks(name)[0];
        }
        maskedBlocks(name) {
            const indices = this._maskedBlocks[name];
            if (!indices) return [];
            return indices.map((gi => this._blocks[gi]));
        }
        pad(flags) {
            const details = new ChangeDetails;
            this._forEachBlocksInRange(0, this.displayValue.length, (b => details.aggregate(b.pad(flags))));
            return details;
        }
    }
    MaskedPattern.DEFAULTS = {
        ...Masked.DEFAULTS,
        lazy: true,
        placeholderChar: "_"
    };
    MaskedPattern.STOP_CHAR = "`";
    MaskedPattern.ESCAPE_CHAR = "\\";
    MaskedPattern.InputDefinition = PatternInputDefinition;
    MaskedPattern.FixedDefinition = PatternFixedDefinition;
    holder_IMask.MaskedPattern = MaskedPattern;
    class MaskedRange extends MaskedPattern {
        get _matchFrom() {
            return this.maxLength - String(this.from).length;
        }
        constructor(opts) {
            super(opts);
        }
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            const {to = this.to || 0, from = this.from || 0, maxLength = this.maxLength || 0, autofix = this.autofix, ...patternOpts} = opts;
            this.to = to;
            this.from = from;
            this.maxLength = Math.max(String(to).length, maxLength);
            this.autofix = autofix;
            const fromStr = String(this.from).padStart(this.maxLength, "0");
            const toStr = String(this.to).padStart(this.maxLength, "0");
            let sameCharsCount = 0;
            while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) ++sameCharsCount;
            patternOpts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, "\\0") + "0".repeat(this.maxLength - sameCharsCount);
            super._update(patternOpts);
        }
        get isComplete() {
            return super.isComplete && Boolean(this.value);
        }
        boundaries(str) {
            let minstr = "";
            let maxstr = "";
            const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
            if (num) {
                minstr = "0".repeat(placeholder.length) + num;
                maxstr = "9".repeat(placeholder.length) + num;
            }
            minstr = minstr.padEnd(this.maxLength, "0");
            maxstr = maxstr.padEnd(this.maxLength, "9");
            return [ minstr, maxstr ];
        }
        doPrepareChar(ch, flags) {
            if (flags === void 0) flags = {};
            let details;
            [ch, details] = super.doPrepareChar(ch.replace(/\D/g, ""), flags);
            if (!ch) details.skip = !this.isComplete;
            return [ ch, details ];
        }
        _appendCharRaw(ch, flags) {
            if (flags === void 0) flags = {};
            if (!this.autofix || this.value.length + 1 > this.maxLength) return super._appendCharRaw(ch, flags);
            const fromStr = String(this.from).padStart(this.maxLength, "0");
            const toStr = String(this.to).padStart(this.maxLength, "0");
            const [minstr, maxstr] = this.boundaries(this.value + ch);
            if (Number(maxstr) < this.from) return super._appendCharRaw(fromStr[this.value.length], flags);
            if (Number(minstr) > this.to) {
                if (!flags.tail && this.autofix === "pad" && this.value.length + 1 < this.maxLength) return super._appendCharRaw(fromStr[this.value.length], flags).aggregate(this._appendCharRaw(ch, flags));
                return super._appendCharRaw(toStr[this.value.length], flags);
            }
            return super._appendCharRaw(ch, flags);
        }
        doValidate(flags) {
            const str = this.value;
            const firstNonZero = str.search(/[^0]/);
            if (firstNonZero === -1 && str.length <= this._matchFrom) return true;
            const [minstr, maxstr] = this.boundaries(str);
            return this.from <= Number(maxstr) && Number(minstr) <= this.to && super.doValidate(flags);
        }
        pad(flags) {
            const details = new ChangeDetails;
            if (this.value.length === this.maxLength) return details;
            const value = this.value;
            const padLength = this.maxLength - this.value.length;
            if (padLength) {
                this.reset();
                for (let i = 0; i < padLength; ++i) details.aggregate(super._appendCharRaw("0", flags));
                value.split("").forEach((ch => this._appendCharRaw(ch)));
            }
            return details;
        }
    }
    holder_IMask.MaskedRange = MaskedRange;
    const DefaultPattern = "d{.}`m{.}`Y";
    class MaskedDate extends MaskedPattern {
        static extractPatternOptions(opts) {
            const {mask, pattern, ...patternOpts} = opts;
            return {
                ...patternOpts,
                mask: isString(mask) ? mask : pattern
            };
        }
        constructor(opts) {
            super(MaskedDate.extractPatternOptions({
                ...MaskedDate.DEFAULTS,
                ...opts
            }));
        }
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            const {mask, pattern, blocks, ...patternOpts} = {
                ...MaskedDate.DEFAULTS,
                ...opts
            };
            const patternBlocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS());
            if (opts.min) patternBlocks.Y.from = opts.min.getFullYear();
            if (opts.max) patternBlocks.Y.to = opts.max.getFullYear();
            if (opts.min && opts.max && patternBlocks.Y.from === patternBlocks.Y.to) {
                patternBlocks.m.from = opts.min.getMonth() + 1;
                patternBlocks.m.to = opts.max.getMonth() + 1;
                if (patternBlocks.m.from === patternBlocks.m.to) {
                    patternBlocks.d.from = opts.min.getDate();
                    patternBlocks.d.to = opts.max.getDate();
                }
            }
            Object.assign(patternBlocks, this.blocks, blocks);
            super._update({
                ...patternOpts,
                mask: isString(mask) ? mask : pattern,
                blocks: patternBlocks
            });
        }
        doValidate(flags) {
            const date = this.date;
            return super.doValidate(flags) && (!this.isComplete || this.isDateExist(this.value) && date != null && (this.min == null || this.min <= date) && (this.max == null || date <= this.max));
        }
        isDateExist(str) {
            return this.format(this.parse(str, this), this).indexOf(str) >= 0;
        }
        get date() {
            return this.typedValue;
        }
        set date(date) {
            this.typedValue = date;
        }
        get typedValue() {
            return this.isComplete ? super.typedValue : null;
        }
        set typedValue(value) {
            super.typedValue = value;
        }
        maskEquals(mask) {
            return mask === Date || super.maskEquals(mask);
        }
        optionsIsChanged(opts) {
            return super.optionsIsChanged(MaskedDate.extractPatternOptions(opts));
        }
    }
    MaskedDate.GET_DEFAULT_BLOCKS = () => ({
        d: {
            mask: MaskedRange,
            from: 1,
            to: 31,
            maxLength: 2
        },
        m: {
            mask: MaskedRange,
            from: 1,
            to: 12,
            maxLength: 2
        },
        Y: {
            mask: MaskedRange,
            from: 1900,
            to: 9999
        }
    });
    MaskedDate.DEFAULTS = {
        ...MaskedPattern.DEFAULTS,
        mask: Date,
        pattern: DefaultPattern,
        format: (date, masked) => {
            if (!date) return "";
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return [ day, month, year ].join(".");
        },
        parse: (str, masked) => {
            const [day, month, year] = str.split(".").map(Number);
            return new Date(year, month - 1, day);
        }
    };
    holder_IMask.MaskedDate = MaskedDate;
    class MaskedDynamic extends Masked {
        constructor(opts) {
            super({
                ...MaskedDynamic.DEFAULTS,
                ...opts
            });
            this.currentMask = void 0;
        }
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            super._update(opts);
            if ("mask" in opts) {
                this.exposeMask = void 0;
                this.compiledMasks = Array.isArray(opts.mask) ? opts.mask.map((m => {
                    const {expose, ...maskOpts} = normalizeOpts(m);
                    const masked = createMask({
                        overwrite: this._overwrite,
                        eager: this._eager,
                        skipInvalid: this._skipInvalid,
                        ...maskOpts
                    });
                    if (expose) this.exposeMask = masked;
                    return masked;
                })) : [];
            }
        }
        _appendCharRaw(ch, flags) {
            if (flags === void 0) flags = {};
            const details = this._applyDispatch(ch, flags);
            if (this.currentMask) details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
            return details;
        }
        _applyDispatch(appended, flags, tail) {
            if (appended === void 0) appended = "";
            if (flags === void 0) flags = {};
            if (tail === void 0) tail = "";
            const prevValueBeforeTail = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._value : this.value;
            const inputValue = this.rawInputValue;
            const insertValue = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._rawInputValue : inputValue;
            const tailValue = inputValue.slice(insertValue.length);
            const prevMask = this.currentMask;
            const details = new ChangeDetails;
            const prevMaskState = prevMask == null ? void 0 : prevMask.state;
            this.currentMask = this.doDispatch(appended, {
                ...flags
            }, tail);
            if (this.currentMask) if (this.currentMask !== prevMask) {
                this.currentMask.reset();
                if (insertValue) {
                    this.currentMask.append(insertValue, {
                        raw: true
                    });
                    details.tailShift = this.currentMask.value.length - prevValueBeforeTail.length;
                }
                if (tailValue) details.tailShift += this.currentMask.append(tailValue, {
                    raw: true,
                    tail: true
                }).tailShift;
            } else if (prevMaskState) this.currentMask.state = prevMaskState;
            return details;
        }
        _appendPlaceholder() {
            const details = this._applyDispatch();
            if (this.currentMask) details.aggregate(this.currentMask._appendPlaceholder());
            return details;
        }
        _appendEager() {
            const details = this._applyDispatch();
            if (this.currentMask) details.aggregate(this.currentMask._appendEager());
            return details;
        }
        appendTail(tail) {
            const details = new ChangeDetails;
            if (tail) details.aggregate(this._applyDispatch("", {}, tail));
            return details.aggregate(this.currentMask ? this.currentMask.appendTail(tail) : super.appendTail(tail));
        }
        currentMaskFlags(flags) {
            var _flags$_beforeTailSta, _flags$_beforeTailSta2;
            return {
                ...flags,
                _beforeTailState: ((_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.currentMaskRef) === this.currentMask && ((_flags$_beforeTailSta2 = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta2.currentMask) || flags._beforeTailState
            };
        }
        doDispatch(appended, flags, tail) {
            if (flags === void 0) flags = {};
            if (tail === void 0) tail = "";
            return this.dispatch(appended, this, flags, tail);
        }
        doValidate(flags) {
            return super.doValidate(flags) && (!this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags)));
        }
        doPrepare(str, flags) {
            if (flags === void 0) flags = {};
            let [s, details] = super.doPrepare(str, flags);
            if (this.currentMask) {
                let currentDetails;
                [s, currentDetails] = super.doPrepare(s, this.currentMaskFlags(flags));
                details = details.aggregate(currentDetails);
            }
            return [ s, details ];
        }
        doPrepareChar(str, flags) {
            if (flags === void 0) flags = {};
            let [s, details] = super.doPrepareChar(str, flags);
            if (this.currentMask) {
                let currentDetails;
                [s, currentDetails] = super.doPrepareChar(s, this.currentMaskFlags(flags));
                details = details.aggregate(currentDetails);
            }
            return [ s, details ];
        }
        reset() {
            var _this$currentMask;
            (_this$currentMask = this.currentMask) == null || _this$currentMask.reset();
            this.compiledMasks.forEach((m => m.reset()));
        }
        get value() {
            return this.exposeMask ? this.exposeMask.value : this.currentMask ? this.currentMask.value : "";
        }
        set value(value) {
            if (this.exposeMask) {
                this.exposeMask.value = value;
                this.currentMask = this.exposeMask;
                this._applyDispatch();
            } else super.value = value;
        }
        get unmaskedValue() {
            return this.exposeMask ? this.exposeMask.unmaskedValue : this.currentMask ? this.currentMask.unmaskedValue : "";
        }
        set unmaskedValue(unmaskedValue) {
            if (this.exposeMask) {
                this.exposeMask.unmaskedValue = unmaskedValue;
                this.currentMask = this.exposeMask;
                this._applyDispatch();
            } else super.unmaskedValue = unmaskedValue;
        }
        get typedValue() {
            return this.exposeMask ? this.exposeMask.typedValue : this.currentMask ? this.currentMask.typedValue : "";
        }
        set typedValue(typedValue) {
            if (this.exposeMask) {
                this.exposeMask.typedValue = typedValue;
                this.currentMask = this.exposeMask;
                this._applyDispatch();
                return;
            }
            let unmaskedValue = String(typedValue);
            if (this.currentMask) {
                this.currentMask.typedValue = typedValue;
                unmaskedValue = this.currentMask.unmaskedValue;
            }
            this.unmaskedValue = unmaskedValue;
        }
        get displayValue() {
            return this.currentMask ? this.currentMask.displayValue : "";
        }
        get isComplete() {
            var _this$currentMask2;
            return Boolean((_this$currentMask2 = this.currentMask) == null ? void 0 : _this$currentMask2.isComplete);
        }
        get isFilled() {
            var _this$currentMask3;
            return Boolean((_this$currentMask3 = this.currentMask) == null ? void 0 : _this$currentMask3.isFilled);
        }
        remove(fromPos, toPos) {
            const details = new ChangeDetails;
            if (this.currentMask) details.aggregate(this.currentMask.remove(fromPos, toPos)).aggregate(this._applyDispatch());
            return details;
        }
        get state() {
            var _this$currentMask4;
            return {
                ...super.state,
                _rawInputValue: this.rawInputValue,
                compiledMasks: this.compiledMasks.map((m => m.state)),
                currentMaskRef: this.currentMask,
                currentMask: (_this$currentMask4 = this.currentMask) == null ? void 0 : _this$currentMask4.state
            };
        }
        set state(state) {
            const {compiledMasks, currentMaskRef, currentMask, ...maskedState} = state;
            if (compiledMasks) this.compiledMasks.forEach(((m, mi) => m.state = compiledMasks[mi]));
            if (currentMaskRef != null) {
                this.currentMask = currentMaskRef;
                this.currentMask.state = currentMask;
            }
            super.state = maskedState;
        }
        extractInput(fromPos, toPos, flags) {
            return this.currentMask ? this.currentMask.extractInput(fromPos, toPos, flags) : "";
        }
        extractTail(fromPos, toPos) {
            return this.currentMask ? this.currentMask.extractTail(fromPos, toPos) : super.extractTail(fromPos, toPos);
        }
        doCommit() {
            if (this.currentMask) this.currentMask.doCommit();
            super.doCommit();
        }
        nearestInputPos(cursorPos, direction) {
            return this.currentMask ? this.currentMask.nearestInputPos(cursorPos, direction) : super.nearestInputPos(cursorPos, direction);
        }
        get overwrite() {
            return this.currentMask ? this.currentMask.overwrite : this._overwrite;
        }
        set overwrite(overwrite) {
            this._overwrite = overwrite;
        }
        get eager() {
            return this.currentMask ? this.currentMask.eager : this._eager;
        }
        set eager(eager) {
            this._eager = eager;
        }
        get skipInvalid() {
            return this.currentMask ? this.currentMask.skipInvalid : this._skipInvalid;
        }
        set skipInvalid(skipInvalid) {
            this._skipInvalid = skipInvalid;
        }
        get autofix() {
            return this.currentMask ? this.currentMask.autofix : this._autofix;
        }
        set autofix(autofix) {
            this._autofix = autofix;
        }
        maskEquals(mask) {
            return Array.isArray(mask) ? this.compiledMasks.every(((m, mi) => {
                if (!mask[mi]) return;
                const {mask: oldMask, ...restOpts} = mask[mi];
                return objectIncludes(m, restOpts) && m.maskEquals(oldMask);
            })) : super.maskEquals(mask);
        }
        typedValueEquals(value) {
            var _this$currentMask5;
            return Boolean((_this$currentMask5 = this.currentMask) == null ? void 0 : _this$currentMask5.typedValueEquals(value));
        }
    }
    MaskedDynamic.DEFAULTS = {
        ...Masked.DEFAULTS,
        dispatch: (appended, masked, flags, tail) => {
            if (!masked.compiledMasks.length) return;
            const inputValue = masked.rawInputValue;
            const inputs = masked.compiledMasks.map(((m, index) => {
                const isCurrent = masked.currentMask === m;
                const startInputPos = isCurrent ? m.displayValue.length : m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT);
                if (m.rawInputValue !== inputValue) {
                    m.reset();
                    m.append(inputValue, {
                        raw: true
                    });
                } else if (!isCurrent) m.remove(startInputPos);
                m.append(appended, masked.currentMaskFlags(flags));
                m.appendTail(tail);
                return {
                    index,
                    weight: m.rawInputValue.length,
                    totalInputPositions: m.totalInputPositions(0, Math.max(startInputPos, m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT)))
                };
            }));
            inputs.sort(((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions));
            return masked.compiledMasks[inputs[0].index];
        }
    };
    holder_IMask.MaskedDynamic = MaskedDynamic;
    class MaskedEnum extends MaskedPattern {
        constructor(opts) {
            super({
                ...MaskedEnum.DEFAULTS,
                ...opts
            });
        }
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            const {enum: enum_, ...eopts} = opts;
            if (enum_) {
                const lengths = enum_.map((e => e.length));
                const requiredLength = Math.min(...lengths);
                const optionalLength = Math.max(...lengths) - requiredLength;
                eopts.mask = "*".repeat(requiredLength);
                if (optionalLength) eopts.mask += "[" + "*".repeat(optionalLength) + "]";
                this.enum = enum_;
            }
            super._update(eopts);
        }
        _appendCharRaw(ch, flags) {
            if (flags === void 0) flags = {};
            const matchFrom = Math.min(this.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
            const matches = this.enum.filter((e => this.matchValue(e, this.unmaskedValue + ch, matchFrom)));
            if (matches.length) {
                if (matches.length === 1) this._forEachBlocksInRange(0, this.value.length, ((b, bi) => {
                    const mch = matches[0][bi];
                    if (bi >= this.value.length || mch === b.value) return;
                    b.reset();
                    b._appendChar(mch, flags);
                }));
                const d = super._appendCharRaw(matches[0][this.value.length], flags);
                if (matches.length === 1) matches[0].slice(this.unmaskedValue.length).split("").forEach((mch => d.aggregate(super._appendCharRaw(mch))));
                return d;
            }
            return new ChangeDetails({
                skip: !this.isComplete
            });
        }
        extractTail(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            return new ContinuousTailDetails("", fromPos);
        }
        remove(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            if (fromPos === toPos) return new ChangeDetails;
            const matchFrom = Math.min(super.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
            let pos;
            for (pos = fromPos; pos >= 0; --pos) {
                const matches = this.enum.filter((e => this.matchValue(e, this.value.slice(matchFrom, pos), matchFrom)));
                if (matches.length > 1) break;
            }
            const details = super.remove(pos, toPos);
            details.tailShift += pos - fromPos;
            return details;
        }
        get isComplete() {
            return this.enum.indexOf(this.value) >= 0;
        }
    }
    MaskedEnum.DEFAULTS = {
        ...MaskedPattern.DEFAULTS,
        matchValue: (estr, istr, matchFrom) => estr.indexOf(istr, matchFrom) === matchFrom
    };
    holder_IMask.MaskedEnum = MaskedEnum;
    class MaskedFunction extends Masked {
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            super._update({
                ...opts,
                validate: opts.mask
            });
        }
    }
    holder_IMask.MaskedFunction = MaskedFunction;
    var _MaskedNumber;
    class MaskedNumber extends Masked {
        constructor(opts) {
            super({
                ...MaskedNumber.DEFAULTS,
                ...opts
            });
        }
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            super._update(opts);
            this._updateRegExps();
        }
        _updateRegExps() {
            const start = "^" + (this.allowNegative ? "[+|\\-]?" : "");
            const mid = "\\d*";
            const end = (this.scale ? "(" + escapeRegExp(this.radix) + "\\d{0," + this.scale + "})?" : "") + "$";
            this._numberRegExp = new RegExp(start + mid + end);
            this._mapToRadixRegExp = new RegExp("[" + this.mapToRadix.map(escapeRegExp).join("") + "]", "g");
            this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), "g");
        }
        _removeThousandsSeparators(value) {
            return value.replace(this._thousandsSeparatorRegExp, "");
        }
        _insertThousandsSeparators(value) {
            const parts = value.split(this.radix);
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
            return parts.join(this.radix);
        }
        doPrepareChar(ch, flags) {
            if (flags === void 0) flags = {};
            const [prepCh, details] = super.doPrepareChar(this._removeThousandsSeparators(this.scale && this.mapToRadix.length && (flags.input && flags.raw || !flags.input && !flags.raw) ? ch.replace(this._mapToRadixRegExp, this.radix) : ch), flags);
            if (ch && !prepCh) details.skip = true;
            if (prepCh && !this.allowPositive && !this.value && prepCh !== "-") details.aggregate(this._appendChar("-"));
            return [ prepCh, details ];
        }
        _separatorsCount(to, extendOnSeparators) {
            if (extendOnSeparators === void 0) extendOnSeparators = false;
            let count = 0;
            for (let pos = 0; pos < to; ++pos) if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
                ++count;
                if (extendOnSeparators) to += this.thousandsSeparator.length;
            }
            return count;
        }
        _separatorsCountFromSlice(slice) {
            if (slice === void 0) slice = this._value;
            return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
        }
        extractInput(fromPos, toPos, flags) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
            return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
        }
        _appendCharRaw(ch, flags) {
            if (flags === void 0) flags = {};
            const prevBeforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
            const prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);
            this._value = this._removeThousandsSeparators(this.value);
            const oldValue = this._value;
            this._value += ch;
            const num = this.number;
            let accepted = !isNaN(num);
            let skip = false;
            if (accepted) {
                let fixedNum;
                if (this.min != null && this.min < 0 && this.number < this.min) fixedNum = this.min;
                if (this.max != null && this.max > 0 && this.number > this.max) fixedNum = this.max;
                if (fixedNum != null) if (this.autofix) {
                    this._value = this.format(fixedNum, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
                    skip || (skip = oldValue === this._value && !flags.tail);
                } else accepted = false;
                accepted && (accepted = Boolean(this._value.match(this._numberRegExp)));
            }
            let appendDetails;
            if (!accepted) {
                this._value = oldValue;
                appendDetails = new ChangeDetails;
            } else appendDetails = new ChangeDetails({
                inserted: this._value.slice(oldValue.length),
                rawInserted: skip ? "" : ch,
                skip
            });
            this._value = this._insertThousandsSeparators(this._value);
            const beforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
            const beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);
            appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
            return appendDetails;
        }
        _findSeparatorAround(pos) {
            if (this.thousandsSeparator) {
                const searchFrom = pos - this.thousandsSeparator.length + 1;
                const separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
                if (separatorPos <= pos) return separatorPos;
            }
            return -1;
        }
        _adjustRangeWithSeparators(from, to) {
            const separatorAroundFromPos = this._findSeparatorAround(from);
            if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;
            const separatorAroundToPos = this._findSeparatorAround(to);
            if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
            return [ from, to ];
        }
        remove(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
            const valueBeforePos = this.value.slice(0, fromPos);
            const valueAfterPos = this.value.slice(toPos);
            const prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);
            this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));
            const beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);
            return new ChangeDetails({
                tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length
            });
        }
        nearestInputPos(cursorPos, direction) {
            if (!this.thousandsSeparator) return cursorPos;
            switch (direction) {
              case DIRECTION.NONE:
              case DIRECTION.LEFT:
              case DIRECTION.FORCE_LEFT:
                {
                    const separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);
                    if (separatorAtLeftPos >= 0) {
                        const separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;
                        if (cursorPos < separatorAtLeftEndPos || this.value.length <= separatorAtLeftEndPos || direction === DIRECTION.FORCE_LEFT) return separatorAtLeftPos;
                    }
                    break;
                }

              case DIRECTION.RIGHT:
              case DIRECTION.FORCE_RIGHT:
                {
                    const separatorAtRightPos = this._findSeparatorAround(cursorPos);
                    if (separatorAtRightPos >= 0) return separatorAtRightPos + this.thousandsSeparator.length;
                }
            }
            return cursorPos;
        }
        doCommit() {
            if (this.value) {
                const number = this.number;
                let validnum = number;
                if (this.min != null) validnum = Math.max(validnum, this.min);
                if (this.max != null) validnum = Math.min(validnum, this.max);
                if (validnum !== number) this.unmaskedValue = this.format(validnum, this);
                let formatted = this.value;
                if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
                if (this.padFractionalZeros && this.scale > 0) formatted = this._padFractionalZeros(formatted);
                this._value = formatted;
            }
            super.doCommit();
        }
        _normalizeZeros(value) {
            const parts = this._removeThousandsSeparators(value).split(this.radix);
            parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, ((match, sign, zeros, num) => sign + num));
            if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + "0";
            if (parts.length > 1) {
                parts[1] = parts[1].replace(/0*$/, "");
                if (!parts[1].length) parts.length = 1;
            }
            return this._insertThousandsSeparators(parts.join(this.radix));
        }
        _padFractionalZeros(value) {
            if (!value) return value;
            const parts = value.split(this.radix);
            if (parts.length < 2) parts.push("");
            parts[1] = parts[1].padEnd(this.scale, "0");
            return parts.join(this.radix);
        }
        doSkipInvalid(ch, flags, checkTail) {
            if (flags === void 0) flags = {};
            const dropFractional = this.scale === 0 && ch !== this.thousandsSeparator && (ch === this.radix || ch === MaskedNumber.UNMASKED_RADIX || this.mapToRadix.includes(ch));
            return super.doSkipInvalid(ch, flags, checkTail) && !dropFractional;
        }
        get unmaskedValue() {
            return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, MaskedNumber.UNMASKED_RADIX);
        }
        set unmaskedValue(unmaskedValue) {
            super.unmaskedValue = unmaskedValue;
        }
        get typedValue() {
            return this.parse(this.unmaskedValue, this);
        }
        set typedValue(n) {
            this.rawInputValue = this.format(n, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
        }
        get number() {
            return this.typedValue;
        }
        set number(number) {
            this.typedValue = number;
        }
        get allowNegative() {
            return this.min != null && this.min < 0 || this.max != null && this.max < 0;
        }
        get allowPositive() {
            return this.min != null && this.min > 0 || this.max != null && this.max > 0;
        }
        typedValueEquals(value) {
            return (super.typedValueEquals(value) || MaskedNumber.EMPTY_VALUES.includes(value) && MaskedNumber.EMPTY_VALUES.includes(this.typedValue)) && !(value === 0 && this.value === "");
        }
    }
    _MaskedNumber = MaskedNumber;
    MaskedNumber.UNMASKED_RADIX = ".";
    MaskedNumber.EMPTY_VALUES = [ ...Masked.EMPTY_VALUES, 0 ];
    MaskedNumber.DEFAULTS = {
        ...Masked.DEFAULTS,
        mask: Number,
        radix: ",",
        thousandsSeparator: "",
        mapToRadix: [ _MaskedNumber.UNMASKED_RADIX ],
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER,
        scale: 2,
        normalizeZeros: true,
        padFractionalZeros: false,
        parse: Number,
        format: n => n.toLocaleString("en-US", {
            useGrouping: false,
            maximumFractionDigits: 20
        })
    };
    holder_IMask.MaskedNumber = MaskedNumber;
    const PIPE_TYPE = {
        MASKED: "value",
        UNMASKED: "unmaskedValue",
        TYPED: "typedValue"
    };
    function createPipe(arg, from, to) {
        if (from === void 0) from = PIPE_TYPE.MASKED;
        if (to === void 0) to = PIPE_TYPE.MASKED;
        const masked = createMask(arg);
        return value => masked.runIsolated((m => {
            m[from] = value;
            return m[to];
        }));
    }
    function pipe(value, mask, from, to) {
        return createPipe(mask, from, to)(value);
    }
    holder_IMask.PIPE_TYPE = PIPE_TYPE;
    holder_IMask.createPipe = createPipe;
    holder_IMask.pipe = pipe;
    class RepeatBlock extends MaskedPattern {
        get repeatFrom() {
            var _ref;
            return (_ref = Array.isArray(this.repeat) ? this.repeat[0] : this.repeat === 1 / 0 ? 0 : this.repeat) != null ? _ref : 0;
        }
        get repeatTo() {
            var _ref2;
            return (_ref2 = Array.isArray(this.repeat) ? this.repeat[1] : this.repeat) != null ? _ref2 : 1 / 0;
        }
        constructor(opts) {
            super(opts);
        }
        updateOptions(opts) {
            super.updateOptions(opts);
        }
        _update(opts) {
            var _ref3, _ref4, _this$_blocks;
            const {repeat, ...blockOpts} = normalizeOpts(opts);
            this._blockOpts = Object.assign({}, this._blockOpts, blockOpts);
            const block = createMask(this._blockOpts);
            this.repeat = (_ref3 = (_ref4 = repeat != null ? repeat : block.repeat) != null ? _ref4 : this.repeat) != null ? _ref3 : 1 / 0;
            super._update({
                mask: "m".repeat(Math.max(this.repeatTo === 1 / 0 && ((_this$_blocks = this._blocks) == null ? void 0 : _this$_blocks.length) || 0, this.repeatFrom)),
                blocks: {
                    m: block
                },
                eager: block.eager,
                overwrite: block.overwrite,
                skipInvalid: block.skipInvalid,
                lazy: block.lazy,
                placeholderChar: block.placeholderChar,
                displayChar: block.displayChar
            });
        }
        _allocateBlock(bi) {
            if (bi < this._blocks.length) return this._blocks[bi];
            if (this.repeatTo === 1 / 0 || this._blocks.length < this.repeatTo) {
                this._blocks.push(createMask(this._blockOpts));
                this.mask += "m";
                return this._blocks[this._blocks.length - 1];
            }
        }
        _appendCharRaw(ch, flags) {
            if (flags === void 0) flags = {};
            const details = new ChangeDetails;
            for (let block, allocated, bi = (_this$_mapPosToBlock$ = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index) != null ? _this$_mapPosToBlock$ : Math.max(this._blocks.length - 1, 0); block = (_this$_blocks$bi = this._blocks[bi]) != null ? _this$_blocks$bi : allocated = !allocated && this._allocateBlock(bi); ++bi) {
                var _this$_mapPosToBlock$, _this$_mapPosToBlock, _this$_blocks$bi, _flags$_beforeTailSta;
                const blockDetails = block._appendChar(ch, {
                    ...flags,
                    _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
                });
                if (blockDetails.skip && allocated) {
                    this._blocks.pop();
                    this.mask = this.mask.slice(1);
                    break;
                }
                details.aggregate(blockDetails);
                if (blockDetails.consumed) break;
            }
            return details;
        }
        _trimEmptyTail(fromPos, toPos) {
            var _this$_mapPosToBlock2, _this$_mapPosToBlock3;
            if (fromPos === void 0) fromPos = 0;
            const firstBlockIndex = Math.max(((_this$_mapPosToBlock2 = this._mapPosToBlock(fromPos)) == null ? void 0 : _this$_mapPosToBlock2.index) || 0, this.repeatFrom, 0);
            let lastBlockIndex;
            if (toPos != null) lastBlockIndex = (_this$_mapPosToBlock3 = this._mapPosToBlock(toPos)) == null ? void 0 : _this$_mapPosToBlock3.index;
            if (lastBlockIndex == null) lastBlockIndex = this._blocks.length - 1;
            let removeCount = 0;
            for (let blockIndex = lastBlockIndex; firstBlockIndex <= blockIndex; --blockIndex, 
            ++removeCount) if (this._blocks[blockIndex].unmaskedValue) break;
            if (removeCount) {
                this._blocks.splice(lastBlockIndex - removeCount + 1, removeCount);
                this.mask = this.mask.slice(removeCount);
            }
        }
        reset() {
            super.reset();
            this._trimEmptyTail();
        }
        remove(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos === void 0) toPos = this.displayValue.length;
            const removeDetails = super.remove(fromPos, toPos);
            this._trimEmptyTail(fromPos, toPos);
            return removeDetails;
        }
        totalInputPositions(fromPos, toPos) {
            if (fromPos === void 0) fromPos = 0;
            if (toPos == null && this.repeatTo === 1 / 0) return 1 / 0;
            return super.totalInputPositions(fromPos, toPos);
        }
        get state() {
            return super.state;
        }
        set state(state) {
            this._blocks.length = state._blocks.length;
            this.mask = this.mask.slice(0, this._blocks.length);
            super.state = state;
        }
    }
    holder_IMask.RepeatBlock = RepeatBlock;
    try {
        globalThis.IMask = holder_IMask;
    } catch {}
    var defaultInstanceSettings = {
        update: null,
        begin: null,
        loopBegin: null,
        changeBegin: null,
        change: null,
        changeComplete: null,
        loopComplete: null,
        complete: null,
        loop: 1,
        direction: "normal",
        autoplay: true,
        timelineOffset: 0
    };
    var defaultTweenSettings = {
        duration: 1e3,
        delay: 0,
        endDelay: 0,
        easing: "easeOutElastic(1, .5)",
        round: 0
    };
    var validTransforms = [ "translateX", "translateY", "translateZ", "rotate", "rotateX", "rotateY", "rotateZ", "scale", "scaleX", "scaleY", "scaleZ", "skew", "skewX", "skewY", "perspective", "matrix", "matrix3d" ];
    var cache = {
        CSS: {},
        springs: {}
    };
    function minMax(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
    function stringContains(str, text) {
        return str.indexOf(text) > -1;
    }
    function applyArguments(func, args) {
        return func.apply(null, args);
    }
    var is = {
        arr: function(a) {
            return Array.isArray(a);
        },
        obj: function(a) {
            return stringContains(Object.prototype.toString.call(a), "Object");
        },
        pth: function(a) {
            return is.obj(a) && a.hasOwnProperty("totalLength");
        },
        svg: function(a) {
            return a instanceof SVGElement;
        },
        inp: function(a) {
            return a instanceof HTMLInputElement;
        },
        dom: function(a) {
            return a.nodeType || is.svg(a);
        },
        str: function(a) {
            return typeof a === "string";
        },
        fnc: function(a) {
            return typeof a === "function";
        },
        und: function(a) {
            return typeof a === "undefined";
        },
        nil: function(a) {
            return is.und(a) || a === null;
        },
        hex: function(a) {
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
        },
        rgb: function(a) {
            return /^rgb/.test(a);
        },
        hsl: function(a) {
            return /^hsl/.test(a);
        },
        col: function(a) {
            return is.hex(a) || is.rgb(a) || is.hsl(a);
        },
        key: function(a) {
            return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== "targets" && a !== "keyframes";
        }
    };
    function parseEasingParameters(string) {
        var match = /\(([^)]+)\)/.exec(string);
        return match ? match[1].split(",").map((function(p) {
            return parseFloat(p);
        })) : [];
    }
    function spring(string, duration) {
        var params = parseEasingParameters(string);
        var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
        var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
        var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
        var velocity = minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
        var w0 = Math.sqrt(stiffness / mass);
        var zeta = damping / (2 * Math.sqrt(stiffness * mass));
        var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
        var a = 1;
        var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;
        function solver(t) {
            var progress = duration ? duration * t / 1e3 : t;
            if (zeta < 1) progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress)); else progress = (a + b * progress) * Math.exp(-progress * w0);
            if (t === 0 || t === 1) return t;
            return 1 - progress;
        }
        function getDuration() {
            var cached = cache.springs[string];
            if (cached) return cached;
            var frame = 1 / 6;
            var elapsed = 0;
            var rest = 0;
            while (true) {
                elapsed += frame;
                if (solver(elapsed) === 1) {
                    rest++;
                    if (rest >= 16) break;
                } else rest = 0;
            }
            var duration = elapsed * frame * 1e3;
            cache.springs[string] = duration;
            return duration;
        }
        return duration ? solver : getDuration;
    }
    function steps(steps) {
        if (steps === void 0) steps = 10;
        return function(t) {
            return Math.ceil(minMax(t, 1e-6, 1) * steps) * (1 / steps);
        };
    }
    var bezier = function() {
        var kSplineTableSize = 11;
        var kSampleStepSize = 1 / (kSplineTableSize - 1);
        function A(aA1, aA2) {
            return 1 - 3 * aA2 + 3 * aA1;
        }
        function B(aA1, aA2) {
            return 3 * aA2 - 6 * aA1;
        }
        function C(aA1) {
            return 3 * aA1;
        }
        function calcBezier(aT, aA1, aA2) {
            return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
        }
        function getSlope(aT, aA1, aA2) {
            return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
        }
        function binarySubdivide(aX, aA, aB, mX1, mX2) {
            var currentX, currentT, i = 0;
            do {
                currentT = aA + (aB - aA) / 2;
                currentX = calcBezier(currentT, mX1, mX2) - aX;
                if (currentX > 0) aB = currentT; else aA = currentT;
            } while (Math.abs(currentX) > 1e-7 && ++i < 10);
            return currentT;
        }
        function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
            for (var i = 0; i < 4; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);
                if (currentSlope === 0) return aGuessT;
                var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
        }
        function bezier(mX1, mY1, mX2, mY2) {
            if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
            var sampleValues = new Float32Array(kSplineTableSize);
            if (mX1 !== mY1 || mX2 !== mY2) for (var i = 0; i < kSplineTableSize; ++i) sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
            function getTForX(aX) {
                var intervalStart = 0;
                var currentSample = 1;
                var lastSample = kSplineTableSize - 1;
                for (;currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) intervalStart += kSampleStepSize;
                --currentSample;
                var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
                var guessForT = intervalStart + dist * kSampleStepSize;
                var initialSlope = getSlope(guessForT, mX1, mX2);
                if (initialSlope >= .001) return newtonRaphsonIterate(aX, guessForT, mX1, mX2); else if (initialSlope === 0) return guessForT; else return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
            }
            return function(x) {
                if (mX1 === mY1 && mX2 === mY2) return x;
                if (x === 0 || x === 1) return x;
                return calcBezier(getTForX(x), mY1, mY2);
            };
        }
        return bezier;
    }();
    var penner = function() {
        var eases = {
            linear: function() {
                return function(t) {
                    return t;
                };
            }
        };
        var functionEasings = {
            Sine: function() {
                return function(t) {
                    return 1 - Math.cos(t * Math.PI / 2);
                };
            },
            Expo: function() {
                return function(t) {
                    return t ? Math.pow(2, 10 * t - 10) : 0;
                };
            },
            Circ: function() {
                return function(t) {
                    return 1 - Math.sqrt(1 - t * t);
                };
            },
            Back: function() {
                return function(t) {
                    return t * t * (3 * t - 2);
                };
            },
            Bounce: function() {
                return function(t) {
                    var pow2, b = 4;
                    while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) ;
                    return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
                };
            },
            Elastic: function(amplitude, period) {
                if (amplitude === void 0) amplitude = 1;
                if (period === void 0) period = .5;
                var a = minMax(amplitude, 1, 10);
                var p = minMax(period, .1, 2);
                return function(t) {
                    return t === 0 || t === 1 ? t : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - p / (Math.PI * 2) * Math.asin(1 / a)) * (Math.PI * 2) / p);
                };
            }
        };
        var baseEasings = [ "Quad", "Cubic", "Quart", "Quint" ];
        baseEasings.forEach((function(name, i) {
            functionEasings[name] = function() {
                return function(t) {
                    return Math.pow(t, i + 2);
                };
            };
        }));
        Object.keys(functionEasings).forEach((function(name) {
            var easeIn = functionEasings[name];
            eases["easeIn" + name] = easeIn;
            eases["easeOut" + name] = function(a, b) {
                return function(t) {
                    return 1 - easeIn(a, b)(1 - t);
                };
            };
            eases["easeInOut" + name] = function(a, b) {
                return function(t) {
                    return t < .5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
                };
            };
            eases["easeOutIn" + name] = function(a, b) {
                return function(t) {
                    return t < .5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
                };
            };
        }));
        return eases;
    }();
    function parseEasings(easing, duration) {
        if (is.fnc(easing)) return easing;
        var name = easing.split("(")[0];
        var ease = penner[name];
        var args = parseEasingParameters(easing);
        switch (name) {
          case "spring":
            return spring(easing, duration);

          case "cubicBezier":
            return applyArguments(bezier, args);

          case "steps":
            return applyArguments(steps, args);

          default:
            return applyArguments(ease, args);
        }
    }
    function selectString(str) {
        try {
            var nodes = document.querySelectorAll(str);
            return nodes;
        } catch (e) {
            return;
        }
    }
    function filterArray(arr, callback) {
        var len = arr.length;
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        var result = [];
        for (var i = 0; i < len; i++) if (i in arr) {
            var val = arr[i];
            if (callback.call(thisArg, val, i, arr)) result.push(val);
        }
        return result;
    }
    function flattenArray(arr) {
        return arr.reduce((function(a, b) {
            return a.concat(is.arr(b) ? flattenArray(b) : b);
        }), []);
    }
    function toArray(o) {
        if (is.arr(o)) return o;
        if (is.str(o)) o = selectString(o) || o;
        if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
        return [ o ];
    }
    function arrayContains(arr, val) {
        return arr.some((function(a) {
            return a === val;
        }));
    }
    function cloneObject(o) {
        var clone = {};
        for (var p in o) clone[p] = o[p];
        return clone;
    }
    function replaceObjectProps(o1, o2) {
        var o = cloneObject(o1);
        for (var p in o1) o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
        return o;
    }
    function mergeObjects(o1, o2) {
        var o = cloneObject(o1);
        for (var p in o2) o[p] = is.und(o1[p]) ? o2[p] : o1[p];
        return o;
    }
    function rgbToRgba(rgbValue) {
        var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
        return rgb ? "rgba(" + rgb[1] + ",1)" : rgbValue;
    }
    function hexToRgba(hexValue) {
        var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        var hex = hexValue.replace(rgx, (function(m, r, g, b) {
            return r + r + g + g + b + b;
        }));
        var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var r = parseInt(rgb[1], 16);
        var g = parseInt(rgb[2], 16);
        var b = parseInt(rgb[3], 16);
        return "rgba(" + r + "," + g + "," + b + ",1)";
    }
    function hslToRgba(hslValue) {
        var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
        var h = parseInt(hsl[1], 10) / 360;
        var s = parseInt(hsl[2], 10) / 100;
        var l = parseInt(hsl[3], 10) / 100;
        var a = hsl[4] || 1;
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        var r, g, b;
        if (s == 0) r = g = b = l; else {
            var q = l < .5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
    }
    function colorToRgb(val) {
        if (is.rgb(val)) return rgbToRgba(val);
        if (is.hex(val)) return hexToRgba(val);
        if (is.hsl(val)) return hslToRgba(val);
    }
    function getUnit(val) {
        var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
        if (split) return split[1];
    }
    function getTransformUnit(propName) {
        if (stringContains(propName, "translate") || propName === "perspective") return "px";
        if (stringContains(propName, "rotate") || stringContains(propName, "skew")) return "deg";
    }
    function getFunctionValue(val, animatable) {
        if (!is.fnc(val)) return val;
        return val(animatable.target, animatable.id, animatable.total);
    }
    function getAttribute(el, prop) {
        return el.getAttribute(prop);
    }
    function convertPxToUnit(el, value, unit) {
        var valueUnit = getUnit(value);
        if (arrayContains([ unit, "deg", "rad", "turn" ], valueUnit)) return value;
        var cached = cache.CSS[value + unit];
        if (!is.und(cached)) return cached;
        var baseline = 100;
        var tempEl = document.createElement(el.tagName);
        var parentEl = el.parentNode && el.parentNode !== document ? el.parentNode : document.body;
        parentEl.appendChild(tempEl);
        tempEl.style.position = "absolute";
        tempEl.style.width = baseline + unit;
        var factor = baseline / tempEl.offsetWidth;
        parentEl.removeChild(tempEl);
        var convertedUnit = factor * parseFloat(value);
        cache.CSS[value + unit] = convertedUnit;
        return convertedUnit;
    }
    function getCSSValue(el, prop, unit) {
        if (prop in el.style) {
            var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
            var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || "0";
            return unit ? convertPxToUnit(el, value, unit) : value;
        }
    }
    function getAnimationType(el, prop) {
        if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || is.svg(el) && el[prop])) return "attribute";
        if (is.dom(el) && arrayContains(validTransforms, prop)) return "transform";
        if (is.dom(el) && prop !== "transform" && getCSSValue(el, prop)) return "css";
        if (el[prop] != null) return "object";
    }
    function getElementTransforms(el) {
        if (!is.dom(el)) return;
        var str = el.style.transform || "";
        var reg = /(\w+)\(([^)]*)\)/g;
        var transforms = new Map;
        var m;
        while (m = reg.exec(str)) transforms.set(m[1], m[2]);
        return transforms;
    }
    function getTransformValue(el, propName, animatable, unit) {
        var defaultVal = stringContains(propName, "scale") ? 1 : 0 + getTransformUnit(propName);
        var value = getElementTransforms(el).get(propName) || defaultVal;
        if (animatable) {
            animatable.transforms.list.set(propName, value);
            animatable.transforms["last"] = propName;
        }
        return unit ? convertPxToUnit(el, value, unit) : value;
    }
    function getOriginalTargetValue(target, propName, unit, animatable) {
        switch (getAnimationType(target, propName)) {
          case "transform":
            return getTransformValue(target, propName, animatable, unit);

          case "css":
            return getCSSValue(target, propName, unit);

          case "attribute":
            return getAttribute(target, propName);

          default:
            return target[propName] || 0;
        }
    }
    function getRelativeValue(to, from) {
        var operator = /^(\*=|\+=|-=)/.exec(to);
        if (!operator) return to;
        var u = getUnit(to) || 0;
        var x = parseFloat(from);
        var y = parseFloat(to.replace(operator[0], ""));
        switch (operator[0][0]) {
          case "+":
            return x + y + u;

          case "-":
            return x - y + u;

          case "*":
            return x * y + u;
        }
    }
    function validateValue(val, unit) {
        if (is.col(val)) return colorToRgb(val);
        if (/\s/g.test(val)) return val;
        var originalUnit = getUnit(val);
        var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
        if (unit) return unitLess + unit;
        return unitLess;
    }
    function getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    function getCircleLength(el) {
        return Math.PI * 2 * getAttribute(el, "r");
    }
    function getRectLength(el) {
        return getAttribute(el, "width") * 2 + getAttribute(el, "height") * 2;
    }
    function getLineLength(el) {
        return getDistance({
            x: getAttribute(el, "x1"),
            y: getAttribute(el, "y1")
        }, {
            x: getAttribute(el, "x2"),
            y: getAttribute(el, "y2")
        });
    }
    function getPolylineLength(el) {
        var points = el.points;
        var totalLength = 0;
        var previousPos;
        for (var i = 0; i < points.numberOfItems; i++) {
            var currentPos = points.getItem(i);
            if (i > 0) totalLength += getDistance(previousPos, currentPos);
            previousPos = currentPos;
        }
        return totalLength;
    }
    function getPolygonLength(el) {
        var points = el.points;
        return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
    }
    function getTotalLength(el) {
        if (el.getTotalLength) return el.getTotalLength();
        switch (el.tagName.toLowerCase()) {
          case "circle":
            return getCircleLength(el);

          case "rect":
            return getRectLength(el);

          case "line":
            return getLineLength(el);

          case "polyline":
            return getPolylineLength(el);

          case "polygon":
            return getPolygonLength(el);
        }
    }
    function setDashoffset(el) {
        var pathLength = getTotalLength(el);
        el.setAttribute("stroke-dasharray", pathLength);
        return pathLength;
    }
    function getParentSvgEl(el) {
        var parentEl = el.parentNode;
        while (is.svg(parentEl)) {
            if (!is.svg(parentEl.parentNode)) break;
            parentEl = parentEl.parentNode;
        }
        return parentEl;
    }
    function getParentSvg(pathEl, svgData) {
        var svg = svgData || {};
        var parentSvgEl = svg.el || getParentSvgEl(pathEl);
        var rect = parentSvgEl.getBoundingClientRect();
        var viewBoxAttr = getAttribute(parentSvgEl, "viewBox");
        var width = rect.width;
        var height = rect.height;
        var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(" ") : [ 0, 0, width, height ]);
        return {
            el: parentSvgEl,
            viewBox,
            x: viewBox[0] / 1,
            y: viewBox[1] / 1,
            w: width,
            h: height,
            vW: viewBox[2],
            vH: viewBox[3]
        };
    }
    function getPath(path, percent) {
        var pathEl = is.str(path) ? selectString(path)[0] : path;
        var p = percent || 100;
        return function(property) {
            return {
                property,
                el: pathEl,
                svg: getParentSvg(pathEl),
                totalLength: getTotalLength(pathEl) * (p / 100)
            };
        };
    }
    function getPathProgress(path, progress, isPathTargetInsideSVG) {
        function point(offset) {
            if (offset === void 0) offset = 0;
            var l = progress + offset >= 1 ? progress + offset : 0;
            return path.el.getPointAtLength(l);
        }
        var svg = getParentSvg(path.el, path.svg);
        var p = point();
        var p0 = point(-1);
        var p1 = point(+1);
        var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
        var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
        switch (path.property) {
          case "x":
            return (p.x - svg.x) * scaleX;

          case "y":
            return (p.y - svg.y) * scaleY;

          case "angle":
            return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
        }
    }
    function decomposeValue(val, unit) {
        var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
        var value = validateValue(is.pth(val) ? val.totalLength : val, unit) + "";
        return {
            original: value,
            numbers: value.match(rgx) ? value.match(rgx).map(Number) : [ 0 ],
            strings: is.str(val) || unit ? value.split(rgx) : []
        };
    }
    function parseTargets(targets) {
        var targetsArray = targets ? flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets)) : [];
        return filterArray(targetsArray, (function(item, pos, self) {
            return self.indexOf(item) === pos;
        }));
    }
    function getAnimatables(targets) {
        var parsed = parseTargets(targets);
        return parsed.map((function(t, i) {
            return {
                target: t,
                id: i,
                total: parsed.length,
                transforms: {
                    list: getElementTransforms(t)
                }
            };
        }));
    }
    function normalizePropertyTweens(prop, tweenSettings) {
        var settings = cloneObject(tweenSettings);
        if (/^spring/.test(settings.easing)) settings.duration = spring(settings.easing);
        if (is.arr(prop)) {
            var l = prop.length;
            var isFromTo = l === 2 && !is.obj(prop[0]);
            if (!isFromTo) {
                if (!is.fnc(tweenSettings.duration)) settings.duration = tweenSettings.duration / l;
            } else prop = {
                value: prop
            };
        }
        var propArray = is.arr(prop) ? prop : [ prop ];
        return propArray.map((function(v, i) {
            var obj = is.obj(v) && !is.pth(v) ? v : {
                value: v
            };
            if (is.und(obj.delay)) obj.delay = !i ? tweenSettings.delay : 0;
            if (is.und(obj.endDelay)) obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
            return obj;
        })).map((function(k) {
            return mergeObjects(k, settings);
        }));
    }
    function flattenKeyframes(keyframes) {
        var propertyNames = filterArray(flattenArray(keyframes.map((function(key) {
            return Object.keys(key);
        }))), (function(p) {
            return is.key(p);
        })).reduce((function(a, b) {
            if (a.indexOf(b) < 0) a.push(b);
            return a;
        }), []);
        var properties = {};
        var loop = function(i) {
            var propName = propertyNames[i];
            properties[propName] = keyframes.map((function(key) {
                var newKey = {};
                for (var p in key) if (is.key(p)) {
                    if (p == propName) newKey.value = key[p];
                } else newKey[p] = key[p];
                return newKey;
            }));
        };
        for (var i = 0; i < propertyNames.length; i++) loop(i);
        return properties;
    }
    function getProperties(tweenSettings, params) {
        var properties = [];
        var keyframes = params.keyframes;
        if (keyframes) params = mergeObjects(flattenKeyframes(keyframes), params);
        for (var p in params) if (is.key(p)) properties.push({
            name: p,
            tweens: normalizePropertyTweens(params[p], tweenSettings)
        });
        return properties;
    }
    function normalizeTweenValues(tween, animatable) {
        var t = {};
        for (var p in tween) {
            var value = getFunctionValue(tween[p], animatable);
            if (is.arr(value)) {
                value = value.map((function(v) {
                    return getFunctionValue(v, animatable);
                }));
                if (value.length === 1) value = value[0];
            }
            t[p] = value;
        }
        t.duration = parseFloat(t.duration);
        t.delay = parseFloat(t.delay);
        return t;
    }
    function normalizeTweens(prop, animatable) {
        var previousTween;
        return prop.tweens.map((function(t) {
            var tween = normalizeTweenValues(t, animatable);
            var tweenValue = tween.value;
            var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
            var toUnit = getUnit(to);
            var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
            var previousValue = previousTween ? previousTween.to.original : originalValue;
            var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
            var fromUnit = getUnit(from) || getUnit(originalValue);
            var unit = toUnit || fromUnit;
            if (is.und(to)) to = previousValue;
            tween.from = decomposeValue(from, unit);
            tween.to = decomposeValue(getRelativeValue(to, from), unit);
            tween.start = previousTween ? previousTween.end : 0;
            tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
            tween.easing = parseEasings(tween.easing, tween.duration);
            tween.isPath = is.pth(tweenValue);
            tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
            tween.isColor = is.col(tween.from.original);
            if (tween.isColor) tween.round = 1;
            previousTween = tween;
            return tween;
        }));
    }
    var setProgressValue = {
        css: function(t, p, v) {
            return t.style[p] = v;
        },
        attribute: function(t, p, v) {
            return t.setAttribute(p, v);
        },
        object: function(t, p, v) {
            return t[p] = v;
        },
        transform: function(t, p, v, transforms, manual) {
            transforms.list.set(p, v);
            if (p === transforms.last || manual) {
                var str = "";
                transforms.list.forEach((function(value, prop) {
                    str += prop + "(" + value + ") ";
                }));
                t.style.transform = str;
            }
        }
    };
    function setTargetsValue(targets, properties) {
        var animatables = getAnimatables(targets);
        animatables.forEach((function(animatable) {
            for (var property in properties) {
                var value = getFunctionValue(properties[property], animatable);
                var target = animatable.target;
                var valueUnit = getUnit(value);
                var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
                var unit = valueUnit || getUnit(originalValue);
                var to = getRelativeValue(validateValue(value, unit), originalValue);
                var animType = getAnimationType(target, property);
                setProgressValue[animType](target, property, to, animatable.transforms, true);
            }
        }));
    }
    function createAnimation(animatable, prop) {
        var animType = getAnimationType(animatable.target, prop.name);
        if (animType) {
            var tweens = normalizeTweens(prop, animatable);
            var lastTween = tweens[tweens.length - 1];
            return {
                type: animType,
                property: prop.name,
                animatable,
                tweens,
                duration: lastTween.end,
                delay: tweens[0].delay,
                endDelay: lastTween.endDelay
            };
        }
    }
    function getAnimations(animatables, properties) {
        return filterArray(flattenArray(animatables.map((function(animatable) {
            return properties.map((function(prop) {
                return createAnimation(animatable, prop);
            }));
        }))), (function(a) {
            return !is.und(a);
        }));
    }
    function getInstanceTimings(animations, tweenSettings) {
        var animLength = animations.length;
        var getTlOffset = function(anim) {
            return anim.timelineOffset ? anim.timelineOffset : 0;
        };
        var timings = {};
        timings.duration = animLength ? Math.max.apply(Math, animations.map((function(anim) {
            return getTlOffset(anim) + anim.duration;
        }))) : tweenSettings.duration;
        timings.delay = animLength ? Math.min.apply(Math, animations.map((function(anim) {
            return getTlOffset(anim) + anim.delay;
        }))) : tweenSettings.delay;
        timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map((function(anim) {
            return getTlOffset(anim) + anim.duration - anim.endDelay;
        }))) : tweenSettings.endDelay;
        return timings;
    }
    var instanceID = 0;
    function createNewInstance(params) {
        var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
        var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
        var properties = getProperties(tweenSettings, params);
        var animatables = getAnimatables(params.targets);
        var animations = getAnimations(animatables, properties);
        var timings = getInstanceTimings(animations, tweenSettings);
        var id = instanceID;
        instanceID++;
        return mergeObjects(instanceSettings, {
            id,
            children: [],
            animatables,
            animations,
            duration: timings.duration,
            delay: timings.delay,
            endDelay: timings.endDelay
        });
    }
    var activeInstances = [];
    var engine = function() {
        var raf;
        function play() {
            if (!raf && (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) && activeInstances.length > 0) raf = requestAnimationFrame(step);
        }
        function step(t) {
            var activeInstancesLength = activeInstances.length;
            var i = 0;
            while (i < activeInstancesLength) {
                var activeInstance = activeInstances[i];
                if (!activeInstance.paused) {
                    activeInstance.tick(t);
                    i++;
                } else {
                    activeInstances.splice(i, 1);
                    activeInstancesLength--;
                }
            }
            raf = i > 0 ? requestAnimationFrame(step) : void 0;
        }
        function handleVisibilityChange() {
            if (!anime.suspendWhenDocumentHidden) return;
            if (isDocumentHidden()) raf = cancelAnimationFrame(raf); else {
                activeInstances.forEach((function(instance) {
                    return instance._onDocumentVisibility();
                }));
                engine();
            }
        }
        if (typeof document !== "undefined") document.addEventListener("visibilitychange", handleVisibilityChange);
        return play;
    }();
    function isDocumentHidden() {
        return !!document && document.hidden;
    }
    function anime(params) {
        if (params === void 0) params = {};
        var startTime = 0, lastTime = 0, now = 0;
        var children, childrenLength = 0;
        var resolve = null;
        function makePromise(instance) {
            var promise = window.Promise && new Promise((function(_resolve) {
                return resolve = _resolve;
            }));
            instance.finished = promise;
            return promise;
        }
        var instance = createNewInstance(params);
        makePromise(instance);
        function toggleInstanceDirection() {
            var direction = instance.direction;
            if (direction !== "alternate") instance.direction = direction !== "normal" ? "normal" : "reverse";
            instance.reversed = !instance.reversed;
            children.forEach((function(child) {
                return child.reversed = instance.reversed;
            }));
        }
        function adjustTime(time) {
            return instance.reversed ? instance.duration - time : time;
        }
        function resetTime() {
            startTime = 0;
            lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
        }
        function seekChild(time, child) {
            if (child) child.seek(time - child.timelineOffset);
        }
        function syncInstanceChildren(time) {
            if (!instance.reversePlayback) for (var i = 0; i < childrenLength; i++) seekChild(time, children[i]); else for (var i$1 = childrenLength; i$1--; ) seekChild(time, children[i$1]);
        }
        function setAnimationsProgress(insTime) {
            var i = 0;
            var animations = instance.animations;
            var animationsLength = animations.length;
            while (i < animationsLength) {
                var anim = animations[i];
                var animatable = anim.animatable;
                var tweens = anim.tweens;
                var tweenLength = tweens.length - 1;
                var tween = tweens[tweenLength];
                if (tweenLength) tween = filterArray(tweens, (function(t) {
                    return insTime < t.end;
                }))[0] || tween;
                var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
                var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
                var strings = tween.to.strings;
                var round = tween.round;
                var numbers = [];
                var toNumbersLength = tween.to.numbers.length;
                var progress = void 0;
                for (var n = 0; n < toNumbersLength; n++) {
                    var value = void 0;
                    var toNumber = tween.to.numbers[n];
                    var fromNumber = tween.from.numbers[n] || 0;
                    if (!tween.isPath) value = fromNumber + eased * (toNumber - fromNumber); else value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
                    if (round) if (!(tween.isColor && n > 2)) value = Math.round(value * round) / round;
                    numbers.push(value);
                }
                var stringsLength = strings.length;
                if (!stringsLength) progress = numbers[0]; else {
                    progress = strings[0];
                    for (var s = 0; s < stringsLength; s++) {
                        strings[s];
                        var b = strings[s + 1];
                        var n$1 = numbers[s];
                        if (!isNaN(n$1)) if (!b) progress += n$1 + " "; else progress += n$1 + b;
                    }
                }
                setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
                anim.currentValue = progress;
                i++;
            }
        }
        function setCallback(cb) {
            if (instance[cb] && !instance.passThrough) instance[cb](instance);
        }
        function countIteration() {
            if (instance.remaining && instance.remaining !== true) instance.remaining--;
        }
        function setInstanceProgress(engineTime) {
            var insDuration = instance.duration;
            var insDelay = instance.delay;
            var insEndDelay = insDuration - instance.endDelay;
            var insTime = adjustTime(engineTime);
            instance.progress = minMax(insTime / insDuration * 100, 0, 100);
            instance.reversePlayback = insTime < instance.currentTime;
            if (children) syncInstanceChildren(insTime);
            if (!instance.began && instance.currentTime > 0) {
                instance.began = true;
                setCallback("begin");
            }
            if (!instance.loopBegan && instance.currentTime > 0) {
                instance.loopBegan = true;
                setCallback("loopBegin");
            }
            if (insTime <= insDelay && instance.currentTime !== 0) setAnimationsProgress(0);
            if (insTime >= insEndDelay && instance.currentTime !== insDuration || !insDuration) setAnimationsProgress(insDuration);
            if (insTime > insDelay && insTime < insEndDelay) {
                if (!instance.changeBegan) {
                    instance.changeBegan = true;
                    instance.changeCompleted = false;
                    setCallback("changeBegin");
                }
                setCallback("change");
                setAnimationsProgress(insTime);
            } else if (instance.changeBegan) {
                instance.changeCompleted = true;
                instance.changeBegan = false;
                setCallback("changeComplete");
            }
            instance.currentTime = minMax(insTime, 0, insDuration);
            if (instance.began) setCallback("update");
            if (engineTime >= insDuration) {
                lastTime = 0;
                countIteration();
                if (!instance.remaining) {
                    instance.paused = true;
                    if (!instance.completed) {
                        instance.completed = true;
                        setCallback("loopComplete");
                        setCallback("complete");
                        if (!instance.passThrough && "Promise" in window) {
                            resolve();
                            makePromise(instance);
                        }
                    }
                } else {
                    startTime = now;
                    setCallback("loopComplete");
                    instance.loopBegan = false;
                    if (instance.direction === "alternate") toggleInstanceDirection();
                }
            }
        }
        instance.reset = function() {
            var direction = instance.direction;
            instance.passThrough = false;
            instance.currentTime = 0;
            instance.progress = 0;
            instance.paused = true;
            instance.began = false;
            instance.loopBegan = false;
            instance.changeBegan = false;
            instance.completed = false;
            instance.changeCompleted = false;
            instance.reversePlayback = false;
            instance.reversed = direction === "reverse";
            instance.remaining = instance.loop;
            children = instance.children;
            childrenLength = children.length;
            for (var i = childrenLength; i--; ) instance.children[i].reset();
            if (instance.reversed && instance.loop !== true || direction === "alternate" && instance.loop === 1) instance.remaining++;
            setAnimationsProgress(instance.reversed ? instance.duration : 0);
        };
        instance._onDocumentVisibility = resetTime;
        instance.set = function(targets, properties) {
            setTargetsValue(targets, properties);
            return instance;
        };
        instance.tick = function(t) {
            now = t;
            if (!startTime) startTime = now;
            setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
        };
        instance.seek = function(time) {
            setInstanceProgress(adjustTime(time));
        };
        instance.pause = function() {
            instance.paused = true;
            resetTime();
        };
        instance.play = function() {
            if (!instance.paused) return;
            if (instance.completed) instance.reset();
            instance.paused = false;
            activeInstances.push(instance);
            resetTime();
            engine();
        };
        instance.reverse = function() {
            toggleInstanceDirection();
            instance.completed = instance.reversed ? false : true;
            resetTime();
        };
        instance.restart = function() {
            instance.reset();
            instance.play();
        };
        instance.remove = function(targets) {
            var targetsArray = parseTargets(targets);
            removeTargetsFromInstance(targetsArray, instance);
        };
        instance.reset();
        if (instance.autoplay) instance.play();
        return instance;
    }
    function removeTargetsFromAnimations(targetsArray, animations) {
        for (var a = animations.length; a--; ) if (arrayContains(targetsArray, animations[a].animatable.target)) animations.splice(a, 1);
    }
    function removeTargetsFromInstance(targetsArray, instance) {
        var animations = instance.animations;
        var children = instance.children;
        removeTargetsFromAnimations(targetsArray, animations);
        for (var c = children.length; c--; ) {
            var child = children[c];
            var childAnimations = child.animations;
            removeTargetsFromAnimations(targetsArray, childAnimations);
            if (!childAnimations.length && !child.children.length) children.splice(c, 1);
        }
        if (!animations.length && !children.length) instance.pause();
    }
    function removeTargetsFromActiveInstances(targets) {
        var targetsArray = parseTargets(targets);
        for (var i = activeInstances.length; i--; ) {
            var instance = activeInstances[i];
            removeTargetsFromInstance(targetsArray, instance);
        }
    }
    function stagger(val, params) {
        if (params === void 0) params = {};
        var direction = params.direction || "normal";
        var easing = params.easing ? parseEasings(params.easing) : null;
        var grid = params.grid;
        var axis = params.axis;
        var fromIndex = params.from || 0;
        var fromFirst = fromIndex === "first";
        var fromCenter = fromIndex === "center";
        var fromLast = fromIndex === "last";
        var isRange = is.arr(val);
        var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
        var val2 = isRange ? parseFloat(val[1]) : 0;
        var unit = getUnit(isRange ? val[1] : val) || 0;
        var start = params.start || 0 + (isRange ? val1 : 0);
        var values = [];
        var maxValue = 0;
        return function(el, i, t) {
            if (fromFirst) fromIndex = 0;
            if (fromCenter) fromIndex = (t - 1) / 2;
            if (fromLast) fromIndex = t - 1;
            if (!values.length) {
                for (var index = 0; index < t; index++) {
                    if (!grid) values.push(Math.abs(fromIndex - index)); else {
                        var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
                        var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
                        var toX = index % grid[0];
                        var toY = Math.floor(index / grid[0]);
                        var distanceX = fromX - toX;
                        var distanceY = fromY - toY;
                        var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                        if (axis === "x") value = -distanceX;
                        if (axis === "y") value = -distanceY;
                        values.push(value);
                    }
                    maxValue = Math.max.apply(Math, values);
                }
                if (easing) values = values.map((function(val) {
                    return easing(val / maxValue) * maxValue;
                }));
                if (direction === "reverse") values = values.map((function(val) {
                    return axis ? val < 0 ? val * -1 : -val : Math.abs(maxValue - val);
                }));
            }
            var spacing = isRange ? (val2 - val1) / maxValue : val1;
            return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
        };
    }
    function timeline(params) {
        if (params === void 0) params = {};
        var tl = anime(params);
        tl.duration = 0;
        tl.add = function(instanceParams, timelineOffset) {
            var tlIndex = activeInstances.indexOf(tl);
            var children = tl.children;
            if (tlIndex > -1) activeInstances.splice(tlIndex, 1);
            function passThrough(ins) {
                ins.passThrough = true;
            }
            for (var i = 0; i < children.length; i++) passThrough(children[i]);
            var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
            insParams.targets = insParams.targets || params.targets;
            var tlDuration = tl.duration;
            insParams.autoplay = false;
            insParams.direction = tl.direction;
            insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
            passThrough(tl);
            tl.seek(insParams.timelineOffset);
            var ins = anime(insParams);
            passThrough(ins);
            children.push(ins);
            var timings = getInstanceTimings(children, params);
            tl.delay = timings.delay;
            tl.endDelay = timings.endDelay;
            tl.duration = timings.duration;
            tl.seek(0);
            tl.reset();
            if (tl.autoplay) tl.play();
            return tl;
        };
        return tl;
    }
    anime.version = "3.2.1";
    anime.speed = 1;
    anime.suspendWhenDocumentHidden = true;
    anime.running = activeInstances;
    anime.remove = removeTargetsFromActiveInstances;
    anime.get = getOriginalTargetValue;
    anime.set = setTargetsValue;
    anime.convertPx = convertPxToUnit;
    anime.path = getPath;
    anime.setDashoffset = setDashoffset;
    anime.stagger = stagger;
    anime.timeline = timeline;
    anime.easing = parseEasings;
    anime.penner = penner;
    anime.random = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const anime_es = anime;
    class FadeInObserver {
        constructor(selector, options = {}) {
            this.elements = document.querySelectorAll(selector);
            this.options = options;
            this.init();
        }
        init() {
            const defaultOptions = {
                threshold: .5,
                rootMargin: "0px",
                duration: 800,
                delay: 200,
                easing: "easeOutQuad",
                distance: 20
            };
            const config = {
                ...defaultOptions,
                ...this.options
            };
            const observer = new IntersectionObserver(this.handleIntersection.bind(this, config), {
                rootMargin: config.rootMargin,
                threshold: config.threshold
            });
            this.elements.forEach((element => {
                this.prepareElement(element, config);
                observer.observe(element);
            }));
        }
        prepareElement(element, config) {
            element.style.opacity = "0";
            element.classList.add("fade-in-hidden");
        }
        handleIntersection(config, entries, observer) {
            entries.forEach((entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target, config);
                    observer.unobserve(entry.target);
                }
            }));
        }
        animateElement(element, config) {
            anime_es({
                targets: element,
                opacity: [ 0, 1 ],
                translateY: [ config.distance, 0 ],
                duration: config.duration,
                delay: config.delay,
                easing: config.easing
            });
        }
    }
    function initAccordion(accordionContainer) {
        const items = accordionContainer.querySelectorAll(".accordion-item");
        function closeAllItems() {
            items.forEach((item => {
                item.classList.remove("open");
                const content = item.querySelector(".accordion-content");
                if (content) {
                    content.style.maxHeight = 0;
                    content.style.paddingTop = "0";
                    content.style.paddingBottom = "0";
                }
            }));
        }
        items.forEach((item => {
            const btn = item.querySelector(".accordion-btn");
            const content = item.querySelector(".accordion-content");
            if (!btn || !content) return;
            btn.addEventListener("click", (() => {
                if (item.classList.contains("open")) {
                    item.classList.remove("open");
                    content.style.maxHeight = 0;
                    content.style.paddingTop = "0";
                    content.style.paddingBottom = "0";
                } else {
                    closeAllItems();
                    item.classList.add("open");
                    content.style.maxHeight = content.scrollHeight + "px";
                    content.style.paddingTop = "";
                    content.style.paddingBottom = "";
                }
            }));
        }));
    }
    function initTimer(element, hours, minutes, seconds) {
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const initialTotal = totalSeconds;
        function formatTime(num) {
            return num < 10 ? "0" + num : num;
        }
        function updateDisplay(remainingSeconds) {
            const h = Math.floor(remainingSeconds / 3600);
            const m = Math.floor(remainingSeconds % 3600 / 60);
            const s = remainingSeconds % 60;
            const timeString = `${h}:${formatTime(m)}:${formatTime(s)}`;
            element.textContent = timeString;
        }
        updateDisplay(totalSeconds);
        const intervalId = setInterval((() => {
            totalSeconds--;
            if (totalSeconds < 0) totalSeconds = initialTotal;
            updateDisplay(totalSeconds);
        }), 1e3);
        return {
            stop() {
                clearInterval(intervalId);
            }
        };
    }
    document.addEventListener("DOMContentLoaded", (() => {
        const preloaderElement = document.getElementById("preloader");
        const contentElement = document.getElementById("content");
        const preloader = new Preloader(preloaderElement, contentElement);
        window.onload = function() {
            preloader.hide();
        };
        const accordions = document.querySelectorAll(".accordion");
        accordions.forEach((accordion => {
            initAccordion(accordion);
        }));
        const timerElement = document.querySelector("#timer");
        initTimer(timerElement, 2, 25, 45);
        const timerTemplate = document.querySelector("#timer-template");
        initTimer(timerTemplate, 2, 25, 45);
        const popup = new Modal("#popup");
        const openPopupButtons = document.querySelectorAll(".open-popup");
        openPopupButtons.forEach((button => {
            button.addEventListener("click", (() => {
                popup.openModal();
            }));
        }));
        new FadeInObserver(".fade-in", {
            duration: 800,
            distance: 65,
            delay: 125
        });
    }));
})();