
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const info = [

        {
          "Region": "Region Sør",
          "Tidsrom": "1. oktober klokka 08:00 til og med 30. november",
          "Minstemål": " 25 centimeter lang NB! På Skagerrakkysten er det innført eit maksimalmål for hummar på 32 cm. ",
          "Nødutgong": "Opning på minst 60mm i tilegg til bommulstråd til luke",
          "Søknad": "Trykk her for å opne Fiskeridirektoratet sine søkndadssider"
      },
      {
        "Region": "Region Nord",
        "Tidsrom": "1. oktober klokka 08:00 til og med  31. desember.",
        "Minstemål": " 25 centimeter lang",
        "Nødutgong": "Opning på minst 60mm i tilegg til bommulstråd til luke",
        "Søknad": "Trykk her for å opne Fiskeridirektoratet sine søkndadssider"
      }
      
      
      ];

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file = "src\\App.svelte";

    // (67:1) {:else}
    function create_else_block(ctx) {
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Velg din region";
    			attr_dev(h1, "class", "svelte-mexh76");
    			add_location(h1, file, 68, 2, 1873);
    			attr_dev(div, "class", "region svelte-mexh76");
    			add_location(div, file, 67, 2, 1850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(67:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:1) {#if region}
    function create_if_block(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*region*/ ctx[0].Region + "";
    	let t0;
    	let t1;
    	let p0;
    	let b0;
    	let t3;
    	let t4_value = /*region*/ ctx[0].Tidsrom + "";
    	let t4;
    	let t5;
    	let p1;
    	let b1;
    	let t7;
    	let t8_value = /*region*/ ctx[0].Minstemål + "";
    	let t8;
    	let t9;
    	let p2;
    	let b2;
    	let t11;
    	let t12_value = /*region*/ ctx[0].Nødutgong + "";
    	let t12;
    	let t13;
    	let p3;
    	let b3;
    	let t15;
    	let a;
    	let t16_value = /*region*/ ctx[0].Søknad + "";
    	let t16;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "Når:";
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			p1 = element("p");
    			b1 = element("b");
    			b1.textContent = "Minstemål:";
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			p2 = element("p");
    			b2 = element("b");
    			b2.textContent = "Utstyr og nødutgong:";
    			t11 = space();
    			t12 = text(t12_value);
    			t13 = space();
    			p3 = element("p");
    			b3 = element("b");
    			b3.textContent = "Søknad til fiskeridirektorat:";
    			t15 = space();
    			a = element("a");
    			t16 = text(t16_value);
    			attr_dev(h1, "class", "svelte-mexh76");
    			add_location(h1, file, 60, 3, 1559);
    			attr_dev(b0, "class", "svelte-mexh76");
    			add_location(b0, file, 61, 6, 1590);
    			attr_dev(p0, "class", "svelte-mexh76");
    			add_location(p0, file, 61, 3, 1587);
    			attr_dev(b1, "class", "svelte-mexh76");
    			add_location(b1, file, 62, 6, 1629);
    			attr_dev(p1, "class", "svelte-mexh76");
    			add_location(p1, file, 62, 3, 1626);
    			attr_dev(b2, "class", "svelte-mexh76");
    			add_location(b2, file, 63, 6, 1676);
    			attr_dev(p2, "class", "svelte-mexh76");
    			add_location(p2, file, 63, 3, 1673);
    			attr_dev(b3, "class", "svelte-mexh76");
    			add_location(b3, file, 64, 6, 1733);
    			attr_dev(a, "href", soknad);
    			attr_dev(a, "target", "_parent");
    			attr_dev(a, "class", "svelte-mexh76");
    			add_location(a, file, 64, 43, 1770);
    			attr_dev(p3, "class", "svelte-mexh76");
    			add_location(p3, file, 64, 3, 1730);
    			attr_dev(div, "class", "region svelte-mexh76");
    			add_location(div, file, 59, 2, 1535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, b0);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(div, t5);
    			append_dev(div, p1);
    			append_dev(p1, b1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(div, t9);
    			append_dev(div, p2);
    			append_dev(p2, b2);
    			append_dev(p2, t11);
    			append_dev(p2, t12);
    			append_dev(div, t13);
    			append_dev(div, p3);
    			append_dev(p3, b3);
    			append_dev(p3, t15);
    			append_dev(p3, a);
    			append_dev(a, t16);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*region*/ 1 && t0_value !== (t0_value = /*region*/ ctx[0].Region + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*region*/ 1 && t4_value !== (t4_value = /*region*/ ctx[0].Tidsrom + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*region*/ 1 && t8_value !== (t8_value = /*region*/ ctx[0].Minstemål + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*region*/ 1 && t12_value !== (t12_value = /*region*/ ctx[0].Nødutgong + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*region*/ 1 && t16_value !== (t16_value = /*region*/ ctx[0].Søknad + "")) set_data_dev(t16, t16_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(59:1) {#if region}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let link0;
    	let link1;
    	let t0;
    	let main;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let footer;
    	let h3;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*region*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			main = element("main");
    			if_block.c();
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Region Sør";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Region Nord";
    			t6 = space();
    			footer = element("footer");
    			h3 = element("h3");
    			h3.textContent = "Developed by Ludvik Kvalsvik - Interaksjonsdesign 2020";
    			if (script0.src !== (script0_src_value = "https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.js")) attr_dev(script0, "src", script0_src_value);
    			attr_dev(script0, "class", "svelte-mexh76");
    			add_location(script0, file, 47, 1, 1035);
    			if (script1.src !== (script1_src_value = "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.js")) attr_dev(script1, "src", script1_src_value);
    			attr_dev(script1, "class", "svelte-mexh76");
    			add_location(script1, file, 48, 1, 1131);
    			attr_dev(link0, "href", "https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.css");
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "class", "svelte-mexh76");
    			add_location(link0, file, 50, 1, 1254);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.css");
    			attr_dev(link1, "type", "text/css");
    			attr_dev(link1, "class", "svelte-mexh76");
    			add_location(link1, file, 51, 1, 1345);
    			attr_dev(div0, "id", "map");
    			attr_dev(div0, "class", "svelte-mexh76");
    			add_location(div0, file, 72, 2, 1939);
    			attr_dev(button0, "class", "svelte-mexh76");
    			add_location(button0, file, 74, 2, 1982);
    			attr_dev(button1, "class", "svelte-mexh76");
    			add_location(button1, file, 75, 2, 2030);
    			attr_dev(div1, "class", "knapper svelte-mexh76");
    			add_location(div1, file, 73, 2, 1958);
    			attr_dev(div2, "class", "venstre svelte-mexh76");
    			add_location(div2, file, 71, 1, 1915);
    			attr_dev(h3, "class", "svelte-mexh76");
    			add_location(h3, file, 80, 1, 2107);
    			attr_dev(footer, "class", "svelte-mexh76");
    			add_location(footer, file, 79, 1, 2097);
    			attr_dev(main, "class", "svelte-mexh76");
    			add_location(main, file, 57, 0, 1512);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if_block.m(main, null);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t4);
    			append_dev(div1, button1);
    			append_dev(main, t6);
    			append_dev(main, footer);
    			append_dev(footer, h3);

    			dispose = [
    				listen_dev(script0, "load", /*init*/ ctx[1], false, false, false),
    				listen_dev(button0, "click", /*flySor*/ ctx[2], false, false, false),
    				listen_dev(button1, "click", /*flyNord*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, t1);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if_block.d();
    			run_all(dispose);
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

    const soknad = "https://www.fiskeridir.no/Fritidsfiske/Skjema/Registrer-deg-til-aarets-hummarfiske";

    function instance($$self, $$props, $$invalidate) {
    	let map;

    	const init = () => {
    		mapboxgl.accessToken = "pk.eyJ1IjoibHVkdmlra3ZhbHN2aWsiLCJhIjoiY2s5NGFnOG45MDVjMzNvbnhoanBzb3BoNCJ9.UyR6o9v82LFpr3naB6_YLg";

    		map = new mapboxgl.Map({
    				container: "map",
    				style: "mapbox://styles/mapbox/satellite-v9",
    				zoom: 2.5,
    				center: [6.856797, 66.597289]
    			});

    		map.addControl(new mapboxgl.GeolocateControl({
    				positionOptions: { enableHighAccuracy: true },
    				trackUserLocation: true
    			}));

    		var nav = new mapboxgl.NavigationControl();
    		map.addControl(nav, "bottom-right");
    	};

    	let region;

    	const flySor = () => {
    		$$invalidate(0, region = info[0]);

    		map.flyTo({
    			center: [6.282324, 60.254881],
    			zoom: 5.25
    		});
    	};

    	const flyNord = () => {
    		$$invalidate(0, region = info[1]);

    		map.flyTo({
    			center: [18.241552, 67.088957],
    			zoom: 4.15
    		});
    	};

    	$$self.$capture_state = () => ({
    		info,
    		map,
    		init,
    		region,
    		flySor,
    		flyNord,
    		soknad,
    		mapboxgl
    	});

    	$$self.$inject_state = $$props => {
    		if ("map" in $$props) map = $$props.map;
    		if ("region" in $$props) $$invalidate(0, region = $$props.region);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [region, init, flySor, flyNord];
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

    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
