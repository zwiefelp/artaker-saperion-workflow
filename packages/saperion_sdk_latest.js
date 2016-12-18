! function(e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        var t;
        t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.saperionSdk = e()
    }
}(function() {
    var e;
    return function t(e, r, n) {
        function i(s, a) {
            if (!r[s]) {
                if (!e[s]) {
                    var c = "function" == typeof require && require;
                    if (!a && c) return c(s, !0);
                    if (o) return o(s, !0);
                    var u = new Error("Cannot find module '" + s + "'");
                    throw u.code = "MODULE_NOT_FOUND", u
                }
                var f = r[s] = {
                    exports: {}
                };
                e[s][0].call(f.exports, function(t) {
                    var r = e[s][1][t];
                    return i(r ? r : t)
                }, f, f.exports, t, e, r, n)
            }
            return r[s].exports
        }
        for (var o = "function" == typeof require && require, s = 0; s < n.length; s++) i(n[s]);
        return i
    }({
        1: [function(e, t, r) {
            "use strict";

            function n(e) {
                var t = e.length;
                if (t % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
                return "=" === e[t - 2] ? 2 : "=" === e[t - 1] ? 1 : 0
            }

            function i(e) {
                return 3 * e.length / 4 - n(e)
            }

            function o(e) {
                var t, r, i, o, s, a, c = e.length;
                s = n(e), a = new h(3 * c / 4 - s), i = s > 0 ? c - 4 : c;
                var u = 0;
                for (t = 0, r = 0; t < i; t += 4, r += 3) o = f[e.charCodeAt(t)] << 18 | f[e.charCodeAt(t + 1)] << 12 | f[e.charCodeAt(t + 2)] << 6 | f[e.charCodeAt(t + 3)], a[u++] = o >> 16 & 255, a[u++] = o >> 8 & 255, a[u++] = 255 & o;
                return 2 === s ? (o = f[e.charCodeAt(t)] << 2 | f[e.charCodeAt(t + 1)] >> 4, a[u++] = 255 & o) : 1 === s && (o = f[e.charCodeAt(t)] << 10 | f[e.charCodeAt(t + 1)] << 4 | f[e.charCodeAt(t + 2)] >> 2, a[u++] = o >> 8 & 255, a[u++] = 255 & o), a
            }

            function s(e) {
                return u[e >> 18 & 63] + u[e >> 12 & 63] + u[e >> 6 & 63] + u[63 & e]
            }

            function a(e, t, r) {
                for (var n, i = [], o = t; o < r; o += 3) n = (e[o] << 16) + (e[o + 1] << 8) + e[o + 2], i.push(s(n));
                return i.join("")
            }

            function c(e) {
                for (var t, r = e.length, n = r % 3, i = "", o = [], s = 16383, c = 0, f = r - n; c < f; c += s) o.push(a(e, c, c + s > f ? f : c + s));
                return 1 === n ? (t = e[r - 1], i += u[t >> 2], i += u[t << 4 & 63], i += "==") : 2 === n && (t = (e[r - 2] << 8) + e[r - 1], i += u[t >> 10], i += u[t >> 4 & 63], i += u[t << 2 & 63], i += "="), o.push(i), o.join("")
            }
            r.byteLength = i, r.toByteArray = o, r.fromByteArray = c;
            for (var u = [], f = [], h = "undefined" != typeof Uint8Array ? Uint8Array : Array, l = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", d = 0, p = l.length; d < p; ++d) u[d] = l[d], f[l.charCodeAt(d)] = d;
            f["-".charCodeAt(0)] = 62, f["_".charCodeAt(0)] = 63
        }, {}],
        2: [function(e, t, r) {}, {}],
        3: [function(e, t, r) {
            "use strict";

            function n() {
                this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, this.path = null, this.href = null
            }

            function i(e, t, r) {
                if (e && u.isObject(e) && e instanceof n) return e;
                var i = new n;
                return i.parse(e, t, r), i
            }

            function o(e) {
                return u.isString(e) && (e = i(e)), e instanceof n ? e.format() : n.prototype.format.call(e)
            }

            function s(e, t) {
                return i(e, !1, !0).resolve(t)
            }

            function a(e, t) {
                return e ? i(e, !1, !0).resolveObject(t) : t
            }
            var c = e("punycode"),
                u = e("./util");
            r.parse = i, r.resolve = s, r.resolveObject = a, r.format = o, r.Url = n;
            var f = /^([a-z0-9.+-]+:)/i,
                h = /:[0-9]*$/,
                l = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
                d = ["<", ">", '"', "`", " ", "\r", "\n", "\t"],
                p = ["{", "}", "|", "\\", "^", "`"].concat(d),
                v = ["'"].concat(p),
                g = ["%", "/", "?", ";", "#"].concat(v),
                m = ["/", "?", "#"],
                y = 255,
                w = /^[+a-z0-9A-Z_-]{0,63}$/,
                b = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
                E = {
                    javascript: !0,
                    "javascript:": !0
                },
                _ = {
                    javascript: !0,
                    "javascript:": !0
                },
                k = {
                    http: !0,
                    https: !0,
                    ftp: !0,
                    gopher: !0,
                    file: !0,
                    "http:": !0,
                    "https:": !0,
                    "ftp:": !0,
                    "gopher:": !0,
                    "file:": !0
                },
                T = e("querystring");
            n.prototype.parse = function(e, t, r) {
                if (!u.isString(e)) throw new TypeError("Parameter 'url' must be a string, not " + typeof e);
                var n = e.indexOf("?"),
                    i = n !== -1 && n < e.indexOf("#") ? "?" : "#",
                    o = e.split(i),
                    s = /\\/g;
                o[0] = o[0].replace(s, "/"), e = o.join(i);
                var a = e;
                if (a = a.trim(), !r && 1 === e.split("#").length) {
                    var h = l.exec(a);
                    if (h) return this.path = a, this.href = a, this.pathname = h[1], h[2] ? (this.search = h[2], t ? this.query = T.parse(this.search.substr(1)) : this.query = this.search.substr(1)) : t && (this.search = "", this.query = {}), this
                }
                var d = f.exec(a);
                if (d) {
                    d = d[0];
                    var p = d.toLowerCase();
                    this.protocol = p, a = a.substr(d.length)
                }
                if (r || d || a.match(/^\/\/[^@\/]+@[^@\/]+/)) {
                    var O = "//" === a.substr(0, 2);
                    !O || d && _[d] || (a = a.substr(2), this.slashes = !0)
                }
                if (!_[d] && (O || d && !k[d])) {
                    for (var j = -1, P = 0; P < m.length; P++) {
                        var A = a.indexOf(m[P]);
                        A !== -1 && (j === -1 || A < j) && (j = A)
                    }
                    var R, x;
                    x = j === -1 ? a.lastIndexOf("@") : a.lastIndexOf("@", j), x !== -1 && (R = a.slice(0, x), a = a.slice(x + 1), this.auth = decodeURIComponent(R)), j = -1;
                    for (var P = 0; P < g.length; P++) {
                        var A = a.indexOf(g[P]);
                        A !== -1 && (j === -1 || A < j) && (j = A)
                    }
                    j === -1 && (j = a.length), this.host = a.slice(0, j), a = a.slice(j), this.parseHost(), this.hostname = this.hostname || "";
                    var S = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
                    if (!S)
                        for (var C = this.hostname.split(/\./), P = 0, U = C.length; P < U; P++) {
                            var I = C[P];
                            if (I && !I.match(w)) {
                                for (var M = "", L = 0, B = I.length; L < B; L++) M += I.charCodeAt(L) > 127 ? "x" : I[L];
                                if (!M.match(w)) {
                                    var N = C.slice(0, P),
                                        D = C.slice(P + 1),
                                        q = I.match(b);
                                    q && (N.push(q[1]), D.unshift(q[2])), D.length && (a = "/" + D.join(".") + a), this.hostname = N.join(".");
                                    break
                                }
                            }
                        }
                    this.hostname.length > y ? this.hostname = "" : this.hostname = this.hostname.toLowerCase(), S || (this.hostname = c.toASCII(this.hostname));
                    var H = this.port ? ":" + this.port : "",
                        F = this.hostname || "";
                    this.host = F + H, this.href += this.host, S && (this.hostname = this.hostname.substr(1, this.hostname.length - 2), "/" !== a[0] && (a = "/" + a))
                }
                if (!E[p])
                    for (var P = 0, U = v.length; P < U; P++) {
                        var z = v[P];
                        if (a.indexOf(z) !== -1) {
                            var Y = encodeURIComponent(z);
                            Y === z && (Y = escape(z)), a = a.split(z).join(Y)
                        }
                    }
                var W = a.indexOf("#");
                W !== -1 && (this.hash = a.substr(W), a = a.slice(0, W));
                var J = a.indexOf("?");
                if (J !== -1 ? (this.search = a.substr(J), this.query = a.substr(J + 1), t && (this.query = T.parse(this.query)), a = a.slice(0, J)) : t && (this.search = "", this.query = {}), a && (this.pathname = a), k[p] && this.hostname && !this.pathname && (this.pathname = "/"), this.pathname || this.search) {
                    var H = this.pathname || "",
                        K = this.search || "";
                    this.path = H + K
                }
                return this.href = this.format(), this
            }, n.prototype.format = function() {
                var e = this.auth || "";
                e && (e = encodeURIComponent(e), e = e.replace(/%3A/i, ":"), e += "@");
                var t = this.protocol || "",
                    r = this.pathname || "",
                    n = this.hash || "",
                    i = !1,
                    o = "";
                this.host ? i = e + this.host : this.hostname && (i = e + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]"), this.port && (i += ":" + this.port)), this.query && u.isObject(this.query) && Object.keys(this.query).length && (o = T.stringify(this.query));
                var s = this.search || o && "?" + o || "";
                return t && ":" !== t.substr(-1) && (t += ":"), this.slashes || (!t || k[t]) && i !== !1 ? (i = "//" + (i || ""), r && "/" !== r.charAt(0) && (r = "/" + r)) : i || (i = ""), n && "#" !== n.charAt(0) && (n = "#" + n), s && "?" !== s.charAt(0) && (s = "?" + s), r = r.replace(/[?#]/g, function(e) {
                    return encodeURIComponent(e)
                }), s = s.replace("#", "%23"), t + i + r + s + n
            }, n.prototype.resolve = function(e) {
                return this.resolveObject(i(e, !1, !0)).format()
            }, n.prototype.resolveObject = function(e) {
                if (u.isString(e)) {
                    var t = new n;
                    t.parse(e, !1, !0), e = t
                }
                for (var r = new n, i = Object.keys(this), o = 0; o < i.length; o++) {
                    var s = i[o];
                    r[s] = this[s]
                }
                if (r.hash = e.hash, "" === e.href) return r.href = r.format(), r;
                if (e.slashes && !e.protocol) {
                    for (var a = Object.keys(e), c = 0; c < a.length; c++) {
                        var f = a[c];
                        "protocol" !== f && (r[f] = e[f])
                    }
                    return k[r.protocol] && r.hostname && !r.pathname && (r.path = r.pathname = "/"), r.href = r.format(), r
                }
                if (e.protocol && e.protocol !== r.protocol) {
                    if (!k[e.protocol]) {
                        for (var h = Object.keys(e), l = 0; l < h.length; l++) {
                            var d = h[l];
                            r[d] = e[d]
                        }
                        return r.href = r.format(), r
                    }
                    if (r.protocol = e.protocol, e.host || _[e.protocol]) r.pathname = e.pathname;
                    else {
                        for (var p = (e.pathname || "").split("/"); p.length && !(e.host = p.shift()););
                        e.host || (e.host = ""), e.hostname || (e.hostname = ""), "" !== p[0] && p.unshift(""), p.length < 2 && p.unshift(""), r.pathname = p.join("/")
                    }
                    if (r.search = e.search, r.query = e.query, r.host = e.host || "", r.auth = e.auth, r.hostname = e.hostname || e.host, r.port = e.port, r.pathname || r.search) {
                        var v = r.pathname || "",
                            g = r.search || "";
                        r.path = v + g
                    }
                    return r.slashes = r.slashes || e.slashes, r.href = r.format(), r
                }
                var m = r.pathname && "/" === r.pathname.charAt(0),
                    y = e.host || e.pathname && "/" === e.pathname.charAt(0),
                    w = y || m || r.host && e.pathname,
                    b = w,
                    E = r.pathname && r.pathname.split("/") || [],
                    p = e.pathname && e.pathname.split("/") || [],
                    T = r.protocol && !k[r.protocol];
                if (T && (r.hostname = "", r.port = null, r.host && ("" === E[0] ? E[0] = r.host : E.unshift(r.host)), r.host = "", e.protocol && (e.hostname = null, e.port = null, e.host && ("" === p[0] ? p[0] = e.host : p.unshift(e.host)), e.host = null), w = w && ("" === p[0] || "" === E[0])), y) r.host = e.host || "" === e.host ? e.host : r.host, r.hostname = e.hostname || "" === e.hostname ? e.hostname : r.hostname, r.search = e.search, r.query = e.query, E = p;
                else if (p.length) E || (E = []), E.pop(), E = E.concat(p), r.search = e.search, r.query = e.query;
                else if (!u.isNullOrUndefined(e.search)) {
                    if (T) {
                        r.hostname = r.host = E.shift();
                        var O = !!(r.host && r.host.indexOf("@") > 0) && r.host.split("@");
                        O && (r.auth = O.shift(), r.host = r.hostname = O.shift())
                    }
                    return r.search = e.search, r.query = e.query, u.isNull(r.pathname) && u.isNull(r.search) || (r.path = (r.pathname ? r.pathname : "") + (r.search ? r.search : "")), r.href = r.format(), r
                }
                if (!E.length) return r.pathname = null, r.search ? r.path = "/" + r.search : r.path = null, r.href = r.format(), r;
                for (var j = E.slice(-1)[0], P = (r.host || e.host || E.length > 1) && ("." === j || ".." === j) || "" === j, A = 0, R = E.length; R >= 0; R--) j = E[R], "." === j ? E.splice(R, 1) : ".." === j ? (E.splice(R, 1), A++) : A && (E.splice(R, 1), A--);
                if (!w && !b)
                    for (; A--; A) E.unshift("..");
                !w || "" === E[0] || E[0] && "/" === E[0].charAt(0) || E.unshift(""), P && "/" !== E.join("/").substr(-1) && E.push("");
                var x = "" === E[0] || E[0] && "/" === E[0].charAt(0);
                if (T) {
                    r.hostname = r.host = x ? "" : E.length ? E.shift() : "";
                    var O = !!(r.host && r.host.indexOf("@") > 0) && r.host.split("@");
                    O && (r.auth = O.shift(), r.host = r.hostname = O.shift())
                }
                return w = w || r.host && E.length, w && !x && E.unshift(""), E.length ? r.pathname = E.join("/") : (r.pathname = null, r.path = null), u.isNull(r.pathname) && u.isNull(r.search) || (r.path = (r.pathname ? r.pathname : "") + (r.search ? r.search : "")), r.auth = e.auth || r.auth, r.slashes = r.slashes || e.slashes, r.href = r.format(), r
            }, n.prototype.parseHost = function() {
                var e = this.host,
                    t = h.exec(e);
                t && (t = t[0], ":" !== t && (this.port = t.substr(1)), e = e.substr(0, e.length - t.length)), e && (this.hostname = e)
            }
        }, {
            "./util": 4,
            punycode: 18,
            querystring: 21
        }],
        4: [function(e, t, r) {
            "use strict";
            t.exports = {
                isString: function(e) {
                    return "string" == typeof e
                },
                isObject: function(e) {
                    return "object" == typeof e && null !== e
                },
                isNull: function(e) {
                    return null === e
                },
                isNullOrUndefined: function(e) {
                    return null == e
                }
            }
        }, {}],
        5: [function(e, t, r) {
            (function(t) {
                "use strict";
                var n = e("buffer"),
                    i = n.Buffer,
                    o = n.SlowBuffer,
                    s = n.kMaxLength || 2147483647;
                r.alloc = function(e, t, r) {
                    if ("function" == typeof i.alloc) return i.alloc(e, t, r);
                    if ("number" == typeof r) throw new TypeError("encoding must not be number");
                    if ("number" != typeof e) throw new TypeError("size must be a number");
                    if (e > s) throw new RangeError("size is too large");
                    var n = r,
                        o = t;
                    void 0 === o && (n = void 0, o = 0);
                    var a = new i(e);
                    if ("string" == typeof o)
                        for (var c = new i(o, n), u = c.length, f = -1; ++f < e;) a[f] = c[f % u];
                    else a.fill(o);
                    return a
                }, r.allocUnsafe = function(e) {
                    if ("function" == typeof i.allocUnsafe) return i.allocUnsafe(e);
                    if ("number" != typeof e) throw new TypeError("size must be a number");
                    if (e > s) throw new RangeError("size is too large");
                    return new i(e)
                }, r.from = function(e, r, n) {
                    if ("function" == typeof i.from && (!t.Uint8Array || Uint8Array.from !== i.from)) return i.from(e, r, n);
                    if ("number" == typeof e) throw new TypeError('"value" argument must not be a number');
                    if ("string" == typeof e) return new i(e, r);
                    if ("undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer) {
                        var o = r;
                        if (1 === arguments.length) return new i(e);
                        "undefined" == typeof o && (o = 0);
                        var s = n;
                        if ("undefined" == typeof s && (s = e.byteLength - o), o >= e.byteLength) throw new RangeError("'offset' is out of bounds");
                        if (s > e.byteLength - o) throw new RangeError("'length' is out of bounds");
                        return new i(e.slice(o, o + s))
                    }
                    if (i.isBuffer(e)) {
                        var a = new i(e.length);
                        return e.copy(a, 0, 0, e.length), a
                    }
                    if (e) {
                        if (Array.isArray(e) || "undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length" in e) return new i(e);
                        if ("Buffer" === e.type && Array.isArray(e.data)) return new i(e.data)
                    }
                    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
                }, r.allocUnsafeSlow = function(e) {
                    if ("function" == typeof i.allocUnsafeSlow) return i.allocUnsafeSlow(e);
                    if ("number" != typeof e) throw new TypeError("size must be a number");
                    if (e >= s) throw new RangeError("size is too large");
                    return new o(e)
                }
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            buffer: 6
        }],
        6: [function(e, t, r) {
            (function(t) {
                "use strict";

                function n() {
                    try {
                        var e = new Uint8Array(1);
                        return e.__proto__ = {
                            __proto__: Uint8Array.prototype,
                            foo: function() {
                                return 42
                            }
                        }, 42 === e.foo() && "function" == typeof e.subarray && 0 === e.subarray(1, 1).byteLength
                    } catch (t) {
                        return !1
                    }
                }

                function i() {
                    return s.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823
                }

                function o(e, t) {
                    if (i() < t) throw new RangeError("Invalid typed array length");
                    return s.TYPED_ARRAY_SUPPORT ? (e = new Uint8Array(t), e.__proto__ = s.prototype) : (null === e && (e = new s(t)), e.length = t), e
                }

                function s(e, t, r) {
                    if (!(s.TYPED_ARRAY_SUPPORT || this instanceof s)) return new s(e, t, r);
                    if ("number" == typeof e) {
                        if ("string" == typeof t) throw new Error("If encoding is specified then the first argument must be a string");
                        return f(this, e)
                    }
                    return a(this, e, t, r)
                }

                function a(e, t, r, n) {
                    if ("number" == typeof t) throw new TypeError('"value" argument must not be a number');
                    return "undefined" != typeof ArrayBuffer && t instanceof ArrayBuffer ? d(e, t, r, n) : "string" == typeof t ? h(e, t, r) : p(e, t)
                }

                function c(e) {
                    if ("number" != typeof e) throw new TypeError('"size" argument must be a number');
                    if (e < 0) throw new RangeError('"size" argument must not be negative')
                }

                function u(e, t, r, n) {
                    return c(t), t <= 0 ? o(e, t) : void 0 !== r ? "string" == typeof n ? o(e, t).fill(r, n) : o(e, t).fill(r) : o(e, t)
                }

                function f(e, t) {
                    if (c(t), e = o(e, t < 0 ? 0 : 0 | v(t)), !s.TYPED_ARRAY_SUPPORT)
                        for (var r = 0; r < t; ++r) e[r] = 0;
                    return e
                }

                function h(e, t, r) {
                    if ("string" == typeof r && "" !== r || (r = "utf8"), !s.isEncoding(r)) throw new TypeError('"encoding" must be a valid string encoding');
                    var n = 0 | m(t, r);
                    e = o(e, n);
                    var i = e.write(t, r);
                    return i !== n && (e = e.slice(0, i)), e
                }

                function l(e, t) {
                    var r = t.length < 0 ? 0 : 0 | v(t.length);
                    e = o(e, r);
                    for (var n = 0; n < r; n += 1) e[n] = 255 & t[n];
                    return e
                }

                function d(e, t, r, n) {
                    if (t.byteLength, r < 0 || t.byteLength < r) throw new RangeError("'offset' is out of bounds");
                    if (t.byteLength < r + (n || 0)) throw new RangeError("'length' is out of bounds");
                    return t = void 0 === r && void 0 === n ? new Uint8Array(t) : void 0 === n ? new Uint8Array(t, r) : new Uint8Array(t, r, n), s.TYPED_ARRAY_SUPPORT ? (e = t, e.__proto__ = s.prototype) : e = l(e, t), e
                }

                function p(e, t) {
                    if (s.isBuffer(t)) {
                        var r = 0 | v(t.length);
                        return e = o(e, r), 0 === e.length ? e : (t.copy(e, 0, 0, r), e)
                    }
                    if (t) {
                        if ("undefined" != typeof ArrayBuffer && t.buffer instanceof ArrayBuffer || "length" in t) return "number" != typeof t.length || X(t.length) ? o(e, 0) : l(e, t);
                        if ("Buffer" === t.type && Q(t.data)) return l(e, t.data)
                    }
                    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
                }

                function v(e) {
                    if (e >= i()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + i().toString(16) + " bytes");
                    return 0 | e
                }

                function g(e) {
                    return +e != e && (e = 0), s.alloc(+e)
                }

                function m(e, t) {
                    if (s.isBuffer(e)) return e.length;
                    if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(e) || e instanceof ArrayBuffer)) return e.byteLength;
                    "string" != typeof e && (e = "" + e);
                    var r = e.length;
                    if (0 === r) return 0;
                    for (var n = !1;;) switch (t) {
                        case "ascii":
                        case "latin1":
                        case "binary":
                            return r;
                        case "utf8":
                        case "utf-8":
                        case void 0:
                            return W(e).length;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return 2 * r;
                        case "hex":
                            return r >>> 1;
                        case "base64":
                            return G(e).length;
                        default:
                            if (n) return W(e).length;
                            t = ("" + t).toLowerCase(), n = !0
                    }
                }

                function y(e, t, r) {
                    var n = !1;
                    if ((void 0 === t || t < 0) && (t = 0), t > this.length) return "";
                    if ((void 0 === r || r > this.length) && (r = this.length), r <= 0) return "";
                    if (r >>>= 0, t >>>= 0, r <= t) return "";
                    for (e || (e = "utf8");;) switch (e) {
                        case "hex":
                            return U(this, t, r);
                        case "utf8":
                        case "utf-8":
                            return R(this, t, r);
                        case "ascii":
                            return S(this, t, r);
                        case "latin1":
                        case "binary":
                            return C(this, t, r);
                        case "base64":
                            return A(this, t, r);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return I(this, t, r);
                        default:
                            if (n) throw new TypeError("Unknown encoding: " + e);
                            e = (e + "").toLowerCase(), n = !0
                    }
                }

                function w(e, t, r) {
                    var n = e[t];
                    e[t] = e[r], e[r] = n
                }

                function b(e, t, r, n, i) {
                    if (0 === e.length) return -1;
                    if ("string" == typeof r ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), r = +r, isNaN(r) && (r = i ? 0 : e.length - 1), r < 0 && (r = e.length + r), r >= e.length) {
                        if (i) return -1;
                        r = e.length - 1
                    } else if (r < 0) {
                        if (!i) return -1;
                        r = 0
                    }
                    if ("string" == typeof t && (t = s.from(t, n)), s.isBuffer(t)) return 0 === t.length ? -1 : E(e, t, r, n, i);
                    if ("number" == typeof t) return t = 255 & t, s.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? i ? Uint8Array.prototype.indexOf.call(e, t, r) : Uint8Array.prototype.lastIndexOf.call(e, t, r) : E(e, [t], r, n, i);
                    throw new TypeError("val must be string, number or Buffer")
                }

                function E(e, t, r, n, i) {
                    function o(e, t) {
                        return 1 === s ? e[t] : e.readUInt16BE(t * s)
                    }
                    var s = 1,
                        a = e.length,
                        c = t.length;
                    if (void 0 !== n && (n = String(n).toLowerCase(), "ucs2" === n || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                        if (e.length < 2 || t.length < 2) return -1;
                        s = 2, a /= 2, c /= 2, r /= 2
                    }
                    var u;
                    if (i) {
                        var f = -1;
                        for (u = r; u < a; u++)
                            if (o(e, u) === o(t, f === -1 ? 0 : u - f)) {
                                if (f === -1 && (f = u), u - f + 1 === c) return f * s
                            } else f !== -1 && (u -= u - f), f = -1
                    } else
                        for (r + c > a && (r = a - c), u = r; u >= 0; u--) {
                            for (var h = !0, l = 0; l < c; l++)
                                if (o(e, u + l) !== o(t, l)) {
                                    h = !1;
                                    break
                                }
                            if (h) return u
                        }
                    return -1
                }

                function _(e, t, r, n) {
                    r = Number(r) || 0;
                    var i = e.length - r;
                    n ? (n = Number(n), n > i && (n = i)) : n = i;
                    var o = t.length;
                    if (o % 2 !== 0) throw new TypeError("Invalid hex string");
                    n > o / 2 && (n = o / 2);
                    for (var s = 0; s < n; ++s) {
                        var a = parseInt(t.substr(2 * s, 2), 16);
                        if (isNaN(a)) return s;
                        e[r + s] = a
                    }
                    return s
                }

                function k(e, t, r, n) {
                    return V(W(t, e.length - r), e, r, n)
                }

                function T(e, t, r, n) {
                    return V(J(t), e, r, n)
                }

                function O(e, t, r, n) {
                    return T(e, t, r, n)
                }

                function j(e, t, r, n) {
                    return V(G(t), e, r, n)
                }

                function P(e, t, r, n) {
                    return V(K(t, e.length - r), e, r, n)
                }

                function A(e, t, r) {
                    return 0 === t && r === e.length ? $.fromByteArray(e) : $.fromByteArray(e.slice(t, r))
                }

                function R(e, t, r) {
                    r = Math.min(e.length, r);
                    for (var n = [], i = t; i < r;) {
                        var o = e[i],
                            s = null,
                            a = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
                        if (i + a <= r) {
                            var c, u, f, h;
                            switch (a) {
                                case 1:
                                    o < 128 && (s = o);
                                    break;
                                case 2:
                                    c = e[i + 1], 128 === (192 & c) && (h = (31 & o) << 6 | 63 & c, h > 127 && (s = h));
                                    break;
                                case 3:
                                    c = e[i + 1], u = e[i + 2], 128 === (192 & c) && 128 === (192 & u) && (h = (15 & o) << 12 | (63 & c) << 6 | 63 & u, h > 2047 && (h < 55296 || h > 57343) && (s = h));
                                    break;
                                case 4:
                                    c = e[i + 1], u = e[i + 2], f = e[i + 3], 128 === (192 & c) && 128 === (192 & u) && 128 === (192 & f) && (h = (15 & o) << 18 | (63 & c) << 12 | (63 & u) << 6 | 63 & f, h > 65535 && h < 1114112 && (s = h))
                            }
                        }
                        null === s ? (s = 65533, a = 1) : s > 65535 && (s -= 65536, n.push(s >>> 10 & 1023 | 55296), s = 56320 | 1023 & s), n.push(s), i += a
                    }
                    return x(n)
                }

                function x(e) {
                    var t = e.length;
                    if (t <= ee) return String.fromCharCode.apply(String, e);
                    for (var r = "", n = 0; n < t;) r += String.fromCharCode.apply(String, e.slice(n, n += ee));
                    return r
                }

                function S(e, t, r) {
                    var n = "";
                    r = Math.min(e.length, r);
                    for (var i = t; i < r; ++i) n += String.fromCharCode(127 & e[i]);
                    return n
                }

                function C(e, t, r) {
                    var n = "";
                    r = Math.min(e.length, r);
                    for (var i = t; i < r; ++i) n += String.fromCharCode(e[i]);
                    return n
                }

                function U(e, t, r) {
                    var n = e.length;
                    (!t || t < 0) && (t = 0), (!r || r < 0 || r > n) && (r = n);
                    for (var i = "", o = t; o < r; ++o) i += Y(e[o]);
                    return i
                }

                function I(e, t, r) {
                    for (var n = e.slice(t, r), i = "", o = 0; o < n.length; o += 2) i += String.fromCharCode(n[o] + 256 * n[o + 1]);
                    return i
                }

                function M(e, t, r) {
                    if (e % 1 !== 0 || e < 0) throw new RangeError("offset is not uint");
                    if (e + t > r) throw new RangeError("Trying to access beyond buffer length")
                }

                function L(e, t, r, n, i, o) {
                    if (!s.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
                    if (t > i || t < o) throw new RangeError('"value" argument is out of bounds');
                    if (r + n > e.length) throw new RangeError("Index out of range")
                }

                function B(e, t, r, n) {
                    t < 0 && (t = 65535 + t + 1);
                    for (var i = 0, o = Math.min(e.length - r, 2); i < o; ++i) e[r + i] = (t & 255 << 8 * (n ? i : 1 - i)) >>> 8 * (n ? i : 1 - i)
                }

                function N(e, t, r, n) {
                    t < 0 && (t = 4294967295 + t + 1);
                    for (var i = 0, o = Math.min(e.length - r, 4); i < o; ++i) e[r + i] = t >>> 8 * (n ? i : 3 - i) & 255
                }

                function D(e, t, r, n, i, o) {
                    if (r + n > e.length) throw new RangeError("Index out of range");
                    if (r < 0) throw new RangeError("Index out of range")
                }

                function q(e, t, r, n, i) {
                    return i || D(e, t, r, 4, 3.4028234663852886e38, -3.4028234663852886e38), Z.write(e, t, r, n, 23, 4), r + 4
                }

                function H(e, t, r, n, i) {
                    return i || D(e, t, r, 8, 1.7976931348623157e308, -1.7976931348623157e308), Z.write(e, t, r, n, 52, 8), r + 8
                }

                function F(e) {
                    if (e = z(e).replace(te, ""), e.length < 2) return "";
                    for (; e.length % 4 !== 0;) e += "=";
                    return e
                }

                function z(e) {
                    return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, "")
                }

                function Y(e) {
                    return e < 16 ? "0" + e.toString(16) : e.toString(16)
                }

                function W(e, t) {
                    t = t || 1 / 0;
                    for (var r, n = e.length, i = null, o = [], s = 0; s < n; ++s) {
                        if (r = e.charCodeAt(s), r > 55295 && r < 57344) {
                            if (!i) {
                                if (r > 56319) {
                                    (t -= 3) > -1 && o.push(239, 191, 189);
                                    continue
                                }
                                if (s + 1 === n) {
                                    (t -= 3) > -1 && o.push(239, 191, 189);
                                    continue
                                }
                                i = r;
                                continue
                            }
                            if (r < 56320) {
                                (t -= 3) > -1 && o.push(239, 191, 189), i = r;
                                continue
                            }
                            r = (i - 55296 << 10 | r - 56320) + 65536
                        } else i && (t -= 3) > -1 && o.push(239, 191, 189);
                        if (i = null, r < 128) {
                            if ((t -= 1) < 0) break;
                            o.push(r)
                        } else if (r < 2048) {
                            if ((t -= 2) < 0) break;
                            o.push(r >> 6 | 192, 63 & r | 128)
                        } else if (r < 65536) {
                            if ((t -= 3) < 0) break;
                            o.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
                        } else {
                            if (!(r < 1114112)) throw new Error("Invalid code point");
                            if ((t -= 4) < 0) break;
                            o.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
                        }
                    }
                    return o
                }

                function J(e) {
                    for (var t = [], r = 0; r < e.length; ++r) t.push(255 & e.charCodeAt(r));
                    return t
                }

                function K(e, t) {
                    for (var r, n, i, o = [], s = 0; s < e.length && !((t -= 2) < 0); ++s) r = e.charCodeAt(s), n = r >> 8, i = r % 256, o.push(i), o.push(n);
                    return o
                }

                function G(e) {
                    return $.toByteArray(F(e))
                }

                function V(e, t, r, n) {
                    for (var i = 0; i < n && !(i + r >= t.length || i >= e.length); ++i) t[i + r] = e[i];
                    return i
                }

                function X(e) {
                    return e !== e
                }
                var $ = e("base64-js"),
                    Z = e("ieee754"),
                    Q = e("isarray");
                r.Buffer = s, r.SlowBuffer = g, r.INSPECT_MAX_BYTES = 50, s.TYPED_ARRAY_SUPPORT = void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : n(), r.kMaxLength = i(), s.poolSize = 8192, s._augment = function(e) {
                    return e.__proto__ = s.prototype, e
                }, s.from = function(e, t, r) {
                    return a(null, e, t, r)
                }, s.TYPED_ARRAY_SUPPORT && (s.prototype.__proto__ = Uint8Array.prototype, s.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && s[Symbol.species] === s && Object.defineProperty(s, Symbol.species, {
                    value: null,
                    configurable: !0
                })), s.alloc = function(e, t, r) {
                    return u(null, e, t, r)
                }, s.allocUnsafe = function(e) {
                    return f(null, e)
                }, s.allocUnsafeSlow = function(e) {
                    return f(null, e)
                }, s.isBuffer = function(e) {
                    return !(null == e || !e._isBuffer)
                }, s.compare = function(e, t) {
                    if (!s.isBuffer(e) || !s.isBuffer(t)) throw new TypeError("Arguments must be Buffers");
                    if (e === t) return 0;
                    for (var r = e.length, n = t.length, i = 0, o = Math.min(r, n); i < o; ++i)
                        if (e[i] !== t[i]) {
                            r = e[i], n = t[i];
                            break
                        }
                    return r < n ? -1 : n < r ? 1 : 0
                }, s.isEncoding = function(e) {
                    switch (String(e).toLowerCase()) {
                        case "hex":
                        case "utf8":
                        case "utf-8":
                        case "ascii":
                        case "latin1":
                        case "binary":
                        case "base64":
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return !0;
                        default:
                            return !1
                    }
                }, s.concat = function(e, t) {
                    if (!Q(e)) throw new TypeError('"list" argument must be an Array of Buffers');
                    if (0 === e.length) return s.alloc(0);
                    var r;
                    if (void 0 === t)
                        for (t = 0, r = 0; r < e.length; ++r) t += e[r].length;
                    var n = s.allocUnsafe(t),
                        i = 0;
                    for (r = 0; r < e.length; ++r) {
                        var o = e[r];
                        if (!s.isBuffer(o)) throw new TypeError('"list" argument must be an Array of Buffers');
                        o.copy(n, i), i += o.length
                    }
                    return n
                }, s.byteLength = m, s.prototype._isBuffer = !0, s.prototype.swap16 = function() {
                    var e = this.length;
                    if (e % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
                    for (var t = 0; t < e; t += 2) w(this, t, t + 1);
                    return this
                }, s.prototype.swap32 = function() {
                    var e = this.length;
                    if (e % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
                    for (var t = 0; t < e; t += 4) w(this, t, t + 3), w(this, t + 1, t + 2);
                    return this
                }, s.prototype.swap64 = function() {
                    var e = this.length;
                    if (e % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
                    for (var t = 0; t < e; t += 8) w(this, t, t + 7), w(this, t + 1, t + 6), w(this, t + 2, t + 5), w(this, t + 3, t + 4);
                    return this
                }, s.prototype.toString = function() {
                    var e = 0 | this.length;
                    return 0 === e ? "" : 0 === arguments.length ? R(this, 0, e) : y.apply(this, arguments)
                }, s.prototype.equals = function(e) {
                    if (!s.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                    return this === e || 0 === s.compare(this, e)
                }, s.prototype.inspect = function() {
                    var e = "",
                        t = r.INSPECT_MAX_BYTES;
                    return this.length > 0 && (e = this.toString("hex", 0, t).match(/.{2}/g).join(" "), this.length > t && (e += " ... ")), "<Buffer " + e + ">"
                }, s.prototype.compare = function(e, t, r, n, i) {
                    if (!s.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                    if (void 0 === t && (t = 0), void 0 === r && (r = e ? e.length : 0), void 0 === n && (n = 0), void 0 === i && (i = this.length), t < 0 || r > e.length || n < 0 || i > this.length) throw new RangeError("out of range index");
                    if (n >= i && t >= r) return 0;
                    if (n >= i) return -1;
                    if (t >= r) return 1;
                    if (t >>>= 0, r >>>= 0, n >>>= 0, i >>>= 0, this === e) return 0;
                    for (var o = i - n, a = r - t, c = Math.min(o, a), u = this.slice(n, i), f = e.slice(t, r), h = 0; h < c; ++h)
                        if (u[h] !== f[h]) {
                            o = u[h], a = f[h];
                            break
                        }
                    return o < a ? -1 : a < o ? 1 : 0
                }, s.prototype.includes = function(e, t, r) {
                    return this.indexOf(e, t, r) !== -1
                }, s.prototype.indexOf = function(e, t, r) {
                    return b(this, e, t, r, !0)
                }, s.prototype.lastIndexOf = function(e, t, r) {
                    return b(this, e, t, r, !1)
                }, s.prototype.write = function(e, t, r, n) {
                    if (void 0 === t) n = "utf8", r = this.length, t = 0;
                    else if (void 0 === r && "string" == typeof t) n = t, r = this.length, t = 0;
                    else {
                        if (!isFinite(t)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                        t = 0 | t, isFinite(r) ? (r = 0 | r, void 0 === n && (n = "utf8")) : (n = r, r = void 0)
                    }
                    var i = this.length - t;
                    if ((void 0 === r || r > i) && (r = i), e.length > 0 && (r < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
                    n || (n = "utf8");
                    for (var o = !1;;) switch (n) {
                        case "hex":
                            return _(this, e, t, r);
                        case "utf8":
                        case "utf-8":
                            return k(this, e, t, r);
                        case "ascii":
                            return T(this, e, t, r);
                        case "latin1":
                        case "binary":
                            return O(this, e, t, r);
                        case "base64":
                            return j(this, e, t, r);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return P(this, e, t, r);
                        default:
                            if (o) throw new TypeError("Unknown encoding: " + n);
                            n = ("" + n).toLowerCase(), o = !0
                    }
                }, s.prototype.toJSON = function() {
                    return {
                        type: "Buffer",
                        data: Array.prototype.slice.call(this._arr || this, 0)
                    }
                };
                var ee = 4096;
                s.prototype.slice = function(e, t) {
                    var r = this.length;
                    e = ~~e, t = void 0 === t ? r : ~~t, e < 0 ? (e += r, e < 0 && (e = 0)) : e > r && (e = r), t < 0 ? (t += r, t < 0 && (t = 0)) : t > r && (t = r), t < e && (t = e);
                    var n;
                    if (s.TYPED_ARRAY_SUPPORT) n = this.subarray(e, t), n.__proto__ = s.prototype;
                    else {
                        var i = t - e;
                        n = new s(i, (void 0));
                        for (var o = 0; o < i; ++o) n[o] = this[o + e]
                    }
                    return n
                }, s.prototype.readUIntLE = function(e, t, r) {
                    e = 0 | e, t = 0 | t, r || M(e, t, this.length);
                    for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256);) n += this[e + o] * i;
                    return n
                }, s.prototype.readUIntBE = function(e, t, r) {
                    e = 0 | e, t = 0 | t, r || M(e, t, this.length);
                    for (var n = this[e + --t], i = 1; t > 0 && (i *= 256);) n += this[e + --t] * i;
                    return n
                }, s.prototype.readUInt8 = function(e, t) {
                    return t || M(e, 1, this.length), this[e]
                }, s.prototype.readUInt16LE = function(e, t) {
                    return t || M(e, 2, this.length), this[e] | this[e + 1] << 8
                }, s.prototype.readUInt16BE = function(e, t) {
                    return t || M(e, 2, this.length), this[e] << 8 | this[e + 1]
                }, s.prototype.readUInt32LE = function(e, t) {
                    return t || M(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + 16777216 * this[e + 3]
                }, s.prototype.readUInt32BE = function(e, t) {
                    return t || M(e, 4, this.length), 16777216 * this[e] + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3])
                }, s.prototype.readIntLE = function(e, t, r) {
                    e = 0 | e, t = 0 | t, r || M(e, t, this.length);
                    for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256);) n += this[e + o] * i;
                    return i *= 128, n >= i && (n -= Math.pow(2, 8 * t)), n
                }, s.prototype.readIntBE = function(e, t, r) {
                    e = 0 | e, t = 0 | t, r || M(e, t, this.length);
                    for (var n = t, i = 1, o = this[e + --n]; n > 0 && (i *= 256);) o += this[e + --n] * i;
                    return i *= 128, o >= i && (o -= Math.pow(2, 8 * t)), o
                }, s.prototype.readInt8 = function(e, t) {
                    return t || M(e, 1, this.length), 128 & this[e] ? (255 - this[e] + 1) * -1 : this[e]
                }, s.prototype.readInt16LE = function(e, t) {
                    t || M(e, 2, this.length);
                    var r = this[e] | this[e + 1] << 8;
                    return 32768 & r ? 4294901760 | r : r
                }, s.prototype.readInt16BE = function(e, t) {
                    t || M(e, 2, this.length);
                    var r = this[e + 1] | this[e] << 8;
                    return 32768 & r ? 4294901760 | r : r
                }, s.prototype.readInt32LE = function(e, t) {
                    return t || M(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24
                }, s.prototype.readInt32BE = function(e, t) {
                    return t || M(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]
                }, s.prototype.readFloatLE = function(e, t) {
                    return t || M(e, 4, this.length), Z.read(this, e, !0, 23, 4)
                }, s.prototype.readFloatBE = function(e, t) {
                    return t || M(e, 4, this.length), Z.read(this, e, !1, 23, 4)
                }, s.prototype.readDoubleLE = function(e, t) {
                    return t || M(e, 8, this.length), Z.read(this, e, !0, 52, 8)
                }, s.prototype.readDoubleBE = function(e, t) {
                    return t || M(e, 8, this.length), Z.read(this, e, !1, 52, 8)
                }, s.prototype.writeUIntLE = function(e, t, r, n) {
                    if (e = +e, t = 0 | t, r = 0 | r, !n) {
                        var i = Math.pow(2, 8 * r) - 1;
                        L(this, e, t, r, i, 0)
                    }
                    var o = 1,
                        s = 0;
                    for (this[t] = 255 & e; ++s < r && (o *= 256);) this[t + s] = e / o & 255;
                    return t + r
                }, s.prototype.writeUIntBE = function(e, t, r, n) {
                    if (e = +e, t = 0 | t, r = 0 | r, !n) {
                        var i = Math.pow(2, 8 * r) - 1;
                        L(this, e, t, r, i, 0)
                    }
                    var o = r - 1,
                        s = 1;
                    for (this[t + o] = 255 & e; --o >= 0 && (s *= 256);) this[t + o] = e / s & 255;
                    return t + r
                }, s.prototype.writeUInt8 = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 1, 255, 0), s.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)), this[t] = 255 & e, t + 1
                }, s.prototype.writeUInt16LE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 2, 65535, 0), s.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e, this[t + 1] = e >>> 8) : B(this, e, t, !0), t + 2
                }, s.prototype.writeUInt16BE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 2, 65535, 0), s.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8, this[t + 1] = 255 & e) : B(this, e, t, !1), t + 2
                }, s.prototype.writeUInt32LE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 4, 4294967295, 0), s.TYPED_ARRAY_SUPPORT ? (this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = 255 & e) : N(this, e, t, !0), t + 4
                }, s.prototype.writeUInt32BE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 4, 4294967295, 0), s.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e) : N(this, e, t, !1), t + 4
                }, s.prototype.writeIntLE = function(e, t, r, n) {
                    if (e = +e, t = 0 | t, !n) {
                        var i = Math.pow(2, 8 * r - 1);
                        L(this, e, t, r, i - 1, -i)
                    }
                    var o = 0,
                        s = 1,
                        a = 0;
                    for (this[t] = 255 & e; ++o < r && (s *= 256);) e < 0 && 0 === a && 0 !== this[t + o - 1] && (a = 1), this[t + o] = (e / s >> 0) - a & 255;
                    return t + r
                }, s.prototype.writeIntBE = function(e, t, r, n) {
                    if (e = +e, t = 0 | t, !n) {
                        var i = Math.pow(2, 8 * r - 1);
                        L(this, e, t, r, i - 1, -i)
                    }
                    var o = r - 1,
                        s = 1,
                        a = 0;
                    for (this[t + o] = 255 & e; --o >= 0 && (s *= 256);) e < 0 && 0 === a && 0 !== this[t + o + 1] && (a = 1), this[t + o] = (e / s >> 0) - a & 255;
                    return t + r
                }, s.prototype.writeInt8 = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 1, 127, -128), s.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)), e < 0 && (e = 255 + e + 1), this[t] = 255 & e, t + 1
                }, s.prototype.writeInt16LE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 2, 32767, -32768), s.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e, this[t + 1] = e >>> 8) : B(this, e, t, !0), t + 2
                }, s.prototype.writeInt16BE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 2, 32767, -32768), s.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8, this[t + 1] = 255 & e) : B(this, e, t, !1), t + 2
                }, s.prototype.writeInt32LE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 4, 2147483647, -2147483648), s.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24) : N(this, e, t, !0), t + 4
                }, s.prototype.writeInt32BE = function(e, t, r) {
                    return e = +e, t = 0 | t, r || L(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), s.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e) : N(this, e, t, !1), t + 4
                }, s.prototype.writeFloatLE = function(e, t, r) {
                    return q(this, e, t, !0, r)
                }, s.prototype.writeFloatBE = function(e, t, r) {
                    return q(this, e, t, !1, r)
                }, s.prototype.writeDoubleLE = function(e, t, r) {
                    return H(this, e, t, !0, r)
                }, s.prototype.writeDoubleBE = function(e, t, r) {
                    return H(this, e, t, !1, r)
                }, s.prototype.copy = function(e, t, r, n) {
                    if (r || (r = 0), n || 0 === n || (n = this.length), t >= e.length && (t = e.length), t || (t = 0), n > 0 && n < r && (n = r), n === r) return 0;
                    if (0 === e.length || 0 === this.length) return 0;
                    if (t < 0) throw new RangeError("targetStart out of bounds");
                    if (r < 0 || r >= this.length) throw new RangeError("sourceStart out of bounds");
                    if (n < 0) throw new RangeError("sourceEnd out of bounds");
                    n > this.length && (n = this.length), e.length - t < n - r && (n = e.length - t + r);
                    var i, o = n - r;
                    if (this === e && r < t && t < n)
                        for (i = o - 1; i >= 0; --i) e[i + t] = this[i + r];
                    else if (o < 1e3 || !s.TYPED_ARRAY_SUPPORT)
                        for (i = 0; i < o; ++i) e[i + t] = this[i + r];
                    else Uint8Array.prototype.set.call(e, this.subarray(r, r + o), t);
                    return o
                }, s.prototype.fill = function(e, t, r, n) {
                    if ("string" == typeof e) {
                        if ("string" == typeof t ? (n = t, t = 0, r = this.length) : "string" == typeof r && (n = r, r = this.length), 1 === e.length) {
                            var i = e.charCodeAt(0);
                            i < 256 && (e = i)
                        }
                        if (void 0 !== n && "string" != typeof n) throw new TypeError("encoding must be a string");
                        if ("string" == typeof n && !s.isEncoding(n)) throw new TypeError("Unknown encoding: " + n)
                    } else "number" == typeof e && (e = 255 & e);
                    if (t < 0 || this.length < t || this.length < r) throw new RangeError("Out of range index");
                    if (r <= t) return this;
                    t >>>= 0, r = void 0 === r ? this.length : r >>> 0, e || (e = 0);
                    var o;
                    if ("number" == typeof e)
                        for (o = t; o < r; ++o) this[o] = e;
                    else {
                        var a = s.isBuffer(e) ? e : W(new s(e, n).toString()),
                            c = a.length;
                        for (o = 0; o < r - t; ++o) this[o + t] = a[o % c]
                    }
                    return this
                };
                var te = /[^+\/0-9A-Za-z-_]/g
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {
            "base64-js": 1,
            ieee754: 12,
            isarray: 7
        }],
        7: [function(e, t, r) {
            var n = {}.toString;
            t.exports = Array.isArray || function(e) {
                return "[object Array]" == n.call(e)
            }
        }, {}],
        8: [function(e, t, r) {
            t.exports = {
                100: "Continue",
                101: "Switching Protocols",
                102: "Processing",
                200: "OK",
                201: "Created",
                202: "Accepted",
                203: "Non-Authoritative Information",
                204: "No Content",
                205: "Reset Content",
                206: "Partial Content",
                207: "Multi-Status",
                208: "Already Reported",
                226: "IM Used",
                300: "Multiple Choices",
                301: "Moved Permanently",
                302: "Found",
                303: "See Other",
                304: "Not Modified",
                305: "Use Proxy",
                307: "Temporary Redirect",
                308: "Permanent Redirect",
                400: "Bad Request",
                401: "Unauthorized",
                402: "Payment Required",
                403: "Forbidden",
                404: "Not Found",
                405: "Method Not Allowed",
                406: "Not Acceptable",
                407: "Proxy Authentication Required",
                408: "Request Timeout",
                409: "Conflict",
                410: "Gone",
                411: "Length Required",
                412: "Precondition Failed",
                413: "Payload Too Large",
                414: "URI Too Long",
                415: "Unsupported Media Type",
                416: "Range Not Satisfiable",
                417: "Expectation Failed",
                418: "I'm a teapot",
                421: "Misdirected Request",
                422: "Unprocessable Entity",
                423: "Locked",
                424: "Failed Dependency",
                425: "Unordered Collection",
                426: "Upgrade Required",
                428: "Precondition Required",
                429: "Too Many Requests",
                431: "Request Header Fields Too Large",
                500: "Internal Server Error",
                501: "Not Implemented",
                502: "Bad Gateway",
                503: "Service Unavailable",
                504: "Gateway Timeout",
                505: "HTTP Version Not Supported",
                506: "Variant Also Negotiates",
                507: "Insufficient Storage",
                508: "Loop Detected",
                509: "Bandwidth Limit Exceeded",
                510: "Not Extended",
                511: "Network Authentication Required"
            }
        }, {}],
        9: [function(e, t, r) {
            (function(e) {
                function t(e) {
                    return Array.isArray ? Array.isArray(e) : "[object Array]" === g(e)
                }

                function n(e) {
                    return "boolean" == typeof e
                }

                function i(e) {
                    return null === e
                }

                function o(e) {
                    return null == e
                }

                function s(e) {
                    return "number" == typeof e
                }

                function a(e) {
                    return "string" == typeof e
                }

                function c(e) {
                    return "symbol" == typeof e
                }

                function u(e) {
                    return void 0 === e
                }

                function f(e) {
                    return "[object RegExp]" === g(e)
                }

                function h(e) {
                    return "object" == typeof e && null !== e
                }

                function l(e) {
                    return "[object Date]" === g(e)
                }

                function d(e) {
                    return "[object Error]" === g(e) || e instanceof Error
                }

                function p(e) {
                    return "function" == typeof e
                }

                function v(e) {
                    return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || "undefined" == typeof e
                }

                function g(e) {
                    return Object.prototype.toString.call(e)
                }
                r.isArray = t, r.isBoolean = n, r.isNull = i, r.isNullOrUndefined = o, r.isNumber = s, r.isString = a, r.isSymbol = c, r.isUndefined = u, r.isRegExp = f, r.isObject = h, r.isDate = l, r.isError = d, r.isFunction = p, r.isPrimitive = v, r.isBuffer = e.isBuffer
            }).call(this, {
                isBuffer: e("../../is-buffer/index.js")
            })
        }, {
            "../../is-buffer/index.js": 14
        }],
        10: [function(e, t, r) {
            function n() {
                this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
            }

            function i(e) {
                return "function" == typeof e
            }

            function o(e) {
                return "number" == typeof e
            }

            function s(e) {
                return "object" == typeof e && null !== e
            }

            function a(e) {
                return void 0 === e
            }
            t.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0, n.defaultMaxListeners = 10, n.prototype.setMaxListeners = function(e) {
                if (!o(e) || e < 0 || isNaN(e)) throw TypeError("n must be a positive number");
                return this._maxListeners = e, this
            }, n.prototype.emit = function(e) {
                var t, r, n, o, c, u;
                if (this._events || (this._events = {}), "error" === e && (!this._events.error || s(this._events.error) && !this._events.error.length)) {
                    if (t = arguments[1], t instanceof Error) throw t;
                    var f = new Error('Uncaught, unspecified "error" event. (' + t + ")");
                    throw f.context = t, f
                }
                if (r = this._events[e], a(r)) return !1;
                if (i(r)) switch (arguments.length) {
                    case 1:
                        r.call(this);
                        break;
                    case 2:
                        r.call(this, arguments[1]);
                        break;
                    case 3:
                        r.call(this, arguments[1], arguments[2]);
                        break;
                    default:
                        o = Array.prototype.slice.call(arguments, 1), r.apply(this, o)
                } else if (s(r))
                    for (o = Array.prototype.slice.call(arguments, 1), u = r.slice(), n = u.length, c = 0; c < n; c++) u[c].apply(this, o);
                return !0
            }, n.prototype.addListener = function(e, t) {
                var r;
                if (!i(t)) throw TypeError("listener must be a function");
                return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", e, i(t.listener) ? t.listener : t), this._events[e] ? s(this._events[e]) ? this._events[e].push(t) : this._events[e] = [this._events[e], t] : this._events[e] = t, s(this._events[e]) && !this._events[e].warned && (r = a(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners, r && r > 0 && this._events[e].length > r && (this._events[e].warned = !0, "function" == typeof console.trace)), this
            }, n.prototype.on = n.prototype.addListener, n.prototype.once = function(e, t) {
                function r() {
                    this.removeListener(e, r), n || (n = !0, t.apply(this, arguments))
                }
                if (!i(t)) throw TypeError("listener must be a function");
                var n = !1;
                return r.listener = t, this.on(e, r), this
            }, n.prototype.removeListener = function(e, t) {
                var r, n, o, a;
                if (!i(t)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[e]) return this;
                if (r = this._events[e], o = r.length, n = -1, r === t || i(r.listener) && r.listener === t) delete this._events[e], this._events.removeListener && this.emit("removeListener", e, t);
                else if (s(r)) {
                    for (a = o; a-- > 0;)
                        if (r[a] === t || r[a].listener && r[a].listener === t) {
                            n = a;
                            break
                        }
                    if (n < 0) return this;
                    1 === r.length ? (r.length = 0, delete this._events[e]) : r.splice(n, 1), this._events.removeListener && this.emit("removeListener", e, t)
                }
                return this
            }, n.prototype.removeAllListeners = function(e) {
                var t, r;
                if (!this._events) return this;
                if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[e] && delete this._events[e], this;
                if (0 === arguments.length) {
                    for (t in this._events) "removeListener" !== t && this.removeAllListeners(t);
                    return this.removeAllListeners("removeListener"), this._events = {}, this
                }
                if (r = this._events[e], i(r)) this.removeListener(e, r);
                else if (r)
                    for (; r.length;) this.removeListener(e, r[r.length - 1]);
                return delete this._events[e], this
            }, n.prototype.listeners = function(e) {
                var t;
                return t = this._events && this._events[e] ? i(this._events[e]) ? [this._events[e]] : this._events[e].slice() : []
            }, n.prototype.listenerCount = function(e) {
                if (this._events) {
                    var t = this._events[e];
                    if (i(t)) return 1;
                    if (t) return t.length
                }
                return 0
            }, n.listenerCount = function(e, t) {
                return e.listenerCount(t)
            }
        }, {}],
        11: [function(e, t, r) {
            var n = e("http"),
                i = t.exports;
            for (var o in n) n.hasOwnProperty(o) && (i[o] = n[o]);
            i.request = function(e, t) {
                return e || (e = {}), e.scheme = "https", e.protocol = "https:", n.request.call(this, e, t)
            }
        }, {
            http: 22
        }],
        12: [function(e, t, r) {
            r.read = function(e, t, r, n, i) {
                var o, s, a = 8 * i - n - 1,
                    c = (1 << a) - 1,
                    u = c >> 1,
                    f = -7,
                    h = r ? i - 1 : 0,
                    l = r ? -1 : 1,
                    d = e[t + h];
                for (h += l, o = d & (1 << -f) - 1, d >>= -f, f += a; f > 0; o = 256 * o + e[t + h], h += l, f -= 8);
                for (s = o & (1 << -f) - 1, o >>= -f, f += n; f > 0; s = 256 * s + e[t + h], h += l, f -= 8);
                if (0 === o) o = 1 - u;
                else {
                    if (o === c) return s ? NaN : (d ? -1 : 1) * (1 / 0);
                    s += Math.pow(2, n), o -= u
                }
                return (d ? -1 : 1) * s * Math.pow(2, o - n)
            }, r.write = function(e, t, r, n, i, o) {
                var s, a, c, u = 8 * o - i - 1,
                    f = (1 << u) - 1,
                    h = f >> 1,
                    l = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                    d = n ? 0 : o - 1,
                    p = n ? 1 : -1,
                    v = t < 0 || 0 === t && 1 / t < 0 ? 1 : 0;
                for (t = Math.abs(t), isNaN(t) || t === 1 / 0 ? (a = isNaN(t) ? 1 : 0, s = f) : (s = Math.floor(Math.log(t) / Math.LN2), t * (c = Math.pow(2, -s)) < 1 && (s--, c *= 2), t += s + h >= 1 ? l / c : l * Math.pow(2, 1 - h), t * c >= 2 && (s++, c /= 2), s + h >= f ? (a = 0, s = f) : s + h >= 1 ? (a = (t * c - 1) * Math.pow(2, i), s += h) : (a = t * Math.pow(2, h - 1) * Math.pow(2, i), s = 0)); i >= 8; e[r + d] = 255 & a, d += p, a /= 256, i -= 8);
                for (s = s << i | a, u += i; u > 0; e[r + d] = 255 & s, d += p, s /= 256, u -= 8);
                e[r + d - p] |= 128 * v
            }
        }, {}],
        13: [function(e, t, r) {
            "function" == typeof Object.create ? t.exports = function(e, t) {
                e.super_ = t, e.prototype = Object.create(t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                })
            } : t.exports = function(e, t) {
                e.super_ = t;
                var r = function() {};
                r.prototype = t.prototype, e.prototype = new r, e.prototype.constructor = e
            }
        }, {}],
        14: [function(e, t, r) {
            function n(e) {
                return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e)
            }

            function i(e) {
                return "function" == typeof e.readFloatLE && "function" == typeof e.slice && n(e.slice(0, 0))
            }
            t.exports = function(e) {
                return null != e && (n(e) || i(e) || !!e._isBuffer)
            }
        }, {}],
        15: [function(e, t, r) {
            arguments[4][7][0].apply(r, arguments)
        }, {
            dup: 7
        }],
        16: [function(e, t, r) {
            (function(e) {
                "use strict";

                function r(t, r, n, i) {
                    if ("function" != typeof t) throw new TypeError('"callback" argument must be a function');
                    var o, s, a = arguments.length;
                    switch (a) {
                        case 0:
                        case 1:
                            return e.nextTick(t);
                        case 2:
                            return e.nextTick(function() {
                                t.call(null, r)
                            });
                        case 3:
                            return e.nextTick(function() {
                                t.call(null, r, n)
                            });
                        case 4:
                            return e.nextTick(function() {
                                t.call(null, r, n, i)
                            });
                        default:
                            for (o = new Array(a - 1), s = 0; s < o.length;) o[s++] = arguments[s];
                            return e.nextTick(function() {
                                t.apply(null, o)
                            })
                    }
                }!e.version || 0 === e.version.indexOf("v0.") || 0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8.") ? t.exports = r : t.exports = e.nextTick
            }).call(this, e("_process"))
        }, {
            _process: 17
        }],
        17: [function(e, t, r) {
            function n() {
                throw new Error("setTimeout has not been defined")
            }

            function i() {
                throw new Error("clearTimeout has not been defined")
            }

            function o(e) {
                if (h === setTimeout) return setTimeout(e, 0);
                if ((h === n || !h) && setTimeout) return h = setTimeout, setTimeout(e, 0);
                try {
                    return h(e, 0)
                } catch (t) {
                    try {
                        return h.call(null, e, 0)
                    } catch (t) {
                        return h.call(this, e, 0)
                    }
                }
            }

            function s(e) {
                if (l === clearTimeout) return clearTimeout(e);
                if ((l === i || !l) && clearTimeout) return l = clearTimeout, clearTimeout(e);
                try {
                    return l(e)
                } catch (t) {
                    try {
                        return l.call(null, e)
                    } catch (t) {
                        return l.call(this, e)
                    }
                }
            }

            function a() {
                g && p && (g = !1, p.length ? v = p.concat(v) : m = -1, v.length && c())
            }

            function c() {
                if (!g) {
                    var e = o(a);
                    g = !0;
                    for (var t = v.length; t;) {
                        for (p = v, v = []; ++m < t;) p && p[m].run();
                        m = -1, t = v.length
                    }
                    p = null, g = !1, s(e)
                }
            }

            function u(e, t) {
                this.fun = e, this.array = t
            }

            function f() {}
            var h, l, d = t.exports = {};
            ! function() {
                try {
                    h = "function" == typeof setTimeout ? setTimeout : n
                } catch (e) {
                    h = n
                }
                try {
                    l = "function" == typeof clearTimeout ? clearTimeout : i
                } catch (e) {
                    l = i
                }
            }();
            var p, v = [],
                g = !1,
                m = -1;
            d.nextTick = function(e) {
                var t = new Array(arguments.length - 1);
                if (arguments.length > 1)
                    for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                v.push(new u(e, t)), 1 !== v.length || g || o(c)
            }, u.prototype.run = function() {
                this.fun.apply(null, this.array)
            }, d.title = "browser", d.browser = !0, d.env = {}, d.argv = [], d.version = "", d.versions = {}, d.on = f, d.addListener = f, d.once = f, d.off = f, d.removeListener = f, d.removeAllListeners = f, d.emit = f, d.binding = function(e) {
                throw new Error("process.binding is not supported")
            }, d.cwd = function() {
                return "/"
            }, d.chdir = function(e) {
                throw new Error("process.chdir is not supported")
            }, d.umask = function() {
                return 0
            }
        }, {}],
        18: [function(t, r, n) {
            (function(t) {
                ! function(i) {
                    function o(e) {
                        throw RangeError(I[e])
                    }

                    function s(e, t) {
                        for (var r = e.length, n = []; r--;) n[r] = t(e[r]);
                        return n
                    }

                    function a(e, t) {
                        var r = e.split("@"),
                            n = "";
                        r.length > 1 && (n = r[0] + "@", e = r[1]), e = e.replace(U, ".");
                        var i = e.split("."),
                            o = s(i, t).join(".");
                        return n + o
                    }

                    function c(e) {
                        for (var t, r, n = [], i = 0, o = e.length; i < o;) t = e.charCodeAt(i++), t >= 55296 && t <= 56319 && i < o ? (r = e.charCodeAt(i++), 56320 == (64512 & r) ? n.push(((1023 & t) << 10) + (1023 & r) + 65536) : (n.push(t), i--)) : n.push(t);
                        return n
                    }

                    function u(e) {
                        return s(e, function(e) {
                            var t = "";
                            return e > 65535 && (e -= 65536, t += B(e >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), t += B(e)
                        }).join("")
                    }

                    function f(e) {
                        return e - 48 < 10 ? e - 22 : e - 65 < 26 ? e - 65 : e - 97 < 26 ? e - 97 : k
                    }

                    function h(e, t) {
                        return e + 22 + 75 * (e < 26) - ((0 != t) << 5)
                    }

                    function l(e, t, r) {
                        var n = 0;
                        for (e = r ? L(e / P) : e >> 1, e += L(e / t); e > M * O >> 1; n += k) e = L(e / M);
                        return L(n + (M + 1) * e / (e + j))
                    }

                    function d(e) {
                        var t, r, n, i, s, a, c, h, d, p, v = [],
                            g = e.length,
                            m = 0,
                            y = R,
                            w = A;
                        for (r = e.lastIndexOf(x), r < 0 && (r = 0), n = 0; n < r; ++n) e.charCodeAt(n) >= 128 && o("not-basic"), v.push(e.charCodeAt(n));
                        for (i = r > 0 ? r + 1 : 0; i < g;) {
                            for (s = m, a = 1, c = k; i >= g && o("invalid-input"), h = f(e.charCodeAt(i++)), (h >= k || h > L((_ - m) / a)) && o("overflow"), m += h * a, d = c <= w ? T : c >= w + O ? O : c - w, !(h < d); c += k) p = k - d, a > L(_ / p) && o("overflow"), a *= p;
                            t = v.length + 1, w = l(m - s, t, 0 == s), L(m / t) > _ - y && o("overflow"), y += L(m / t), m %= t, v.splice(m++, 0, y)
                        }
                        return u(v)
                    }

                    function p(e) {
                        var t, r, n, i, s, a, u, f, d, p, v, g, m, y, w, b = [];
                        for (e = c(e), g = e.length, t = R, r = 0, s = A, a = 0; a < g; ++a) v = e[a], v < 128 && b.push(B(v));
                        for (n = i = b.length, i && b.push(x); n < g;) {
                            for (u = _, a = 0; a < g; ++a) v = e[a], v >= t && v < u && (u = v);
                            for (m = n + 1, u - t > L((_ - r) / m) && o("overflow"), r += (u - t) * m, t = u, a = 0; a < g; ++a)
                                if (v = e[a], v < t && ++r > _ && o("overflow"), v == t) {
                                    for (f = r, d = k; p = d <= s ? T : d >= s + O ? O : d - s, !(f < p); d += k) w = f - p, y = k - p, b.push(B(h(p + w % y, 0))), f = L(w / y);
                                    b.push(B(h(f, 0))), s = l(r, m, n == i), r = 0, ++n
                                }++r, ++t
                        }
                        return b.join("")
                    }

                    function v(e) {
                        return a(e, function(e) {
                            return S.test(e) ? d(e.slice(4).toLowerCase()) : e
                        })
                    }

                    function g(e) {
                        return a(e, function(e) {
                            return C.test(e) ? "xn--" + p(e) : e
                        })
                    }
                    var m = "object" == typeof n && n && !n.nodeType && n,
                        y = "object" == typeof r && r && !r.nodeType && r,
                        w = "object" == typeof t && t;
                    w.global !== w && w.window !== w && w.self !== w || (i = w);
                    var b, E, _ = 2147483647,
                        k = 36,
                        T = 1,
                        O = 26,
                        j = 38,
                        P = 700,
                        A = 72,
                        R = 128,
                        x = "-",
                        S = /^xn--/,
                        C = /[^\x20-\x7E]/,
                        U = /[\x2E\u3002\uFF0E\uFF61]/g,
                        I = {
                            overflow: "Overflow: input needs wider integers to process",
                            "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                            "invalid-input": "Invalid input"
                        },
                        M = k - T,
                        L = Math.floor,
                        B = String.fromCharCode;
                    if (b = {
                            version: "1.3.2",
                            ucs2: {
                                decode: c,
                                encode: u
                            },
                            decode: d,
                            encode: p,
                            toASCII: g,
                            toUnicode: v
                        }, "function" == typeof e && "object" == typeof e.amd && e.amd) e("punycode", function() {
                        return b
                    });
                    else if (m && y)
                        if (r.exports == m) y.exports = b;
                        else
                            for (E in b) b.hasOwnProperty(E) && (m[E] = b[E]);
                    else i.punycode = b
                }(this)
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        19: [function(e, t, r) {
            "use strict";

            function n(e, t) {
                return Object.prototype.hasOwnProperty.call(e, t)
            }
            t.exports = function(e, t, r, o) {
                t = t || "&", r = r || "=";
                var s = {};
                if ("string" != typeof e || 0 === e.length) return s;
                var a = /\+/g;
                e = e.split(t);
                var c = 1e3;
                o && "number" == typeof o.maxKeys && (c = o.maxKeys);
                var u = e.length;
                c > 0 && u > c && (u = c);
                for (var f = 0; f < u; ++f) {
                    var h, l, d, p, v = e[f].replace(a, "%20"),
                        g = v.indexOf(r);
                    g >= 0 ? (h = v.substr(0, g), l = v.substr(g + 1)) : (h = v, l = ""), d = decodeURIComponent(h), p = decodeURIComponent(l), n(s, d) ? i(s[d]) ? s[d].push(p) : s[d] = [s[d], p] : s[d] = p
                }
                return s
            };
            var i = Array.isArray || function(e) {
                return "[object Array]" === Object.prototype.toString.call(e)
            }
        }, {}],
        20: [function(e, t, r) {
            "use strict";

            function n(e, t) {
                if (e.map) return e.map(t);
                for (var r = [], n = 0; n < e.length; n++) r.push(t(e[n], n));
                return r
            }
            var i = function(e) {
                switch (typeof e) {
                    case "string":
                        return e;
                    case "boolean":
                        return e ? "true" : "false";
                    case "number":
                        return isFinite(e) ? e : "";
                    default:
                        return ""
                }
            };
            t.exports = function(e, t, r, a) {
                return t = t || "&", r = r || "=", null === e && (e = void 0), "object" == typeof e ? n(s(e), function(s) {
                    var a = encodeURIComponent(i(s)) + r;
                    return o(e[s]) ? n(e[s], function(e) {
                        return a + encodeURIComponent(i(e))
                    }).join(t) : a + encodeURIComponent(i(e[s]))
                }).join(t) : a ? encodeURIComponent(i(a)) + r + encodeURIComponent(i(e)) : ""
            };
            var o = Array.isArray || function(e) {
                    return "[object Array]" === Object.prototype.toString.call(e)
                },
                s = Object.keys || function(e) {
                    var t = [];
                    for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.push(r);
                    return t
                }
        }, {}],
        21: [function(e, t, r) {
            "use strict";
            r.decode = r.parse = e("./decode"), r.encode = r.stringify = e("./encode")
        }, {
            "./decode": 19,
            "./encode": 20
        }],
        22: [function(e, t, r) {
            (function(t) {
                var n = e("./lib/request"),
                    i = e("xtend"),
                    o = e("builtin-status-codes"),
                    s = e("url"),
                    a = r;
                a.request = function(e, r) {
                    e = "string" == typeof e ? s.parse(e) : i(e);
                    var o = t.location.protocol.search(/^https?:$/) === -1 ? "http:" : "",
                        a = e.protocol || o,
                        c = e.hostname || e.host,
                        u = e.port,
                        f = e.path || "/";
                    c && c.indexOf(":") !== -1 && (c = "[" + c + "]"), e.url = (c ? a + "//" + c : "") + (u ? ":" + u : "") + f, e.method = (e.method || "GET").toUpperCase(), e.headers = e.headers || {};
                    var h = new n(e);
                    return r && h.on("response", r), h
                }, a.get = function(e, t) {
                    var r = a.request(e, t);
                    return r.end(), r
                }, a.Agent = function() {}, a.Agent.defaultMaxSockets = 4, a.STATUS_CODES = o, a.METHODS = ["CHECKOUT", "CONNECT", "COPY", "DELETE", "GET", "HEAD", "LOCK", "M-SEARCH", "MERGE", "MKACTIVITY", "MKCOL", "MOVE", "NOTIFY", "OPTIONS", "PATCH", "POST", "PROPFIND", "PROPPATCH", "PURGE", "PUT", "REPORT", "SEARCH", "SUBSCRIBE", "TRACE", "UNLOCK", "UNSUBSCRIBE"]
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./lib/request": 24,
            "builtin-status-codes": 8,
            url: 3,
            xtend: 36
        }],
        23: [function(e, t, r) {
            (function(e) {
                function t(e) {
                    try {
                        return o.responseType = e, o.responseType === e
                    } catch (t) {}
                    return !1
                }

                function n(e) {
                    return "function" == typeof e
                }
                r.fetch = n(e.fetch) && n(e.ReadableStream), r.blobConstructor = !1;
                try {
                    new Blob([new ArrayBuffer(1)]), r.blobConstructor = !0
                } catch (i) {}
                var o = new e.XMLHttpRequest;
                o.open("GET", e.location.host ? "/" : "https://example.com");
                var s = "undefined" != typeof e.ArrayBuffer,
                    a = s && n(e.ArrayBuffer.prototype.slice);
                r.arraybuffer = s && t("arraybuffer"), r.msstream = !r.fetch && a && t("ms-stream"), r.mozchunkedarraybuffer = !r.fetch && s && t("moz-chunked-arraybuffer"), r.overrideMimeType = n(o.overrideMimeType), r.vbArray = n(e.VBArray), o = null
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        24: [function(e, t, r) {
            (function(r, n, i) {
                function o(e, t) {
                    return a.fetch && t ? "fetch" : a.mozchunkedarraybuffer ? "moz-chunked-arraybuffer" : a.msstream ? "ms-stream" : a.arraybuffer && e ? "arraybuffer" : a.vbArray && e ? "text:vbarray" : "text"
                }

                function s(e) {
                    try {
                        var t = e.status;
                        return null !== t && 0 !== t
                    } catch (r) {
                        return !1
                    }
                }
                var a = e("./capability"),
                    c = e("inherits"),
                    u = e("./response"),
                    f = e("readable-stream"),
                    h = e("to-arraybuffer"),
                    l = u.IncomingMessage,
                    d = u.readyStates,
                    p = t.exports = function(e) {
                        var t = this;
                        f.Writable.call(t), t._opts = e, t._body = [], t._headers = {}, e.auth && t.setHeader("Authorization", "Basic " + new i(e.auth).toString("base64")), Object.keys(e.headers).forEach(function(r) {
                            t.setHeader(r, e.headers[r])
                        });
                        var r, n = !0;
                        if ("disable-fetch" === e.mode) n = !1, r = !0;
                        else if ("prefer-streaming" === e.mode) r = !1;
                        else if ("allow-wrong-content-type" === e.mode) r = !a.overrideMimeType;
                        else {
                            if (e.mode && "default" !== e.mode && "prefer-fast" !== e.mode) throw new Error("Invalid value for opts.mode");
                            r = !0
                        }
                        t._mode = o(r, n), t.on("finish", function() {
                            t._onFinish()
                        })
                    };
                c(p, f.Writable), p.prototype.setHeader = function(e, t) {
                    var r = this,
                        n = e.toLowerCase();
                    v.indexOf(n) === -1 && (r._headers[n] = {
                        name: e,
                        value: t
                    })
                }, p.prototype.getHeader = function(e) {
                    var t = this;
                    return t._headers[e.toLowerCase()].value
                }, p.prototype.removeHeader = function(e) {
                    var t = this;
                    delete t._headers[e.toLowerCase()]
                }, p.prototype._onFinish = function() {
                    var e = this;
                    if (!e._destroyed) {
                        var t, o = e._opts,
                            s = e._headers;
                        if ("POST" !== o.method && "PUT" !== o.method && "PATCH" !== o.method || (t = a.blobConstructor ? new n.Blob(e._body.map(function(e) {
                                return h(e)
                            }), {
                                type: (s["content-type"] || {}).value || ""
                            }) : i.concat(e._body).toString()), "fetch" === e._mode) {
                            var c = Object.keys(s).map(function(e) {
                                return [s[e].name, s[e].value]
                            });
                            n.fetch(e._opts.url, {
                                method: e._opts.method,
                                headers: c,
                                body: t,
                                mode: "cors",
                                credentials: o.withCredentials ? "include" : "same-origin"
                            }).then(function(t) {
                                e._fetchResponse = t, e._connect()
                            }, function(t) {
                                e.emit("error", t)
                            })
                        } else {
                            var u = e._xhr = new n.XMLHttpRequest;
                            try {
                                u.open(e._opts.method, e._opts.url, !0)
                            } catch (f) {
                                return void r.nextTick(function() {
                                    e.emit("error", f)
                                })
                            }
                            "responseType" in u && (u.responseType = e._mode.split(":")[0]), "withCredentials" in u && (u.withCredentials = !!o.withCredentials), "text" === e._mode && "overrideMimeType" in u && u.overrideMimeType("text/plain; charset=x-user-defined"), Object.keys(s).forEach(function(e) {
                                u.setRequestHeader(s[e].name, s[e].value)
                            }), e._response = null, u.onreadystatechange = function() {
                                switch (u.readyState) {
                                    case d.LOADING:
                                    case d.DONE:
                                        e._onXHRProgress()
                                }
                            }, "moz-chunked-arraybuffer" === e._mode && (u.onprogress = function() {
                                e._onXHRProgress()
                            }), u.onerror = function() {
                                e._destroyed || e.emit("error", new Error("XHR error"))
                            };
                            try {
                                u.send(t)
                            } catch (f) {
                                return void r.nextTick(function() {
                                    e.emit("error", f)
                                })
                            }
                        }
                    }
                }, p.prototype._onXHRProgress = function() {
                    var e = this;
                    s(e._xhr) && !e._destroyed && (e._response || e._connect(), e._response._onXHRProgress())
                }, p.prototype._connect = function() {
                    var e = this;
                    e._destroyed || (e._response = new l(e._xhr, e._fetchResponse, e._mode), e.emit("response", e._response))
                }, p.prototype._write = function(e, t, r) {
                    var n = this;
                    n._body.push(e), r()
                }, p.prototype.abort = p.prototype.destroy = function() {
                    var e = this;
                    e._destroyed = !0, e._response && (e._response._destroyed = !0), e._xhr && e._xhr.abort()
                }, p.prototype.end = function(e, t, r) {
                    var n = this;
                    "function" == typeof e && (r = e, e = void 0), f.Writable.prototype.end.call(n, e, t, r)
                }, p.prototype.flushHeaders = function() {}, p.prototype.setTimeout = function() {}, p.prototype.setNoDelay = function() {}, p.prototype.setSocketKeepAlive = function() {};
                var v = ["accept-charset", "accept-encoding", "access-control-request-headers", "access-control-request-method", "connection", "content-length", "cookie", "cookie2", "date", "dnt", "expect", "host", "keep-alive", "origin", "referer", "te", "trailer", "transfer-encoding", "upgrade", "user-agent", "via"]
            }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("buffer").Buffer)
        }, {
            "./capability": 23,
            "./response": 25,
            _process: 17,
            buffer: 6,
            inherits: 13,
            "readable-stream": 32,
            "to-arraybuffer": 34
        }],
        25: [function(e, t, r) {
            (function(t, n, i) {
                var o = e("./capability"),
                    s = e("inherits"),
                    a = e("readable-stream"),
                    c = r.readyStates = {
                        UNSENT: 0,
                        OPENED: 1,
                        HEADERS_RECEIVED: 2,
                        LOADING: 3,
                        DONE: 4
                    },
                    u = r.IncomingMessage = function(e, r, n) {
                        function s() {
                            l.read().then(function(e) {
                                if (!c._destroyed) {
                                    if (e.done) return void c.push(null);
                                    c.push(new i(e.value)), s()
                                }
                            })
                        }
                        var c = this;
                        if (a.Readable.call(c), c._mode = n, c.headers = {}, c.rawHeaders = [], c.trailers = {}, c.rawTrailers = [], c.on("end", function() {
                                t.nextTick(function() {
                                    c.emit("close")
                                })
                            }), "fetch" === n) {
                            c._fetchResponse = r, c.url = r.url, c.statusCode = r.status, c.statusMessage = r.statusText;
                            for (var u, f, h = r.headers[Symbol.iterator](); u = (f = h.next()).value, !f.done;) c.headers[u[0].toLowerCase()] = u[1], c.rawHeaders.push(u[0], u[1]);
                            var l = r.body.getReader();
                            s()
                        } else {
                            c._xhr = e, c._pos = 0, c.url = e.responseURL, c.statusCode = e.status, c.statusMessage = e.statusText;
                            var d = e.getAllResponseHeaders().split(/\r?\n/);
                            if (d.forEach(function(e) {
                                    var t = e.match(/^([^:]+):\s*(.*)/);
                                    if (t) {
                                        var r = t[1].toLowerCase();
                                        "set-cookie" === r ? (void 0 === c.headers[r] && (c.headers[r] = []), c.headers[r].push(t[2])) : void 0 !== c.headers[r] ? c.headers[r] += ", " + t[2] : c.headers[r] = t[2], c.rawHeaders.push(t[1], t[2])
                                    }
                                }), c._charset = "x-user-defined", !o.overrideMimeType) {
                                var p = c.rawHeaders["mime-type"];
                                if (p) {
                                    var v = p.match(/;\s*charset=([^;])(;|$)/);
                                    v && (c._charset = v[1].toLowerCase())
                                }
                                c._charset || (c._charset = "utf-8")
                            }
                        }
                    };
                s(u, a.Readable), u.prototype._read = function() {}, u.prototype._onXHRProgress = function() {
                    var e = this,
                        t = e._xhr,
                        r = null;
                    switch (e._mode) {
                        case "text:vbarray":
                            if (t.readyState !== c.DONE) break;
                            try {
                                r = new n.VBArray(t.responseBody).toArray()
                            } catch (o) {}
                            if (null !== r) {
                                e.push(new i(r));
                                break
                            }
                        case "text":
                            try {
                                r = t.responseText
                            } catch (o) {
                                e._mode = "text:vbarray";
                                break
                            }
                            if (r.length > e._pos) {
                                var s = r.substr(e._pos);
                                if ("x-user-defined" === e._charset) {
                                    for (var a = new i(s.length), u = 0; u < s.length; u++) a[u] = 255 & s.charCodeAt(u);
                                    e.push(a)
                                } else e.push(s, e._charset);
                                e._pos = r.length
                            }
                            break;
                        case "arraybuffer":
                            if (t.readyState !== c.DONE || !t.response) break;
                            r = t.response, e.push(new i(new Uint8Array(r)));
                            break;
                        case "moz-chunked-arraybuffer":
                            if (r = t.response, t.readyState !== c.LOADING || !r) break;
                            e.push(new i(new Uint8Array(r)));
                            break;
                        case "ms-stream":
                            if (r = t.response, t.readyState !== c.LOADING) break;
                            var f = new n.MSStreamReader;
                            f.onprogress = function() {
                                f.result.byteLength > e._pos && (e.push(new i(new Uint8Array(f.result.slice(e._pos)))), e._pos = f.result.byteLength)
                            }, f.onload = function() {
                                e.push(null)
                            }, f.readAsArrayBuffer(r)
                    }
                    e._xhr.readyState === c.DONE && "ms-stream" !== e._mode && e.push(null)
                }
            }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("buffer").Buffer)
        }, {
            "./capability": 23,
            _process: 17,
            buffer: 6,
            inherits: 13,
            "readable-stream": 32
        }],
        26: [function(e, t, r) {
            "use strict";

            function n(e) {
                return this instanceof n ? (u.call(this, e), f.call(this, e), e && e.readable === !1 && (this.readable = !1), e && e.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, e && e.allowHalfOpen === !1 && (this.allowHalfOpen = !1), void this.once("end", i)) : new n(e)
            }

            function i() {
                this.allowHalfOpen || this._writableState.ended || a(o, this)
            }

            function o(e) {
                e.end()
            }
            var s = Object.keys || function(e) {
                var t = [];
                for (var r in e) t.push(r);
                return t
            };
            t.exports = n;
            var a = e("process-nextick-args"),
                c = e("core-util-is");
            c.inherits = e("inherits");
            var u = e("./_stream_readable"),
                f = e("./_stream_writable");
            c.inherits(n, u);
            for (var h = s(f.prototype), l = 0; l < h.length; l++) {
                var d = h[l];
                n.prototype[d] || (n.prototype[d] = f.prototype[d])
            }
        }, {
            "./_stream_readable": 28,
            "./_stream_writable": 30,
            "core-util-is": 9,
            inherits: 13,
            "process-nextick-args": 16
        }],
        27: [function(e, t, r) {
            "use strict";

            function n(e) {
                return this instanceof n ? void i.call(this, e) : new n(e)
            }
            t.exports = n;
            var i = e("./_stream_transform"),
                o = e("core-util-is");
            o.inherits = e("inherits"), o.inherits(n, i), n.prototype._transform = function(e, t, r) {
                r(null, e)
            }
        }, {
            "./_stream_transform": 29,
            "core-util-is": 9,
            inherits: 13
        }],
        28: [function(e, t, r) {
            (function(r) {
                "use strict";

                function n(e, t, r) {
                    return "function" == typeof e.prependListener ? e.prependListener(t, r) : void(e._events && e._events[t] ? x(e._events[t]) ? e._events[t].unshift(r) : e._events[t] = [r, e._events[t]] : e.on(t, r))
                }

                function i(t, r) {
                    q = q || e("./_stream_duplex"), t = t || {}, this.objectMode = !!t.objectMode, r instanceof q && (this.objectMode = this.objectMode || !!t.readableObjectMode);
                    var n = t.highWaterMark,
                        i = this.objectMode ? 16 : 16384;
                    this.highWaterMark = n || 0 === n ? n : i, this.highWaterMark = ~~this.highWaterMark, this.buffer = new D, this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.defaultEncoding = t.defaultEncoding || "utf8", this.ranOut = !1, this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, t.encoding && (N || (N = e("string_decoder/").StringDecoder), this.decoder = new N(t.encoding), this.encoding = t.encoding)
                }

                function o(t) {
                    return q = q || e("./_stream_duplex"), this instanceof o ? (this._readableState = new i(t, this), this.readable = !0, t && "function" == typeof t.read && (this._read = t.read), void S.call(this)) : new o(t)
                }

                function s(e, t, r, n, i) {
                    var o = f(t, r);
                    if (o) e.emit("error", o);
                    else if (null === r) t.reading = !1, h(e, t);
                    else if (t.objectMode || r && r.length > 0)
                        if (t.ended && !i) {
                            var s = new Error("stream.push() after EOF");
                            e.emit("error", s)
                        } else if (t.endEmitted && i) {
                        var c = new Error("stream.unshift() after end event");
                        e.emit("error", c)
                    } else {
                        var u;
                        !t.decoder || i || n || (r = t.decoder.write(r), u = !t.objectMode && 0 === r.length), i || (t.reading = !1), u || (t.flowing && 0 === t.length && !t.sync ? (e.emit("data", r), e.read(0)) : (t.length += t.objectMode ? 1 : r.length, i ? t.buffer.unshift(r) : t.buffer.push(r), t.needReadable && l(e))), p(e, t)
                    } else i || (t.reading = !1);
                    return a(t)
                }

                function a(e) {
                    return !e.ended && (e.needReadable || e.length < e.highWaterMark || 0 === e.length)
                }

                function c(e) {
                    return e >= H ? e = H : (e--, e |= e >>> 1, e |= e >>> 2, e |= e >>> 4, e |= e >>> 8, e |= e >>> 16, e++), e
                }

                function u(e, t) {
                    return e <= 0 || 0 === t.length && t.ended ? 0 : t.objectMode ? 1 : e !== e ? t.flowing && t.length ? t.buffer.head.data.length : t.length : (e > t.highWaterMark && (t.highWaterMark = c(e)), e <= t.length ? e : t.ended ? t.length : (t.needReadable = !0, 0))
                }

                function f(e, t) {
                    var r = null;
                    return U.isBuffer(t) || "string" == typeof t || null === t || void 0 === t || e.objectMode || (r = new TypeError("Invalid non-string/buffer chunk")), r
                }

                function h(e, t) {
                    if (!t.ended) {
                        if (t.decoder) {
                            var r = t.decoder.end();
                            r && r.length && (t.buffer.push(r), t.length += t.objectMode ? 1 : r.length)
                        }
                        t.ended = !0, l(e)
                    }
                }

                function l(e) {
                    var t = e._readableState;
                    t.needReadable = !1, t.emittedReadable || (B("emitReadable", t.flowing), t.emittedReadable = !0, t.sync ? R(d, e) : d(e))
                }

                function d(e) {
                    B("emit readable"), e.emit("readable"), b(e)
                }

                function p(e, t) {
                    t.readingMore || (t.readingMore = !0, R(v, e, t))
                }

                function v(e, t) {
                    for (var r = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (B("maybeReadMore read 0"), e.read(0), r !== t.length);) r = t.length;
                    t.readingMore = !1
                }

                function g(e) {
                    return function() {
                        var t = e._readableState;
                        B("pipeOnDrain", t.awaitDrain), t.awaitDrain && t.awaitDrain--, 0 === t.awaitDrain && C(e, "data") && (t.flowing = !0, b(e))
                    }
                }

                function m(e) {
                    B("readable nexttick read 0"), e.read(0)
                }

                function y(e, t) {
                    t.resumeScheduled || (t.resumeScheduled = !0, R(w, e, t))
                }

                function w(e, t) {
                    t.reading || (B("resume read 0"), e.read(0)), t.resumeScheduled = !1, t.awaitDrain = 0, e.emit("resume"), b(e), t.flowing && !t.reading && e.read(0)
                }

                function b(e) {
                    var t = e._readableState;
                    for (B("flow", t.flowing); t.flowing && null !== e.read(););
                }

                function E(e, t) {
                    if (0 === t.length) return null;
                    var r;
                    return t.objectMode ? r = t.buffer.shift() : !e || e >= t.length ? (r = t.decoder ? t.buffer.join("") : 1 === t.buffer.length ? t.buffer.head.data : t.buffer.concat(t.length), t.buffer.clear()) : r = _(e, t.buffer, t.decoder), r
                }

                function _(e, t, r) {
                    var n;
                    return e < t.head.data.length ? (n = t.head.data.slice(0, e), t.head.data = t.head.data.slice(e)) : n = e === t.head.data.length ? t.shift() : r ? k(e, t) : T(e, t), n
                }

                function k(e, t) {
                    var r = t.head,
                        n = 1,
                        i = r.data;
                    for (e -= i.length; r = r.next;) {
                        var o = r.data,
                            s = e > o.length ? o.length : e;
                        if (i += s === o.length ? o : o.slice(0, e), e -= s, 0 === e) {
                            s === o.length ? (++n, r.next ? t.head = r.next : t.head = t.tail = null) : (t.head = r, r.data = o.slice(s));
                            break
                        }++n
                    }
                    return t.length -= n, i
                }

                function T(e, t) {
                    var r = I.allocUnsafe(e),
                        n = t.head,
                        i = 1;
                    for (n.data.copy(r), e -= n.data.length; n = n.next;) {
                        var o = n.data,
                            s = e > o.length ? o.length : e;
                        if (o.copy(r, r.length - e, 0, s), e -= s, 0 === e) {
                            s === o.length ? (++i, n.next ? t.head = n.next : t.head = t.tail = null) : (t.head = n, n.data = o.slice(s));
                            break
                        }++i
                    }
                    return t.length -= i, r
                }

                function O(e) {
                    var t = e._readableState;
                    if (t.length > 0) throw new Error('"endReadable()" called on non-empty stream');
                    t.endEmitted || (t.ended = !0, R(j, t, e))
                }

                function j(e, t) {
                    e.endEmitted || 0 !== e.length || (e.endEmitted = !0, t.readable = !1, t.emit("end"))
                }

                function P(e, t) {
                    for (var r = 0, n = e.length; r < n; r++) t(e[r], r)
                }

                function A(e, t) {
                    for (var r = 0, n = e.length; r < n; r++)
                        if (e[r] === t) return r;
                    return -1
                }
                t.exports = o;
                var R = e("process-nextick-args"),
                    x = e("isarray");
                o.ReadableState = i;
                var S, C = (e("events").EventEmitter, function(e, t) {
                    return e.listeners(t).length
                });
                ! function() {
                    try {
                        S = e("stream")
                    } catch (t) {} finally {
                        S || (S = e("events").EventEmitter)
                    }
                }();
                var U = e("buffer").Buffer,
                    I = e("buffer-shims"),
                    M = e("core-util-is");
                M.inherits = e("inherits");
                var L = e("util"),
                    B = void 0;
                B = L && L.debuglog ? L.debuglog("stream") : function() {};
                var N, D = e("./internal/streams/BufferList");
                M.inherits(o, S);
                var q, q;
                o.prototype.push = function(e, t) {
                    var r = this._readableState;
                    return r.objectMode || "string" != typeof e || (t = t || r.defaultEncoding, t !== r.encoding && (e = I.from(e, t), t = "")), s(this, r, e, t, !1)
                }, o.prototype.unshift = function(e) {
                    var t = this._readableState;
                    return s(this, t, e, "", !0)
                }, o.prototype.isPaused = function() {
                    return this._readableState.flowing === !1
                }, o.prototype.setEncoding = function(t) {
                    return N || (N = e("string_decoder/").StringDecoder), this._readableState.decoder = new N(t), this._readableState.encoding = t, this
                };
                var H = 8388608;
                o.prototype.read = function(e) {
                    B("read", e), e = parseInt(e, 10);
                    var t = this._readableState,
                        r = e;
                    if (0 !== e && (t.emittedReadable = !1), 0 === e && t.needReadable && (t.length >= t.highWaterMark || t.ended)) return B("read: emitReadable", t.length, t.ended), 0 === t.length && t.ended ? O(this) : l(this), null;
                    if (e = u(e, t), 0 === e && t.ended) return 0 === t.length && O(this), null;
                    var n = t.needReadable;
                    B("need readable", n), (0 === t.length || t.length - e < t.highWaterMark) && (n = !0, B("length less than watermark", n)), t.ended || t.reading ? (n = !1, B("reading or ended", n)) : n && (B("do read"), t.reading = !0, t.sync = !0, 0 === t.length && (t.needReadable = !0), this._read(t.highWaterMark), t.sync = !1, t.reading || (e = u(r, t)));
                    var i;
                    return i = e > 0 ? E(e, t) : null, null === i ? (t.needReadable = !0, e = 0) : t.length -= e, 0 === t.length && (t.ended || (t.needReadable = !0), r !== e && t.ended && O(this)), null !== i && this.emit("data", i), i
                }, o.prototype._read = function(e) {
                    this.emit("error", new Error("not implemented"))
                }, o.prototype.pipe = function(e, t) {
                    function i(e) {
                        B("onunpipe"), e === l && s()
                    }

                    function o() {
                        B("onend"), e.end()
                    }

                    function s() {
                        B("cleanup"), e.removeListener("close", u), e.removeListener("finish", f), e.removeListener("drain", m), e.removeListener("error", c), e.removeListener("unpipe", i), l.removeListener("end", o), l.removeListener("end", s), l.removeListener("data", a), y = !0, !d.awaitDrain || e._writableState && !e._writableState.needDrain || m()
                    }

                    function a(t) {
                        B("ondata"), w = !1;
                        var r = e.write(t);
                        !1 !== r || w || ((1 === d.pipesCount && d.pipes === e || d.pipesCount > 1 && A(d.pipes, e) !== -1) && !y && (B("false write response, pause", l._readableState.awaitDrain), l._readableState.awaitDrain++, w = !0), l.pause())
                    }

                    function c(t) {
                        B("onerror", t), h(), e.removeListener("error", c), 0 === C(e, "error") && e.emit("error", t)
                    }

                    function u() {
                        e.removeListener("finish", f), h()
                    }

                    function f() {
                        B("onfinish"), e.removeListener("close", u), h()
                    }

                    function h() {
                        B("unpipe"), l.unpipe(e)
                    }
                    var l = this,
                        d = this._readableState;
                    switch (d.pipesCount) {
                        case 0:
                            d.pipes = e;
                            break;
                        case 1:
                            d.pipes = [d.pipes, e];
                            break;
                        default:
                            d.pipes.push(e)
                    }
                    d.pipesCount += 1, B("pipe count=%d opts=%j", d.pipesCount, t);
                    var p = (!t || t.end !== !1) && e !== r.stdout && e !== r.stderr,
                        v = p ? o : s;
                    d.endEmitted ? R(v) : l.once("end", v), e.on("unpipe", i);
                    var m = g(l);
                    e.on("drain", m);
                    var y = !1,
                        w = !1;
                    return l.on("data", a), n(e, "error", c), e.once("close", u), e.once("finish", f), e.emit("pipe", l), d.flowing || (B("pipe resume"), l.resume()), e
                }, o.prototype.unpipe = function(e) {
                    var t = this._readableState;
                    if (0 === t.pipesCount) return this;
                    if (1 === t.pipesCount) return e && e !== t.pipes ? this : (e || (e = t.pipes), t.pipes = null, t.pipesCount = 0, t.flowing = !1, e && e.emit("unpipe", this), this);
                    if (!e) {
                        var r = t.pipes,
                            n = t.pipesCount;
                        t.pipes = null, t.pipesCount = 0, t.flowing = !1;
                        for (var i = 0; i < n; i++) r[i].emit("unpipe", this);
                        return this
                    }
                    var o = A(t.pipes, e);
                    return o === -1 ? this : (t.pipes.splice(o, 1), t.pipesCount -= 1, 1 === t.pipesCount && (t.pipes = t.pipes[0]), e.emit("unpipe", this), this)
                }, o.prototype.on = function(e, t) {
                    var r = S.prototype.on.call(this, e, t);
                    if ("data" === e) this._readableState.flowing !== !1 && this.resume();
                    else if ("readable" === e) {
                        var n = this._readableState;
                        n.endEmitted || n.readableListening || (n.readableListening = n.needReadable = !0, n.emittedReadable = !1, n.reading ? n.length && l(this, n) : R(m, this))
                    }
                    return r
                }, o.prototype.addListener = o.prototype.on, o.prototype.resume = function() {
                    var e = this._readableState;
                    return e.flowing || (B("resume"), e.flowing = !0, y(this, e)), this
                }, o.prototype.pause = function() {
                    return B("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (B("pause"), this._readableState.flowing = !1, this.emit("pause")), this
                }, o.prototype.wrap = function(e) {
                    var t = this._readableState,
                        r = !1,
                        n = this;
                    e.on("end", function() {
                        if (B("wrapped end"), t.decoder && !t.ended) {
                            var e = t.decoder.end();
                            e && e.length && n.push(e)
                        }
                        n.push(null)
                    }), e.on("data", function(i) {
                        if (B("wrapped data"), t.decoder && (i = t.decoder.write(i)), (!t.objectMode || null !== i && void 0 !== i) && (t.objectMode || i && i.length)) {
                            var o = n.push(i);
                            o || (r = !0, e.pause())
                        }
                    });
                    for (var i in e) void 0 === this[i] && "function" == typeof e[i] && (this[i] = function(t) {
                        return function() {
                            return e[t].apply(e, arguments)
                        }
                    }(i));
                    var o = ["error", "close", "destroy", "pause", "resume"];
                    return P(o, function(t) {
                        e.on(t, n.emit.bind(n, t))
                    }), n._read = function(t) {
                        B("wrapped _read", t), r && (r = !1, e.resume())
                    }, n
                }, o._fromList = E
            }).call(this, e("_process"))
        }, {
            "./_stream_duplex": 26,
            "./internal/streams/BufferList": 31,
            _process: 17,
            buffer: 6,
            "buffer-shims": 5,
            "core-util-is": 9,
            events: 10,
            inherits: 13,
            isarray: 15,
            "process-nextick-args": 16,
            "string_decoder/": 33,
            util: 2
        }],
        29: [function(e, t, r) {
            "use strict";

            function n(e) {
                this.afterTransform = function(t, r) {
                    return i(e, t, r)
                }, this.needTransform = !1, this.transforming = !1, this.writecb = null, this.writechunk = null, this.writeencoding = null
            }

            function i(e, t, r) {
                var n = e._transformState;
                n.transforming = !1;
                var i = n.writecb;
                if (!i) return e.emit("error", new Error("no writecb in Transform class"));
                n.writechunk = null, n.writecb = null, null !== r && void 0 !== r && e.push(r), i(t);
                var o = e._readableState;
                o.reading = !1, (o.needReadable || o.length < o.highWaterMark) && e._read(o.highWaterMark)
            }

            function o(e) {
                if (!(this instanceof o)) return new o(e);
                a.call(this, e), this._transformState = new n(this);
                var t = this;
                this._readableState.needReadable = !0, this._readableState.sync = !1, e && ("function" == typeof e.transform && (this._transform = e.transform), "function" == typeof e.flush && (this._flush = e.flush)), this.once("prefinish", function() {
                    "function" == typeof this._flush ? this._flush(function(e) {
                        s(t, e)
                    }) : s(t)
                })
            }

            function s(e, t) {
                if (t) return e.emit("error", t);
                var r = e._writableState,
                    n = e._transformState;
                if (r.length) throw new Error("Calling transform done when ws.length != 0");
                if (n.transforming) throw new Error("Calling transform done when still transforming");
                return e.push(null)
            }
            t.exports = o;
            var a = e("./_stream_duplex"),
                c = e("core-util-is");
            c.inherits = e("inherits"), c.inherits(o, a), o.prototype.push = function(e, t) {
                return this._transformState.needTransform = !1, a.prototype.push.call(this, e, t)
            }, o.prototype._transform = function(e, t, r) {
                throw new Error("Not implemented")
            }, o.prototype._write = function(e, t, r) {
                var n = this._transformState;
                if (n.writecb = r, n.writechunk = e, n.writeencoding = t, !n.transforming) {
                    var i = this._readableState;
                    (n.needTransform || i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark)
                }
            }, o.prototype._read = function(e) {
                var t = this._transformState;
                null !== t.writechunk && t.writecb && !t.transforming ? (t.transforming = !0, this._transform(t.writechunk, t.writeencoding, t.afterTransform)) : t.needTransform = !0
            }
        }, {
            "./_stream_duplex": 26,
            "core-util-is": 9,
            inherits: 13
        }],
        30: [function(e, t, r) {
            (function(r) {
                "use strict";

                function n() {}

                function i(e, t, r) {
                    this.chunk = e, this.encoding = t, this.callback = r, this.next = null
                }

                function o(t, r) {
                    x = x || e("./_stream_duplex"), t = t || {}, this.objectMode = !!t.objectMode, r instanceof x && (this.objectMode = this.objectMode || !!t.writableObjectMode);
                    var n = t.highWaterMark,
                        i = this.objectMode ? 16 : 16384;
                    this.highWaterMark = n || 0 === n ? n : i, this.highWaterMark = ~~this.highWaterMark, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1;
                    var o = t.decodeStrings === !1;
                    this.decodeStrings = !o, this.defaultEncoding = t.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(e) {
                        p(r, e)
                    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new _(this)
                }

                function s(t) {
                    return x = x || e("./_stream_duplex"), this instanceof s || this instanceof x ? (this._writableState = new o(t, this), this.writable = !0, t && ("function" == typeof t.write && (this._write = t.write), "function" == typeof t.writev && (this._writev = t.writev)), void j.call(this)) : new s(t)
                }

                function a(e, t) {
                    var r = new Error("write after end");
                    e.emit("error", r), k(t, r)
                }

                function c(e, t, r, n) {
                    var i = !0,
                        o = !1;
                    return null === r ? o = new TypeError("May not write null values to stream") : A.isBuffer(r) || "string" == typeof r || void 0 === r || t.objectMode || (o = new TypeError("Invalid non-string/buffer chunk")), o && (e.emit("error", o), k(n, o), i = !1), i
                }

                function u(e, t, r) {
                    return e.objectMode || e.decodeStrings === !1 || "string" != typeof t || (t = R.from(t, r)), t
                }

                function f(e, t, r, n, o) {
                    r = u(t, r, n), A.isBuffer(r) && (n = "buffer");
                    var s = t.objectMode ? 1 : r.length;
                    t.length += s;
                    var a = t.length < t.highWaterMark;
                    if (a || (t.needDrain = !0), t.writing || t.corked) {
                        var c = t.lastBufferedRequest;
                        t.lastBufferedRequest = new i(r, n, o), c ? c.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest, t.bufferedRequestCount += 1
                    } else h(e, t, !1, s, r, n, o);
                    return a
                }

                function h(e, t, r, n, i, o, s) {
                    t.writelen = n, t.writecb = s, t.writing = !0, t.sync = !0, r ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite), t.sync = !1
                }

                function l(e, t, r, n, i) {
                    --t.pendingcb, r ? k(i, n) : i(n), e._writableState.errorEmitted = !0, e.emit("error", n)
                }

                function d(e) {
                    e.writing = !1, e.writecb = null, e.length -= e.writelen, e.writelen = 0
                }

                function p(e, t) {
                    var r = e._writableState,
                        n = r.sync,
                        i = r.writecb;
                    if (d(r), t) l(e, r, n, t, i);
                    else {
                        var o = y(r);
                        o || r.corked || r.bufferProcessing || !r.bufferedRequest || m(e, r), n ? T(v, e, r, o, i) : v(e, r, o, i)
                    }
                }

                function v(e, t, r, n) {
                    r || g(e, t), t.pendingcb--, n(), b(e, t)
                }

                function g(e, t) {
                    0 === t.length && t.needDrain && (t.needDrain = !1, e.emit("drain"))
                }

                function m(e, t) {
                    t.bufferProcessing = !0;
                    var r = t.bufferedRequest;
                    if (e._writev && r && r.next) {
                        var n = t.bufferedRequestCount,
                            i = new Array(n),
                            o = t.corkedRequestsFree;
                        o.entry = r;
                        for (var s = 0; r;) i[s] = r, r = r.next, s += 1;
                        h(e, t, !0, t.length, i, "", o.finish), t.pendingcb++, t.lastBufferedRequest = null, o.next ? (t.corkedRequestsFree = o.next, o.next = null) : t.corkedRequestsFree = new _(t)
                    } else {
                        for (; r;) {
                            var a = r.chunk,
                                c = r.encoding,
                                u = r.callback,
                                f = t.objectMode ? 1 : a.length;
                            if (h(e, t, !1, f, a, c, u), r = r.next, t.writing) break
                        }
                        null === r && (t.lastBufferedRequest = null)
                    }
                    t.bufferedRequestCount = 0, t.bufferedRequest = r, t.bufferProcessing = !1
                }

                function y(e) {
                    return e.ending && 0 === e.length && null === e.bufferedRequest && !e.finished && !e.writing
                }

                function w(e, t) {
                    t.prefinished || (t.prefinished = !0, e.emit("prefinish"))
                }

                function b(e, t) {
                    var r = y(t);
                    return r && (0 === t.pendingcb ? (w(e, t), t.finished = !0, e.emit("finish")) : w(e, t)), r
                }

                function E(e, t, r) {
                    t.ending = !0, b(e, t), r && (t.finished ? k(r) : e.once("finish", r)), t.ended = !0, e.writable = !1
                }

                function _(e) {
                    var t = this;
                    this.next = null, this.entry = null, this.finish = function(r) {
                        var n = t.entry;
                        for (t.entry = null; n;) {
                            var i = n.callback;
                            e.pendingcb--, i(r), n = n.next
                        }
                        e.corkedRequestsFree ? e.corkedRequestsFree.next = t : e.corkedRequestsFree = t
                    }
                }
                t.exports = s;
                var k = e("process-nextick-args"),
                    T = !r.browser && ["v0.10", "v0.9."].indexOf(r.version.slice(0, 5)) > -1 ? setImmediate : k;
                s.WritableState = o;
                var O = e("core-util-is");
                O.inherits = e("inherits");
                var j, P = {
                    deprecate: e("util-deprecate")
                };
                ! function() {
                    try {
                        j = e("stream")
                    } catch (t) {} finally {
                        j || (j = e("events").EventEmitter)
                    }
                }();
                var A = e("buffer").Buffer,
                    R = e("buffer-shims");
                O.inherits(s, j);
                var x;
                o.prototype.getBuffer = function() {
                        for (var e = this.bufferedRequest, t = []; e;) t.push(e), e = e.next;
                        return t
                    },
                    function() {
                        try {
                            Object.defineProperty(o.prototype, "buffer", {
                                get: P.deprecate(function() {
                                    return this.getBuffer()
                                }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.")
                            })
                        } catch (e) {}
                    }();
                var x;
                s.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe, not readable"))
                }, s.prototype.write = function(e, t, r) {
                    var i = this._writableState,
                        o = !1;
                    return "function" == typeof t && (r = t, t = null), A.isBuffer(e) ? t = "buffer" : t || (t = i.defaultEncoding), "function" != typeof r && (r = n), i.ended ? a(this, r) : c(this, i, e, r) && (i.pendingcb++, o = f(this, i, e, t, r)), o
                }, s.prototype.cork = function() {
                    var e = this._writableState;
                    e.corked++
                }, s.prototype.uncork = function() {
                    var e = this._writableState;
                    e.corked && (e.corked--, e.writing || e.corked || e.finished || e.bufferProcessing || !e.bufferedRequest || m(this, e))
                }, s.prototype.setDefaultEncoding = function(e) {
                    if ("string" == typeof e && (e = e.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + e);
                    return this._writableState.defaultEncoding = e, this
                }, s.prototype._write = function(e, t, r) {
                    r(new Error("not implemented"))
                }, s.prototype._writev = null, s.prototype.end = function(e, t, r) {
                    var n = this._writableState;
                    "function" == typeof e ? (r = e, e = null, t = null) : "function" == typeof t && (r = t, t = null), null !== e && void 0 !== e && this.write(e, t), n.corked && (n.corked = 1, this.uncork()), n.ending || n.finished || E(this, n, r)
                }
            }).call(this, e("_process"))
        }, {
            "./_stream_duplex": 26,
            _process: 17,
            buffer: 6,
            "buffer-shims": 5,
            "core-util-is": 9,
            events: 10,
            inherits: 13,
            "process-nextick-args": 16,
            "util-deprecate": 35
        }],
        31: [function(e, t, r) {
            "use strict";

            function n() {
                this.head = null, this.tail = null, this.length = 0
            }
            var i = (e("buffer").Buffer, e("buffer-shims"));
            t.exports = n, n.prototype.push = function(e) {
                var t = {
                    data: e,
                    next: null
                };
                this.length > 0 ? this.tail.next = t : this.head = t, this.tail = t, ++this.length
            }, n.prototype.unshift = function(e) {
                var t = {
                    data: e,
                    next: this.head
                };
                0 === this.length && (this.tail = t), this.head = t, ++this.length
            }, n.prototype.shift = function() {
                if (0 !== this.length) {
                    var e = this.head.data;
                    return 1 === this.length ? this.head = this.tail = null : this.head = this.head.next, --this.length, e
                }
            }, n.prototype.clear = function() {
                this.head = this.tail = null, this.length = 0
            }, n.prototype.join = function(e) {
                if (0 === this.length) return "";
                for (var t = this.head, r = "" + t.data; t = t.next;) r += e + t.data;
                return r
            }, n.prototype.concat = function(e) {
                if (0 === this.length) return i.alloc(0);
                if (1 === this.length) return this.head.data;
                for (var t = i.allocUnsafe(e >>> 0), r = this.head, n = 0; r;) r.data.copy(t, n), n += r.data.length, r = r.next;
                return t
            }
        }, {
            buffer: 6,
            "buffer-shims": 5
        }],
        32: [function(e, t, r) {
            (function(n) {
                var i = function() {
                    try {
                        return e("stream")
                    } catch (t) {}
                }();
                r = t.exports = e("./lib/_stream_readable.js"), r.Stream = i || r, r.Readable = r, r.Writable = e("./lib/_stream_writable.js"), r.Duplex = e("./lib/_stream_duplex.js"), r.Transform = e("./lib/_stream_transform.js"), r.PassThrough = e("./lib/_stream_passthrough.js"), !n.browser && "disable" === n.env.READABLE_STREAM && i && (t.exports = i)
            }).call(this, e("_process"))
        }, {
            "./lib/_stream_duplex.js": 26,
            "./lib/_stream_passthrough.js": 27,
            "./lib/_stream_readable.js": 28,
            "./lib/_stream_transform.js": 29,
            "./lib/_stream_writable.js": 30,
            _process: 17
        }],
        33: [function(e, t, r) {
            function n(e) {
                if (e && !c(e)) throw new Error("Unknown encoding: " + e)
            }

            function i(e) {
                return e.toString(this.encoding)
            }

            function o(e) {
                this.charReceived = e.length % 2, this.charLength = this.charReceived ? 2 : 0
            }

            function s(e) {
                this.charReceived = e.length % 3, this.charLength = this.charReceived ? 3 : 0
            }
            var a = e("buffer").Buffer,
                c = a.isEncoding || function(e) {
                    switch (e && e.toLowerCase()) {
                        case "hex":
                        case "utf8":
                        case "utf-8":
                        case "ascii":
                        case "binary":
                        case "base64":
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                        case "raw":
                            return !0;
                        default:
                            return !1
                    }
                },
                u = r.StringDecoder = function(e) {
                    switch (this.encoding = (e || "utf8").toLowerCase().replace(/[-_]/, ""), n(e), this.encoding) {
                        case "utf8":
                            this.surrogateSize = 3;
                            break;
                        case "ucs2":
                        case "utf16le":
                            this.surrogateSize = 2, this.detectIncompleteChar = o;
                            break;
                        case "base64":
                            this.surrogateSize = 3, this.detectIncompleteChar = s;
                            break;
                        default:
                            return void(this.write = i)
                    }
                    this.charBuffer = new a(6), this.charReceived = 0, this.charLength = 0
                };
            u.prototype.write = function(e) {
                for (var t = ""; this.charLength;) {
                    var r = e.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : e.length;
                    if (e.copy(this.charBuffer, this.charReceived, 0, r), this.charReceived += r, this.charReceived < this.charLength) return "";
                    e = e.slice(r, e.length), t = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
                    var n = t.charCodeAt(t.length - 1);
                    if (!(n >= 55296 && n <= 56319)) {
                        if (this.charReceived = this.charLength = 0, 0 === e.length) return t;
                        break
                    }
                    this.charLength += this.surrogateSize, t = ""
                }
                this.detectIncompleteChar(e);
                var i = e.length;
                this.charLength && (e.copy(this.charBuffer, 0, e.length - this.charReceived, i), i -= this.charReceived), t += e.toString(this.encoding, 0, i);
                var i = t.length - 1,
                    n = t.charCodeAt(i);
                if (n >= 55296 && n <= 56319) {
                    var o = this.surrogateSize;
                    return this.charLength += o, this.charReceived += o, this.charBuffer.copy(this.charBuffer, o, 0, o), e.copy(this.charBuffer, 0, 0, o), t.substring(0, i)
                }
                return t
            }, u.prototype.detectIncompleteChar = function(e) {
                for (var t = e.length >= 3 ? 3 : e.length; t > 0; t--) {
                    var r = e[e.length - t];
                    if (1 == t && r >> 5 == 6) {
                        this.charLength = 2;
                        break
                    }
                    if (t <= 2 && r >> 4 == 14) {
                        this.charLength = 3;
                        break
                    }
                    if (t <= 3 && r >> 3 == 30) {
                        this.charLength = 4;
                        break
                    }
                }
                this.charReceived = t
            }, u.prototype.end = function(e) {
                var t = "";
                if (e && e.length && (t = this.write(e)), this.charReceived) {
                    var r = this.charReceived,
                        n = this.charBuffer,
                        i = this.encoding;
                    t += n.slice(0, r).toString(i)
                }
                return t
            }
        }, {
            buffer: 6
        }],
        34: [function(e, t, r) {
            var n = e("buffer").Buffer;
            t.exports = function(e) {
                if (e instanceof Uint8Array) {
                    if (0 === e.byteOffset && e.byteLength === e.buffer.byteLength) return e.buffer;
                    if ("function" == typeof e.buffer.slice) return e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength)
                }
                if (n.isBuffer(e)) {
                    for (var t = new Uint8Array(e.length), r = e.length, i = 0; i < r; i++) t[i] = e[i];
                    return t.buffer
                }
                throw new Error("Argument must be a Buffer")
            }
        }, {
            buffer: 6
        }],
        35: [function(e, t, r) {
            (function(e) {
                function r(e, t) {
                    function r() {
                        if (!i) {
                            if (n("throwDeprecation")) throw new Error(t);
                            n("traceDeprecation"), i = !0
                        }
                        return e.apply(this, arguments)
                    }
                    if (n("noDeprecation")) return e;
                    var i = !1;
                    return r
                }

                function n(t) {
                    try {
                        if (!e.localStorage) return !1
                    } catch (r) {
                        return !1
                    }
                    var n = e.localStorage[t];
                    return null != n && "true" === String(n).toLowerCase()
                }
                t.exports = r
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        36: [function(e, t, r) {
            function n() {
                for (var e = {}, t = 0; t < arguments.length; t++) {
                    var r = arguments[t];
                    for (var n in r) i.call(r, n) && (e[n] = r[n])
                }
                return e
            }
            t.exports = n;
            var i = Object.prototype.hasOwnProperty
        }, {}],
        37: [function(e, t, r) {
            "use strict";

            function n(e, t) {
                function r(e) {
                    i.verbose("create user from json {0}", JSON.stringify(e));
                    try {
                        if (void 0 !== e) {
                            if (void 0 === e.reference) throw new Error("provided json will not match ecm service model");
                            if ("USER" !== e.type) throw new Error("no user object received");
                            h = e.reference.id || h, l = e.reference.objectId, n = e.reference.self, s = e.name || e.fullName || s, a = e.shortName || a, c = e.description || c, f = e.distinguishedName || f, u = e.emailAddress || u, v = e.technicalUser || v, g = e.synchronizedUser || g, p = e.locked || p, d = e.deleted || d
                        }
                    } catch (t) {
                        throw i.error("merge error for user: {0}", t), t
                    }
                }
                if (!e) throw new Error("serviceConnection is not set");
                o.validateServiceConnection(e);
                var n, s, a, c, u, f, h = "",
                    l = "",
                    d = !1,
                    p = !1,
                    v = !1,
                    g = !1;
                this.serviceConnection = e;
                void 0 !== t && r(t), this.merge = r, Object.defineProperty(this, "id", {
                    get: function() {
                        return l
                    }
                }), Object.defineProperty(this, "saperionId", {
                    get: function() {
                        return h
                    }
                }), Object.defineProperty(this, "referenceUrl", {
                    get: function() {
                        return n
                    }
                }), Object.defineProperty(this, "fullName", {
                    get: function() {
                        return s
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        s = e
                    }
                }), Object.defineProperty(this, "shortName", {
                    get: function() {
                        return a
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        a = e
                    }
                }), Object.defineProperty(this, "distinguishedName", {
                    get: function() {
                        return f
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        f = e
                    }
                }), Object.defineProperty(this, "description", {
                    get: function() {
                        return c
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        c = e
                    }
                }), Object.defineProperty(this, "email", {
                    get: function() {
                        return u
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        u = e
                    }
                }), Object.defineProperty(this, "isTechnicalUser", {
                    get: function() {
                        return v
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        v = e
                    }
                }), Object.defineProperty(this, "isSynchronizedUser", {
                    get: function() {
                        return g
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        g = e
                    }
                }), Object.defineProperty(this, "isDeleted", {
                    get: function() {
                        return d
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        d = e
                    }
                }), Object.defineProperty(this, "isLocked", {
                    get: function() {
                        return p
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        p = e
                    }
                }), Object.defineProperty(this, "isReduced", {
                    get: function() {
                        return void 0 === a && void 0 === u
                    }
                })
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../communication/httpHelper"),
                s = (e("./../internal/utilities"), e("./../common/pageInfo"));
            n.prototype.toServiceActorReference = function() {
                return {
                    id: this.id,
                    type: "USER"
                }
            }, n.prototype["delete"] = function() {
                throw Error("not implemented")
            }, n.prototype.toString = function() {
                var e = this.fullName;
                return e += this.isReduced ? " - reduced -" : " (" + this.shortName + ")"
            }, n.prototype.refresh = function() {
                var e = "User.refresh",
                    t = this;
                return new Promise(function(r, n) {
                    try {
                        i.info(e), o.getJson(t.serviceConnection, t.referenceUrl).then(function(o) {
                            try {
                                i.verbose("received user: {0}", o), t.merge(o), r(t)
                            } catch (s) {
                                i.error(e, s), n(s)
                            }
                        }, function(t) {
                            i.error(e, t), n(t)
                        })
                    } catch (s) {
                        i.error(e, s), n(s)
                    }
                })
            }, n.getUsers = function(e, t, r, a) {
                var c = "User.getUsers";
                return void 0 === t && (t = 1), new Promise(function(u, f) {
                    try {
                        i.info(c), o.getJson(e, o.endpoints.management.users.all + (a || ""), t).then(function(t) {
                            try {
                                if (!t.items) return i.verbose("received data: {0}", JSON.stringify(t)), void f(new Error("no items collection received"));
                                var o = [],
                                    a = [];
                                t.items.forEach(function(t) {
                                    var i = new n(e, t);
                                    a.push(i), r && o.push(i.refresh())
                                }), Promise.all(o).then(function(e) {
                                    u({
                                        data: a,
                                        pageInfo: new s(t)
                                    })
                                }, function(e) {
                                    i.error(c, e), f(e)
                                })
                            } catch (h) {
                                i.error(c, h), f(h)
                            }
                        }, function(e) {
                            i.error(c, e), f(e)
                        })
                    } catch (h) {
                        i.error(c, h), f(h)
                    }
                })
            }, n.getUserByName = function(e, t) {
                var r = "User.getUserByName";
                return new Promise(function(s, a) {
                    try {
                        i.info(r), o.getJson(e, o.endpoints.management.users.byShortName.replace("{userName}", t)).then(function(t) {
                            try {
                                i.verbose("received user: {0}", t), "USER" !== t.type && a(new Error("no user object received"));
                                var r = new n(e, t);
                                s(r)
                            } catch (o) {
                                i.error(o), a(o)
                            }
                        }, function(e) {
                            i.error(r, e), a(e)
                        })
                    } catch (c) {
                        i.error(r, c), a(c)
                    }
                })
            }, n.getUserById = function(e, t) {
                var r = "User.getUserById";
                return new Promise(function(s, a) {
                    try {
                        i.info(r), o.getJson(e, o.endpoints.management.users.byId.replace("{id}", t)).then(function(t) {
                            try {
                                i.verbose("received user: {0}", t), "USER" !== t.type && a(new Error("no user object received"));
                                var o = new n(e, t);
                                s(o)
                            } catch (c) {
                                i.error(r, c), a(c)
                            }
                        }, function(e) {
                            i.error(r, e), a(e)
                        })
                    } catch (c) {
                        i.error(r, c), a(c)
                    }
                })
            }, t.exports = n
        }, {
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53
        }],
        38: [function(e, t, r) {
            "use strict";

            function n(e) {
                if (!e) throw new Error("serviceConnection is not set");
                Object.defineProperty(this, "serviceConnection", {
                    get: function() {
                        return e
                    }
                })
            }
            var i = e("./user");
            n.prototype.getAllUsers = function(e) {
                return i.getUsers(this.serviceConnection, e, !1)
            }, n.prototype.getAllUsersDetailed = function(e) {
                return i.getUsers(this.serviceConnection, e, !0)
            }, n.prototype.getUserById = function(e) {
                return i.getUserById(this.serviceConnection, e)
            }, n.prototype.getUserByName = function(e) {
                return i.getUserByName(this.serviceConnection, e)
            }, n.prototype.getUserByShortName = function(e) {
                return i.getUserByShortName(this.serviceConnection, e)
            }, n.prototype.createUser = function() {
                return new i(this.serviceConnection)
            }, t.exports = n
        }, {
            "./user": 37
        }],
        39: [function(e, t, r) {
            "use strict";

            function n(e, t) {
                if (void 0 === e) throw new Error("missing connection parameter");
                this.serviceConnection = e;
                var r = "",
                    n = "",
                    i = "",
                    o = "",
                    s = "";
                void 0 !== t && (r = t.id || r, n = t.objectId || n, i = t.self || i, o = t.type || o, s = t.name || s, void 0 !== t.reference && (r = t.reference.id || r, n = t.reference.objectId || n, o = t.reference.type || o)), Object.defineProperty(this, "id", {
                    get: function() {
                        return r
                    }
                }), Object.defineProperty(this, "objectId", {
                    get: function() {
                        return n
                    }
                }), Object.defineProperty(this, "type", {
                    get: function() {
                        return o
                    }
                }), Object.defineProperty(this, "name", {
                    get: function() {
                        return s
                    }
                })
            }
            var i = e("./../administration/user");
            n.prototype.isUser = function() {
                return "USER" === this.type
            }, n.prototype.isGroup = function() {
                return "GROUP" === this.type
            }, n.prototype.getDetails = function() {
                return this.isUser ? i.getUserById(this.serviceConnection, this.id) : new Promise(function(e, t) {
                    this.isGroup() ? e({
                        name: "administrators",
                        isMocked: !0
                    }) : t("unsupported owner type " + this.type)
                })
            }, n.prototype.toServiceActorReference = function() {
                return {
                    id: this.id,
                    type: this.type
                }
            }, t.exports = n
        }, {
            "./../administration/user": 37
        }],
        40: [function(e, t, r) {
            "use strict";

            function n(e) {
                var t = 1,
                    r = 0,
                    n = !1;
                if (void 0 !== e) {
                    if (t = e.number || t, void 0 !== e.pageDefinition) {
                        r = e.pageDefinition.pageSize || r;
                        var i = e.pageDefinition.offset || 0;
                        r > 0 && (t = Math.round(i / r) + 1)
                    }
                    n = e.hasMoreItems || n
                }
                Object.defineProperty(this, "page", {
                    get: function() {
                        return t
                    }
                }), Object.defineProperty(this, "pageSize", {
                    get: function() {
                        return r
                    }
                }), Object.defineProperty(this, "hasMoreItems", {
                    get: function() {
                        return n
                    }
                })
            }
            t.exports = n
        }, {}],
        41: [function(e, t, r) {
            "use strict";

            function n(e) {
                if (void 0 === e) throw new Error("unable to create instance of AuthenticationToken without json");
                if (void 0 === e.token) throw new Error("service token is invalid. token part is missing.");
                var t = e.expiresAt || new Date,
                    r = e.refreshAt || new Date;
                e.expiresIn && (t = new Date, t.setSeconds(t.getSeconds() + e.expiresIn), r.setSeconds(r.getSeconds() + .75 * e.expiresIn)), Object.defineProperty(this, "token", {
                    get: function() {
                        return e.token
                    }
                }), Object.defineProperty(this, "expiresAt", {
                    get: function() {
                        return t
                    }
                }), Object.defineProperty(this, "refreshAt", {
                    get: function() {
                        return r
                    }
                }), Object.defineProperty(this, "isExpired", {
                    get: function() {
                        return t < Date.now
                    }
                }), Object.defineProperty(this, "needsRefresh", {
                    get: function() {
                        return r < Date.now
                    }
                })
            }
            e("./../internal/logManager.js");
            n.prototype.serialize = function() {
                var e = {
                    token: this.token,
                    expiresAt: this.expiresAt,
                    refreshAt: this.refreshAt
                };
                return JSON.stringify(e)
            }, n.prototype.toJson = function() {
                return this.serialize()
            }, n.deserialize = function(e) {
                var t = JSON.parse(e);
                return new n(t)
            }, t.exports = n
        }, {
            "./../internal/logManager.js": 52
        }],
        42: [function(e, t, r) {
            "use strict";

            function n(e, t, r, s, c) {
                if (!e) throw new Error("parameter authServiceUrl is missing");
                if (!t) throw new Error("parameter user is missing");
                if (!r) throw new Error("parameter pass is missing");
                c || (c = "SYSTEM"), s || (s = "index");
                var u = 0;
                if (void 0 !== Number.isInteger && Number.isInteger(s) && (u = s), 0 === u) switch (s) {
                    case "admin":
                    case "3":
                        u = 3;
                        break;
                    case "query":
                    case "2":
                        u = 2;
                        break;
                    case "index":
                    case "1":
                        u = 1
                }
                if (u < 1 || u > 3) throw new Error('invalid license. "' + s + '" is not allowed. Please use one of these: \n' + JSON.stringify(n.licenses, null, 2));
                var f, h = "Basic " + o.toBase64(t + ":" + r);
                Object.defineProperty(this, "authServiceUrl", {
                    get: function() {
                        return e
                    }
                }), Object.defineProperty(this, "_innerAuthProvider", {
                    get: function() {
                        return f
                    }
                }), this._applyNewToken = function(t) {
                    i.info("CredentialAuthProvider._applyNewToken"), f = new a(e, t)
                }, this.applyAuthentication = function(e) {
                    void 0 !== f ? f.applyAuthentication(e) : (i.info("CredentialAuthProvider.applyAuthentication"), e.setHeader("Authorization", h), e.setHeader("X-ECM-LicenseType", u), e.setHeader("X-ECM-Tenant", c))
                }
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../internal/utilities"),
                s = e("./authenticationToken"),
                a = e("./tokenAuthProvider"),
                c = (e("./../administration/user"), e("./httpHelper"));
            n.licenses = {
                admin: 3,
                query: 2,
                index: 1
            }, Object.freeze(n.licenses), n.prototype.getToken = function() {
                if (i.info("CredentialAuthProvider.getToken"), void 0 !== this._innerAuthProvider) return this._innerAuthProvider.getToken();
                var e = this;
                return new Promise(function(t, r) {
                    try {
                        c.executeHttpCall(e.authServiceUrl, c.endpoints.auth.token.generate, "GET", null, !1, e.applyAuthentication).then(function(n) {
                            try {
                                n.token && n.expiresIn || r(new Error("no token received, login failed"));
                                var o = new s(n);
                                e._applyNewToken(o), t(o)
                            } catch (a) {
                                i.error(a), r(a)
                            }
                        }, function(e) {
                            i.error(e), r(e)
                        })
                    } catch (n) {
                        i.error(n), r(n)
                    }
                })
            }, n.prototype.validateToken = function() {
                if (i.info("CredentialAuthProvider.validateToken"), void 0 !== this._innerAuthProvider) return this._innerAuthProvider.validateToken();
                throw new Error("please execute getToken() before checking the validity.")
            }, t.exports = n
        }, {
            "./../administration/user": 37,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53,
            "./authenticationToken": 41,
            "./httpHelper": 44,
            "./tokenAuthProvider": 46
        }],
        43: [function(e, t, r) {
            var r = {},
                n = "api/",
                i = "api/";
            r.auth = {}, r.auth.token = {}, r.auth.token.generate = i + "token", r.auth.token.renew = i + "token/renewed", r.auth.token.validate = i + "token/validity", r.management = {}, r.management.users = {}, r.management.users.all = n + "management/users", r.management.users.create = n + "management/users", r.management.users.byId = n + "management/users/{id}", r.management.users.byName = n + "management/users/named/{userName}", r.management.users.byShortName = n + "management/users?query=WHERE%20displayName%20EQ%20%22{userName}%22", r.workflow = {}, r.workflow.inboxes = {}, r.workflow.inboxes.all = n + "workflow/inboxes/", r.workflow.inboxes.tasks = n + "workflow/inboxes/{inbox}/items", r.workflow.task = {}, r.workflow.task.details = n + "workflow/tasks/{task}", r.workflow.task.transitions = n + "workflow/tasks/{task}/transitions", r.workflow.task.index = n + "workflow/tasks/{task}/index", r.workflow.task.comments = n + "workflow/tasks/{task}/comments", r.workflow.task.takeOwnership = n + "workflow/tasks/{task}/ownership/acquire", r.workflow.task.revokeOwnership = n + "workflow/tasks/{task}/ownership/revoke", r.workflow.task.forward = n + "workflow/tasks/{task}/forward", r.workflow.process = n + "workflow/tasks/{task}", r.content = {}, r.content.archives = {}, r.content.archives.all = n + "archives", r.content.archives.documents = {}, r.content.archives.documents.all = n + "archive/documents/{archive}/content", r.content.document = {}, r.content.document.details = n + "documents/{document}", r.content.document.revision = n + "documents/revisions/{revision}", r.content.document.element = n + "documents/revisions/{revision}/element/{element}", Object.freeze(r), t.exports = r
        }, {}],
        44: [function(e, t, r) {
            (function(r) {
                "use strict";

                function n() {
                    return Math.floor(899999 * Math.random() + 1e5).toString()
                }
                var i, o = e("../internal/logManager"),
                    s = e("./endpoints"),
                    a = e("http"),
                    c = e("https"),
                    u = e("url"),
                    f = function(e) {
                        var t = [];
                        if (!e) return [];
                        for (var r = 0, n = 1, i = 0; i < e.length; i++) {
                            var o = e[i].split(": ");
                            t[o[r].trim()] = o[n].trim()
                        }
                        return t
                    },
                    h = function(e) {
                        if (!e.serviceUrl) throw new Error("serviceConnection.serviceUrl is not defined");
                        if (!e._applyAuthentication) throw new Error("serviceConnection does not support applyAuthentication")
                    },
                    l = function(e, t, s, h, l, d, p) {
                        s || (s = "GET");
                        var v = n();
                        return new Promise(function(n, g) {
                            try {
                                var m = u.parse(e + t);
                                o.verbose("{0} - prepare {1} request for {2}", v, s, m.href);
                                var y = {};
                                y.method = s, y.host = m.hostname, y.path = m.path, y.protocol = m.protocol, y.port = m.port, o.verbose("{0} create request with options: {1}", v, JSON.stringify(y)), i = "http:" === m.protocol ? a : c, l ? (o.verbose("{0} set accept header to application/octet-stream", v), y.Headers = {
                                    Accept: "application/octet-stream"
                                }) : (o.verbose("{0} set accept header to application/json", v), y.Headers = {
                                    Accept: "application/json"
                                });
                                var w = i.request(y, function(e) {
                                    void 0 === e.setEncoding || l || e.setEncoding("utf8"), o.verbose("{0} received response with status code {2} ({3}) for {1}", v, m.href, e.statusCode, e.statusMessage), o.verbose("{0} response headers {1}", v, JSON.stringify(e.headers, null, 2));
                                    var t = !0;
                                    switch (e.statusCode) {
                                        case 200:
                                        case 201:
                                        case 202:
                                        case 203:
                                        case 204:
                                        case 205:
                                        case 206:
                                        case 226:
                                            break;
                                        case 304:
                                            break;
                                        case 401:
                                            if (void 0 !== p) try {
                                                p(m.href)
                                            } catch (i) {
                                                o.error("{0} unauthorizedNotifier callback failed {1}", v, i)
                                            }
                                            t = !1, g("user is not authorized. try to relogin. ServerError: " + e.statusMessage + " (" + e.statusCode + ") at request " + v);
                                            break;
                                        default:
                                            t = !1;
                                            var s = f(e.headers)["x-ecms-error-message"] || "";
                                            g("http error " + e.statusMessage + " (" + e.statusCode + ") " + s + " at request " + v)
                                    }
                                    var a = [];
                                    e.on("data", function(e) {
                                        a.push(e)
                                    }), e.on("end", function() {
                                        if (o.verbose("{0} sending received data to caller", v), t) {
                                            var i, s = 0,
                                                c = "utf8";
                                            if (l && (c = "binary"), a.forEach(function(e) {
                                                    i = void 0 === i ? new r(e, c) : r.concat([i, new r(e, c)]), s += e.length
                                                }), l) {
                                                var u = "application/octet-stream";
                                                try {
                                                    var u = e.headers["content-type"]
                                                } catch (f) {
                                                    o.verbose("no content-type availible in response header")
                                                }
                                                var h = {
                                                    data: i,
                                                    dataInfo: {
                                                        contentType: u,
                                                        size: s,
                                                        binaryUrl: m.href
                                                    }
                                                };
                                                n(h)
                                            } else {
                                                var d = {};
                                                try {
                                                    void 0 !== i && (d = JSON.parse(i.toString()))
                                                } catch (p) {
                                                    throw new Error('json parsing failed for data: "' + d + '" at request ' + v + " with Error: " + p)
                                                }
                                                n(d)
                                            }
                                        }
                                    })
                                }).on("error", function(e) {
                                    var t = "problem with request " + v + " Message: " + e.message;
                                    o.error(t), g(new Error(t))
                                });
                                void 0 !== d && d instanceof Function ? d(w) : o.warn("{0} no authentication handler is available. no authentication applied", v), o.verbose("{0} request header {1}", v, y.Headers), null === h || "POST" !== s && "UPDATE" !== s && "PUT" !== s || (o.verbose("{0} write {1} bytes to service", v, h.length), l ? (w.setHeader("Content-Type", "application/octet-stream"), w.write(h)) : (w.setHeader("Content-Type", "application/json"), w.write(h, "utf8"))), o.info("{0} execute {1} request to {2}", v, w.method, w.path), w.end()
                            } catch (b) {
                                o.error(b), g(b)
                            }
                        })
                    },
                    d = function(e, t, r, n, i) {
                        return l(e.serviceUrl, t, r, n, i, e._applyAuthentication, e._unauthorizedCallback)
                    },
                    p = function(e, t) {
                        return d(e, t, "GET", null, !1)
                    },
                    v = function(e, t) {
                        return d(e, t, "GET", null, !0)
                    },
                    g = function(e, t, r) {
                        return d(e, t, "POST", JSON.stringify(r), !1)
                    },
                    m = function(e, t, r) {
                        return d(e, t, "POST", JSON.stringify(r), !0)
                    },
                    y = function(e, t, r) {
                        return d(e, t, "PUT", JSON.stringify(r), !1)
                    },
                    w = function(e, t) {
                        return d(e, t, "PUT", null, !1)
                    },
                    b = function(e) {
                        return encodeURIComponent(e)
                    },
                    E = function(e) {
                        return decodeURIComponent(e)
                    },
                    _ = function(e) {
                        return encodeURI(e)
                    },
                    k = function(e) {
                        return decodeURI(e)
                    },
                    w = function(e, t) {
                        return d(e, t, "PUT", null, !1)
                    };
                t.exports = {
                    validateServiceConnection: h,
                    executeHttpCall: l,
                    getJson: p,
                    getBinary: v,
                    postJson: g,
                    postBinary: m,
                    putJson: y,
                    startAction: w,
                    endpoints: s,
                    encodeUriComponent: b,
                    decodeUriComponent: E,
                    encodeUri: _,
                    decodeUri: k
                }
            }).call(this, e("buffer").Buffer)
        }, {
            "../internal/logManager": 52,
            "./endpoints": 43,
            buffer: 6,
            http: 22,
            https: 11,
            url: 3
        }],
        45: [function(e, t, r) {
            "use strict";

            function n(e, t, r) {
                if (!e) throw new Error("url is not set");
                if (!t) throw new Error("authProvider is not defined");
                if (!t.applyAuthentication) throw new Error("authProvider does not support applyAuthentication");
                Object.defineProperty(this, "serviceUrl", {
                    get: function() {
                        return e
                    }
                }), Object.defineProperty(this, "_authProvider", {
                    get: function() {
                        return t
                    }
                }), this._unauthorizedCallback = r, this._applyAuthentication = t.applyAuthentication
            }
            var i = e("./../internal/logManager"),
                o = e("./../administration/user");
            n.prototype.isServiceCompatible = function() {
                return !0
            }, n.prototype.login = function() {
                i.info("ServiceConnection.login");
                return this._authProvider.getToken()
            }, n.prototype.getCurrentUser = function() {
                var e = "ServiceConnection.getCurrentUser";
                i.info(e);
                var t = this;
                return new Promise(function(r, n) {
                    t._authProvider.validateToken().then(function(s) {
                        try {
                            i.verbose("using the following data to identify current user:", s), o.getUsers(t, 1, !0, "?query=WHERE%20displayName%20EQ%20%22{login}%22".replace("{login}", s.login)).then(function(e) {
                                var t;
                                1 === e.data.length && (t = e.data[0]), r(t)
                            }, function(t) {
                                i.error(e, t), n(t)
                            })
                        } catch (a) {
                            i.error(e, a), n(a)
                        }
                    }, function(t) {
                        i.error(e, t), n(t)
                    })
                })
            }, t.exports = n
        }, {
            "./../administration/user": 37,
            "./../internal/logManager": 52
        }],
        46: [function(e, t, r) {
            "use strict";

            function n(e, t) {
                if (!t) throw new Error("parameter token is missing");
                if (!e) throw new Error("parameter authServiceUrl is missing");
                var r, n;
                Object.defineProperty(this, "authServiceUrl", {
                    get: function() {
                        return e
                    }
                }), this._applyNewToken = function(e) {
                    if (i.info("TokenAuthProvider._applyNewToken"), e instanceof s) n = e;
                    else try {
                        n = s.deserialize(e)
                    } catch (t) {
                        n = new s({
                            token: e,
                            expiresIn: 60
                        })
                    }
                    r = "Bearer " + n.token
                }, this.applyAuthentication = function(e) {
                    i.info("TokenAuthProvider.applyAuthentication"), e.setHeader("Authorization", r)
                }, this._applyNewToken(t)
            }
            var i = e("./../internal/logManager.js"),
                o = e("./httpHelper"),
                s = e("./authenticationToken");
            n.prototype.getToken = function() {
                i.info("TokenAuthProvider.getToken");
                var e = this;
                return new Promise(function(t, r) {
                    try {
                        o.executeHttpCall(e.authServiceUrl, o.endpoints.auth.token.renew, "GET", null, !1, e.applyAuthentication).then(function(n) {
                            try {
                                n.token && n.expiresIn || r(new Error("no token received. login failed!"));
                                var o = new s(n);
                                e._applyNewToken(o), t(o)
                            } catch (a) {
                                i.error(a), r(a)
                            }
                        }, function(e) {
                            i.error(e), r(e)
                        })
                    } catch (n) {
                        i.error(n), r(n)
                    }
                })
            }, n.prototype.validateToken = function() {
                i.info("TokenAuthProvider.validateToken");
                var e = this;
                return new Promise(function(t, r) {
                    try {
                        o.executeHttpCall(e.authServiceUrl, o.endpoints.auth.token.validate, "GET", null, !1, e.applyAuthentication).then(function(e) {
                            try {
                                t({
                                    login: e.ecmsUser,
                                    tenant: e.ecmsTenant,
                                    license: e.ecmsLicense,
                                    loginBy: e.ecmsUserIdentification
                                })
                            } catch (n) {
                                i.error(n), r(n)
                            }
                        }, function(e) {
                            r(e)
                        })
                    } catch (n) {
                        i.error(n), r(n)
                    }
                })
            }, t.exports = n
        }, {
            "./../internal/logManager.js": 52,
            "./authenticationToken": 41,
            "./httpHelper": 44
        }],
        47: [function(e, t, r) {
            "use strict";

            function n(e, t) {
                function r(e) {
                    i.verbose("create archive from json {0}", e);
                    try {
                        if (void 0 !== e) {
                            if (void 0 === e.reference) throw new Error("provided json will not match ecm service model");
                            c = e.reference.objectId, u = e.reference.self, f = e.reference.contentType, n = e.reference.name, s = e.version || s, a = e.isolation || a
                        }
                    } catch (t) {
                        throw i.error("merge error for archive: {0}", t), t
                    }
                }
                if (!e) throw new Error("serviceConnection is not set");
                o.validateServiceConnection(e);
                var n, s, a, c = "",
                    u = "",
                    f = "";
                this.serviceConnection = e;
                void 0 !== t && r(t), this.merge = r, Object.defineProperty(this, "id", {
                    get: function() {
                        return c
                    }
                }), Object.defineProperty(this, "referenceUrl", {
                    get: function() {
                        return u
                    }
                }), Object.defineProperty(this, "name", {
                    get: function() {
                        return n
                    }
                }), Object.defineProperty(this, "contentType", {
                    get: function() {
                        return f
                    }
                }), Object.defineProperty(this, "version", {
                    get: function() {
                        return s
                    }
                }), Object.defineProperty(this, "isolation", {
                    get: function() {
                        return a
                    }
                })
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../communication/httpHelper"),
                s = (e("./../internal/utilities"), e("./../common/pageInfo")),
                a = e("./document");
            n.prototype.getDocuments = function(e, t) {
                return a.getDocumentsFromArchive(this, e, t)
            }, n.prototype.toString = function() {
                var e = this.name + " (ID " + this.id + " | contentType: " + this.contentType + "  | referenceUrl: " + this.referenceUrl + ")";
                return e
            }, n.getAllArchives = function(e, t) {
                return void 0 === t && (t = 1), i.verbose("getAllArchives"), new Promise(function(t, r) {
                    try {
                        o.getJson(e, o.endpoints.content.archives.all).then(function(o) {
                            try {
                                i.verbose("archives {0}", o), o.items || r(new Error("no items collection received"));
                                var a = [];
                                o.items.forEach(function(t) {
                                    var r = new n(e, t);
                                    r.contentType === n.contentTypes.DOCUMENT && a.push(r)
                                }), t({
                                    data: a,
                                    pageInfo: new s(o)
                                })
                            } catch (c) {
                                i.error(c), r(c)
                            }
                        }, function(e) {
                            i.error(e), r(e)
                        })
                    } catch (a) {
                        i.error(a), r(a)
                    }
                })
            }, n.contentTypes = {
                DOCUMENT: "DOCUMENT",
                LOOKUP: "LOOKUP",
                FOLDER: "FOLDER",
                UNKNOWN: "UNKNOWN"
            }, Object.freeze(n.contentTypes), t.exports = n
        }, {
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53,
            "./document": 50
        }],
        48: [function(e, t, r) {
            "use strict";

            function n(e, t, r, s) {
                function a(e) {
                    var t = "ContentElement.merge";
                    i.verbose(t, "create ContentElement from json {0}", JSON.stringify(e));
                    try {
                        if (void 0 !== e) {
                            if (f = c(e.element_type), f === n.elementTypes.UNKNOWN) throw i.error("merge JSON on ElementType not file or structure is not supported"), new Error("provided json will not match ecm service model: element_type not parseable");
                            if (void 0 === e.reference) throw new Error("provided json will not match ecm service model: reference not available");
                            if (u = e.reference.objectId, h = e.creationDate || h, l = e.variables || l, f === n.elementTypes.STRUCTURE) {
                                var r = e.children,
                                    o = T;
                                r.forEach(function(e) {
                                    i.verbose("found childElementJson {0}", e);
                                    var t = new n(o.serviceConnection, e, w, o);
                                    p.push(t)
                                })
                            } else if (f === n.elementTypes.FILE) {
                                if (v = e.annotations || v, void 0 === e.contentMetaData) throw new Error("provided json will not match ecm service model: contentMetaData not available");
                                g.alorithm = e.contentMetaData.hashAlgorithm || g.alorithm, g.value = e.contentMetaData.hash || g.value, m = e.contentMetaData.uncompressedSize, y = e.contentMetaData.compressedSize, b = e.fileName, E = e.picture, _ = e.chunkedOnMedium, k = e.originalFormat
                            } else f === n.elementTypes.LINK && i.info(t, "Handling for ContentElement LINK not yet handled")
                        }
                    } catch (s) {
                        throw i.error("merge error for Element: {0}", s), s
                    }
                }

                function c(e) {
                    return e === n.elementTypes.FILE ? n.elementTypes.FILE : e === n.elementTypes.STRUCTURE ? n.elementTypes.STRUCTURE : e === n.elementTypes.LINK ? n.elementTypes.LINK : n.elementTypes.UNKNOWN
                }
                if (!e) throw new Error("serviceConnection is not set");
                o.validateServiceConnection(e), this.serviceConnection = e;
                var u = "",
                    f = n.elementTypes.UNKNOWN,
                    h = "",
                    l = {},
                    d = {},
                    p = [],
                    v = [],
                    g = {};
                g.alorithm = "", g.value = "";
                var m, y, w, b = "",
                    E = !1,
                    _ = !1,
                    k = !1;
                void 0 !== r && (w = r), void 0 !== s && (d = s);
                var T = this;
                void 0 !== t && a(t), this.merge = a, Object.defineProperty(this, "id", {
                    get: function() {
                        return u
                    }
                }), Object.defineProperty(this, "document", {
                    get: function() {
                        return w
                    }
                }), Object.defineProperty(this, "elementType", {
                    get: function() {
                        return f
                    }
                }), Object.defineProperty(this, "isFile", {
                    get: function() {
                        return f === n.elementTypes.FILE
                    }
                }), Object.defineProperty(this, "isStructure", {
                    get: function() {
                        return f === n.elementTypes.STRUCTURE
                    }
                }), Object.defineProperty(this, "isLink", {
                    get: function() {
                        return f === n.elementTypes.LINK
                    }
                }), Object.defineProperty(this, "fileName", {
                    get: function() {
                        var e = b,
                            t = e.lastIndexOf("/");
                        return t >= 0 && (e = e.substring(t + 1)), t = e.lastIndexOf("\\"), t >= 0 && (e = e.substring(t + 1)), t = e.lastIndexOf("@"), t >= 0 && (e = e.substring(0, t)), e
                    }
                }), Object.defineProperty(this, "size", {
                    get: function() {
                        return m
                    }
                }), Object.defineProperty(this, "hasParent", {
                    get: function() {
                        return !(void 0 === d || void 0 === d.keys || 0 === d.keys.length)
                    }
                }), Object.defineProperty(this, "parent", {
                    get: function() {
                        return this.hasParent ? d : void 0
                    }
                }), Object.defineProperty(this, "hasChildren", {
                    get: function() {
                        return void 0 !== p && p.length > 0
                    }
                }), Object.defineProperty(this, "children", {
                    get: function() {
                        return this.hasChildren ? p : []
                    }
                }), Object.defineProperty(this, "childrenFilesList", {
                    get: function() {
                        var e = [];
                        return p.forEach(function(t) {
                            t.elementType === n.elementTypes.FILE && e.push(t), t.elementType === n.elementTypes.STRUCTURE && (e = e.concat(t.childrenFilesList))
                        }), e
                    }
                }), Object.defineProperty(this, "hash", {
                    get: function() {
                        return this.isFile ? g : void 0
                    }
                })
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../communication/httpHelper");
            e("./../internal/utilities"), e("./../common/pageInfo");
            n.prototype.toString = function() {
                return this.elementType === n.elementTypes.FILE ? "File: " + this.fileName + "(Size: " + this.size + " Bytes | ID: " + this.id + ")" : "Element: " + this.elementType + "( ID: " + this.id + ")"
            }, n.prototype.getBinary = function() {
                var e = "ContentElement.getBinary",
                    t = this;
                return new Promise(function(r, s) {
                    if (t.elementType !== n.elementTypes.FILE) return void s("get Binary not supported on element NOT file");
                    try {
                        i.info(e), o.getBinary(t.serviceConnection, o.endpoints.content.document.element.replace("{revision}", t.document.revisionId).replace("{element}", t.id)).then(function(t) {
                            try {
                                i.verbose(e, "received binary with length: {0}", t.length), t || s(new Error("no data received")), r(t)
                            } catch (n) {
                                i.error(e, n), s(n)
                            }
                        }, function(t) {
                            i.error(e, t), s(t)
                        })
                    } catch (a) {
                        i.error(e, a), s(a)
                    }
                })
            }, n.elementTypes = {
                FILE: "file",
                STRUCTURE: "structure",
                LINK: "link",
                UNKNOWN: "UNKNOWN"
            }, Object.freeze(n.elementTypes), t.exports = n
        }, {
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53
        }],
        49: [function(e, t, r) {
            "use strict";

            function n(e) {
                if (!e) throw new Error("serviceConnection is not set");
                i.validateServiceConnection(e), Object.defineProperty(this, "serviceConnection", {
                    get: function() {
                        return e
                    }
                })
            }
            var i = e("./../communication/httpHelper"),
                o = e("./archive"),
                s = e("./document");
            n.prototype.getArchives = function(e) {
                return o.getAllArchives(this.serviceConnection, e)
            }, n.prototype.getDocumentById = function(e) {
                return s.getDocumentById(this.serviceConnection, e)
            }, n.prototype.getDocumentByRevisionId = function(e) {
                return s.getDocumentByRevisionId(this.serviceConnection, e)
            }, n.prototype.getDocumentByUrl = function(e) {
                return s.getDocumentByUrl(this.serviceConnection, e)
            }, t.exports = n
        }, {
            "./../communication/httpHelper": 44,
            "./archive": 47,
            "./document": 50
        }],
        50: [function(e, t, r) {
            "use strict";

            function n(e, t, r) {
                function n(e) {
                    var t = "Document.merge";
                    i.verbose(t, "create document from json {0}", JSON.stringify(e));
                    try {
                        void 0 !== e && (void 0 !== e.reference ? (h = e.reference.objectId, f = e.reference.self) : f = e.self, void 0 !== e.documentId && (u = e.documentId.objectId), void 0 !== e.previousRevisionId && (l = e.previousRevisionId.objectId || u), void 0 !== e.archiveReference && void 0 === v, v = e.archiveReference, d = e.indexData || d, void 0 !== e.modificationMetaData && (g = e.modificationMetaData.creationDate, m = new c(b.serviceConnection, e.modificationMetaData.creationUser), y = e.modificationMetaData.lastModificationDate, w = new c(b.serviceConnection, e.modificationMetaData.lastModificationUser)), void 0 !== e.documentElement && (p = e.documentElement, s = new a(b.serviceConnection, e.documentElement, b)))
                        
                } catch (r) {
                        throw i.error(t, "merge error for document: {0}", r), r
                    }
                }
                if (!e) throw new Error("serviceConnection is not set");
                o.validateServiceConnection(e), this.serviceConnection = e;
                var s, u = "",
                    f = "",
                    h = "",
                    l = "",
                    d = {},
                    p = "",
                    v = {};
                void 0 !== r && (v = r);
                var g, m, y, w, b = this;
                void 0 !== t && n(t), this.merge = n, Object.defineProperty(this, "id", {
                    get: function() {
                        return u
                    }
                }), Object.defineProperty(this, "referenceUrl", {
                    get: function() {
                        return f
                    }
                }), Object.defineProperty(this, "revisionId", {
                    get: function() {
                        return h
                    }
                }), Object.defineProperty(this, "previousRevisionId", {
                    get: function() {
                        return l
                    }
                }), Object.defineProperty(this, "hasPreviousRevision", {
                    get: function() {
                        return void 0 !== l && l.length > 0
                    }
                }), Object.defineProperty(this, "indexData", {
                    get: function() {
                        return d
                    }
                }), Object.defineProperty(this, "creationDate", {
                    get: function() {
                        return new Date(g)
                    }
                }), Object.defineProperty(this, "creator", {
                    get: function() {
                        return m
                    }
                }), Object.defineProperty(this, "lastModificationDate", {
                    get: function() {
                        return new Date(y)
                    }
                }), Object.defineProperty(this, "lastModifier", {
                    get: function() {
                        return w
                    }
                }), Object.defineProperty(this, "archive", {
                    get: function() {
                        return v
                    }
                }), Object.defineProperty(this, "hasContent", {
                    get: function() {
                        return void 0 !== s
                    }
                }), Object.defineProperty(this, "content", {
                    get: function() {
                        return this.hasContent ? s : {}
                    }
                }), Object.defineProperty(this, "contentList", {
                    get: function() {
                        return this.hasContent ? this.content.elementType === a.elementTypes.FILE ? [this.content] : s.childrenFilesList : []
                    }
                }), Object.defineProperty(this, "isReduced", {
                    get: function() {
                        return this.hasContent === !1
                    }
                })
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../communication/httpHelper"),
                s = (e("./../internal/utilities"), e("./../common/pageInfo")),
                a = e("./contentElement"),
                c = e("./../common/actorReference");
            n.prototype.toString = function() {
                return "Document: (ID " + this.id + "  | from archive: " + this.archive.name + ")"
            }, n.prototype.refresh = function() {
                var e = "Document.refresh",
                    t = this;
                return new Promise(function(r, n) {
                    try {
                        i.info(e);
                        var s = t.referenceUrl;
                        void 0 !== s && 0 !== s.length || (i.error(e, "invalid url: " + s), n(new Error("Error on url information"))), o.getJson(t.serviceConnection, s).then(function(o) {
                            try {
                                i.verbose(e, "received document: {0}", JSON.stringify(o)), o || n(new Error("no json received")), t.merge(o), r(t)
                            } catch (s) {
                                i.error(e, s), n(s)
                            }
                        }, function(t) {
                            i.error(e, t), n(t)
                        })
                    } catch (a) {
                        i.error(e, a), n(a)
                    }
                })
            }, n.prototype.getPreviousRevision = function() {
                var e = "Document.getPreviousRevision";
                if (i.info(e), !this.hasPreviousRevision) throw i.info(e, "no previous revision available"), Error("no previous revision available");
                return n.getDocumentByRevisionId(this.previousRevisionId)
            }, n.getDocumentById = function(e, t) {
                var r = "Document.getDocumentById";
                i.info(r);
                var s = o.endpoints.content.document.details.replace("{document}", t);
                return n.getDocumentByUrl(e, s)
            }, n.getDocumentByRevisionId = function(e, t) {
                var r = "Document.getDocumentByRevisionId";
                i.info(r);
                var s = o.endpoints.content.document.revision.replace("{revision}", t);
                return n.getDocumentByUrl(e, s)
            }, n.getDocumentByUrl = function(e, t) {
                var r = "Document.getDocumentByObjectUrl";
                return new Promise(function(s, a) {
                    try {
                        i.info(r), void 0 !== t && 0 !== t.length || (i.error(r, "invalid url: " + t), a(new Error("Error on url"))), o.getJson(e, t).then(function(t) {
                            try {
                                i.verbose("received json: {0}", JSON.stringify(t)), t || a(new Error("no json received"));
                                var o = new n(e, t);
                                s(o)
                            } catch (c) {
                                i.error(r, c), a(c)
                            }
                        }, function(e) {
                            i.error(r, e), a(e)
                        })
                    } catch (c) {
                        i.error(r, c), a(c)
                    }
                })
            }, n.getDocumentsFromArchive = function(e, t, r) {
                var a = "Document.getDocumentsFromArchive";
                return void 0 === t && (t = 1), void 0 === r && (r = !1), new Promise(function(t, c) {
                    try {
                        i.info(a), o.getJson(e.serviceConnection, o.endpoints.content.archives.documents.all.replace("{archive}", o.encodeUriComponent(e.id))).then(function(o) {
                            try {
                                i.verbose(a, "received documents: {0}", JSON.stringify(o)), o.items || c(new Error("no items collection received"));
                                var u = [],
                                    f = [];
                                o.items.forEach(function(t) {
                                    var i = new n(e.serviceConnection, t, e);
                                    u.push(i), r && f.push(i.refresh())
                                }), Promise.all(f).then(function(e) {
                                    i.info(a, "all documents received"), t({
                                        data: u,
                                        pageInfo: new s(o)
                                    })
                                }, function(e) {
                                    i.error(a, e), c(e)
                                })
                            } catch (h) {
                                i.error(a, h), c(h)
                            }
                        }, function(e) {
                            i.error(a, e), c(e)
                        })
                    } catch (u) {
                        i.error(a, u), c(u)
                    }
                })
            }, t.exports = n
        }, {
            "./../common/actorReference": 39,
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53,
            "./contentElement": 48
        }],
        51: [function(e, t, r) {
            var n = e("./internal/logManager.js");
            n.setLogLevel(n.levels.Warn);
            var i = e("./internal/utilities");
            const o = "0.5.0";
            var s = s || {};
            s.utilities = s.utilities || {}, s.configuration = s.configuration || {}, s.configuration.logLevels = n.levels, s.configuration.setLogLevel = n.setLogLevel, s.CredentialAuthentication = e("./communication/credentialAuthProvider"), s.TokenAuthentication = e("./communication/tokenAuthProvider.js"), s.AuthenticationToken = e("./communication/authenticationToken"), s.ServiceConnection = e("./communication/serviceConnection"), s.WorkflowManager = e("./workflow/workflowManager"), s.ContentManager = e("./content/contentManager"), s.UserManager = e("./administration/userManager"), s.version = o, s.minServiceVersion = "1.0", s.browser = {}, s.browser.createObjectUrl = i.getObjectUrlForBrowser, n.write(n.levels.verbose, "sdk loaded"), t.exports = s
        }, {
            "./administration/userManager": 38,
            "./communication/authenticationToken": 41,
            "./communication/credentialAuthProvider": 42,
            "./communication/serviceConnection": 45,
            "./communication/tokenAuthProvider.js": 46,
            "./content/contentManager": 49,
            "./internal/logManager.js": 52,
            "./internal/utilities": 53,
            "./workflow/workflowManager": 56
        }],
        52: [function(e, t, r) {
            "use strict";
            var n = function() {
                function e(e, t) {
                    if (c >= e) {
                        var r = Array.prototype.slice.call(arguments, 2);
                        s(t, r)
                    }
                }

                function t(t, r) {
                    Array.prototype.unshift.call(arguments, a.Verbose), e.apply(this, arguments)
                }

                function r(t) {
                    Array.prototype.unshift.call(arguments, a.Info), e.apply(this, arguments)
                }

                function n(t) {
                    Array.prototype.unshift.call(arguments, a.Warn), e.apply(this, arguments)
                }

                function i(t) {
                    Array.prototype.unshift.call(arguments, a.Error), e.apply(this, arguments)
                }

                function o(e) {
                    for (var t = !1, r = Object.keys(a), n = 0; n < r.length; n++) {
                        var i = a[r[n]];
                        if (i === e) {
                            t = !0;
                            break
                        }
                    }
                    if (!t) throw new Error("Not existing log level.");
                    c = e
                }

                function s(e, t) {
                    for (var r = 0; r < t.length; r++) {
                        var n = t[r];
                        "string" != typeof t[r] && (n = JSON.stringify(t[r]));
                        var i = "{" + r + "}",
                            o = "%" + r + "%";
                        e.indexOf(i) < 0 && e.indexOf(o) < 0 && (e += " --> " + t[r]), e = e.replace(i, n), e = e.replace(o, n)
                    }
                    return e
                }
                var a = {
                        None: 0,
                        Error: 1,
                        error: 1,
                        Warn: 2,
                        warn: 2,
                        Info: 3,
                        info: 3,
                        Debug: 4,
                        debug: 4,
                        Verbose: 5,
                        verbose: 5
                    },
                    c = a.Error;
                return {
                    levels: a,
                    setLogLevel: o,
                    write: e,
                    verbose: t,
                    info: r,
                    warn: n,
                    error: i
                }
            }();
            t.exports = n
        }, {}],
        53: [function(e, t, r) {
            (function(e) {
                "use strict";

                function r(t) {
                    return new e(t).toString("base64")
                }

                function n(t) {
                    return new e(t, "base64").toString("ascii")
                }

                function i() {
                    return "undefined" == typeof window
                }

                function o() {
                    return !i()
                }

                function s(e, t) {
                    if (i()) throw new Error("function is only supported in browser mode");
                    void 0 === t && (t = "application/octet-stream");
                    var r = new Uint8Array(e),
                        n = new Blob([r], {
                            type: t
                        }),
                        o = window.URL || window.webkitURL,
                        s = o.createObjectURL(n);
                    return s
                }
                t.exports = {}, t.exports.toBase64 = r, t.exports.fromBase64 = n, t.exports.isNodeJs = i, t.exports.isBrowser = o, t.exports.getObjectUrlForBrowser = s
            }).call(this, e("buffer").Buffer)
        }, {
            buffer: 6
        }],
        54: [function(e, t, r) {
            "use strict";

            function n(e, t) {
                if (!e) throw new Error("serviceConnection is not set");
                o.validateServiceConnection(e);
                var r, n = 0,
                    i = "",
                    a = "",
                    c = "",
                    u = "",
                    f = 0,
                    h = 0;
                if (this.serviceConnection = e, void 0 !== t) {
                    if (void 0 === t.reference) throw new Error("provided json will not match ecm service model");
                    n = t.reference.id || n, i = t.reference.objectId, a = t.reference.self, c = t.name || c, u = t.type || u, f = t.unreadCount || f, h = t.totalCount || h, void 0 !== t.owner && (r = new s(e, t.owner))
                }
                Object.defineProperty(this, "id", {
                    get: function() {
                        return i
                    }
                }), Object.defineProperty(this, "saperionId", {
                    get: function() {
                        return n
                    }
                }), Object.defineProperty(this, "name", {
                    get: function() {
                        return c
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        c = e
                    }
                }), Object.defineProperty(this, "type", {
                    get: function() {
                        return u
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        u = e
                    }
                }), Object.defineProperty(this, "unreadCount", {
                    get: function() {
                        return f
                    },
                    set: function(e) {
                        if (void 0 === e || !Number.isInteger(e)) throw new Error("value is not a integer");
                        f = e
                    }
                }), Object.defineProperty(this, "totalCount", {
                    get: function() {
                        return h
                    },
                    set: function(e) {
                        if (void 0 === e || !Number.isInteger(e)) throw new Error("value is not a integer");
                        h = e
                    }
                }), Object.defineProperty(this, "owner", {
                    get: function() {
                        return r
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        r = e
                    }
                })
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../communication/httpHelper"),
                s = (e("./../internal/utilities"), e("./../common/actorReference")),
                a = e("./../common/pageInfo"),
                c = e("./workflowTask");
            n.prototype.getWorkflowTasks = function(e, t) {
                return c.getTasks(this, e, t)
            }, n.prototype.toString = function() {
                var e = this.name + " / " + this.type + " (ID " + this.id + ")";
                return e
            }, n.getAllInboxes = function(e, t) {
                return void 0 === t && (t = 1), i.verbose("getAllInboxes"), new Promise(function(t, r) {
                    try {
                        o.getJson(e, o.endpoints.workflow.inboxes.all).then(function(o) {
                            try {
                                i.verbose("inboxes {0}", o), o.items || r(new Error("no items collection received"));
                                var s = [];
                                o.items.forEach(function(t) {
                                    var r = new n(e, t);
                                    s.push(r)
                                }), t({
                                    data: s,
                                    pageInfo: new a(o)
                                })
                            } catch (c) {
                                i.error(c), r(c)
                            }
                        }, function(e) {
                            i.error(e), r(e)
                        })
                    } catch (s) {
                        i.error(s), r(s)
                    }
                })
            }, t.exports = n
        }, {
            "./../common/actorReference": 39,
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53,
            "./workflowTask": 57
        }],
        55: [function(e, t, r) {
            (function(r) {
                "use strict";

                function n(e, t) {
                    function n(t) {
                        if (i.verbose("create workflow process from json {0}", t), void 0 === t) throw new Error("json is empty or undefined");
                        if (void 0 === t.reference) throw new Error("provided json will not match ecm service model");
                        h = t.reference.id || h, l = t.reference.objectId, d = t.reference.self, p = t.description || p, p = t.name, s = new a(e, r.owner), c = {}, u = t.state, f = t.timeInformation
                    }
                    if (!e) throw new Error("serviceConnection is not set");
                    o.validateServiceConnection(e);
                    var s, c, u, f, h = 0,
                        l = "",
                        d = "",
                        p = "";
                    this.serviceConnection = e;
                    void 0 !== t && n(t), this.merge = n, Object.defineProperty(this, "id", {
                        get: function() {
                            return l
                        }
                    }), Object.defineProperty(this, "saperionId", {
                        get: function() {
                            return h
                        }
                    }), Object.defineProperty(this, "name", {
                        get: function() {
                            return p
                        },
                        set: function(e) {
                            if (void 0 === e) throw new Error("value is not defined");
                            p = e
                        }
                    }), Object.defineProperty(this, "isReduced", {
                        get: function() {
                            return void 0 === _definition
                        }
                    })
                }
                var i = e("./../internal/logManager.js"),
                    o = e("./../communication/httpHelper"),
                    s = (e("./../internal/utilities"), e("./../common/pageInfo")),
                    a = e("./../common/actorReference");
                n.prototype.update = function() {
                    var e = this;
                    return new Promise(function(t, r) {
                        try {
                            i.info("WorkflowTask.update"), o.getJson(e.serviceConnection, o.endpoints.workflow.task.replace("{task}", e.id)).then(function(n) {
                                try {
                                    n || r(new Error("no json received")), e.merge(n), t(e)
                                } catch (o) {
                                    i.error(o), r(o)
                                }
                            }, function(e) {
                                i.error(e), r(e)
                            })
                        } catch (n) {
                            i.error(n), r(n)
                        }
                    })
                }, n.prototype.toString = function() {
                    var e = this.description + " / " + this.subject + " / " + this.actor.name + " (ID " + this.id + ")";
                    return e
                }, n.getTasks = function(e, t, r) {
                    return void 0 === r && (r = !1), void 0 === t && (t = 1), new Promise(function(t, n) {
                        try {
                            i.info("getTasks"), o.getJson(e.serviceConnection, o.endpoints.workflow.inboxes.tasks.replace("{inbox}", e.id)).then(function(o) {
                                try {
                                    i.verbose("received tasks: {0}", o), o.items || n(new Error("no items collection received"));
                                    var a = [];
                                    if (o.items.forEach(function(t) {
                                            var r = new WorkflowTask(e.serviceConnection, t, e);
                                            a.push(r)
                                        }), r) {
                                        var c = [];
                                        a.forEach(function(e) {
                                            c.push(e.update())
                                        }), Promise.all(c).then(function(e) {
                                            i.info("all tasks received"), t({
                                                data: e,
                                                pageInfo: new s(o)
                                            })
                                        })
                                    } else t({
                                        data: a,
                                        pageInfo: new s(o)
                                    })
                                } catch (u) {
                                    i.error(u), n(u)
                                }
                            }, function(e) {
                                i.error(e), n(e)
                            })
                        } catch (a) {
                            n(a)
                        }
                    })
                }, t.exports = n
            }).call(this, e("_process"))
        }, {
            "./../common/actorReference": 39,
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53,
            _process: 17
        }],
        56: [function(e, t, r) {
            "use strict";

            function n(e) {
                if (!e) throw new Error("serviceConnection is not set");
                i.validateServiceConnection(e), Object.defineProperty(this, "serviceConnection", {
                    get: function() {
                        return e
                    }
                })
            }
            var i = (e("./../internal/utilities"), e("./../communication/httpHelper")),
                o = e("./inbox");
            n.prototype.getInboxes = function(e) {
                return o.getAllInboxes(this.serviceConnection, e)
            }, n.prototype.getWorkflowDefinitions = function(e) {
                throw new Error("not implemented yet")
            }, t.exports = n
        }, {
            "./../communication/httpHelper": 44,
            "./../internal/utilities": 53,
            "./inbox": 54
        }],
        57: [function(e, t, r) {
            "use strict";

            function n(e, t, r) {
                function n(t) {
                    i.verbose("create task from json {0}", JSON.stringify(t));
                    try {
                        if (void 0 !== t) {
                            if (void 0 === t.reference) throw new Error("provided json will not match ecm service model");
                            p = t.reference.id || p, v = t.reference.objectId, g = t.reference.self, m = t.description || m, w = t.priority || w, void 0 !== t.actor && (c = new a(e, t.actor)), void 0 !== t.previousActor && (u = new a(e, t.previousActor)), void 0 !== t.process && (h = new s(e, t.process), void 0 !== t.process.documentReference && (d = t.process.documentReference)), b = t.receiveDate || b, E = t.subject || E, _ = t.userFields || _, l = t.capabilities || []
                        }
                    } catch (r) {
                        throw i.error("merge error for workflow task: {0}", r), r
                    }
                }
                if (!e) throw new Error("serviceConnection is not set");
                o.validateServiceConnection(e);
                var c, u, h, l, d, p = 0,
                    v = "",
                    g = "",
                    m = "",
                    y = !1,
                    w = 0,
                    b = t.receiveDate,
                    E = t.subject,
                    _ = t.userFields;
                this.serviceConnection = e;
                void 0 !== t && n(t), this.merge = n, Object.defineProperty(this, "id", {
                    get: function() {
                        return v
                    }
                }), Object.defineProperty(this, "saperionId", {
                    get: function() {
                        return p
                    }
                }), Object.defineProperty(this, "referenceUrl", {
                    get: function() {
                        return g
                    }
                }), Object.defineProperty(this, "description", {
                    get: function() {
                        return m
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        m = e
                    }
                }), Object.defineProperty(this, "isRead", {
                    get: function() {
                        return y
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        y = e
                    }
                }), Object.defineProperty(this, "priority", {
                    get: function() {
                        return w
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        w = e
                    }
                }), Object.defineProperty(this, "actor", {
                    get: function() {
                        return c
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        c = e
                    }
                }), Object.defineProperty(this, "previousActor", {
                    get: function() {
                        return u
                    }
                }), Object.defineProperty(this, "process", {
                    get: function() {
                        return h
                    }
                }), Object.defineProperty(this, "receiveDate", {
                    get: function() {
                        return new Date(b)
                    }
                }), Object.defineProperty(this, "subject", {
                    get: function() {
                        return E
                    },
                    set: function(e) {
                        if (void 0 === e) throw new Error("value is not defined");
                        E = e
                    }
                }), Object.defineProperty(this, "isReduced", {
                    get: function() {
                        return void 0 === h
                    }
                }), Object.defineProperty(this, "userFields", {
                    get: function() {
                        return _
                    }
                }), Object.defineProperty(this, "document", {
                    get: function() {
                        return new f(this.serviceConnection, d)
                    }
                }), Object.defineProperty(this, "hasDocument", {
                    get: function() {
                        return void 0 !== d
                    }
                }), Object.defineProperty(this, "canMoveToMyInbox", {
                    get: function() {
                        return l.indexOf("CAN_TAKE") !== -1
                    }
                }), Object.defineProperty(this, "canMoveToPreviousInbox", {
                    get: function() {
                        return l.indexOf("CAN_PUT_BACK") !== -1
                    }
                })
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../communication/httpHelper"),
                s = (e("./../internal/utilities"), e("./process.js")),
                a = e("./../common/actorReference"),
                c = e("./../common/pageInfo"),
                u = e("./workflowTaskTransition"),
                f = e("./../content/document");
            n.prototype.toString = function() {
                var e = this.description + " / " + this.subject;
                return void 0 !== this.actor && (e += " / " + this.actor.name), e += " (ID " + this.id + ")"
            }, n.prototype.refresh = function() {
                var e = "WorkflowTask.refresh",
                    t = this;
                return new Promise(function(r, n) {
                    try {
                        i.info(e), o.getJson(t.serviceConnection, t.referenceUrl).then(function(o) {
                            try {
                                i.verbose("received task: {0}", o), o || n(new Error("no data received")), t.merge(o), r(t)
                            } catch (s) {
                                i.error(e, s), n(s)
                            }
                        }, function(t) {
                            i.error(e, t), n(t)
                        })
                    } catch (s) {
                        i.error(e, s), n(s)
                    }
                })
            }, n.prototype.moveToMyInbox = function() {
                var e = "WorkflowTask.moveToMyInbox",
                    t = this;
                if (!this.canMoveToMyInbox) throw new Error("operation not allowed");
                return new Promise(function(r, n) {
                    try {
                        i.info(e), o.startAction(t.serviceConnection, o.endpoints.workflow.task.takeOwnership.replace("{task}", o.encodeUriComponent(t.id))).then(function() {
                            i.info("{0} for {1} executed", e, t.toString()), t.refresh().then(function() {
                                r(t)
                            }, function(t) {
                                i.error(e, t), n(t)
                            })
                        }, function(t) {
                            i.error(e, t), n(t)
                        })
                    } catch (s) {
                        i.error(e, s), n(s)
                    }
                })
            }, n.prototype.moveToPreviousInbox = function() {
                var e = "WorkflowTask.moveToPreviousInbox",
                    t = this;
                if (!this.canMoveToPreviousInbox) throw new Error("operation not allowed");
                return new Promise(function(r, n) {
                    try {
                        i.info(e), o.startAction(t.serviceConnection, o.endpoints.workflow.task.revokeOwnership.replace("{task}", o.encodeUriComponent(t.id))).then(function() {
                            i.info("{0} for {1} executed", e, t.toString()), t.refresh().then(function() {
                                r(t)
                            }, function(t) {
                                i.error(e, t), n(t)
                            })
                        }, function(t) {
                            i.error(e, t), n(t)
                        })
                    } catch (s) {
                        i.error(e, s), n(s)
                    }
                })
            }, n.prototype.getTransitions = function() {
                return u.getTransitions(this)
            }, n.getTasks = function(e, t, r) {
                var s = "WorkflowTask.getTasks";
                return void 0 === r && (r = !1), void 0 === t && (t = 1), new Promise(function(t, a) {
                    try {
                        i.info(s), o.getJson(e.serviceConnection, o.endpoints.workflow.inboxes.tasks.replace("{inbox}", e.id)).then(function(o) {
                            try {
                                if (!o.items) return i.verbose("received data: {0}", JSON.stringify(o, null, 2)), void a(new Error("no items collection received"));
                                var u = [],
                                    f = [];
                                o.items.forEach(function(t) {
                                    var i = new n(e.serviceConnection, t, e);
                                    f.push(i), r && u.push(i.refresh())
                                }), Promise.all(u).then(function(e) {
                                    t({
                                        data: f,
                                        pageInfo: new c(o)
                                    })
                                }, function(e) {
                                    i.error(s, e), a(e)
                                })
                            } catch (h) {
                                i.error(s, h), a(h)
                            }
                        }, function(e) {
                            i.error(s, e), a(e)
                        })
                    } catch (u) {
                        i.error(s, u), a(u)
                    }
                })
            }, n.getTask = function(e, t, r) {
                throw new Error("not implemented yet")
            }, t.exports = n
        }, {
            "./../common/actorReference": 39,
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../content/document": 50,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53,
            "./process.js": 55,
            "./workflowTaskTransition": 58
        }],
        58: [function(e, t, r) {
            "use strict";

            function n(e, t, r) {
                function n(e) {
                    i.verbose("create transition from json {0}", JSON.stringify(e));
                    try {
                        void 0 !== e && (u = e.id || u, h = e.description || h, f = e.commentRequired || f, void 0 !== e.recipientSelection && (s = [], a = {}))
                    } catch (t) {
                        throw i.error("merge error for workflow task transition: {0}", t), t
                    }
                }
                if (!e) throw new Error("serviceConnection is not set");
                o.validateServiceConnection(e);
                var s, a, c = r,
                    u = 0,
                    f = !1,
                    h = "";
                this.serviceConnection = e;
                void 0 !== t && n(t), this.merge = n, Object.defineProperty(this, "id", {
                    get: function() {
                        return u
                    }
                }), Object.defineProperty(this, "commentRequired", {
                    get: function() {
                        return f
                    }
                }), Object.defineProperty(this, "description", {
                    get: function() {
                        return h
                    }
                }), Object.defineProperty(this, "potentialRecipients", {
                    get: function() {
                        return s || []
                    }
                }), Object.defineProperty(this, "recipientSelectionRule", {
                    get: function() {
                        return a
                    }
                }), Object.defineProperty(this, "task", {
                    get: function() {
                        return c
                    }
                })
            }
            var i = e("./../internal/logManager.js"),
                o = e("./../communication/httpHelper"),
                s = (e("./../internal/utilities"), e("./process.js"), e("./../common/actorReference"), e("./../common/pageInfo"));
            n.prototype.toString = function() {
                var e = this.description + " (ID " + this.id + ")";
                return e
            }, n.prototype.apply = function(e, t) {
                var r = "WorkflowTaskTransition.apply",
                    n = this;
                return new Promise(function(s, a) {
                    try {
                        i.info(r);
                        var c = {};
                        if (c.transitionId = n.id, e && (c.comment = e), Array.isArray(t)) {
                            var u = [];
                            t.forEach(function(e) {
                                u.push(e.toServiceActorReference())
                            }), c.recipients = u
                        }
                        i.verbose("{0} data to send : {1}", r, c), o.postJson(n.serviceConnection, o.endpoints.workflow.task.forward.replace("{task}", n.task.id), c).then(function() {
                            i.info("{0} for {1} executed", r, n.toString()), s(n)
                        }, function(e) {
                            i.error(r, e), a(e)
                        })
                    } catch (f) {
                        i.error(r, f), a(f)
                    }
                })
            }, n.getTransitions = function(e) {
                var t = "WorkflowTaskTransition.getTransitions";
                return new Promise(function(r, a) {
                    try {
                        i.info(t), o.getJson(e.serviceConnection, o.endpoints.workflow.task.transitions.replace("{task}", e.id)).then(function(o) {
                            try {
                                var c = [];
                                o.forEach(function(t) {
                                    var r = new n(e.serviceConnection, t, e);
                                    c.push(r)
                                }), r({
                                    data: c,
                                    pageInfo: new s
                                })
                            } catch (u) {
                                i.error(t, u), a(u)
                            }
                        }, function(e) {
                            i.error(t, e), a(e)
                        })
                    } catch (c) {
                        i.error(t, c), a(c)
                    }
                })
            }, t.exports = n
        }, {
            "./../common/actorReference": 39,
            "./../common/pageInfo": 40,
            "./../communication/httpHelper": 44,
            "./../internal/logManager.js": 52,
            "./../internal/utilities": 53,
            "./process.js": 55
        }]
    }, {}, [51])(51)
});