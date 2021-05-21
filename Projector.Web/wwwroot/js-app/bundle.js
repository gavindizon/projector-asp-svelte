
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind$1(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.37.0 */

    function create_fragment$n(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.37.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults$1 = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults$1.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults$1.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults$1.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults$1;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    /* src\shared\Navbar.svelte generated by Svelte v3.37.0 */
    const file$k = "src\\shared\\Navbar.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (30:20) {:else}
    function create_else_block$1(ctx) {
    	let li;
    	let a;
    	let t_value = /*item*/ ctx[2].label + "";
    	let t;
    	let a_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			a = claim_element(li_nodes, "A", { href: true, style: true, class: true });
    			var a_nodes = children(a);
    			t = claim_text(a_nodes, t_value);
    			a_nodes.forEach(detach_dev);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", "../");
    			attr_dev(a, "style", a_style_value = "" + (/*item*/ ctx[2].style + " color: white;"));
    			attr_dev(a, "class", "svelte-1n9aogj");
    			add_location(a, file$k, 30, 28, 824);
    			attr_dev(li, "class", "svelte-1n9aogj");
    			add_location(li, file$k, 30, 24, 820);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*logout*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[2].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*items*/ 1 && a_style_value !== (a_style_value = "" + (/*item*/ ctx[2].style + " color: white;"))) {
    				attr_dev(a, "style", a_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(30:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:20) {#if item.clientAction === true}
    function create_if_block$8(ctx) {
    	let li;
    	let a;
    	let t_value = /*item*/ ctx[2].label + "";
    	let t;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			a = claim_element(li_nodes, "A", { href: true, style: true, class: true });
    			var a_nodes = children(a);
    			t = claim_text(a_nodes, t_value);
    			a_nodes.forEach(detach_dev);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[2].clientRoute);
    			set_style(a, "color", "white");
    			attr_dev(a, "class", "svelte-1n9aogj");
    			add_location(a, file$k, 28, 28, 682);
    			attr_dev(li, "class", "svelte-1n9aogj");
    			add_location(li, file$k, 28, 24, 678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[2].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*items*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[2].clientRoute)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(28:20) {#if item.clientAction === true}",
    		ctx
    	});

    	return block;
    }

    // (27:16) {#each items as item}
    function create_each_block$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[2].clientAction === true) return create_if_block$8;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(27:16) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let nav;
    	let h1;
    	let a;
    	let t0;
    	let t1;
    	let div;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			h1 = element("h1");
    			a = element("a");
    			t0 = text("The Projector");
    			t1 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			nav = claim_element(nodes, "NAV", { class: true });
    			var nav_nodes = children(nav);
    			h1 = claim_element(nav_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			a = claim_element(h1_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			t0 = claim_text(a_nodes, "The Projector");
    			a_nodes.forEach(detach_dev);
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nav_nodes);
    			div = claim_element(nav_nodes, "DIV", {});
    			var div_nodes = children(div);
    			ul = claim_element(div_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", "/app/");
    			attr_dev(a, "class", "svelte-1n9aogj");
    			add_location(a, file$k, 23, 12, 479);
    			attr_dev(h1, "class", "svelte-1n9aogj");
    			add_location(h1, file$k, 23, 8, 475);
    			attr_dev(ul, "class", "svelte-1n9aogj");
    			add_location(ul, file$k, 25, 12, 555);
    			add_location(div, file$k, 24, 8, 536);
    			attr_dev(nav, "class", "svelte-1n9aogj");
    			add_location(nav, file$k, 22, 4, 460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, h1);
    			append_dev(h1, a);
    			append_dev(a, t0);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, logout*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	let { items } = $$props;

    	const logout = async () => {
    		try {
    			const res = await axios({
    				method: "POST",
    				withCredentials: true,
    				url: `${"https://localhost:44390/"}logout`
    			});

    			window.location.assign("/");
    		} catch(err) {
    			alert(err);
    		}
    	};

    	const writable_props = ["items"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({ link, axios, items, logout });

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, logout];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { items: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !("items" in props)) {
    			console.warn("<Navbar> was created without expected prop 'items'");
    		}
    	}

    	get items() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /**
     * Click Outside
     * @param {Node} node
     */
    var ClickOutside = (node, _options = {}) => {
      const options = { include: [], ..._options };

      function detect({ target }) {
        if (!node.contains(target) || options.include.some((i) => target.isSameNode(i))) {
          node.dispatchEvent(new CustomEvent('clickOutside'));
        }
      }
      document.addEventListener('click', detect, { passive: true, capture: true });
      return {
        destroy() {
          document.removeEventListener('click', detect);
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\MaterialApp\MaterialApp.svelte generated by Svelte v3.37.0 */

    const file$j = "node_modules\\svelte-materialify\\dist\\components\\MaterialApp\\MaterialApp.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file$j, 12, 0, 203001);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MaterialApp", slots, ['default']);
    	let { theme = "light" } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format$1(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format$1(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format$1(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Icon\Icon.svelte generated by Svelte v3.37.0 */
    const file$i = "node_modules\\svelte-materialify\\dist\\components\\Icon\\Icon.svelte";

    // (34:2) {#if path}
    function create_if_block$7(ctx) {
    	let svg;
    	let path_1;
    	let svg_viewBox_value;
    	let if_block = /*label*/ ctx[10] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					xmlns: true,
    					width: true,
    					height: true,
    					viewBox: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path_1 = claim_element(svg_nodes, "path", { d: true }, 1);
    			var path_1_nodes = children(path_1);
    			if (if_block) if_block.l(path_1_nodes);
    			path_1_nodes.forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path_1, "d", /*path*/ ctx[9]);
    			add_location(path_1, file$i, 39, 6, 1586);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5]);
    			add_location(svg, file$i, 34, 4, 1454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);
    			if (if_block) if_block.m(path_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(path_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*path*/ 512) {
    				attr_dev(path_1, "d", /*path*/ ctx[9]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*viewWidth, viewHeight*/ 48 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(34:2) {#if path}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {#if label}
    function create_if_block_1$4(ctx) {
    	let title;
    	let t;

    	const block = {
    		c: function create() {
    			title = svg_element("title");
    			t = text(/*label*/ ctx[10]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			title = claim_element(nodes, "title", {}, 1);
    			var title_nodes = children(title);
    			t = claim_text(title_nodes, /*label*/ ctx[10]);
    			title_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(title, file$i, 41, 10, 1634);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1024) set_data_dev(t, /*label*/ ctx[10]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(41:8) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let i;
    	let t;
    	let i_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*path*/ ctx[9] && create_if_block$7(ctx);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", {
    				"aria-hidden": true,
    				class: true,
    				"aria-label": true,
    				"aria-disabled": true,
    				style: true
    			});

    			var i_nodes = children(i);
    			if (if_block) if_block.l(i_nodes);
    			t = claim_space(i_nodes);
    			if (default_slot) default_slot.l(i_nodes);
    			i_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "s-icon " + /*klass*/ ctx[2]);
    			attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			attr_dev(i, "style", /*style*/ ctx[11]);
    			toggle_class(i, "spin", /*spin*/ ctx[7]);
    			toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			add_location(i, file$i, 24, 0, 1222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			if (if_block) if_block.m(i, null);
    			append_dev(i, t);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, i, {
    					"icon-size": /*size*/ ctx[3],
    					"icon-rotate": `${/*rotate*/ ctx[6]}deg`
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*path*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(i, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 4 && i_class_value !== (i_class_value = "s-icon " + /*klass*/ ctx[2])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*label*/ 1024) {
    				attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			}

    			if (!current || dirty & /*disabled*/ 256) {
    				attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			}

    			if (!current || dirty & /*style*/ 2048) {
    				attr_dev(i, "style", /*style*/ ctx[11]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*size, rotate*/ 72) Style_action.update.call(null, {
    				"icon-size": /*size*/ ctx[3],
    				"icon-rotate": `${/*rotate*/ ctx[6]}deg`
    			});

    			if (dirty & /*klass, spin*/ 132) {
    				toggle_class(i, "spin", /*spin*/ ctx[7]);
    			}

    			if (dirty & /*klass, disabled*/ 260) {
    				toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { size = "24px" } = $$props;
    	let { width = size } = $$props;
    	let { height = size } = $$props;
    	let { viewWidth = "24" } = $$props;
    	let { viewHeight = "24" } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let { disabled = false } = $$props;
    	let { path = null } = $$props;
    	let { label = null } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"size",
    		"width",
    		"height",
    		"viewWidth",
    		"viewHeight",
    		"rotate",
    		"spin",
    		"disabled",
    		"path",
    		"label",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(2, klass = $$props.class);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("viewWidth" in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ("viewHeight" in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ("rotate" in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("label" in $$props) $$invalidate(10, label = $$props.label);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		size,
    		width,
    		height,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$props.klass);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("viewWidth" in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ("viewHeight" in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ("rotate" in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("label" in $$props) $$invalidate(10, label = $$props.label);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*size*/ 8) {
    			{
    				$$invalidate(0, width = size);
    				$$invalidate(1, height = size);
    			}
    		}
    	};

    	return [
    		width,
    		height,
    		klass,
    		size,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			class: 2,
    			size: 3,
    			width: 0,
    			height: 1,
    			viewWidth: 4,
    			viewHeight: 5,
    			rotate: 6,
    			spin: 7,
    			disabled: 8,
    			path: 9,
    			label: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewWidth() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewWidth(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewHeight() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewHeight(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const filter = (classes) => classes.filter((x) => !!x);
    const format = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format(klass));
            else if (classes[i]) node.classList.remove(...format(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Button\Button.svelte generated by Svelte v3.37.0 */
    const file$h = "node_modules\\svelte-materialify\\dist\\components\\Button\\Button.svelte";

    function create_fragment$i(ctx) {
    	let button_1;
    	let span;
    	let button_1_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let button_1_levels = [
    		{
    			class: button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1]
    		},
    		{ type: /*type*/ ctx[14] },
    		{ style: /*style*/ ctx[16] },
    		{ disabled: /*disabled*/ ctx[11] },
    		{ "aria-disabled": /*disabled*/ ctx[11] },
    		/*$$restProps*/ ctx[17]
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button_1 = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			button_1 = claim_element(nodes, "BUTTON", {
    				class: true,
    				type: true,
    				style: true,
    				disabled: true,
    				"aria-disabled": true
    			});

    			var button_1_nodes = children(button_1);
    			span = claim_element(button_1_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			if (default_slot) default_slot.l(span_nodes);
    			span_nodes.forEach(detach_dev);
    			button_1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$h, 46, 2, 5233);
    			set_attributes(button_1, button_1_data);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    			add_location(button_1, file$h, 26, 0, 4783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*button_1_binding*/ ctx[21](button_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button_1, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button_1, /*ripple*/ ctx[15])),
    					listen_dev(button_1, "click", /*click_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
    				}
    			}

    			set_attributes(button_1, button_1_data = get_spread_update(button_1_levels, [
    				(!current || dirty & /*size, klass*/ 34 && button_1_class_value !== (button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1])) && { class: button_1_class_value },
    				(!current || dirty & /*type*/ 16384) && { type: /*type*/ ctx[14] },
    				(!current || dirty & /*style*/ 65536) && { style: /*style*/ ctx[16] },
    				(!current || dirty & /*disabled*/ 2048) && { disabled: /*disabled*/ ctx[11] },
    				(!current || dirty & /*disabled*/ 2048) && { "aria-disabled": /*disabled*/ ctx[11] },
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 12288) Class_action.update.call(null, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 32768) Ripple_action.update.call(null, /*ripple*/ ctx[15]);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style","button"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = "default" } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { type = "button" } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;
    	let { button = null } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			button = $$value;
    			$$invalidate(0, button);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(1, klass = $$new_props.class);
    		if ("fab" in $$new_props) $$invalidate(2, fab = $$new_props.fab);
    		if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ("block" in $$new_props) $$invalidate(4, block = $$new_props.block);
    		if ("size" in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ("tile" in $$new_props) $$invalidate(6, tile = $$new_props.tile);
    		if ("text" in $$new_props) $$invalidate(7, text = $$new_props.text);
    		if ("depressed" in $$new_props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ("outlined" in $$new_props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("disabled" in $$new_props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("activeClass" in $$new_props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ("type" in $$new_props) $$invalidate(14, type = $$new_props.type);
    		if ("ripple" in $$new_props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ("style" in $$new_props) $$invalidate(16, style = $$new_props.style);
    		if ("button" in $$new_props) $$invalidate(0, button = $$new_props.button);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		button
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$new_props.klass);
    		if ("fab" in $$props) $$invalidate(2, fab = $$new_props.fab);
    		if ("icon" in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ("block" in $$props) $$invalidate(4, block = $$new_props.block);
    		if ("size" in $$props) $$invalidate(5, size = $$new_props.size);
    		if ("tile" in $$props) $$invalidate(6, tile = $$new_props.tile);
    		if ("text" in $$props) $$invalidate(7, text = $$new_props.text);
    		if ("depressed" in $$props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ("outlined" in $$props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("disabled" in $$props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("activeClass" in $$props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ("type" in $$props) $$invalidate(14, type = $$new_props.type);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ("style" in $$props) $$invalidate(16, style = $$new_props.style);
    		if ("button" in $$props) $$invalidate(0, button = $$new_props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		button,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		button_1_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			class: 1,
    			fab: 2,
    			icon: 3,
    			block: 4,
    			size: 5,
    			tile: 6,
    			text: 7,
    			depressed: 8,
    			outlined: 9,
    			rounded: 10,
    			disabled: 11,
    			active: 12,
    			activeClass: 13,
    			type: 14,
    			ripple: 15,
    			style: 16,
    			button: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\ItemGroup\ItemGroup.svelte generated by Svelte v3.37.0 */
    const file$g = "node_modules\\svelte-materialify\\dist\\components\\ItemGroup\\ItemGroup.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, role: true, style: true });
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "s-item-group " + /*klass*/ ctx[0]);
    			attr_dev(div, "role", /*role*/ ctx[1]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			add_location(div, file$g, 53, 0, 1510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-item-group " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*role*/ 2) {
    				attr_dev(div, "role", /*role*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ITEM_GROUP = {};

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemGroup", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { role = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const valueStore = writable(value);
    	let startIndex = -1;

    	setContext(ITEM_GROUP, {
    		select: val => {
    			if (multiple) {
    				if (value.includes(val)) {
    					if (!mandatory || value.length > 1) {
    						value.splice(value.indexOf(val), 1);
    						$$invalidate(3, value);
    					}
    				} else if (value.length < max) $$invalidate(3, value = [...value, val]);
    			} else if (value === val) {
    				if (!mandatory) $$invalidate(3, value = null);
    			} else $$invalidate(3, value = val);
    		},
    		register: setValue => {
    			const u = valueStore.subscribe(val => {
    				setValue(multiple ? val : [val]);
    			});

    			onDestroy(u);
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		},
    		activeClass
    	});

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max",
    		"role",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ITEM_GROUP,
    		setContext,
    		createEventDispatcher,
    		onDestroy,
    		writable,
    		klass,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		role,
    		style,
    		dispatch,
    		valueStore,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("startIndex" in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 8) {
    			valueStore.set(value);
    		}

    		if ($$self.$$.dirty & /*value*/ 8) {
    			dispatch("change", value);
    		}
    	};

    	return [
    		klass,
    		role,
    		style,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		$$scope,
    		slots
    	];
    }

    class ItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			class: 0,
    			activeClass: 4,
    			value: 3,
    			multiple: 5,
    			mandatory: 6,
    			max: 7,
    			role: 1,
    			style: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemGroup",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get class() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (/^(lighten|darken|accent)-/.test(i)) {
          return `text-${i}`;
        }
        return `${i}-text`;
      });
    }

    function setTextColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.color = text;
        return false;
      }
      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.color = `var(${text})`;
        return false;
      }
      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var TextColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setTextColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.color = null;
          }

          if (typeof newText === 'string') {
            klass = setTextColor(node, newText);
          }
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Input\Input.svelte generated by Svelte v3.37.0 */
    const file$f = "node_modules\\svelte-materialify\\dist\\components\\Input\\Input.svelte";
    const get_append_outer_slot_changes$3 = dirty => ({});
    const get_append_outer_slot_context$3 = ctx => ({});
    const get_messages_slot_changes = dirty => ({});
    const get_messages_slot_context = ctx => ({});
    const get_prepend_outer_slot_changes$3 = dirty => ({});
    const get_prepend_outer_slot_context$3 = ctx => ({});

    function create_fragment$g(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let TextColor_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_outer_slot_template = /*#slots*/ ctx[9]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_prepend_outer_slot_context$3);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const messages_slot_template = /*#slots*/ ctx[9].messages;
    	const messages_slot = create_slot(messages_slot_template, ctx, /*$$scope*/ ctx[8], get_messages_slot_context);
    	const append_outer_slot_template = /*#slots*/ ctx[9]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_append_outer_slot_context$3);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_outer_slot) prepend_outer_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (messages_slot) messages_slot.c();
    			t2 = space();
    			if (append_outer_slot) append_outer_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div3 = claim_element(nodes, "DIV", { class: true, style: true });
    			var div3_nodes = children(div3);
    			if (prepend_outer_slot) prepend_outer_slot.l(div3_nodes);
    			t0 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			if (messages_slot) messages_slot.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			if (append_outer_slot) append_outer_slot.l(div3_nodes);
    			div3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "s-input__slot");
    			add_location(div0, file$f, 27, 4, 8662);
    			attr_dev(div1, "class", "s-input__details");
    			add_location(div1, file$f, 30, 4, 8720);
    			attr_dev(div2, "class", "s-input__control");
    			add_location(div2, file$f, 26, 2, 8627);
    			attr_dev(div3, "class", div3_class_value = "s-input " + /*klass*/ ctx[0]);
    			attr_dev(div3, "style", /*style*/ ctx[7]);
    			toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			toggle_class(div3, "error", /*error*/ ctx[5]);
    			toggle_class(div3, "success", /*success*/ ctx[6]);
    			toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			add_location(div3, file$f, 16, 0, 8409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (messages_slot) {
    				messages_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_outer_slot) {
    				append_outer_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(TextColor_action = TextColor.call(null, div3, /*success*/ ctx[6]
    				? "success"
    				: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_prepend_outer_slot_changes$3, get_prepend_outer_slot_context$3);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (messages_slot) {
    				if (messages_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(messages_slot, messages_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_messages_slot_changes, get_messages_slot_context);
    				}
    			}

    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_append_outer_slot_changes$3, get_append_outer_slot_context$3);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div3_class_value !== (div3_class_value = "s-input " + /*klass*/ ctx[0])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div3, "style", /*style*/ ctx[7]);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*success, error, color*/ 98) TextColor_action.update.call(null, /*success*/ ctx[6]
    			? "success"
    			: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]);

    			if (dirty & /*klass, dense*/ 5) {
    				toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			}

    			if (dirty & /*klass, error*/ 33) {
    				toggle_class(div3, "error", /*error*/ ctx[5]);
    			}

    			if (dirty & /*klass, success*/ 65) {
    				toggle_class(div3, "success", /*success*/ ctx[6]);
    			}

    			if (dirty & /*klass, readonly*/ 9) {
    				toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			transition_in(default_slot, local);
    			transition_in(messages_slot, local);
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			transition_out(default_slot, local);
    			transition_out(messages_slot, local);
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (messages_slot) messages_slot.d(detaching);
    			if (append_outer_slot) append_outer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, ['prepend-outer','default','messages','append-outer']);
    	let { class: klass = "" } = $$props;
    	let { color = null } = $$props;
    	let { dense = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "color", "dense", "readonly", "disabled", "error", "success", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TextColor,
    		klass,
    		color,
    		dense,
    		readonly,
    		disabled,
    		error,
    		success,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, color, dense, readonly, disabled, error, success, style, $$scope, slots];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 0,
    			color: 1,
    			dense: 2,
    			readonly: 3,
    			disabled: 4,
    			error: 5,
    			success: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    var uid = (len) => {
      let str = '';
      let num = len || 11;
      while (num--) str += HEX[(Math.random() * 36) | 0];
      return str;
    };

    var closeIcon = 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z';

    /* node_modules\svelte-materialify\dist\components\TextField\TextField.svelte generated by Svelte v3.37.0 */
    const file$e = "node_modules\\svelte-materialify\\dist\\components\\TextField\\TextField.svelte";
    const get_append_slot_changes$2 = dirty => ({});
    const get_append_slot_context$2 = ctx => ({});
    const get_clear_icon_slot_changes$1 = dirty => ({});
    const get_clear_icon_slot_context$1 = ctx => ({});
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_prepend_slot_changes$2 = dirty => ({});
    const get_prepend_slot_context$2 = ctx => ({});
    const get_prepend_outer_slot_changes$2 = dirty => ({});
    const get_prepend_outer_slot_context$2 = ctx => ({ slot: "prepend-outer" });

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    const get_append_outer_slot_changes$2 = dirty => ({});
    const get_append_outer_slot_context$2 = ctx => ({ slot: "append-outer" });

    // (112:4) {#if clearable && value !== ''}
    function create_if_block_1$3(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const clear_icon_slot_template = /*#slots*/ ctx[33]["clear-icon"];
    	const clear_icon_slot = create_slot(clear_icon_slot_template, ctx, /*$$scope*/ ctx[43], get_clear_icon_slot_context$1);
    	const clear_icon_slot_or_fallback = clear_icon_slot || fallback_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { style: true });
    			var div_nodes = children(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(div, "cursor", "pointer");
    			add_location(div, file$e, 112, 6, 2674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (clear_icon_slot_or_fallback) {
    				clear_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clear*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (clear_icon_slot) {
    				if (clear_icon_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(clear_icon_slot, clear_icon_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_clear_icon_slot_changes$1, get_clear_icon_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clear_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clear_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(112:4) {#if clearable && value !== ''}",
    		ctx
    	});

    	return block;
    }

    // (115:32)             
    function fallback_block$3(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(icon.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(115:32)             ",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Input    class="s-text-field {klass}"    {color}    {dense}    {readonly}    {disabled}    {error}    {success}    {style}>
    function create_default_slot$8(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let label;
    	let t1;
    	let t2;
    	let input;
    	let t3;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[33].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[43], get_prepend_slot_context$2);
    	const default_slot_template = /*#slots*/ ctx[33].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);
    	const content_slot_template = /*#slots*/ ctx[33].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[43], get_content_slot_context);

    	let input_levels = [
    		{ type: "text" },
    		{ placeholder: /*placeholder*/ ctx[14] },
    		{ id: /*id*/ ctx[20] },
    		{ readOnly: /*readonly*/ ctx[12] },
    		{ disabled: /*disabled*/ ctx[13] },
    		/*$$restProps*/ ctx[28]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	let if_block = /*clearable*/ ctx[11] && /*value*/ ctx[0] !== "" && create_if_block_1$3(ctx);
    	const append_slot_template = /*#slots*/ ctx[33].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[43], get_append_slot_context$2);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div0 = element("div");
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (content_slot) content_slot.c();
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			if (append_slot) append_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			if (prepend_slot) prepend_slot.l(div1_nodes);
    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			label = claim_element(div0_nodes, "LABEL", { for: true });
    			var label_nodes = children(label);
    			if (default_slot) default_slot.l(label_nodes);
    			label_nodes.forEach(detach_dev);
    			t1 = claim_space(div0_nodes);
    			if (content_slot) content_slot.l(div0_nodes);
    			t2 = claim_space(div0_nodes);

    			input = claim_element(div0_nodes, "INPUT", {
    				type: true,
    				placeholder: true,
    				id: true,
    				readonly: true,
    				disabled: true
    			});

    			div0_nodes.forEach(detach_dev);
    			t3 = claim_space(div1_nodes);
    			if (if_block) if_block.l(div1_nodes);
    			t4 = claim_space(div1_nodes);
    			if (append_slot) append_slot.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(label, "for", /*id*/ ctx[20]);
    			toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			add_location(label, file$e, 85, 6, 2024);
    			set_attributes(input, input_data);
    			add_location(input, file$e, 90, 6, 2215);
    			attr_dev(div0, "class", "s-text-field__input");
    			add_location(div0, file$e, 84, 4, 1983);
    			attr_dev(div1, "class", "s-text-field__wrapper");
    			toggle_class(div1, "filled", /*filled*/ ctx[5]);
    			toggle_class(div1, "solo", /*solo*/ ctx[6]);
    			toggle_class(div1, "outlined", /*outlined*/ ctx[7]);
    			toggle_class(div1, "flat", /*flat*/ ctx[8]);
    			toggle_class(div1, "rounded", /*rounded*/ ctx[10]);
    			add_location(div1, file$e, 74, 2, 1768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			append_dev(div0, t1);

    			if (content_slot) {
    				content_slot.m(div0, null);
    			}

    			append_dev(div0, t2);
    			append_dev(div0, input);
    			/*input_binding*/ ctx[41](input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t4);

    			if (append_slot) {
    				append_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[42]),
    					listen_dev(input, "focus", /*onFocus*/ ctx[24], false, false, false),
    					listen_dev(input, "blur", /*onBlur*/ ctx[25], false, false, false),
    					listen_dev(input, "input", /*onInput*/ ctx[27], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[34], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[35], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[36], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[37], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[38], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[39], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[40], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_prepend_slot_changes$2, get_prepend_slot_context$2);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[43], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 1048576) {
    				attr_dev(label, "for", /*id*/ ctx[20]);
    			}

    			if (dirty[0] & /*labelActive*/ 8388608) {
    				toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			}

    			if (content_slot) {
    				if (content_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "text" },
    				(!current || dirty[0] & /*placeholder*/ 16384) && { placeholder: /*placeholder*/ ctx[14] },
    				(!current || dirty[0] & /*id*/ 1048576) && { id: /*id*/ ctx[20] },
    				(!current || dirty[0] & /*readonly*/ 4096) && { readOnly: /*readonly*/ ctx[12] },
    				(!current || dirty[0] & /*disabled*/ 8192) && { disabled: /*disabled*/ ctx[13] },
    				dirty[0] & /*$$restProps*/ 268435456 && /*$$restProps*/ ctx[28]
    			]));

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (/*clearable*/ ctx[11] && /*value*/ ctx[0] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*clearable, value*/ 2049) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t4);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_append_slot_changes$2, get_append_slot_context$2);
    				}
    			}

    			if (dirty[0] & /*filled*/ 32) {
    				toggle_class(div1, "filled", /*filled*/ ctx[5]);
    			}

    			if (dirty[0] & /*solo*/ 64) {
    				toggle_class(div1, "solo", /*solo*/ ctx[6]);
    			}

    			if (dirty[0] & /*outlined*/ 128) {
    				toggle_class(div1, "outlined", /*outlined*/ ctx[7]);
    			}

    			if (dirty[0] & /*flat*/ 256) {
    				toggle_class(div1, "flat", /*flat*/ ctx[8]);
    			}

    			if (dirty[0] & /*rounded*/ 1024) {
    				toggle_class(div1, "rounded", /*rounded*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(content_slot, local);
    			transition_in(if_block);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(content_slot, local);
    			transition_out(if_block);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (content_slot) content_slot.d(detaching);
    			/*input_binding*/ ctx[41](null);
    			if (if_block) if_block.d();
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(64:0) <Input    class=\\\"s-text-field {klass}\\\"    {color}    {dense}    {readonly}    {disabled}    {error}    {success}    {style}>",
    		ctx
    	});

    	return block;
    }

    // (74:2) 
    function create_prepend_outer_slot$2(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[33]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[43], get_prepend_outer_slot_context$2);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		l: function claim(nodes) {
    			if (prepend_outer_slot) prepend_outer_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_prepend_outer_slot_changes$2, get_prepend_outer_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot$2.name,
    		type: "slot",
    		source: "(74:2) ",
    		ctx
    	});

    	return block;
    }

    // (128:6) {#each messages as message}
    function create_each_block_1$2(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[44] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t = claim_text(span_nodes, t_value);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$e, 127, 33, 3082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*messages*/ 131072 && t_value !== (t_value = /*message*/ ctx[44] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(128:6) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {#each errorMessages.slice(0, errorCount) as message}
    function create_each_block$4(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[44] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t = claim_text(span_nodes, t_value);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$e, 128, 59, 3172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMessages, errorCount*/ 4456448 && t_value !== (t_value = /*message*/ ctx[44] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(129:6) {#each errorMessages.slice(0, errorCount) as message}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if counter}
    function create_if_block$6(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(/*counter*/ ctx[16]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t0 = claim_text(span_nodes, t0_value);
    			t1 = claim_text(span_nodes, " / ");
    			t2 = claim_text(span_nodes, /*counter*/ ctx[16]);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$e, 130, 17, 3232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && t0_value !== (t0_value = /*value*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*counter*/ 65536) set_data_dev(t2, /*counter*/ ctx[16]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(131:4) {#if counter}",
    		ctx
    	});

    	return block;
    }

    // (125:2) 
    function create_messages_slot$1(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*messages*/ ctx[17];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*errorMessages*/ ctx[22].slice(0, /*errorCount*/ ctx[18]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let if_block = /*counter*/ ctx[16] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*hint*/ ctx[15]);
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { slot: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", {});
    			var div0_nodes = children(div0);
    			span = claim_element(div0_nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t0 = claim_text(span_nodes, /*hint*/ ctx[15]);
    			span_nodes.forEach(detach_dev);
    			t1 = claim_space(div0_nodes);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div0_nodes);
    			}

    			t2 = claim_space(div0_nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t3 = claim_space(div1_nodes);
    			if (if_block) if_block.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$e, 126, 6, 3028);
    			add_location(div0, file$e, 125, 4, 3015);
    			attr_dev(div1, "slot", "messages");
    			add_location(div1, file$e, 124, 2, 2988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hint*/ 32768) set_data_dev(t0, /*hint*/ ctx[15]);

    			if (dirty[0] & /*messages*/ 131072) {
    				each_value_1 = /*messages*/ ctx[17];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*errorMessages, errorCount*/ 4456448) {
    				each_value = /*errorMessages*/ ctx[22].slice(0, /*errorCount*/ ctx[18]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*counter*/ ctx[16]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_messages_slot$1.name,
    		type: "slot",
    		source: "(125:2) ",
    		ctx
    	});

    	return block;
    }

    // (135:2) 
    function create_append_outer_slot$2(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[33]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[43], get_append_outer_slot_context$2);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		l: function claim(nodes) {
    			if (append_outer_slot) append_outer_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[43], dirty, get_append_outer_slot_changes$2, get_append_outer_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot$2.name,
    		type: "slot",
    		source: "(135:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-text-field " + /*klass*/ ctx[3],
    				color: /*color*/ ctx[4],
    				dense: /*dense*/ ctx[9],
    				readonly: /*readonly*/ ctx[12],
    				disabled: /*disabled*/ ctx[13],
    				error: /*error*/ ctx[1],
    				success: /*success*/ ctx[19],
    				style: /*style*/ ctx[21],
    				$$slots: {
    					"append-outer": [create_append_outer_slot$2],
    					messages: [create_messages_slot$1],
    					"prepend-outer": [create_prepend_outer_slot$2],
    					default: [create_default_slot$8]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(input.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty[0] & /*klass*/ 8) input_changes.class = "s-text-field " + /*klass*/ ctx[3];
    			if (dirty[0] & /*color*/ 16) input_changes.color = /*color*/ ctx[4];
    			if (dirty[0] & /*dense*/ 512) input_changes.dense = /*dense*/ ctx[9];
    			if (dirty[0] & /*readonly*/ 4096) input_changes.readonly = /*readonly*/ ctx[12];
    			if (dirty[0] & /*disabled*/ 8192) input_changes.disabled = /*disabled*/ ctx[13];
    			if (dirty[0] & /*error*/ 2) input_changes.error = /*error*/ ctx[1];
    			if (dirty[0] & /*success*/ 524288) input_changes.success = /*success*/ ctx[19];
    			if (dirty[0] & /*style*/ 2097152) input_changes.style = /*style*/ ctx[21];

    			if (dirty[0] & /*counter, value, errorMessages, errorCount, messages, hint, filled, solo, outlined, flat, rounded, clearable, placeholder, id, readonly, disabled, $$restProps, inputElement, labelActive*/ 282590693 | dirty[1] & /*$$scope*/ 4096) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let labelActive;

    	const omit_props_names = [
    		"class","value","color","filled","solo","outlined","flat","dense","rounded","clearable","readonly","disabled","placeholder","hint","counter","messages","rules","errorCount","validateOnBlur","error","success","id","style","inputElement","validate"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;

    	validate_slots("TextField", slots, [
    		'append-outer','prepend-outer','prepend','default','content','clear-icon','append'
    	]);

    	let { class: klass = "" } = $$props;
    	let { value = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { filled = false } = $$props;
    	let { solo = false } = $$props;
    	let { outlined = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { rounded = false } = $$props;
    	let { clearable = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { counter = false } = $$props;
    	let { messages = [] } = $$props;
    	let { rules = [] } = $$props;
    	let { errorCount = 1 } = $$props;
    	let { validateOnBlur = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { id = `s-input-${uid(5)}` } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	let focused = false;
    	let errorMessages = [];

    	function validate() {
    		$$invalidate(22, errorMessages = rules.map(r => r(value)).filter(r => typeof r === "string"));

    		if (errorMessages.length) $$invalidate(1, error = true); else {
    			$$invalidate(1, error = false);
    		}

    		return error;
    	}

    	function onFocus() {
    		$$invalidate(32, focused = true);
    	}

    	function onBlur() {
    		$$invalidate(32, focused = false);
    		if (validateOnBlur) validate();
    	}

    	function clear() {
    		$$invalidate(0, value = "");
    	}

    	function onInput() {
    		if (!validateOnBlur) validate();
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputElement = $$value;
    			$$invalidate(2, inputElement);
    		});
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(28, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(3, klass = $$new_props.class);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("filled" in $$new_props) $$invalidate(5, filled = $$new_props.filled);
    		if ("solo" in $$new_props) $$invalidate(6, solo = $$new_props.solo);
    		if ("outlined" in $$new_props) $$invalidate(7, outlined = $$new_props.outlined);
    		if ("flat" in $$new_props) $$invalidate(8, flat = $$new_props.flat);
    		if ("dense" in $$new_props) $$invalidate(9, dense = $$new_props.dense);
    		if ("rounded" in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("clearable" in $$new_props) $$invalidate(11, clearable = $$new_props.clearable);
    		if ("readonly" in $$new_props) $$invalidate(12, readonly = $$new_props.readonly);
    		if ("disabled" in $$new_props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ("placeholder" in $$new_props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(15, hint = $$new_props.hint);
    		if ("counter" in $$new_props) $$invalidate(16, counter = $$new_props.counter);
    		if ("messages" in $$new_props) $$invalidate(17, messages = $$new_props.messages);
    		if ("rules" in $$new_props) $$invalidate(29, rules = $$new_props.rules);
    		if ("errorCount" in $$new_props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("validateOnBlur" in $$new_props) $$invalidate(30, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$new_props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$new_props) $$invalidate(19, success = $$new_props.success);
    		if ("id" in $$new_props) $$invalidate(20, id = $$new_props.id);
    		if ("style" in $$new_props) $$invalidate(21, style = $$new_props.style);
    		if ("inputElement" in $$new_props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ("$$scope" in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Input,
    		Icon,
    		uid,
    		clearIcon: closeIcon,
    		klass,
    		value,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		rules,
    		errorCount,
    		validateOnBlur,
    		error,
    		success,
    		id,
    		style,
    		inputElement,
    		focused,
    		errorMessages,
    		validate,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		labelActive
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(3, klass = $$new_props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("filled" in $$props) $$invalidate(5, filled = $$new_props.filled);
    		if ("solo" in $$props) $$invalidate(6, solo = $$new_props.solo);
    		if ("outlined" in $$props) $$invalidate(7, outlined = $$new_props.outlined);
    		if ("flat" in $$props) $$invalidate(8, flat = $$new_props.flat);
    		if ("dense" in $$props) $$invalidate(9, dense = $$new_props.dense);
    		if ("rounded" in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("clearable" in $$props) $$invalidate(11, clearable = $$new_props.clearable);
    		if ("readonly" in $$props) $$invalidate(12, readonly = $$new_props.readonly);
    		if ("disabled" in $$props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ("placeholder" in $$props) $$invalidate(14, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(15, hint = $$new_props.hint);
    		if ("counter" in $$props) $$invalidate(16, counter = $$new_props.counter);
    		if ("messages" in $$props) $$invalidate(17, messages = $$new_props.messages);
    		if ("rules" in $$props) $$invalidate(29, rules = $$new_props.rules);
    		if ("errorCount" in $$props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("validateOnBlur" in $$props) $$invalidate(30, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$props) $$invalidate(19, success = $$new_props.success);
    		if ("id" in $$props) $$invalidate(20, id = $$new_props.id);
    		if ("style" in $$props) $$invalidate(21, style = $$new_props.style);
    		if ("inputElement" in $$props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ("focused" in $$props) $$invalidate(32, focused = $$new_props.focused);
    		if ("errorMessages" in $$props) $$invalidate(22, errorMessages = $$new_props.errorMessages);
    		if ("labelActive" in $$props) $$invalidate(23, labelActive = $$new_props.labelActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*placeholder, value*/ 16385 | $$self.$$.dirty[1] & /*focused*/ 2) {
    			$$invalidate(23, labelActive = !!placeholder || value || focused);
    		}
    	};

    	return [
    		value,
    		error,
    		inputElement,
    		klass,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		errorCount,
    		success,
    		id,
    		style,
    		errorMessages,
    		labelActive,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		$$restProps,
    		rules,
    		validateOnBlur,
    		validate,
    		focused,
    		slots,
    		focus_handler,
    		blur_handler,
    		input_handler,
    		change_handler,
    		keypress_handler,
    		keydown_handler,
    		keyup_handler,
    		input_binding,
    		input_input_handler,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$f,
    			create_fragment$f,
    			safe_not_equal,
    			{
    				class: 3,
    				value: 0,
    				color: 4,
    				filled: 5,
    				solo: 6,
    				outlined: 7,
    				flat: 8,
    				dense: 9,
    				rounded: 10,
    				clearable: 11,
    				readonly: 12,
    				disabled: 13,
    				placeholder: 14,
    				hint: 15,
    				counter: 16,
    				messages: 17,
    				rules: 29,
    				errorCount: 18,
    				validateOnBlur: 30,
    				error: 1,
    				success: 19,
    				id: 20,
    				style: 21,
    				inputElement: 2,
    				validate: 31
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get class() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearable() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counter() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counter(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messages() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messages(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rules() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rules(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorCount() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCount(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validateOnBlur() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validateOnBlur(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validate() {
    		return this.$$.ctx[31];
    	}

    	set validate(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Textarea\Textarea.svelte generated by Svelte v3.37.0 */
    const file$d = "node_modules\\svelte-materialify\\dist\\components\\Textarea\\Textarea.svelte";
    const get_append_slot_changes$1 = dirty => ({});
    const get_append_slot_context$1 = ctx => ({});
    const get_clear_icon_slot_changes = dirty => ({});
    const get_clear_icon_slot_context = ctx => ({});
    const get_prepend_slot_changes$1 = dirty => ({});
    const get_prepend_slot_context$1 = ctx => ({});
    const get_prepend_outer_slot_changes$1 = dirty => ({});
    const get_prepend_outer_slot_context$1 = ctx => ({ slot: "prepend-outer" });

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    const get_append_outer_slot_changes$1 = dirty => ({});
    const get_append_outer_slot_context$1 = ctx => ({ slot: "append-outer" });

    // (112:4) {#if clearable && value !== ''}
    function create_if_block_1$2(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const clear_icon_slot_template = /*#slots*/ ctx[32]["clear-icon"];
    	const clear_icon_slot = create_slot(clear_icon_slot_template, ctx, /*$$scope*/ ctx[39], get_clear_icon_slot_context);
    	const clear_icon_slot_or_fallback = clear_icon_slot || fallback_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { style: true });
    			var div_nodes = children(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(div, "cursor", "pointer");
    			add_location(div, file$d, 112, 6, 2740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (clear_icon_slot_or_fallback) {
    				clear_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clear*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (clear_icon_slot) {
    				if (clear_icon_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(clear_icon_slot, clear_icon_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_clear_icon_slot_changes, get_clear_icon_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clear_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clear_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(112:4) {#if clearable && value !== ''}",
    		ctx
    	});

    	return block;
    }

    // (115:32)             
    function fallback_block$2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(icon.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(115:32)             ",
    		ctx
    	});

    	return block;
    }

    // (67:0) <Input    class="s-text-field s-textarea"    {color}    {readonly}    {disabled}    {error}    {success}    {style}>
    function create_default_slot$7(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let label;
    	let t1;
    	let textarea_1;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[32].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[39], get_prepend_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[32].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[39], null);

    	let textarea_1_levels = [
    		{ type: "text" },
    		{ rows: /*rows*/ ctx[11] },
    		{ placeholder: /*placeholder*/ ctx[15] },
    		{ id: /*id*/ ctx[21] },
    		{ readOnly: /*readonly*/ ctx[10] },
    		{ disabled: /*disabled*/ ctx[14] },
    		/*$$restProps*/ ctx[29]
    	];

    	let textarea_1_data = {};

    	for (let i = 0; i < textarea_1_levels.length; i += 1) {
    		textarea_1_data = assign(textarea_1_data, textarea_1_levels[i]);
    	}

    	let if_block = /*clearable*/ ctx[9] && /*value*/ ctx[0] !== "" && create_if_block_1$2(ctx);
    	const append_slot_template = /*#slots*/ ctx[32].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[39], get_append_slot_context$1);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div0 = element("div");
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			textarea_1 = element("textarea");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			if (append_slot) append_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			if (prepend_slot) prepend_slot.l(div1_nodes);
    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			label = claim_element(div0_nodes, "LABEL", { for: true });
    			var label_nodes = children(label);
    			if (default_slot) default_slot.l(label_nodes);
    			label_nodes.forEach(detach_dev);
    			t1 = claim_space(div0_nodes);

    			textarea_1 = claim_element(div0_nodes, "TEXTAREA", {
    				type: true,
    				rows: true,
    				placeholder: true,
    				id: true,
    				readonly: true,
    				disabled: true
    			});

    			children(textarea_1).forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			if (if_block) if_block.l(div1_nodes);
    			t3 = claim_space(div1_nodes);
    			if (append_slot) append_slot.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(label, "for", /*id*/ ctx[21]);
    			toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			add_location(label, file$d, 89, 6, 2240);
    			set_attributes(textarea_1, textarea_1_data);
    			add_location(textarea_1, file$d, 92, 6, 2325);
    			attr_dev(div0, "class", "s-text-field__input");
    			add_location(div0, file$d, 88, 4, 2199);
    			attr_dev(div1, "class", "s-text-field__wrapper");
    			toggle_class(div1, "filled", /*filled*/ ctx[4]);
    			toggle_class(div1, "solo", /*solo*/ ctx[5]);
    			toggle_class(div1, "outlined", /*outlined*/ ctx[6]);
    			toggle_class(div1, "flat", /*flat*/ ctx[7]);
    			toggle_class(div1, "rounded", /*rounded*/ ctx[8]);
    			toggle_class(div1, "autogrow", /*autogrow*/ ctx[12]);
    			toggle_class(div1, "no-resize", /*noResize*/ ctx[13] || /*autogrow*/ ctx[12]);
    			add_location(div1, file$d, 76, 2, 1920);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			append_dev(div0, t1);
    			append_dev(div0, textarea_1);
    			/*textarea_1_binding*/ ctx[37](textarea_1);
    			set_input_value(textarea_1, /*value*/ ctx[0]);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t3);

    			if (append_slot) {
    				append_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[38]),
    					listen_dev(textarea_1, "focus", /*onFocus*/ ctx[25], false, false, false),
    					listen_dev(textarea_1, "blur", /*onBlur*/ ctx[26], false, false, false),
    					listen_dev(textarea_1, "input", /*onInput*/ ctx[28], false, false, false),
    					listen_dev(textarea_1, "focus", /*focus_handler*/ ctx[33], false, false, false),
    					listen_dev(textarea_1, "blur", /*blur_handler*/ ctx[34], false, false, false),
    					listen_dev(textarea_1, "input", /*input_handler*/ ctx[35], false, false, false),
    					listen_dev(textarea_1, "change", /*change_handler*/ ctx[36], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_prepend_slot_changes$1, get_prepend_slot_context$1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[39], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 2097152) {
    				attr_dev(label, "for", /*id*/ ctx[21]);
    			}

    			if (dirty[0] & /*labelActive*/ 8388608) {
    				toggle_class(label, "active", /*labelActive*/ ctx[23]);
    			}

    			set_attributes(textarea_1, textarea_1_data = get_spread_update(textarea_1_levels, [
    				{ type: "text" },
    				(!current || dirty[0] & /*rows*/ 2048) && { rows: /*rows*/ ctx[11] },
    				(!current || dirty[0] & /*placeholder*/ 32768) && { placeholder: /*placeholder*/ ctx[15] },
    				(!current || dirty[0] & /*id*/ 2097152) && { id: /*id*/ ctx[21] },
    				(!current || dirty[0] & /*readonly*/ 1024) && { readOnly: /*readonly*/ ctx[10] },
    				(!current || dirty[0] & /*disabled*/ 16384) && { disabled: /*disabled*/ ctx[14] },
    				dirty[0] & /*$$restProps*/ 536870912 && /*$$restProps*/ ctx[29]
    			]));

    			if (dirty[0] & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}

    			if (/*clearable*/ ctx[9] && /*value*/ ctx[0] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*clearable, value*/ 513) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_append_slot_changes$1, get_append_slot_context$1);
    				}
    			}

    			if (dirty[0] & /*filled*/ 16) {
    				toggle_class(div1, "filled", /*filled*/ ctx[4]);
    			}

    			if (dirty[0] & /*solo*/ 32) {
    				toggle_class(div1, "solo", /*solo*/ ctx[5]);
    			}

    			if (dirty[0] & /*outlined*/ 64) {
    				toggle_class(div1, "outlined", /*outlined*/ ctx[6]);
    			}

    			if (dirty[0] & /*flat*/ 128) {
    				toggle_class(div1, "flat", /*flat*/ ctx[7]);
    			}

    			if (dirty[0] & /*rounded*/ 256) {
    				toggle_class(div1, "rounded", /*rounded*/ ctx[8]);
    			}

    			if (dirty[0] & /*autogrow*/ 4096) {
    				toggle_class(div1, "autogrow", /*autogrow*/ ctx[12]);
    			}

    			if (dirty[0] & /*noResize, autogrow*/ 12288) {
    				toggle_class(div1, "no-resize", /*noResize*/ ctx[13] || /*autogrow*/ ctx[12]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*textarea_1_binding*/ ctx[37](null);
    			if (if_block) if_block.d();
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(67:0) <Input    class=\\\"s-text-field s-textarea\\\"    {color}    {readonly}    {disabled}    {error}    {success}    {style}>",
    		ctx
    	});

    	return block;
    }

    // (76:2) 
    function create_prepend_outer_slot$1(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[32]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[39], get_prepend_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		l: function claim(nodes) {
    			if (prepend_outer_slot) prepend_outer_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_prepend_outer_slot_changes$1, get_prepend_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot$1.name,
    		type: "slot",
    		source: "(76:2) ",
    		ctx
    	});

    	return block;
    }

    // (128:6) {#each messages as message}
    function create_each_block_1$1(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[41] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t = claim_text(span_nodes, t_value);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$d, 127, 33, 3148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*messages*/ 524288 && t_value !== (t_value = /*message*/ ctx[41] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(128:6) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {#each errorMessages.slice(0, errorCount) as message}
    function create_each_block$3(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[41] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t = claim_text(span_nodes, t_value);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$d, 128, 59, 3238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMessages, errorCount*/ 17039360 && t_value !== (t_value = /*message*/ ctx[41] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(129:6) {#each errorMessages.slice(0, errorCount) as message}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if counter}
    function create_if_block$5(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(/*counter*/ ctx[17]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t0 = claim_text(span_nodes, t0_value);
    			t1 = claim_text(span_nodes, " / ");
    			t2 = claim_text(span_nodes, /*counter*/ ctx[17]);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$d, 130, 17, 3298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && t0_value !== (t0_value = /*value*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*counter*/ 131072) set_data_dev(t2, /*counter*/ ctx[17]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(131:4) {#if counter}",
    		ctx
    	});

    	return block;
    }

    // (125:2) 
    function create_messages_slot(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*messages*/ ctx[19];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*errorMessages*/ ctx[24].slice(0, /*errorCount*/ ctx[18]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	let if_block = /*counter*/ ctx[17] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*hint*/ ctx[16]);
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { slot: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", {});
    			var div0_nodes = children(div0);
    			span = claim_element(div0_nodes, "SPAN", {});
    			var span_nodes = children(span);
    			t0 = claim_text(span_nodes, /*hint*/ ctx[16]);
    			span_nodes.forEach(detach_dev);
    			t1 = claim_space(div0_nodes);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div0_nodes);
    			}

    			t2 = claim_space(div0_nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t3 = claim_space(div1_nodes);
    			if (if_block) if_block.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file$d, 126, 6, 3094);
    			add_location(div0, file$d, 125, 4, 3081);
    			attr_dev(div1, "slot", "messages");
    			add_location(div1, file$d, 124, 2, 3054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hint*/ 65536) set_data_dev(t0, /*hint*/ ctx[16]);

    			if (dirty[0] & /*messages*/ 524288) {
    				each_value_1 = /*messages*/ ctx[19];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*errorMessages, errorCount*/ 17039360) {
    				each_value = /*errorMessages*/ ctx[24].slice(0, /*errorCount*/ ctx[18]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*counter*/ ctx[17]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_messages_slot.name,
    		type: "slot",
    		source: "(125:2) ",
    		ctx
    	});

    	return block;
    }

    // (135:2) 
    function create_append_outer_slot$1(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[32]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[39], get_append_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		l: function claim(nodes) {
    			if (append_outer_slot) append_outer_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_append_outer_slot_changes$1, get_append_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot$1.name,
    		type: "slot",
    		source: "(135:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-text-field s-textarea",
    				color: /*color*/ ctx[3],
    				readonly: /*readonly*/ ctx[10],
    				disabled: /*disabled*/ ctx[14],
    				error: /*error*/ ctx[1],
    				success: /*success*/ ctx[20],
    				style: /*style*/ ctx[22],
    				$$slots: {
    					"append-outer": [create_append_outer_slot$1],
    					messages: [create_messages_slot],
    					"prepend-outer": [create_prepend_outer_slot$1],
    					default: [create_default_slot$7]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(input.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty[0] & /*color*/ 8) input_changes.color = /*color*/ ctx[3];
    			if (dirty[0] & /*readonly*/ 1024) input_changes.readonly = /*readonly*/ ctx[10];
    			if (dirty[0] & /*disabled*/ 16384) input_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty[0] & /*error*/ 2) input_changes.error = /*error*/ ctx[1];
    			if (dirty[0] & /*success*/ 1048576) input_changes.success = /*success*/ ctx[20];
    			if (dirty[0] & /*style*/ 4194304) input_changes.style = /*style*/ ctx[22];

    			if (dirty[0] & /*counter, value, errorMessages, errorCount, messages, hint, filled, solo, outlined, flat, rounded, autogrow, noResize, clearable, rows, placeholder, id, readonly, disabled, $$restProps, textarea, labelActive*/ 565182453 | dirty[1] & /*$$scope*/ 256) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"value","color","filled","solo","outlined","flat","rounded","clearable","readonly","rows","autogrow","noResize","disabled","placeholder","hint","counter","rules","errorCount","messages","validateOnBlur","error","success","id","style","textarea"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Textarea", slots, ['append-outer','prepend-outer','prepend','default','clear-icon','append']);
    	let { value = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { filled = false } = $$props;
    	let { solo = false } = $$props;
    	let { outlined = false } = $$props;
    	let { flat = false } = $$props;
    	let { rounded = false } = $$props;
    	let { clearable = false } = $$props;
    	let { readonly = false } = $$props;
    	let { rows = 5 } = $$props;
    	let { autogrow = false } = $$props;
    	let { noResize = false } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { counter = false } = $$props;
    	let { rules = [] } = $$props;
    	let { errorCount = 1 } = $$props;
    	let { messages = [] } = $$props;
    	let { validateOnBlur = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { id = `s-input-${uid(5)}` } = $$props;
    	let { style = null } = $$props;
    	let { textarea = null } = $$props;
    	let labelActive = !!placeholder || value;
    	let errorMessages = [];

    	function checkRules() {
    		$$invalidate(24, errorMessages = rules.map(r => r(value)).filter(r => typeof r === "string"));

    		if (errorMessages.length) $$invalidate(1, error = true); else {
    			$$invalidate(1, error = false);
    		}
    	}

    	function onFocus() {
    		$$invalidate(23, labelActive = true);
    	}

    	function onBlur() {
    		if (!value && !placeholder) $$invalidate(23, labelActive = false);
    		if (validateOnBlur) checkRules();
    	}

    	function clear() {
    		$$invalidate(0, value = "");
    		if (!placeholder) $$invalidate(23, labelActive = false);
    	}

    	function onInput() {
    		if (!validateOnBlur) checkRules();

    		if (autogrow) {
    			$$invalidate(2, textarea.style.height = "auto", textarea);
    			$$invalidate(2, textarea.style.height = `${textarea.scrollHeight}px`, textarea);
    		}
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function textarea_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			textarea = $$value;
    			$$invalidate(2, textarea);
    		});
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(29, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$new_props) $$invalidate(3, color = $$new_props.color);
    		if ("filled" in $$new_props) $$invalidate(4, filled = $$new_props.filled);
    		if ("solo" in $$new_props) $$invalidate(5, solo = $$new_props.solo);
    		if ("outlined" in $$new_props) $$invalidate(6, outlined = $$new_props.outlined);
    		if ("flat" in $$new_props) $$invalidate(7, flat = $$new_props.flat);
    		if ("rounded" in $$new_props) $$invalidate(8, rounded = $$new_props.rounded);
    		if ("clearable" in $$new_props) $$invalidate(9, clearable = $$new_props.clearable);
    		if ("readonly" in $$new_props) $$invalidate(10, readonly = $$new_props.readonly);
    		if ("rows" in $$new_props) $$invalidate(11, rows = $$new_props.rows);
    		if ("autogrow" in $$new_props) $$invalidate(12, autogrow = $$new_props.autogrow);
    		if ("noResize" in $$new_props) $$invalidate(13, noResize = $$new_props.noResize);
    		if ("disabled" in $$new_props) $$invalidate(14, disabled = $$new_props.disabled);
    		if ("placeholder" in $$new_props) $$invalidate(15, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(16, hint = $$new_props.hint);
    		if ("counter" in $$new_props) $$invalidate(17, counter = $$new_props.counter);
    		if ("rules" in $$new_props) $$invalidate(30, rules = $$new_props.rules);
    		if ("errorCount" in $$new_props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("messages" in $$new_props) $$invalidate(19, messages = $$new_props.messages);
    		if ("validateOnBlur" in $$new_props) $$invalidate(31, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$new_props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$new_props) $$invalidate(20, success = $$new_props.success);
    		if ("id" in $$new_props) $$invalidate(21, id = $$new_props.id);
    		if ("style" in $$new_props) $$invalidate(22, style = $$new_props.style);
    		if ("textarea" in $$new_props) $$invalidate(2, textarea = $$new_props.textarea);
    		if ("$$scope" in $$new_props) $$invalidate(39, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Input,
    		Icon,
    		uid,
    		clearIcon: closeIcon,
    		value,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		rounded,
    		clearable,
    		readonly,
    		rows,
    		autogrow,
    		noResize,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		rules,
    		errorCount,
    		messages,
    		validateOnBlur,
    		error,
    		success,
    		id,
    		style,
    		textarea,
    		labelActive,
    		errorMessages,
    		checkRules,
    		onFocus,
    		onBlur,
    		clear,
    		onInput
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$props) $$invalidate(3, color = $$new_props.color);
    		if ("filled" in $$props) $$invalidate(4, filled = $$new_props.filled);
    		if ("solo" in $$props) $$invalidate(5, solo = $$new_props.solo);
    		if ("outlined" in $$props) $$invalidate(6, outlined = $$new_props.outlined);
    		if ("flat" in $$props) $$invalidate(7, flat = $$new_props.flat);
    		if ("rounded" in $$props) $$invalidate(8, rounded = $$new_props.rounded);
    		if ("clearable" in $$props) $$invalidate(9, clearable = $$new_props.clearable);
    		if ("readonly" in $$props) $$invalidate(10, readonly = $$new_props.readonly);
    		if ("rows" in $$props) $$invalidate(11, rows = $$new_props.rows);
    		if ("autogrow" in $$props) $$invalidate(12, autogrow = $$new_props.autogrow);
    		if ("noResize" in $$props) $$invalidate(13, noResize = $$new_props.noResize);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$new_props.disabled);
    		if ("placeholder" in $$props) $$invalidate(15, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(16, hint = $$new_props.hint);
    		if ("counter" in $$props) $$invalidate(17, counter = $$new_props.counter);
    		if ("rules" in $$props) $$invalidate(30, rules = $$new_props.rules);
    		if ("errorCount" in $$props) $$invalidate(18, errorCount = $$new_props.errorCount);
    		if ("messages" in $$props) $$invalidate(19, messages = $$new_props.messages);
    		if ("validateOnBlur" in $$props) $$invalidate(31, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$props) $$invalidate(20, success = $$new_props.success);
    		if ("id" in $$props) $$invalidate(21, id = $$new_props.id);
    		if ("style" in $$props) $$invalidate(22, style = $$new_props.style);
    		if ("textarea" in $$props) $$invalidate(2, textarea = $$new_props.textarea);
    		if ("labelActive" in $$props) $$invalidate(23, labelActive = $$new_props.labelActive);
    		if ("errorMessages" in $$props) $$invalidate(24, errorMessages = $$new_props.errorMessages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		error,
    		textarea,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		rounded,
    		clearable,
    		readonly,
    		rows,
    		autogrow,
    		noResize,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		errorCount,
    		messages,
    		success,
    		id,
    		style,
    		labelActive,
    		errorMessages,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		$$restProps,
    		rules,
    		validateOnBlur,
    		slots,
    		focus_handler,
    		blur_handler,
    		input_handler,
    		change_handler,
    		textarea_1_binding,
    		textarea_1_input_handler,
    		$$scope
    	];
    }

    class Textarea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				value: 0,
    				color: 3,
    				filled: 4,
    				solo: 5,
    				outlined: 6,
    				flat: 7,
    				rounded: 8,
    				clearable: 9,
    				readonly: 10,
    				rows: 11,
    				autogrow: 12,
    				noResize: 13,
    				disabled: 14,
    				placeholder: 15,
    				hint: 16,
    				counter: 17,
    				rules: 30,
    				errorCount: 18,
    				messages: 19,
    				validateOnBlur: 31,
    				error: 1,
    				success: 20,
    				id: 21,
    				style: 22,
    				textarea: 2
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Textarea",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get value() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearable() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autogrow() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autogrow(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noResize() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noResize(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counter() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counter(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rules() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rules(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorCount() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCount(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messages() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messages(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validateOnBlur() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validateOnBlur(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\svelte-materialify\dist\components\Menu\Menu.svelte generated by Svelte v3.37.0 */
    const file$c = "node_modules\\svelte-materialify\\dist\\components\\Menu\\Menu.svelte";
    const get_activator_slot_changes = dirty => ({});
    const get_activator_slot_context = ctx => ({});

    // (122:2) {#if active}
    function create_if_block$4(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, role: true, style: true });
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "s-menu " + /*klass*/ ctx[1]);
    			attr_dev(div, "role", "menu");
    			attr_dev(div, "style", div_style_value = "" + (/*position*/ ctx[9] + ";transform-origin:" + /*origin*/ ctx[8] + ";z-index:" + /*index*/ ctx[6] + ";" + /*style*/ ctx[7]));
    			toggle_class(div, "tile", /*tile*/ ctx[5]);
    			add_location(div, file$c, 122, 4, 3584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*menuClick*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[25], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*klass*/ 2 && div_class_value !== (div_class_value = "s-menu " + /*klass*/ ctx[1])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*position, origin, index, style*/ 960 && div_style_value !== (div_style_value = "" + (/*position*/ ctx[9] + ";transform-origin:" + /*origin*/ ctx[8] + ";z-index:" + /*index*/ ctx[6] + ";" + /*style*/ ctx[7]))) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty[0] & /*klass, tile*/ 34) {
    				toggle_class(div, "tile", /*tile*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*transition*/ ctx[2], /*inOpts*/ ctx[3]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*transition*/ ctx[2], /*outOpts*/ ctx[4]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(122:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const activator_slot_template = /*#slots*/ ctx[26].activator;
    	const activator_slot = create_slot(activator_slot_template, ctx, /*$$scope*/ ctx[25], get_activator_slot_context);
    	let if_block = /*active*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (activator_slot) activator_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (activator_slot) activator_slot.l(div_nodes);
    			t = claim_space(div_nodes);
    			if (if_block) if_block.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "s-menu__wrapper");
    			add_location(div, file$c, 113, 0, 3383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (activator_slot) {
    				activator_slot.m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[27](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(ClickOutside.call(null, div)),
    					listen_dev(div, "clickOutside", /*clickOutsideMenu*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (activator_slot) {
    				if (activator_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					update_slot(activator_slot, activator_slot_template, ctx, /*$$scope*/ ctx[25], dirty, get_activator_slot_changes, get_activator_slot_context);
    				}
    			}

    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(activator_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activator_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (activator_slot) activator_slot.d(detaching);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[27](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, ['activator','default']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { absolute = false } = $$props;
    	let { transition = fade } = $$props;
    	let { inOpts = { duration: 250 } } = $$props;
    	let { outOpts = { duration: 200 } } = $$props;
    	let { offsetX = false } = $$props;
    	let { offsetY = true } = $$props;
    	let { nudgeX = 0 } = $$props;
    	let { nudgeY = 0 } = $$props;
    	let { openOnClick = true } = $$props;
    	let { hover = false } = $$props;
    	let { closeOnClickOutside = true } = $$props;
    	let { closeOnClick = true } = $$props;
    	let { bottom = false } = $$props;
    	let { right = false } = $$props;
    	let { tile = false } = $$props;
    	let { disabled = false } = $$props;
    	let { index = 8 } = $$props;
    	let { style = "" } = $$props;
    	let origin = "top left";
    	let position;
    	let wrapper;
    	const dispatch = createEventDispatcher();

    	const align = {
    		x: right ? "right" : "left",
    		y: bottom ? "bottom" : "top"
    	};

    	setContext("S_ListItemRole", "menuitem");
    	setContext("S_ListItemRipple", true);

    	// For opening the menu
    	function open(posX = 0, posY = 0) {
    		$$invalidate(0, active = true);
    		const rect = wrapper.getBoundingClientRect();
    		let x = nudgeX;
    		let y = nudgeY;

    		if (absolute) {
    			x += posX;
    			y += posY;
    		} else {
    			if (offsetX) x += rect.width;
    			if (offsetY) y += rect.height;
    		}

    		$$invalidate(9, position = `${align.y}:${y}px;${align.x}:${x}px`);
    		$$invalidate(8, origin = `${align.y} ${align.x}`);

    		/**
     * Event when menu is opened.
     * @returns Nothing
     */
    		dispatch("open");
    	}

    	// For closing the menu.
    	function close() {
    		$$invalidate(0, active = false);

    		/**
     * Event when menu is closed.
     * @returns Nothing
     */
    		dispatch("close");
    	}

    	// When the activator slot is clicked.
    	function triggerClick(e) {
    		if (!disabled) {
    			if (active) {
    				close();
    			} else if (openOnClick) {
    				open(e.offsetX, e.offsetY);
    			}
    		}
    	}

    	// When the menu itself is clicked.
    	function menuClick() {
    		if (active && closeOnClick) close();
    	}

    	// When user clicked somewhere outside the menu.
    	function clickOutsideMenu() {
    		if (active && closeOnClickOutside) close();
    	}

    	onMount(() => {
    		const trigger = wrapper.querySelector("[slot='activator']");

    		// Opening the menu if active is set to true.
    		if (active) open();

    		trigger.addEventListener("click", triggerClick, { passive: true });

    		if (hover) {
    			wrapper.addEventListener("mouseenter", open, { passive: true });
    			wrapper.addEventListener("mouseleave", close, { passive: true });
    		}

    		return () => {
    			trigger.removeEventListener("click", triggerClick);

    			if (hover) {
    				wrapper.removeEventListener("mouseenter", open);
    				wrapper.removeEventListener("mouseleave", close);
    			}
    		};
    	});

    	const writable_props = [
    		"class",
    		"active",
    		"absolute",
    		"transition",
    		"inOpts",
    		"outOpts",
    		"offsetX",
    		"offsetY",
    		"nudgeX",
    		"nudgeY",
    		"openOnClick",
    		"hover",
    		"closeOnClickOutside",
    		"closeOnClick",
    		"bottom",
    		"right",
    		"tile",
    		"disabled",
    		"index",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrapper = $$value;
    			$$invalidate(10, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("absolute" in $$props) $$invalidate(13, absolute = $$props.absolute);
    		if ("transition" in $$props) $$invalidate(2, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(3, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(4, outOpts = $$props.outOpts);
    		if ("offsetX" in $$props) $$invalidate(14, offsetX = $$props.offsetX);
    		if ("offsetY" in $$props) $$invalidate(15, offsetY = $$props.offsetY);
    		if ("nudgeX" in $$props) $$invalidate(16, nudgeX = $$props.nudgeX);
    		if ("nudgeY" in $$props) $$invalidate(17, nudgeY = $$props.nudgeY);
    		if ("openOnClick" in $$props) $$invalidate(18, openOnClick = $$props.openOnClick);
    		if ("hover" in $$props) $$invalidate(19, hover = $$props.hover);
    		if ("closeOnClickOutside" in $$props) $$invalidate(20, closeOnClickOutside = $$props.closeOnClickOutside);
    		if ("closeOnClick" in $$props) $$invalidate(21, closeOnClick = $$props.closeOnClick);
    		if ("bottom" in $$props) $$invalidate(22, bottom = $$props.bottom);
    		if ("right" in $$props) $$invalidate(23, right = $$props.right);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(24, disabled = $$props.disabled);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClickOutside,
    		onMount,
    		setContext,
    		createEventDispatcher,
    		fade,
    		klass,
    		active,
    		absolute,
    		transition,
    		inOpts,
    		outOpts,
    		offsetX,
    		offsetY,
    		nudgeX,
    		nudgeY,
    		openOnClick,
    		hover,
    		closeOnClickOutside,
    		closeOnClick,
    		bottom,
    		right,
    		tile,
    		disabled,
    		index,
    		style,
    		origin,
    		position,
    		wrapper,
    		dispatch,
    		align,
    		open,
    		close,
    		triggerClick,
    		menuClick,
    		clickOutsideMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("absolute" in $$props) $$invalidate(13, absolute = $$props.absolute);
    		if ("transition" in $$props) $$invalidate(2, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(3, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(4, outOpts = $$props.outOpts);
    		if ("offsetX" in $$props) $$invalidate(14, offsetX = $$props.offsetX);
    		if ("offsetY" in $$props) $$invalidate(15, offsetY = $$props.offsetY);
    		if ("nudgeX" in $$props) $$invalidate(16, nudgeX = $$props.nudgeX);
    		if ("nudgeY" in $$props) $$invalidate(17, nudgeY = $$props.nudgeY);
    		if ("openOnClick" in $$props) $$invalidate(18, openOnClick = $$props.openOnClick);
    		if ("hover" in $$props) $$invalidate(19, hover = $$props.hover);
    		if ("closeOnClickOutside" in $$props) $$invalidate(20, closeOnClickOutside = $$props.closeOnClickOutside);
    		if ("closeOnClick" in $$props) $$invalidate(21, closeOnClick = $$props.closeOnClick);
    		if ("bottom" in $$props) $$invalidate(22, bottom = $$props.bottom);
    		if ("right" in $$props) $$invalidate(23, right = $$props.right);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(24, disabled = $$props.disabled);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("origin" in $$props) $$invalidate(8, origin = $$props.origin);
    		if ("position" in $$props) $$invalidate(9, position = $$props.position);
    		if ("wrapper" in $$props) $$invalidate(10, wrapper = $$props.wrapper);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		tile,
    		index,
    		style,
    		origin,
    		position,
    		wrapper,
    		menuClick,
    		clickOutsideMenu,
    		absolute,
    		offsetX,
    		offsetY,
    		nudgeX,
    		nudgeY,
    		openOnClick,
    		hover,
    		closeOnClickOutside,
    		closeOnClick,
    		bottom,
    		right,
    		disabled,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$d,
    			create_fragment$d,
    			safe_not_equal,
    			{
    				class: 1,
    				active: 0,
    				absolute: 13,
    				transition: 2,
    				inOpts: 3,
    				outOpts: 4,
    				offsetX: 14,
    				offsetY: 15,
    				nudgeX: 16,
    				nudgeY: 17,
    				openOnClick: 18,
    				hover: 19,
    				closeOnClickOutside: 20,
    				closeOnClick: 21,
    				bottom: 22,
    				right: 23,
    				tile: 5,
    				disabled: 24,
    				index: 6,
    				style: 7
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inOpts() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inOpts(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outOpts() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outOpts(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offsetX() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offsetX(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offsetY() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offsetY(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nudgeX() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nudgeX(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nudgeY() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nudgeY(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openOnClick() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openOnClick(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClickOutside() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClickOutside(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClick() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClick(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\List\ListItem.svelte generated by Svelte v3.37.0 */
    const file$b = "node_modules\\svelte-materialify\\dist\\components\\List\\ListItem.svelte";
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_subtitle_slot_changes = dirty => ({});
    const get_subtitle_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});

    function create_fragment$c(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let div3_tabindex_value;
    	let div3_aria_selected_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[14].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[13], get_prepend_slot_context);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const subtitle_slot_template = /*#slots*/ ctx[14].subtitle;
    	const subtitle_slot = create_slot(subtitle_slot_template, ctx, /*$$scope*/ ctx[13], get_subtitle_slot_context);
    	const append_slot_template = /*#slots*/ ctx[14].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[13], get_append_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (subtitle_slot) subtitle_slot.c();
    			t2 = space();
    			if (append_slot) append_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div3 = claim_element(nodes, "DIV", {
    				class: true,
    				role: true,
    				tabindex: true,
    				"aria-selected": true,
    				style: true
    			});

    			var div3_nodes = children(div3);
    			if (prepend_slot) prepend_slot.l(div3_nodes);
    			t0 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			if (subtitle_slot) subtitle_slot.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			if (append_slot) append_slot.l(div3_nodes);
    			div3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "s-list-item__title");
    			add_location(div0, file$b, 57, 4, 4978);
    			attr_dev(div1, "class", "s-list-item__subtitle");
    			add_location(div1, file$b, 60, 4, 5044);
    			attr_dev(div2, "class", "s-list-item__content");
    			add_location(div2, file$b, 56, 2, 4938);
    			attr_dev(div3, "class", div3_class_value = "s-list-item " + /*klass*/ ctx[1]);
    			attr_dev(div3, "role", /*role*/ ctx[10]);
    			attr_dev(div3, "tabindex", div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1);
    			attr_dev(div3, "aria-selected", div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null);
    			attr_dev(div3, "style", /*style*/ ctx[9]);
    			toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			toggle_class(div3, "link", /*link*/ ctx[6]);
    			toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			add_location(div3, file$b, 39, 0, 4574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (subtitle_slot) {
    				subtitle_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_slot) {
    				append_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, div3, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]])),
    					action_destroyer(Ripple_action = Ripple.call(null, div3, /*ripple*/ ctx[8])),
    					listen_dev(div3, "click", /*click*/ ctx[11], false, false, false),
    					listen_dev(div3, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(div3, "dblclick", /*dblclick_handler*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (subtitle_slot) {
    				if (subtitle_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(subtitle_slot, subtitle_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_subtitle_slot_changes, get_subtitle_slot_context);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_append_slot_changes, get_append_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 2 && div3_class_value !== (div3_class_value = "s-list-item " + /*klass*/ ctx[1])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*link*/ 64 && div3_tabindex_value !== (div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1)) {
    				attr_dev(div3, "tabindex", div3_tabindex_value);
    			}

    			if (!current || dirty & /*active*/ 1 && div3_aria_selected_value !== (div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null)) {
    				attr_dev(div3, "aria-selected", div3_aria_selected_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(div3, "style", /*style*/ ctx[9]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 5) Class_action.update.call(null, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 256) Ripple_action.update.call(null, /*ripple*/ ctx[8]);

    			if (dirty & /*klass, dense*/ 10) {
    				toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 18) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*klass, multiline*/ 34) {
    				toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			}

    			if (dirty & /*klass, link*/ 66) {
    				toggle_class(div3, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, selectable*/ 130) {
    				toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(subtitle_slot, local);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(subtitle_slot, local);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (subtitle_slot) subtitle_slot.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, ['prepend','default','subtitle','append']);
    	const role = getContext("S_ListItemRole");
    	const ITEM_GROUP = getContext("S_ListItemGroup");

    	const DEFAULTS = {
    		select: () => null,
    		register: () => null,
    		index: () => null,
    		activeClass: "active"
    	};

    	const ITEM = ITEM_GROUP ? getContext(ITEM_GROUP) : DEFAULTS;
    	let { class: klass = "" } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { active = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = null } = $$props;
    	let { multiline = false } = $$props;
    	let { link = role } = $$props;
    	let { selectable = !link } = $$props;
    	let { ripple = getContext("S_ListItemRipple") || role || false } = $$props;
    	let { style = null } = $$props;

    	ITEM.register(values => {
    		$$invalidate(0, active = values.includes(value));
    	});

    	function click() {
    		if (!disabled) ITEM.select(value);
    	}

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"active",
    		"dense",
    		"disabled",
    		"multiline",
    		"link",
    		"selectable",
    		"ripple",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		Ripple,
    		Class,
    		role,
    		ITEM_GROUP,
    		DEFAULTS,
    		ITEM,
    		klass,
    		activeClass,
    		value,
    		active,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		activeClass,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		role,
    		click,
    		value,
    		$$scope,
    		slots,
    		click_handler,
    		dblclick_handler
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			class: 1,
    			activeClass: 2,
    			value: 12,
    			active: 0,
    			dense: 3,
    			disabled: 4,
    			multiline: 5,
    			link: 6,
    			selectable: 7,
    			ripple: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectable() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\List\ListItemGroup.svelte generated by Svelte v3.37.0 */

    // (20:0) <ItemGroup   class="s-list-item-group {klass}"   role="listbox"   bind:value   {activeClass}   {multiple}   {mandatory}   {max}   {style}>
    function create_default_slot$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(20:0) <ItemGroup   class=\\\"s-list-item-group {klass}\\\"   role=\\\"listbox\\\"   bind:value   {activeClass}   {multiple}   {mandatory}   {max}   {style}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[8](value);
    	}

    	let itemgroup_props = {
    		class: "s-list-item-group " + /*klass*/ ctx[1],
    		role: "listbox",
    		activeClass: /*activeClass*/ ctx[2],
    		multiple: /*multiple*/ ctx[3],
    		mandatory: /*mandatory*/ ctx[4],
    		max: /*max*/ ctx[5],
    		style: /*style*/ ctx[6],
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(itemgroup, "value", itemgroup_value_binding));

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(itemgroup.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-list-item-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 4) itemgroup_changes.activeClass = /*activeClass*/ ctx[2];
    			if (dirty & /*multiple*/ 8) itemgroup_changes.multiple = /*multiple*/ ctx[3];
    			if (dirty & /*mandatory*/ 16) itemgroup_changes.mandatory = /*mandatory*/ ctx[4];
    			if (dirty & /*max*/ 32) itemgroup_changes.max = /*max*/ ctx[5];
    			if (dirty & /*style*/ 64) itemgroup_changes.style = /*style*/ ctx[6];

    			if (dirty & /*$$scope*/ 512) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItemGroup", slots, ['default']);
    	setContext("S_ListItemRole", "option");
    	setContext("S_ListItemGroup", ITEM_GROUP);
    	let { class: klass = "primary-text" } = $$props;
    	let { value = [] } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "value", "activeClass", "multiple", "mandatory", "max", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItemGroup> was created with unknown prop '${key}'`);
    	});

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(4, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(5, max = $$props.max);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		ItemGroup,
    		ITEM_GROUP,
    		klass,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(4, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(5, max = $$props.max);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		style,
    		slots,
    		itemgroup_value_binding,
    		$$scope
    	];
    }

    class ListItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			class: 1,
    			value: 0,
    			activeClass: 2,
    			multiple: 3,
    			mandatory: 4,
    			max: 5,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItemGroup",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Chip\Chip.svelte generated by Svelte v3.37.0 */
    const file$a = "node_modules\\svelte-materialify\\dist\\components\\Chip\\Chip.svelte";
    const get_close_icon_slot_changes = dirty => ({});
    const get_close_icon_slot_context = ctx => ({});

    // (38:0) {#if active}
    function create_if_block$3(ctx) {
    	let span;
    	let t;
    	let span_class_value;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let if_block = /*close*/ ctx[8] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			if (default_slot) default_slot.l(span_nodes);
    			t = claim_space(span_nodes);
    			if (if_block) if_block.l(span_nodes);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "class", span_class_value = "s-chip " + /*klass*/ ctx[1] + " size-" + /*size*/ ctx[3]);
    			toggle_class(span, "outlined", /*outlined*/ ctx[4]);
    			toggle_class(span, "pill", /*pill*/ ctx[5]);
    			toggle_class(span, "link", /*link*/ ctx[6]);
    			toggle_class(span, "label", /*label*/ ctx[7]);
    			toggle_class(span, "selected", /*selected*/ ctx[2]);
    			add_location(span, file$a, 38, 2, 3527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(span, t);
    			if (if_block) if_block.m(span, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Ripple_action = Ripple.call(null, span, /*link*/ ctx[6])),
    					listen_dev(span, "click", /*click_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (/*close*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*close*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*klass, size*/ 10 && span_class_value !== (span_class_value = "s-chip " + /*klass*/ ctx[1] + " size-" + /*size*/ ctx[3])) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*link*/ 64) Ripple_action.update.call(null, /*link*/ ctx[6]);

    			if (dirty & /*klass, size, outlined*/ 26) {
    				toggle_class(span, "outlined", /*outlined*/ ctx[4]);
    			}

    			if (dirty & /*klass, size, pill*/ 42) {
    				toggle_class(span, "pill", /*pill*/ ctx[5]);
    			}

    			if (dirty & /*klass, size, link*/ 74) {
    				toggle_class(span, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, size, label*/ 138) {
    				toggle_class(span, "label", /*label*/ ctx[7]);
    			}

    			if (dirty & /*klass, size, selected*/ 14) {
    				toggle_class(span, "selected", /*selected*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(38:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if close}
    function create_if_block_1$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const close_icon_slot_template = /*#slots*/ ctx[11]["close-icon"];
    	const close_icon_slot = create_slot(close_icon_slot_template, ctx, /*$$scope*/ ctx[10], get_close_icon_slot_context);
    	const close_icon_slot_or_fallback = close_icon_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "s-chip__close");
    			add_location(div, file$a, 49, 6, 3727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (close_icon_slot_or_fallback) {
    				close_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onClose*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (close_icon_slot) {
    				if (close_icon_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(close_icon_slot, close_icon_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_close_icon_slot_changes, get_close_icon_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(close_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(close_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(49:4) {#if close}",
    		ctx
    	});

    	return block;
    }

    // (51:32)            
    function fallback_block$1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(icon.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(51:32)            ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Chip", slots, ['default','close-icon']);
    	let { class: klass = "" } = $$props;
    	let { active = true } = $$props;
    	let { selected = false } = $$props;
    	let { size = "default" } = $$props;
    	let { outlined = false } = $$props;
    	let { pill = false } = $$props;
    	let { link = false } = $$props;
    	let { label = false } = $$props;
    	let { close = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function onClose(e) {
    		$$invalidate(0, active = false);
    		dispatch("close", e);
    	}

    	const writable_props = [
    		"class",
    		"active",
    		"selected",
    		"size",
    		"outlined",
    		"pill",
    		"link",
    		"label",
    		"close"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chip> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("outlined" in $$props) $$invalidate(4, outlined = $$props.outlined);
    		if ("pill" in $$props) $$invalidate(5, pill = $$props.pill);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("close" in $$props) $$invalidate(8, close = $$props.close);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Icon,
    		closeIcon,
    		createEventDispatcher,
    		klass,
    		active,
    		selected,
    		size,
    		outlined,
    		pill,
    		link,
    		label,
    		close,
    		dispatch,
    		onClose
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("outlined" in $$props) $$invalidate(4, outlined = $$props.outlined);
    		if ("pill" in $$props) $$invalidate(5, pill = $$props.pill);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("close" in $$props) $$invalidate(8, close = $$props.close);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		selected,
    		size,
    		outlined,
    		pill,
    		link,
    		label,
    		close,
    		onClose,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Chip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			class: 1,
    			active: 0,
    			selected: 2,
    			size: 3,
    			outlined: 4,
    			pill: 5,
    			link: 6,
    			label: 7,
    			close: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chip",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pill() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pill(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Checkbox\Checkbox.svelte generated by Svelte v3.37.0 */
    const file$9 = "node_modules\\svelte-materialify\\dist\\components\\Checkbox\\Checkbox.svelte";

    // (84:6) {#if checked || indeterminate}
    function create_if_block$2(ctx) {
    	let svg;
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l: function claim(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					xmlns: true,
    					width: true,
    					height: true,
    					viewBox: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path, "d", path_d_value = /*checked*/ ctx[0] ? check : dash);
    			add_location(path, file$9, 89, 10, 3894);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$9, 84, 8, 3755);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*checked*/ 1 && path_d_value !== (path_d_value = /*checked*/ ctx[0] ? check : dash)) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(84:6) {#if checked || indeterminate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div2;
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let div1_class_value;
    	let TextColor_action;
    	let t1;
    	let label;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = (/*checked*/ ctx[0] || /*indeterminate*/ ctx[1]) && create_if_block$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true, style: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			input = claim_element(div1_nodes, "INPUT", {
    				type: true,
    				role: true,
    				"aria-checked": true,
    				id: true,
    				disabled: true,
    				value: true
    			});

    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true, "aria-hidden": true });
    			var div0_nodes = children(div0);
    			if (if_block) if_block.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t1 = claim_space(div2_nodes);
    			label = claim_element(div2_nodes, "LABEL", { for: true });
    			var label_nodes = children(label);
    			if (default_slot) default_slot.l(label_nodes);
    			label_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "role", "checkbox");
    			attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			input.disabled = /*disabled*/ ctx[6];
    			input.__value = /*value*/ ctx[7];
    			input.value = input.__value;
    			if (/*checked*/ ctx[0] === void 0 || /*indeterminate*/ ctx[1] === void 0) add_render_callback(() => /*input_change_handler*/ ctx[16].call(input));
    			add_location(input, file$9, 70, 4, 3390);
    			attr_dev(div0, "class", "s-checkbox__background");
    			attr_dev(div0, "aria-hidden", "true");
    			add_location(div0, file$9, 82, 4, 3652);
    			attr_dev(div1, "class", div1_class_value = "s-checkbox__wrapper " + /*klass*/ ctx[4]);
    			toggle_class(div1, "disabled", /*disabled*/ ctx[6]);
    			add_location(div1, file$9, 65, 2, 3219);
    			attr_dev(label, "for", /*id*/ ctx[2]);
    			add_location(label, file$9, 94, 2, 3984);
    			attr_dev(div2, "class", "s-checkbox");
    			attr_dev(div2, "style", /*style*/ ctx[8]);
    			add_location(div2, file$9, 64, 0, 3183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[15](input);
    			input.checked = /*checked*/ ctx[0];
    			input.indeterminate = /*indeterminate*/ ctx[1];
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[16]),
    					listen_dev(input, "change", /*groupUpdate*/ ctx[9], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[14], false, false, false),
    					action_destroyer(Ripple.call(null, div1, { centered: true })),
    					action_destroyer(TextColor_action = TextColor.call(null, div1, /*checked*/ ctx[0] || /*indeterminate*/ ctx[1]
    					? /*color*/ ctx[5]
    					: false))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*checked*/ 1) {
    				attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 64) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (!current || dirty & /*value*/ 128) {
    				prop_dev(input, "__value", /*value*/ ctx[7]);
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*indeterminate*/ 2) {
    				input.indeterminate = /*indeterminate*/ ctx[1];
    			}

    			if (/*checked*/ ctx[0] || /*indeterminate*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*klass*/ 16 && div1_class_value !== (div1_class_value = "s-checkbox__wrapper " + /*klass*/ ctx[4])) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*checked, indeterminate, color*/ 35) TextColor_action.update.call(null, /*checked*/ ctx[0] || /*indeterminate*/ ctx[1]
    			? /*color*/ ctx[5]
    			: false);

    			if (dirty & /*klass, disabled*/ 80) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(label, "for", /*id*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 256) {
    				attr_dev(div2, "style", /*style*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*input_binding*/ ctx[15](null);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const check = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
    const dash = "M4,11L4,13L20,13L20,11L4,11Z";

    function instance$9($$self, $$props, $$invalidate) {
    	let hasValidGroup;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { checked = false } = $$props;
    	let { indeterminate = false } = $$props;
    	let { disabled = false } = $$props;
    	let { value = null } = $$props;
    	let { group = null } = $$props;
    	let { id = null } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	id = id || `s-checkbox-${uid(5)}`;

    	function groupUpdate() {
    		if (hasValidGroup && value != null) {
    			const i = group.indexOf(value);

    			if (i < 0) {
    				group.push(value);
    			} else {
    				group.splice(i, 1);
    			}

    			$$invalidate(10, group);
    		}
    	}

    	const writable_props = [
    		"class",
    		"color",
    		"checked",
    		"indeterminate",
    		"disabled",
    		"value",
    		"group",
    		"id",
    		"style",
    		"inputElement"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputElement = $$value;
    			$$invalidate(3, inputElement);
    		});
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		indeterminate = this.indeterminate;
    		((($$invalidate(0, checked), $$invalidate(11, hasValidGroup)), $$invalidate(7, value)), $$invalidate(10, group));
    		$$invalidate(1, indeterminate);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(4, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    		if ("inputElement" in $$props) $$invalidate(3, inputElement = $$props.inputElement);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		check,
    		dash,
    		Ripple,
    		TextColor,
    		klass,
    		color,
    		checked,
    		indeterminate,
    		disabled,
    		value,
    		group,
    		id,
    		style,
    		inputElement,
    		groupUpdate,
    		hasValidGroup
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(4, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    		if ("inputElement" in $$props) $$invalidate(3, inputElement = $$props.inputElement);
    		if ("hasValidGroup" in $$props) $$invalidate(11, hasValidGroup = $$props.hasValidGroup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*group*/ 1024) {
    			$$invalidate(11, hasValidGroup = Array.isArray(group));
    		}

    		if ($$self.$$.dirty & /*hasValidGroup, value, group*/ 3200) {
    			if (hasValidGroup && value != null) {
    				$$invalidate(0, checked = group.indexOf(value) >= 0);
    			}
    		}
    	};

    	return [
    		checked,
    		indeterminate,
    		id,
    		inputElement,
    		klass,
    		color,
    		disabled,
    		value,
    		style,
    		groupUpdate,
    		group,
    		hasValidGroup,
    		$$scope,
    		slots,
    		change_handler,
    		input_binding,
    		input_change_handler
    	];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			class: 4,
    			color: 5,
    			checked: 0,
    			indeterminate: 1,
    			disabled: 6,
    			value: 7,
    			group: 10,
    			id: 2,
    			style: 8,
    			inputElement: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var down = 'M7,10L12,15L17,10H7Z';

    /* node_modules\svelte-materialify\dist\components\Select\Select.svelte generated by Svelte v3.37.0 */
    const file$8 = "node_modules\\svelte-materialify\\dist\\components\\Select\\Select.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({ item: dirty & /*items*/ 8 });
    const get_item_slot_context = ctx => ({ item: /*item*/ ctx[28] });
    const get_prepend_outer_slot_changes = dirty => ({});
    const get_prepend_outer_slot_context = ctx => ({ slot: "prepend-outer" });

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    const get_append_outer_slot_changes = dirty => ({});
    const get_append_outer_slot_context = ctx => ({ slot: "append-outer" });

    // (76:10) <ListItem {dense} value={item.value ? item.value : item}>
    function create_default_slot_4$3(ctx) {
    	let t_value = (/*item*/ ctx[28].name
    	? /*item*/ ctx[28].name
    	: /*item*/ ctx[28]) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 8 && t_value !== (t_value = (/*item*/ ctx[28].name
    			? /*item*/ ctx[28].name
    			: /*item*/ ctx[28]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(76:10) <ListItem {dense} value={item.value ? item.value : item}>",
    		ctx
    	});

    	return block;
    }

    // (78:14) {#if multiple}
    function create_if_block_1(ctx) {
    	let checkbox;
    	let current;

    	checkbox = new Checkbox({
    			props: {
    				checked: /*value*/ ctx[0].includes(/*item*/ ctx[28].value
    				? /*item*/ ctx[28].value
    				: /*item*/ ctx[28])
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(checkbox.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(checkbox.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};

    			if (dirty & /*value, items*/ 9) checkbox_changes.checked = /*value*/ ctx[0].includes(/*item*/ ctx[28].value
    			? /*item*/ ctx[28].value
    			: /*item*/ ctx[28]);

    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(78:14) {#if multiple}",
    		ctx
    	});

    	return block;
    }

    // (77:12) 
    function create_prepend_slot(ctx) {
    	let span;
    	let current;
    	let if_block = /*multiple*/ ctx[11] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { slot: true });
    			var span_nodes = children(span);
    			if (if_block) if_block.l(span_nodes);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "slot", "prepend");
    			add_location(span, file$8, 76, 12, 3087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*multiple*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*multiple*/ 2048) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot.name,
    		type: "slot",
    		source: "(77:12) ",
    		ctx
    	});

    	return block;
    }

    // (75:33)             
    function fallback_block(ctx) {
    	let listitem;
    	let t;
    	let current;

    	listitem = new ListItem({
    			props: {
    				dense: /*dense*/ ctx[7],
    				value: /*item*/ ctx[28].value
    				? /*item*/ ctx[28].value
    				: /*item*/ ctx[28],
    				$$slots: {
    					prepend: [create_prepend_slot],
    					default: [create_default_slot_4$3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem.$$.fragment);
    			t = space();
    		},
    		l: function claim(nodes) {
    			claim_component(listitem.$$.fragment, nodes);
    			t = claim_space(nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = {};
    			if (dirty & /*dense*/ 128) listitem_changes.dense = /*dense*/ ctx[7];

    			if (dirty & /*items*/ 8) listitem_changes.value = /*item*/ ctx[28].value
    			? /*item*/ ctx[28].value
    			: /*item*/ ctx[28];

    			if (dirty & /*$$scope, value, items, multiple*/ 8390665) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(75:33)             ",
    		ctx
    	});

    	return block;
    }

    // (74:6) {#each items as item}
    function create_each_block_1(ctx) {
    	let current;
    	const item_slot_template = /*#slots*/ ctx[19].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[23], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    		},
    		l: function claim(nodes) {
    			if (item_slot_or_fallback) item_slot_or_fallback.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (item_slot) {
    				if (item_slot.p && dirty & /*$$scope, items*/ 8388616) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[23], dirty, get_item_slot_changes, get_item_slot_context);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty & /*dense, items, value, multiple*/ 2185) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(74:6) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    // (73:4) <ListItemGroup bind:value {mandatory} {multiple} {max}>
    function create_default_slot_3$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*items*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dense, items, value, multiple, $$scope*/ 8390793) {
    				each_value_1 = /*items*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(73:4) <ListItemGroup bind:value {mandatory} {multiple} {max}>",
    		ctx
    	});

    	return block;
    }

    // (43:2) <Menu offsetY={false} bind:active {disabled} {closeOnClick}>
    function create_default_slot_2$3(ctx) {
    	let listitemgroup;
    	let updating_value;
    	let current;

    	function listitemgroup_value_binding(value) {
    		/*listitemgroup_value_binding*/ ctx[21](value);
    	}

    	let listitemgroup_props = {
    		mandatory: /*mandatory*/ ctx[10],
    		multiple: /*multiple*/ ctx[11],
    		max: /*max*/ ctx[12],
    		$$slots: { default: [create_default_slot_3$3] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		listitemgroup_props.value = /*value*/ ctx[0];
    	}

    	listitemgroup = new ListItemGroup({
    			props: listitemgroup_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind$1(listitemgroup, "value", listitemgroup_value_binding));

    	const block = {
    		c: function create() {
    			create_component(listitemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(listitemgroup.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitemgroup_changes = {};
    			if (dirty & /*mandatory*/ 1024) listitemgroup_changes.mandatory = /*mandatory*/ ctx[10];
    			if (dirty & /*multiple*/ 2048) listitemgroup_changes.multiple = /*multiple*/ ctx[11];
    			if (dirty & /*max*/ 4096) listitemgroup_changes.max = /*max*/ ctx[12];

    			if (dirty & /*$$scope, items, dense, value, multiple*/ 8390793) {
    				listitemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				listitemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			listitemgroup.$set(listitemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(43:2) <Menu offsetY={false} bind:active {disabled} {closeOnClick}>",
    		ctx
    	});

    	return block;
    }

    // (45:6) <TextField          {filled}          {outlined}          {solo}          {dense}          {disabled}          value={items && format(value)}          {placeholder}          {hint}          readonly>
    function create_default_slot_1$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[23], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8388608) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[23], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(45:6) <TextField          {filled}          {outlined}          {solo}          {dense}          {disabled}          value={items && format(value)}          {placeholder}          {hint}          readonly>",
    		ctx
    	});

    	return block;
    }

    // (55:8) 
    function create_prepend_outer_slot(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[19]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[23], get_prepend_outer_slot_context);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		l: function claim(nodes) {
    			if (prepend_outer_slot) prepend_outer_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 8388608) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[23], dirty, get_prepend_outer_slot_changes, get_prepend_outer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot.name,
    		type: "slot",
    		source: "(55:8) ",
    		ctx
    	});

    	return block;
    }

    // (59:10) {#if chips && value}
    function create_if_block$1(ctx) {
    	let span;
    	let current;

    	let each_value = Array.isArray(/*value*/ ctx[0])
    	? /*value*/ ctx[0].map(/*func*/ ctx[20])
    	: [/*getSelectString*/ ctx[17](/*value*/ ctx[0])];

    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { class: true });
    			var span_nodes = children(span);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(span_nodes);
    			}

    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "class", "s-select__chips");
    			add_location(span, file$8, 59, 12, 2418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Array, value, getSelectString*/ 131073) {
    				each_value = Array.isArray(/*value*/ ctx[0])
    				? /*value*/ ctx[0].map(/*func*/ ctx[20])
    				: [/*getSelectString*/ ctx[17](/*value*/ ctx[0])];

    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(span, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:10) {#if chips && value}",
    		ctx
    	});

    	return block;
    }

    // (62:16) <Chip>
    function create_default_slot$5(ctx) {
    	let t_value = /*val*/ ctx[25] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1 && t_value !== (t_value = /*val*/ ctx[25] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(62:16) <Chip>",
    		ctx
    	});

    	return block;
    }

    // (61:14) {#each Array.isArray(value) ? value.map((v) => getSelectString(v)) : [getSelectString(value)] as val}
    function create_each_block$2(ctx) {
    	let chip;
    	let current;

    	chip = new Chip({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chip.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(chip.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chip_changes = {};

    			if (dirty & /*$$scope, value*/ 8388609) {
    				chip_changes.$$scope = { dirty, ctx };
    			}

    			chip.$set(chip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(61:14) {#each Array.isArray(value) ? value.map((v) => getSelectString(v)) : [getSelectString(value)] as val}",
    		ctx
    	});

    	return block;
    }

    // (58:8) 
    function create_content_slot(ctx) {
    	let div;
    	let current;
    	let if_block = /*chips*/ ctx[13] && /*value*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { slot: true });
    			var div_nodes = children(div);
    			if (if_block) if_block.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "slot", "content");
    			add_location(div, file$8, 57, 8, 2352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*chips*/ ctx[13] && /*value*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*chips, value*/ 8193) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(58:8) ",
    		ctx
    	});

    	return block;
    }

    // (67:8) 
    function create_append_slot(ctx) {
    	let span;
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				path: down,
    				rotate: /*active*/ ctx[1] ? 180 : 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { slot: true });
    			var span_nodes = children(span);
    			claim_component(icon.$$.fragment, span_nodes);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "slot", "append");
    			add_location(span, file$8, 66, 8, 2688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*active*/ 2) icon_changes.rotate = /*active*/ ctx[1] ? 180 : 0;
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_slot.name,
    		type: "slot",
    		source: "(67:8) ",
    		ctx
    	});

    	return block;
    }

    // (70:8) 
    function create_append_outer_slot(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[19]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[23], get_append_outer_slot_context);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		l: function claim(nodes) {
    			if (append_outer_slot) append_outer_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 8388608) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[23], dirty, get_append_outer_slot_changes, get_append_outer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot.name,
    		type: "slot",
    		source: "(70:8) ",
    		ctx
    	});

    	return block;
    }

    // (44:4) 
    function create_activator_slot(ctx) {
    	let span;
    	let textfield;
    	let current;

    	textfield = new TextField({
    			props: {
    				filled: /*filled*/ ctx[4],
    				outlined: /*outlined*/ ctx[5],
    				solo: /*solo*/ ctx[6],
    				dense: /*dense*/ ctx[7],
    				disabled: /*disabled*/ ctx[14],
    				value: /*items*/ ctx[3] && /*format*/ ctx[16](/*value*/ ctx[0]),
    				placeholder: /*placeholder*/ ctx[8],
    				hint: /*hint*/ ctx[9],
    				readonly: true,
    				$$slots: {
    					"append-outer": [create_append_outer_slot],
    					append: [create_append_slot],
    					content: [create_content_slot],
    					"prepend-outer": [create_prepend_outer_slot],
    					default: [create_default_slot_1$3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(textfield.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { slot: true });
    			var span_nodes = children(span);
    			claim_component(textfield.$$.fragment, span_nodes);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "slot", "activator");
    			add_location(span, file$8, 43, 4, 2032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(textfield, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty & /*filled*/ 16) textfield_changes.filled = /*filled*/ ctx[4];
    			if (dirty & /*outlined*/ 32) textfield_changes.outlined = /*outlined*/ ctx[5];
    			if (dirty & /*solo*/ 64) textfield_changes.solo = /*solo*/ ctx[6];
    			if (dirty & /*dense*/ 128) textfield_changes.dense = /*dense*/ ctx[7];
    			if (dirty & /*disabled*/ 16384) textfield_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty & /*items, format, value*/ 65545) textfield_changes.value = /*items*/ ctx[3] && /*format*/ ctx[16](/*value*/ ctx[0]);
    			if (dirty & /*placeholder*/ 256) textfield_changes.placeholder = /*placeholder*/ ctx[8];
    			if (dirty & /*hint*/ 512) textfield_changes.hint = /*hint*/ ctx[9];

    			if (dirty & /*$$scope, active, value, chips*/ 8396803) {
    				textfield_changes.$$scope = { dirty, ctx };
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(textfield);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot.name,
    		type: "slot",
    		source: "(44:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let menu;
    	let updating_active;
    	let div_class_value;
    	let current;

    	function menu_active_binding(value) {
    		/*menu_active_binding*/ ctx[22](value);
    	}

    	let menu_props = {
    		offsetY: false,
    		disabled: /*disabled*/ ctx[14],
    		closeOnClick: /*closeOnClick*/ ctx[15],
    		$$slots: {
    			activator: [create_activator_slot],
    			default: [create_default_slot_2$3]
    		},
    		$$scope: { ctx }
    	};

    	if (/*active*/ ctx[1] !== void 0) {
    		menu_props.active = /*active*/ ctx[1];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(menu, "active", menu_active_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(menu.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(menu.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "s-select " + /*klass*/ ctx[2]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[14]);
    			toggle_class(div, "chips", /*chips*/ ctx[13]);
    			add_location(div, file$8, 41, 0, 1905);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menu, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menu_changes = {};
    			if (dirty & /*disabled*/ 16384) menu_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty & /*closeOnClick*/ 32768) menu_changes.closeOnClick = /*closeOnClick*/ ctx[15];

    			if (dirty & /*$$scope, filled, outlined, solo, dense, disabled, items, format, value, placeholder, hint, active, chips, mandatory, multiple, max*/ 8486907) {
    				menu_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 2) {
    				updating_active = true;
    				menu_changes.active = /*active*/ ctx[1];
    				add_flush_callback(() => updating_active = false);
    			}

    			menu.$set(menu_changes);

    			if (!current || dirty & /*klass*/ 4 && div_class_value !== (div_class_value = "s-select " + /*klass*/ ctx[2])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, disabled*/ 16388) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[14]);
    			}

    			if (dirty & /*klass, chips*/ 8196) {
    				toggle_class(div, "chips", /*chips*/ ctx[13]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, ['append-outer','prepend-outer','default','item']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { value = [] } = $$props;
    	let { items = [] } = $$props;
    	let { filled = false } = $$props;
    	let { outlined = false } = $$props;
    	let { solo = false } = $$props;
    	let { dense = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { mandatory = false } = $$props;
    	let { multiple = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { chips = false } = $$props;
    	let { disabled = null } = $$props;
    	let { closeOnClick = !multiple } = $$props;
    	let { emptyString = "" } = $$props;

    	const getSelectString = v => {
    		// We could also use `return items[0].value ? find.. : v` or provide a `basic` prop
    		const item = items.find(i => i.value === v);

    		return item ? item.name ? item.name : item : v || emptyString;
    	};

    	let { format = val => Array.isArray(val)
    	? val.map(v => getSelectString(v)).join(", ")
    	: getSelectString(val) } = $$props;

    	const dispatch = createEventDispatcher();

    	const writable_props = [
    		"class",
    		"active",
    		"value",
    		"items",
    		"filled",
    		"outlined",
    		"solo",
    		"dense",
    		"placeholder",
    		"hint",
    		"mandatory",
    		"multiple",
    		"max",
    		"chips",
    		"disabled",
    		"closeOnClick",
    		"emptyString",
    		"format"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	const func = v => getSelectString(v);

    	function listitemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function menu_active_binding(value) {
    		active = value;
    		$$invalidate(1, active);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(2, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("filled" in $$props) $$invalidate(4, filled = $$props.filled);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ("solo" in $$props) $$invalidate(6, solo = $$props.solo);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("hint" in $$props) $$invalidate(9, hint = $$props.hint);
    		if ("mandatory" in $$props) $$invalidate(10, mandatory = $$props.mandatory);
    		if ("multiple" in $$props) $$invalidate(11, multiple = $$props.multiple);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("chips" in $$props) $$invalidate(13, chips = $$props.chips);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$props.disabled);
    		if ("closeOnClick" in $$props) $$invalidate(15, closeOnClick = $$props.closeOnClick);
    		if ("emptyString" in $$props) $$invalidate(18, emptyString = $$props.emptyString);
    		if ("format" in $$props) $$invalidate(16, format = $$props.format);
    		if ("$$scope" in $$props) $$invalidate(23, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		TextField,
    		Menu,
    		ListItemGroup,
    		ListItem,
    		Chip,
    		Checkbox,
    		Icon,
    		DOWN_ICON: down,
    		klass,
    		active,
    		value,
    		items,
    		filled,
    		outlined,
    		solo,
    		dense,
    		placeholder,
    		hint,
    		mandatory,
    		multiple,
    		max,
    		chips,
    		disabled,
    		closeOnClick,
    		emptyString,
    		getSelectString,
    		format,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("filled" in $$props) $$invalidate(4, filled = $$props.filled);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ("solo" in $$props) $$invalidate(6, solo = $$props.solo);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("hint" in $$props) $$invalidate(9, hint = $$props.hint);
    		if ("mandatory" in $$props) $$invalidate(10, mandatory = $$props.mandatory);
    		if ("multiple" in $$props) $$invalidate(11, multiple = $$props.multiple);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("chips" in $$props) $$invalidate(13, chips = $$props.chips);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$props.disabled);
    		if ("closeOnClick" in $$props) $$invalidate(15, closeOnClick = $$props.closeOnClick);
    		if ("emptyString" in $$props) $$invalidate(18, emptyString = $$props.emptyString);
    		if ("format" in $$props) $$invalidate(16, format = $$props.format);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			dispatch("change", value);
    		}
    	};

    	return [
    		value,
    		active,
    		klass,
    		items,
    		filled,
    		outlined,
    		solo,
    		dense,
    		placeholder,
    		hint,
    		mandatory,
    		multiple,
    		max,
    		chips,
    		disabled,
    		closeOnClick,
    		format,
    		getSelectString,
    		emptyString,
    		slots,
    		func,
    		listitemgroup_value_binding,
    		menu_active_binding,
    		$$scope
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 2,
    			active: 1,
    			value: 0,
    			items: 3,
    			filled: 4,
    			outlined: 5,
    			solo: 6,
    			dense: 7,
    			placeholder: 8,
    			hint: 9,
    			mandatory: 10,
    			multiple: 11,
    			max: 12,
    			chips: 13,
    			disabled: 14,
    			closeOnClick: 15,
    			emptyString: 18,
    			format: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chips() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chips(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClick() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClick(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get emptyString() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emptyString(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Grid\Row.svelte generated by Svelte v3.37.0 */

    const file$7 = "node_modules\\svelte-materialify\\dist\\components\\Grid\\Row.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, style: true });
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "s-row " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[3]);
    			toggle_class(div, "dense", /*dense*/ ctx[1]);
    			toggle_class(div, "no-gutters", /*noGutters*/ ctx[2]);
    			add_location(div, file$7, 10, 0, 518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-row " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 8) {
    				attr_dev(div, "style", /*style*/ ctx[3]);
    			}

    			if (dirty & /*klass, dense*/ 3) {
    				toggle_class(div, "dense", /*dense*/ ctx[1]);
    			}

    			if (dirty & /*klass, noGutters*/ 5) {
    				toggle_class(div, "no-gutters", /*noGutters*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Row", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { dense = false } = $$props;
    	let { noGutters = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "dense", "noGutters", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("noGutters" in $$props) $$invalidate(2, noGutters = $$props.noGutters);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, dense, noGutters, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("dense" in $$props) $$invalidate(1, dense = $$props.dense);
    		if ("noGutters" in $$props) $$invalidate(2, noGutters = $$props.noGutters);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, dense, noGutters, style, $$scope, slots];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 0,
    			dense: 1,
    			noGutters: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutters() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutters(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Grid\Col.svelte generated by Svelte v3.37.0 */
    const file$6 = "node_modules\\svelte-materialify\\dist\\components\\Grid\\Col.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let div_class_value;
    	let Class_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, style: true });
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "s-col " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[11]);
    			add_location(div, file$6, 20, 0, 7834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Class_action = Class.call(null, div, [
    					/*cols*/ ctx[1] && `col-${/*cols*/ ctx[1]}`,
    					/*sm*/ ctx[2] && `sm-${/*sm*/ ctx[2]}`,
    					/*md*/ ctx[3] && `md-${/*md*/ ctx[3]}`,
    					/*lg*/ ctx[4] && `lg-${/*lg*/ ctx[4]}`,
    					/*xl*/ ctx[5] && `xl-${/*xl*/ ctx[5]}`,
    					/*offset*/ ctx[6] && `offset-${/*offset*/ ctx[6]}`,
    					/*offset_sm*/ ctx[7] && `offset-sm-${/*offset_sm*/ ctx[7]}`,
    					/*offset_md*/ ctx[8] && `offset-md-${/*offset_md*/ ctx[8]}`,
    					/*offset_lg*/ ctx[9] && `offset-lg-${/*offset_lg*/ ctx[9]}`,
    					/*offset_xl*/ ctx[10] && `offset-xl-${/*offset_xl*/ ctx[10]}`
    				]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-col " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2048) {
    				attr_dev(div, "style", /*style*/ ctx[11]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*cols, sm, md, lg, xl, offset, offset_sm, offset_md, offset_lg, offset_xl*/ 2046) Class_action.update.call(null, [
    				/*cols*/ ctx[1] && `col-${/*cols*/ ctx[1]}`,
    				/*sm*/ ctx[2] && `sm-${/*sm*/ ctx[2]}`,
    				/*md*/ ctx[3] && `md-${/*md*/ ctx[3]}`,
    				/*lg*/ ctx[4] && `lg-${/*lg*/ ctx[4]}`,
    				/*xl*/ ctx[5] && `xl-${/*xl*/ ctx[5]}`,
    				/*offset*/ ctx[6] && `offset-${/*offset*/ ctx[6]}`,
    				/*offset_sm*/ ctx[7] && `offset-sm-${/*offset_sm*/ ctx[7]}`,
    				/*offset_md*/ ctx[8] && `offset-md-${/*offset_md*/ ctx[8]}`,
    				/*offset_lg*/ ctx[9] && `offset-lg-${/*offset_lg*/ ctx[9]}`,
    				/*offset_xl*/ ctx[10] && `offset-xl-${/*offset_xl*/ ctx[10]}`
    			]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Col", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { cols = false } = $$props;
    	let { sm = false } = $$props;
    	let { md = false } = $$props;
    	let { lg = false } = $$props;
    	let { xl = false } = $$props;
    	let { offset = false } = $$props;
    	let { offset_sm = false } = $$props;
    	let { offset_md = false } = $$props;
    	let { offset_lg = false } = $$props;
    	let { offset_xl = false } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"cols",
    		"sm",
    		"md",
    		"lg",
    		"xl",
    		"offset",
    		"offset_sm",
    		"offset_md",
    		"offset_lg",
    		"offset_xl",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Col> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("cols" in $$props) $$invalidate(1, cols = $$props.cols);
    		if ("sm" in $$props) $$invalidate(2, sm = $$props.sm);
    		if ("md" in $$props) $$invalidate(3, md = $$props.md);
    		if ("lg" in $$props) $$invalidate(4, lg = $$props.lg);
    		if ("xl" in $$props) $$invalidate(5, xl = $$props.xl);
    		if ("offset" in $$props) $$invalidate(6, offset = $$props.offset);
    		if ("offset_sm" in $$props) $$invalidate(7, offset_sm = $$props.offset_sm);
    		if ("offset_md" in $$props) $$invalidate(8, offset_md = $$props.offset_md);
    		if ("offset_lg" in $$props) $$invalidate(9, offset_lg = $$props.offset_lg);
    		if ("offset_xl" in $$props) $$invalidate(10, offset_xl = $$props.offset_xl);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Class,
    		klass,
    		cols,
    		sm,
    		md,
    		lg,
    		xl,
    		offset,
    		offset_sm,
    		offset_md,
    		offset_lg,
    		offset_xl,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("cols" in $$props) $$invalidate(1, cols = $$props.cols);
    		if ("sm" in $$props) $$invalidate(2, sm = $$props.sm);
    		if ("md" in $$props) $$invalidate(3, md = $$props.md);
    		if ("lg" in $$props) $$invalidate(4, lg = $$props.lg);
    		if ("xl" in $$props) $$invalidate(5, xl = $$props.xl);
    		if ("offset" in $$props) $$invalidate(6, offset = $$props.offset);
    		if ("offset_sm" in $$props) $$invalidate(7, offset_sm = $$props.offset_sm);
    		if ("offset_md" in $$props) $$invalidate(8, offset_md = $$props.offset_md);
    		if ("offset_lg" in $$props) $$invalidate(9, offset_lg = $$props.offset_lg);
    		if ("offset_xl" in $$props) $$invalidate(10, offset_xl = $$props.offset_xl);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		cols,
    		sm,
    		md,
    		lg,
    		xl,
    		offset,
    		offset_sm,
    		offset_md,
    		offset_lg,
    		offset_xl,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Col extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 0,
    			cols: 1,
    			sm: 2,
    			md: 3,
    			lg: 4,
    			xl: 5,
    			offset: 6,
    			offset_sm: 7,
    			offset_md: 8,
    			offset_lg: 9,
    			offset_xl: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Col",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cols() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cols(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_sm() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_sm(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_md() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_md(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_lg() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_lg(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset_xl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset_xl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const emailRules = [
        (v) => !!v || 'Required',
        (v) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(v) || 'Invalid e-mail.';
    },
    ];

    const passwordRules = [
      (v) => !!v || 'Required',
      (v) => {
        const pattern = /^\S*$/;
        return pattern.test(v) || "Password must not contain a space"
      },
      (v) => v.length >= 8 || 'Password is 8 characters or more.'
    ];

    const numericRules = [
      (v) => {
        const pattern = /^[0-9]*$/;
        return pattern.test(v) || "Text should be numbers"
      }
    ];


    // export const authenticate = async () => {
    //   // /console.log("Authenticating");
    //   try{
    //       const res = await axios({
    //         method: "GET",
    //         withCredentials: true,
    //         url: `${"https://localhost:44390/"}api/auth/verify`,
    //       });
    //       //if unauthorized
    //     // if(res.status === 401)
      
    //     if(res.status === 200){
    //        // window.location.assign(`${"https://localhost:44390/"}dashboard`);  
    //       return await res.data;
    //     }


    //   }catch(err){
    //     if(window.location.href !== "https://localhost:44390/")
    //       window.location.assign("/");
    //       return null;
        
    //   }
    // }

    const getSessionData = async () => {
      try{
          const res = await axios({
            method: "GET",
            withCredentials: true,
            url: `${"https://localhost:44390/"}api/session`,
          });
          console.log(res);


        if(res.status === 200){
          return await res.data;
        }
      }catch(err){
          window.location.assign("/");
          return null;

    }};


    const getMyProjects = async () => {
      try{

        const res = await axios({
          method: "GET",
          withCredentials: true,
          url: `${"https://localhost:44390/"}api/projects/me`,
        });
        return res.data;
      }catch(err){  
        alert(err);
        
      }
    };

    /* src\pages\Login.svelte generated by Svelte v3.37.0 */

    const { console: console_1$3 } = globals;
    const file$5 = "src\\pages\\Login.svelte";

    // (38:8) <MaterialApp>
    function create_default_slot$4(ctx) {
    	let textfield0;
    	let updating_value;
    	let t0;
    	let textfield1;
    	let updating_value_1;
    	let t1;
    	let button;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[3](value);
    	}

    	let textfield0_props = {
    		placeholder: "Email",
    		color: "#ff3e00",
    		rules: emailRules,
    		style: "margin-bottom: 2.4rem",
    		name: "email",
    		id: "email"
    	};

    	if (/*email*/ ctx[0] !== void 0) {
    		textfield0_props.value = /*email*/ ctx[0];
    	}

    	textfield0 = new TextField({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield0, "value", textfield0_value_binding));

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[4](value);
    	}

    	let textfield1_props = {
    		placeholder: "Password",
    		color: "#ff3e00",
    		rules: passwordRules,
    		style: "margin-bottom: 2.4rem",
    		type: "password",
    		name: "password",
    		id: "password"
    	};

    	if (/*password*/ ctx[1] !== void 0) {
    		textfield1_props.value = /*password*/ ctx[1];
    	}

    	textfield1 = new TextField({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield1, "value", textfield1_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textfield0.$$.fragment);
    			t0 = space();
    			create_component(textfield1.$$.fragment);
    			t1 = space();
    			button = element("button");
    			t2 = text("LOGIN");
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(textfield0.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(textfield1.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t2 = claim_text(button_nodes, "LOGIN");
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "btn svelte-9j3r4e");
    			add_location(button, file$5, 40, 12, 1346);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*login*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const textfield0_changes = {};

    			if (!updating_value && dirty & /*email*/ 1) {
    				updating_value = true;
    				textfield0_changes.value = /*email*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*password*/ 2) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*password*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(textfield1, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(38:8) <MaterialApp>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text("Projector");
    			t1 = space();
    			create_component(materialapp.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			h2 = claim_element(div_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Projector");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			claim_component(materialapp.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "svelte-9j3r4e");
    			add_location(h2, file$5, 36, 4, 944);
    			attr_dev(div, "class", "form-login svelte-9j3r4e");
    			add_location(div, file$5, 35, 0, 914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			mount_component(materialapp, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, password, email*/ 35) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(materialapp);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	let email = "";
    	let password = "";
    	console.log("COOKIE" + document.cookie.jwt);

    	const login = async () => {
    		console.log("https://localhost:44390/");

    		try {
    			const res = await axios({
    				method: "POST",
    				withCredentials: true,
    				url: `${"https://localhost:44390/"}api/auth/login`,
    				data: { username: email, password }
    			});

    			if (res.status === 200) {
    				alert("Welcome back!");
    				console.log(res);
    			}

    			console.log(res);
    		} catch(err) {
    			alert(err);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function textfield0_value_binding(value) {
    		email = value;
    		$$invalidate(0, email);
    	}

    	function textfield1_value_binding(value) {
    		password = value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		TextField,
    		MaterialApp,
    		emailRules,
    		passwordRules,
    		axios,
    		email,
    		password,
    		login
    	});

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, password, login, textfield0_value_binding, textfield1_value_binding];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\Dashboard.svelte generated by Svelte v3.37.0 */
    const file$4 = "src\\pages\\Dashboard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>  import {link }
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>  import {link }",
    		ctx
    	});

    	return block;
    }

    // (12:40)               {#if projects.length === 0}
    function create_then_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*projects*/ ctx[2].length === 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(12:40)               {#if projects.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (15:12) {:else}
    function create_else_block(ctx) {
    	let table;
    	let tr;
    	let th0;
    	let t0;
    	let t1;
    	let th1;
    	let t2;
    	let t3;
    	let th2;
    	let t4;
    	let t5;
    	let each_value = /*projects*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			t0 = text("Project Name");
    			t1 = space();
    			th1 = element("th");
    			t2 = text("Budget");
    			t3 = space();
    			th2 = element("th");
    			t4 = text("Tasks");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			table = claim_element(nodes, "TABLE", {
    				cellpadding: true,
    				cellspacing: true,
    				class: true
    			});

    			var table_nodes = children(table);
    			tr = claim_element(table_nodes, "TR", { class: true });
    			var tr_nodes = children(tr);
    			th0 = claim_element(tr_nodes, "TH", { class: true });
    			var th0_nodes = children(th0);
    			t0 = claim_text(th0_nodes, "Project Name");
    			th0_nodes.forEach(detach_dev);
    			t1 = claim_space(tr_nodes);
    			th1 = claim_element(tr_nodes, "TH", { class: true });
    			var th1_nodes = children(th1);
    			t2 = claim_text(th1_nodes, "Budget");
    			th1_nodes.forEach(detach_dev);
    			t3 = claim_space(tr_nodes);
    			th2 = claim_element(tr_nodes, "TH", { class: true });
    			var th2_nodes = children(th2);
    			t4 = claim_text(th2_nodes, "Tasks");
    			th2_nodes.forEach(detach_dev);
    			tr_nodes.forEach(detach_dev);
    			t5 = claim_space(table_nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(table_nodes);
    			}

    			table_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(th0, "class", "svelte-jsxg1o");
    			add_location(th0, file$4, 17, 24, 542);
    			attr_dev(th1, "class", "svelte-jsxg1o");
    			add_location(th1, file$4, 18, 24, 589);
    			attr_dev(th2, "class", "svelte-jsxg1o");
    			add_location(th2, file$4, 19, 24, 630);
    			attr_dev(tr, "class", "svelte-jsxg1o");
    			add_location(tr, file$4, 16, 20, 512);
    			attr_dev(table, "cellpadding", "0");
    			attr_dev(table, "cellspacing", "0");
    			attr_dev(table, "class", "svelte-jsxg1o");
    			add_location(table, file$4, 15, 16, 451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(th0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(th1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(th2, t4);
    			append_dev(table, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*myProject*/ 2) {
    				each_value = /*projects*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:12) {#if projects.length === 0}
    function create_if_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("No Projects Assigned for you");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", {});
    			var p_nodes = children(p);
    			t = claim_text(p_nodes, "No Projects Assigned for you");
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(p, file$4, 13, 16, 377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:12) {#if projects.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (22:20) {#each projects as project}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*project*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*project*/ ctx[3].budget + "";
    	let t2;
    	let t3;
    	let td2;
    	let a;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			a = element("a");
    			t4 = text("Tasks");
    			t5 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			tr = claim_element(nodes, "TR", { class: true });
    			var tr_nodes = children(tr);
    			td0 = claim_element(tr_nodes, "TD", { class: true });
    			var td0_nodes = children(td0);
    			t0 = claim_text(td0_nodes, t0_value);
    			td0_nodes.forEach(detach_dev);
    			t1 = claim_space(tr_nodes);
    			td1 = claim_element(tr_nodes, "TD", { class: true });
    			var td1_nodes = children(td1);
    			t2 = claim_text(td1_nodes, t2_value);
    			td1_nodes.forEach(detach_dev);
    			t3 = claim_space(tr_nodes);
    			td2 = claim_element(tr_nodes, "TD", { class: true });
    			var td2_nodes = children(td2);
    			a = claim_element(td2_nodes, "A", { href: true, style: true });
    			var a_nodes = children(a);
    			t4 = claim_text(a_nodes, "Tasks");
    			a_nodes.forEach(detach_dev);
    			td2_nodes.forEach(detach_dev);
    			t5 = claim_space(tr_nodes);
    			tr_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(td0, "class", "svelte-jsxg1o");
    			add_location(td0, file$4, 23, 28, 780);
    			attr_dev(td1, "class", "svelte-jsxg1o");
    			add_location(td1, file$4, 24, 28, 833);
    			attr_dev(a, "href", "/app/projects/" + /*project*/ ctx[3].id);
    			set_style(a, "color", "blue");
    			add_location(a, file$4, 25, 32, 892);
    			attr_dev(td2, "class", "svelte-jsxg1o");
    			add_location(td2, file$4, 25, 28, 888);
    			attr_dev(tr, "class", "svelte-jsxg1o");
    			add_location(tr, file$4, 22, 24, 746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, a);
    			append_dev(a, t4);
    			append_dev(tr, t5);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(22:20) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import {link }
    function create_pending_block$2(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(1:0) <script>  import {link }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let br;
    	let t4;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 2
    	};

    	handle_promise(/*myProject*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text("Welcome, ");
    			t1 = text(/*user*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			info.block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { style: true });
    			var div_nodes = children(div);
    			h3 = claim_element(div_nodes, "H3", { style: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, "Welcome, ");
    			t1 = claim_text(h3_nodes, /*user*/ ctx[0]);
    			t2 = claim_text(h3_nodes, "!");
    			h3_nodes.forEach(detach_dev);
    			t3 = claim_space(div_nodes);
    			br = claim_element(div_nodes, "BR", {});
    			t4 = claim_space(div_nodes);
    			info.block.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(h3, "text-align", "left");
    			add_location(h3, file$4, 9, 8, 210);
    			add_location(br, file$4, 10, 8, 271);
    			set_style(div, "margin", "0 3.2rem");
    			add_location(div, file$4, 8, 4, 170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(div, t3);
    			append_dev(div, br);
    			append_dev(div, t4);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*user*/ 1) set_data_dev(t1, /*user*/ ctx[0]);

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[2] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dashboard", slots, []);
    	const myProject = getMyProjects();
    	let { user } = $$props;
    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({ link, getMyProjects, myProject, user });

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, myProject];
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dashboard",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console.warn("<Dashboard> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<Dashboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Dashboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\PeopleForm.svelte generated by Svelte v3.37.0 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\pages\\PeopleForm.svelte";

    // (70:16) <Col>
    function create_default_slot_6$1(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[7](value);
    	}

    	let textfield_props = {
    		placeholder: "First Name",
    		color: "#ff3e00",
    		style: "margin-bottom: 2.4rem",
    		name: "firstname",
    		id: "firstname"
    	};

    	if (/*firstname*/ ctx[1] !== void 0) {
    		textfield_props.value = /*firstname*/ ctx[1];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield, "value", textfield_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(textfield.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*firstname*/ 2) {
    				updating_value = true;
    				textfield_changes.value = /*firstname*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(70:16) <Col>",
    		ctx
    	});

    	return block;
    }

    // (73:16) <Col>
    function create_default_slot_5$1(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding_1(value) {
    		/*textfield_value_binding_1*/ ctx[8](value);
    	}

    	let textfield_props = {
    		placeholder: "Last Name",
    		color: "#ff3e00",
    		style: "margin-bottom: 2.4rem",
    		name: "lastname",
    		id: "lastname"
    	};

    	if (/*lastname*/ ctx[2] !== void 0) {
    		textfield_props.value = /*lastname*/ ctx[2];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield, "value", textfield_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(textfield.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*lastname*/ 4) {
    				updating_value = true;
    				textfield_changes.value = /*lastname*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(73:16) <Col>",
    		ctx
    	});

    	return block;
    }

    // (69:12) <Row>
    function create_default_slot_4$2(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(col0.$$.fragment, nodes);
    			t = claim_space(nodes);
    			claim_component(col1.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope, firstname*/ 2050) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope, lastname*/ 2052) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(69:12) <Row>",
    		ctx
    	});

    	return block;
    }

    // (78:16) <Col>
    function create_default_slot_3$2(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding_2(value) {
    		/*textfield_value_binding_2*/ ctx[9](value);
    	}

    	let textfield_props = {
    		placeholder: "Email",
    		color: "#ff3e00",
    		rules: emailRules,
    		style: "margin-bottom: 2.4rem",
    		type: "email",
    		name: "email",
    		id: "email"
    	};

    	if (/*email*/ ctx[3] !== void 0) {
    		textfield_props.value = /*email*/ ctx[3];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield, "value", textfield_value_binding_2));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(textfield.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*email*/ 8) {
    				updating_value = true;
    				textfield_changes.value = /*email*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(78:16) <Col>",
    		ctx
    	});

    	return block;
    }

    // (81:16) <Col>
    function create_default_slot_2$2(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding_3(value) {
    		/*textfield_value_binding_3*/ ctx[10](value);
    	}

    	let textfield_props = {
    		placeholder: "Password",
    		color: "#ff3e00",
    		rules: passwordRules,
    		style: "margin-bottom: 2.4rem",
    		type: "password",
    		name: "password",
    		id: "password"
    	};

    	if (/*password*/ ctx[4] !== void 0) {
    		textfield_props.value = /*password*/ ctx[4];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield, "value", textfield_value_binding_3));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(textfield.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*password*/ 16) {
    				updating_value = true;
    				textfield_changes.value = /*password*/ ctx[4];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(81:16) <Col>",
    		ctx
    	});

    	return block;
    }

    // (77:12) <Row>
    function create_default_slot_1$2(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(col0.$$.fragment, nodes);
    			t = claim_space(nodes);
    			claim_component(col1.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope, email*/ 2056) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope, password*/ 2064) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(77:12) <Row>",
    		ctx
    	});

    	return block;
    }

    // (68:8) <MaterialApp>
    function create_default_slot$3(ctx) {
    	let row0;
    	let t0;
    	let row1;
    	let t1;
    	let button0;
    	let t2;
    	let t3;
    	let button1;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;

    	row0 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t0 = space();
    			create_component(row1.$$.fragment);
    			t1 = space();
    			button0 = element("button");
    			t2 = text("ADD PERSON");
    			t3 = space();
    			button1 = element("button");
    			t4 = text("RESET PEOPLE");
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(row0.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(row1.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			button0 = claim_element(nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t2 = claim_text(button0_nodes, "ADD PERSON");
    			button0_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			button1 = claim_element(nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			t4 = claim_text(button1_nodes, "RESET PEOPLE");
    			button1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button0, "class", "btn svelte-4nhtjf");
    			add_location(button0, file$3, 84, 12, 2963);
    			attr_dev(button1, "class", "btn btn--dangerous svelte-4nhtjf");
    			add_location(button1, file$3, 85, 12, 3037);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button0, anchor);
    			append_dev(button0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, t4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addPerson*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*deletePeople*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};

    			if (dirty & /*$$scope, lastname, firstname*/ 2054) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope, password, email*/ 2072) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(row1, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(68:8) <MaterialApp>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let h30;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let h31;
    	let t4;
    	let t5;
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h30 = element("h3");
    			t0 = text("Welcome, ");
    			t1 = text(/*user*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			div0 = element("div");
    			h31 = element("h3");
    			t4 = text("Add People");
    			t5 = space();
    			create_component(materialapp.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { style: true });
    			var div1_nodes = children(div1);
    			h30 = claim_element(div1_nodes, "H3", { style: true });
    			var h30_nodes = children(h30);
    			t0 = claim_text(h30_nodes, "Welcome, ");
    			t1 = claim_text(h30_nodes, /*user*/ ctx[0]);
    			t2 = claim_text(h30_nodes, "!");
    			h30_nodes.forEach(detach_dev);
    			t3 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { style: true, class: true });
    			var div0_nodes = children(div0);
    			h31 = claim_element(div0_nodes, "H3", { style: true });
    			var h31_nodes = children(h31);
    			t4 = claim_text(h31_nodes, "Add People");
    			h31_nodes.forEach(detach_dev);
    			t5 = claim_space(div0_nodes);
    			claim_component(materialapp.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(h30, "text-align", "left");
    			add_location(h30, file$3, 64, 4, 1737);
    			set_style(h31, "padding-bottom", "3.2rem");
    			add_location(h31, file$3, 66, 8, 1857);
    			set_style(div0, "margin-top", "3.6rem");
    			attr_dev(div0, "class", "form-container");
    			add_location(div0, file$3, 65, 4, 1793);
    			set_style(div1, "margin", "0 3.2rem");
    			add_location(div1, file$3, 63, 0, 1701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h30);
    			append_dev(h30, t0);
    			append_dev(h30, t1);
    			append_dev(h30, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h31);
    			append_dev(h31, t4);
    			append_dev(div0, t5);
    			mount_component(materialapp, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*user*/ 1) set_data_dev(t1, /*user*/ ctx[0]);
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, password, email, lastname, firstname*/ 2078) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(materialapp);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PeopleForm", slots, []);
    	let { user } = $$props;
    	let firstname = "";
    	let lastname = "";
    	let email = "";
    	let password = "";

    	const addPerson = async () => {
    		console.log("Add Person");

    		try {
    			if (!lastname || !firstname || !email || !password) throw "Please input all data required";
    			if ((/^S*$/).test(password)) throw "Password must not contain a space";

    			const res = await axios({
    				method: "POST",
    				url: `${"https://localhost:44390/"}api/people`,
    				data: {
    					last_name: lastname,
    					first_name: firstname,
    					username: email,
    					password
    				}
    			});

    			if (res.status === 201) {
    				alert("User Successfully Added! Redirecting to Dashboard");
    				window.location.href = "/app";
    			}
    		} catch(err) {
    			//      console.log(err);
    			alert(err);
    		}
    	};

    	const deletePeople = async () => {
    		console.log("Delete People");

    		try {
    			const res = await axios({
    				method: "DELETE",
    				url: `${"https://localhost:44390/"}api/people`
    			});

    			if (res.status === 204) {
    				alert("All People Successfully Delete");
    			}
    		} catch(err) {
    			alert("Unsuccessful");
    		}
    	};

    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<PeopleForm> was created with unknown prop '${key}'`);
    	});

    	function textfield_value_binding(value) {
    		firstname = value;
    		$$invalidate(1, firstname);
    	}

    	function textfield_value_binding_1(value) {
    		lastname = value;
    		$$invalidate(2, lastname);
    	}

    	function textfield_value_binding_2(value) {
    		email = value;
    		$$invalidate(3, email);
    	}

    	function textfield_value_binding_3(value) {
    		password = value;
    		$$invalidate(4, password);
    	}

    	$$self.$$set = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		MaterialApp,
    		TextField,
    		Row,
    		Col,
    		emailRules,
    		passwordRules,
    		axios,
    		user,
    		firstname,
    		lastname,
    		email,
    		password,
    		addPerson,
    		deletePeople
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    		if ("firstname" in $$props) $$invalidate(1, firstname = $$props.firstname);
    		if ("lastname" in $$props) $$invalidate(2, lastname = $$props.lastname);
    		if ("email" in $$props) $$invalidate(3, email = $$props.email);
    		if ("password" in $$props) $$invalidate(4, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		user,
    		firstname,
    		lastname,
    		email,
    		password,
    		addPerson,
    		deletePeople,
    		textfield_value_binding,
    		textfield_value_binding_1,
    		textfield_value_binding_2,
    		textfield_value_binding_3
    	];
    }

    class PeopleForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PeopleForm",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console_1$2.warn("<PeopleForm> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<PeopleForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<PeopleForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\ProjectForm.svelte generated by Svelte v3.37.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\pages\\ProjectForm.svelte";

    // (61:12) <MaterialApp>
    function create_default_slot$2(ctx) {
    	let textfield0;
    	let updating_value;
    	let t0;
    	let textfield1;
    	let updating_value_1;
    	let t1;
    	let textfield2;
    	let updating_value_2;
    	let t2;
    	let textarea;
    	let updating_value_3;
    	let t3;
    	let button0;
    	let t4;
    	let t5;
    	let button1;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[7](value);
    	}

    	let textfield0_props = {
    		placeholder: "Code",
    		color: "#ff3e00",
    		style: "margin-bottom: 2.1rem",
    		name: "code",
    		id: "code"
    	};

    	if (/*code*/ ctx[1] !== void 0) {
    		textfield0_props.value = /*code*/ ctx[1];
    	}

    	textfield0 = new TextField({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield0, "value", textfield0_value_binding));

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[8](value);
    	}

    	let textfield1_props = {
    		placeholder: "Name",
    		color: "#ff3e00",
    		style: "margin-bottom: 2.1rem",
    		name: "name",
    		id: "name"
    	};

    	if (/*name*/ ctx[2] !== void 0) {
    		textfield1_props.value = /*name*/ ctx[2];
    	}

    	textfield1 = new TextField({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield1, "value", textfield1_value_binding));

    	function textfield2_value_binding(value) {
    		/*textfield2_value_binding*/ ctx[9](value);
    	}

    	let textfield2_props = {
    		placeholder: "Budget",
    		color: "#ff3e00",
    		rules: numericRules,
    		style: "margin-bottom: 2.1rem",
    		name: "budget",
    		id: "budget",
    		type: "number"
    	};

    	if (/*budget*/ ctx[3] !== void 0) {
    		textfield2_props.value = /*budget*/ ctx[3];
    	}

    	textfield2 = new TextField({ props: textfield2_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield2, "value", textfield2_value_binding));

    	function textarea_value_binding(value) {
    		/*textarea_value_binding*/ ctx[10](value);
    	}

    	let textarea_props = {
    		outlined: true,
    		clearable: true,
    		autogrow: true,
    		rows: 3,
    		placeholder: "Remarks",
    		color: "#ff3e00",
    		style: "margin-bottom: 2.1rem",
    		name: "remarks",
    		id: "remarks"
    	};

    	if (/*remarks*/ ctx[4] !== void 0) {
    		textarea_props.value = /*remarks*/ ctx[4];
    	}

    	textarea = new Textarea({ props: textarea_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textarea, "value", textarea_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textfield0.$$.fragment);
    			t0 = space();
    			create_component(textfield1.$$.fragment);
    			t1 = space();
    			create_component(textfield2.$$.fragment);
    			t2 = space();
    			create_component(textarea.$$.fragment);
    			t3 = space();
    			button0 = element("button");
    			t4 = text("ADD PROJECT");
    			t5 = space();
    			button1 = element("button");
    			t6 = text("RESET PROJECTS");
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(textfield0.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(textfield1.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			claim_component(textfield2.$$.fragment, nodes);
    			t2 = claim_space(nodes);
    			claim_component(textarea.$$.fragment, nodes);
    			t3 = claim_space(nodes);
    			button0 = claim_element(nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t4 = claim_text(button0_nodes, "ADD PROJECT");
    			button0_nodes.forEach(detach_dev);
    			t5 = claim_space(nodes);
    			button1 = claim_element(nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			t6 = claim_text(button1_nodes, "RESET PROJECTS");
    			button1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button0, "class", "btn svelte-14ph4s9");
    			add_location(button0, file$2, 65, 16, 2462);
    			attr_dev(button1, "class", "btn btn--dangerous svelte-14ph4s9");
    			add_location(button1, file$2, 66, 16, 2542);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(textfield2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(textarea, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button0, anchor);
    			append_dev(button0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, t6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addProject*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*deleteProjects*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const textfield0_changes = {};

    			if (!updating_value && dirty & /*code*/ 2) {
    				updating_value = true;
    				textfield0_changes.value = /*code*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*name*/ 4) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*name*/ ctx[2];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    			const textfield2_changes = {};

    			if (!updating_value_2 && dirty & /*budget*/ 8) {
    				updating_value_2 = true;
    				textfield2_changes.value = /*budget*/ ctx[3];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			textfield2.$set(textfield2_changes);
    			const textarea_changes = {};

    			if (!updating_value_3 && dirty & /*remarks*/ 16) {
    				updating_value_3 = true;
    				textarea_changes.value = /*remarks*/ ctx[4];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			textarea.$set(textarea_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			transition_in(textfield2.$$.fragment, local);
    			transition_in(textarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(textarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(textfield1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(textfield2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(textarea, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(61:12) <MaterialApp>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let h4;
    	let t4;
    	let t5;
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text("Welcome, ");
    			t1 = text(/*user*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			div0 = element("div");
    			h4 = element("h4");
    			t4 = text("Add Project");
    			t5 = space();
    			create_component(materialapp.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { style: true });
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", { style: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, "Welcome, ");
    			t1 = claim_text(h3_nodes, /*user*/ ctx[0]);
    			t2 = claim_text(h3_nodes, "!");
    			h3_nodes.forEach(detach_dev);
    			t3 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { style: true, class: true });
    			var div0_nodes = children(div0);
    			h4 = claim_element(div0_nodes, "H4", { style: true });
    			var h4_nodes = children(h4);
    			t4 = claim_text(h4_nodes, "Add Project");
    			h4_nodes.forEach(detach_dev);
    			t5 = claim_space(div0_nodes);
    			claim_component(materialapp.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(h3, "text-align", "left");
    			add_location(h3, file$2, 57, 8, 1553);
    			set_style(h4, "padding-bottom", "2.4rem");
    			add_location(h4, file$2, 59, 12, 1681);
    			set_style(div0, "padding-top", "3.6rem");
    			attr_dev(div0, "class", "form-project svelte-14ph4s9");
    			add_location(div0, file$2, 58, 8, 1614);
    			set_style(div1, "margin", "0 3.2rem");
    			add_location(div1, file$2, 56, 4, 1513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t4);
    			append_dev(div0, t5);
    			mount_component(materialapp, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*user*/ 1) set_data_dev(t1, /*user*/ ctx[0]);
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, remarks, budget, name, code*/ 2078) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(materialapp);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectForm", slots, []);
    	let { user } = $$props;
    	let code = "";
    	let name = "";
    	let budget = null;
    	let remarks = "";

    	const addProject = async () => {
    		console.log("Add Project");
    		$$invalidate(3, budget = parseFloat(budget));

    		try {
    			if (!code || !name || !budget || !remarks) throw "Please input all data required";

    			const res = await axios({
    				method: "POST",
    				withCredentials: true,
    				url: `${"https://localhost:44390/"}api/projects`,
    				data: { code, name, remarks, budget }
    			});

    			if (res.status === 201) {
    				alert("Project Added! Redirecting to Dashboard");
    				window.location.href = "/app";
    			}
    		} catch(err) {
    			alert(err);
    		}
    	};

    	const deleteProjects = async () => {
    		console.log("Delete Projects");

    		try {
    			const res = await axios({
    				method: "DELETE",
    				url: `${"https://localhost:44390/"}api/projects`
    			});

    			if (res.status === 204) {
    				alert("All Projects Successfully Delete");
    			}
    		} catch(err) {
    			alert("Unsuccessful");
    		}
    	};

    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ProjectForm> was created with unknown prop '${key}'`);
    	});

    	function textfield0_value_binding(value) {
    		code = value;
    		$$invalidate(1, code);
    	}

    	function textfield1_value_binding(value) {
    		name = value;
    		$$invalidate(2, name);
    	}

    	function textfield2_value_binding(value) {
    		budget = value;
    		$$invalidate(3, budget);
    	}

    	function textarea_value_binding(value) {
    		remarks = value;
    		$$invalidate(4, remarks);
    	}

    	$$self.$$set = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		MaterialApp,
    		TextField,
    		Textarea,
    		numericRules,
    		axios,
    		user,
    		code,
    		name,
    		budget,
    		remarks,
    		addProject,
    		deleteProjects
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    		if ("code" in $$props) $$invalidate(1, code = $$props.code);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("budget" in $$props) $$invalidate(3, budget = $$props.budget);
    		if ("remarks" in $$props) $$invalidate(4, remarks = $$props.remarks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		user,
    		code,
    		name,
    		budget,
    		remarks,
    		addProject,
    		deleteProjects,
    		textfield0_value_binding,
    		textfield1_value_binding,
    		textfield2_value_binding,
    		textarea_value_binding
    	];
    }

    class ProjectForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectForm",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console_1$1.warn("<ProjectForm> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<ProjectForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<ProjectForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Assignment.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\pages\\Assignment.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import axios from "axios";      export let id;      import { Row, Col, Select, MaterialApp, Button }
    function create_catch_block_2(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2.name,
    		type: "catch",
    		source: "(1:0) <script>      import axios from \\\"axios\\\";      export let id;      import { Row, Col, Select, MaterialApp, Button }",
    		ctx
    	});

    	return block;
    }

    // (117:26)       <div>          <h4 style="margin-bottom: 1.6rem">Project: <strong>{proj.name}
    function create_then_block$1(ctx) {
    	let div1;
    	let h4;
    	let t0;
    	let strong;
    	let t1_value = /*proj*/ ctx[11].name + "";
    	let t1;
    	let t2;
    	let div0;
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			t0 = text("Project: ");
    			strong = element("strong");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");
    			create_component(materialapp.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			h4 = claim_element(div1_nodes, "H4", { style: true });
    			var h4_nodes = children(h4);
    			t0 = claim_text(h4_nodes, "Project: ");
    			strong = claim_element(h4_nodes, "STRONG", {});
    			var strong_nodes = children(strong);
    			t1 = claim_text(strong_nodes, t1_value);
    			strong_nodes.forEach(detach_dev);
    			h4_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { style: true });
    			var div0_nodes = children(div0);
    			claim_component(materialapp.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(strong, file$1, 118, 51, 3326);
    			set_style(h4, "margin-bottom", "1.6rem");
    			add_location(h4, file$1, 118, 8, 3283);
    			set_style(div0, "width", "640px");
    			set_style(div0, "margin", "0 auto");
    			add_location(div0, file$1, 119, 8, 3369);
    			add_location(div1, file$1, 117, 4, 3268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(h4, t0);
    			append_dev(h4, strong);
    			append_dev(strong, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			mount_component(materialapp, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, pAssigned, promisedItems, chosenEmployee*/ 131079) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(materialapp);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(117:26)       <div>          <h4 style=\\\"margin-bottom: 1.6rem\\\">Project: <strong>{proj.name}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      import axios from "axios";      export let id;      import { Row, Col, Select, MaterialApp, Button }
    function create_catch_block_1(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>      import axios from \\\"axios\\\";      export let id;      import { Row, Col, Select, MaterialApp, Button }",
    		ctx
    	});

    	return block;
    }

    // (124:57)                               <Select chips outlined {items}
    function create_then_block_2(ctx) {
    	let select;
    	let updating_value;
    	let current;

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[7](value);
    	}

    	let select_props = {
    		chips: true,
    		outlined: true,
    		items: /*items*/ ctx[16],
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	};

    	if (/*chosenEmployee*/ ctx[0] !== void 0) {
    		select_props.value = /*chosenEmployee*/ ctx[0];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(select, "value", select_value_binding));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(select.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*promisedItems*/ 2) select_changes.items = /*items*/ ctx[16];

    			if (dirty & /*$$scope*/ 131072) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*chosenEmployee*/ 1) {
    				updating_value = true;
    				select_changes.value = /*chosenEmployee*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2.name,
    		type: "then",
    		source: "(124:57)                               <Select chips outlined {items}",
    		ctx
    	});

    	return block;
    }

    // (125:28) <Select chips outlined {items} bind:value = {chosenEmployee}>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Select Employee");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Select Employee");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(125:28) <Select chips outlined {items} bind:value = {chosenEmployee}>",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      import axios from "axios";      export let id;      import { Row, Col, Select, MaterialApp, Button }
    function create_pending_block_2(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2.name,
    		type: "pending",
    		source: "(1:0) <script>      import axios from \\\"axios\\\";      export let id;      import { Row, Col, Select, MaterialApp, Button }",
    		ctx
    	});

    	return block;
    }

    // (123:20) <Col md={8}>
    function create_default_slot_6(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_2,
    		then: create_then_block_2,
    		catch: create_catch_block_1,
    		value: 16,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*promisedItems*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			await_block_anchor = empty();
    			info.block.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*promisedItems*/ 2 && promise !== (promise = /*promisedItems*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[16] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(123:20) <Col md={8}>",
    		ctx
    	});

    	return block;
    }

    // (129:24) <Button size="x-large" on:click={assignEmployee}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add Employee");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Add Employee");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(129:24) <Button size=\\\"x-large\\\" on:click={assignEmployee}>",
    		ctx
    	});

    	return block;
    }

    // (128:20) <Col md={4}>
    function create_default_slot_4$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				size: "x-large",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*assignEmployee*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(button.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(128:20) <Col md={4}>",
    		ctx
    	});

    	return block;
    }

    // (122:16) <Row style="margin: 1.6rem auto 3.2rem; text-align: :center; display:flex; justify-content: center;">
    function create_default_slot_3$1(ctx) {
    	let col0;
    	let t;
    	let col1;
    	let current;

    	col0 = new Col({
    			props: {
    				md: 8,
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				md: 4,
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t = space();
    			create_component(col1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(col0.$$.fragment, nodes);
    			t = claim_space(nodes);
    			claim_component(col1.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope, promisedItems, chosenEmployee*/ 131075) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(col1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(122:16) <Row style=\\\"margin: 1.6rem auto 3.2rem; text-align: :center; display:flex; justify-content: center;\\\">",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      import axios from "axios";      export let id;      import { Row, Col, Select, MaterialApp, Button }
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>      import axios from \\\"axios\\\";      export let id;      import { Row, Col, Select, MaterialApp, Button }",
    		ctx
    	});

    	return block;
    }

    // (133:55)                           {#each assignedEmp as emp}
    function create_then_block_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*assignedEmp*/ ctx[12];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*unassignEmployee, pAssigned*/ 36) {
    				each_value = /*assignedEmp*/ ctx[12];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(133:55)                           {#each assignedEmp as emp}",
    		ctx
    	});

    	return block;
    }

    // (137:32) <Button size="large" class="red white-text" on:click={unassignEmployee(emp.value)}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Remove");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Remove");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(137:32) <Button size=\\\"large\\\" class=\\\"red white-text\\\" on:click={unassignEmployee(emp.value)}>",
    		ctx
    	});

    	return block;
    }

    // (134:24) {#each assignedEmp as emp}
    function create_each_block(ctx) {
    	let div;
    	let p;
    	let t0_value = /*emp*/ ctx[13].name + "";
    	let t0;
    	let t1;
    	let button;
    	let t2;
    	let current;

    	button = new Button({
    			props: {
    				size: "large",
    				class: "red white-text",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*unassignEmployee*/ ctx[5](/*emp*/ ctx[13].value))) /*unassignEmployee*/ ctx[5](/*emp*/ ctx[13].value).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(button.$$.fragment);
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { style: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", {});
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, t0_value);
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			claim_component(button.$$.fragment, div_nodes);
    			t2 = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(p, file$1, 135, 32, 4324);
    			set_style(div, "width", "100%");
    			set_style(div, "display", "flex");
    			set_style(div, "justify-content", "space-between");
    			set_style(div, "align-items", "center");
    			add_location(div, file$1, 134, 28, 4196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			mount_component(button, div, null);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*pAssigned*/ 4) && t0_value !== (t0_value = /*emp*/ ctx[13].name + "")) set_data_dev(t0, t0_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(134:24) {#each assignedEmp as emp}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      import axios from "axios";      export let id;      import { Row, Col, Select, MaterialApp, Button }
    function create_pending_block_1(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(1:0) <script>      import axios from \\\"axios\\\";      export let id;      import { Row, Col, Select, MaterialApp, Button }",
    		ctx
    	});

    	return block;
    }

    // (132:16) <Row>
    function create_default_slot_1$1(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block$1,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*pAssigned*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			await_block_anchor = empty();
    			info.block.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*pAssigned*/ 4 && promise !== (promise = /*pAssigned*/ ctx[2]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[12] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(132:16) <Row>",
    		ctx
    	});

    	return block;
    }

    // (121:12) <MaterialApp>
    function create_default_slot$1(ctx) {
    	let row0;
    	let t;
    	let row1;
    	let current;

    	row0 = new Row({
    			props: {
    				style: "margin: 1.6rem auto 3.2rem; text-align: :center; display:flex; justify-content: center;",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	row1 = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row0.$$.fragment);
    			t = space();
    			create_component(row1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(row0.$$.fragment, nodes);
    			t = claim_space(nodes);
    			claim_component(row1.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(row1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row0_changes = {};

    			if (dirty & /*$$scope, promisedItems, chosenEmployee*/ 131075) {
    				row0_changes.$$scope = { dirty, ctx };
    			}

    			row0.$set(row0_changes);
    			const row1_changes = {};

    			if (dirty & /*$$scope, pAssigned*/ 131076) {
    				row1_changes.$$scope = { dirty, ctx };
    			}

    			row1.$set(row1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(row1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(121:12) <MaterialApp>",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      import axios from "axios";      export let id;      import { Row, Col, Select, MaterialApp, Button }
    function create_pending_block$1(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(1:0) <script>      import axios from \\\"axios\\\";      export let id;      import { Row, Col, Select, MaterialApp, Button }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let await_block_anchor;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block_2,
    		value: 11,
    		blocks: [,,,]
    	};

    	handle_promise(/*project*/ ctx[3], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			await_block_anchor = empty();
    			info.block.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[11] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Assignment", slots, []);
    	let { id } = $$props;
    	let chosenEmployee = null;

    	const getProjectById = async () => {
    		console.log("getting it");

    		try {
    			const res = await axios({
    				method: "GET",
    				url: `${"https://localhost:44390/"}api/projects/${id}`
    			});

    			console.log(res.data);
    			return res.data;
    		} catch(err) {
    			alert(err);
    			window.location.assign("/dashboard");
    		}
    	};

    	const getUnassigned = async () => {
    		try {
    			const res = await axios({
    				method: "GET",
    				url: `${"https://localhost:44390/"}api/projects/unassigned/${id}`
    			});

    			const unassigned = res.data.map(item => {
    				let obj = {
    					name: `${item.last_name}, ${item.first_name}`,
    					value: item.id
    				};

    				return obj;
    			});

    			console.log(unassigned);
    			return unassigned;
    		} catch(err) {
    			alert(err);
    			window.location.assign("/dashboard");
    		}
    	};

    	const getAssigned = async () => {
    		try {
    			const res = await axios({
    				method: "GET",
    				url: `${"https://localhost:44390/"}api/projects/assigned/${id}`
    			});

    			const assigned = res.data.map(item => {
    				let obj = {
    					name: `${item.last_name}, ${item.first_name}`,
    					value: item.id
    				};

    				return obj;
    			});

    			// console.log(unassigned);
    			return assigned;
    		} catch(err) {
    			alert(err);
    			window.location.assign("/dashboard");
    		}
    	};

    	let project = getProjectById();
    	let promisedItems = getUnassigned();
    	let pAssigned = getAssigned();

    	const assignEmployee = async () => {
    		console.log(chosenEmployee);

    		try {
    			const res = await axios({
    				method: "POST",
    				url: `${"https://localhost:44390/"}api/projects/assign`,
    				data: {
    					person_id: parseInt(chosenEmployee),
    					project_id: parseInt(id)
    				}
    			});

    			console.log(res);
    			$$invalidate(1, promisedItems = getUnassigned());
    			$$invalidate(2, pAssigned = getAssigned());
    			$$invalidate(0, chosenEmployee = null);
    		} catch(err) {
    			alert(err);
    		}
    	};

    	const unassignEmployee = async person_id => {
    		console.log(person_id);

    		try {
    			const res = await axios({
    				method: "DELETE",
    				url: `${"https://localhost:44390/"}api/projects/unassign`,
    				data: { person_id, project_id: parseInt(id) }
    			});

    			console.log(res);
    			$$invalidate(1, promisedItems = getUnassigned());
    			$$invalidate(2, pAssigned = getAssigned());
    		} catch(err) {
    			alert(err);
    		}
    	};

    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Assignment> was created with unknown prop '${key}'`);
    	});

    	function select_value_binding(value) {
    		chosenEmployee = value;
    		$$invalidate(0, chosenEmployee);
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(6, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		axios,
    		id,
    		Row,
    		Col,
    		Select,
    		MaterialApp,
    		Button,
    		chosenEmployee,
    		getProjectById,
    		getUnassigned,
    		getAssigned,
    		project,
    		promisedItems,
    		pAssigned,
    		assignEmployee,
    		unassignEmployee
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(6, id = $$props.id);
    		if ("chosenEmployee" in $$props) $$invalidate(0, chosenEmployee = $$props.chosenEmployee);
    		if ("project" in $$props) $$invalidate(3, project = $$props.project);
    		if ("promisedItems" in $$props) $$invalidate(1, promisedItems = $$props.promisedItems);
    		if ("pAssigned" in $$props) $$invalidate(2, pAssigned = $$props.pAssigned);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		chosenEmployee,
    		promisedItems,
    		pAssigned,
    		project,
    		assignEmployee,
    		unassignEmployee,
    		id,
    		select_value_binding
    	];
    }

    class Assignment extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Assignment",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[6] === undefined && !("id" in props)) {
    			console_1.warn("<Assignment> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Assignment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Assignment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */
    const file = "src\\App.svelte";

    // (1:0) <script>  import Navbar from './shared/Navbar.svelte';  import axios from "axios";    import {Route, Router}
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>  import Navbar from './shared/Navbar.svelte';  import axios from \\\"axios\\\";    import {Route, Router}",
    		ctx
    	});

    	return block;
    }

    // (21:26)   <Navbar items={data.accessibleNavItems}
    function create_then_block(ctx) {
    	let navbar;
    	let t;
    	let main;
    	let router;
    	let current;

    	navbar = new Navbar({
    			props: {
    				items: /*data*/ ctx[1].accessibleNavItems
    			},
    			$$inline: true
    		});

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			main = element("main");
    			create_component(router.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(navbar.$$.fragment, nodes);
    			t = claim_space(nodes);
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			claim_component(router.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(main, "class", "svelte-79ve9l");
    			add_location(main, file, 22, 1, 675);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(21:26)   <Navbar items={data.accessibleNavItems}",
    		ctx
    	});

    	return block;
    }

    // (25:3) <Route path="/app">
    function create_default_slot_4(ctx) {
    	let dashboard;
    	let current;

    	dashboard = new Dashboard({
    			props: { user: /*data*/ ctx[1].username },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dashboard.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(dashboard.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dashboard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dashboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dashboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(25:3) <Route path=\\\"/app\\\">",
    		ctx
    	});

    	return block;
    }

    // (26:3) <Route path="/app/people">
    function create_default_slot_3(ctx) {
    	let peopleform;
    	let current;

    	peopleform = new PeopleForm({
    			props: { user: /*data*/ ctx[1].username },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(peopleform.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(peopleform.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(peopleform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(peopleform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(peopleform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(peopleform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(26:3) <Route path=\\\"/app/people\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:3) <Route path="/app/projects">
    function create_default_slot_2(ctx) {
    	let projectform;
    	let current;

    	projectform = new ProjectForm({
    			props: { user: /*data*/ ctx[1].username },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projectform.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(projectform.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(27:3) <Route path=\\\"/app/projects\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:3) <Route path="/app/projects/:id" let:params>
    function create_default_slot_1(ctx) {
    	let assignment;
    	let current;

    	assignment = new Assignment({
    			props: {
    				id: /*params*/ ctx[2].id,
    				user: /*data*/ ctx[1].username
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(assignment.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(assignment.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(assignment, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const assignment_changes = {};
    			if (dirty & /*params*/ 4) assignment_changes.id = /*params*/ ctx[2].id;
    			assignment.$set(assignment_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(assignment.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(assignment.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(assignment, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(28:3) <Route path=\\\"/app/projects/:id\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (24:2) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/app",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/app/people",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/app/projects",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/app/projects/:id",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(route0.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(route1.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			claim_component(route2.$$.fragment, nodes);
    			t2 = claim_space(nodes);
    			claim_component(route3.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope, params*/ 12) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(24:2) <Router>",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import Navbar from './shared/Navbar.svelte';  import axios from "axios";    import {Route, Router}
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>  import Navbar from './shared/Navbar.svelte';  import axios from \\\"axios\\\";    import {Route, Router}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let await_block_anchor;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 1,
    		blocks: [,,,]
    	};

    	handle_promise(/*promise*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			await_block_anchor = empty();
    			info.block.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const promise = getSessionData();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		axios,
    		Route,
    		Router,
    		Login,
    		Dashboard,
    		PeopleForm,
    		ProjectForm,
    		Assignment,
    		getSessionData,
    		promise
    	});

    	return [promise];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	hydratable: true,

    });

    exports.app = app;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=bundle.js.map
