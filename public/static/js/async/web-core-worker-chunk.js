(() => {
  'use strict';
  var e,
    t,
    r,
    a = {
      5234(e, t, r) {
        var a, n, i, o, s, l;
        class c {
          port;
          name;
          incId = 0;
          #e = [];
          #t = {};
          #r = new TextEncoder();
          #a = new TextDecoder();
          #n = new Map();
          constructor(e, t) {
            ((this.port = e),
              (this.name = t),
              e && (e.onmessage = (e) => this.#i(e.data)));
          }
          setMessagePort(e) {
            if (this.port) throw Error('Rpc port already set');
            for (let t of ((this.port = e), this.#e))
              this.postMessage(t.message, t.detail);
            ((this.#e = []), (e.onmessage = (e) => this.#i(e.data)));
          }
          postMessage(e, t) {
            this.port
              ? this.port.postMessage(e, t)
              : this.#e.push({ message: e, detail: t });
          }
          get nextRetId() {
            return `ret_${this.name}_${this.incId++}`;
          }
          static createRetEndpoint(e) {
            return { name: e, hasReturn: !1, isSync: !1 };
          }
          #i = async (e) => {
            let t = this.#n.get(e.name);
            if (t) {
              let r = e.sync ? new Int32Array(e.lock) : void 0,
                a = !e.sync && e.retId ? c.createRetEndpoint(e.retId) : void 0;
              try {
                let n = await t(...e.data),
                  i,
                  o = [];
                if (
                  (e.sync
                    ? (i = n)
                    : e.hasTransfer
                      ? ({ data: i, transfer: o } = n || {})
                      : (i = n),
                  e.sync)
                ) {
                  if (e.buf) {
                    let t = JSON.stringify(i),
                      r = new Uint32Array(e.buf, 0, 1),
                      a = new Uint8Array(e.buf, 4),
                      n = new Uint8Array(e.buf.byteLength - 4),
                      { written: o } = this.#r.encodeInto(t, n);
                    ((r[0] = o), a.set(n, 0));
                  }
                  (Atomics.store(r, 0, 1), Atomics.notify(r, 0));
                } else e.retId && this.invoke(a, [i, !1], o || []);
              } catch (t) {
                (console.error(t),
                  e.sync
                    ? (Atomics.store(r, 0, 2), Atomics.notify(r, 0), (r[1] = 2))
                    : this.invoke(a, [void 0, !0]));
              }
            } else {
              let t = this.#t[e.name];
              t ? t.push(e) : (this.#t[e.name] = [e]);
            }
          };
          createCall(e) {
            return (...t) => this.invoke(e, t);
          }
          registerHandler(e, t) {
            this.#n.set(e.name, t);
            let r = this.#t[e.name];
            if (r?.length)
              for (let t of ((this.#t[e.name] = void 0), r)) this.#i(t);
          }
          registerHandlerRef(e, t, r) {
            this.registerHandler(e, (...e) => t[r]?.call(t, ...e));
          }
          registerHandlerLazy(e, t, r) {
            if (t[r]) this.registerHandlerRef(e, t, r);
            else {
              let a,
                n = this;
              Object.defineProperty(t, r, {
                get: () => a,
                set(i) {
                  ((a = i), i && n.registerHandlerRef(e, t, r));
                },
              });
            }
          }
          removeHandler(e) {
            this.#n.delete(e.name);
          }
          invoke(e, t, r = []) {
            if (e.isSync) {
              let a = e.bufferSize
                  ? new SharedArrayBuffer(e.bufferSize + 4)
                  : void 0,
                n = new SharedArrayBuffer(4),
                i = new Int32Array(n);
              i[0] = 0;
              let o = { name: e.name, data: t, sync: !0, lock: n, buf: a };
              if (
                (this.postMessage(o, { transfer: r }),
                Atomics.wait(i, 0, 0),
                2 === i[0])
              )
                throw null;
              if (!a) return;
              {
                let e = new Uint32Array(a, 0, 4)[0],
                  t = new Uint8Array(a, 4, e),
                  r = new Uint8Array(e);
                return (
                  r.set(t, 0),
                  r ? JSON.parse(this.#a.decode(r)) : void 0
                );
              }
            }
            if (e.hasReturn) {
              let a, n, i;
              a = new Promise((e, t) => {
                ((n = e), (i = t));
              });
              let o = c.createRetEndpoint(this.nextRetId);
              this.registerHandler(o, (e, t) => {
                (t && i(), n(e));
              });
              let s = {
                name: e.name,
                data: t,
                sync: !1,
                retId: o?.name,
                hasTransfer: e.hasReturnTransfer,
              };
              return (this.postMessage(s, { transfer: r }), a);
            }
            {
              let a = { name: e.name, data: t, sync: !1 };
              this.postMessage(a, { transfer: r });
            }
          }
          createCallbackify(e, t) {
            let r = this.createCall(e);
            return (...e) => {
              let a = e.at(t);
              (e.splice(t, 1), r(...e).then(a));
            };
          }
        }
        function d(e, t, r = !0, a = !1, n) {
          return {
            name: e,
            isSync: t,
            hasReturn: r,
            hasReturnTransfer: a,
            bufferSize: n,
          };
        }
        let p = d('publicComponentEvent', !1, !1),
          u = d('publishEvent', !1, !1),
          m = d('switchExposureServiceEndpoint', !1, !1),
          g = d('updateData', !1, !0),
          h = d('sendGlobalEventEndpoint', !1, !1),
          f = d('dispose', !1, !0),
          y = d('start', !1, !0),
          v = d('reportError', !1, !1),
          x = d('callLepusMethod', !1, !0),
          _ = d('__invokeUIMethod', !1, !0),
          b = d('__setNativeProps', !1, !0),
          E = d('__getPathInfo', !1, !0),
          w = d('nativeModulesCall', !1, !0),
          C = d('napiModulesCall', !1, !0, !0),
          I = d('getCustomSections', !1, !0),
          T = d('markTiming', !1, !1),
          O = d('postTimingFlags', !1, !1),
          S = d('__triggerComponentEvent', !1, !1),
          M = d('__selectComponent', !1, !0),
          N = d('dispatchLynxViewEvent', !1, !1),
          k = d('dispatchNapiModule', !1, !1),
          R = d('dispatchCoreContextOnBackground', !1, !1),
          A = d('dispatchJSContextOnMainThread', !1, !1),
          D = d('dispatchDevtoolEventOnBackground', !1, !1),
          P = d('dispatchDevtoolEventOnMainThread', !1, !1),
          F = d('__triggerElementMethod', !1, !1),
          U = d('updateGlobalProps', !1, !1);
        d('updateI18nResources', !1, !1);
        let H = d('dispatchI18nResource', !1, !1),
          j = d('queryComponent', !1, !0),
          L = d('fetchExternalBundle', !1, !0),
          $ = d('updateBTSChunkEndpoint', !1, !0),
          B = d('reload', !1, !1);
        class q extends EventTarget {
          #o;
          constructor(e) {
            (super(), (this.#o = e));
          }
          postMessage(...e) {
            console.error(
              '[lynx-web] postMessage not implemented, args:',
              ...e,
            );
          }
          dispatchEvent(e) {
            let { rpc: t, sendEventEndpoint: r } = this.#o;
            return (t.invoke(r, [e]), 3);
          }
          __start() {
            let { rpc: e, receiveEventEndpoint: t } = this.#o;
            e.registerHandler(t, ({ type: e, data: t }) => {
              super.dispatchEvent(new MessageEvent(e, { data: t ?? {} }));
            });
          }
        }
        (Object.entries({
          click: 'tap',
          lynxscroll: 'scroll',
          lynxscrollend: 'scrollend',
          overlaytouch: 'touch',
          lynxfocus: 'focus',
          lynxblur: 'blur',
          lynxinput: 'input',
        }).map(([e, t]) => [t, e]),
          ((o = a || (a = {}))[(o.SUCCESS = 0)] = 'SUCCESS'),
          (o[(o.UNKNOWN = 1)] = 'UNKNOWN'),
          (o[(o.NODE_NOT_FOUND = 2)] = 'NODE_NOT_FOUND'),
          (o[(o.METHOD_NOT_FOUND = 3)] = 'METHOD_NOT_FOUND'),
          (o[(o.PARAM_INVALID = 4)] = 'PARAM_INVALID'),
          (o[(o.SELECTOR_NOT_SUPPORTED = 5)] = 'SELECTOR_NOT_SUPPORTED'),
          (o[(o.NO_UI_FOR_NODE = 6)] = 'NO_UI_FOR_NODE'));
        let G = Object.freeze(
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
        );
        async function z(e, t, r) {
          let a = t.createCall(m),
            n = e.createCall(w),
            i = {},
            o = {};
          return (
            await Promise.all(
              Object.entries(r).map(([e, t]) =>
                import(t).then(
                  (t) => (o[e] = t?.default?.(i, (t, r) => n(t, r, e))),
                ),
              ),
            ),
            Object.assign(i, {
              bridge: {
                call(e, t, r) {
                  n(e, t, 'bridge').then(r);
                },
              },
              LynxExposureModule: {
                resumeExposure() {
                  a(!0, !0);
                },
                stopExposure(e) {
                  a(!1, e.sendEvent ?? !0);
                },
              },
              ...o,
            })
          );
        }
        function J() {
          let e = globalThis.performance;
          if (
            e &&
            'function' == typeof e.mark &&
            'function' == typeof e.measure
          )
            return e;
        }
        function Q(e, t) {
          let r = J();
          if (!r) return !1;
          try {
            if (void 0 === t) r.mark(e);
            else
              try {
                r.mark(e, { detail: t });
              } catch {
                r.mark(e);
              }
            return !0;
          } catch {
            return !1;
          }
        }
        (Object.assign(
          Object.create(null),
          Object.fromEntries(Object.entries(G).map(([e, t]) => [t, e])),
        ),
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
          }),
          Symbol.for('lynx-scroll-container-dom'),
          ((s = n || (n = {}))[(s.ID_SELECTOR = 0)] = 'ID_SELECTOR'),
          (s[(s.REF_ID = 1)] = 'REF_ID'),
          (s[(s.UNIQUE_ID = 2)] = 'UNIQUE_ID'),
          ((l = i || (i = {}))[(l.START = 0)] = 'START'),
          (l[(l.PLAY = 1)] = 'PLAY'),
          (l[(l.PAUSE = 2)] = 'PAUSE'),
          (l[(l.CANCEL = 3)] = 'CANCEL'),
          (l[(l.FINISH = 4)] = 'FINISH'));
        let W = 0,
          K = {};
        class V {
          data;
          constructor(e) {
            this.data = e;
          }
          setData(e) {
            this.data = e;
          }
        }
        async function Y(e, t, r, n, i) {
          let o,
            s,
            l,
            c,
            d,
            m,
            f,
            y,
            w,
            C =
              ((o = 0),
              (s = 0),
              (l = 0),
              (c = []),
              {
                generatePipelineOptions: () => ({
                  pipelineID: '_pipeline_' + o++,
                  needTimestamps: !1,
                }),
                onPipelineStart: function () {},
                markPipelineTiming: function (e, r) {
                  t.markTimingInternal(r, e);
                },
                bindPipelineIdWithTimingFlag: function (e, r) {
                  (t.pipelineIdToTimingFlags.has(e) ||
                    t.pipelineIdToTimingFlags.set(e, []),
                    t.pipelineIdToTimingFlags.get(e).push(r));
                },
                profileStart: (e, t) => {
                  let r = l++,
                    a = `lynx.profile:${r}:start:${e}`;
                  Q(a, t) &&
                    c.push({ traceName: e, startMarkName: a, option: t });
                },
                profileEnd: () => {
                  let e = c.pop();
                  if (!e) return;
                  let t = l++,
                    r = `lynx.profile:${t}:end:${e.traceName}`;
                  if (!Q(r, e.option))
                    return void J()?.clearMarks?.(e.startMarkName);
                  !(function (e, t, r, a) {
                    let n = J();
                    if (n)
                      if (void 0 === a)
                        try {
                          n.measure(e, t, r);
                        } catch {}
                      else
                        try {
                          n.measure(e, { start: t, end: r, detail: a });
                        } catch {
                          try {
                            n.measure(e, t, r);
                          } catch {}
                        }
                  })(e.traceName, e.startMarkName, r, e.option);
                  let a = J();
                  (a?.clearMarks?.(e.startMarkName), a?.clearMarks?.(r));
                },
                profileMark: (e, t) => {
                  Q(e, t);
                },
                profileFlowId: () => ++s,
                isProfileRecording: () => void 0 !== J(),
              }),
            I = e.createCallbackify(x, 2),
            T = e.createCall(b),
            O = e.createCall(S),
            N = e.createCallbackify(M, 3),
            k = e.createCall(j),
            R = e.createCall(v),
            {
              templateCache: A,
              loadScript: D,
              loadScriptAsync: P,
              readScript: F,
            } = ((d = new Map()),
            (m = (e, t) => {
              (t && '__Card__' !== t) || (t = n);
              let r = d.get(t)?.[`/${e}`] ?? e,
                a = new XMLHttpRequest();
              if ((a.open('GET', r, !1), a.send(null), 200 === a.status))
                return a.responseText;
              throw Error(`Failed to load ${e}, status: ${a.status}`);
            }),
            (f = async (e, t) => {
              (t && '__Card__' !== t) || (t = n);
              let r = d.get(t)?.[`/${e}`] ?? e;
              return new Promise((t, a) => {
                fetch(r).then((r) => {
                  r.ok
                    ? r.text().then((e) => t(e), a)
                    : a(Error(`Failed to load ${e}, status: ${r.status}`));
                }, a);
              });
            }),
            (y = (e) => {
              let t = Function(
                'postMessage',
                'module',
                'exports',
                'lynxCoreInject',
                ...('react' !== i ? ['Card'] : []),
                'setTimeout',
                'setInterval',
                'clearInterval',
                'clearTimeout',
                'NativeModules',
                ...('react' !== i ? ['Component'] : []),
                'ReactLynx',
                'nativeAppId',
                'Behavior',
                'LynxJSBI',
                'lynx',
                'window',
                'document',
                'frames',
                'location',
                'navigator',
                'localStorage',
                'history',
                'Caches',
                'screen',
                'alert',
                'confirm',
                'prompt',
                'webkit',
                'Reporter',
                'print',
                'global',
                'requestAnimationFrame',
                'cancelAnimationFrame',
                e,
              );
              return {
                init(e) {
                  let r = { exports: {} },
                    a = e.tt,
                    n = [
                      void 0,
                      r,
                      r.exports,
                      e,
                      ...('react' !== i ? [a.Card.bind(a)] : []),
                      a.setTimeout,
                      a.setInterval,
                      a.clearInterval,
                      a.clearTimeout,
                      a.NativeModules,
                      ...('react' !== i ? [a.Component.bind(a)] : []),
                      a.ReactLynx,
                      a.nativeAppId,
                      a.Behavior,
                      a.LynxJSBI,
                      a.lynx,
                      a.window,
                      a.document,
                      a.frames,
                      a.location,
                      a.navigator,
                      a.localStorage,
                      a.history,
                      a.Caches,
                      a.screen,
                      a.alert,
                      a.confirm,
                      a.prompt,
                      a.webkit,
                      a.Reporter,
                      a.print,
                      a.global,
                      a.requestAnimationFrame,
                      a.cancelAnimationFrame,
                    ];
                  return (t.apply(void 0, n), r.exports);
                },
              };
            }),
            {
              readScript: m,
              loadScript: (e, t) => y(m(e, t)),
              loadScriptAsync: async (e, t, r) => {
                f(e, r).then((e) => {
                  t(null, y(e));
                });
              },
              templateCache: d,
            });
          e.registerHandler($, (e, t) => {
            A.set(e, t);
          });
          let L = new V(),
            B = '',
            q = {
              id: (W++).toString(),
              ...C,
              setTimeout: setTimeout,
              setInterval: setInterval,
              clearTimeout: clearTimeout,
              clearInterval: clearInterval,
              nativeModuleProxy: await z(e, e, r),
              readScript: F,
              loadScriptAsync: P,
              loadScript: D,
              requestAnimationFrame: (e) => requestAnimationFrame(e),
              cancelAnimationFrame: (e) => cancelAnimationFrame(e),
              callLepusMethod: I,
              setNativeProps: T,
              getPathInfo: (t, r, n, i, o, s) => {
                e.invoke(E, [t, r, n, i, s])
                  .then(o)
                  .catch((e) => {
                    (console.error('[lynx-web] getPathInfo failed', e),
                      o({ code: a.UNKNOWN, data: e.message || '' }));
                  });
              },
              invokeUIMethod: (t, r, n, i, o, s, l) => {
                e.invoke(_, [t, r, n, i, o, l])
                  .then(s)
                  .catch((e) => {
                    (console.error('[lynx-web] invokeUIMethod failed', e),
                      s({ code: a.UNKNOWN, data: '' }));
                  });
              },
              tt: null,
              setCard(r) {
                (e.registerHandlerLazy(p, r, 'publicComponentEvent'),
                  e.registerHandlerLazy(u, r, 'publishEvent'),
                  e.registerHandlerLazy(g, r, 'updateCardData'),
                  e.registerHandler(h, (...e) => {
                    r.GlobalEventEmitter.emit(...e);
                  }),
                  e.registerHandlerLazy(U, r, 'updateGlobalProps'),
                  e.registerHandler(H, (e) => {
                    (L.setData(e),
                      r.GlobalEventEmitter.emit('onI18nResourceReady', []));
                  }),
                  t.registerGlobalEmitter(r.GlobalEventEmitter),
                  r.lynx.getCoreContext().__start(),
                  r.lynx.getDevtool().__start(),
                  (q.tt = r));
              },
              triggerComponentEvent: O,
              selectComponent: N,
              createJSObjectDestructionObserver:
                ((w = new FinalizationRegistry((e) => e())),
                (e) => {
                  let t = {};
                  return (w.register(t, e), t);
                }),
              setSharedData(e, t) {
                K[e] = t;
              },
              getSharedData: (e) => K[e],
              i18nResource: L,
              reportException: (e, t) => R(e, t, B),
              __SetSourceMapRelease: (e) => (B = e.message),
              __GetSourceMapRelease: (e) => B,
              queryComponent: (e, t) => {
                k(e).then((e) => {
                  t?.(e);
                });
              },
            };
          return q;
        }
        let X = async (e, t) => {
          let r = e.createCall(C),
            a = {},
            n = new Set();
          return (
            e.registerHandler(k, (e) => {
              n.forEach((t) => t(e));
            }),
            await Promise.all(
              Object.entries(t).map(([e, t]) =>
                import(t).then(
                  (t) =>
                    (a[e] = t?.default?.(
                      a,
                      (t, a) => r(t, a, e),
                      (e) => {
                        n.add(e);
                      },
                    )),
                ),
              ),
            ),
            { load: (e) => a[e] }
          );
        };
        ((globalThis.nativeConsole = console),
          (globalThis.onmessage = async (e) => {
            let t = e.data;
            (globalThis.SystemInfo || (globalThis.SystemInfo = t.systemInfo),
              (function (e) {
                let {
                    mainThreadMessagePort: t,
                    napiModulesMap: a,
                    nativeModulesMap: n,
                    initData: i,
                    globalProps: o,
                    customSections: s,
                    cardType: l,
                    entryTemplateUrl: d,
                  } = e,
                  p = new c(t, 'bg-to-main'),
                  u = (function (e, t) {
                    let r = !0,
                      a = {},
                      n = new Map(),
                      i = new Map(),
                      o = t.createCall(N),
                      s = [];
                    function l(e) {
                      for (let {
                        timingKey: t,
                        pipelineId: r,
                        timeStamp: i,
                      } of e) {
                        if (
                          (i ||
                            (i = performance.now() + performance.timeOrigin),
                          !r)
                        ) {
                          a[t] = i;
                          continue;
                        }
                        (n.has(r) || n.set(r, {}), (n.get(r)[t] = i));
                      }
                    }
                    return (
                      e.registerHandler(T, l),
                      t.registerHandler(T, l),
                      {
                        markTimingInternal: (e, t, r) =>
                          l([{ timingKey: e, pipelineId: t, timeStamp: r }]),
                        registerGlobalEmitter: (t) => {
                          e.registerHandler(O, (e, l) => {
                            if ((l ? (e = e.concat(s)) : (s = s.concat(e)), r))
                              (t.emit('lynx.performance.timing.onSetup', [
                                {
                                  extra_timing: {},
                                  setup_timing: a,
                                  update_timings: {},
                                  metrics: {},
                                  has_reload: !1,
                                  thread_strategy: 0,
                                  url: '',
                                },
                              ]),
                                o('timing', a));
                            else {
                              let r = (l ? n.get(l) : void 0) ?? {},
                                a = {
                                  extra_timing: {},
                                  setup_timing: {},
                                  update_timings: Object.fromEntries(
                                    [...e, ...(i.get(l) ?? [])].map((e) => [
                                      e,
                                      r,
                                    ]),
                                  ),
                                  metrics: {},
                                  has_reload: !1,
                                  thread_strategy: 0,
                                  url: '',
                                };
                              (t.emit('lynx.performance.timing.onUpdate', [a]),
                                o('timing', r));
                            }
                            (l && (i.delete(l), n.delete(l)), r && (r = !1));
                          });
                        },
                        pipelineIdToTimingFlags: i,
                      }
                    );
                  })(p, p);
                u.markTimingInternal('load_core_start');
                let m = Y(p, u, n, d, l);
                Promise.all([r.e(177).then(r.bind(r, 5857)), m, X(p, a)]).then(
                  ([e, t, r]) => {
                    let a, n, c, d;
                    (u.markTimingInternal('load_core_end'),
                      (globalThis['napiLoaderOnRT' + t.id] = r));
                    let m =
                        ((a = new q({
                          rpc: p,
                          receiveEventEndpoint: R,
                          sendEventEndpoint: A,
                        })),
                        (n = new q({
                          rpc: p,
                          receiveEventEndpoint: D,
                          sendEventEndpoint: P,
                        })),
                        (c = p.createCall(L)),
                        {
                          __globalProps: o,
                          getJSModule(e) {},
                          getNativeApp: () => t,
                          getCoreContext: () => a,
                          getDevtool: () => n,
                          getCustomSectionSync: (e) => s[e],
                          getCustomSection:
                            ((d = p.createCall(I)),
                            (e, t) => {
                              if (s[e]) return t(s[e]);
                              d(e).then(t);
                            }),
                          queueMicrotask: (e) => {
                            queueMicrotask(e);
                          },
                          createElement: (e, t) => {
                            let r;
                            return (
                              (r = p.createCall(F)),
                              {
                                animate(e, a, n, i) {
                                  r('animate', t, {
                                    operation: e,
                                    id: a,
                                    keyframes: n,
                                    timingOptions: i,
                                  });
                                },
                              }
                            );
                          },
                          getI18nResource: () => t.i18nResource.data,
                          QueryComponent: (e, r) => t.queryComponent(e, r),
                          reload: () => {
                            p.invoke(B, []);
                          },
                          fetchBundle: (e) => c(e),
                          loadScript: (e, r) => t.loadScript(e, r.bundleName),
                        }),
                      {
                        loadCard: g,
                        destroyCard: h,
                        callDestroyLifetimeFun: v,
                        nativeGlobal: x,
                        loadDynamicComponent: _,
                      } = e;
                    (x && _ && (x.loadDynamicComponent = _),
                      p.registerHandler(y, () => {
                        g(t, { initData: i, cardType: l, updateData: i }, m);
                      }),
                      p.registerHandler(f, () => {
                        let e = t.id;
                        try {
                          v(e);
                        } catch (e) {
                          var r;
                          ((r = e) instanceof TypeError &&
                            r.message.includes('callDestroyLifetimeFun')) ||
                            console.error(
                              '[lynx-web] error while calling the card destroy lifetime hook',
                              e,
                            );
                        }
                        h(e);
                      }));
                  },
                );
              })(t));
          }),
          Object.assign(globalThis, { module: { exports: null } }));
      },
    },
    n = {};
  function i(e) {
    var t = n[e];
    if (void 0 !== t) return t.exports;
    var r = (n[e] = { exports: {} });
    return (a[e](r, r.exports, i), r.exports);
  }
  ((i.m = a),
    (i.d = (e, t, r) => {
      var a = (t, r) => {
        for (var a in t)
          i.o(t, a) &&
            !i.o(e, a) &&
            Object.defineProperty(e, a, { enumerable: !0, [r]: t[a] });
      };
      (a(t, 'get'), a(r, 'value'));
    }),
    (i.f = {}),
    (i.e = (e) =>
      Promise.all(Object.keys(i.f).reduce((t, r) => (i.f[r](e, t), t), []))),
    (i.u = (e) => 'static/js/async/lynx-core-chunk.js'),
    (i.miniCssF = (e) => '' + e + '.css'),
    (i.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (i.r = (e) => {
      ('u' > typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 }));
    }),
    (i.p = '/'),
    (e = { 97: 1 }),
    (r = (t = globalThis.rspackChunk_lynx_js_web_rsbuild_server_middleware ||=
      []).push.bind(t)),
    (t.push = (t) => {
      var [a, n, o] = t;
      for (var s in n) i.o(n, s) && (i.m[s] = n[s]);
      for (o && o(i); a.length;) e[a.pop()] = 1;
      r(t);
    }),
    (i.f.i = (t, r) => {
      e[t] || importScripts(i.p + i.u(t));
    }),
    i(5234));
})();
