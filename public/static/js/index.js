(() => {
  'use strict';
  var e,
    t,
    n,
    r,
    i,
    s,
    o,
    a,
    _,
    l,
    c,
    d = {
      9099(e, t, n) {
        e.exports = n.p + 'static/wasm/bae681cbe3.module.wasm';
      },
      8331(e, t, n) {
        e.exports = n.p + 'static/wasm/e4df7230ae.module.wasm';
      },
      8235(e, t, n) {
        let r;
        n.r(t);
        class i {
          static __wrap(e) {
            let t = Object.create(i.prototype);
            return ((t.__wbg_ptr = e), y.register(t, t.__wbg_ptr, t), t);
          }
          __destroy_into_raw() {
            let e = this.__wbg_ptr;
            return ((this.__wbg_ptr = 0), y.unregister(this), e);
          }
          free() {
            let e = this.__destroy_into_raw();
            r.__wbg_eventinfo_free(e, 0);
          }
          get event_handler() {
            return r.__wbg_get_eventinfo_event_handler(this.__wbg_ptr);
          }
          get event_name() {
            let e, t;
            try {
              let n = r.__wbg_get_eventinfo_event_name(this.__wbg_ptr);
              return ((e = n[0]), (t = n[1]), N(n[0], n[1]));
            } finally {
              r.__wbindgen_free(e, t, 1);
            }
          }
          get event_type() {
            let e, t;
            try {
              let n = r.__wbg_get_eventinfo_event_type(this.__wbg_ptr);
              return ((e = n[0]), (t = n[1]), N(n[0], n[1]));
            } finally {
              r.__wbindgen_free(e, t, 1);
            }
          }
          set event_handler(e) {
            r.__wbg_set_eventinfo_event_handler(this.__wbg_ptr, e);
          }
          set event_name(e) {
            let t = z(e, r.__wbindgen_malloc, r.__wbindgen_realloc),
              n = G;
            r.__wbg_set_eventinfo_event_name(this.__wbg_ptr, t, n);
          }
          set event_type(e) {
            let t = z(e, r.__wbindgen_malloc, r.__wbindgen_realloc),
              n = G;
            r.__wbg_set_eventinfo_event_type(this.__wbg_ptr, t, n);
          }
        }
        Symbol.dispose && (i.prototype[Symbol.dispose] = i.prototype.free);
        class s {
          __destroy_into_raw() {
            let e = this.__wbg_ptr;
            return ((this.__wbg_ptr = 0), v.unregister(this), e);
          }
          free() {
            let e = this.__destroy_into_raw();
            r.__wbg_mainthreadwasmcontext_free(e, 0);
          }
          add_closure_event(e, t, n, i, s) {
            let o = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              a = G,
              _ = z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
              l = G;
            r.mainthreadwasmcontext_add_closure_event(
              this.__wbg_ptr,
              e,
              o,
              a,
              _,
              l,
              U(i) ? 0 : E(i),
              U(s) ? 0 : E(s),
            );
          }
          add_cross_thread_event(e, t, n, i) {
            let s = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              o = G,
              a = z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
              _ = G;
            var l = U(i) ? 0 : z(i, r.__wbindgen_malloc, r.__wbindgen_realloc),
              c = G;
            r.mainthreadwasmcontext_add_cross_thread_event(
              this.__wbg_ptr,
              e,
              s,
              o,
              a,
              _,
              l,
              c,
            );
          }
          add_dataset(e, t, n) {
            let i = r.mainthreadwasmcontext_add_dataset(
              this.__wbg_ptr,
              e,
              t,
              n,
            );
            if (i[1]) throw B(i[0]);
          }
          add_run_worklet_event(e, t, n, i) {
            let s = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              o = G,
              a = z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
              _ = G;
            r.mainthreadwasmcontext_add_run_worklet_event(
              this.__wbg_ptr,
              e,
              s,
              o,
              a,
              _,
              U(i) ? 0 : E(i),
            );
          }
          common_event_handler(e, t, n, i) {
            let s = W(t, r.__wbindgen_malloc),
              o = G,
              a = z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
              _ = G;
            r.mainthreadwasmcontext_common_event_handler(
              this.__wbg_ptr,
              e,
              s,
              o,
              a,
              _,
              i,
            );
          }
          create_element_common(e, t, n, i, s) {
            var o = U(s) ? 0 : z(s, r.__wbindgen_malloc, r.__wbindgen_realloc),
              a = G;
            return (
              r.mainthreadwasmcontext_create_element_common(
                this.__wbg_ptr,
                e,
                t,
                n,
                U(i) ? Number.MAX_SAFE_INTEGER : 0 | i,
                o,
                a,
              ) >>> 0
            );
          }
          dispatch_event_by_path(e, t, n, i) {
            let s = W(e, r.__wbindgen_malloc),
              o = G,
              a = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              _ = G;
            return (
              0 !==
              r.mainthreadwasmcontext_dispatch_event_by_path(
                this.__wbg_ptr,
                s,
                o,
                a,
                _,
                n,
                i,
              )
            );
          }
          dispatch_global_bind_event(e, t, n) {
            let i = W(e, r.__wbindgen_malloc),
              s = G,
              o = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              a = G;
            r.mainthreadwasmcontext_dispatch_global_bind_event(
              this.__wbg_ptr,
              i,
              s,
              o,
              a,
              n,
            );
          }
          gc() {
            r.mainthreadwasmcontext_gc(this.__wbg_ptr);
          }
          get_component_id(e) {
            let t,
              n = r.mainthreadwasmcontext_get_component_id(this.__wbg_ptr, e);
            if (n[3]) throw B(n[2]);
            return (
              0 !== n[0] &&
                ((t = N(n[0], n[1]).slice()),
                r.__wbindgen_free(n[0], +n[1], 1)),
              t
            );
          }
          get_config(e) {
            let t = r.mainthreadwasmcontext_get_config(this.__wbg_ptr, e);
            if (t[2]) throw B(t[1]);
            return B(t[0]);
          }
          get_data_by_key(e, t) {
            let n = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              i = G,
              s = r.mainthreadwasmcontext_get_data_by_key(
                this.__wbg_ptr,
                e,
                n,
                i,
              );
            if (s[2]) throw B(s[1]);
            return B(s[0]);
          }
          get_dataset(e) {
            let t = r.mainthreadwasmcontext_get_dataset(this.__wbg_ptr, e);
            if (t[2]) throw B(t[1]);
            return B(t[0]);
          }
          get_dom_by_unique_id(e) {
            return r.mainthreadwasmcontext_get_dom_by_unique_id(
              this.__wbg_ptr,
              e,
            );
          }
          get_element_config(e) {
            let t = r.mainthreadwasmcontext_get_element_config(
              this.__wbg_ptr,
              e,
            );
            if (t[2]) throw B(t[1]);
            return B(t[0]);
          }
          get_event(e, t, n) {
            let i = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              s = G,
              o = z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
              a = G;
            return r.mainthreadwasmcontext_get_event(
              this.__wbg_ptr,
              e,
              i,
              s,
              o,
              a,
            );
          }
          get_events(e) {
            let t = r.mainthreadwasmcontext_get_events(this.__wbg_ptr, e);
            var n = O(t[0], t[1]).slice();
            return (r.__wbindgen_free(t[0], 4 * t[1], 4), n);
          }
          get_unique_id_by_component_id(e) {
            let t = z(e, r.__wbindgen_malloc, r.__wbindgen_realloc),
              n = G,
              i = r.mainthreadwasmcontext_get_unique_id_by_component_id(
                this.__wbg_ptr,
                t,
                n,
              );
            return i === Number.MAX_SAFE_INTEGER ? void 0 : i;
          }
          constructor(e, t, n) {
            const i = r.mainthreadwasmcontext_new(e, t, n);
            return (
              (this.__wbg_ptr = i),
              v.register(this, this.__wbg_ptr, this),
              this
            );
          }
          push_style_sheet(e, t) {
            P(e, c);
            var n = U(t) ? 0 : z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              i = G;
            let s = r.mainthreadwasmcontext_push_style_sheet(
              this.__wbg_ptr,
              e.__wbg_ptr,
              n,
              i,
            );
            if (s[1]) throw B(s[0]);
          }
          set_config(e, t) {
            let n = r.mainthreadwasmcontext_set_config(this.__wbg_ptr, e, t);
            if (n[1]) throw B(n[0]);
          }
          set_css_id(e, t, n) {
            let i = W(e, r.__wbindgen_malloc),
              s = G;
            var o = U(n) ? 0 : z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
              a = G;
            let _ = r.mainthreadwasmcontext_set_css_id(
              this.__wbg_ptr,
              i,
              s,
              t,
              o,
              a,
            );
            if (_[1]) throw B(_[0]);
          }
          set_dataset(e, t, n) {
            let i = r.mainthreadwasmcontext_set_dataset(
              this.__wbg_ptr,
              e,
              t,
              n,
            );
            if (i[1]) throw B(i[0]);
          }
          set_page_element_unique_id(e) {
            r.mainthreadwasmcontext_set_page_element_unique_id(
              this.__wbg_ptr,
              e,
            );
          }
          take_timing_flags() {
            let e = r.mainthreadwasmcontext_take_timing_flags(this.__wbg_ptr);
            var t = O(e[0], e[1]).slice();
            return (r.__wbindgen_free(e[0], 4 * e[1], 4), t);
          }
          update_component_css_id(e, t) {
            let n = r.mainthreadwasmcontext_update_component_css_id(
              this.__wbg_ptr,
              e,
              t,
            );
            if (n[1]) throw B(n[0]);
          }
          update_component_id(e, t) {
            var n = U(t) ? 0 : z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              i = G;
            let s = r.mainthreadwasmcontext_update_component_id(
              this.__wbg_ptr,
              e,
              n,
              i,
            );
            if (s[1]) throw B(s[0]);
          }
          update_css_og_style(e, t) {
            var n = U(t) ? 0 : z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              i = G;
            let s = r.mainthreadwasmcontext_update_css_og_style(
              this.__wbg_ptr,
              e,
              n,
              i,
            );
            if (s[1]) throw B(s[0]);
          }
        }
        Symbol.dispose && (s.prototype[Symbol.dispose] = s.prototype.free);
        class o {
          __destroy_into_raw() {
            let e = this.__wbg_ptr;
            return ((this.__wbg_ptr = 0), S.unregister(this), e);
          }
          free() {
            let e = this.__destroy_into_raw();
            r.__wbg_rawstyleinfo_free(e, 0);
          }
          append_import(e, t) {
            r.rawstyleinfo_append_import(this.__wbg_ptr, e, t);
          }
          constructor() {
            const e = r.rawstyleinfo_new();
            return (
              (this.__wbg_ptr = e),
              S.register(this, this.__wbg_ptr, this),
              this
            );
          }
          push_rule(e, t) {
            P(t, a);
            var n = t.__destroy_into_raw();
            r.rawstyleinfo_push_rule(this.__wbg_ptr, e, n);
          }
        }
        Symbol.dispose && (o.prototype[Symbol.dispose] = o.prototype.free);
        class a {
          __destroy_into_raw() {
            let e = this.__wbg_ptr;
            return ((this.__wbg_ptr = 0), x.unregister(this), e);
          }
          free() {
            let e = this.__destroy_into_raw();
            r.__wbg_rule_free(e, 0);
          }
          constructor(e) {
            const t = z(e, r.__wbindgen_malloc, r.__wbindgen_realloc),
              n = G,
              i = r.rule_new(t, n);
            if (i[2]) throw B(i[1]);
            return (
              (this.__wbg_ptr = i[0]),
              x.register(this, this.__wbg_ptr, this),
              this
            );
          }
          push_declaration(e, t) {
            let n = z(e, r.__wbindgen_malloc, r.__wbindgen_realloc),
              i = G,
              s = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              o = G;
            r.rule_push_declaration(this.__wbg_ptr, n, i, s, o);
          }
          push_rule_children(e) {
            P(e, a);
            var t = e.__destroy_into_raw();
            r.rule_push_rule_children(this.__wbg_ptr, t);
          }
          set_prelude(e) {
            P(e, _);
            var t = e.__destroy_into_raw();
            r.rule_set_prelude(this.__wbg_ptr, t);
          }
        }
        Symbol.dispose && (a.prototype[Symbol.dispose] = a.prototype.free);
        class _ {
          __destroy_into_raw() {
            let e = this.__wbg_ptr;
            return ((this.__wbg_ptr = 0), k.unregister(this), e);
          }
          free() {
            let e = this.__destroy_into_raw();
            r.__wbg_ruleprelude_free(e, 0);
          }
          constructor() {
            const e = r.ruleprelude_new();
            return (
              (this.__wbg_ptr = e),
              k.register(this, this.__wbg_ptr, this),
              this
            );
          }
          push_selector(e) {
            P(e, l);
            var t = e.__destroy_into_raw();
            r.ruleprelude_push_selector(this.__wbg_ptr, t);
          }
        }
        Symbol.dispose && (_.prototype[Symbol.dispose] = _.prototype.free);
        class l {
          __destroy_into_raw() {
            let e = this.__wbg_ptr;
            return ((this.__wbg_ptr = 0), C.unregister(this), e);
          }
          free() {
            let e = this.__destroy_into_raw();
            r.__wbg_selector_free(e, 0);
          }
          constructor() {
            const e = r.selector_new();
            return (
              (this.__wbg_ptr = e),
              C.register(this, this.__wbg_ptr, this),
              this
            );
          }
          push_one_selector_section(e, t) {
            let n = z(e, r.__wbindgen_malloc, r.__wbindgen_realloc),
              i = G,
              s = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
              o = G,
              a = r.selector_push_one_selector_section(
                this.__wbg_ptr,
                n,
                i,
                s,
                o,
              );
            if (a[1]) throw B(a[0]);
          }
        }
        Symbol.dispose && (l.prototype[Symbol.dispose] = l.prototype.free);
        class c {
          __destroy_into_raw() {
            let e = this.__wbg_ptr;
            return ((this.__wbg_ptr = 0), R.unregister(this), e);
          }
          free() {
            let e = this.__destroy_into_raw();
            r.__wbg_stylesheetresource_free(e, 0);
          }
          constructor(e, t) {
            const n = r.stylesheetresource_new(e, t);
            if (n[2]) throw B(n[1]);
            return (
              (this.__wbg_ptr = n[0]),
              R.register(this, this.__wbg_ptr, this),
              this
            );
          }
        }
        function d(e, t, n) {
          let i = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
            s = G;
          var o = U(n) ? 0 : z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
            a = G;
          r.add_inline_style_raw_string_key(e, i, s, o, a);
        }
        function u(e, t, n, i, s, o) {
          var a = U(t) ? 0 : z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
            _ = G;
          let l = r.decode_style_info(e, a, _, n, i, s, o);
          if (l[2]) throw B(l[1]);
          return B(l[0]);
        }
        function h(e, t, n, i, s, a) {
          P(e, o);
          var _ = e.__destroy_into_raw(),
            l = U(n) ? 0 : z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
            c = G;
          let d = r.encode_legacy_json_generated_raw_style_info(
            _,
            t,
            l,
            c,
            i,
            s,
            a,
          );
          if (d[2]) throw B(d[1]);
          return B(d[0]);
        }
        function b(e) {
          let t, n;
          try {
            let o = r.get_font_face_content(e);
            var i = o[0],
              s = o[1];
            if (o[3]) throw ((i = 0), (s = 0), B(o[2]));
            return ((t = i), (n = s), N(i, s));
          } finally {
            r.__wbindgen_free(t, n, 1);
          }
        }
        function g(e) {
          let t, n;
          try {
            let o = r.get_style_content(e);
            var i = o[0],
              s = o[1];
            if (o[3]) throw ((i = 0), (s = 0), B(o[2]));
            return ((t = i), (n = s), N(i, s));
          } finally {
            r.__wbindgen_free(t, n, 1);
          }
        }
        function f(e, t, n, i, s) {
          let o = F(t, r.__wbindgen_malloc),
            a = G;
          r.set_inline_styles_in_key_value_vec(e, o, a, n, i, s);
        }
        function p(e, t, n, i, s) {
          let o = z(t, r.__wbindgen_malloc, r.__wbindgen_realloc),
            a = G;
          return 0 !== r.set_inline_styles_in_str(e, o, a, n, i, s);
        }
        function w(e, t, n) {
          var i = U(n) ? 0 : z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
            s = G;
          r.set_inline_styles_number_key(e, t, i, s);
        }
        function m() {
          return {
            __proto__: null,
            './client_bg.js': {
              __proto__: null,
              __wbg_Error_92b29b0548f8b746: function (e, t) {
                return Error(N(e, t));
              },
              __wbg___wbindgen_debug_string_c25d447a39f5578f: function (e, t) {
                let n = z(
                    (function e(t) {
                      let n,
                        r = typeof t;
                      if ('number' == r || 'boolean' == r || null == t)
                        return `${t}`;
                      if ('string' == r) return `"${t}"`;
                      if ('symbol' == r) {
                        let e = t.description;
                        return null == e ? 'Symbol' : `Symbol(${e})`;
                      }
                      if ('function' == r) {
                        let e = t.name;
                        return 'string' == typeof e && e.length > 0
                          ? `Function(${e})`
                          : 'Function';
                      }
                      if (Array.isArray(t)) {
                        let n = t.length,
                          r = '[';
                        n > 0 && (r += e(t[0]));
                        for (let i = 1; i < n; i++) r += ', ' + e(t[i]);
                        return r + ']';
                      }
                      let i = /\[object ([^\]]+)\]/.exec(toString.call(t));
                      if (!i || !(i.length > 1)) return toString.call(t);
                      if ('Object' == (n = i[1]))
                        try {
                          return 'Object(' + JSON.stringify(t) + ')';
                        } catch (e) {
                          return 'Object';
                        }
                      return t instanceof Error
                        ? `${t.name}: ${t.message}
${t.stack}`
                        : n;
                    })(t),
                    r.__wbindgen_malloc,
                    r.__wbindgen_realloc,
                  ),
                  i = G;
                (T().setInt32(e + 4, i, !0), T().setInt32(e + 0, n, !0));
              },
              __wbg___wbindgen_is_null_ea9085d691f535d3: function (e) {
                return null === e;
              },
              __wbg___wbindgen_is_undefined_c05833b95a3cf397: function (e) {
                return void 0 === e;
              },
              __wbg___wbindgen_jsval_eq_e659fcf7b0e32763: function (e, t) {
                return e === t;
              },
              __wbg___wbindgen_string_get_b0ca35b86a603356: function (e, t) {
                let n = 'string' == typeof t ? t : void 0;
                var i = U(n)
                    ? 0
                    : z(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
                  s = G;
                (T().setInt32(e + 4, s, !0), T().setInt32(e + 0, i, !0));
              },
              __wbg___wbindgen_throw_344f42d3211c4765: function (e, t) {
                throw Error(N(e, t));
              },
              __wbg_addEventListener_514c0d1b9cb98d61: function (e, t, n) {
                e.addEventListener(N(t, n));
              },
              __wbg_appendChild_f553e8704c4f14a6: function () {
                return D(function (e, t) {
                  return e.appendChild(t);
                }, arguments);
              },
              __wbg_cloneNode_5f99da4333e10617: function () {
                return D(function (e, t) {
                  return e.cloneNode(0 !== t);
                }, arguments);
              },
              __wbg_createElement_fcbc0805de826d62: function () {
                return D(function (e, t, n) {
                  return e.createElement(N(t, n));
                }, arguments);
              },
              __wbg_cssRules_a96ba5e195723d36: function () {
                return D(function (e) {
                  return e.cssRules;
                }, arguments);
              },
              __wbg_deref_e6425a8fa9d03a9d: function (e) {
                let t = e.deref();
                return U(t) ? 0 : E(t);
              },
              __wbg_disableElementEvent_00750da2a3d98d3b: function () {
                return D(function (e, t, n, r) {
                  e.disableElementEvent(t, N(n, r));
                }, arguments);
              },
              __wbg_enableElementEvent_d3b114945b78a398: function () {
                return D(function (e, t, n, r) {
                  e.enableElementEvent(t, N(n, r));
                }, arguments);
              },
              __wbg_eventinfo_new: function (e) {
                return i.__wrap(e);
              },
              __wbg_getClassList_4ef38849a4003220: function () {
                return D(function (e, t, n) {
                  let i = F(t.getClassList(n), r.__wbindgen_malloc),
                    s = G;
                  (T().setInt32(e + 4, s, !0), T().setInt32(e + 0, i, !0));
                }, arguments);
              },
              __wbg_get_507a50627bffa49b: function (e, t) {
                return e[t >>> 0];
              },
              __wbg_get_78f252d074a84d0b: function () {
                return D(function (e, t) {
                  return Reflect.get(e, t);
                }, arguments);
              },
              __wbg_has_8374cf06984d8bfc: function () {
                return D(function (e, t) {
                  return Reflect.has(e, t);
                }, arguments);
              },
              __wbg_host_18450e7fb2bf2108: function (e) {
                return e.host;
              },
              __wbg_insertRule_7f44b1a334b975c5: function () {
                return D(function (e, t, n, r) {
                  return e.insertRule(N(t, n), r >>> 0);
                }, arguments);
              },
              __wbg_item_6c9c57d2b0d3b03b: function (e, t) {
                let n = e.item(t >>> 0);
                return U(n) ? 0 : E(n);
              },
              __wbg_keys_58421f8f96795607: function (e) {
                return Object.keys(e);
              },
              __wbg_length_1f0964f4a5e2c6d8: function (e) {
                return e.length;
              },
              __wbg_length_370319915dc99107: function (e) {
                return e.length;
              },
              __wbg_length_c9d11fa3c1e97549: function (e) {
                return e.length;
              },
              __wbg_new_da52cf8fe3429cb2: function () {
                return {};
              },
              __wbg_new_from_slice_77cdfb7977362f3c: function (e, t) {
                return new Uint8Array(A(e, t));
              },
              __wbg_ownerDocument_5a7a5473f8709b3e: function (e) {
                let t = e.ownerDocument;
                return U(t) ? 0 : E(t);
              },
              __wbg_prototypesetcall_4770620bbe4688a0: function (e, t, n) {
                Uint8Array.prototype.set.call(A(e, t), n);
              },
              __wbg_publishEvent_749c038ad23b85ab: function (
                e,
                t,
                n,
                r,
                i,
                s,
                o,
                a,
                _,
                l,
              ) {
                e.publishEvent(
                  N(t, n),
                  0 === r ? void 0 : N(r, i),
                  s,
                  o >>> 0,
                  a,
                  _ >>> 0,
                  l,
                );
              },
              __wbg_removeAttribute_1e7d2c409776d836: function () {
                return D(function (e, t, n) {
                  e.removeAttribute(N(t, n));
                }, arguments);
              },
              __wbg_removeAttribute_425b95bcfcd686d9: function () {
                return D(function (e, t, n, r) {
                  e.removeAttribute(t, N(n, r));
                }, arguments);
              },
              __wbg_removeProperty_70da952bc1b493fa: function () {
                return D(function (e, t, n, i) {
                  let s = z(
                      t.removeProperty(N(n, i)),
                      r.__wbindgen_malloc,
                      r.__wbindgen_realloc,
                    ),
                    o = G;
                  (T().setInt32(e + 4, o, !0), T().setInt32(e + 0, s, !0));
                }, arguments);
              },
              __wbg_runElementClosure_6b4e42c656f6ee9d: function (
                e,
                t,
                n,
                r,
                i,
                s,
                o,
              ) {
                e.runElementClosure(t, n, r >>> 0, i, s >>> 0, o);
              },
              __wbg_runWorklet_2a64b8ec4e735212: function (
                e,
                t,
                n,
                r,
                i,
                s,
                o,
              ) {
                e.runWorklet(t, n, r >>> 0, i, s >>> 0, o);
              },
              __wbg_setAttribute_39a501bc57b5d356: function () {
                return D(function (e, t, n, r, i, s) {
                  e.setAttribute(t, N(n, r), N(i, s));
                }, arguments);
              },
              __wbg_setAttribute_71039043be82d098: function () {
                return D(function (e, t, n, r, i) {
                  e.setAttribute(N(t, n), N(r, i));
                }, arguments);
              },
              __wbg_setProperty_e4e51b1b1d681d15: function () {
                return D(function (e, t, n, r, i) {
                  e.setProperty(N(t, n), N(r, i));
                }, arguments);
              },
              __wbg_set_8535240470bf2500: function () {
                return D(function (e, t, n) {
                  return Reflect.set(e, t, n);
                }, arguments);
              },
              __wbg_set_cssText_1d203a1b8ff80e20: function (e, t, n) {
                e.cssText = N(t, n);
              },
              __wbg_set_textContent_54dcad83ae15772d: function (e, t, n) {
                e.textContent = 0 === t ? void 0 : N(t, n);
              },
              __wbg_sheet_9201185a230c1cdc: function (e) {
                let t = e.sheet;
                return U(t) ? 0 : E(t);
              },
              __wbg_style_00ba0d9bec50983f: function (e) {
                return e.style;
              },
              __wbg_style_6657aed849e5d757: function (e) {
                return e.style;
              },
              __wbindgen_cast_0000000000000001: function (e, t) {
                return N(e, t);
              },
              __wbindgen_init_externref_table: function () {
                let e = r.__wbindgen_externrefs,
                  t = e.grow(4);
                (e.set(0, void 0),
                  e.set(t + 0, void 0),
                  e.set(t + 1, null),
                  e.set(t + 2, !0),
                  e.set(t + 3, !1));
              },
            },
          };
        }
        Symbol.dispose && (c.prototype[Symbol.dispose] = c.prototype.free);
        let y =
            'u' < typeof FinalizationRegistry
              ? { register: () => {}, unregister: () => {} }
              : new FinalizationRegistry((e) => r.__wbg_eventinfo_free(e, 1)),
          v =
            'u' < typeof FinalizationRegistry
              ? { register: () => {}, unregister: () => {} }
              : new FinalizationRegistry((e) =>
                  r.__wbg_mainthreadwasmcontext_free(e, 1),
                ),
          S =
            'u' < typeof FinalizationRegistry
              ? { register: () => {}, unregister: () => {} }
              : new FinalizationRegistry((e) =>
                  r.__wbg_rawstyleinfo_free(e, 1),
                ),
          x =
            'u' < typeof FinalizationRegistry
              ? { register: () => {}, unregister: () => {} }
              : new FinalizationRegistry((e) => r.__wbg_rule_free(e, 1)),
          k =
            'u' < typeof FinalizationRegistry
              ? { register: () => {}, unregister: () => {} }
              : new FinalizationRegistry((e) => r.__wbg_ruleprelude_free(e, 1)),
          C =
            'u' < typeof FinalizationRegistry
              ? { register: () => {}, unregister: () => {} }
              : new FinalizationRegistry((e) => r.__wbg_selector_free(e, 1)),
          R =
            'u' < typeof FinalizationRegistry
              ? { register: () => {}, unregister: () => {} }
              : new FinalizationRegistry((e) =>
                  r.__wbg_stylesheetresource_free(e, 1),
                );
        function E(e) {
          let t = r.__externref_table_alloc();
          return (r.__wbindgen_externrefs.set(t, e), t);
        }
        function P(e, t) {
          if (!(e instanceof t)) throw Error(`expected instance of ${t.name}`);
        }
        function O(e, t) {
          e >>>= 0;
          let n = T(),
            i = [];
          for (let s = e; s < e + 4 * t; s += 4)
            i.push(r.__wbindgen_externrefs.get(n.getUint32(s, !0)));
          return (r.__externref_drop_slice(e, t), i);
        }
        function A(e, t) {
          return ((e >>>= 0), I().subarray(e / 1, e / 1 + t));
        }
        let M = null;
        function T() {
          return (
            (null === M ||
              !0 === M.buffer.detached ||
              (void 0 === M.buffer.detached && M.buffer !== r.memory.buffer)) &&
              (M = new DataView(r.memory.buffer)),
            M
          );
        }
        function N(e, t) {
          var n, r;
          return (
            (n = e >>> 0),
            (V += r = t) >= 0x7ff00000 &&
              ((H = new TextDecoder('utf-8', {
                ignoreBOM: !0,
                fatal: !0,
              })).decode(),
              (V = r)),
            H.decode(I().subarray(n, n + r))
          );
        }
        let j = null,
          L = null;
        function I() {
          return (
            (null === L || 0 === L.byteLength) &&
              (L = new Uint8Array(r.memory.buffer)),
            L
          );
        }
        function D(e, t) {
          try {
            return e.apply(this, t);
          } catch (t) {
            let e = E(t);
            r.__wbindgen_exn_store(e);
          }
        }
        function U(e) {
          return null == e;
        }
        function W(e, t) {
          let n = t(4 * e.length, 4) >>> 0;
          return (
            ((null === j || 0 === j.byteLength) &&
              (j = new Uint32Array(r.memory.buffer)),
            j).set(e, n / 4),
            (G = e.length),
            n
          );
        }
        function F(e, t) {
          let n = t(4 * e.length, 4) >>> 0;
          for (let t = 0; t < e.length; t++) {
            let r = E(e[t]);
            T().setUint32(n + 4 * t, r, !0);
          }
          return ((G = e.length), n);
        }
        function z(e, t, n) {
          if (void 0 === n) {
            let n = q.encode(e),
              r = t(n.length, 1) >>> 0;
            return (
              I()
                .subarray(r, r + n.length)
                .set(n),
              (G = n.length),
              r
            );
          }
          let r = e.length,
            i = t(r, 1) >>> 0,
            s = I(),
            o = 0;
          for (; o < r; o++) {
            let t = e.charCodeAt(o);
            if (t > 127) break;
            s[i + o] = t;
          }
          if (o !== r) {
            (0 !== o && (e = e.slice(o)),
              (i = n(i, r, (r = o + 3 * e.length), 1) >>> 0));
            let t = I().subarray(i + o, i + r);
            ((o += q.encodeInto(e, t).written), (i = n(i, r, o, 1) >>> 0));
          }
          return ((G = o), i);
        }
        function B(e) {
          let t = r.__wbindgen_externrefs.get(e);
          return (r.__externref_table_dealloc(e), t);
        }
        let H = new TextDecoder('utf-8', { ignoreBOM: !0, fatal: !0 });
        H.decode();
        let V = 0,
          q = new TextEncoder();
        'encodeInto' in q ||
          (q.encodeInto = function (e, t) {
            let n = q.encode(e);
            return (t.set(n), { read: e.length, written: n.length });
          });
        let G = 0;
        function $(e, t) {
          return (
            (r = e.exports),
            (M = null),
            (j = null),
            (L = null),
            r.__wbindgen_start(),
            r
          );
        }
        async function J(e, t) {
          if ('function' == typeof Response && e instanceof Response) {
            if ('function' == typeof WebAssembly.instantiateStreaming)
              try {
                return await WebAssembly.instantiateStreaming(e, t);
              } catch (t) {
                if (
                  e.ok &&
                  (function (e) {
                    switch (e) {
                      case 'basic':
                      case 'cors':
                      case 'default':
                        return !0;
                    }
                    return !1;
                  })(e.type) &&
                  'application/wasm' !== e.headers.get('Content-Type')
                )
                  console.warn(
                    '`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
                    t,
                  );
                else throw t;
              }
            let n = await e.arrayBuffer();
            return await WebAssembly.instantiate(n, t);
          }
          {
            let n = await WebAssembly.instantiate(e, t);
            return n instanceof WebAssembly.Instance
              ? { instance: n, module: e }
              : n;
          }
        }
        function Q(e) {
          if (void 0 !== r) return r;
          void 0 !== e &&
            (Object.getPrototypeOf(e) === Object.prototype
              ? ({ module: e } = e)
              : console.warn(
                  'using deprecated parameters for `initSync()`; pass a single object instead',
                ));
          let t = m();
          return (
            e instanceof WebAssembly.Module || (e = new WebAssembly.Module(e)),
            $(new WebAssembly.Instance(e, t), e)
          );
        }
        async function Y(e) {
          if (void 0 !== r) return r;
          (void 0 !== e &&
            (Object.getPrototypeOf(e) === Object.prototype
              ? ({ module_or_path: e } = e)
              : console.warn(
                  'using deprecated parameters for the initialization function; pass a single object instead',
                )),
            void 0 === e && (e = new URL(n(9099), n.b)));
          let t = m();
          ('string' == typeof e ||
            ('function' == typeof Request && e instanceof Request) ||
            ('function' == typeof URL && e instanceof URL)) &&
            (e = fetch(e));
          let { instance: i, module: s } = await J(await e, t);
          return $(i, s);
        }
        n.d(t, {
          EventInfo: () => i,
          MainThreadWasmContext: () => s,
          RawStyleInfo: () => o,
          Rule: () => a,
          RulePrelude: () => _,
          Selector: () => l,
          StyleSheetResource: () => c,
          add_inline_style_raw_string_key: () => d,
          decode_style_info: () => u,
          default: () => Y,
          encode_legacy_json_generated_raw_style_info: () => h,
          get_font_face_content: () => b,
          get_style_content: () => g,
          initSync: () => Q,
          set_inline_styles_in_key_value_vec: () => f,
          set_inline_styles_in_str: () => p,
          set_inline_styles_number_key: () => w,
        });
      },
      8042(e, t, n) {
        var r = n(1980);
        let i = Promise.resolve().then(n.bind(n, 4785));
        class s {
          #e = new Map();
          #t = new Map();
          #n = new Map();
          #r = new Map();
          #i = new Map();
          #s = null;
          #o = null;
          #a = null;
          constructor() {
            this.#_();
          }
          fetchBundle(e, t, n, r, i, s) {
            if (this.#e.has(e))
              return (async () => {
                let n = this.#e.get(e),
                  r = n?.config || {},
                  i = await t;
                (i.backgroundThread.markTiming('decode_start'),
                  i.onPageConfigReady(r),
                  i.onStyleInfoReady(e),
                  i.onMTSScriptsLoaded(e, 'true' === r.isLazy),
                  i.onBTSScriptsLoaded(e));
              })();
            {
              if (this.#n.has(e))
                return this.#n.get(e).then(async () => {
                  let n = this.#e.get(e),
                    r = n?.config || {},
                    i = await t;
                  (i.backgroundThread.markTiming('decode_start'),
                    i.onPageConfigReady(r),
                    i.onStyleInfoReady(e),
                    i.onMTSScriptsLoaded(e, 'true' === r.isLazy),
                    i.onBTSScriptsLoaded(e));
                });
              this.createBundle(e);
              let o = this.#l(e, t, n, r, i, s);
              return (this.#n.set(e, o), o);
            }
          }
          async #l(e, t, n, r, i, s) {
            let o = performance.now() + performance.timeOrigin;
            (t.then((e) => {
              e.backgroundThread.markTiming('fetch_start', void 0, o);
            }),
              this.#r.set(e, t),
              await this.#_());
            let a = {
              type: 'load',
              url: e,
              fetchUrl: new URL(e, location.href).toString(),
              transformVW: n,
              transformVH: r,
              transformREM: i,
              overrideConfig: s,
            };
            return (
              this.#s.postMessage(a),
              new Promise((t, n) => {
                this.#i.set(e, { resolve: t, reject: n });
              })
            );
          }
          #c(e) {
            let t = this.#i.get(e);
            t && (t.resolve(), this.#i.delete(e));
          }
          #d(e, t) {
            let n = this.#i.get(e);
            n && (n.reject(t), this.#i.delete(e));
          }
          #_() {
            return this.#s
              ? this.#o
                ? this.#o
                : void 0
              : ((this.#o = new Promise((e) => {
                  this.#a = e;
                })),
                (this.#s = new Worker(
                  new URL(n.p + n.u(350), n.b),
                  Object.assign({}, { type: 'module' }, { type: void 0 }),
                )),
                (this.#s.onmessage = this.#u.bind(this)),
                this.#o.then(() => {
                  i.then(({ wasmModule: e }) => {
                    this.#s.postMessage({ type: 'init', wasmModule: e });
                  });
                }),
                this.#o);
          }
          #u(e) {
            let t = e.data;
            if ('ready' === t.type) {
              this.#a && (this.#a(), (this.#a = null), (this.#o = null));
              return;
            }
            if ('heartbreak' === t.type)
              return void this.#s?.postMessage({ type: 'heartbreak' });
            let { url: n } = t,
              r = this.#r.get(n);
            if (r)
              switch (t.type) {
                case 'section':
                  this.#h(t, r);
                  break;
                case 'error':
                  (console.error(`Error decoding bundle ${n}:`, t.error),
                    this.#b(n),
                    this.#g(n),
                    this.#d(n, Error(t.error)),
                    this.#n.delete(n));
                  break;
                case 'done':
                  this.#b(n);
                  let i = this.#t.get(n);
                  (i && (this.#e.set(n, i), this.#t.delete(n)),
                    this.#c(n),
                    this.#n.delete(n),
                    r.then((e) => {
                      (e.backgroundThread.markTiming('decode_end'),
                        e.backgroundThread.markTiming('load_template_start'));
                    }));
              }
          }
          async #h(e, t) {
            let [n, s] = await Promise.all([
                t,
                i.then((e) => e.wasmInstance.StyleSheetResource),
              ]),
              { label: o, data: a, url: _, config: l } = e;
            switch (o) {
              case r.eC.Configurations:
                (n.backgroundThread.markTiming('decode_start'),
                  this.#f(_, a),
                  n.onPageConfigReady(a));
                break;
              case r.eC.StyleInfo: {
                let e = new s(new Uint8Array(a), document),
                  t = this.#t.get(_);
                (t && (t.styleSheet = e), n.onStyleInfoReady(_));
                break;
              }
              case r.eC.LepusCode:
                (this.#p(_, a), n.onMTSScriptsLoaded(_, 'true' === l.isLazy));
                break;
              case r.eC.CustomSections:
                this.#w(_, a);
                break;
              case r.eC.Manifest:
                (this.#m(_, a), n.onBTSScriptsLoaded(_));
                break;
              default:
                throw Error(`Unknown section label: ${o}`);
            }
          }
          #b(e) {
            this.#r.delete(e);
          }
          createBundle(e) {
            if (this.#e.has(e)) {
              let t = this.#e.get(e);
              if (t) {
                if (t.lepusCode)
                  for (let e of Object.values(t.lepusCode))
                    URL.revokeObjectURL(e);
                if (t.backgroundCode)
                  for (let e of Object.values(t.backgroundCode))
                    URL.revokeObjectURL(e);
                t.styleSheet && t.styleSheet.free();
              }
              this.#e.delete(e);
            }
            if (this.#t.has(e)) {
              let t = this.#t.get(e);
              if (t) {
                if (t.lepusCode)
                  for (let e of Object.values(t.lepusCode))
                    URL.revokeObjectURL(e);
                if (t.backgroundCode)
                  for (let e of Object.values(t.backgroundCode))
                    URL.revokeObjectURL(e);
                t.styleSheet && t.styleSheet.free();
              }
              this.#t.delete(e);
            }
            this.#t.set(e, {});
          }
          #g(e) {
            (this.createBundle(e), this.#t.delete(e));
          }
          #f(e, t) {
            let n = this.#t.get(e);
            n && (n.config = t);
          }
          #p(e, t) {
            let n = this.#t.get(e);
            n && (n.lepusCode = t);
          }
          #w(e, t) {
            let n = this.#t.get(e);
            n && (n.customSections = t);
          }
          #m(e, t) {
            let n = this.#t.get(e);
            n && (n.backgroundCode = t);
          }
          getBundle(e) {
            return this.#e.get(e) || this.#t.get(e);
          }
          getStyleSheet(e) {
            return this.getBundle(e)?.styleSheet;
          }
        }
        let o = new s();
        n.d(t, {}, { Q: o });
      },
      4785(e, t, n) {
        n.a(
          e,
          async function (e, r) {
            try {
              n.r(t);
              var i = n(480);
              let e =
                  'u' > typeof WorkerGlobalScope &&
                  self instanceof WorkerGlobalScope,
                s = Promise.all([(0, i.rO)(), (0, i.oR)()]).then(([t, r]) =>
                  t && r
                    ? Promise.all([
                        Promise.resolve().then(n.bind(n, 8235)),
                        e
                          ? void 0
                          : WebAssembly.compileStreaming(
                              fetch(new URL(n(9099), n.b)),
                            ),
                      ])
                    : Promise.all([
                        n.e(778, 'low').then(n.bind(n, 9125)),
                        e
                          ? void 0
                          : WebAssembly.compileStreaming(
                              fetch(new URL(n(8331), n.b)),
                            ),
                      ]),
                ),
                [o, a] = await s;
              (e || (await o.default(a)),
                n.d(t, {}, { wasmInstance: o, wasmModule: a }),
                r());
            } catch (e) {
              r(e);
            }
          },
          1,
        );
      },
      1980(e, t, n) {
        var r, i, s, o, a, _;
        let l = Symbol('uniqueId'),
          c = {
            click: 'tap',
            lynxscroll: 'scroll',
            lynxscrollend: 'scrollend',
            overlaytouch: 'touch',
            lynxfocus: 'focus',
            lynxblur: 'blur',
            lynxinput: 'input',
          },
          d = Object.fromEntries(Object.entries(c).map(([e, t]) => [t, e]));
        (((o = r || (r = {}))[(o.SUCCESS = 0)] = 'SUCCESS'),
          (o[(o.UNKNOWN = 1)] = 'UNKNOWN'),
          (o[(o.NODE_NOT_FOUND = 2)] = 'NODE_NOT_FOUND'),
          (o[(o.METHOD_NOT_FOUND = 3)] = 'METHOD_NOT_FOUND'),
          (o[(o.PARAM_INVALID = 4)] = 'PARAM_INVALID'),
          (o[(o.SELECTOR_NOT_SUPPORTED = 5)] = 'SELECTOR_NOT_SUPPORTED'),
          (o[(o.NO_UI_FOR_NODE = 6)] = 'NO_UI_FOR_NODE'));
        let u = Object.freeze(
            Object.assign(Object.create(null), {
              view: 'x-view',
              text: 'x-text',
              image: 'x-image',
              'raw-text': 'raw-text',
              'scroll-view': 'x-scroll-view',
              wrapper: 'lynx-wrapper',
              list: 'x-list',
              page: 'div',
              input: 'x-input',
              'x-input-ng': 'x-input',
              textarea: 'x-textarea',
              svg: 'x-svg',
              frame: 'lynx-view',
            }),
          ),
          h = Object.freeze(
            Object.assign(
              Object.create(null),
              Object.fromEntries(Object.entries(u).map(([e, t]) => [t, e])),
            ),
          );
        Object.assign(Object.create(null), {
          list: 0,
          'x-swiper': 1,
          'x-input': 2,
          'x-input-ng': 2,
          input: 2,
          'x-textarea': 3,
          'x-audio-tt': 4,
          'x-foldview-ng': 5,
          'x-foldview-header-ng': 5,
          'x-foldview-slot-drag-ng': 5,
          'x-foldview-slot-ng': 5,
          'x-foldview-toolbar-ng': 5,
          'x-refresh-view': 6,
          'x-refresh-header': 6,
          'x-refresh-footer': 6,
          'x-overlay-ng': 7,
          'x-viewpager-ng': 8,
          'x-viewpager-item-ng': 8,
        });
        let b = Symbol.for('lynx-scroll-container-dom');
        (((a = i || (i = {}))[(a.ID_SELECTOR = 0)] = 'ID_SELECTOR'),
          (a[(a.REF_ID = 1)] = 'REF_ID'),
          (a[(a.UNIQUE_ID = 2)] = 'UNIQUE_ID'),
          ((_ = s || (s = {}))[(_.START = 0)] = 'START'),
          (_[(_.PLAY = 1)] = 'PLAY'),
          (_[(_.PAUSE = 2)] = 'PAUSE'),
          (_[(_.CANCEL = 3)] = 'CANCEL'),
          (_[(_.FINISH = 4)] = 'FINISH'),
          n.d(
            t,
            { O4: () => r, Uc: () => s, Wx: () => i },
            {
              $4: c,
              Fd: l,
              Gm: 'lynx-default-display-linear',
              H1: u,
              JA: 'l-disposed',
              Pb: 'l-e-name',
              RM: { platform: 'web', lynxSdkVersion: '3.0' },
              Ye: {
                RenderPage: '__RenderPage',
                UpdatePage: '__UpdatePage',
                DestroyLifetime: '__DestroyLifetime',
                UpdateGlobalProps: '__UpdateGlobalProps',
              },
              eC: {
                Manifest: 1,
                StyleInfo: 2,
                LepusCode: 3,
                CustomSections: 4,
                ElementTemplates: 5,
                Configurations: 6,
              },
              f7: 'lynx-default-overflow-visible',
              hv: 'i18nResourceMissed',
              im: d,
              li: b,
              oZ: 'dirtyID',
              u9: 'loadUnknownElement',
              vh: h,
              xW: '__lynx_timing_flag',
              y: 'l-template',
            },
          ));
      },
      4634(e, t, n) {
        n.d(t, {
          uA: () => c,
          LB: () => o,
          H$: () => a,
          _8: () => _,
          JS: () => s,
          Ut: () => l,
          qy: () => d,
          _y: () => h,
          ZR: () => g,
          h3: () => b,
        });
        let r = [];
        function i() {
          let e = r;
          for (let [t, n] of ((r = []), e)) n ? t.call(n) : t();
        }
        function s(e, t) {
          (0 === r.length && queueMicrotask(i), r.push([e, t]));
        }
        function o(e, t, n, r) {
          let i = !1;
          return function (o) {
            if (o !== i) {
              let a = e.call(this);
              o
                ? (s(() => a.addEventListener(t, n, r)), (i = !0))
                : (s(() => a.removeEventListener(t, n)), (i = !1));
            }
          };
        }
        function a(e, t, n) {
          return function (r) {
            n && (r = n(r));
            let i = e.call(this);
            i.getAttribute(t) !== r &&
              (null !== r
                ? s(() => {
                    i.setAttribute(t, r);
                  })
                : s(() => {
                    i.removeAttribute(t);
                  }));
          };
        }
        function _(e, t, n, r) {
          return function (i) {
            i
              ? (n && (i = n(i)),
                s(() =>
                  e
                    .call(this)
                    .style.setProperty(t, i, r ? 'important' : void 0),
                ))
              : s(() => e.call(this).style.removeProperty(t));
          };
        }
        function l(e, t) {
          let n, r;
          return () => (
            r || (r = e()),
            (r.nodeType === Node.DOCUMENT_FRAGMENT_NODE && n) ||
              (n = r.querySelector(t)),
            n
          );
        }
        function c(e, t, n) {
          let r,
            i = t.filter((e) => !!e);
          return (t, { addInitializer: o }) => {
            var a;
            let _ = new Set([
              ...i
                .filter((e) => e.observedCSSProperties)
                .map((e) => e.observedCSSProperties)
                .reduce((e, t) => e.concat(t), []),
            ]);
            class l extends t {
              static registerPlugin(e) {
                if (
                  (a.observedAttributes.push(...e.observedAttributes),
                  e.observedCSSProperties)
                )
                  for (let t of e.observedCSSProperties) _.add(t);
                i.push(e);
              }
              static observedAttributes = [
                ...(t.observedAttributes ?? []),
                ...i
                  .map((e) => e.observedAttributes)
                  .reduce((e, t) => e.concat(t), []),
                'class',
              ];
              #y = [];
              constructor() {
                if (
                  (super(),
                  n &&
                    !r &&
                    (((r = document.createElement('template')).innerHTML = n),
                    document.body.appendChild(r)),
                  r && !this.shadowRoot)
                ) {
                  const e = this.attachShadow({
                      mode: 'open',
                      delegatesFocus: !0,
                    }),
                    t = r.content.cloneNode(!0);
                  e.append(t);
                }
                ((this.#y = i.map((e) => new e(this))), this.#v());
              }
              #S = !1;
              #x = new Map();
              #k() {
                !this.#S && _.size && ((this.#S = !0), s(this.#C, this));
              }
              #C() {
                let e = getComputedStyle(this);
                for (let n of _) {
                  var t;
                  let r = e.getPropertyValue(n),
                    i = e.getPropertyPriority(n),
                    s = ((t = r.trim()), i ? t + ' !important' : t);
                  if (this.#x.get(n) !== s)
                    for (let e of this.#y)
                      e.cssPropertyChangedHandler?.[n]?.call(e, s, n);
                }
                this.#S = !1;
              }
              setAttribute(e, t) {
                'false' !== t.toString() ||
                a.notToFilterFalseAttributes?.has(e) ||
                e.startsWith('data-')
                  ? super.setAttribute(e, t)
                  : this.removeAttribute(e);
              }
              #v() {
                let e = this.attributes;
                for (let t = 0, n; (n = e.item(t)); t++)
                  'false' !== n.value ||
                    a.notToFilterFalseAttributes?.has(n.name) ||
                    n.name.startsWith('data-') ||
                    this.removeAttributeNode(n);
              }
              #R = !1;
              attributeChangedCallback(e, t, n) {
                if (
                  (super.attributeChangedCallback &&
                    super.attributeChangedCallback(e, t, n),
                  a.notToFilterFalseAttributes?.has(e) ||
                    e.startsWith('data-') ||
                    ('false' === t && (t = null),
                    'false' === n && ((n = null), this.removeAttribute(e))),
                  t !== n)
                ) {
                  for (let r of (this.#R &&
                    ('class' === e || 'style' === e) &&
                    this.#k(),
                  this.#y))
                    if (r.attributeChangedHandler?.[e]) {
                      let { handler: i, noDomMeasure: o } =
                        r.attributeChangedHandler[e];
                      o
                        ? i.call(r, n, t, e)
                        : this.#R && s(() => i.call(r, n, t, e));
                    }
                }
              }
              #E() {
                this.getAttributeNames().forEach((e) => {
                  for (let t of this.#y)
                    if (t.attributeChangedHandler?.[e]) {
                      let { handler: n, noDomMeasure: r } =
                        t.attributeChangedHandler[e];
                      r || s(() => n.call(t, this.getAttribute(e), null, e));
                    }
                });
              }
              connectedCallback() {
                (super.connectedCallback?.(),
                  this.#y.forEach((e) => {
                    e.connectedCallback?.();
                  }),
                  this.#k(),
                  s(this.#E, this),
                  (this.#R = !0));
              }
              disconnectedCallback() {
                (super.disconnectedCallback?.(),
                  this.#y.forEach((e) => {
                    e.dispose?.();
                  }));
              }
              #P = {};
              enableEvent(e) {
                this.#P[e] ??= {
                  count: 0,
                  listenerCount: new WeakMap(),
                  captureListenerCount: new WeakMap(),
                };
                let t = this.#P[e];
                if (0 === t.count)
                  for (let t of this.#y) {
                    let n = t.eventStatusChangedHandler?.[e];
                    n && n.call(t, !0, e);
                  }
                t.count++;
              }
              disableEvent(e) {
                let t = this.#P[e];
                if (t && t.count > 0 && (t.count--, 0 === t.count))
                  for (let t of this.#y) {
                    let n = t.eventStatusChangedHandler?.[e];
                    n && n.call(t, !1, e);
                  }
              }
              addEventListener(e, t, n) {
                (super.addEventListener(e, t, n), this.enableEvent(e));
                let r = this.#P[e],
                  i = ('object' == typeof n ? n.capture : n)
                    ? r.captureListenerCount
                    : r.listenerCount,
                  s = i.get(t) ?? 0;
                i.set(t, s + 1);
              }
              removeEventListener(e, t, n) {
                super.removeEventListener(e, t, n);
                let r = 'object' == typeof n ? n.capture : n,
                  i = this.#P[e];
                if (i && i.count > 0) {
                  let n = r ? i.captureListenerCount : i.listenerCount;
                  1 === n.get(t) && (n.delete(t), this.disableEvent(e));
                }
              }
            }
            return (
              (a = l),
              o(() => {
                customElements.define(e, l);
              }),
              l
            );
          };
        }
        let d = (e, ...t) => String.raw({ raw: e }, ...t);
        function u(e, t) {
          return function (n, ...r) {
            return function (i, s) {
              if ('method' === s.kind)
                s.addInitializer(function () {
                  ((this[e] ??= {}), (this[e][n] = t(i, r)));
                });
              else if ('field' === s.kind)
                return function (i) {
                  return ((this[e] ??= {}), (this[e][n] = t(i, r)), i);
                };
              else
                throw Error(
                  `[lynx-web-components] decorator type ${s.kind} is not supported`,
                );
            };
          };
        }
        let h = u('attributeChangedHandler', (e, [t]) => ({
            handler: e,
            noDomMeasure: t,
          })),
          b = u('cssPropertyChangedHandler', (e) => e),
          g = u('eventStatusChangedHandler', (e) => e);
      },
      7550(e, t, n) {
        let r, i, s;
        var o = n(2198),
          a = n(3522),
          _ = n(4634);
        let l = Symbol('layoutChangeTarget'),
          c =
            ((i = []),
            (s = []),
            class {
              static {
                const e =
                  'function' == typeof Symbol && Symbol.metadata
                    ? Object.create(null)
                    : void 0;
                ((r = [(0, _.ZR)('layoutchange')]),
                  (0, o.G4)(
                    null,
                    null,
                    r,
                    {
                      kind: 'field',
                      name: '__handleScrollUpperThresholdEventEnabled',
                      static: !1,
                      private: !1,
                      access: {
                        has: (e) =>
                          '__handleScrollUpperThresholdEventEnabled' in e,
                        get: (e) => e.__handleScrollUpperThresholdEventEnabled,
                        set: (e, t) => {
                          e.__handleScrollUpperThresholdEventEnabled = t;
                        },
                      },
                      metadata: e,
                    },
                    i,
                    s,
                  ),
                  e &&
                    Object.defineProperty(this, Symbol.metadata, {
                      enumerable: !0,
                      configurable: !0,
                      writable: !0,
                      value: e,
                    }));
              }
              static observedAttributes = [];
              #O;
              constructor(e) {
                ((0, o.zF)(this, s), (this.#O = e));
              }
              #A = !1;
              #M;
              __handleScrollUpperThresholdEventEnabled = (0, o.zF)(
                this,
                i,
                (e) => {
                  e && this.#O[l]
                    ? !this.#M &&
                      ((this.#M = new ResizeObserver(([e]) => {
                        if (e) {
                          let t = this.#O.id,
                            {
                              top: n,
                              bottom: r,
                              left: i,
                              right: s,
                              width: o,
                              height: _,
                            } = e.target.getBoundingClientRect();
                          this.#O.dispatchEvent(
                            new CustomEvent('layoutchange', {
                              detail: {
                                width: o,
                                height: _,
                                left: i,
                                right: s,
                                top: n,
                                bottom: r,
                                id: t,
                              },
                              ...a.$,
                            }),
                          );
                        }
                      })),
                      this.#A || (this.#M.observe(this.#O[l]), (this.#A = !0)))
                    : (this.#M?.disconnect(),
                      (this.#M = void 0),
                      (this.#A = !1));
                },
              );
              dispose() {
                (this.#M?.disconnect(), (this.#M = void 0), (this.#A = !1));
              }
            });
        n.d(t, { O: () => c }, { v: l });
      },
      3522(e, t, n) {
        n.d(t, {}, { $: { bubbles: !1, composed: !1, cancelable: !0 } });
      },
      4782(e, t, n) {
        let r = 'onscrollend' in document,
          i = Symbol.for('lynx-scroll-container-dom');
        n.d(t, {}, { k: r, l: i });
      },
      1680(e, t, n) {
        let r, i, s, o;
        var a = n(6888),
          _ = n(1980);
        let l = document.querySelector('script[nonce]'),
          c = l?.nonce || l?.getAttribute('nonce');
        async function d(e) {
          let t = document.createElement('iframe'),
            n = new Promise((e) => {
              let n = (r) => {
                'lynx:mtsready' === r.data &&
                  r.source === t.contentWindow &&
                  (e(), globalThis.removeEventListener('message', n));
              };
              globalThis.addEventListener('message', n);
            });
          ((t.style.display = 'none'),
            (t.srcdoc =
              '<!DOCTYPE html><html><head><script nonce="' +
              c +
              '">parent.postMessage("lynx:mtsready","*")<\/script></head><body style="display:none"></body></html>'),
            (t.sandbox = 'allow-same-origin allow-scripts'),
            (t.loading = 'eager'),
            e.appendChild(t),
            await n);
          let r = t.contentWindow,
            i = async (e) => {
              let n = t.contentDocument.createElement('script');
              return (
                (n.fetchPriority = 'high'),
                (n.defer = !0),
                (n.async = !1),
                (n.nonce = c || ''),
                t.contentDocument.head.appendChild(n),
                new Promise(async (t, i) => {
                  ((n.onload = () => {
                    let e = r?.module?.exports;
                    ((r.module = { exports: void 0 }), t(e));
                  }),
                    (n.onerror = (t) =>
                      i(Error(`Failed to load script: ${e}`, { cause: t }))),
                    (r.module = { exports: void 0 }),
                    (n.src = e));
                })
              );
            };
          return {
            globalWindow: r,
            loadScript: i,
            loadScriptSync: (e) => {
              let n = new XMLHttpRequest();
              if ((n.open('GET', e, !1), n.send(null), 200 === n.status)) {
                let e = t.contentDocument.createElement('script');
                ((e.textContent = n.responseText),
                  (r.module = { exports: void 0 }),
                  t.contentDocument.head.appendChild(e));
                let i = r?.module?.exports;
                return ((r.module = { exports: void 0 }), i);
              }
              throw Error(`Failed to load script: ${e}`, { cause: n });
            },
          };
        }
        var u = n(8042);
        (n.e(894, 'high').then(n.bind(n, 2028)),
          (r = (0, a._)('global-props')),
          (i = (0, a._)('global-props')),
          (s = (0, a._)('init-data')),
          (o = (0, a._)('init-data')));
        class h extends HTMLElement {
          static lynxViewCount = 0;
          static tag = 'lynx-view';
          static observedAttributeAsProperties = [
            'url',
            'src',
            'global-props',
            'init-data',
            'data',
            'browser-config',
            'transform-vw',
            'transform-vh',
            'transform-rem',
          ];
          static observedAttributes = h.observedAttributeAsProperties.map((e) =>
            e.toLowerCase(),
          );
          #T;
          #R = !1;
          #N;
          nativeModulesMap;
          napiModulesMap;
          onNapiModulesCall;
          #j;
          get browserConfig() {
            return this.#j;
          }
          set browserConfig(e) {
            if ('string' == typeof e)
              try {
                this.#j = JSON.parse(e);
              } catch (e) {
                console.error('Invalid browser-config', e);
              }
            else this.#j = e;
          }
          #L = !1;
          get transformVW() {
            return this.#L;
          }
          set transformVW(e) {
            ((this.#L = e),
              e
                ? this.setAttribute('transform-vw', '')
                : this.removeAttribute('transform-vw'));
          }
          #I = !1;
          get transformVH() {
            return this.#I;
          }
          set transformVH(e) {
            ((this.#I = e),
              e
                ? this.setAttribute('transform-vh', '')
                : this.removeAttribute('transform-vh'));
          }
          #D = !1;
          get transformREM() {
            return this.#D;
          }
          set transformREM(e) {
            ((this.#D = e),
              e
                ? this.setAttribute('transform-rem', '')
                : this.removeAttribute('transform-rem'));
          }
          constructor() {
            (super(),
              this.onNativeModulesCall ||
                (this.onNativeModulesCall = (e, t, n) =>
                  new Promise((r) => {
                    this.#U.push({ args: [e, t, n], resolve: r });
                  })));
          }
          get url() {
            return this.#N;
          }
          set url(e) {
            this.#N !== e && ((this.#N = e), this.#W());
          }
          get src() {
            return this.url;
          }
          set src(e) {
            this.url = e;
          }
          #F = {};
          get globalProps() {
            return this.#F;
          }
          set globalProps(e) {
            let t = 'string' == typeof e ? JSON.parse(e) : e;
            ((this.#F = t), this.#T?.updateGlobalProps(t));
          }
          get [r]() {
            return this.globalProps;
          }
          set [i](e) {
            this.globalProps = e;
          }
          #z = {};
          get initData() {
            return this.#z;
          }
          set initData(e) {
            let t = 'string' == typeof e ? JSON.parse(e) : e;
            this.updateData(t);
          }
          get [s]() {
            return this.initData;
          }
          set [o](e) {
            this.initData = e;
          }
          get data() {
            return this.initData;
          }
          set data(e) {
            this.initData = e;
          }
          #B = [];
          get initI18nResources() {
            return this.#B;
          }
          set initI18nResources(e) {
            'string' == typeof e ? (this.#B = JSON.parse(e)) : (this.#B = e);
          }
          updateI18nResources(e, t) {
            this.#T?.i18nManager.updateData(e, t);
          }
          #U = [];
          #H;
          get onNativeModulesCall() {
            return this.#H;
          }
          set onNativeModulesCall(e) {
            for (let t of ((this.#H = e), this.#U))
              t.resolve(e.apply(void 0, t.args));
            this.#U = [];
          }
          get lynxGroupId() {
            return this.getAttribute('lynx-group-id')
              ? Number(this.getAttribute('lynx-group-id'))
              : void 0;
          }
          set lynxGroupId(e) {
            e
              ? this.setAttribute('lynx-group-id', e.toString())
              : this.removeAttribute('lynx-group-id');
          }
          updateData(e, t, n) {
            ((this.#z = e),
              this.#T?.updateData(e, t).then(() => {
                n?.();
              }));
          }
          updateGlobalProps(e) {
            this.globalProps = e;
          }
          sendGlobalEvent(e, t) {
            this.#T?.backgroundThread.sendGlobalEvent(e, t);
          }
          sendDevtoolEvent(e, t) {
            this.#T?.backgroundThread.sendDevtoolEvent({ type: e, data: t });
          }
          reload() {
            (this.removeAttribute('ssr'), this.#W());
          }
          setAttribute(e, t) {
            'false' === t ? this.removeAttribute(e) : super.setAttribute(e, t);
          }
          attributeChangedCallback(e, t, n) {
            if (t !== n)
              switch (e) {
                case 'url':
                case 'src':
                  this.url = n ?? void 0;
                  break;
                case 'global-props':
                  this.globalProps = n ? JSON.parse(n) : {};
                  break;
                case 'browser-config':
                  this.browserConfig = n ? JSON.parse(n) : void 0;
                  break;
                case 'init-data':
                case 'data':
                  this.initData = n ? JSON.parse(n) : {};
                  break;
                case 'transform-vw':
                  this.transformVW = 'false' !== n && null !== n;
                  break;
                case 'transform-vh':
                  this.transformVH = 'false' !== n && null !== n;
                  break;
                case 'transform-rem':
                  this.transformREM = 'false' !== n && null !== n;
              }
          }
          injectStyleRules;
          #V;
          disconnectedCallback() {
            ((this.#R = !1), this.#q());
          }
          async #q() {
            if (this.#V) return this.#V;
            let e = async () => {
              this.shadowRoot
                ?.querySelector('[part="page"]')
                ?.setAttribute(_.JA, '');
              let e = this.#T;
              ((this.#T = void 0),
                e && (await e[Symbol.asyncDispose]()),
                this.shadowRoot &&
                  ((this.shadowRoot.innerHTML = ''),
                  (this.shadowRoot.adoptedStyleSheets = [])));
            };
            ((this.#V = e()), await this.#V, (this.#V = void 0));
          }
          #G = !1;
          async #W() {
            if (!this.#G && this.#R && this.#N) {
              ((this.#G = !0),
                this.shadowRoot || this.attachShadow({ mode: 'open' }),
                (this.#T || this.#V) && (await this.#q()));
              let e = d(this.shadowRoot);
              queueMicrotask(async () => {
                if (this.injectStyleRules && this.injectStyleRules.length > 0) {
                  let e = new CSSStyleSheet();
                  for (let t of this.injectStyleRules) e.insertRule(t);
                  this.shadowRoot.adoptedStyleSheets =
                    this.shadowRoot.adoptedStyleSheets.concat(e);
                }
                let t = await e;
                if (this.#N) {
                  let e = n
                    .e(894, 'high')
                    .then(n.bind(n, 2028))
                    .then(({ LynxViewInstance: e }) => {
                      let n = this.hasAttribute('ssr');
                      return (
                        n && this.removeAttribute('ssr'),
                        new e(
                          this,
                          this.initData,
                          this.globalProps,
                          this.#N,
                          this.shadowRoot,
                          t,
                          n,
                          r,
                          this.nativeModulesMap,
                          this.napiModulesMap,
                          this.#B,
                          this.transformVW,
                          this.transformVH,
                          this.transformREM,
                          this.browserConfig,
                        )
                      );
                    });
                  u.Q.fetchBundle(
                    this.#N,
                    e,
                    this.transformVW,
                    this.transformVH,
                    this.transformREM,
                    void 0,
                  );
                  let r = this.lynxGroupId;
                  ((this.#T = await e), (this.#G = !1));
                }
              });
            }
          }
          #$(e) {
            if (Object.prototype.hasOwnProperty.call(this, e)) {
              let t = this[e];
              (delete this[e], (this[e] = t));
            }
          }
          connectedCallback() {
            (this.#$('url'),
              this.#$('src'),
              this.#$('globalProps'),
              this.#$('global-props'),
              this.#$('initData'),
              this.#$('init-data'),
              this.#$('data'),
              this.#$('browserConfig'),
              this.#$('transformVW'),
              this.#$('transformVH'),
              this.#$('transformREM'),
              this.url && (this.#N = this.url),
              (this.#R = !0),
              this.#W());
          }
        }
        (customElements.get(h.tag)
          ? console.error(`[${h.tag}] has already been defined`)
          : customElements.define(h.tag, h),
          n(4634),
          n(7550),
          n(3522),
          n(4782));
        let b = 'lynx-web-core-init-data',
          g = 'lynx-web-core-global-props',
          f = document.createElement('lynx-view');
        document.body.appendChild(f);
        let p =
          new URLSearchParams(document.location.search).get('casename') ||
          '/main.web.bundle';
        function w() {
          if (p) {
            let e = {};
            try {
              let t = localStorage.getItem(b);
              t && (e = JSON.parse(t));
            } catch {
              console.error(
                'Failed to parse initData from localStorage, use empty object instead.',
              );
            }
            let t = {};
            try {
              let e = localStorage.getItem(g);
              e && (t = JSON.parse(e));
            } catch {
              console.error(
                'Failed to parse globalProps from localStorage, use empty object instead.',
              );
            }
            ((f.globalProps = t), (f.initData = e), (f.url = p));
          }
        }
        function m(e) {
          (localStorage.setItem(b, JSON.stringify(e)), w());
        }
        function y(e) {
          (localStorage.setItem(g, JSON.stringify(e)), w());
        }
        function v() {
          (console.info(`  _  __     ___   ___   __ __          ________ ____    _____  _            _______ ______ ____  _____  __  __ 
 | | \\ \\   / / \\ | \\ \\ / / \\ \\        / /  ____|  _ \\  |  __ \\| |        /\\|__   __|  ____/ __ \\|  __ \\|  \\/  |
 | |  \\ \\_/ /|  \\| |\\ V /   \\ \\  /\\  / /| |__  | |_) | | |__) | |       /  \\  | |  | |__ | |  | | |__) | \\  / |
 | |   \\   / | . \\ | > <     \\ \\/  \\/ / |  __| |  _ <  |  ___/| |      / /\\ \\ | |  |  __|| |  | |  _  /| |\\/| |
 | |____| |  | |\\  |/ . \\     \\  /\\  /  | |____| |_) | | |    | |____ / ____ \\| |  | |   | |__| | | \\ \\| |  | |
 |______|_|  |_| \\_/_/ \\_\\     \\/  \\/   |______|____/  |_|    |______/_/    \\_\\_|  |_|    \\____/|_|  \\_\\_|  |_|`),
            console.table(
              Object.entries(S).map(
                ([e, t]) => ({
                  Method: e + '()',
                  Description: t.description || 'No description available',
                }),
                ['Method', 'Description'],
              ),
            ));
        }
        ((m.description =
          'Set the initData for lynx-view, which will be used when the page loads.'),
          (y.description =
            'Set the globalProps for lynx-view, which will be used when the page loads.'),
          (v.description =
            'Print all available methods and their descriptions.'));
        let S = { setInitData: m, setGlobalProps: y, help: v };
        (Object.assign(globalThis, S), v(), w());
      },
      6888(e, t, n) {
        function r(e) {
          return e && 'u' > typeof Symbol && e.constructor === Symbol
            ? 'symbol'
            : typeof e;
        }
        function i(e) {
          var t = (function (e, t) {
            if ('object' !== r(e) || null === e) return e;
            var n = e[Symbol.toPrimitive];
            if (void 0 !== n) {
              var i = n.call(e, t || 'default');
              if ('object' !== r(i)) return i;
              throw TypeError('@@toPrimitive must return a primitive value.');
            }
            return ('string' === t ? String : Number)(e);
          })(e, 'string');
          return 'symbol' === r(t) ? t : String(t);
        }
        n.d(t, { _: () => i });
      },
      2198(e, t, n) {
        function r(e, t, n, r, i, s) {
          function o(e) {
            if (void 0 !== e && 'function' != typeof e)
              throw TypeError('Function expected');
            return e;
          }
          for (
            var a,
              _ = r.kind,
              l = 'getter' === _ ? 'get' : 'setter' === _ ? 'set' : 'value',
              c = !t && e ? (r.static ? e : e.prototype) : null,
              d = t || (c ? Object.getOwnPropertyDescriptor(c, r.name) : {}),
              u = !1,
              h = n.length - 1;
            h >= 0;
            h--
          ) {
            var b = {};
            for (var g in r) b[g] = 'access' === g ? {} : r[g];
            for (var g in r.access) b.access[g] = r.access[g];
            b.addInitializer = function (e) {
              if (u)
                throw TypeError(
                  'Cannot add initializers after decoration has completed',
                );
              s.push(o(e || null));
            };
            var f = (0, n[h])(
              'accessor' === _ ? { get: d.get, set: d.set } : d[l],
              b,
            );
            if ('accessor' === _) {
              if (void 0 === f) continue;
              if (null === f || 'object' != typeof f)
                throw TypeError('Object expected');
              ((a = o(f.get)) && (d.get = a),
                (a = o(f.set)) && (d.set = a),
                (a = o(f.init)) && i.unshift(a));
            } else (a = o(f)) && ('field' === _ ? i.unshift(a) : (d[l] = a));
          }
          (c && Object.defineProperty(c, r.name, d), (u = !0));
        }
        function i(e, t, n) {
          for (var r = arguments.length > 2, i = 0; i < t.length; i++)
            n = r ? t[i].call(e, n) : t[i].call(e);
          return r ? n : void 0;
        }
        n.d(t, { G4: () => r, zF: () => i });
      },
      480(e, t, n) {
        let r = async () =>
            WebAssembly.validate(
              new Uint8Array([
                0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10,
                7, 1, 5, 0, 208, 112, 26, 11,
              ]),
            ),
          i = async () =>
            WebAssembly.validate(
              new Uint8Array([
                0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0,
                10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
              ]),
            );
        n.d(t, {}, { oR: i, rO: r });
      },
    },
    u = {};
  function h(e) {
    var t = u[e];
    if (void 0 !== t) return t.exports;
    var n = (u[e] = { id: e, exports: {} });
    return (d[e](n, n.exports, h), n.exports);
  }
  ((h.m = d),
    (h.c = u),
    (t = (e = 'function' == typeof Symbol)
      ? Symbol('rspack queues')
      : '__rspack_queues'),
    (n = h.aE = e ? Symbol('rspack exports') : '__webpack_exports__'),
    (r = e ? Symbol('rspack error') : '__rspack_error'),
    (i = e ? Symbol('rspack done') : '__rspack_done'),
    (s = h.zS = e ? Symbol('rspack defer') : '__rspack_defer'),
    (h.zT = (e) => {
      if (
        e.some((e) => {
          var t = u[e];
          return !t || !1 === t[i];
        })
      )
        return { then: (t, n) => Promise.all(e.map(h)).then(t, n) };
    }),
    (o = (e) => {
      e &&
        e.d < 1 &&
        ((e.d = 1),
        e.forEach((e) => e.r--),
        e.forEach((e) => (e.r-- ? e.r++ : e())));
    }),
    (h.a = (e, a, _) => {
      _ && ((l = []).d = -1);
      var l,
        c,
        d,
        u,
        b = new Set(),
        g = e.exports,
        f = new Promise((e, t) => {
          ((u = t), (d = e));
        });
      ((f[n] = g),
        (f[t] = (e) => {
          (l && e(l), b.forEach(e), f.catch(() => {}));
        }),
        (e.exports = f),
        a(
          (e) => {
            c = e.map((e) => {
              if (null !== e && 'object' == typeof e) {
                if (!e[t] && e[s]) {
                  var i = h.zT(e[s]);
                  if (!i) return e;
                  var a = e;
                  e = {
                    then(e, t) {
                      i.then(() => e(a), t);
                    },
                  };
                }
                if (e[t]) return e;
                if (e.then) {
                  var _ = [];
                  ((_.d = 0),
                    e.then(
                      (e) => {
                        ((l[n] = e), o(_));
                      },
                      (e) => {
                        ((l[r] = e), o(_));
                      },
                    ));
                  var l = {};
                  return ((l[s] = !1), (l[t] = (e) => e(_)), l);
                }
              }
              var c = {};
              return ((c[t] = () => {}), (c[n] = e), c);
            });
            var i,
              a = () =>
                c.map((e) => {
                  if (e[s]) return e;
                  if (e[r]) throw e[r];
                  return e[n];
                }),
              _ = new Promise((e) => {
                (i = () => e(a)).r = 0;
                var n = (e) =>
                  e !== l &&
                  !b.has(e) &&
                  (b.add(e), e && !e.d && (i.r++, e.push(i)));
                c.map((e) => e[s] || e[t](n));
              });
            return i.r ? _ : a();
          },
          (e) => (e ? u((f[r] = e)) : d(g), o(l), (f[i] = !0)),
        ),
        l && l.d < 0 && (l.d = 0));
    }),
    (h.n = (e) => {
      var t = e && e.__esModule ? () => e.default : () => e;
      return (h.d(t, { a: t }), t);
    }),
    (h.d = (e, t, n) => {
      var r = (t, n) => {
        for (var r in t)
          h.o(t, r) &&
            !h.o(e, r) &&
            Object.defineProperty(e, r, { enumerable: !0, [n]: t[r] });
      };
      (r(t, 'get'), r(n, 'value'));
    }),
    (h.f = {}),
    (h.e = (e, t) =>
      Promise.all(Object.keys(h.f).reduce((n, r) => (h.f[r](e, n, t), n), []))),
    (h.u = (e) =>
      'static/js/async/' +
      {
        166: 'xmarkdown-deps',
        350: 'web-core-template-loader-thread',
        724: 'web-elements',
        778: 'legacy-wasm-js',
        894: 'web-core-main-chunk',
        97: 'web-core-worker-chunk',
      }[e] +
      '.js'),
    (h.miniCssF = (e) => '' + e + '.css'),
    (h.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (a = {}),
    (h.l = function (e, t, n, r, i) {
      if (a[e]) return void a[e].push(t);
      if (void 0 !== n)
        for (
          var s, o, _ = document.getElementsByTagName('script'), l = 0;
          l < _.length;
          l++
        ) {
          var c = _[l];
          if (
            c.getAttribute('src') == e ||
            c.getAttribute('data-rspack') ==
              '@lynx-js/web-rsbuild-server-middleware:' + n
          ) {
            s = c;
            break;
          }
        }
      (s ||
        ((o = !0),
        ((s = document.createElement('script')).timeout = 120),
        h.nc && s.setAttribute('nonce', h.nc),
        s.setAttribute(
          'data-rspack',
          '@lynx-js/web-rsbuild-server-middleware:' + n,
        ),
        i && s.setAttribute('fetchpriority', i),
        (s.src = e)),
        (a[e] = [t]));
      var d = function (t, n) {
          ((s.onerror = s.onload = null), clearTimeout(u));
          var r = a[e];
          if (
            (delete a[e],
            s.parentNode && s.parentNode.removeChild(s),
            r &&
              r.forEach(function (e) {
                return e(n);
              }),
            t)
          )
            return t(n);
        },
        u = setTimeout(
          d.bind(null, void 0, { type: 'timeout', target: s }),
          12e4,
        );
      ((s.onerror = d.bind(null, s.onerror)),
        (s.onload = d.bind(null, s.onload)),
        o && document.head.appendChild(s));
    }),
    (h.r = (e) => {
      ('u' > typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 }));
    }),
    (h.p = '/'),
    (h.b = document.baseURI || self.location.href),
    (_ = { 410: 0 }),
    (h.f.j = function (e, t, n) {
      var r = h.o(_, e) ? _[e] : void 0;
      if (0 !== r)
        if (r) t.push(r[2]);
        else {
          var i = new Promise((t, n) => (r = _[e] = [t, n]));
          t.push((r[2] = i));
          var s = h.p + h.u(e),
            o = Error();
          h.l(
            s,
            function (t) {
              if (h.o(_, e) && (0 !== (r = _[e]) && (_[e] = void 0), r)) {
                var n = t && ('load' === t.type ? 'missing' : t.type),
                  i = t && t.target && t.target.src;
                ((o.message =
                  'Loading chunk ' + e + ' failed.\n(' + n + ': ' + i + ')'),
                  (o.name = 'ChunkLoadError'),
                  (o.type = n),
                  (o.request = i),
                  r[1](o));
              }
            },
            'chunk-' + e,
            e,
            n,
          );
        }
    }),
    (l = (e, t) => {
      var n,
        r,
        [i, s, o] = t,
        a = 0;
      if (i.some((e) => 0 !== _[e])) {
        for (n in s) h.o(s, n) && (h.m[n] = s[n]);
        o && o(h);
      }
      for (e && e(t); a < i.length; a++)
        ((r = i[a]), h.o(_, r) && _[r] && _[r][0](), (_[r] = 0));
    }),
    (c = globalThis.rspackChunk_lynx_js_web_rsbuild_server_middleware ||=
      []).forEach(l.bind(null, 0)),
    (c.push = l.bind(null, c.push.bind(c))),
    h(1680));
})();
