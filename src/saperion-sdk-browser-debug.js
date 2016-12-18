(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.saperionSdk = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":4,"punycode":18,"querystring":21}],4:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],5:[function(require,module,exports){
(function (global){
'use strict';

var buffer = require('buffer');
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"buffer":6}],6:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"base64-js":1,"ieee754":12,"isarray":7}],7:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],8:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],9:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})

},{"../../is-buffer/index.js":14}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],11:[function(require,module,exports){
var http = require('http');

var https = module.exports;

for (var key in http) {
    if (http.hasOwnProperty(key)) https[key] = http[key];
};

https.request = function (params, cb) {
    if (!params) params = {};
    params.scheme = 'https';
    params.protocol = 'https:';
    return http.request.call(this, params, cb);
}

},{"http":22}],12:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],13:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],14:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],15:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],16:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))

},{"_process":17}],17:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],18:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.3.2 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],19:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],20:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],21:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":19,"./encode":20}],22:[function(require,module,exports){
(function (global){
var ClientRequest = require('./lib/request')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./lib/request":24,"builtin-status-codes":8,"url":3,"xtend":36}],23:[function(require,module,exports){
(function (global){
exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.blobConstructor = false
try {
	new Blob([new ArrayBuffer(1)])
	exports.blobConstructor = true
} catch (e) {}

var xhr = new global.XMLHttpRequest()
// If location.host is empty, e.g. if this page/worker was loaded
// from a Blob, then use example.com to avoid an error
xhr.open('GET', global.location.host ? '/' : 'https://example.com')

function checkTypeSupport (type) {
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined'
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice)

exports.arraybuffer = haveArrayBuffer && checkTypeSupport('arraybuffer')
// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer &&
	checkTypeSupport('moz-chunked-arraybuffer')
exports.overrideMimeType = isFunction(xhr.overrideMimeType)
exports.vbArray = isFunction(global.VBArray)

function isFunction (value) {
  return typeof value === 'function'
}

xhr = null // Help gc

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],24:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var response = require('./response')
var stream = require('readable-stream')
var toArrayBuffer = require('to-arraybuffer')

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else if (capability.vbArray && preferBinary) {
		return 'text:vbarray'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch') {
		// If the use of XHR should be preferred and includes preserving the 'content-type' header
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var self = this
	return self._headers[name.toLowerCase()].value
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	var headersObj = self._headers
	var body
	if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') {
		if (capability.blobConstructor) {
			body = new global.Blob(self._body.map(function (buffer) {
				return toArrayBuffer(buffer)
			}), {
				type: (headersObj['content-type'] || {}).value || ''
			})
		} else {
			// get utf8 string
			body = Buffer.concat(self._body).toString()
		}
	}

	if (self._mode === 'fetch') {
		var headers = Object.keys(headersObj).map(function (name) {
			return [headersObj[name].name, headersObj[name].value]
		})

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headers,
			body: body,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin'
		}).then(function (response) {
			self._fetchResponse = response
			self._connect()
		}, function (reason) {
			self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode.split(':')[0]

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		Object.keys(headersObj).forEach(function (name) {
			xhr.setRequestHeader(headersObj[name].name, headersObj[name].value)
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress()
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode)
	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this
	self._destroyed = true
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	// Currently, there isn't a way to truly abort a fetch.
	// If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setTimeout = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'user-agent',
	'via'
]

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)

},{"./capability":23,"./response":25,"_process":17,"buffer":6,"inherits":13,"readable-stream":32,"to-arraybuffer":34}],25:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var stream = require('readable-stream')

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		// backwards compatible version of for (<item> of <iterable>):
		// for (var <item>,_i,_it = <iterable>[Symbol.iterator](); <item> = (_i = _it.next()).value,!_i.done;)
		for (var header, _i, _it = response.headers[Symbol.iterator](); header = (_i = _it.next()).value, !_i.done;) {
			self.headers[header[0].toLowerCase()] = header[1]
			self.rawHeaders.push(header[0], header[1])
		}

		// TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				if (result.done) {
					self.push(null)
					return
				}
				self.push(new Buffer(result.value))
				read()
			})
		}
		read()

	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {}

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text:vbarray': // For IE9
			if (xhr.readyState !== rStates.DONE)
				break
			try {
				// This fails in IE8
				response = new global.VBArray(xhr.responseBody).toArray()
			} catch (e) {}
			if (response !== null) {
				self.push(new Buffer(response))
				break
			}
			// Falls through in IE8	
		case 'text':
			try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
				response = xhr.responseText
			} catch (e) {
				self._mode = 'text:vbarray'
				break
			}
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = new Buffer(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null)
	}
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)

},{"./capability":23,"_process":17,"buffer":6,"inherits":13,"readable-stream":32}],26:[function(require,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":28,"./_stream_writable":30,"core-util-is":9,"inherits":13,"process-nextick-args":16}],27:[function(require,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":29,"core-util-is":9,"inherits":13}],28:[function(require,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var StringDecoder;

util.inherits(Readable, Stream);

function prependListener(emitter, event, fn) {
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

var Duplex;
function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

var Duplex;
function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var _i = 0; _i < len; _i++) {
      dests[_i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1) return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'))

},{"./_stream_duplex":26,"./internal/streams/BufferList":31,"_process":17,"buffer":6,"buffer-shims":5,"core-util-is":9,"events":10,"inherits":13,"isarray":15,"process-nextick-args":16,"string_decoder/":33,"util":2}],29:[function(require,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er) {
      done(stream, er);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('Not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er) {
  if (er) return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":26,"core-util-is":9,"inherits":13}],30:[function(require,module,exports){
(function (process){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

var Duplex;
function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

var Duplex;
function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
}).call(this,require('_process'))

},{"./_stream_duplex":26,"_process":17,"buffer":6,"buffer-shims":5,"core-util-is":9,"events":10,"inherits":13,"process-nextick-args":16,"util-deprecate":35}],31:[function(require,module,exports){
'use strict';

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};
},{"buffer":6,"buffer-shims":5}],32:[function(require,module,exports){
(function (process){
var Stream = (function (){
  try {
    return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

if (!process.browser && process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
}

}).call(this,require('_process'))

},{"./lib/_stream_duplex.js":26,"./lib/_stream_passthrough.js":27,"./lib/_stream_readable.js":28,"./lib/_stream_transform.js":29,"./lib/_stream_writable.js":30,"_process":17}],33:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":6}],34:[function(require,module,exports){
var Buffer = require('buffer').Buffer

module.exports = function (buf) {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		var arrayCopy = new Uint8Array(buf.length)
		var len = buf.length
		for (var i = 0; i < len; i++) {
			arrayCopy[i] = buf[i]
		}
		return arrayCopy.buffer
	} else {
		throw new Error('Argument must be a Buffer')
	}
}

},{"buffer":6}],35:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],36:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],37:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var PageInfo = require('./../common/pageInfo');

/**
 * Saperion User
 * 
 * @module administration
 * @class User
 * @type Object
 */
function User(serviceConnection, json) {

    // #############################################################################
    // object initialization assertions
    // #############################################################################

    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    // #############################################################################
    // private properties
    // #############################################################################

    var _id = '';
    var _objectId = '';
    var _selfUrl;

    var _fullName;
    var _shortName;
    var _description;
    var _email;
    var _tenantId;
    var _distinguishedName;
    var _deleted = false;
    var _locked = false;
    var _present = false;
    var _technicalUser = false;
    var _synchronizedUser = false;

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // json mapping
    // #############################################################################

    var _self = this;

    function merge(json) {
        log.verbose('create user from json {0}', JSON.stringify(json));
        try {
            if (json !== undefined) {

                if (json.reference === undefined) {
                    throw new Error('provided json will not match ecm service model');
                }
                if (json.type !== 'USER')
                    throw new Error('no user object received');

                _id = json.reference.id || _id;
                _objectId = json.reference.objectId;
                _selfUrl = json.reference.self;

                _fullName = json.name || json.fullName || _fullName;
                _shortName = json.shortName || _shortName;
                _description = json.description || _description;
                _distinguishedName = json.distinguishedName || _distinguishedName;
                _email = json.emailAddress || _email;
                //_guid = json.guid || _guid;

                _technicalUser = json.technicalUser || _technicalUser;
                _synchronizedUser = json.synchronizedUser || _synchronizedUser;
                _locked = json.locked || _locked;
                _deleted = json.deleted || _deleted;

            }
        } catch (error) {
            log.error('merge error for user: {0}', error);
            throw error;
        }
    }

    if (json !== undefined) {
        merge(json);
    }


    /**
     * merge a json object with the current instance.
     * internaly used for updates from service
     * @internal
     * @property merge
     */
    this.merge = merge;

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * typed identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _objectId;
        }
    });

    /**
     * id of the element in the saperion backend
     * @public
     * @property saperionId
     */
    Object.defineProperty(this, 'saperionId', {
        get: function () {
            return _id;
        }
    });

    Object.defineProperty(this, 'referenceUrl', {
        get: function () {
            return _selfUrl;
        }
    });

    /**
     * fullName of the user
     * @public
     * @property description
     */
    Object.defineProperty(this, 'fullName', {
        get: function () {
            return _fullName;
        },
        set: function (value) {
            if (value !== undefined) {
                _fullName = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * shortName of the user
     * @public
     * @property description
     */
    Object.defineProperty(this, 'shortName', {
        get: function () {
            return _shortName;
        },
        set: function (value) {
            if (value !== undefined) {
                _shortName = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * distinguished Name of the user
     * @public
     * @property distinguishedName
     */
    Object.defineProperty(this, 'distinguishedName', {
        get: function () {
            return _distinguishedName;
        },
        set: function (value) {
            if (value !== undefined) {
                _distinguishedName = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });


    /**
     * description of the user
     * @public
     * @property description
     */
    Object.defineProperty(this, 'description', {
        get: function () {
            return _description;
        },
        set: function (value) {
            if (value !== undefined) {
                _description = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * email address of the user
     * @public
     * @property email
     */
    Object.defineProperty(this, 'email', {
        get: function () {
            return _email;
        },
        set: function (value) {
            if (value !== undefined) {
                _email = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * true if technical user
     * @public
     * @property isTechnicalUser
     */
    Object.defineProperty(this, 'isTechnicalUser', {
        get: function () {
            return _technicalUser;
        },
        set: function (value) {
            if (value !== undefined) {
                _technicalUser = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });
    /**
     * true if synced
     * @public
     * @property isSynchronizedUser
     */
    Object.defineProperty(this, 'isSynchronizedUser', {
        get: function () {
            return _synchronizedUser;
        },
        set: function (value) {
            if (value !== undefined) {
                _synchronizedUser = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * true if deleted
     * @public
     * @property isDeleted
     */
    Object.defineProperty(this, 'isDeleted', {
        get: function () {
            return _deleted;
        },
        set: function (value) {
            if (value !== undefined) {
                _deleted = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * true if locked
     * @public
     * @property isLocked
     */
    Object.defineProperty(this, 'isLocked', {
        get: function () {
            return _locked;
        },
        set: function (value) {
            if (value !== undefined) {
                _locked = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * false if this task contains only a reduced set of data (specified by the service collections)
     * @public
     * @property isReduced
     */
    Object.defineProperty(this, 'isReduced', {
        get: function () {
            return (_shortName === undefined && _email === undefined);
        }
    });

} //end constructor


// #############################################################################
// instance functions
// #############################################################################

//internal used function to create an actor reference
User.prototype.toServiceActorReference = function () {
    return {
        id: this.id,
        type: 'USER'
    };
};

User.prototype.delete = function () {
    throw Error('not implemented');
};

User.prototype.toString = function () {
    var ret = this.fullName;
    if (!this.isReduced)
        ret += ' (' + this.shortName + ')';
    else ret += ' - reduced -';
    return ret;
};

User.prototype.refresh = function () {
    var fnName = 'User.refresh';
    var self = this;

    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(self.serviceConnection, (self.referenceUrl))
                .then(function (json) {
                        try {
                            log.verbose('received user: {0}', json);
                            self.merge(json);
                            success(self);
                        } catch (error) {
                            log.error(fnName, error);
                            failed(error);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};


// #############################################################################
// static functions
// #############################################################################


/**
 * Description for getUsers
 * @private
 * @method getUsers
 * @param {Object} serviceConnection
 * @param {Object} page  - 1 is default
 * @param {Object} query - optional query for filtering users (see service documentation)
 * @return {Object} collection of users os pageinfo
 */
User.getUsers = function (serviceConnection, page, detailed, query) {
    //doc: https://ecm-service.psft.co/ecms/resource_UserManagementResource.html
    var fnName = 'User.getUsers';
    if (page === undefined) page = 1;

    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(serviceConnection, http.endpoints.management.users.all + (query || ''), page)
                .then(function (json) {
                        try {

                            if (!json.items) {
                                log.verbose('received data: {0}', JSON.stringify(json));
                                failed(new Error('no items collection received'));
                                return;
                            }

                            var promiseCollection = [];
                            var userCollection = [];
                            json.items.forEach(function (userJson) {
                                var user = new User(serviceConnection, userJson);
                                userCollection.push(user);
                                if (detailed) promiseCollection.push(user.refresh());
                            });

                            Promise.all(promiseCollection)
                                .then(function (detailedUserCollection) {
                                    success({
                                        data: userCollection,
                                        pageInfo: new PageInfo(json)
                                    });
                                }, function (error) {
                                    log.error(fnName, error);
                                    failed(error);
                                });

                        } catch (err) {
                            log.error(fnName, err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

User.getUserByName = function (serviceConnection, userName) {
    //doc: https://ecm-service.psft.co/ecms/resource_UserManagementResource.html
    var fnName = 'User.getUserByName';
    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(serviceConnection, (http.endpoints.management.users.byShortName).replace('{userName}', userName))
                .then(function (json) {
                        try {
                            log.verbose('received user: {0}', json);
                            //validate model
                            if (json.type !== 'USER')
                                failed(new Error('no user object received'));
                            var user = new User(serviceConnection, json);
                            success(user);
                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

User.getUserById = function (serviceConnection, userId) {
    //doc: https://ecm-service.psft.co/ecms/resource_UserManagementResource.html
    var fnName = 'User.getUserById';
    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(serviceConnection, (http.endpoints.management.users.byId).replace('{id}', userId))
                .then(function (json) {
                        try {
                            log.verbose('received user: {0}', json);
                            //validate model
                            if (json.type !== 'USER')
                                failed(new Error('no user object received'));
                            var user = new User(serviceConnection, json);
                            success(user);
                        } catch (error) {
                            log.error(fnName, error);
                            failed(error);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

module.exports = User;
},{"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../internal/logManager.js":52,"./../internal/utilities":53}],38:[function(require,module,exports){
'use strict';

var User = require('./user');

/**
 * Saperion User Managerwhich provides access to user related functions and objects.
 * 
 * @module administration
 * @class UserManager
 * @type Object
 */
function UserManager(serviceConnection) {
    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    Object.defineProperty(this, 'serviceConnection', {
        get: function () {
            return serviceConnection;
        }
    });
}

//UserManager.User = User;

UserManager.prototype.getAllUsers = function (page) {
    return User.getUsers(this.serviceConnection, page, false);
};

UserManager.prototype.getAllUsersDetailed = function (page) {
    return User.getUsers(this.serviceConnection, page, true);
};

UserManager.prototype.getUserById = function (userId) {
    return User.getUserById(this.serviceConnection, userId);
};

UserManager.prototype.getUserByName = function (userName) {
    return User.getUserByName(this.serviceConnection, userName);
};

UserManager.prototype.getUserByShortName = function (shortName) {
    return User.getUserByShortName(this.serviceConnection, shortName);
};

UserManager.prototype.createUser = function () {
    return new User(this.serviceConnection);
};


module.exports = UserManager;
},{"./user":37}],39:[function(require,module,exports){
'use strict';

var User = require('./../administration/user');

/**
 * Contains a abstraction of the Saperion Owner Information and helper functions to access them
 * 
 * @module sdk.common
 * @class Owner
 * @type Object
 */

function ActorReference(serviceConnection, json) {

    //TODO validate connection object instance
    if (serviceConnection === undefined) throw new Error('missing connection parameter');

    //necessary to get user or group object instances
    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    var _id = '';
    var _objectId = '';
    var _objectUrl = '';
    var _type = '';
    var _name = '';

    if (json !== undefined) {

        _id = json.id || _id;
        _objectId = json.objectId || _objectId;
        _objectUrl = json.self || _objectUrl;
        _type = json.type || _type;
        _name = json.name || _name;

        if (json.reference !== undefined) {
            _id = json.reference.id || _id;
            _objectId = json.reference.objectId || _objectId;
            _type = json.reference.type || _type;
        }
    }

    /**
     * id of the owner
     * @public
     * @property page
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _id;
        }
    });

    /**
     * saperion object reference 
     * @public
     * @property page
     */
    Object.defineProperty(this, 'objectId', {
        get: function () {
            return _objectId;
        }
    });

    /**
     * type of the owner (group or user)
     * @public
     * @property type
     */
    Object.defineProperty(this, 'type', {
        get: function () {
            return _type;
        }
    });

    /**
     * name of the owner, can be empty
     * @public
     * @property name
     */
    Object.defineProperty(this, 'name', {
        get: function () {
            return _name;
        }
    });
}

ActorReference.prototype.isUser = function () {
    return (this.type === 'USER');
};

ActorReference.prototype.isGroup = function () {
    return (this.type === 'GROUP');
};

/**
 * return a promis which contains a object of type user or group with detailed owner information
 * @public
 * @property page
 */
ActorReference.prototype.getDetails = function () {
    if (this.isUser) {
        return User.getUserById(this.serviceConnection, this.id);
    }
    return new Promise(function (success, fail) {
        if (this.isGroup()) {
            //TODO instanciate a group object and read the element
            success({
                name: 'administrators',
                isMocked: true
            });
        } else {
            fail('unsupported owner type ' + this.type);
        }
    });
};

ActorReference.prototype.toServiceActorReference = function () {
    return {
        id: this.id,
        type: this.type
    };
};

module.exports = ActorReference;
},{"./../administration/user":37}],40:[function(require,module,exports){
'use strict';

/**
 * Contains result information about available pages
 * 
 * @module sdk
 * @class PageInfo
 * @type Object
 */

function PageInfo(json) {

    var _page = 1;
    var _pageSize = 0;
    var _hasMoreItems = false;

    if (json !== undefined) {

        _page = json.number || _page;
        if (json.pageDefinition !== undefined) {
            _pageSize = json.pageDefinition.pageSize || _pageSize;
            var pageOffset = json.pageDefinition.offset || 0;
            if (_pageSize > 0) {
                _page = Math.round(pageOffset / _pageSize) + 1;
            }
        }
        _hasMoreItems = json.hasMoreItems || _hasMoreItems;
    }

    /**
     * number of the current page
     * @public
     * @property page
     */
    Object.defineProperty(this, 'page', {
        get: function () {
            return _page;
        }
    });

    /**
     * number of elements per page
     * @public
     * @property page
     */
    Object.defineProperty(this, 'pageSize', {
        get: function () {
            return _pageSize;
        }
    });

    /**
     * indicator that there are more elements available on the service
     * @public
     * @property page
     */
    Object.defineProperty(this, 'hasMoreItems', {
        get: function () {
            return _hasMoreItems;
        }
    });

}

module.exports = PageInfo;
},{}],41:[function(require,module,exports){
'use strict'
var log = require('./../internal/logManager.js');

/**
 * Token object which contains authentication related data.
 * This object is used by the TokenAuthProvider and the CredentialAuthProvider to store the validated login data{{#crossLink "BasicAuthProvider"}}{{/crossLink}}.
 *
 * @module communication
 * @class AuthToken
 * @type Object
 */
function AuthenticationToken(serviceToken) {

    if (serviceToken === undefined) throw new Error('unable to create instance of AuthenticationToken without json');
    if (serviceToken.token === undefined) throw new Error('service token is invalid. token part is missing.');

    //used by our serialization
    var validUntil = serviceToken.expiresAt || new Date();
    var refreshAt = serviceToken.refreshAt || new Date();

    if (serviceToken.expiresIn) {
        validUntil = new Date();
        validUntil.setSeconds(validUntil.getSeconds() + serviceToken.expiresIn);
        refreshAt.setSeconds(refreshAt.getSeconds() + (serviceToken.expiresIn * 0.75));
    }

    Object.defineProperty(this, 'token', {
        get: function () {
            return serviceToken.token;
        }
    });

    Object.defineProperty(this, 'expiresAt', {
        get: function () {
            return validUntil;
        }
    });

    Object.defineProperty(this, 'refreshAt', {
        get: function () {
            return refreshAt;
        }
    });

    //token is expired and not longer usable
    Object.defineProperty(this, 'isExpired', {
        get: function () {
            return validUntil < Date.now;
        }
    });

    //indicator that the token shoudl be refreshed
    Object.defineProperty(this, 'needsRefresh', {
        get: function () {
            return refreshAt < Date.now;
        }
    });
}

AuthenticationToken.prototype.serialize = function () {
    var o = {
        token: this.token,
        expiresAt: this.expiresAt,
        refreshAt: this.refreshAt
    };
    return JSON.stringify(o);
};

AuthenticationToken.prototype.toJson = function () {
    return this.serialize();
};

AuthenticationToken.deserialize = function (serializedData) {
    var o = JSON.parse(serializedData);
    return new AuthenticationToken(o);
};

module.exports = AuthenticationToken;
},{"./../internal/logManager.js":52}],42:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var util = require('./../internal/utilities'); //base 64 encoding

var AuthenticationToken = require('./authenticationToken');
var TokenAuthProvider = require('./tokenAuthProvider');

var User = require('./../administration/user');

var http = require('./httpHelper');

/**
 * Credential Object which organizing login related data
 * authentication provider. Default authentication provider is {{#crossLink "BasicAuthProvider"}}{{/crossLink}}.
 * 
 * @module communication
 * @class authenticationManager
 * @type Object
 */
function CredentialAuthProvider(authServiceUrl, user, pass, license, tenant) {

    if (!authServiceUrl) throw new Error('parameter authServiceUrl is missing');
    if (!user) throw new Error('parameter user is missing');
    if (!pass) throw new Error('parameter pass is missing');
    if (!tenant) tenant = 'SYSTEM'; //throw new Error('parameter tenant is missing');
    if (!license) license = 'index'; //throw new Error('parameter license is missing');


    var _licenseId = 0;
    //Info: IE11 and PhantomJS are not supporting Number.isInteger
    if (Number.isInteger !== undefined) {
        if (Number.isInteger(license)) {
            _licenseId = license;
        }
    }
    if (_licenseId === 0) {
        switch (license) {
        case 'admin':
        case '3':
            _licenseId = 3;
            break;
        case 'query':
        case '2':
            _licenseId = 2;
            break;
        case 'index':
        case '1':
            _licenseId = 1;
            break;
        }
    }
    if (_licenseId < 1 || _licenseId > 3) throw new Error('invalid license. "' + license + '" is not allowed. Please use one of these: \n' + JSON.stringify(CredentialAuthProvider.licenses, null, 2));

    var _tokenAuthProvider;
    var _authHeader = 'Basic ' + util.toBase64(user + ':' + pass);

    Object.defineProperty(this, 'authServiceUrl', {
        get: function () {
            return authServiceUrl;
        }
    });

    Object.defineProperty(this, '_innerAuthProvider', {
        get: function () {
            return _tokenAuthProvider;
        }
    });

    this._applyNewToken = function (token) {
        log.info('CredentialAuthProvider._applyNewToken');
        _tokenAuthProvider = new TokenAuthProvider(authServiceUrl, token);
    };

    /**
     * This function injects the necessary headers for authentication to a XHR / Http Request Object
     * @method prepareAuthentication
     */
    this.applyAuthentication = function (httpRequest) {
        if (_tokenAuthProvider !== undefined) {
            _tokenAuthProvider.applyAuthentication(httpRequest);
        } else {
            log.info('CredentialAuthProvider.applyAuthentication');
            httpRequest.setHeader('Authorization', _authHeader);
            httpRequest.setHeader('X-ECM-LicenseType', _licenseId);
            httpRequest.setHeader('X-ECM-Tenant', tenant);
        }
    };
}

/**
 * List of supported licenses
 * @static
 * @property licenses
 */
CredentialAuthProvider.licenses = {
    admin: 3,
    query: 2,
    index: 1
};

Object.freeze(CredentialAuthProvider.licenses);

CredentialAuthProvider.prototype.getToken = function () {
    log.info('CredentialAuthProvider.getToken');

    if (this._innerAuthProvider !== undefined) return this._innerAuthProvider.getToken();

    var self = this;
    return new Promise(function (success, failed) {
        try {
            http.executeHttpCall(self.authServiceUrl, http.endpoints.auth.token.generate, 'GET', null, false, self.applyAuthentication)
                .then(function (json) {
                        try {
                            //validate model
                            if (!json.token || !json.expiresIn)
                                failed(new Error('no token received, login failed'));
                            var token = new AuthenticationToken(json);
                            self._applyNewToken(token);
                            success(token);
                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (err) {
                        log.error(err);
                        failed(err);
                    });
        } catch (err) {
            log.error(err);
            failed(err);
        }
    });
};

CredentialAuthProvider.prototype.validateToken = function () {
    log.info('CredentialAuthProvider.validateToken');
    if (this._innerAuthProvider !== undefined) return this._innerAuthProvider.validateToken();

    //the validity call expect a JSON Web Token, so it can be executed only by the TokenAuthProvider.
    throw new Error('please execute getToken() before checking the validity.');
};

module.exports = CredentialAuthProvider;
},{"./../administration/user":37,"./../internal/logManager.js":52,"./../internal/utilities":53,"./authenticationToken":41,"./httpHelper":44,"./tokenAuthProvider":46}],43:[function(require,module,exports){
var exports = {};

var ecms = 'api/';
var auth = 'api/';

exports.auth = {};
exports.auth.token = {};
exports.auth.token.generate = auth + 'token';
exports.auth.token.renew = auth + 'token/renewed';
exports.auth.token.validate = auth + 'token/validity';

exports.management = {};
exports.management.users = {};
exports.management.users.all = ecms + 'management/users';
exports.management.users.create = ecms + 'management/users';
exports.management.users.byId = ecms + 'management/users/{id}';
exports.management.users.byName = ecms + 'management/users/named/{userName}';
exports.management.users.byShortName = ecms + 'management/users?query=WHERE%20displayName%20EQ%20%22{userName}%22';

exports.workflow = {};
exports.workflow.inboxes = {};
exports.workflow.inboxes.all = ecms + 'workflow/inboxes/';
exports.workflow.inboxes.tasks = ecms + 'workflow/inboxes/{inbox}/items';

//https: //ecm-service.psft.co/ecms/resource_TaskResource.html
exports.workflow.task = {};
exports.workflow.task.details = ecms + 'workflow/tasks/{task}';
exports.workflow.task.transitions = ecms + 'workflow/tasks/{task}/transitions';
exports.workflow.task.index = ecms + 'workflow/tasks/{task}/index';
exports.workflow.task.comments = ecms + 'workflow/tasks/{task}/comments';
exports.workflow.task.takeOwnership = ecms + 'workflow/tasks/{task}/ownership/acquire';
exports.workflow.task.revokeOwnership = ecms + 'workflow/tasks/{task}/ownership/revoke';
exports.workflow.task.forward = ecms + 'workflow/tasks/{task}/forward';

exports.workflow.process = ecms + 'workflow/tasks/{task}';

exports.content = {};
exports.content.archives = {};
exports.content.archives.all = ecms + 'archives';
exports.content.archives.documents = {};
exports.content.archives.documents.all = ecms + 'archive/documents/{archive}/content';
exports.content.document = {};
exports.content.document.details = ecms + 'documents/{document}';
exports.content.document.revision = ecms + 'documents/revisions/{revision}';
exports.content.document.element = ecms + 'documents/revisions/{revision}/element/{element}';


Object.freeze(exports);
module.exports = exports;
},{}],44:[function(require,module,exports){
(function (Buffer){
'use strict';

var log = require('../internal/logManager');
var endpoints = require('./endpoints');

var httpBase = require('http');
var httpsBase = require('https');
var http;
var url = require('url');


//convert the headers list to an queryable array which works in nodejs and browsers including ie
var convertHeaders = function (responseHeaders) {
    var header = [];
    if (!responseHeaders) return [];
    var key = 0,
        value = 1;
    for (var i = 0; i < responseHeaders.length; i++) {
        var kvp = responseHeaders[i].split(': ');
        header[kvp[key].trim()] = kvp[value].trim();
    }
    return header;
};

//create a random number to track responses for logging on multiple parallel requests
function generateRequestId() {
    return Math.floor((Math.random() * 899999) + 100000).toString();
}

var validateServiceConnection = function (serviceConnection) {
    //TODO: add check for no serviceConnection here and remove checks in caller's location

    if (!serviceConnection.serviceUrl)
        throw new Error('serviceConnection.serviceUrl is not defined');

    if (!serviceConnection._applyAuthentication)
        throw new Error('serviceConnection does not support applyAuthentication');
};

/**
 * executes async http request
 * @internal
 * @method executeHttpCall
 * @param {Object} serviceConnection object
 * @param {Object} endpoint e.g. /ecm-auth/token
 * @param {Object} method  like get, post, put, update
 * @param {Object} data  the payload to send to the server
 * @param {Object} isBinary indicated that the payload is binary, otherwise a json is expected
 * @return {Object} retruns a promise object which delives the received data in teh success handler
 */
var executeHttpCall = function (serviceUrl, endpoint, method, data, isBinary, authenticate, unauthorizedNotifier) {
    //TODO: extend function params for sending binary and receive json
    if (!method)
        method = 'GET';
    var self = this;
    var requestId = generateRequestId();

    return new Promise(function (success, fail) {
        try {
            var parsedUrl = url.parse(serviceUrl + endpoint /*url.resolve(serviceUrl,endpoint)*/ );
            log.verbose('{0} - prepare {1} request for {2}', requestId, method, parsedUrl.href);

            var requestOptions = {};
            requestOptions.method = method;
            requestOptions.host = parsedUrl.hostname;
            requestOptions.path = parsedUrl.path;
            requestOptions.protocol = parsedUrl.protocol;
            requestOptions.port = parsedUrl.port;

            log.verbose('{0} create request with options: {1}', requestId, JSON.stringify(requestOptions));

            //decide whether to take http or https depending on protocoll of parsedUrl
            if (parsedUrl.protocol === 'http:') {
                http = httpBase;
            } else {
                http = httpsBase;
            }

            //TODO: split between sendbinary and receive binary becasue a update document content can result in a json response
            if (!isBinary) {
                log.verbose('{0} set accept header to application/json', requestId);
                requestOptions.Headers = {
                    'Accept': 'application/json'
                };
            } else {
                log.verbose('{0} set accept header to application/octet-stream', requestId);
                requestOptions.Headers = {
                    'Accept': 'application/octet-stream'
                };
            }

            var req = http.request(requestOptions, function (response) {

                    if (response.setEncoding !== undefined && !isBinary) {
                        response.setEncoding('utf8');
                    }

                    log.verbose('{0} received response with status code {2} ({3}) for {1}', requestId, parsedUrl.href, response.statusCode, response.statusMessage);

                    log.verbose('{0} response headers {1}', requestId, JSON.stringify(response.headers, null, 2));

                    var useReceivedData = true;
                    switch (response.statusCode) {
                    case 200:
                        //ok
                    case 201:
                    case 202:
                    case 203:
                    case 204:
                        //no content on a put or post request
                    case 205:
                    case 206:
                    case 226:

                        break;
                    case 304:
                        //TODO: return org data
                        break;
                    case 401:
                        //be aware that 403 means the user has no right to this resource, but he send authorization
                        if (unauthorizedNotifier !== undefined) {
                            try {
                                //notify a call if requested that the use has no authorization to that call, then fail as usual
                                unauthorizedNotifier(parsedUrl.href);
                            } catch (e) {
                                log.error('{0} unauthorizedNotifier callback failed {1}', requestId, e);
                            }
                        }
                        useReceivedData = false;
                        fail('user is not authorized. try to relogin. ServerError: ' + response.statusMessage + ' (' + response.statusCode + ') at request ' + requestId);
                        break;
                    default:
                        useReceivedData = false;
                        var serviceError = convertHeaders(response.headers)['x-ecms-error-message'] || '';
                        fail('http error ' + response.statusMessage + ' (' + response.statusCode + ') ' + serviceError + ' at request ' + requestId);
                    }

                    var receivedChunks = [];

                    response.on('data', function (chunk) {
                        //store received chunk in a fast, simple way!
                        receivedChunks.push(chunk);
                    });

                    response.on('end', function () {
                        log.verbose('{0} sending received data to caller', requestId);

                        if (!useReceivedData) return;

                        var totalSize = 0;
                        var resultBuffer;

                        var encoding = 'utf8';
                        if (isBinary) encoding = 'binary';

                        // concat all chunks
                        receivedChunks.forEach(function (chunk) {
                            if (resultBuffer === undefined) {
                                resultBuffer = new Buffer(chunk, encoding);
                            } else {
                                resultBuffer = Buffer.concat([resultBuffer, new Buffer(chunk, encoding)]);
                            }
                            totalSize += chunk.length;
                        });

                        if (!isBinary) {
                            //json return required
                            var json = {};
                            try {
                                if (resultBuffer !== undefined)
                                    json = JSON.parse(resultBuffer.toString());
                            } catch (jsonError) {
                                throw new Error('json parsing failed for data: "' + json + '"' + ' at request ' + requestId + ' with Error: ' + jsonError);
                            }
                            success(json);

                        } else {

                            // gather contentType from responseHeaders
                            var respContentType = 'application/octet-stream';
                            try {
                                var respContentType = response.headers['content-type'];
                                //TODO check or use convertHeaders()
                            } catch (error) {
                                log.verbose('no content-type availible in response header');
                            }

                            // build resultJson
                            var result = {
                                data: resultBuffer,
                                dataInfo: {
                                    contentType: respContentType,
                                    size: totalSize,
                                    binaryUrl: parsedUrl.href
                                }
                            };
                            success(result);
                        }
                    });
                }) //end request callback
                .on('error', function (error) {
                    var msg = 'problem with request ' + requestId + ' Message: ' + error.message;
                    log.error(msg);
                    fail(new Error(msg));
                });

            //continue with request initializing
            if (authenticate !== undefined && authenticate instanceof Function) {
                authenticate(req);
            } else {
                log.warn('{0} no authentication handler is available. no authentication applied', requestId);
            }

            log.verbose('{0} request header {1}', requestId, requestOptions.Headers);

            if (data !== null && (method === 'POST' || method === 'UPDATE' || method === 'PUT')) {
                log.verbose('{0} write {1} bytes to service', requestId, data.length);
                //req.setHeader('Content-Length', Buffer.byteLength(data));
                if (!isBinary) {
                    req.setHeader('Content-Type', 'application/json');
                    req.write(data, 'utf8');
                } else {
                    req.setHeader('Content-Type', 'application/octet-stream');
                    req.write(data);
                }

            }

            log.info('{0} execute {1} request to {2}', requestId, req.method, req.path);
            req.end();
        } catch (promiseError) {
            log.error(promiseError);
            fail(promiseError);
        }
        //end promise
    });
};


/**
 * executes async http request
 * @internal
 * @method executeHttpCall
 * @param {Object} serviceConnection object
 * @param {Object} endpoint e.g. /ecm-auth/token
 * @param {Object} method  like get, post, put, update
 * @param {Object} data  the payload to send to the server
 * @param {Object} isBinary indicated that the payload is binary, otherwise a json is expected
 * @return {Object} retruns a promise object which delives the received data in teh success handler
 */
var executeConnectionBasedHttpCall = function (serviceConnection, endpoint, method, data, isBinary) {
    return executeHttpCall(serviceConnection.serviceUrl, endpoint, method, data, isBinary, serviceConnection._applyAuthentication, serviceConnection._unauthorizedCallback);
};

var getJson = function (serviceConnection, endpoint) {
    return executeConnectionBasedHttpCall(serviceConnection, endpoint, 'GET', null, false);
};

var getBinary = function (serviceConnection, endpoint) {
    return executeConnectionBasedHttpCall(serviceConnection, endpoint, 'GET', null, true);
};

var postJson = function (serviceConnection, endpoint, payload) {
    return executeConnectionBasedHttpCall(serviceConnection, endpoint, 'POST', JSON.stringify(payload), false);
};

var postBinary = function (serviceConnection, endpoint, payload) {
    return executeConnectionBasedHttpCall(serviceConnection, endpoint, 'POST', JSON.stringify(payload), true);
};

var putJson = function (serviceConnection, endpoint, payload) {
    return executeConnectionBasedHttpCall(serviceConnection, endpoint, 'PUT', JSON.stringify(payload), false);
};

var startAction = function (serviceConnection, endpoint) {
    return executeConnectionBasedHttpCall(serviceConnection, endpoint, 'PUT', null, false);
};

/**
 * Encode / Decode Uri
 */
var encodeUriComponent = function (parameter) {
    return encodeURIComponent(parameter);
};

var decodeUriComponent = function (parameter) {
    return decodeURIComponent(parameter);
};
var encodeUri = function (parameter) {
    return encodeURI(parameter);
};

var decodeUri = function (parameter) {
    return decodeURI(parameter);
};


var startAction = function (serviceConnection, endpoint) {
    return executeConnectionBasedHttpCall(serviceConnection, endpoint, 'PUT', null, false);
};

module.exports = {
    'validateServiceConnection': validateServiceConnection,
    'executeHttpCall': executeHttpCall,
    'getJson': getJson,
    'getBinary': getBinary,
    'postJson': postJson,
    'postBinary': postBinary,
    'putJson': putJson,
    'startAction': startAction,
    'endpoints': endpoints,
    'encodeUriComponent': encodeUriComponent,
    'decodeUriComponent': decodeUriComponent,
    'encodeUri': encodeUri,
    'decodeUri': decodeUri
};
}).call(this,require("buffer").Buffer)

},{"../internal/logManager":52,"./endpoints":43,"buffer":6,"http":22,"https":11,"url":3}],45:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager');
var User = require('./../administration/user');

/**
 * Saperion Connection Provider which organizing the communication to the service including login, token handling and login related data
 * authentication provider. Default authentication provider is {{#crossLink "BasicAuthProvider"}}{{/crossLink}}.
 * 
 * @module communication
 * @class authenticationManager
 * @type Object
 */
function Connection(serviceUrl, authProvider, unauthorizedCallback) {
    if (!serviceUrl)
        throw new Error('url is not set');
    if (!authProvider)
        throw new Error('authProvider is not defined');

    if (!authProvider.applyAuthentication)
        throw new Error('authProvider does not support applyAuthentication');

    Object.defineProperty(this, 'serviceUrl', {
        get: function () {
            return serviceUrl;
        }
    });

    Object.defineProperty(this, '_authProvider', {
        get: function () {
            return authProvider;
        }
    });

    //callback to notify sdk users about invalid credentials or expired token
    this._unauthorizedCallback = unauthorizedCallback;
    //TODO check all references to remove
    //goal: the http handler will be the only one who use this function
    this._applyAuthentication = authProvider.applyAuthentication;
}


Connection.prototype.isServiceCompatible = function () {
    //TODO: implemnt version check for service
    return true;
};

//returns a promise and finaly a token object 
Connection.prototype.login = function () {
    log.info('ServiceConnection.login');
    var self = this;
    return this._authProvider.getToken();
};

//returns the current user name on success
Connection.prototype.getCurrentUser = function () {
    var fnName = 'ServiceConnection.getCurrentUser';
    log.info(fnName);
    var self = this;
    return new Promise(function (success, failed) {
        self._authProvider.validateToken().then(function (loginData) {
                try {
                    log.verbose('using the following data to identify current user:', loginData);

                    User.getUsers(self, 1, true, ('?query=WHERE%20displayName%20EQ%20%22{login}%22').replace('{login}', loginData.login)).then(function (userList) {
                        var currentUser;
                        if (userList.data.length === 1) currentUser = userList.data[0];
                        success(currentUser);
                    }, function (error) {
                        log.error(fnName, error);
                        failed(error);
                    });
                } catch (error) {
                    log.error(fnName, error);
                    failed(error);
                }
            },
            function (error) {
                log.error(fnName, error);
                failed(error);
            });

    });
};

module.exports = Connection;
},{"./../administration/user":37,"./../internal/logManager":52}],46:[function(require,module,exports){
'use strict'

var log = require('./../internal/logManager.js');
var http = require('./httpHelper');
//var util = require('./../internal/utilities');
var AuthenticationToken = require('./authenticationToken');

/**
 * Credential Object which organizing login related data
 * authentication provider. Default authentication provider is {{#crossLink "BasicAuthProvider"}}{{/crossLink}}.
 *
 * @module communication
 * @class authenticationManager
 * @type Object
 */
function TokenAuthProvider(authServiceUrl, token) {

    if (!token) throw new Error('parameter token is missing');
    if (!authServiceUrl) throw new Error('parameter authServiceUrl is missing');

    var _authHeader;
    var _usedToken;

    Object.defineProperty(this, 'authServiceUrl', {
        get: function () {
            return authServiceUrl;
        }
    });

    this._applyNewToken = function (token) {
        log.info('TokenAuthProvider._applyNewToken');
        if (token instanceof AuthenticationToken) {
            _usedToken = token;
        } else {
            try {
                //try to deserialize an auth token
                _usedToken = AuthenticationToken.deserialize(token);
            } catch (e) {
                //try to use token as a string 
                _usedToken = new AuthenticationToken({
                    'token': token,
                    expiresIn: 60
                });
            }
        }
        _authHeader = 'Bearer ' + _usedToken.token;
    };

    /**
     * This function injects the necessary headers for authentication to a XHR / Http Request Object
     * @method prepareAuthentication
     */
    this.applyAuthentication = function (httpRequest) {
        log.info('TokenAuthProvider.applyAuthentication');
        httpRequest.setHeader('Authorization', _authHeader);
    };

    this._applyNewToken(token);
}

TokenAuthProvider.prototype.getToken = function () {
    log.info('TokenAuthProvider.getToken');
    //this function and all token validation is placed here because the auth providers just providing auth headers
    var self = this;
    return new Promise(function (success, failed) {
        try {
            http.executeHttpCall(self.authServiceUrl, http.endpoints.auth.token.renew, 'GET', null, false, self.applyAuthentication)
                .then(function (json) {
                        try {
                            //validate model
                            if (!json.token || !json.expiresIn)
                                failed(new Error('no token received. login failed!'));

                            var token = new AuthenticationToken(json);
                            self._applyNewToken(token);
                            success(token);
                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (err) {
                        log.error(err);
                        failed(err);
                    });
        } catch (err) {
            log.error(err);
            failed(err);
        }
    });
};

TokenAuthProvider.prototype.validateToken = function () {
    log.info('TokenAuthProvider.validateToken');

    var self = this;
    return new Promise(function (success, failed) {
        try {
            http.executeHttpCall(self.authServiceUrl, http.endpoints.auth.token.validate, 'GET', null, false, self.applyAuthentication)
                .then(function (json) {
                        try {
                            success({
                                login: json.ecmsUser,
                                tenant: json.ecmsTenant,
                                license: json.ecmsLicense,
                                loginBy: json.ecmsUserIdentification
                            });
                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (err) {
                        failed(err);
                    });
        } catch (err) {
            log.error(err);
            failed(err);
        }
    });
};
module.exports = TokenAuthProvider;
},{"./../internal/logManager.js":52,"./authenticationToken":41,"./httpHelper":44}],47:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var PageInfo = require('./../common/pageInfo');
var Document = require('./document');


/**
 * Saperion Archive.
 *
 * @module content
 * @class Archive
 * @type Object
 */
function Archive(serviceConnection, json) {

    // #############################################################################
    // object initialization assertions
    // #############################################################################

    //TODO: this check will be removed soon and moved to validateServiceConnection
    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    // #############################################################################
    // private properties
    // #############################################################################

    var _objectId = '';
    var _objectUrl = '';
    var _contentType = '';

    var _name;
    var _version;
    var _isolation;

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // json mapping
    // #############################################################################

    var _self = this;

    function merge(json) {
        log.verbose('create archive from json {0}', json);
        try {
            if (json !== undefined) {

                if (json.reference === undefined) {
                    throw new Error('provided json will not match ecm service model');
                }
                _objectId = json.reference.objectId;
                _objectUrl = json.reference.self;
                _contentType = json.reference.contentType;
                _name = json.reference.name;

                _version = json.version || _version;
                _isolation = json.isolation || _isolation;
            }
        } catch (error) {
            log.error('merge error for archive: {0}', error);
            throw error;
        }
    }

    function parseContentType(inputContentType) {
        if (inputContentType === Archive.contentTypes.DOCUMENT) {
            return Archive.contentTypes.DOCUMENT;
        }
        if (inputContentType === Archive.contentTypes.LOOKUP) {
            return Archive.contentTypes.LOOKUP;
        }
        if (inputContentType === Archive.contentTypes.FOLDER) {
            return Archive.contentTypes.FOLDER;
        }

        // if none of above return UNKNOWN
        return Archive.contentTypes.UNKNOWN;
    }

    if (json !== undefined) {
        merge(json);
    }


    /**
     * merge a json object with the current instance.
     * internaly used for updates from service
     * @internal
     * @property merge
     */
    this.merge = merge;

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * typed identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _objectId;
        }
    });

    /**
     * referenceUrl of this element
     * @public
     * @property referenceUrl
     */
    Object.defineProperty(this, 'referenceUrl', {
        get: function () {
            return _objectUrl;
        }
    });

    /**
     * name of the archive
     * @public
     * @property name
     */
    Object.defineProperty(this, 'name', {
        get: function () {
            return _name;
        }
    });

    /**
     * contentType of the archive
     * @public
     * @property contentType
     */
    Object.defineProperty(this, 'contentType', {
        get: function () {
            return _contentType;
        }
    });

    /**
     * version of archive
     * @public
     * @property version
     */
    Object.defineProperty(this, 'version', {
        get: function () {
            return _version;
        }
    });

    /**
     * isolation of archive
     * @public
     * @property isolation
     */
    Object.defineProperty(this, 'isolation', {
        get: function () {
            return _isolation;
        }
    });
}

// #############################################################################
// instance functions
// #############################################################################

Archive.prototype.getDocuments = function (page, detailed) {
    return Document.getDocumentsFromArchive(this, page, detailed);
};

Archive.prototype.toString = function () {
    var ret = this.name + ' (ID ' + this.id + ' | contentType: ' + this.contentType + '  | referenceUrl: ' + this.referenceUrl + ')';
    return ret;
};

// #############################################################################
// static functions
// #############################################################################

Archive.getAllArchives = function (serviceConnection, page) {
    if (page === undefined) page = 1;
    log.verbose('getAllArchives');

    return new Promise(function (success, failed) {
        try {
            http.getJson(serviceConnection, http.endpoints.content.archives.all)
                .then(function (json) {
                        try {
                            log.verbose('archives {0}', json);
                            //validate model
                            if (!json.items)
                                failed(new Error('no items collection received'));
                            //convert json to object
                            var archiveCollection = [];
                            json.items.forEach(function (archiveJson) {
                                var archive = new Archive(serviceConnection, archiveJson);
                                //INFO: Here the Archives will be filtered for just using Document-Archives
                                //TODO: change if needed
                                if (archive.contentType === Archive.contentTypes.DOCUMENT) {
                                    archiveCollection.push(archive);
                                }
                            });
                            success({
                                data: archiveCollection,
                                pageInfo: new PageInfo(json)
                            });
                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(errInit);
            failed(errInit);
        }
    });
};

Archive.contentTypes = {
    DOCUMENT: 'DOCUMENT',
    LOOKUP: 'LOOKUP',
    FOLDER: 'FOLDER',
    UNKNOWN: 'UNKNOWN'
};

Object.freeze(Archive.contentTypes);

module.exports = Archive;
},{"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../internal/logManager.js":52,"./../internal/utilities":53,"./document":50}],48:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var PageInfo = require('./../common/pageInfo');

/**
 * Saperion Content Element.
 *
 * @module content
 * @class ContentElement
 * @type Object
 */
function ContentElement(serviceConnection, json, document, parentContentElement) {
    // #############################################################################
    // object initialization assertions
    // #############################################################################

    if (!serviceConnection) {
        throw new Error('serviceConnection is not set');
    }
    http.validateServiceConnection(serviceConnection);

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // private properties
    // #############################################################################


    var _objectId = '';
    var _elementType = ContentElement.elementTypes.UNKNOWN;
    var _creationDate = '';
    var _variables = {};
    var _parent = {};

    // structureSpecific
    var _children = [];

    // fileSpecific

    var _annotations = [];
    var _hash = {};

    _hash.alorithm = '';
    _hash.value = '';

    var _uncompressedSize;
    var _compressedSize;

    var _fileName = '';
    var _isPicture = false;
    var _isChunkedOnMedium = false;
    var _isOriginalFormat = false;

    var _document;

    if (document !== undefined) {
        // TODO: check if document is really an document
        _document = document;
    }

    if (parentContentElement !== undefined) {
        // TODO: check if parentContentElement is really a contentElement
        _parent = parentContentElement;
    }

    // #############################################################################
    // json mapping
    // #############################################################################

    var _self = this;

    function merge(json) {
        var fnName = 'ContentElement.merge';
        log.verbose(fnName,'create ContentElement from json {0}', JSON.stringify(json));
        try {
            if (json !== undefined) {
                /* jshint -W106 */ // "element_type" is not camelCase
                _elementType = parseElementType(json.element_type);
                /* jshint -W106 */

                if (_elementType === ContentElement.elementTypes.UNKNOWN) {
                    log.error('merge JSON on ElementType not file or structure is not supported');
                    throw new Error('provided json will not match ecm service model: element_type not parseable');
                }

                //reference
                if (json.reference === undefined) {
                    throw new Error('provided json will not match ecm service model: reference not available');
                }
                _objectId = json.reference.objectId;
                _creationDate = json.creationDate || _creationDate;
                _variables = json.variables || _variables;


                //structureSpecific
                if (_elementType === ContentElement.elementTypes.STRUCTURE) {
                    var childs = json.children;
                    var self = _self;
                    childs.forEach(function (childJson) {
                        log.verbose('found childElementJson {0}', childJson);
                        var childContentElement = new ContentElement(
                            self.serviceConnection,
                            childJson,
                            _document,
                            self);

                        _children.push(childContentElement);
                    });

                } else if (_elementType === ContentElement.elementTypes.FILE) {
                    _annotations = json.annotations || _annotations;

                    //contentMetaData
                    if (json.contentMetaData === undefined) {
                        throw new Error('provided json will not match ecm service model: contentMetaData not available');
                    }
                    _hash.alorithm = json.contentMetaData.hashAlgorithm || _hash.alorithm;
                    _hash.value = json.contentMetaData.hash || _hash.value;
                    _uncompressedSize = json.contentMetaData.uncompressedSize;
                    _compressedSize = json.contentMetaData.compressedSize;

                    _fileName = json.fileName;
                    _isPicture = json.picture;
                    _isChunkedOnMedium = json.chunkedOnMedium;
                    _isOriginalFormat = json.originalFormat;
                } else if (_elementType === ContentElement.elementTypes.LINK) {
                    //TODO: not yet handled
                    log.info(fnName,'Handling for ContentElement LINK not yet handled');  
                }
            }
        } catch (error) {
            log.error('merge error for Element: {0}', error);
            throw error;
        }
    }

    if (json !== undefined) {
        merge(json);
    }

    /**
     * merge a json object with the current instance.
     * internaly used for updates from service
     * @internal
     * @property merge
     */
    this.merge = merge;

    function parseElementType(inputElementType) {
        if (inputElementType === ContentElement.elementTypes.FILE) {
            return ContentElement.elementTypes.FILE;
        }
        if (inputElementType === ContentElement.elementTypes.STRUCTURE) {
            return ContentElement.elementTypes.STRUCTURE;
        }
        if (inputElementType === ContentElement.elementTypes.LINK) {
            return ContentElement.elementTypes.LINK;
        }
        // if none of above return UNKNOWN
        return ContentElement.elementTypes.UNKNOWN;
    }

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * typed identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _objectId;
        }
    });

    /**
     * depended document of this element
     * @public
     * @property document
     */
    Object.defineProperty(this, 'document', {
        get: function () {
            return _document;
        }
    });
    
    /**
     * elementType of this element
     * @public
     * @property elementType
     */
    Object.defineProperty(this, 'elementType', {
        get: function () {
            return _elementType;
        }
    });

    /**
     * true if the contentElement represents a file
     * @public
     * @property isFile
     */
    Object.defineProperty(this, 'isFile', {
        get: function () {
            return _elementType === ContentElement.elementTypes.FILE;
        }
    });

    /**
     * true if the contentElement represents a structure
     * @public
     * @property isStructure
     */
    Object.defineProperty(this, 'isStructure', {
        get: function () {
            return _elementType === ContentElement.elementTypes.STRUCTURE;
        }
    });

    /**
     * true if the contentElement represents a link
     * @public
     * @property isLink
     */
    Object.defineProperty(this, 'isLink', {
        get: function () {
            return _elementType === ContentElement.elementTypes.LINK;
        }
    });
    
    /**
     * fileName identifier of this element
     * @public
     * @property fileName
     */
    Object.defineProperty(this, 'fileName', {
        get: function () {
            var res = _fileName;
            
            var index = res.lastIndexOf('/');
            if (index >=0 ) {
                res =  res.substring(index+1);
            }
            
            index = res.lastIndexOf('\\');
            if (index >=0 ) {
                res =  res.substring(index+1);
            }
            
            index = res.lastIndexOf('@');
            if (index >=0 ) {
                res =  res.substring(0,index);
            }
            return res;
        }
    });

    /**
     * size of binaryContent of the contentElement
     * @public
     * @property size
     */
    Object.defineProperty(this, 'size', {
        get: function () {
            return _uncompressedSize;
        }
    });

    /**
     * true if this contentElement contains a parent ContentElement
     * @public
     * @property hasParent
     */
    Object.defineProperty(this, 'hasParent', {
        get: function () {
            return !(_parent === undefined || _parent.keys === undefined || _parent.keys.length === 0);
        }
    });
    
        /**
     * returns the parentElement if exitsts or undefinded if this contentElement contains children elements
     * @public
     * @property parent
     */
    Object.defineProperty(this, 'parent', {
        get: function () {
            if (this.hasParent) {
                return _parent;
            } else {
                return undefined;
            }
        }
    });

    /**
     * true if this contentElement contains children
     * @public
     * @property hasChildren
     */
    Object.defineProperty(this, 'hasChildren', {
        get: function () {
            return (_children !== undefined && _children.length > 0);
        }
    });

    /**
     * returns a list of children in structure
     * @public
     * @property children
     */
    Object.defineProperty(this, 'children', {
        get: function () {
            if (this.hasChildren) {
                return _children;
            } else {
                return [];
            }
        }
    });

    /**
     * returns a flat list of children which are files
     * @public
     * @property childrenFilesList
     */
    Object.defineProperty(this, 'childrenFilesList', {
        get: function () {
            var arr = [];
            _children.forEach(function (child) {
                if (child.elementType === ContentElement.elementTypes.FILE) {
                    arr.push(child);
                }
                if (child.elementType === ContentElement.elementTypes.STRUCTURE) {
                    arr = arr.concat(child.childrenFilesList);
                }
            });

            return arr;
        }
    });
    
    /**
     * returns the hashObject of the element if it is a fileElement
     * @public
     * @property hash
     */
    Object.defineProperty(this, 'hash', {
        get: function () {
            if (this.isFile) {
                return _hash;
            } else {
                return undefined;
            }
        }
    });



} //end constructor


// #############################################################################
// instance functions
// #############################################################################

ContentElement.prototype.toString = function () {
    if (this.elementType === ContentElement.elementTypes.FILE ) {
        return 'File: ' +  this.fileName + '(Size: ' + this.size + ' Bytes | ID: ' + this.id + ')';
    } else {
        return 'Element: ' +  this.elementType + '( ID: ' + this.id + ')';
    } 
};

//update the current instance with data from service
ContentElement.prototype.getBinary = function () {
    var fnName = 'ContentElement.getBinary';
    var self = this;
    return new Promise(function (success, failed) {
        if (self.elementType !== ContentElement.elementTypes.FILE) {
            failed('get Binary not supported on element NOT file');
            return;
        }
        try {
            log.info(fnName);
            http.getBinary(self.serviceConnection, ((http.endpoints.content.document.element).replace('{revision}', self.document.revisionId)).replace('{element}', self.id))
                .then(function (bin) {
                        try {
                            log.verbose(fnName,'received binary with length: {0}', bin.length);
                            //validate model
                            if (!bin)
                                failed(new Error('no data received'));
                            success(bin);
                        } catch (err) {
                            log.error(fnName, err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

// #############################################################################
// static functions
// #############################################################################

ContentElement.elementTypes = {
    FILE: 'file',
    STRUCTURE: 'structure',
    LINK:'link',
    UNKNOWN: 'UNKNOWN'
};

Object.freeze(ContentElement.elementTypes);

module.exports = ContentElement;
},{"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../internal/logManager.js":52,"./../internal/utilities":53}],49:[function(require,module,exports){
'use strict';

var http = require('./../communication/httpHelper');
var Archive = require('./archive');
var Document = require('./document');

/**
 * Saperion Content Manager which provides access to content related functions and objects.
 * 
 * @module content
 * @class ContentManager
 * @type Object
 */
function ContentManager(serviceConnection) {
    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    Object.defineProperty(this, 'serviceConnection', {
        get: function () {
            return serviceConnection;
        }
    });
}

ContentManager.prototype.getArchives = function (page) {
    return Archive.getAllArchives(this.serviceConnection, page);
};

//TODO: describe parameters
ContentManager.prototype.getDocumentById = function (id) {
    return Document.getDocumentById(this.serviceConnection, id);
};

ContentManager.prototype.getDocumentByRevisionId = function (revisionId) {
    return Document.getDocumentByRevisionId(this.serviceConnection, revisionId);
};

ContentManager.prototype.getDocumentByUrl = function (referenceUrl) {
    return Document.getDocumentByUrl(this.serviceConnection, referenceUrl);
};

module.exports = ContentManager;
},{"./../communication/httpHelper":44,"./archive":47,"./document":50}],50:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var PageInfo = require('./../common/pageInfo');
//var Archive = require('./archive');
var ContentElement = require('./contentElement');
var Actor = require('./../common/actorReference');

/**
 * Saperion Document.
 *
 * @module content
 * @class Document
 * @type Object
 */
function Document(serviceConnection, json, archive) {
    // #############################################################################
    // object initialization assertions
    // #############################################################################

    if (!serviceConnection) {
        throw new Error('serviceConnection is not set');
    }
    http.validateServiceConnection(serviceConnection);

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // private properties
    // #############################################################################

    var _documentId = '';
    var _objectUrl = '';
    var _revisionId = '';
    var _previousRevisionId = '';
    var _indexData = {};

    var _content;

    //TODO: remove later: just temporary
    var _contentJson = '';


    var _archive = {};

    if (archive !== undefined) {
        // TODO: check if archive is really an archive
        _archive = archive;
    }

    var _creationDate;
    var _creationUser;
    var _lastModificationDate;
    var _lastModificationUser;

    // #############################################################################
    // json mapping
    // #############################################################################

    var _self = this;

    function merge(json) {
        var fnName = 'Document.merge';
        log.verbose(fnName, 'create document from json {0}', JSON.stringify(json));
        try {
            if (json !== undefined) {

                //reference
                if (json.reference !== undefined) {
                    // json from service
                    _revisionId = json.reference.objectId;
                    _objectUrl = json.reference.self;
                } else {
                    // json as documentReference
                    _objectUrl = json.self;
                }

                if (json.documentId !== undefined) {
                    _documentId = json.documentId.objectId;
                }

                if (json.previousRevisionId !== undefined) {
                    _previousRevisionId = json.previousRevisionId.objectId || _documentId;
                }

                //archiveReference
                if (json.archiveReference !== undefined && _archive === undefined) {
                    //if json.archiveReference is available in JSON: call was potentially from document.update
                    //if json.archiveReference is NOT available in JSON: call was from potetially from archive.getDocuments
                    //There is no need to update _archive if its already existing (would "never" change and from document.update there will be just a reference)
                    //_archive = new Archive(_self.serviceConnection, json.archiveReference);
                }

                //indexData
                _indexData = json.indexData || _indexData;

                //modificationMetaData
                if (json.modificationMetaData !== undefined) {
                    _creationDate = json.modificationMetaData.creationDate;
                    _creationUser = new Actor(_self.serviceConnection, json.modificationMetaData.creationUser);
                    _lastModificationDate = json.modificationMetaData.lastModificationDate;
                    _lastModificationUser = new Actor(_self.serviceConnection, json.modificationMetaData.lastModificationUser);
                }
                
                //TODO: contentMetaData:ignored for now

                //documentElement
                if (json.documentElement !== undefined) {
                    _contentJson = json.documentElement;
                    _content = new ContentElement(_self.serviceConnection, json.documentElement, _self);
                }
            }
        } catch (error) {
            log.error(fnName, 'merge error for document: {0}', error);
            throw error;
        }
    }

    if (json !== undefined) {
        merge(json);
    }

    /**
     * merge a json object with the current instance.
     * internaly used for updates from service
     * @internal
     * @property merge
     */
    this.merge = merge;

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * typed identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _documentId;
        }
    });

    /**
     * referenceUrl of this element
     * @public
     * @property referenceUrl
     */
    Object.defineProperty(this, 'referenceUrl', {
        get: function () {
            return _objectUrl;
        }
    });

    /**
     * revisionId of this element
     * @public
     * @property revisionId
     */
    Object.defineProperty(this, 'revisionId', {
        get: function () {
            return _revisionId;
        }
    });

    /**
     * previousRevisionId of this element
     * @public
     * @property previousRevisionId
     */
    Object.defineProperty(this, 'previousRevisionId', {
        get: function () {
            return _previousRevisionId;
        }
    });

    /**
     * returns whether document has previous revision or not
     * @public
     * @property hasPreviousRevision
     */
    Object.defineProperty(this, 'hasPreviousRevision', {
        get: function () {
            return (_previousRevisionId !== undefined) && (_previousRevisionId.length > 0);
        }
    });

    /**
     * indexData of the Document
     * @public
     * @property indexData
     */
    Object.defineProperty(this, 'indexData', {
        get: function () {
            return _indexData;
        }
    });

    /**
     * creationDate of the Document
     * @public
     * @property creationDate
     */
    Object.defineProperty(this, 'creationDate', {
        get: function () {
            return new Date(_creationDate);
        }
    });

    /**
     * creator of the Document
     * @public
     * @property creator
     */
    Object.defineProperty(this, 'creator', {
        get: function () {
            return _creationUser;
        }
    });

    /**
     * lastModificationDate of the Document
     * @public
     * @property lastModificationDate
     */
    Object.defineProperty(this, 'lastModificationDate', {
        get: function () {
            return new Date(_lastModificationDate);
        }
    });

    /**
     * lastModifier of the Document
     * @public
     * @property lastModifier
     */
    Object.defineProperty(this, 'lastModifier', {
        get: function () {
            return _lastModificationUser;
        }
    });

    /**
     * Archive where this document is located
     * @public
     * @property archive
     */
    Object.defineProperty(this, 'archive', {
        get: function () {
            return _archive;
        }
    });

    /**
     * false if this document does not contains content
     * @public
     * @property hasContent
     */
    Object.defineProperty(this, 'hasContent', {
        get: function () {
            return (_content !== undefined);
        }
    });

    /**
     * ConntentElement of this document 
     * @public
     * @property element
     */
    Object.defineProperty(this, 'content', {
        get: function () {
            if (this.hasContent) {
                return _content;
            }
            return {};
        }
    });

    /**
     * List of all ContentElements of this document which are Filess
     * @public
     * @property element
     */
    Object.defineProperty(this, 'contentList', {
        get: function () {
            if (this.hasContent) {
                if (this.content.elementType === ContentElement.elementTypes.FILE) {
                    return [this.content];
                } else {
                    return _content.childrenFilesList;
                }
            }
            return [];
        }
    });


    /**
     * false if this document info contains only a reduced set of data (specified by the service collections)
     * @public
     * @property isReduced
     */
    Object.defineProperty(this, 'isReduced', {
        get: function () {
            return this.hasContent === false;
        }
    });

} //end constructor


// #############################################################################
// instance functions
// #############################################################################

Document.prototype.toString = function () {
    return 'Document: (ID ' + this.id + '  | from archive: ' + this.archive.name + ')';
};

//refreshes  the current instance with data from service
Document.prototype.refresh = function () {
    var fnName = 'Document.refresh';
    var self = this;
    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            var url = self.referenceUrl;

            if (url === undefined || url.length === 0) {
                log.error(fnName, 'invalid url: ' + url);
                failed(new Error('Error on url information'));
            }

            http.getJson(self.serviceConnection, url)
                .then(function (json) {
                        try {
                            log.verbose(fnName, 'received document: {0}', JSON.stringify(json));
                            //validate model
                            if (!json)
                                failed(new Error('no json received'));
                            self.merge(json);
                            success(self);
                        } catch (err) {
                            log.error(fnName, err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

Document.prototype.getPreviousRevision = function () {
    var fnName = 'Document.getPreviousRevision';
    log.info(fnName);
    if (!this.hasPreviousRevision) {
        log.info(fnName, 'no previous revision available');
        throw Error('no previous revision available');
    }
    
    return Document.getDocumentByRevisionId(this.previousRevisionId);
};

// #############################################################################
// static functions
// #############################################################################


Document.getDocumentById = function (serviceConnection, id) {
    var fnName = 'Document.getDocumentById';
    log.info(fnName);

    //TODO: think about placeHolder
    var url = (http.endpoints.content.document.details).replace('{document}', id);

    return Document.getDocumentByUrl(serviceConnection, url);
};

Document.getDocumentByRevisionId = function (serviceConnection, revisionId) {
    var fnName = 'Document.getDocumentByRevisionId';
    log.info(fnName);

    var url = (http.endpoints.content.document.revision).replace('{revision}', revisionId);

    return Document.getDocumentByUrl(serviceConnection, url);
};

Document.getDocumentByUrl = function (serviceConnection, url) {
    var fnName = 'Document.getDocumentByObjectUrl';

    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            if (url === undefined || url.length === 0) {
                log.error(fnName, 'invalid url: ' + url);
                failed(new Error('Error on url'));
            }

            http.getJson(serviceConnection, url)
                .then(function (json) {
                        try {
                            log.verbose('received json: {0}', JSON.stringify(json));

                            if (!json)
                                failed(new Error('no json received'));
                            var doc = new Document(serviceConnection, json);
                            success(doc);
                        } catch (err) {
                            log.error(fnName, err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};


Document.getDocumentsFromArchive = function (archive, page, detailed) {
    var fnName = 'Document.getDocumentsFromArchive';
    if (page === undefined) page = 1;
    if (detailed === undefined) detailed = false;

    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(archive.serviceConnection, (http.endpoints.content.archives.documents.all).replace('{archive}', http.encodeUriComponent(archive.id)))
                .then(function (json) {
                        try {
                            log.verbose(fnName, 'received documents: {0}', JSON.stringify(json));

                            //validate model
                            if (!json.items)
                                failed(new Error('no items collection received'));

                            //convert json to object
                            var documentCollection = [];
                            var promiseCollection = [];

                            json.items.forEach(function (documentJson) {
                                var document = new Document(archive.serviceConnection, documentJson, archive);
                                documentCollection.push(document);
                                if (detailed) {
                                    promiseCollection.push(document.refresh());
                                }
                            });

                            Promise.all(promiseCollection).then(function (detailedDocumentCollection) {
                                log.info(fnName, 'all documents received');
                                success({
                                    data: documentCollection,
                                    pageInfo: new PageInfo(json)
                                });
                            }, function (error) {
                                log.error(fnName, error);
                                failed(error);
                            });

                        } catch (err) {
                            log.error(fnName, err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

module.exports = Document;
},{"./../common/actorReference":39,"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../internal/logManager.js":52,"./../internal/utilities":53,"./contentElement":48}],51:[function(require,module,exports){
// in this class we defining the public sdk api and exposing all necessary objects / functions

var logger = require('./internal/logManager.js');
logger.setLogLevel(logger.levels.Warn);

var utilities = require('./internal/utilities');

const sdkVersion = '0.5.0';
//this value will be compared with teh service product version major
const minServiceVersionMajor = 1;
//this value will be compared with teh service product version major
const minServiceVersionMinor = 0;

var sdk = sdk || {};

sdk.utilities = sdk.utilities || {};
sdk.configuration = sdk.configuration || {};

/**
 * Available log levels.
 * 
 * @property level {Object} Log levels.
 *  @property {Number} level.None Disable logging.
 *  @property {Number} level.Error Log errors.
 *  @property {Number} level.Warn Log warnings.
 *  @property {Number} level.Info Log info.
 *  @property {Number} level.Verbose Log everything.
 * @static
 * 
 */
sdk.configuration.logLevels = logger.levels;

/**
 * Set log level.
 * 
 * @method setLogLevel
 * @param {type} level
 * 
 * @throws {Error} Not existing log level.
 */
sdk.configuration.setLogLevel = logger.setLogLevel;

//TODO: documentation
sdk.CredentialAuthentication = require('./communication/credentialAuthProvider');

sdk.TokenAuthentication = require('./communication/tokenAuthProvider.js');

sdk.AuthenticationToken = require('./communication/authenticationToken');

sdk.ServiceConnection = require('./communication/serviceConnection');

sdk.WorkflowManager = require('./workflow/workflowManager');

sdk.ContentManager = require('./content/contentManager');

//sdk.DocumentManager = require('./documents/documentManager');

sdk.UserManager = require('./administration/userManager');

/*
//helpers
sdk.utilities.isNonEmptyString = function (s) {
    return ((typeof s === 'string') && s.length && s.length > 0);
};
*/

/**
 * Version of the sdk
 * 
 * @property sdkVersion
 * @public
 * @type string
 */
sdk.version = sdkVersion;
//Object.freeze(sdk.version);

/**
 * Version of service api which is compatible with the SDK. It indicates
 * the minimal needed api version.
 * 
 * @property apiCompatible
 * @private
 * @type Number
 */
sdk.minServiceVersion = minServiceVersionMajor + '.' + minServiceVersionMinor;
//Object.freeze(sdk.compatibleAPI);

/**
 * Get and compare service api version, whether it is compatible with
 * the version which SDK needs.
 * 
 * @method isServiceApiCompatible
 * @async
 * @private
 * @returns {Promise} If promise is rejected then it means that service
 * is not compatible with the sdk.
 */
/*
function isServiceApiCompatible() {
    var logger = Saperion.common.loggerManager;
    logger.write(logger.levels.Verbose, 'ENTER isServiceApiCompatible()');
    var mainPromise = Saperion.$.Deferred();

    var req = Saperion.http.get(Saperion.getServiceUrl());

    req.execute().then(function (resp) {
        var serviceVersion = resp.headers['X-ECM-Protocol-Version'];
        if (serviceVersion >= apiCompatible) {
            logger.write(logger.levels.Info, 'Service API version can be used by SDK for communication. Service API version: {0}', serviceVersion);
            mainPromise.resolve();
            return;
        }
        logger.write(logger.levels.Error, 'Service API version can not be used by SDK for communication. Service API version: {0}', serviceVersion);
        mainPromise.reject();
    }, function (resp) {
        var serviceVersion = resp.headers['X-ECM-Protocol-Version'];
        logger.write(logger.levels.Error, 'Service API version can not be used by SDK for communication. Service API version: {0}', serviceVersion);
        mainPromise.reject();
    });
    logger.write(logger.levels.Verbose, 'LEAVE isServiceApiCompatible()');

    return mainPromise;
}
*/

//browser specific extensions
sdk.browser = {};
/**
 * convert a data array to a blob and returns the local object url to the data
 * @private
 * @method getObjectUrlForBrowser
 * @param {Object} dataArray
 * @param {Object} contentType - optional
 * @return {Object} url as string
 */
sdk.browser.createObjectUrl = utilities.getObjectUrlForBrowser;

logger.write(logger.levels.verbose, 'sdk loaded');
module.exports = sdk;
},{"./administration/userManager":38,"./communication/authenticationToken":41,"./communication/credentialAuthProvider":42,"./communication/serviceConnection":45,"./communication/tokenAuthProvider.js":46,"./content/contentManager":49,"./internal/logManager.js":52,"./internal/utilities":53,"./workflow/workflowManager":56}],52:[function(require,module,exports){
'use strict';

/**
 * Logger manager provides interface for logging.
 * 
 * @module common
 * @class loggerManager
 * @type Object
 */
var logManager = (function () {

    /**
     * Available log levels.
     * 
     * @property level {Object} Log levels.
     *  @property {Number} level.None Disable logging.
     *  @property {Number} level.Error Log errors.
     *  @property {Number} level.Warn Log warnings.
     *  @property {Number} level.Info Log info.
     *  @property {Number} level.Verbose Log everything.
     * @static
     * 
     */
    var logLevels = {
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
        /**
         * Log level.
         * 
         * @property logLevel
         * @type Number
         * @default 1 - Error
         */
        logLevel = logLevels.Error;

    /**
     * Write log message.
     * 
     * @method write
     * @param {Number} level Log level according to available log levels.
     * @param {String} message Log message.
     */
    function write(level, message /*parameters to replace*/ ) {
        if (logLevel >= level) {
            //take all args except the first two
            var dataToReplace = Array.prototype.slice.call(arguments, 2);
            var messageToLog = prepareMessagToLog(message, dataToReplace);
            console.log(messageToLog);
        }
    }

    function verbose(message, data) {
        Array.prototype.unshift.call(arguments, logLevels.Verbose);
        write.apply(this, arguments);
    }

    function info(message) {
        Array.prototype.unshift.call(arguments, logLevels.Info);
        write.apply(this, arguments);
    }

    function warn(message) {
        Array.prototype.unshift.call(arguments, logLevels.Warn);
        write.apply(this, arguments);
    }

    function error(message) {
        Array.prototype.unshift.call(arguments, logLevels.Error);
        write.apply(this, arguments);
    }

    /**
     * Set log level.
     * 
     * @method setLogLevel
     * @param {type} level
     * 
     * @throws {Error} Not existing log level.
     */
    function setLogLevel(level) {

        var exists = false;
        var keys = Object.keys(logLevels);
        for (var i = 0; i < keys.length; i++) {
            var logLevelValue = logLevels[keys[i]];

            if (logLevelValue === level) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            throw new Error('Not existing log level.');
        }

        logLevel = level;
    }
    /**
     * Preapre message which will be logged out.
     * @method prepareMessageToLog
     * @private
     * @param  {String} message String where are placeholders to replace.
     * @param  {Array} data     Data which will replace placeholders in message.
     * @return {String}         String whit replaced values.
     */
    function prepareMessagToLog(message, data) {
        for (var i = 0; i < data.length; i++) {
            var serializedData = data[i];

            if (typeof data[i] !== 'string') {
                serializedData = JSON.stringify(data[i]);
            }

            var placeholder1 = '{' + i + '}';
            var placeholder2 = '%' + i + '%';

            if (message.indexOf(placeholder1) < 0 && message.indexOf(placeholder2) < 0) message += ' --> ' + data[i];

            message = message.replace(placeholder1, serializedData);
            message = message.replace(placeholder2, serializedData);
        }
        return message;
    }

    return {
        levels: logLevels,
        setLogLevel: setLogLevel,
        write: write,
        verbose: verbose,
        info: info,
        warn: warn,
        error: error
    };

})();


module.exports = logManager;
},{}],53:[function(require,module,exports){
(function (Buffer){
'use strict'
module.exports = {};

function toBase64(input) {
    return new Buffer(input).toString('base64');
}

module.exports.toBase64 = toBase64;

function fromBase64(input) {
    return new Buffer(input, 'base64').toString('ascii');
}

module.exports.fromBase64 = fromBase64;


/**
 * True if the environment is nodejs
 * @private
 * @method isNodeJs
 * @return {Object} true for nodejs
 */
function isNodeJs() {
    return (typeof window === 'undefined');
}
module.exports.isNodeJs = isNodeJs;

/**
 * True if the Environment is a Browser
 * @private
 * @method isBrowser
 * @return {Object} true if browser
 */
function isBrowser() {
    return (!isNodeJs());
}
module.exports.isBrowser = isBrowser;


/**
 * convert a data array to a blob and returns the local object url to the data
 * @private
 * @method getObjectUrlForBrowser
 * @param {Object} dataArray
 * @param {Object} contentType - optional
 * @return {Object} url as string
 */
function getObjectUrlForBrowser(dataArray, contentType) {
    /*global Blob */
    if (isNodeJs()) throw new Error('function is only supported in browser mode');

    if (contentType === undefined) contentType = 'application/octet-stream';
    var arrayBufferView = new Uint8Array(dataArray);
    var blob = new Blob([arrayBufferView], {
        type: contentType
    });
    //console.log('arrayBufferViewSize', arrayBufferView.length);
    //console.log('BlobSize', blob.size);
    var urlCreator = window.URL || window.webkitURL;
    var objectUrl = urlCreator.createObjectURL(blob);
    return objectUrl;
}
module.exports.getObjectUrlForBrowser = getObjectUrlForBrowser;
}).call(this,require("buffer").Buffer)

},{"buffer":6}],54:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var Owner = require('./../common/actorReference');
var PageInfo = require('./../common/pageInfo');
var WorkflowTask = require('./workflowTask');

/**
 * Saperion Workflow Inox.
 * 
 * @module workflow
 * @class Inox
 * @type Object
 */
function Inbox(serviceConnection, json) {

    // #############################################################################
    // object initialization assertions
    // #############################################################################

    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    // #############################################################################
    // private properties
    // #############################################################################

    var _id = 0;
    var _objectId = '';
    var _objectUrl = '';
    var _name = '';
    var _type = '';
    var _unreadCount = 0;
    var _totalCount = 0;
    var _owner;

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // json mapping
    // #############################################################################

    //todo create a merge from json and tojson function
    if (json !== undefined) {
        //TODO Logger.verbose('create inbox from json {0}', json);
        //console.log(json);
        //map the data from json 
        if (json.reference === undefined) {
            throw new Error('provided json will not match ecm service model');
        }
        _id = json.reference.id || _id;
        _objectId = json.reference.objectId;
        //todo json.self is a reference to this inbox for update or other calls we have to use it 
        _objectUrl = json.reference.self;

        _name = json.name || _name;
        _type = json.type || _type;
        _unreadCount = json.unreadCount || _unreadCount;
        _totalCount = json.totalCount || _totalCount;
        if (json.owner !== undefined) {
            _owner = new Owner(serviceConnection, json.owner);
        }

    }

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * typed identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _objectId;
        }
    });


    /**
     * id of the element in the saperion backend
     * @public
     * @property id
     */
    Object.defineProperty(this, 'saperionId', {
        get: function () {
            return _id;
        }
    });


    /**
     * name of the inbox
     * @public
     * @property id
     */
    Object.defineProperty(this, 'name', {
        get: function () {
            return _name;
        },
        set: function (value) {
            if (value !== undefined) {
                _name = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * type of the inbox
     * @public
     * @property id
     */
    Object.defineProperty(this, 'type', {
        get: function () {
            return _type;
        },
        set: function (value) {
            if (value !== undefined) {
                //TODO add check of valid types
                _type = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * count of unreaded elements in this inbox
     * @public
     * @property id
     */
    Object.defineProperty(this, 'unreadCount', {
        get: function () {
            return _unreadCount;
        },
        set: function (value) {
            if (value !== undefined && Number.isInteger(value)) {
                _unreadCount = value;
            } else {
                throw new Error('value is not a integer');
            }
        }
    });

    /**
     * cont of total elements in this inbox
     * @public
     * @property id
     */
    Object.defineProperty(this, 'totalCount', {
        get: function () {
            return _totalCount;
        },
        set: function (value) {
            if (value !== undefined && Number.isInteger(value)) {
                _totalCount = value;
            } else {
                throw new Error('value is not a integer');
            }
        }
    });

    /**
     * owner of this inbox
     * @public
     * @property id
     */
    Object.defineProperty(this, 'owner', {
        get: function () {
            return _owner;
        },
        set: function (value) {
            if (value !== undefined) {
                _owner = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });
} //end constructor


// #############################################################################
// instance functions
// #############################################################################

Inbox.prototype.getWorkflowTasks = function (page, detailed) {
    return WorkflowTask.getTasks(this, page, detailed);
};

Inbox.prototype.toString = function () {
    var ret = this.name + ' / ' + this.type + ' (ID ' + this.id + ')';
    return ret;
};

// #############################################################################
// static functions
// #############################################################################

Inbox.getAllInboxes = function (serviceConnection, page) {
    if (page === undefined) page = 1;
    log.verbose('getAllInboxes');

    return new Promise(function (success, failed) {
        try {
            http.getJson(serviceConnection, http.endpoints.workflow.inboxes.all)
                .then(function (json) {
                        try {
                            log.verbose('inboxes {0}', json);
                            //validate model
                            if (!json.items)
                                failed(new Error('no items collection received'));
                            //convert json to object
                            var inboxCollection = [];
                            json.items.forEach(function (inboxJson) {
                                var inbox = new Inbox(serviceConnection, inboxJson);
                                inboxCollection.push(inbox);
                            });
                            success({
                                data: inboxCollection,
                                pageInfo: new PageInfo(json)
                            });
                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(errInit);
            failed(errInit);
        }
    });
};
module.exports = Inbox;
},{"./../common/actorReference":39,"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../internal/logManager.js":52,"./../internal/utilities":53,"./workflowTask":57}],55:[function(require,module,exports){
(function (process){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var PageInfo = require('./../common/pageInfo');
var Actor = require('./../common/actorReference');

/**
 * Saperion Workflow Task.
 * 
 * @module workflow
 * @class Inox
 * @type Object
 */
function WorkflowProcess(serviceConnection, json) {

    // #############################################################################
    // object initialization assertions
    // #############################################################################

    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    // #############################################################################
    // private properties
    // #############################################################################

    var _id = 0;
    var _objectId = '';
    var _objectUrl = '';
    var _name = '';
    var _owner;
    var _document;
    var _state;
    var _timeInformation;
    var _workflowDefinition;

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // json mapping
    // #############################################################################

    var _self = this;

    function merge(json) {
        log.verbose('create workflow process from json {0}', json);
        if (json !== undefined) {

            if (json.reference === undefined) {
                throw new Error('provided json will not match ecm service model');
            }
            _id = json.reference.id || _id;
            _objectId = json.reference.objectId;
            //json.self is a reference to this object for update or other calls we have to use it 
            _objectUrl = json.reference.self;

            _name = json.description || _name;

            _name = json.name;
            _owner = new Actor(serviceConnection, process.owner);
            _document = {}; //TODO add document instance
            _state = json.state;
            _timeInformation = json.timeInformation;

        } else {
            throw new Error('json is empty or undefined');
        }
    }

    if (json !== undefined) {
        merge(json);
    }

    /**
     * merge a json object with the current instance.
     * internaly used for updates from service
     * @internal
     * @property merge
     */
    this.merge = merge;

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * typed identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _objectId;
        }
    });

    /**
     * id of the element in the saperion backend
     * @public
     * @property id
     */
    Object.defineProperty(this, 'saperionId', {
        get: function () {
            return _id;
        }
    });


    /**
     * name of the inbox
     * @public
     * @property id
     */
    Object.defineProperty(this, 'name', {
        get: function () {
            return _name;
        },
        set: function (value) {
            if (value !== undefined) {
                _name = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * false if this process info contains only a reduced set of data (specified by the service collections)
     * @public
     * @property id
     */
    Object.defineProperty(this, 'isReduced', {
        get: function () {
            return (_definition === undefined);
        }
    });


} //end constructor


// #############################################################################
// instance functions
// #############################################################################


//load additional 
WorkflowProcess.prototype.update = function () {
    //doc: https: //ecm-service.psft.co/ecms/json_TaskType.html
    var self = this;
    return new Promise(function (success, failed) {
        try {
            log.info('WorkflowTask.update');
            http.getJson(self.serviceConnection, (http.endpoints.workflow.task).replace('{task}', self.id))
                .then(function (json) {
                        try {
                            //log.verbose('received task: {0}', json);
                            //validate model
                            if (!json)
                                failed(new Error('no json received'));
                            self.merge(json);
                            success(self);
                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(errInit);
            failed(errInit);
        }
    });
};


WorkflowProcess.prototype.toString = function () {
    var ret = this.description + ' / ' + this.subject + ' / ' + this.actor.name + ' (ID ' + this.id + ')';
    return ret;
};

// #############################################################################
// static functions
// #############################################################################

WorkflowProcess.getTasks = function (inbox, page, detailed) {
    //inbox = the parent obejt
    //detailed = true / false  if true then we retrun a complete task object aotherwise only a simple (id, name)
    //doc: https: //ecm-service.psft.co/ecms/json_TaskType.html
    if (detailed === undefined) detailed = false;
    if (page === undefined) page = 1;

    return new Promise(function (success, failed) {
        try {
            log.info('getTasks');
            http.getJson(inbox.serviceConnection, (http.endpoints.workflow.inboxes.tasks).replace('{inbox}', inbox.id))
                .then(function (json) {
                        try {
                            log.verbose('received tasks: {0}', json);
                            //validate model
                            if (!json.items)
                                failed(new Error('no items collection received'));

                            //convert json to object
                            var taskCollection = [];
                            json.items.forEach(function (taskJson) {
                                var task = new WorkflowTask(inbox.serviceConnection, taskJson, inbox);
                                taskCollection.push(task);
                            });

                            if (detailed) {
                                var promiseCollection = [];
                                taskCollection.forEach(function (task) {
                                    promiseCollection.push(task.update());
                                });

                                Promise.all(promiseCollection)
                                    .then(function (detailedTaskCollection) {
                                        log.info('all tasks received');
                                        success({
                                            data: detailedTaskCollection,
                                            pageInfo: new PageInfo(json)
                                        });
                                    });
                                //end if detailed
                            } else {
                                //simple response
                                success({
                                    data: taskCollection,
                                    pageInfo: new PageInfo(json)
                                });
                            }

                        } catch (err) {
                            log.error(err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            failed(errInit);
        }
    });
};


module.exports = WorkflowProcess;
}).call(this,require('_process'))

},{"./../common/actorReference":39,"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../internal/logManager.js":52,"./../internal/utilities":53,"_process":17}],56:[function(require,module,exports){
'use strict';

var util = require('./../internal/utilities');
var http = require('./../communication/httpHelper');
var Inbox = require('./inbox');

/**
 * Saperion Workflow Manager which provides access to worklfow related functions and objects.
 * 
 * @module workflow
 * @class workflowManager
 * @type Object
 */
function WorkflowManager(serviceConnection) {
    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    Object.defineProperty(this, 'serviceConnection', {
        get: function () {
            return serviceConnection;
        }
    });
}

WorkflowManager.prototype.getInboxes = function (page) {
    return Inbox.getAllInboxes(this.serviceConnection, page);
};

//WorkflowManager.prototype.createInbox = function (page) {
//    return new Inbox(this.serviceConnection);
//throw new Error('not implemented yet');
//TODO P3: implement
//};


WorkflowManager.prototype.getWorkflowDefinitions = function (page) {
    throw new Error('not implemented yet');
    //TODO P3: implement
    //return Inbox.getAllInboxes(this.serviceConnection, page);
};

module.exports = WorkflowManager;
},{"./../communication/httpHelper":44,"./../internal/utilities":53,"./inbox":54}],57:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var WorkflowProcess = require('./process.js');
var Actor = require('./../common/actorReference');
var PageInfo = require('./../common/pageInfo');
var WorkflowTaskTransition = require('./workflowTaskTransition');
var Document = require('./../content/document');


/**
 * Saperion Workflow Task.
 * 
 * @module workflow
 * @class WorkflowTask
 * @type Object
 */
function WorkflowTask(serviceConnection, json, inbox) {

    // #############################################################################
    // object initialization assertions
    // #############################################################################

    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    // #############################################################################
    // private properties
    // #############################################################################

    var _inbox = inbox;

    var _id = 0;
    var _objectId = '';
    var _referenceUrl = '';

    var _description = '';
    var _isRead = false;

    var _priority = 0;
    var _actor;
    var _previousActor;
    var _process;
    var _receiveDate = json.receiveDate;
    var _subject = json.subject;
    var _userFields = json.userFields;

    var _capabilities;
    
    //TODO:has to be moved to workflowProcess
    var _documentReference;

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // json mapping
    // #############################################################################

    var _self = this;

    function merge(json) {
        log.verbose('create task from json {0}', JSON.stringify(json));
        try {
            if (json !== undefined) {

                if (json.reference === undefined) {
                    throw new Error('provided json will not match ecm service model');
                }

                _id = json.reference.id || _id;
                _objectId = json.reference.objectId;
                _referenceUrl = json.reference.self;

                _description = json.description || _description;

                _priority = json.priority || _priority;
                if (json.actor !== undefined) {
                    _actor = new Actor(serviceConnection, json.actor);
                }

                if (json.previousActor !== undefined) {
                    _previousActor = new Actor(serviceConnection, json.previousActor);
                }

                if (json.process !== undefined) {
                    _process = new WorkflowProcess(serviceConnection, json.process);
                    
                    //TODO:has to be moved to workflowProcess
                    if (json.process.documentReference !== undefined) {
                        _documentReference = json.process.documentReference;
                    }
                }
                _receiveDate = json.receiveDate || _receiveDate;
                _subject = json.subject || _subject;
                _userFields = json.userFields || _userFields;

                _capabilities = json.capabilities || [];
            }
        } catch (error) {
            log.error('merge error for workflow task: {0}', error);
            throw error;
        }
    }

    if (json !== undefined) {
        merge(json);
    }


    /**
     * merge a json object with the current instance.
     * internaly used for updates from service
     * @internal
     * @property merge
     */
    this.merge = merge;

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * typed identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _objectId;
        }
    });

    /**
     * id of the element in the saperion backend
     * @public
     * @property saperionId
     */
    Object.defineProperty(this, 'saperionId', {
        get: function () {
            return _id;
        }
    });

    /**
     * The REST Url of this Object
     * @public
     * @property referenceUrl
     */
    Object.defineProperty(this, 'referenceUrl', {
        get: function () {
            return _referenceUrl;
        }
    });

    /**
     * description of the element
     * @public
     * @property description
     */
    Object.defineProperty(this, 'description', {
        get: function () {
            return _description;
        },
        set: function (value) {
            if (value !== undefined) {
                _description = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * task is readed
     * @public
     * @property isRead
     */
    Object.defineProperty(this, 'isRead', {
        get: function () {
            return _isRead;
        },
        set: function (value) {
            if (value !== undefined) {
                _isRead = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * task priority
     * @public
     * @property priority
     */
    Object.defineProperty(this, 'priority', {
        get: function () {
            return _priority;
        },
        set: function (value) {
            if (value !== undefined) {
                _priority = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * current actor for this workflow task or undefined
     * @public
     * @property actor
     */
    Object.defineProperty(this, 'actor', {
        get: function () {
            return _actor;
        },
        set: function (value) {
            if (value !== undefined) {
                _actor = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * previous actor for this workflow task or undefined
     * @public
     * @property previousActor
     */
    Object.defineProperty(this, 'previousActor', {
        get: function () {
            return _previousActor;
        }
    });

    /**
     * the instance of a workflow where these task belongs to
     * @public
     * @property process
     */
    Object.defineProperty(this, 'process', {
        get: function () {
            return _process;
        }
    });

    /**
     * timestamp where teh task was received
     * @public
     * @property receiveDate
     */
    Object.defineProperty(this, 'receiveDate', {
        get: function () {
            return new Date(_receiveDate);
        }
    });

    /**
     * title of the task
     * @public
     * @property subject
     */
    Object.defineProperty(this, 'subject', {
        get: function () {
            return _subject;
        },
        set: function (value) {
            if (value !== undefined) {
                _subject = value;
            } else {
                throw new Error('value is not defined');
            }
        }
    });

    /**
     * false if this task contains only a reduced set of data (specified by the service collections)
     * @public
     * @property isReduced
     */
    Object.defineProperty(this, 'isReduced', {
        get: function () {
            return (_process === undefined);
        }
    });


    //TODO: think about a setter for userFields, because they are limited

    /**
     * a collection of fields which can be assigen dto a workflow task
     * @public
     * @property userFields
     */
    Object.defineProperty(this, 'userFields', {
        get: function () {
            return _userFields;
        }
    });

    //TODO:has to be moved to workflowProcess
    /**
     * returns a document
     * @public
     * @property document
     */
    Object.defineProperty(this, 'document', {
        get: function () {
            return new Document(this.serviceConnection,_documentReference);
        }
    });

    //TODO:has to be moved to workflowProcess
    /**
     * false if this task has document reference
     * @public
     * @property hasDocument
     */
    Object.defineProperty(this, 'hasDocument', {
        get: function () {
            return (_documentReference !== undefined);
        }
    });

    /**
     * true if the task can moved to the personal inbox (take ownership)
     * @public
     * @property canMoveToMyInbox
     */
    Object.defineProperty(this, 'canMoveToMyInbox', {
        get: function () {
            return (_capabilities.indexOf('CAN_TAKE') !== -1);
        }
    });

    /**
     * true if the task can moved to the personal inbox (reject ownership)
     * @public
     * @property canMoveToPreviousInbox
     */
    Object.defineProperty(this, 'canMoveToPreviousInbox', {
        get: function () {
            return (_capabilities.indexOf('CAN_PUT_BACK') !== -1);
        }
    });

} //end constructor


// #############################################################################
// instance functions
// #############################################################################


WorkflowTask.prototype.toString = function () {
    var ret = this.description + ' / ' + this.subject;
    if (this.actor !== undefined)
        ret += ' / ' + this.actor.name;

    ret += ' (ID ' + this.id + ')';
    return ret;
};

//update the current instance with data from service
WorkflowTask.prototype.refresh = function () {
    //doc: https: //ecm-service.psft.co/ecms/json_TaskType.html
    var fnName = 'WorkflowTask.refresh';
    var self = this;

    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(self.serviceConnection, (self.referenceUrl))
                .then(function (json) {
                        try {
                            log.verbose('received task: {0}', json);
                            //validate model
                            if (!json)
                                failed(new Error('no data received'));
                            self.merge(json);
                            success(self);
                        } catch (error) {
                            log.error(fnName, error);
                            failed(error);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

WorkflowTask.prototype.moveToMyInbox = function () {
    //doc: https: //ecm-service.psft.co/ecms/json_TaskType.html
    var fnName = 'WorkflowTask.moveToMyInbox';
    var self = this;
    if (!this.canMoveToMyInbox) throw new Error('operation not allowed');
    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.startAction(self.serviceConnection, http.endpoints.workflow.task.takeOwnership.replace('{task}', http.encodeUriComponent(self.id)))
                .then(function () {
                        log.info('{0} for {1} executed', fnName, self.toString());
                        self.refresh().then(function () {
                            success(self);
                        }, function (error) {
                            log.error(fnName, error);
                            failed(error);
                        });
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

WorkflowTask.prototype.moveToPreviousInbox = function () {
    //doc: https: //ecm-service.psft.co/ecms/json_TaskType.html
    var fnName = 'WorkflowTask.moveToPreviousInbox';
    var self = this;
    if (!this.canMoveToPreviousInbox) throw new Error('operation not allowed');
    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.startAction(self.serviceConnection, http.endpoints.workflow.task.revokeOwnership.replace('{task}',  http.encodeUriComponent(self.id)))
                .then(function () {
                        log.info('{0} for {1} executed', fnName, self.toString());
                        self.refresh().then(function () {
                            success(self);
                        }, function (error) {
                            log.error(fnName, error);
                            failed(error);
                        });
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

WorkflowTask.prototype.getTransitions = function () {
    return WorkflowTaskTransition.getTransitions(this);
};

// #############################################################################
// static functions
// #############################################################################

WorkflowTask.getTasks = function (inbox, page, detailed) {
    //doc: https: //ecm-service.psft.co/ecms/json_TaskType.html
    var fnName = 'WorkflowTask.getTasks';

    //inbox = the parent obejt
    //detailed = true / false  if true then we retrun a complete task object aotherwise only a simple (id, name)
    if (detailed === undefined) detailed = false;
    if (page === undefined) page = 1;

    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(inbox.serviceConnection, (http.endpoints.workflow.inboxes.tasks).replace('{inbox}', inbox.id))
                .then(function (json) {
                        try {
                            //validate model
                            if (!json.items) {
                                log.verbose('received data: {0}', JSON.stringify(json, null, 2));
                                failed(new Error('no items collection received'));
                                return;
                            }

                            var promiseCollection = [];
                            var taskCollection = [];
                            json.items.forEach(function (taskJson) {
                                var task = new WorkflowTask(inbox.serviceConnection, taskJson, inbox);
                                taskCollection.push(task);
                                if (detailed) promiseCollection.push(task.refresh());
                            });


                            Promise.all(promiseCollection)
                                .then(function (promiseResults) {
                                    success({
                                        data: taskCollection,
                                        pageInfo: new PageInfo(json)
                                    });
                                }, function (error) {
                                    log.error(fnName, error);
                                    failed(error);
                                });

                        } catch (err) {
                            log.error(fnName, err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

WorkflowTask.getTask = function (serviceConnection, taskId, inbox) {
    throw new Error('not implemented yet');
};

module.exports = WorkflowTask;
},{"./../common/actorReference":39,"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../content/document":50,"./../internal/logManager.js":52,"./../internal/utilities":53,"./process.js":55,"./workflowTaskTransition":58}],58:[function(require,module,exports){
'use strict';

var log = require('./../internal/logManager.js');
var http = require('./../communication/httpHelper');
var util = require('./../internal/utilities');
var WorkflowProcess = require('./process.js');
var Actor = require('./../common/actorReference');
var PageInfo = require('./../common/pageInfo');

/**
 * Saperion Workflow Task transition (exits)
 * 
 * @module workflow
 * @class Inox
 * @type Object
 */
function WorkflowTaskTransition(serviceConnection, json, task) {

    // #############################################################################
    // object initialization assertions
    // #############################################################################

    if (!serviceConnection)
        throw new Error('serviceConnection is not set');

    http.validateServiceConnection(serviceConnection);

    // #############################################################################
    // private properties
    // #############################################################################

    var _task = task;
    var _id = 0;
    var _commentRequired = false;
    var _description = '';

    var _potentialRecipients;
    var _recipientSelectionRule;

    /**
     * connection which is used for communication
     * @public
     * @property serviceConnection
     */
    this.serviceConnection = serviceConnection;

    // #############################################################################
    // json mapping
    // #############################################################################

    var _self = this;

    function merge(json) {
        log.verbose('create transition from json {0}', JSON.stringify(json));
        try {
            if (json !== undefined) {

                _id = json.id || _id;
                _description = json.description || _description;
                _commentRequired = json.commentRequired || _commentRequired;
                if (json.recipientSelection !== undefined) {
                    //TODO Map objects
                    _potentialRecipients = [];
                    _recipientSelectionRule = {};
                }
            }
        } catch (error) {
            log.error('merge error for workflow task transition: {0}', error);
            throw error;
        }
    }

    if (json !== undefined) {
        merge(json);
    }

    /**
     * merge a json object with the current instance.
     * internaly used for updates from service
     * @internal
     * @property merge
     */
    this.merge = merge;

    // #############################################################################
    // getter and setter
    // #############################################################################

    /**
     * identifier of this element
     * @public
     * @property id
     */
    Object.defineProperty(this, 'id', {
        get: function () {
            return _id;
        }
    });


    /**
     * commentRequired
     * @public
     * @property commentRequired
     */
    Object.defineProperty(this, 'commentRequired', {
        get: function () {
            return _commentRequired;
        }
    });

    /**
     * task transition description
     * @public
     * @property description
     */
    Object.defineProperty(this, 'description', {
        get: function () {
            return _description;
        }
    });

    /**
     * list of allowed potentialRecipients or an empty array
     * @public
     * @property potentialReceipients
     */
    Object.defineProperty(this, 'potentialRecipients', {
        get: function () {
            return _potentialRecipients || [];
        }
    });

    /**
     * rules to select a recipient for this task or undefined
     * @public
     * @property recipientSelectionRule
     */
    Object.defineProperty(this, 'recipientSelectionRule', {
        get: function () {
            return _recipientSelectionRule;
        }
    });

    /**
     * reference to the task where this transition belongs to
     * @public
     * @property task
     */
    Object.defineProperty(this, 'task', {
        get: function () {
            return _task;
        }
    });

} //end constructor


// #############################################################################
// instance functions
// #############################################################################

WorkflowTaskTransition.prototype.toString = function () {
    var ret = this.description + ' (ID ' + this.id + ')';
    return ret;
};

WorkflowTaskTransition.prototype.apply = function (comment, recipients) {
    //task = the parent object
    //doc: https://ecm-service.psft.co/ecms/json_TransitionDefinitionType.html
    var fnName = 'WorkflowTaskTransition.apply';
    var self = this;

    return new Promise(function (success, failed) {
        try {
            log.info(fnName);

            var payload = {};
            payload.transitionId = self.id;
            if (comment) payload.comment = comment;
            if (Array.isArray(recipients)) {
                var recipientReferences = [];
                recipients.forEach(function (recipient) {
                    recipientReferences.push(recipient.toServiceActorReference());
                });
                payload.recipients = recipientReferences;
            }
            log.verbose('{0} data to send : {1}', fnName, payload);
            http.postJson(self.serviceConnection, (http.endpoints.workflow.task.forward).replace('{task}', self.task.id), payload)
                .then(function () {
                        log.info('{0} for {1} executed', fnName, self.toString());
                        success(self);
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

//POST /workflow/tasks/{taskId}/forward


// #############################################################################
// static functions
// #############################################################################

WorkflowTaskTransition.getTransitions = function (task) {
    //task = the parent object
    //doc: https://ecm-service.psft.co/ecms/json_TransitionDefinitionType.html
    var fnName = 'WorkflowTaskTransition.getTransitions';
    return new Promise(function (success, failed) {
        try {
            log.info(fnName);
            http.getJson(task.serviceConnection, (http.endpoints.workflow.task.transitions).replace('{task}', task.id))
                .then(function (json) {
                        try {
                            //log.verbose('received transitions: {0}', json);

                            var responseCollection = [];
                            json.forEach(function (itemJson) {
                                var itemObj = new WorkflowTaskTransition(task.serviceConnection, itemJson, task);
                                responseCollection.push(itemObj);
                            });

                            //we return a pageInfo even if there is no paged response, to be equal to other collection calls
                            success({
                                data: responseCollection,
                                pageInfo: new PageInfo()
                            });

                        } catch (err) {
                            log.error(fnName, err);
                            failed(err);
                        }
                    },
                    function (errHttp) {
                        log.error(fnName, errHttp);
                        failed(errHttp);
                    });
        } catch (errInit) {
            log.error(fnName, errInit);
            failed(errInit);
        }
    });
};

module.exports = WorkflowTaskTransition;
},{"./../common/actorReference":39,"./../common/pageInfo":40,"./../communication/httpHelper":44,"./../internal/logManager.js":52,"./../internal/utilities":53,"./process.js":55}]},{},[51])(51)
});


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvaW5kZXguanMiLCJzcmMvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsInNyYy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXJsL3VybC5qcyIsInNyYy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiLCJzcmMvbm9kZV9tb2R1bGVzL2J1ZmZlci1zaGltcy9pbmRleC5qcyIsInNyYy9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwic3JjL25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanMiLCJzcmMvbm9kZV9tb2R1bGVzL2J1aWx0aW4tc3RhdHVzLWNvZGVzL2Jyb3dzZXIuanMiLCJzcmMvbm9kZV9tb2R1bGVzL2NvcmUtdXRpbC1pcy9saWIvdXRpbC5qcyIsInNyYy9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsInNyYy9ub2RlX21vZHVsZXMvaHR0cHMtYnJvd3NlcmlmeS9pbmRleC5qcyIsInNyYy9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsInNyYy9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsInNyYy9ub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwic3JjL25vZGVfbW9kdWxlcy9wcm9jZXNzLW5leHRpY2stYXJncy9pbmRleC5qcyIsInNyYy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL25vZGVfbW9kdWxlcy9wdW55Y29kZS9wdW55Y29kZS5qcyIsInNyYy9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsInNyYy9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsInNyYy9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2luZGV4LmpzIiwic3JjL25vZGVfbW9kdWxlcy9zdHJlYW0taHR0cC9pbmRleC5qcyIsInNyYy9ub2RlX21vZHVsZXMvc3RyZWFtLWh0dHAvbGliL2NhcGFiaWxpdHkuanMiLCJzcmMvbm9kZV9tb2R1bGVzL3N0cmVhbS1odHRwL2xpYi9yZXF1ZXN0LmpzIiwic3JjL25vZGVfbW9kdWxlcy9zdHJlYW0taHR0cC9saWIvcmVzcG9uc2UuanMiLCJzcmMvbm9kZV9tb2R1bGVzL3N0cmVhbS1odHRwL25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fZHVwbGV4LmpzIiwic3JjL25vZGVfbW9kdWxlcy9zdHJlYW0taHR0cC9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3Bhc3N0aHJvdWdoLmpzIiwic3JjL25vZGVfbW9kdWxlcy9zdHJlYW0taHR0cC9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3JlYWRhYmxlLmpzIiwic3JjL25vZGVfbW9kdWxlcy9zdHJlYW0taHR0cC9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcyIsInNyYy9ub2RlX21vZHVsZXMvc3RyZWFtLWh0dHAvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV93cml0YWJsZS5qcyIsInNyYy9ub2RlX21vZHVsZXMvc3RyZWFtLWh0dHAvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvaW50ZXJuYWwvc3RyZWFtcy9CdWZmZXJMaXN0LmpzIiwic3JjL25vZGVfbW9kdWxlcy9zdHJlYW0taHR0cC9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL3JlYWRhYmxlLmpzIiwic3JjL25vZGVfbW9kdWxlcy9zdHJpbmdfZGVjb2Rlci9pbmRleC5qcyIsInNyYy9ub2RlX21vZHVsZXMvdG8tYXJyYXlidWZmZXIvaW5kZXguanMiLCJzcmMvbm9kZV9tb2R1bGVzL3V0aWwtZGVwcmVjYXRlL2Jyb3dzZXIuanMiLCJzcmMvbm9kZV9tb2R1bGVzL3h0ZW5kL2ltbXV0YWJsZS5qcyIsInNyYy9zcmMvYWRtaW5pc3RyYXRpb24vdXNlci5qcyIsInNyYy9zcmMvYWRtaW5pc3RyYXRpb24vdXNlck1hbmFnZXIuanMiLCJzcmMvc3JjL2NvbW1vbi9hY3RvclJlZmVyZW5jZS5qcyIsInNyYy9zcmMvY29tbW9uL3BhZ2VJbmZvLmpzIiwic3JjL3NyYy9jb21tdW5pY2F0aW9uL2F1dGhlbnRpY2F0aW9uVG9rZW4uanMiLCJzcmMvc3JjL2NvbW11bmljYXRpb24vY3JlZGVudGlhbEF1dGhQcm92aWRlci5qcyIsInNyYy9zcmMvY29tbXVuaWNhdGlvbi9lbmRwb2ludHMuanMiLCJzcmMvc3JjL2NvbW11bmljYXRpb24vaHR0cEhlbHBlci5qcyIsInNyYy9zcmMvY29tbXVuaWNhdGlvbi9zZXJ2aWNlQ29ubmVjdGlvbi5qcyIsInNyYy9zcmMvY29tbXVuaWNhdGlvbi90b2tlbkF1dGhQcm92aWRlci5qcyIsInNyYy9zcmMvY29udGVudC9hcmNoaXZlLmpzIiwic3JjL3NyYy9jb250ZW50L2NvbnRlbnRFbGVtZW50LmpzIiwic3JjL3NyYy9jb250ZW50L2NvbnRlbnRNYW5hZ2VyLmpzIiwic3JjL3NyYy9jb250ZW50L2RvY3VtZW50LmpzIiwic3JjL3NyYy9pbmRleC5qcyIsInNyYy9zcmMvaW50ZXJuYWwvbG9nTWFuYWdlci5qcyIsInNyYy9zcmMvaW50ZXJuYWwvdXRpbGl0aWVzLmpzIiwic3JjL3NyYy93b3JrZmxvdy9pbmJveC5qcyIsInNyYy9zcmMvd29ya2Zsb3cvcHJvY2Vzcy5qcyIsInNyYy9zcmMvd29ya2Zsb3cvd29ya2Zsb3dNYW5hZ2VyLmpzIiwic3JjL3NyYy93b3JrZmxvdy93b3JrZmxvd1Rhc2suanMiLCJzcmMvc3JjL3dvcmtmbG93L3dvcmtmbG93VGFza1RyYW5zaXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3dkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4NkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9lQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNhcGVyaW9uLXNkay1icm93c2VyLWRlYnVnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBwbGFjZUhvbGRlcnNDb3VudCAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuICAvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG4gIC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcbiAgLy8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuICByZXR1cm4gYjY0W2xlbiAtIDJdID09PSAnPScgPyAyIDogYjY0W2xlbiAtIDFdID09PSAnPScgPyAxIDogMFxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG4gIHJldHVybiBiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIobGVuICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLG51bGwsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwdW55Y29kZSA9IHJlcXVpcmUoJ3B1bnljb2RlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5leHBvcnRzLnBhcnNlID0gdXJsUGFyc2U7XG5leHBvcnRzLnJlc29sdmUgPSB1cmxSZXNvbHZlO1xuZXhwb3J0cy5yZXNvbHZlT2JqZWN0ID0gdXJsUmVzb2x2ZU9iamVjdDtcbmV4cG9ydHMuZm9ybWF0ID0gdXJsRm9ybWF0O1xuXG5leHBvcnRzLlVybCA9IFVybDtcblxuZnVuY3Rpb24gVXJsKCkge1xuICB0aGlzLnByb3RvY29sID0gbnVsbDtcbiAgdGhpcy5zbGFzaGVzID0gbnVsbDtcbiAgdGhpcy5hdXRoID0gbnVsbDtcbiAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgdGhpcy5wb3J0ID0gbnVsbDtcbiAgdGhpcy5ob3N0bmFtZSA9IG51bGw7XG4gIHRoaXMuaGFzaCA9IG51bGw7XG4gIHRoaXMuc2VhcmNoID0gbnVsbDtcbiAgdGhpcy5xdWVyeSA9IG51bGw7XG4gIHRoaXMucGF0aG5hbWUgPSBudWxsO1xuICB0aGlzLnBhdGggPSBudWxsO1xuICB0aGlzLmhyZWYgPSBudWxsO1xufVxuXG4vLyBSZWZlcmVuY2U6IFJGQyAzOTg2LCBSRkMgMTgwOCwgUkZDIDIzOTZcblxuLy8gZGVmaW5lIHRoZXNlIGhlcmUgc28gYXQgbGVhc3QgdGhleSBvbmx5IGhhdmUgdG8gYmVcbi8vIGNvbXBpbGVkIG9uY2Ugb24gdGhlIGZpcnN0IG1vZHVsZSBsb2FkLlxudmFyIHByb3RvY29sUGF0dGVybiA9IC9eKFthLXowLTkuKy1dKzopL2ksXG4gICAgcG9ydFBhdHRlcm4gPSAvOlswLTldKiQvLFxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHNpbXBsZSBwYXRoIFVSTFxuICAgIHNpbXBsZVBhdGhQYXR0ZXJuID0gL14oXFwvXFwvPyg/IVxcLylbXlxcP1xcc10qKShcXD9bXlxcc10qKT8kLyxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIHJlc2VydmVkIGZvciBkZWxpbWl0aW5nIFVSTHMuXG4gICAgLy8gV2UgYWN0dWFsbHkganVzdCBhdXRvLWVzY2FwZSB0aGVzZS5cbiAgICBkZWxpbXMgPSBbJzwnLCAnPicsICdcIicsICdgJywgJyAnLCAnXFxyJywgJ1xcbicsICdcXHQnXSxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIG5vdCBhbGxvd2VkIGZvciB2YXJpb3VzIHJlYXNvbnMuXG4gICAgdW53aXNlID0gWyd7JywgJ30nLCAnfCcsICdcXFxcJywgJ14nLCAnYCddLmNvbmNhdChkZWxpbXMpLFxuXG4gICAgLy8gQWxsb3dlZCBieSBSRkNzLCBidXQgY2F1c2Ugb2YgWFNTIGF0dGFja3MuICBBbHdheXMgZXNjYXBlIHRoZXNlLlxuICAgIGF1dG9Fc2NhcGUgPSBbJ1xcJyddLmNvbmNhdCh1bndpc2UpLFxuICAgIC8vIENoYXJhY3RlcnMgdGhhdCBhcmUgbmV2ZXIgZXZlciBhbGxvd2VkIGluIGEgaG9zdG5hbWUuXG4gICAgLy8gTm90ZSB0aGF0IGFueSBpbnZhbGlkIGNoYXJzIGFyZSBhbHNvIGhhbmRsZWQsIGJ1dCB0aGVzZVxuICAgIC8vIGFyZSB0aGUgb25lcyB0aGF0IGFyZSAqZXhwZWN0ZWQqIHRvIGJlIHNlZW4sIHNvIHdlIGZhc3QtcGF0aFxuICAgIC8vIHRoZW0uXG4gICAgbm9uSG9zdENoYXJzID0gWyclJywgJy8nLCAnPycsICc7JywgJyMnXS5jb25jYXQoYXV0b0VzY2FwZSksXG4gICAgaG9zdEVuZGluZ0NoYXJzID0gWycvJywgJz8nLCAnIyddLFxuICAgIGhvc3RuYW1lTWF4TGVuID0gMjU1LFxuICAgIGhvc3RuYW1lUGFydFBhdHRlcm4gPSAvXlsrYS16MC05QS1aXy1dezAsNjN9JC8sXG4gICAgaG9zdG5hbWVQYXJ0U3RhcnQgPSAvXihbK2EtejAtOUEtWl8tXXswLDYzfSkoLiopJC8sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgY2FuIGFsbG93IFwidW5zYWZlXCIgYW5kIFwidW53aXNlXCIgY2hhcnMuXG4gICAgdW5zYWZlUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBuZXZlciBoYXZlIGEgaG9zdG5hbWUuXG4gICAgaG9zdGxlc3NQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IGFsd2F5cyBjb250YWluIGEgLy8gYml0LlxuICAgIHNsYXNoZWRQcm90b2NvbCA9IHtcbiAgICAgICdodHRwJzogdHJ1ZSxcbiAgICAgICdodHRwcyc6IHRydWUsXG4gICAgICAnZnRwJzogdHJ1ZSxcbiAgICAgICdnb3BoZXInOiB0cnVlLFxuICAgICAgJ2ZpbGUnOiB0cnVlLFxuICAgICAgJ2h0dHA6JzogdHJ1ZSxcbiAgICAgICdodHRwczonOiB0cnVlLFxuICAgICAgJ2Z0cDonOiB0cnVlLFxuICAgICAgJ2dvcGhlcjonOiB0cnVlLFxuICAgICAgJ2ZpbGU6JzogdHJ1ZVxuICAgIH0sXG4gICAgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuXG5mdW5jdGlvbiB1cmxQYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICh1cmwgJiYgdXRpbC5pc09iamVjdCh1cmwpICYmIHVybCBpbnN0YW5jZW9mIFVybCkgcmV0dXJuIHVybDtcblxuICB2YXIgdSA9IG5ldyBVcmw7XG4gIHUucGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCk7XG4gIHJldHVybiB1O1xufVxuXG5VcmwucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24odXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAoIXV0aWwuaXNTdHJpbmcodXJsKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQYXJhbWV0ZXIgJ3VybCcgbXVzdCBiZSBhIHN0cmluZywgbm90IFwiICsgdHlwZW9mIHVybCk7XG4gIH1cblxuICAvLyBDb3B5IGNocm9tZSwgSUUsIG9wZXJhIGJhY2tzbGFzaC1oYW5kbGluZyBiZWhhdmlvci5cbiAgLy8gQmFjayBzbGFzaGVzIGJlZm9yZSB0aGUgcXVlcnkgc3RyaW5nIGdldCBjb252ZXJ0ZWQgdG8gZm9yd2FyZCBzbGFzaGVzXG4gIC8vIFNlZTogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTI1OTE2XG4gIHZhciBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nKSxcbiAgICAgIHNwbGl0dGVyID1cbiAgICAgICAgICAocXVlcnlJbmRleCAhPT0gLTEgJiYgcXVlcnlJbmRleCA8IHVybC5pbmRleE9mKCcjJykpID8gJz8nIDogJyMnLFxuICAgICAgdVNwbGl0ID0gdXJsLnNwbGl0KHNwbGl0dGVyKSxcbiAgICAgIHNsYXNoUmVnZXggPSAvXFxcXC9nO1xuICB1U3BsaXRbMF0gPSB1U3BsaXRbMF0ucmVwbGFjZShzbGFzaFJlZ2V4LCAnLycpO1xuICB1cmwgPSB1U3BsaXQuam9pbihzcGxpdHRlcik7XG5cbiAgdmFyIHJlc3QgPSB1cmw7XG5cbiAgLy8gdHJpbSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgLy8gVGhpcyBpcyB0byBzdXBwb3J0IHBhcnNlIHN0dWZmIGxpa2UgXCIgIGh0dHA6Ly9mb28uY29tICBcXG5cIlxuICByZXN0ID0gcmVzdC50cmltKCk7XG5cbiAgaWYgKCFzbGFzaGVzRGVub3RlSG9zdCAmJiB1cmwuc3BsaXQoJyMnKS5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBUcnkgZmFzdCBwYXRoIHJlZ2V4cFxuICAgIHZhciBzaW1wbGVQYXRoID0gc2ltcGxlUGF0aFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgICBpZiAoc2ltcGxlUGF0aCkge1xuICAgICAgdGhpcy5wYXRoID0gcmVzdDtcbiAgICAgIHRoaXMuaHJlZiA9IHJlc3Q7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gc2ltcGxlUGF0aFsxXTtcbiAgICAgIGlmIChzaW1wbGVQYXRoWzJdKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gc2ltcGxlUGF0aFsyXTtcbiAgICAgICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5zZWFyY2guc3Vic3RyKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5zZWFyY2guc3Vic3RyKDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICAgICAgdGhpcy5xdWVyeSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb3RvID0gcHJvdG9jb2xQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gIGlmIChwcm90bykge1xuICAgIHByb3RvID0gcHJvdG9bMF07XG4gICAgdmFyIGxvd2VyUHJvdG8gPSBwcm90by50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMucHJvdG9jb2wgPSBsb3dlclByb3RvO1xuICAgIHJlc3QgPSByZXN0LnN1YnN0cihwcm90by5sZW5ndGgpO1xuICB9XG5cbiAgLy8gZmlndXJlIG91dCBpZiBpdCdzIGdvdCBhIGhvc3RcbiAgLy8gdXNlckBzZXJ2ZXIgaXMgKmFsd2F5cyogaW50ZXJwcmV0ZWQgYXMgYSBob3N0bmFtZSwgYW5kIHVybFxuICAvLyByZXNvbHV0aW9uIHdpbGwgdHJlYXQgLy9mb28vYmFyIGFzIGhvc3Q9Zm9vLHBhdGg9YmFyIGJlY2F1c2UgdGhhdCdzXG4gIC8vIGhvdyB0aGUgYnJvd3NlciByZXNvbHZlcyByZWxhdGl2ZSBVUkxzLlxuICBpZiAoc2xhc2hlc0Rlbm90ZUhvc3QgfHwgcHJvdG8gfHwgcmVzdC5tYXRjaCgvXlxcL1xcL1teQFxcL10rQFteQFxcL10rLykpIHtcbiAgICB2YXIgc2xhc2hlcyA9IHJlc3Quc3Vic3RyKDAsIDIpID09PSAnLy8nO1xuICAgIGlmIChzbGFzaGVzICYmICEocHJvdG8gJiYgaG9zdGxlc3NQcm90b2NvbFtwcm90b10pKSB7XG4gICAgICByZXN0ID0gcmVzdC5zdWJzdHIoMik7XG4gICAgICB0aGlzLnNsYXNoZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaG9zdGxlc3NQcm90b2NvbFtwcm90b10gJiZcbiAgICAgIChzbGFzaGVzIHx8IChwcm90byAmJiAhc2xhc2hlZFByb3RvY29sW3Byb3RvXSkpKSB7XG5cbiAgICAvLyB0aGVyZSdzIGEgaG9zdG5hbWUuXG4gICAgLy8gdGhlIGZpcnN0IGluc3RhbmNlIG9mIC8sID8sIDssIG9yICMgZW5kcyB0aGUgaG9zdC5cbiAgICAvL1xuICAgIC8vIElmIHRoZXJlIGlzIGFuIEAgaW4gdGhlIGhvc3RuYW1lLCB0aGVuIG5vbi1ob3N0IGNoYXJzICphcmUqIGFsbG93ZWRcbiAgICAvLyB0byB0aGUgbGVmdCBvZiB0aGUgbGFzdCBAIHNpZ24sIHVubGVzcyBzb21lIGhvc3QtZW5kaW5nIGNoYXJhY3RlclxuICAgIC8vIGNvbWVzICpiZWZvcmUqIHRoZSBALXNpZ24uXG4gICAgLy8gVVJMcyBhcmUgb2Jub3hpb3VzLlxuICAgIC8vXG4gICAgLy8gZXg6XG4gICAgLy8gaHR0cDovL2FAYkBjLyA9PiB1c2VyOmFAYiBob3N0OmNcbiAgICAvLyBodHRwOi8vYUBiP0BjID0+IHVzZXI6YSBob3N0OmMgcGF0aDovP0BjXG5cbiAgICAvLyB2MC4xMiBUT0RPKGlzYWFjcyk6IFRoaXMgaXMgbm90IHF1aXRlIGhvdyBDaHJvbWUgZG9lcyB0aGluZ3MuXG4gICAgLy8gUmV2aWV3IG91ciB0ZXN0IGNhc2UgYWdhaW5zdCBicm93c2VycyBtb3JlIGNvbXByZWhlbnNpdmVseS5cblxuICAgIC8vIGZpbmQgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGFueSBob3N0RW5kaW5nQ2hhcnNcbiAgICB2YXIgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9zdEVuZGluZ0NoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKGhvc3RFbmRpbmdDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZWl0aGVyIHdlIGhhdmUgYW4gZXhwbGljaXQgcG9pbnQgd2hlcmUgdGhlXG4gICAgLy8gYXV0aCBwb3J0aW9uIGNhbm5vdCBnbyBwYXN0LCBvciB0aGUgbGFzdCBAIGNoYXIgaXMgdGhlIGRlY2lkZXIuXG4gICAgdmFyIGF1dGgsIGF0U2lnbjtcbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpIHtcbiAgICAgIC8vIGF0U2lnbiBjYW4gYmUgYW55d2hlcmUuXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0U2lnbiBtdXN0IGJlIGluIGF1dGggcG9ydGlvbi5cbiAgICAgIC8vIGh0dHA6Ly9hQGIvY0BkID0+IGhvc3Q6YiBhdXRoOmEgcGF0aDovY0BkXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJywgaG9zdEVuZCk7XG4gICAgfVxuXG4gICAgLy8gTm93IHdlIGhhdmUgYSBwb3J0aW9uIHdoaWNoIGlzIGRlZmluaXRlbHkgdGhlIGF1dGguXG4gICAgLy8gUHVsbCB0aGF0IG9mZi5cbiAgICBpZiAoYXRTaWduICE9PSAtMSkge1xuICAgICAgYXV0aCA9IHJlc3Quc2xpY2UoMCwgYXRTaWduKTtcbiAgICAgIHJlc3QgPSByZXN0LnNsaWNlKGF0U2lnbiArIDEpO1xuICAgICAgdGhpcy5hdXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIH1cblxuICAgIC8vIHRoZSBob3N0IGlzIHRoZSByZW1haW5pbmcgdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IG5vbi1ob3N0IGNoYXJcbiAgICBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub25Ib3N0Q2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2Yobm9uSG9zdENoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG4gICAgLy8gaWYgd2Ugc3RpbGwgaGF2ZSBub3QgaGl0IGl0LCB0aGVuIHRoZSBlbnRpcmUgdGhpbmcgaXMgYSBob3N0LlxuICAgIGlmIChob3N0RW5kID09PSAtMSlcbiAgICAgIGhvc3RFbmQgPSByZXN0Lmxlbmd0aDtcblxuICAgIHRoaXMuaG9zdCA9IHJlc3Quc2xpY2UoMCwgaG9zdEVuZCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoaG9zdEVuZCk7XG5cbiAgICAvLyBwdWxsIG91dCBwb3J0LlxuICAgIHRoaXMucGFyc2VIb3N0KCk7XG5cbiAgICAvLyB3ZSd2ZSBpbmRpY2F0ZWQgdGhhdCB0aGVyZSBpcyBhIGhvc3RuYW1lLFxuICAgIC8vIHNvIGV2ZW4gaWYgaXQncyBlbXB0eSwgaXQgaGFzIHRvIGJlIHByZXNlbnQuXG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG5cbiAgICAvLyBpZiBob3N0bmFtZSBiZWdpbnMgd2l0aCBbIGFuZCBlbmRzIHdpdGggXVxuICAgIC8vIGFzc3VtZSB0aGF0IGl0J3MgYW4gSVB2NiBhZGRyZXNzLlxuICAgIHZhciBpcHY2SG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lWzBdID09PSAnWycgJiZcbiAgICAgICAgdGhpcy5ob3N0bmFtZVt0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDFdID09PSAnXSc7XG5cbiAgICAvLyB2YWxpZGF0ZSBhIGxpdHRsZS5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgdmFyIGhvc3RwYXJ0cyA9IHRoaXMuaG9zdG5hbWUuc3BsaXQoL1xcLi8pO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBob3N0cGFydHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gaG9zdHBhcnRzW2ldO1xuICAgICAgICBpZiAoIXBhcnQpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICB2YXIgbmV3cGFydCA9ICcnO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBrID0gcGFydC5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoaikgPiAxMjcpIHtcbiAgICAgICAgICAgICAgLy8gd2UgcmVwbGFjZSBub24tQVNDSUkgY2hhciB3aXRoIGEgdGVtcG9yYXJ5IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAgIC8vIHdlIG5lZWQgdGhpcyB0byBtYWtlIHN1cmUgc2l6ZSBvZiBob3N0bmFtZSBpcyBub3RcbiAgICAgICAgICAgICAgLy8gYnJva2VuIGJ5IHJlcGxhY2luZyBub24tQVNDSUkgYnkgbm90aGluZ1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9ICd4JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gcGFydFtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgdGVzdCBhZ2FpbiB3aXRoIEFTQ0lJIGNoYXIgb25seVxuICAgICAgICAgIGlmICghbmV3cGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgICAgdmFyIHZhbGlkUGFydHMgPSBob3N0cGFydHMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB2YXIgbm90SG9zdCA9IGhvc3RwYXJ0cy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICB2YXIgYml0ID0gcGFydC5tYXRjaChob3N0bmFtZVBhcnRTdGFydCk7XG4gICAgICAgICAgICBpZiAoYml0KSB7XG4gICAgICAgICAgICAgIHZhbGlkUGFydHMucHVzaChiaXRbMV0pO1xuICAgICAgICAgICAgICBub3RIb3N0LnVuc2hpZnQoYml0WzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RIb3N0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXN0ID0gJy8nICsgbm90SG9zdC5qb2luKCcuJykgKyByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ob3N0bmFtZSA9IHZhbGlkUGFydHMuam9pbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaG9zdG5hbWUubGVuZ3RoID4gaG9zdG5hbWVNYXhMZW4pIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaG9zdG5hbWVzIGFyZSBhbHdheXMgbG93ZXIgY2FzZS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIC8vIElETkEgU3VwcG9ydDogUmV0dXJucyBhIHB1bnljb2RlZCByZXByZXNlbnRhdGlvbiBvZiBcImRvbWFpblwiLlxuICAgICAgLy8gSXQgb25seSBjb252ZXJ0cyBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgdGhhdFxuICAgICAgLy8gaGF2ZSBub24tQVNDSUkgY2hhcmFjdGVycywgaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZlxuICAgICAgLy8geW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0IGFscmVhZHkgaXMgQVNDSUktb25seS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSBwdW55Y29kZS50b0FTQ0lJKHRoaXMuaG9zdG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBwID0gdGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyc7XG4gICAgdmFyIGggPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuICAgIHRoaXMuaG9zdCA9IGggKyBwO1xuICAgIHRoaXMuaHJlZiArPSB0aGlzLmhvc3Q7XG5cbiAgICAvLyBzdHJpcCBbIGFuZCBdIGZyb20gdGhlIGhvc3RuYW1lXG4gICAgLy8gdGhlIGhvc3QgZmllbGQgc3RpbGwgcmV0YWlucyB0aGVtLCB0aG91Z2hcbiAgICBpZiAoaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS5zdWJzdHIoMSwgdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChyZXN0WzBdICE9PSAnLycpIHtcbiAgICAgICAgcmVzdCA9ICcvJyArIHJlc3Q7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IHJlc3QgaXMgc2V0IHRvIHRoZSBwb3N0LWhvc3Qgc3R1ZmYuXG4gIC8vIGNob3Agb2ZmIGFueSBkZWxpbSBjaGFycy5cbiAgaWYgKCF1bnNhZmVQcm90b2NvbFtsb3dlclByb3RvXSkge1xuXG4gICAgLy8gRmlyc3QsIG1ha2UgMTAwJSBzdXJlIHRoYXQgYW55IFwiYXV0b0VzY2FwZVwiIGNoYXJzIGdldFxuICAgIC8vIGVzY2FwZWQsIGV2ZW4gaWYgZW5jb2RlVVJJQ29tcG9uZW50IGRvZXNuJ3QgdGhpbmsgdGhleVxuICAgIC8vIG5lZWQgdG8gYmUuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdXRvRXNjYXBlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGFlID0gYXV0b0VzY2FwZVtpXTtcbiAgICAgIGlmIChyZXN0LmluZGV4T2YoYWUpID09PSAtMSlcbiAgICAgICAgY29udGludWU7XG4gICAgICB2YXIgZXNjID0gZW5jb2RlVVJJQ29tcG9uZW50KGFlKTtcbiAgICAgIGlmIChlc2MgPT09IGFlKSB7XG4gICAgICAgIGVzYyA9IGVzY2FwZShhZSk7XG4gICAgICB9XG4gICAgICByZXN0ID0gcmVzdC5zcGxpdChhZSkuam9pbihlc2MpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2hvcCBvZmYgZnJvbSB0aGUgdGFpbCBmaXJzdC5cbiAgdmFyIGhhc2ggPSByZXN0LmluZGV4T2YoJyMnKTtcbiAgaWYgKGhhc2ggIT09IC0xKSB7XG4gICAgLy8gZ290IGEgZnJhZ21lbnQgc3RyaW5nLlxuICAgIHRoaXMuaGFzaCA9IHJlc3Quc3Vic3RyKGhhc2gpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIGhhc2gpO1xuICB9XG4gIHZhciBxbSA9IHJlc3QuaW5kZXhPZignPycpO1xuICBpZiAocW0gIT09IC0xKSB7XG4gICAgdGhpcy5zZWFyY2ggPSByZXN0LnN1YnN0cihxbSk7XG4gICAgdGhpcy5xdWVyeSA9IHJlc3Quc3Vic3RyKHFtICsgMSk7XG4gICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnF1ZXJ5KTtcbiAgICB9XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgcW0pO1xuICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAvLyBubyBxdWVyeSBzdHJpbmcsIGJ1dCBwYXJzZVF1ZXJ5U3RyaW5nIHN0aWxsIHJlcXVlc3RlZFxuICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgdGhpcy5xdWVyeSA9IHt9O1xuICB9XG4gIGlmIChyZXN0KSB0aGlzLnBhdGhuYW1lID0gcmVzdDtcbiAgaWYgKHNsYXNoZWRQcm90b2NvbFtsb3dlclByb3RvXSAmJlxuICAgICAgdGhpcy5ob3N0bmFtZSAmJiAhdGhpcy5wYXRobmFtZSkge1xuICAgIHRoaXMucGF0aG5hbWUgPSAnLyc7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gIGlmICh0aGlzLnBhdGhuYW1lIHx8IHRoaXMuc2VhcmNoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBhdGhuYW1lIHx8ICcnO1xuICAgIHZhciBzID0gdGhpcy5zZWFyY2ggfHwgJyc7XG4gICAgdGhpcy5wYXRoID0gcCArIHM7XG4gIH1cblxuICAvLyBmaW5hbGx5LCByZWNvbnN0cnVjdCB0aGUgaHJlZiBiYXNlZCBvbiB3aGF0IGhhcyBiZWVuIHZhbGlkYXRlZC5cbiAgdGhpcy5ocmVmID0gdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBmb3JtYXQgYSBwYXJzZWQgb2JqZWN0IGludG8gYSB1cmwgc3RyaW5nXG5mdW5jdGlvbiB1cmxGb3JtYXQob2JqKSB7XG4gIC8vIGVuc3VyZSBpdCdzIGFuIG9iamVjdCwgYW5kIG5vdCBhIHN0cmluZyB1cmwuXG4gIC8vIElmIGl0J3MgYW4gb2JqLCB0aGlzIGlzIGEgbm8tb3AuXG4gIC8vIHRoaXMgd2F5LCB5b3UgY2FuIGNhbGwgdXJsX2Zvcm1hdCgpIG9uIHN0cmluZ3NcbiAgLy8gdG8gY2xlYW4gdXAgcG90ZW50aWFsbHkgd29ua3kgdXJscy5cbiAgaWYgKHV0aWwuaXNTdHJpbmcob2JqKSkgb2JqID0gdXJsUGFyc2Uob2JqKTtcbiAgaWYgKCEob2JqIGluc3RhbmNlb2YgVXJsKSkgcmV0dXJuIFVybC5wcm90b3R5cGUuZm9ybWF0LmNhbGwob2JqKTtcbiAgcmV0dXJuIG9iai5mb3JtYXQoKTtcbn1cblxuVXJsLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF1dGggPSB0aGlzLmF1dGggfHwgJyc7XG4gIGlmIChhdXRoKSB7XG4gICAgYXV0aCA9IGVuY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICBhdXRoID0gYXV0aC5yZXBsYWNlKC8lM0EvaSwgJzonKTtcbiAgICBhdXRoICs9ICdAJztcbiAgfVxuXG4gIHZhciBwcm90b2NvbCA9IHRoaXMucHJvdG9jb2wgfHwgJycsXG4gICAgICBwYXRobmFtZSA9IHRoaXMucGF0aG5hbWUgfHwgJycsXG4gICAgICBoYXNoID0gdGhpcy5oYXNoIHx8ICcnLFxuICAgICAgaG9zdCA9IGZhbHNlLFxuICAgICAgcXVlcnkgPSAnJztcblxuICBpZiAodGhpcy5ob3N0KSB7XG4gICAgaG9zdCA9IGF1dGggKyB0aGlzLmhvc3Q7XG4gIH0gZWxzZSBpZiAodGhpcy5ob3N0bmFtZSkge1xuICAgIGhvc3QgPSBhdXRoICsgKHRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpID09PSAtMSA/XG4gICAgICAgIHRoaXMuaG9zdG5hbWUgOlxuICAgICAgICAnWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nKTtcbiAgICBpZiAodGhpcy5wb3J0KSB7XG4gICAgICBob3N0ICs9ICc6JyArIHRoaXMucG9ydDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5xdWVyeSAmJlxuICAgICAgdXRpbC5pc09iamVjdCh0aGlzLnF1ZXJ5KSAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5xdWVyeSkubGVuZ3RoKSB7XG4gICAgcXVlcnkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkodGhpcy5xdWVyeSk7XG4gIH1cblxuICB2YXIgc2VhcmNoID0gdGhpcy5zZWFyY2ggfHwgKHF1ZXJ5ICYmICgnPycgKyBxdWVyeSkpIHx8ICcnO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5zdWJzdHIoLTEpICE9PSAnOicpIHByb3RvY29sICs9ICc6JztcblxuICAvLyBvbmx5IHRoZSBzbGFzaGVkUHJvdG9jb2xzIGdldCB0aGUgLy8uICBOb3QgbWFpbHRvOiwgeG1wcDosIGV0Yy5cbiAgLy8gdW5sZXNzIHRoZXkgaGFkIHRoZW0gdG8gYmVnaW4gd2l0aC5cbiAgaWYgKHRoaXMuc2xhc2hlcyB8fFxuICAgICAgKCFwcm90b2NvbCB8fCBzbGFzaGVkUHJvdG9jb2xbcHJvdG9jb2xdKSAmJiBob3N0ICE9PSBmYWxzZSkge1xuICAgIGhvc3QgPSAnLy8nICsgKGhvc3QgfHwgJycpO1xuICAgIGlmIChwYXRobmFtZSAmJiBwYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJykgcGF0aG5hbWUgPSAnLycgKyBwYXRobmFtZTtcbiAgfSBlbHNlIGlmICghaG9zdCkge1xuICAgIGhvc3QgPSAnJztcbiAgfVxuXG4gIGlmIChoYXNoICYmIGhhc2guY2hhckF0KDApICE9PSAnIycpIGhhc2ggPSAnIycgKyBoYXNoO1xuICBpZiAoc2VhcmNoICYmIHNlYXJjaC5jaGFyQXQoMCkgIT09ICc/Jykgc2VhcmNoID0gJz8nICsgc2VhcmNoO1xuXG4gIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvWz8jXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQobWF0Y2gpO1xuICB9KTtcbiAgc2VhcmNoID0gc2VhcmNoLnJlcGxhY2UoJyMnLCAnJTIzJyk7XG5cbiAgcmV0dXJuIHByb3RvY29sICsgaG9zdCArIHBhdGhuYW1lICsgc2VhcmNoICsgaGFzaDtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmUoc291cmNlLCByZWxhdGl2ZSkge1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZShyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIHJldHVybiB0aGlzLnJlc29sdmVPYmplY3QodXJsUGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKSkuZm9ybWF0KCk7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlT2JqZWN0KHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgaWYgKCFzb3VyY2UpIHJldHVybiByZWxhdGl2ZTtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmVPYmplY3QocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmVPYmplY3QgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICBpZiAodXRpbC5pc1N0cmluZyhyZWxhdGl2ZSkpIHtcbiAgICB2YXIgcmVsID0gbmV3IFVybCgpO1xuICAgIHJlbC5wYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpO1xuICAgIHJlbGF0aXZlID0gcmVsO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IG5ldyBVcmwoKTtcbiAgdmFyIHRrZXlzID0gT2JqZWN0LmtleXModGhpcyk7XG4gIGZvciAodmFyIHRrID0gMDsgdGsgPCB0a2V5cy5sZW5ndGg7IHRrKyspIHtcbiAgICB2YXIgdGtleSA9IHRrZXlzW3RrXTtcbiAgICByZXN1bHRbdGtleV0gPSB0aGlzW3RrZXldO1xuICB9XG5cbiAgLy8gaGFzaCBpcyBhbHdheXMgb3ZlcnJpZGRlbiwgbm8gbWF0dGVyIHdoYXQuXG4gIC8vIGV2ZW4gaHJlZj1cIlwiIHdpbGwgcmVtb3ZlIGl0LlxuICByZXN1bHQuaGFzaCA9IHJlbGF0aXZlLmhhc2g7XG5cbiAgLy8gaWYgdGhlIHJlbGF0aXZlIHVybCBpcyBlbXB0eSwgdGhlbiB0aGVyZSdzIG5vdGhpbmcgbGVmdCB0byBkbyBoZXJlLlxuICBpZiAocmVsYXRpdmUuaHJlZiA9PT0gJycpIHtcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaHJlZnMgbGlrZSAvL2Zvby9iYXIgYWx3YXlzIGN1dCB0byB0aGUgcHJvdG9jb2wuXG4gIGlmIChyZWxhdGl2ZS5zbGFzaGVzICYmICFyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgIC8vIHRha2UgZXZlcnl0aGluZyBleGNlcHQgdGhlIHByb3RvY29sIGZyb20gcmVsYXRpdmVcbiAgICB2YXIgcmtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgZm9yICh2YXIgcmsgPSAwOyByayA8IHJrZXlzLmxlbmd0aDsgcmsrKykge1xuICAgICAgdmFyIHJrZXkgPSBya2V5c1tya107XG4gICAgICBpZiAocmtleSAhPT0gJ3Byb3RvY29sJylcbiAgICAgICAgcmVzdWx0W3JrZXldID0gcmVsYXRpdmVbcmtleV07XG4gICAgfVxuXG4gICAgLy91cmxQYXJzZSBhcHBlbmRzIHRyYWlsaW5nIC8gdG8gdXJscyBsaWtlIGh0dHA6Ly93d3cuZXhhbXBsZS5jb21cbiAgICBpZiAoc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF0gJiZcbiAgICAgICAgcmVzdWx0Lmhvc3RuYW1lICYmICFyZXN1bHQucGF0aG5hbWUpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gcmVzdWx0LnBhdGhuYW1lID0gJy8nO1xuICAgIH1cblxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAocmVsYXRpdmUucHJvdG9jb2wgJiYgcmVsYXRpdmUucHJvdG9jb2wgIT09IHJlc3VsdC5wcm90b2NvbCkge1xuICAgIC8vIGlmIGl0J3MgYSBrbm93biB1cmwgcHJvdG9jb2wsIHRoZW4gY2hhbmdpbmdcbiAgICAvLyB0aGUgcHJvdG9jb2wgZG9lcyB3ZWlyZCB0aGluZ3NcbiAgICAvLyBmaXJzdCwgaWYgaXQncyBub3QgZmlsZTosIHRoZW4gd2UgTVVTVCBoYXZlIGEgaG9zdCxcbiAgICAvLyBhbmQgaWYgdGhlcmUgd2FzIGEgcGF0aFxuICAgIC8vIHRvIGJlZ2luIHdpdGgsIHRoZW4gd2UgTVVTVCBoYXZlIGEgcGF0aC5cbiAgICAvLyBpZiBpdCBpcyBmaWxlOiwgdGhlbiB0aGUgaG9zdCBpcyBkcm9wcGVkLFxuICAgIC8vIGJlY2F1c2UgdGhhdCdzIGtub3duIHRvIGJlIGhvc3RsZXNzLlxuICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgYXNzdW1lZCB0byBiZSBhYnNvbHV0ZS5cbiAgICBpZiAoIXNsYXNoZWRQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCBrZXlzLmxlbmd0aDsgdisrKSB7XG4gICAgICAgIHZhciBrID0ga2V5c1t2XTtcbiAgICAgICAgcmVzdWx0W2tdID0gcmVsYXRpdmVba107XG4gICAgICB9XG4gICAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVzdWx0LnByb3RvY29sID0gcmVsYXRpdmUucHJvdG9jb2w7XG4gICAgaWYgKCFyZWxhdGl2ZS5ob3N0ICYmICFob3N0bGVzc1Byb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIHJlbFBhdGggPSAocmVsYXRpdmUucGF0aG5hbWUgfHwgJycpLnNwbGl0KCcvJyk7XG4gICAgICB3aGlsZSAocmVsUGF0aC5sZW5ndGggJiYgIShyZWxhdGl2ZS5ob3N0ID0gcmVsUGF0aC5zaGlmdCgpKSk7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3QpIHJlbGF0aXZlLmhvc3QgPSAnJztcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdG5hbWUpIHJlbGF0aXZlLmhvc3RuYW1lID0gJyc7XG4gICAgICBpZiAocmVsUGF0aFswXSAhPT0gJycpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICBpZiAocmVsUGF0aC5sZW5ndGggPCAyKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsUGF0aC5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbGF0aXZlLnBhdGhuYW1lO1xuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHJlc3VsdC5ob3N0ID0gcmVsYXRpdmUuaG9zdCB8fCAnJztcbiAgICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGg7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdDtcbiAgICByZXN1bHQucG9ydCA9IHJlbGF0aXZlLnBvcnQ7XG4gICAgLy8gdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnBhdGhuYW1lIHx8IHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHZhciBwID0gcmVzdWx0LnBhdGhuYW1lIHx8ICcnO1xuICAgICAgdmFyIHMgPSByZXN1bHQuc2VhcmNoIHx8ICcnO1xuICAgICAgcmVzdWx0LnBhdGggPSBwICsgcztcbiAgICB9XG4gICAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgaXNTb3VyY2VBYnMgPSAocmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyksXG4gICAgICBpc1JlbEFicyA9IChcbiAgICAgICAgICByZWxhdGl2ZS5ob3N0IHx8XG4gICAgICAgICAgcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLydcbiAgICAgICksXG4gICAgICBtdXN0RW5kQWJzID0gKGlzUmVsQWJzIHx8IGlzU291cmNlQWJzIHx8XG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuaG9zdCAmJiByZWxhdGl2ZS5wYXRobmFtZSkpLFxuICAgICAgcmVtb3ZlQWxsRG90cyA9IG11c3RFbmRBYnMsXG4gICAgICBzcmNQYXRoID0gcmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcmVsUGF0aCA9IHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICBwc3ljaG90aWMgPSByZXN1bHQucHJvdG9jb2wgJiYgIXNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdO1xuXG4gIC8vIGlmIHRoZSB1cmwgaXMgYSBub24tc2xhc2hlZCB1cmwsIHRoZW4gcmVsYXRpdmVcbiAgLy8gbGlua3MgbGlrZSAuLi8uLiBzaG91bGQgYmUgYWJsZVxuICAvLyB0byBjcmF3bCB1cCB0byB0aGUgaG9zdG5hbWUsIGFzIHdlbGwuICBUaGlzIGlzIHN0cmFuZ2UuXG4gIC8vIHJlc3VsdC5wcm90b2NvbCBoYXMgYWxyZWFkeSBiZWVuIHNldCBieSBub3cuXG4gIC8vIExhdGVyIG9uLCBwdXQgdGhlIGZpcnN0IHBhdGggcGFydCBpbnRvIHRoZSBob3N0IGZpZWxkLlxuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gJyc7XG4gICAgcmVzdWx0LnBvcnQgPSBudWxsO1xuICAgIGlmIChyZXN1bHQuaG9zdCkge1xuICAgICAgaWYgKHNyY1BhdGhbMF0gPT09ICcnKSBzcmNQYXRoWzBdID0gcmVzdWx0Lmhvc3Q7XG4gICAgICBlbHNlIHNyY1BhdGgudW5zaGlmdChyZXN1bHQuaG9zdCk7XG4gICAgfVxuICAgIHJlc3VsdC5ob3N0ID0gJyc7XG4gICAgaWYgKHJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZS5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZS5wb3J0ID0gbnVsbDtcbiAgICAgIGlmIChyZWxhdGl2ZS5ob3N0KSB7XG4gICAgICAgIGlmIChyZWxQYXRoWzBdID09PSAnJykgcmVsUGF0aFswXSA9IHJlbGF0aXZlLmhvc3Q7XG4gICAgICAgIGVsc2UgcmVsUGF0aC51bnNoaWZ0KHJlbGF0aXZlLmhvc3QpO1xuICAgICAgfVxuICAgICAgcmVsYXRpdmUuaG9zdCA9IG51bGw7XG4gICAgfVxuICAgIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzICYmIChyZWxQYXRoWzBdID09PSAnJyB8fCBzcmNQYXRoWzBdID09PSAnJyk7XG4gIH1cblxuICBpZiAoaXNSZWxBYnMpIHtcbiAgICAvLyBpdCdzIGFic29sdXRlLlxuICAgIHJlc3VsdC5ob3N0ID0gKHJlbGF0aXZlLmhvc3QgfHwgcmVsYXRpdmUuaG9zdCA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3QgOiByZXN1bHQuaG9zdDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAocmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdG5hbWUgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgOiByZXN1bHQuaG9zdG5hbWU7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICBzcmNQYXRoID0gcmVsUGF0aDtcbiAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGRvdC1oYW5kbGluZyBiZWxvdy5cbiAgfSBlbHNlIGlmIChyZWxQYXRoLmxlbmd0aCkge1xuICAgIC8vIGl0J3MgcmVsYXRpdmVcbiAgICAvLyB0aHJvdyBhd2F5IHRoZSBleGlzdGluZyBmaWxlLCBhbmQgdGFrZSB0aGUgbmV3IHBhdGggaW5zdGVhZC5cbiAgICBpZiAoIXNyY1BhdGgpIHNyY1BhdGggPSBbXTtcbiAgICBzcmNQYXRoLnBvcCgpO1xuICAgIHNyY1BhdGggPSBzcmNQYXRoLmNvbmNhdChyZWxQYXRoKTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICB9IGVsc2UgaWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKHJlbGF0aXZlLnNlYXJjaCkpIHtcbiAgICAvLyBqdXN0IHB1bGwgb3V0IHRoZSBzZWFyY2guXG4gICAgLy8gbGlrZSBocmVmPSc/Zm9vJy5cbiAgICAvLyBQdXQgdGhpcyBhZnRlciB0aGUgb3RoZXIgdHdvIGNhc2VzIGJlY2F1c2UgaXQgc2ltcGxpZmllcyB0aGUgYm9vbGVhbnNcbiAgICBpZiAocHN5Y2hvdGljKSB7XG4gICAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IHNyY1BhdGguc2hpZnQoKTtcbiAgICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIC8vIG5vIHBhdGggYXQgYWxsLiAgZWFzeS5cbiAgICAvLyB3ZSd2ZSBhbHJlYWR5IGhhbmRsZWQgdGhlIG90aGVyIHN0dWZmIGFib3ZlLlxuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQuc2VhcmNoKSB7XG4gICAgICByZXN1bHQucGF0aCA9ICcvJyArIHJlc3VsdC5zZWFyY2g7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGlmIGEgdXJsIEVORHMgaW4gLiBvciAuLiwgdGhlbiBpdCBtdXN0IGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICAvLyBob3dldmVyLCBpZiBpdCBlbmRzIGluIGFueXRoaW5nIGVsc2Ugbm9uLXNsYXNoeSxcbiAgLy8gdGhlbiBpdCBtdXN0IE5PVCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgdmFyIGxhc3QgPSBzcmNQYXRoLnNsaWNlKC0xKVswXTtcbiAgdmFyIGhhc1RyYWlsaW5nU2xhc2ggPSAoXG4gICAgICAocmVzdWx0Lmhvc3QgfHwgcmVsYXRpdmUuaG9zdCB8fCBzcmNQYXRoLmxlbmd0aCA+IDEpICYmXG4gICAgICAobGFzdCA9PT0gJy4nIHx8IGxhc3QgPT09ICcuLicpIHx8IGxhc3QgPT09ICcnKTtcblxuICAvLyBzdHJpcCBzaW5nbGUgZG90cywgcmVzb2x2ZSBkb3VibGUgZG90cyB0byBwYXJlbnQgZGlyXG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBzcmNQYXRoLmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICBsYXN0ID0gc3JjUGF0aFtpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoIW11c3RFbmRBYnMgJiYgIXJlbW92ZUFsbERvdHMpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHNyY1BhdGgudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICBpZiAobXVzdEVuZEFicyAmJiBzcmNQYXRoWzBdICE9PSAnJyAmJlxuICAgICAgKCFzcmNQYXRoWzBdIHx8IHNyY1BhdGhbMF0uY2hhckF0KDApICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NsYXNoICYmIChzcmNQYXRoLmpvaW4oJy8nKS5zdWJzdHIoLTEpICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBpc0Fic29sdXRlID0gc3JjUGF0aFswXSA9PT0gJycgfHxcbiAgICAgIChzcmNQYXRoWzBdICYmIHNyY1BhdGhbMF0uY2hhckF0KDApID09PSAnLycpO1xuXG4gIC8vIHB1dCB0aGUgaG9zdCBiYWNrXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IGlzQWJzb2x1dGUgPyAnJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNQYXRoLmxlbmd0aCA/IHNyY1BhdGguc2hpZnQoKSA6ICcnO1xuICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgfHwgKHJlc3VsdC5ob3N0ICYmIHNyY1BhdGgubGVuZ3RoKTtcblxuICBpZiAobXVzdEVuZEFicyAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gc3JjUGF0aC5qb2luKCcvJyk7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgcmVxdWVzdC5odHRwXG4gIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICB9XG4gIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aCB8fCByZXN1bHQuYXV0aDtcbiAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblVybC5wcm90b3R5cGUucGFyc2VIb3N0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBob3N0ID0gdGhpcy5ob3N0O1xuICB2YXIgcG9ydCA9IHBvcnRQYXR0ZXJuLmV4ZWMoaG9zdCk7XG4gIGlmIChwb3J0KSB7XG4gICAgcG9ydCA9IHBvcnRbMF07XG4gICAgaWYgKHBvcnQgIT09ICc6Jykge1xuICAgICAgdGhpcy5wb3J0ID0gcG9ydC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGhvc3QgPSBob3N0LnN1YnN0cigwLCBob3N0Lmxlbmd0aCAtIHBvcnQubGVuZ3RoKTtcbiAgfVxuICBpZiAoaG9zdCkgdGhpcy5ob3N0bmFtZSA9IGhvc3Q7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTdHJpbmc6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ3N0cmluZyc7XG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09PSBudWxsO1xuICB9LFxuICBpc051bGxPclVuZGVmaW5lZDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PSBudWxsO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJyk7XG52YXIgQnVmZmVyID0gYnVmZmVyLkJ1ZmZlcjtcbnZhciBTbG93QnVmZmVyID0gYnVmZmVyLlNsb3dCdWZmZXI7XG52YXIgTUFYX0xFTiA9IGJ1ZmZlci5rTWF4TGVuZ3RoIHx8IDIxNDc0ODM2NDc7XG5leHBvcnRzLmFsbG9jID0gZnVuY3Rpb24gYWxsb2Moc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBCdWZmZXIuYWxsb2MgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKTtcbiAgfVxuICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3Qgbm90IGJlIG51bWJlcicpO1xuICB9XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzaXplIG11c3QgYmUgYSBudW1iZXInKTtcbiAgfVxuICBpZiAoc2l6ZSA+IE1BWF9MRU4pIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc2l6ZSBpcyB0b28gbGFyZ2UnKTtcbiAgfVxuICB2YXIgZW5jID0gZW5jb2Rpbmc7XG4gIHZhciBfZmlsbCA9IGZpbGw7XG4gIGlmIChfZmlsbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jID0gdW5kZWZpbmVkO1xuICAgIF9maWxsID0gMDtcbiAgfVxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcihzaXplKTtcbiAgaWYgKHR5cGVvZiBfZmlsbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgZmlsbEJ1ZiA9IG5ldyBCdWZmZXIoX2ZpbGwsIGVuYyk7XG4gICAgdmFyIGZsZW4gPSBmaWxsQnVmLmxlbmd0aDtcbiAgICB2YXIgaSA9IC0xO1xuICAgIHdoaWxlICgrK2kgPCBzaXplKSB7XG4gICAgICBidWZbaV0gPSBmaWxsQnVmW2kgJSBmbGVuXTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmLmZpbGwoX2ZpbGwpO1xuICB9XG4gIHJldHVybiBidWY7XG59XG5leHBvcnRzLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gYWxsb2NVbnNhZmUoc2l6ZSkge1xuICBpZiAodHlwZW9mIEJ1ZmZlci5hbGxvY1Vuc2FmZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2NVbnNhZmUoc2l6ZSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NpemUgbXVzdCBiZSBhIG51bWJlcicpO1xuICB9XG4gIGlmIChzaXplID4gTUFYX0xFTikge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdzaXplIGlzIHRvbyBsYXJnZScpO1xuICB9XG4gIHJldHVybiBuZXcgQnVmZmVyKHNpemUpO1xufVxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgQnVmZmVyLmZyb20gPT09ICdmdW5jdGlvbicgJiYgKCFnbG9iYWwuVWludDhBcnJheSB8fCBVaW50OEFycmF5LmZyb20gIT09IEJ1ZmZlci5mcm9tKSkge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpO1xuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgb2Zmc2V0ID0gZW5jb2RpbmdPck9mZnNldDtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9mZnNldCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgfVxuICAgIHZhciBsZW4gPSBsZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBsZW4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBsZW4gPSB2YWx1ZS5ieXRlTGVuZ3RoIC0gb2Zmc2V0O1xuICAgIH1cbiAgICBpZiAob2Zmc2V0ID49IHZhbHVlLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpO1xuICAgIH1cbiAgICBpZiAobGVuID4gdmFsdWUuYnl0ZUxlbmd0aCAtIG9mZnNldCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHZhbHVlLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuKSk7XG4gIH1cbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEJ1ZmZlcih2YWx1ZS5sZW5ndGgpO1xuICAgIHZhbHVlLmNvcHkob3V0LCAwLCAwLCB2YWx1ZS5sZW5ndGgpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cbiAgaWYgKHZhbHVlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8ICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB8fCAnbGVuZ3RoJyBpbiB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodmFsdWUudHlwZSA9PT0gJ0J1ZmZlcicgJiYgQXJyYXkuaXNBcnJheSh2YWx1ZS5kYXRhKSkge1xuICAgICAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUuZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCAnICsgJ0FycmF5QnVmZmVyLCBBcnJheSwgb3IgYXJyYXktbGlrZSBvYmplY3QuJyk7XG59XG5leHBvcnRzLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIGFsbG9jVW5zYWZlU2xvdyhzaXplKSB7XG4gIGlmICh0eXBlb2YgQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2NVbnNhZmVTbG93KHNpemUpO1xuICB9XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzaXplIG11c3QgYmUgYSBudW1iZXInKTtcbiAgfVxuICBpZiAoc2l6ZSA+PSBNQVhfTEVOKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NpemUgaXMgdG9vIGxhcmdlJyk7XG4gIH1cbiAgcmV0dXJuIG5ldyBTbG93QnVmZmVyKHNpemUpO1xufVxuIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogRHVlIHRvIHZhcmlvdXMgYnJvd3NlciBidWdzLCBzb21ldGltZXMgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiB3aWxsIGJlIHVzZWQgZXZlblxuICogd2hlbiB0aGUgYnJvd3NlciBzdXBwb3J0cyB0eXBlZCBhcnJheXMuXG4gKlxuICogTm90ZTpcbiAqXG4gKiAgIC0gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLFxuICogICAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAgLSBDaHJvbWUgOS0xMCBpcyBtaXNzaW5nIHRoZSBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uLlxuICpcbiAqICAgLSBJRTEwIGhhcyBhIGJyb2tlbiBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYXJyYXlzIG9mXG4gKiAgICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG5cbiAqIFdlIGRldGVjdCB0aGVzZSBidWdneSBicm93c2VycyBhbmQgc2V0IGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGAgdG8gYGZhbHNlYCBzbyB0aGV5XG4gKiBnZXQgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgc2xvd2VyIGJ1dCBiZWhhdmVzIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVCAhPT0gdW5kZWZpbmVkXG4gID8gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgOiB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbi8qXG4gKiBFeHBvcnQga01heExlbmd0aCBhZnRlciB0eXBlZCBhcnJheSBzdXBwb3J0IGlzIGRldGVybWluZWQuXG4gKi9cbmV4cG9ydHMua01heExlbmd0aCA9IGtNYXhMZW5ndGgoKVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHtfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH19XG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDIgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgYXJyLnN1YmFycmF5KDEsIDEpLmJ5dGVMZW5ndGggPT09IDAgLy8gaWUxMCBoYXMgYnJva2VuIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGtNYXhMZW5ndGggKCkge1xuICByZXR1cm4gQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgICA/IDB4N2ZmZmZmZmZcbiAgICA6IDB4M2ZmZmZmZmZcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgaWYgKGtNYXhMZW5ndGgoKSA8IGxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgaWYgKHRoYXQgPT09IG51bGwpIHtcbiAgICAgIHRoYXQgPSBuZXcgQnVmZmVyKGxlbmd0aClcbiAgICB9XG4gICAgdGhhdC5sZW5ndGggPSBsZW5ndGhcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nT3JPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJZiBlbmNvZGluZyBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKHRoaXMsIGFyZylcbiAgfVxuICByZXR1cm4gZnJvbSh0aGlzLCBhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbi8vIFRPRE86IExlZ2FjeSwgbm90IG5lZWRlZCBhbnltb3JlLiBSZW1vdmUgaW4gbmV4dCBtYWpvciB2ZXJzaW9uLlxuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIGZyb20gKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXInKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh0aGF0LCB2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbShudWxsLCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5pZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuICBCdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnNwZWNpZXMgJiZcbiAgICAgIEJ1ZmZlcltTeW1ib2wuc3BlY2llc10gPT09IEJ1ZmZlcikge1xuICAgIC8vIEZpeCBzdWJhcnJheSgpIGluIEVTMjAxNi4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzk3XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBuZWdhdGl2ZScpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHRoYXQsIHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0dGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKG51bGwsIHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAodGhhdCwgc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7ICsraSkge1xuICAgICAgdGhhdFtpXSA9IDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIEJ1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIFNsb3dCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nICh0aGF0LCBzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZW5jb2RpbmdcIiBtdXN0IGJlIGEgdmFsaWQgc3RyaW5nIGVuY29kaW5nJylcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcblxuICB2YXIgYWN0dWFsID0gdGhhdC53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgdGhhdCA9IHRoYXQuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAodGhhdCwgYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBhcnJheS5ieXRlTGVuZ3RoIC8vIHRoaXMgdGhyb3dzIGlmIGBhcnJheWAgaXMgbm90IGEgdmFsaWQgQXJyYXlCdWZmZXJcblxuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnb2Zmc2V0XFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdsZW5ndGhcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IGFycmF5XG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIHRoYXQgPSBmcm9tQXJyYXlMaWtlKHRoYXQsIGFycmF5KVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21PYmplY3QgKHRoYXQsIG9iaikge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iaikpIHtcbiAgICB2YXIgbGVuID0gY2hlY2tlZChvYmoubGVuZ3RoKSB8IDBcbiAgICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbilcblxuICAgIGlmICh0aGF0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoYXRcbiAgICB9XG5cbiAgICBvYmouY29weSh0aGF0LCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIHRoYXRcbiAgfVxuXG4gIGlmIChvYmopIHtcbiAgICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgb2JqLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB8fCAnbGVuZ3RoJyBpbiBvYmopIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgaXNuYW4ob2JqLmxlbmd0aCkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCAwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqKVxuICAgIH1cblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iai5kYXRhKVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwga01heExlbmd0aCgpYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IGtNYXhMZW5ndGgoKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoKCkudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFpc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBzdHJpbmcgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGUgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCBhbmQgYGlzLWJ1ZmZlcmAgKGluIFNhZmFyaSA1LTcpIHRvIGRldGVjdFxuLy8gQnVmZmVyIGluc3RhbmNlcy5cbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGggfCAwXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKGlzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiZcbiAgICAgICAgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgWyB2YWwgXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgdmFyIGluZGV4U2l6ZSA9IDFcbiAgdmFyIGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgdmFyIHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGRpcikge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfCAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgLy8gbGVnYWN5IHdyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKSAtIHJlbW92ZSBpbiB2MC4xM1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgOiAoZmlyc3RCeXRlID4gMHhCRikgPyAyXG4gICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpICsgMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZlxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gICAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyArK2kpIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7ICsraSkge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyArK2kpIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogdXRmOFRvQnl0ZXMobmV3IEJ1ZmZlcih2YWwsIGVuY29kaW5nKS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBpc25hbiAodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHZhbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCIxMDBcIjogXCJDb250aW51ZVwiLFxuICBcIjEwMVwiOiBcIlN3aXRjaGluZyBQcm90b2NvbHNcIixcbiAgXCIxMDJcIjogXCJQcm9jZXNzaW5nXCIsXG4gIFwiMjAwXCI6IFwiT0tcIixcbiAgXCIyMDFcIjogXCJDcmVhdGVkXCIsXG4gIFwiMjAyXCI6IFwiQWNjZXB0ZWRcIixcbiAgXCIyMDNcIjogXCJOb24tQXV0aG9yaXRhdGl2ZSBJbmZvcm1hdGlvblwiLFxuICBcIjIwNFwiOiBcIk5vIENvbnRlbnRcIixcbiAgXCIyMDVcIjogXCJSZXNldCBDb250ZW50XCIsXG4gIFwiMjA2XCI6IFwiUGFydGlhbCBDb250ZW50XCIsXG4gIFwiMjA3XCI6IFwiTXVsdGktU3RhdHVzXCIsXG4gIFwiMjA4XCI6IFwiQWxyZWFkeSBSZXBvcnRlZFwiLFxuICBcIjIyNlwiOiBcIklNIFVzZWRcIixcbiAgXCIzMDBcIjogXCJNdWx0aXBsZSBDaG9pY2VzXCIsXG4gIFwiMzAxXCI6IFwiTW92ZWQgUGVybWFuZW50bHlcIixcbiAgXCIzMDJcIjogXCJGb3VuZFwiLFxuICBcIjMwM1wiOiBcIlNlZSBPdGhlclwiLFxuICBcIjMwNFwiOiBcIk5vdCBNb2RpZmllZFwiLFxuICBcIjMwNVwiOiBcIlVzZSBQcm94eVwiLFxuICBcIjMwN1wiOiBcIlRlbXBvcmFyeSBSZWRpcmVjdFwiLFxuICBcIjMwOFwiOiBcIlBlcm1hbmVudCBSZWRpcmVjdFwiLFxuICBcIjQwMFwiOiBcIkJhZCBSZXF1ZXN0XCIsXG4gIFwiNDAxXCI6IFwiVW5hdXRob3JpemVkXCIsXG4gIFwiNDAyXCI6IFwiUGF5bWVudCBSZXF1aXJlZFwiLFxuICBcIjQwM1wiOiBcIkZvcmJpZGRlblwiLFxuICBcIjQwNFwiOiBcIk5vdCBGb3VuZFwiLFxuICBcIjQwNVwiOiBcIk1ldGhvZCBOb3QgQWxsb3dlZFwiLFxuICBcIjQwNlwiOiBcIk5vdCBBY2NlcHRhYmxlXCIsXG4gIFwiNDA3XCI6IFwiUHJveHkgQXV0aGVudGljYXRpb24gUmVxdWlyZWRcIixcbiAgXCI0MDhcIjogXCJSZXF1ZXN0IFRpbWVvdXRcIixcbiAgXCI0MDlcIjogXCJDb25mbGljdFwiLFxuICBcIjQxMFwiOiBcIkdvbmVcIixcbiAgXCI0MTFcIjogXCJMZW5ndGggUmVxdWlyZWRcIixcbiAgXCI0MTJcIjogXCJQcmVjb25kaXRpb24gRmFpbGVkXCIsXG4gIFwiNDEzXCI6IFwiUGF5bG9hZCBUb28gTGFyZ2VcIixcbiAgXCI0MTRcIjogXCJVUkkgVG9vIExvbmdcIixcbiAgXCI0MTVcIjogXCJVbnN1cHBvcnRlZCBNZWRpYSBUeXBlXCIsXG4gIFwiNDE2XCI6IFwiUmFuZ2UgTm90IFNhdGlzZmlhYmxlXCIsXG4gIFwiNDE3XCI6IFwiRXhwZWN0YXRpb24gRmFpbGVkXCIsXG4gIFwiNDE4XCI6IFwiSSdtIGEgdGVhcG90XCIsXG4gIFwiNDIxXCI6IFwiTWlzZGlyZWN0ZWQgUmVxdWVzdFwiLFxuICBcIjQyMlwiOiBcIlVucHJvY2Vzc2FibGUgRW50aXR5XCIsXG4gIFwiNDIzXCI6IFwiTG9ja2VkXCIsXG4gIFwiNDI0XCI6IFwiRmFpbGVkIERlcGVuZGVuY3lcIixcbiAgXCI0MjVcIjogXCJVbm9yZGVyZWQgQ29sbGVjdGlvblwiLFxuICBcIjQyNlwiOiBcIlVwZ3JhZGUgUmVxdWlyZWRcIixcbiAgXCI0MjhcIjogXCJQcmVjb25kaXRpb24gUmVxdWlyZWRcIixcbiAgXCI0MjlcIjogXCJUb28gTWFueSBSZXF1ZXN0c1wiLFxuICBcIjQzMVwiOiBcIlJlcXVlc3QgSGVhZGVyIEZpZWxkcyBUb28gTGFyZ2VcIixcbiAgXCI1MDBcIjogXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIixcbiAgXCI1MDFcIjogXCJOb3QgSW1wbGVtZW50ZWRcIixcbiAgXCI1MDJcIjogXCJCYWQgR2F0ZXdheVwiLFxuICBcIjUwM1wiOiBcIlNlcnZpY2UgVW5hdmFpbGFibGVcIixcbiAgXCI1MDRcIjogXCJHYXRld2F5IFRpbWVvdXRcIixcbiAgXCI1MDVcIjogXCJIVFRQIFZlcnNpb24gTm90IFN1cHBvcnRlZFwiLFxuICBcIjUwNlwiOiBcIlZhcmlhbnQgQWxzbyBOZWdvdGlhdGVzXCIsXG4gIFwiNTA3XCI6IFwiSW5zdWZmaWNpZW50IFN0b3JhZ2VcIixcbiAgXCI1MDhcIjogXCJMb29wIERldGVjdGVkXCIsXG4gIFwiNTA5XCI6IFwiQmFuZHdpZHRoIExpbWl0IEV4Y2VlZGVkXCIsXG4gIFwiNTEwXCI6IFwiTm90IEV4dGVuZGVkXCIsXG4gIFwiNTExXCI6IFwiTmV0d29yayBBdXRoZW50aWNhdGlvbiBSZXF1aXJlZFwiXG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cblxuZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcmcpO1xuICB9XG4gIHJldHVybiBvYmplY3RUb1N0cmluZyhhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gQnVmZmVyLmlzQnVmZmVyO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJ2YXIgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcblxudmFyIGh0dHBzID0gbW9kdWxlLmV4cG9ydHM7XG5cbmZvciAodmFyIGtleSBpbiBodHRwKSB7XG4gICAgaWYgKGh0dHAuaGFzT3duUHJvcGVydHkoa2V5KSkgaHR0cHNba2V5XSA9IGh0dHBba2V5XTtcbn07XG5cbmh0dHBzLnJlcXVlc3QgPSBmdW5jdGlvbiAocGFyYW1zLCBjYikge1xuICAgIGlmICghcGFyYW1zKSBwYXJhbXMgPSB7fTtcbiAgICBwYXJhbXMuc2NoZW1lID0gJ2h0dHBzJztcbiAgICBwYXJhbXMucHJvdG9jb2wgPSAnaHR0cHM6JztcbiAgICByZXR1cm4gaHR0cC5yZXF1ZXN0LmNhbGwodGhpcywgcGFyYW1zLCBjYik7XG59XG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxuLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZ1xuLy8gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIob2JqKSB8fCBpc1Nsb3dCdWZmZXIob2JqKSB8fCAhIW9iai5faXNCdWZmZXIpXG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyIChvYmopIHtcbiAgcmV0dXJuICEhb2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iailcbn1cblxuLy8gRm9yIE5vZGUgdjAuMTAgc3VwcG9ydC4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseS5cbmZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouc2xpY2UgPT09ICdmdW5jdGlvbicgJiYgaXNCdWZmZXIob2JqLnNsaWNlKDAsIDApKVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAoIXByb2Nlc3MudmVyc2lvbiB8fFxuICAgIHByb2Nlc3MudmVyc2lvbi5pbmRleE9mKCd2MC4nKSA9PT0gMCB8fFxuICAgIHByb2Nlc3MudmVyc2lvbi5pbmRleE9mKCd2MS4nKSA9PT0gMCAmJiBwcm9jZXNzLnZlcnNpb24uaW5kZXhPZigndjEuOC4nKSAhPT0gMCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IG5leHRUaWNrO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBwcm9jZXNzLm5leHRUaWNrO1xufVxuXG5mdW5jdGlvbiBuZXh0VGljayhmbiwgYXJnMSwgYXJnMiwgYXJnMykge1xuICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJjYWxsYmFja1wiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB9XG4gIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICB2YXIgYXJncywgaTtcbiAgc3dpdGNoIChsZW4pIHtcbiAgY2FzZSAwOlxuICBjYXNlIDE6XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZm4pO1xuICBjYXNlIDI6XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gYWZ0ZXJUaWNrT25lKCkge1xuICAgICAgZm4uY2FsbChudWxsLCBhcmcxKTtcbiAgICB9KTtcbiAgY2FzZSAzOlxuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uIGFmdGVyVGlja1R3bygpIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgYXJnMSwgYXJnMik7XG4gICAgfSk7XG4gIGNhc2UgNDpcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiBhZnRlclRpY2tUaHJlZSgpIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gICAgfSk7XG4gIGRlZmF1bHQ6XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGFyZ3MubGVuZ3RoKSB7XG4gICAgICBhcmdzW2krK10gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uIGFmdGVyVGljaygpIHtcbiAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0pO1xuICB9XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZSB2MS4zLjIgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuXHRcdCFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHQhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKFxuXHRcdGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWxcblx0KSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXlxceDIwLVxceDdFXS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9bXFx4MkVcXHUzMDAyXFx1RkYwRVxcdUZGNjFdL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIChlLmcuIGEgZG9tYWluIG5hbWUgbGFiZWwpIHRvIGFcblx0ICogUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3Ncblx0ICogdG8gVW5pY29kZS4gT25seSB0aGUgUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBpbnB1dCB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLlxuXHQgKiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW5cblx0ICogY29udmVydGVkIHRvIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlZCBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIGNvbnZlcnQgdG8gVW5pY29kZS5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFVuaWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIFB1bnljb2RlXG5cdCAqIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvVW5pY29kZShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogUHVueWNvZGUuIE9ubHkgdGhlIG5vbi1BU0NJSSBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsXG5cdCAqIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpblxuXHQgKiBBU0NJSS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0byBjb252ZXJ0LCBhcyBhXG5cdCAqIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lIG9yXG5cdCAqIGVtYWlsIGFkZHJlc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b0FTQ0lJKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuMy4yJyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoJ3B1bnljb2RlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuXHRcdGlmIChtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cykgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiIsInZhciBDbGllbnRSZXF1ZXN0ID0gcmVxdWlyZSgnLi9saWIvcmVxdWVzdCcpXG52YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIHN0YXR1c0NvZGVzID0gcmVxdWlyZSgnYnVpbHRpbi1zdGF0dXMtY29kZXMnKVxudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpXG5cbnZhciBodHRwID0gZXhwb3J0c1xuXG5odHRwLnJlcXVlc3QgPSBmdW5jdGlvbiAob3B0cywgY2IpIHtcblx0aWYgKHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJylcblx0XHRvcHRzID0gdXJsLnBhcnNlKG9wdHMpXG5cdGVsc2Vcblx0XHRvcHRzID0gZXh0ZW5kKG9wdHMpXG5cblx0Ly8gTm9ybWFsbHksIHRoZSBwYWdlIGlzIGxvYWRlZCBmcm9tIGh0dHAgb3IgaHR0cHMsIHNvIG5vdCBzcGVjaWZ5aW5nIGEgcHJvdG9jb2xcblx0Ly8gd2lsbCByZXN1bHQgaW4gYSAodmFsaWQpIHByb3RvY29sLXJlbGF0aXZlIHVybC4gSG93ZXZlciwgdGhpcyB3b24ndCB3b3JrIGlmXG5cdC8vIHRoZSBwcm90b2NvbCBpcyBzb21ldGhpbmcgZWxzZSwgbGlrZSAnZmlsZTonXG5cdHZhciBkZWZhdWx0UHJvdG9jb2wgPSBnbG9iYWwubG9jYXRpb24ucHJvdG9jb2wuc2VhcmNoKC9eaHR0cHM/OiQvKSA9PT0gLTEgPyAnaHR0cDonIDogJydcblxuXHR2YXIgcHJvdG9jb2wgPSBvcHRzLnByb3RvY29sIHx8IGRlZmF1bHRQcm90b2NvbFxuXHR2YXIgaG9zdCA9IG9wdHMuaG9zdG5hbWUgfHwgb3B0cy5ob3N0XG5cdHZhciBwb3J0ID0gb3B0cy5wb3J0XG5cdHZhciBwYXRoID0gb3B0cy5wYXRoIHx8ICcvJ1xuXG5cdC8vIE5lY2Vzc2FyeSBmb3IgSVB2NiBhZGRyZXNzZXNcblx0aWYgKGhvc3QgJiYgaG9zdC5pbmRleE9mKCc6JykgIT09IC0xKVxuXHRcdGhvc3QgPSAnWycgKyBob3N0ICsgJ10nXG5cblx0Ly8gVGhpcyBtYXkgYmUgYSByZWxhdGl2ZSB1cmwuIFRoZSBicm93c2VyIHNob3VsZCBhbHdheXMgYmUgYWJsZSB0byBpbnRlcnByZXQgaXQgY29ycmVjdGx5LlxuXHRvcHRzLnVybCA9IChob3N0ID8gKHByb3RvY29sICsgJy8vJyArIGhvc3QpIDogJycpICsgKHBvcnQgPyAnOicgKyBwb3J0IDogJycpICsgcGF0aFxuXHRvcHRzLm1ldGhvZCA9IChvcHRzLm1ldGhvZCB8fCAnR0VUJykudG9VcHBlckNhc2UoKVxuXHRvcHRzLmhlYWRlcnMgPSBvcHRzLmhlYWRlcnMgfHwge31cblxuXHQvLyBBbHNvIHZhbGlkIG9wdHMuYXV0aCwgb3B0cy5tb2RlXG5cblx0dmFyIHJlcSA9IG5ldyBDbGllbnRSZXF1ZXN0KG9wdHMpXG5cdGlmIChjYilcblx0XHRyZXEub24oJ3Jlc3BvbnNlJywgY2IpXG5cdHJldHVybiByZXFcbn1cblxuaHR0cC5nZXQgPSBmdW5jdGlvbiBnZXQgKG9wdHMsIGNiKSB7XG5cdHZhciByZXEgPSBodHRwLnJlcXVlc3Qob3B0cywgY2IpXG5cdHJlcS5lbmQoKVxuXHRyZXR1cm4gcmVxXG59XG5cbmh0dHAuQWdlbnQgPSBmdW5jdGlvbiAoKSB7fVxuaHR0cC5BZ2VudC5kZWZhdWx0TWF4U29ja2V0cyA9IDRcblxuaHR0cC5TVEFUVVNfQ09ERVMgPSBzdGF0dXNDb2Rlc1xuXG5odHRwLk1FVEhPRFMgPSBbXG5cdCdDSEVDS09VVCcsXG5cdCdDT05ORUNUJyxcblx0J0NPUFknLFxuXHQnREVMRVRFJyxcblx0J0dFVCcsXG5cdCdIRUFEJyxcblx0J0xPQ0snLFxuXHQnTS1TRUFSQ0gnLFxuXHQnTUVSR0UnLFxuXHQnTUtBQ1RJVklUWScsXG5cdCdNS0NPTCcsXG5cdCdNT1ZFJyxcblx0J05PVElGWScsXG5cdCdPUFRJT05TJyxcblx0J1BBVENIJyxcblx0J1BPU1QnLFxuXHQnUFJPUEZJTkQnLFxuXHQnUFJPUFBBVENIJyxcblx0J1BVUkdFJyxcblx0J1BVVCcsXG5cdCdSRVBPUlQnLFxuXHQnU0VBUkNIJyxcblx0J1NVQlNDUklCRScsXG5cdCdUUkFDRScsXG5cdCdVTkxPQ0snLFxuXHQnVU5TVUJTQ1JJQkUnXG5dIiwiZXhwb3J0cy5mZXRjaCA9IGlzRnVuY3Rpb24oZ2xvYmFsLmZldGNoKSAmJiBpc0Z1bmN0aW9uKGdsb2JhbC5SZWFkYWJsZVN0cmVhbSlcblxuZXhwb3J0cy5ibG9iQ29uc3RydWN0b3IgPSBmYWxzZVxudHJ5IHtcblx0bmV3IEJsb2IoW25ldyBBcnJheUJ1ZmZlcigxKV0pXG5cdGV4cG9ydHMuYmxvYkNvbnN0cnVjdG9yID0gdHJ1ZVxufSBjYXRjaCAoZSkge31cblxudmFyIHhociA9IG5ldyBnbG9iYWwuWE1MSHR0cFJlcXVlc3QoKVxuLy8gSWYgbG9jYXRpb24uaG9zdCBpcyBlbXB0eSwgZS5nLiBpZiB0aGlzIHBhZ2Uvd29ya2VyIHdhcyBsb2FkZWRcbi8vIGZyb20gYSBCbG9iLCB0aGVuIHVzZSBleGFtcGxlLmNvbSB0byBhdm9pZCBhbiBlcnJvclxueGhyLm9wZW4oJ0dFVCcsIGdsb2JhbC5sb2NhdGlvbi5ob3N0ID8gJy8nIDogJ2h0dHBzOi8vZXhhbXBsZS5jb20nKVxuXG5mdW5jdGlvbiBjaGVja1R5cGVTdXBwb3J0ICh0eXBlKSB7XG5cdHRyeSB7XG5cdFx0eGhyLnJlc3BvbnNlVHlwZSA9IHR5cGVcblx0XHRyZXR1cm4geGhyLnJlc3BvbnNlVHlwZSA9PT0gdHlwZVxuXHR9IGNhdGNoIChlKSB7fVxuXHRyZXR1cm4gZmFsc2Vcbn1cblxuLy8gRm9yIHNvbWUgc3RyYW5nZSByZWFzb24sIFNhZmFyaSA3LjAgcmVwb3J0cyB0eXBlb2YgZ2xvYmFsLkFycmF5QnVmZmVyID09PSAnb2JqZWN0Jy5cbi8vIFNhZmFyaSA3LjEgYXBwZWFycyB0byBoYXZlIGZpeGVkIHRoaXMgYnVnLlxudmFyIGhhdmVBcnJheUJ1ZmZlciA9IHR5cGVvZiBnbG9iYWwuQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnXG52YXIgaGF2ZVNsaWNlID0gaGF2ZUFycmF5QnVmZmVyICYmIGlzRnVuY3Rpb24oZ2xvYmFsLkFycmF5QnVmZmVyLnByb3RvdHlwZS5zbGljZSlcblxuZXhwb3J0cy5hcnJheWJ1ZmZlciA9IGhhdmVBcnJheUJ1ZmZlciAmJiBjaGVja1R5cGVTdXBwb3J0KCdhcnJheWJ1ZmZlcicpXG4vLyBUaGVzZSBuZXh0IHR3byB0ZXN0cyB1bmF2b2lkYWJseSBzaG93IHdhcm5pbmdzIGluIENocm9tZS4gU2luY2UgZmV0Y2ggd2lsbCBhbHdheXNcbi8vIGJlIHVzZWQgaWYgaXQncyBhdmFpbGFibGUsIGp1c3QgcmV0dXJuIGZhbHNlIGZvciB0aGVzZSB0byBhdm9pZCB0aGUgd2FybmluZ3MuXG5leHBvcnRzLm1zc3RyZWFtID0gIWV4cG9ydHMuZmV0Y2ggJiYgaGF2ZVNsaWNlICYmIGNoZWNrVHlwZVN1cHBvcnQoJ21zLXN0cmVhbScpXG5leHBvcnRzLm1vemNodW5rZWRhcnJheWJ1ZmZlciA9ICFleHBvcnRzLmZldGNoICYmIGhhdmVBcnJheUJ1ZmZlciAmJlxuXHRjaGVja1R5cGVTdXBwb3J0KCdtb3otY2h1bmtlZC1hcnJheWJ1ZmZlcicpXG5leHBvcnRzLm92ZXJyaWRlTWltZVR5cGUgPSBpc0Z1bmN0aW9uKHhoci5vdmVycmlkZU1pbWVUeXBlKVxuZXhwb3J0cy52YkFycmF5ID0gaXNGdW5jdGlvbihnbG9iYWwuVkJBcnJheSlcblxuZnVuY3Rpb24gaXNGdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG54aHIgPSBudWxsIC8vIEhlbHAgZ2NcbiIsInZhciBjYXBhYmlsaXR5ID0gcmVxdWlyZSgnLi9jYXBhYmlsaXR5JylcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbnZhciByZXNwb25zZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UnKVxudmFyIHN0cmVhbSA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbScpXG52YXIgdG9BcnJheUJ1ZmZlciA9IHJlcXVpcmUoJ3RvLWFycmF5YnVmZmVyJylcblxudmFyIEluY29taW5nTWVzc2FnZSA9IHJlc3BvbnNlLkluY29taW5nTWVzc2FnZVxudmFyIHJTdGF0ZXMgPSByZXNwb25zZS5yZWFkeVN0YXRlc1xuXG5mdW5jdGlvbiBkZWNpZGVNb2RlIChwcmVmZXJCaW5hcnksIHVzZUZldGNoKSB7XG5cdGlmIChjYXBhYmlsaXR5LmZldGNoICYmIHVzZUZldGNoKSB7XG5cdFx0cmV0dXJuICdmZXRjaCdcblx0fSBlbHNlIGlmIChjYXBhYmlsaXR5Lm1vemNodW5rZWRhcnJheWJ1ZmZlcikge1xuXHRcdHJldHVybiAnbW96LWNodW5rZWQtYXJyYXlidWZmZXInXG5cdH0gZWxzZSBpZiAoY2FwYWJpbGl0eS5tc3N0cmVhbSkge1xuXHRcdHJldHVybiAnbXMtc3RyZWFtJ1xuXHR9IGVsc2UgaWYgKGNhcGFiaWxpdHkuYXJyYXlidWZmZXIgJiYgcHJlZmVyQmluYXJ5KSB7XG5cdFx0cmV0dXJuICdhcnJheWJ1ZmZlcidcblx0fSBlbHNlIGlmIChjYXBhYmlsaXR5LnZiQXJyYXkgJiYgcHJlZmVyQmluYXJ5KSB7XG5cdFx0cmV0dXJuICd0ZXh0OnZiYXJyYXknXG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuICd0ZXh0J1xuXHR9XG59XG5cbnZhciBDbGllbnRSZXF1ZXN0ID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0cykge1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0c3RyZWFtLldyaXRhYmxlLmNhbGwoc2VsZilcblxuXHRzZWxmLl9vcHRzID0gb3B0c1xuXHRzZWxmLl9ib2R5ID0gW11cblx0c2VsZi5faGVhZGVycyA9IHt9XG5cdGlmIChvcHRzLmF1dGgpXG5cdFx0c2VsZi5zZXRIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIG5ldyBCdWZmZXIob3B0cy5hdXRoKS50b1N0cmluZygnYmFzZTY0JykpXG5cdE9iamVjdC5rZXlzKG9wdHMuaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXHRcdHNlbGYuc2V0SGVhZGVyKG5hbWUsIG9wdHMuaGVhZGVyc1tuYW1lXSlcblx0fSlcblxuXHR2YXIgcHJlZmVyQmluYXJ5XG5cdHZhciB1c2VGZXRjaCA9IHRydWVcblx0aWYgKG9wdHMubW9kZSA9PT0gJ2Rpc2FibGUtZmV0Y2gnKSB7XG5cdFx0Ly8gSWYgdGhlIHVzZSBvZiBYSFIgc2hvdWxkIGJlIHByZWZlcnJlZCBhbmQgaW5jbHVkZXMgcHJlc2VydmluZyB0aGUgJ2NvbnRlbnQtdHlwZScgaGVhZGVyXG5cdFx0dXNlRmV0Y2ggPSBmYWxzZVxuXHRcdHByZWZlckJpbmFyeSA9IHRydWVcblx0fSBlbHNlIGlmIChvcHRzLm1vZGUgPT09ICdwcmVmZXItc3RyZWFtaW5nJykge1xuXHRcdC8vIElmIHN0cmVhbWluZyBpcyBhIGhpZ2ggcHJpb3JpdHkgYnV0IGJpbmFyeSBjb21wYXRpYmlsaXR5IGFuZFxuXHRcdC8vIHRoZSBhY2N1cmFjeSBvZiB0aGUgJ2NvbnRlbnQtdHlwZScgaGVhZGVyIGFyZW4ndFxuXHRcdHByZWZlckJpbmFyeSA9IGZhbHNlXG5cdH0gZWxzZSBpZiAob3B0cy5tb2RlID09PSAnYWxsb3ctd3JvbmctY29udGVudC10eXBlJykge1xuXHRcdC8vIElmIHN0cmVhbWluZyBpcyBtb3JlIGltcG9ydGFudCB0aGFuIHByZXNlcnZpbmcgdGhlICdjb250ZW50LXR5cGUnIGhlYWRlclxuXHRcdHByZWZlckJpbmFyeSA9ICFjYXBhYmlsaXR5Lm92ZXJyaWRlTWltZVR5cGVcblx0fSBlbHNlIGlmICghb3B0cy5tb2RlIHx8IG9wdHMubW9kZSA9PT0gJ2RlZmF1bHQnIHx8IG9wdHMubW9kZSA9PT0gJ3ByZWZlci1mYXN0Jykge1xuXHRcdC8vIFVzZSBiaW5hcnkgaWYgdGV4dCBzdHJlYW1pbmcgbWF5IGNvcnJ1cHQgZGF0YSBvciB0aGUgY29udGVudC10eXBlIGhlYWRlciwgb3IgZm9yIHNwZWVkXG5cdFx0cHJlZmVyQmluYXJ5ID0gdHJ1ZVxuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2YWx1ZSBmb3Igb3B0cy5tb2RlJylcblx0fVxuXHRzZWxmLl9tb2RlID0gZGVjaWRlTW9kZShwcmVmZXJCaW5hcnksIHVzZUZldGNoKVxuXG5cdHNlbGYub24oJ2ZpbmlzaCcsIGZ1bmN0aW9uICgpIHtcblx0XHRzZWxmLl9vbkZpbmlzaCgpXG5cdH0pXG59XG5cbmluaGVyaXRzKENsaWVudFJlcXVlc3QsIHN0cmVhbS5Xcml0YWJsZSlcblxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuc2V0SGVhZGVyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG5cdHZhciBzZWxmID0gdGhpc1xuXHR2YXIgbG93ZXJOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpXG5cdC8vIFRoaXMgY2hlY2sgaXMgbm90IG5lY2Vzc2FyeSwgYnV0IGl0IHByZXZlbnRzIHdhcm5pbmdzIGZyb20gYnJvd3NlcnMgYWJvdXQgc2V0dGluZyB1bnNhZmVcblx0Ly8gaGVhZGVycy4gVG8gYmUgaG9uZXN0IEknbSBub3QgZW50aXJlbHkgc3VyZSBoaWRpbmcgdGhlc2Ugd2FybmluZ3MgaXMgYSBnb29kIHRoaW5nLCBidXRcblx0Ly8gaHR0cC1icm93c2VyaWZ5IGRpZCBpdCwgc28gSSB3aWxsIHRvby5cblx0aWYgKHVuc2FmZUhlYWRlcnMuaW5kZXhPZihsb3dlck5hbWUpICE9PSAtMSlcblx0XHRyZXR1cm5cblxuXHRzZWxmLl9oZWFkZXJzW2xvd2VyTmFtZV0gPSB7XG5cdFx0bmFtZTogbmFtZSxcblx0XHR2YWx1ZTogdmFsdWVcblx0fVxufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0cmV0dXJuIHNlbGYuX2hlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXS52YWx1ZVxufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5yZW1vdmVIZWFkZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0ZGVsZXRlIHNlbGYuX2hlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXVxufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5fb25GaW5pc2ggPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBzZWxmID0gdGhpc1xuXG5cdGlmIChzZWxmLl9kZXN0cm95ZWQpXG5cdFx0cmV0dXJuXG5cdHZhciBvcHRzID0gc2VsZi5fb3B0c1xuXG5cdHZhciBoZWFkZXJzT2JqID0gc2VsZi5faGVhZGVyc1xuXHR2YXIgYm9keVxuXHRpZiAob3B0cy5tZXRob2QgPT09ICdQT1NUJyB8fCBvcHRzLm1ldGhvZCA9PT0gJ1BVVCcgfHwgb3B0cy5tZXRob2QgPT09ICdQQVRDSCcpIHtcblx0XHRpZiAoY2FwYWJpbGl0eS5ibG9iQ29uc3RydWN0b3IpIHtcblx0XHRcdGJvZHkgPSBuZXcgZ2xvYmFsLkJsb2Ioc2VsZi5fYm9keS5tYXAoZnVuY3Rpb24gKGJ1ZmZlcikge1xuXHRcdFx0XHRyZXR1cm4gdG9BcnJheUJ1ZmZlcihidWZmZXIpXG5cdFx0XHR9KSwge1xuXHRcdFx0XHR0eXBlOiAoaGVhZGVyc09ialsnY29udGVudC10eXBlJ10gfHwge30pLnZhbHVlIHx8ICcnXG5cdFx0XHR9KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBnZXQgdXRmOCBzdHJpbmdcblx0XHRcdGJvZHkgPSBCdWZmZXIuY29uY2F0KHNlbGYuX2JvZHkpLnRvU3RyaW5nKClcblx0XHR9XG5cdH1cblxuXHRpZiAoc2VsZi5fbW9kZSA9PT0gJ2ZldGNoJykge1xuXHRcdHZhciBoZWFkZXJzID0gT2JqZWN0LmtleXMoaGVhZGVyc09iaikubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0XHRyZXR1cm4gW2hlYWRlcnNPYmpbbmFtZV0ubmFtZSwgaGVhZGVyc09ialtuYW1lXS52YWx1ZV1cblx0XHR9KVxuXG5cdFx0Z2xvYmFsLmZldGNoKHNlbGYuX29wdHMudXJsLCB7XG5cdFx0XHRtZXRob2Q6IHNlbGYuX29wdHMubWV0aG9kLFxuXHRcdFx0aGVhZGVyczogaGVhZGVycyxcblx0XHRcdGJvZHk6IGJvZHksXG5cdFx0XHRtb2RlOiAnY29ycycsXG5cdFx0XHRjcmVkZW50aWFsczogb3B0cy53aXRoQ3JlZGVudGlhbHMgPyAnaW5jbHVkZScgOiAnc2FtZS1vcmlnaW4nXG5cdFx0fSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdHNlbGYuX2ZldGNoUmVzcG9uc2UgPSByZXNwb25zZVxuXHRcdFx0c2VsZi5fY29ubmVjdCgpXG5cdFx0fSwgZnVuY3Rpb24gKHJlYXNvbikge1xuXHRcdFx0c2VsZi5lbWl0KCdlcnJvcicsIHJlYXNvbilcblx0XHR9KVxuXHR9IGVsc2Uge1xuXHRcdHZhciB4aHIgPSBzZWxmLl94aHIgPSBuZXcgZ2xvYmFsLlhNTEh0dHBSZXF1ZXN0KClcblx0XHR0cnkge1xuXHRcdFx0eGhyLm9wZW4oc2VsZi5fb3B0cy5tZXRob2QsIHNlbGYuX29wdHMudXJsLCB0cnVlKVxuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0cHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHNlbGYuZW1pdCgnZXJyb3InLCBlcnIpXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gQ2FuJ3Qgc2V0IHJlc3BvbnNlVHlwZSBvbiByZWFsbHkgb2xkIGJyb3dzZXJzXG5cdFx0aWYgKCdyZXNwb25zZVR5cGUnIGluIHhocilcblx0XHRcdHhoci5yZXNwb25zZVR5cGUgPSBzZWxmLl9tb2RlLnNwbGl0KCc6JylbMF1cblxuXHRcdGlmICgnd2l0aENyZWRlbnRpYWxzJyBpbiB4aHIpXG5cdFx0XHR4aHIud2l0aENyZWRlbnRpYWxzID0gISFvcHRzLndpdGhDcmVkZW50aWFsc1xuXG5cdFx0aWYgKHNlbGYuX21vZGUgPT09ICd0ZXh0JyAmJiAnb3ZlcnJpZGVNaW1lVHlwZScgaW4geGhyKVxuXHRcdFx0eGhyLm92ZXJyaWRlTWltZVR5cGUoJ3RleHQvcGxhaW47IGNoYXJzZXQ9eC11c2VyLWRlZmluZWQnKVxuXG5cdFx0T2JqZWN0LmtleXMoaGVhZGVyc09iaikuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyc09ialtuYW1lXS5uYW1lLCBoZWFkZXJzT2JqW25hbWVdLnZhbHVlKVxuXHRcdH0pXG5cblx0XHRzZWxmLl9yZXNwb25zZSA9IG51bGxcblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0c3dpdGNoICh4aHIucmVhZHlTdGF0ZSkge1xuXHRcdFx0XHRjYXNlIHJTdGF0ZXMuTE9BRElORzpcblx0XHRcdFx0Y2FzZSByU3RhdGVzLkRPTkU6XG5cdFx0XHRcdFx0c2VsZi5fb25YSFJQcm9ncmVzcygpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gTmVjZXNzYXJ5IGZvciBzdHJlYW1pbmcgaW4gRmlyZWZveCwgc2luY2UgeGhyLnJlc3BvbnNlIGlzIE9OTFkgZGVmaW5lZFxuXHRcdC8vIGluIG9ucHJvZ3Jlc3MsIG5vdCBpbiBvbnJlYWR5c3RhdGVjaGFuZ2Ugd2l0aCB4aHIucmVhZHlTdGF0ZSA9IDNcblx0XHRpZiAoc2VsZi5fbW9kZSA9PT0gJ21vei1jaHVua2VkLWFycmF5YnVmZmVyJykge1xuXHRcdFx0eGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHNlbGYuX29uWEhSUHJvZ3Jlc3MoKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHhoci5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHNlbGYuX2Rlc3Ryb3llZClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRzZWxmLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdYSFIgZXJyb3InKSlcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0eGhyLnNlbmQoYm9keSlcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzZWxmLmVtaXQoJ2Vycm9yJywgZXJyKVxuXHRcdFx0fSlcblx0XHRcdHJldHVyblxuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiB4aHIuc3RhdHVzIGlzIHJlYWRhYmxlIGFuZCBub24temVybywgaW5kaWNhdGluZyBubyBlcnJvci5cbiAqIEV2ZW4gdGhvdWdoIHRoZSBzcGVjIHNheXMgaXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBpbiByZWFkeVN0YXRlIDMsXG4gKiBhY2Nlc3NpbmcgaXQgdGhyb3dzIGFuIGV4Y2VwdGlvbiBpbiBJRThcbiAqL1xuZnVuY3Rpb24gc3RhdHVzVmFsaWQgKHhocikge1xuXHR0cnkge1xuXHRcdHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzXG5cdFx0cmV0dXJuIChzdGF0dXMgIT09IG51bGwgJiYgc3RhdHVzICE9PSAwKVxuXHR9IGNhdGNoIChlKSB7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cbn1cblxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuX29uWEhSUHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBzZWxmID0gdGhpc1xuXG5cdGlmICghc3RhdHVzVmFsaWQoc2VsZi5feGhyKSB8fCBzZWxmLl9kZXN0cm95ZWQpXG5cdFx0cmV0dXJuXG5cblx0aWYgKCFzZWxmLl9yZXNwb25zZSlcblx0XHRzZWxmLl9jb25uZWN0KClcblxuXHRzZWxmLl9yZXNwb25zZS5fb25YSFJQcm9ncmVzcygpXG59XG5cbkNsaWVudFJlcXVlc3QucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblxuXHRpZiAoc2VsZi5fZGVzdHJveWVkKVxuXHRcdHJldHVyblxuXG5cdHNlbGYuX3Jlc3BvbnNlID0gbmV3IEluY29taW5nTWVzc2FnZShzZWxmLl94aHIsIHNlbGYuX2ZldGNoUmVzcG9uc2UsIHNlbGYuX21vZGUpXG5cdHNlbGYuZW1pdCgncmVzcG9uc2UnLCBzZWxmLl9yZXNwb25zZSlcbn1cblxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcblx0dmFyIHNlbGYgPSB0aGlzXG5cblx0c2VsZi5fYm9keS5wdXNoKGNodW5rKVxuXHRjYigpXG59XG5cbkNsaWVudFJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHNlbGYgPSB0aGlzXG5cdHNlbGYuX2Rlc3Ryb3llZCA9IHRydWVcblx0aWYgKHNlbGYuX3Jlc3BvbnNlKVxuXHRcdHNlbGYuX3Jlc3BvbnNlLl9kZXN0cm95ZWQgPSB0cnVlXG5cdGlmIChzZWxmLl94aHIpXG5cdFx0c2VsZi5feGhyLmFib3J0KClcblx0Ly8gQ3VycmVudGx5LCB0aGVyZSBpc24ndCBhIHdheSB0byB0cnVseSBhYm9ydCBhIGZldGNoLlxuXHQvLyBJZiB5b3UgbGlrZSBiaWtlc2hlZGRpbmcsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2hhdHdnL2ZldGNoL2lzc3Vlcy8yN1xufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoZGF0YSwgZW5jb2RpbmcsIGNiKSB7XG5cdHZhciBzZWxmID0gdGhpc1xuXHRpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcblx0XHRjYiA9IGRhdGFcblx0XHRkYXRhID0gdW5kZWZpbmVkXG5cdH1cblxuXHRzdHJlYW0uV3JpdGFibGUucHJvdG90eXBlLmVuZC5jYWxsKHNlbGYsIGRhdGEsIGVuY29kaW5nLCBjYilcbn1cblxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuZmx1c2hIZWFkZXJzID0gZnVuY3Rpb24gKCkge31cbkNsaWVudFJlcXVlc3QucHJvdG90eXBlLnNldFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7fVxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuc2V0Tm9EZWxheSA9IGZ1bmN0aW9uICgpIHt9XG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5zZXRTb2NrZXRLZWVwQWxpdmUgPSBmdW5jdGlvbiAoKSB7fVxuXG4vLyBUYWtlbiBmcm9tIGh0dHA6Ly93d3cudzMub3JnL1RSL1hNTEh0dHBSZXF1ZXN0LyN0aGUtc2V0cmVxdWVzdGhlYWRlciUyOCUyOS1tZXRob2RcbnZhciB1bnNhZmVIZWFkZXJzID0gW1xuXHQnYWNjZXB0LWNoYXJzZXQnLFxuXHQnYWNjZXB0LWVuY29kaW5nJyxcblx0J2FjY2Vzcy1jb250cm9sLXJlcXVlc3QtaGVhZGVycycsXG5cdCdhY2Nlc3MtY29udHJvbC1yZXF1ZXN0LW1ldGhvZCcsXG5cdCdjb25uZWN0aW9uJyxcblx0J2NvbnRlbnQtbGVuZ3RoJyxcblx0J2Nvb2tpZScsXG5cdCdjb29raWUyJyxcblx0J2RhdGUnLFxuXHQnZG50Jyxcblx0J2V4cGVjdCcsXG5cdCdob3N0Jyxcblx0J2tlZXAtYWxpdmUnLFxuXHQnb3JpZ2luJyxcblx0J3JlZmVyZXInLFxuXHQndGUnLFxuXHQndHJhaWxlcicsXG5cdCd0cmFuc2Zlci1lbmNvZGluZycsXG5cdCd1cGdyYWRlJyxcblx0J3VzZXItYWdlbnQnLFxuXHQndmlhJ1xuXVxuIiwidmFyIGNhcGFiaWxpdHkgPSByZXF1aXJlKCcuL2NhcGFiaWxpdHknKVxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxudmFyIHN0cmVhbSA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbScpXG5cbnZhciByU3RhdGVzID0gZXhwb3J0cy5yZWFkeVN0YXRlcyA9IHtcblx0VU5TRU5UOiAwLFxuXHRPUEVORUQ6IDEsXG5cdEhFQURFUlNfUkVDRUlWRUQ6IDIsXG5cdExPQURJTkc6IDMsXG5cdERPTkU6IDRcbn1cblxudmFyIEluY29taW5nTWVzc2FnZSA9IGV4cG9ydHMuSW5jb21pbmdNZXNzYWdlID0gZnVuY3Rpb24gKHhociwgcmVzcG9uc2UsIG1vZGUpIHtcblx0dmFyIHNlbGYgPSB0aGlzXG5cdHN0cmVhbS5SZWFkYWJsZS5jYWxsKHNlbGYpXG5cblx0c2VsZi5fbW9kZSA9IG1vZGVcblx0c2VsZi5oZWFkZXJzID0ge31cblx0c2VsZi5yYXdIZWFkZXJzID0gW11cblx0c2VsZi50cmFpbGVycyA9IHt9XG5cdHNlbGYucmF3VHJhaWxlcnMgPSBbXVxuXG5cdC8vIEZha2UgdGhlICdjbG9zZScgZXZlbnQsIGJ1dCBvbmx5IG9uY2UgJ2VuZCcgZmlyZXNcblx0c2VsZi5vbignZW5kJywgZnVuY3Rpb24gKCkge1xuXHRcdC8vIFRoZSBuZXh0VGljayBpcyBuZWNlc3NhcnkgdG8gcHJldmVudCB0aGUgJ3JlcXVlc3QnIG1vZHVsZSBmcm9tIGNhdXNpbmcgYW4gaW5maW5pdGUgbG9vcFxuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5lbWl0KCdjbG9zZScpXG5cdFx0fSlcblx0fSlcblxuXHRpZiAobW9kZSA9PT0gJ2ZldGNoJykge1xuXHRcdHNlbGYuX2ZldGNoUmVzcG9uc2UgPSByZXNwb25zZVxuXG5cdFx0c2VsZi51cmwgPSByZXNwb25zZS51cmxcblx0XHRzZWxmLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXNcblx0XHRzZWxmLnN0YXR1c01lc3NhZ2UgPSByZXNwb25zZS5zdGF0dXNUZXh0XG5cdFx0Ly8gYmFja3dhcmRzIGNvbXBhdGlibGUgdmVyc2lvbiBvZiBmb3IgKDxpdGVtPiBvZiA8aXRlcmFibGU+KTpcblx0XHQvLyBmb3IgKHZhciA8aXRlbT4sX2ksX2l0ID0gPGl0ZXJhYmxlPltTeW1ib2wuaXRlcmF0b3JdKCk7IDxpdGVtPiA9IChfaSA9IF9pdC5uZXh0KCkpLnZhbHVlLCFfaS5kb25lOylcblx0XHRmb3IgKHZhciBoZWFkZXIsIF9pLCBfaXQgPSByZXNwb25zZS5oZWFkZXJzW1N5bWJvbC5pdGVyYXRvcl0oKTsgaGVhZGVyID0gKF9pID0gX2l0Lm5leHQoKSkudmFsdWUsICFfaS5kb25lOykge1xuXHRcdFx0c2VsZi5oZWFkZXJzW2hlYWRlclswXS50b0xvd2VyQ2FzZSgpXSA9IGhlYWRlclsxXVxuXHRcdFx0c2VsZi5yYXdIZWFkZXJzLnB1c2goaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG5cdFx0fVxuXG5cdFx0Ly8gVE9ETzogdGhpcyBkb2Vzbid0IHJlc3BlY3QgYmFja3ByZXNzdXJlLiBPbmNlIFdyaXRhYmxlU3RyZWFtIGlzIGF2YWlsYWJsZSwgdGhpcyBjYW4gYmUgZml4ZWRcblx0XHR2YXIgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKVxuXHRcdGZ1bmN0aW9uIHJlYWQgKCkge1xuXHRcdFx0cmVhZGVyLnJlYWQoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblx0XHRcdFx0aWYgKHNlbGYuX2Rlc3Ryb3llZClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0aWYgKHJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdFx0c2VsZi5wdXNoKG51bGwpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdFx0c2VsZi5wdXNoKG5ldyBCdWZmZXIocmVzdWx0LnZhbHVlKSlcblx0XHRcdFx0cmVhZCgpXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRyZWFkKClcblxuXHR9IGVsc2Uge1xuXHRcdHNlbGYuX3hociA9IHhoclxuXHRcdHNlbGYuX3BvcyA9IDBcblxuXHRcdHNlbGYudXJsID0geGhyLnJlc3BvbnNlVVJMXG5cdFx0c2VsZi5zdGF0dXNDb2RlID0geGhyLnN0YXR1c1xuXHRcdHNlbGYuc3RhdHVzTWVzc2FnZSA9IHhoci5zdGF0dXNUZXh0XG5cdFx0dmFyIGhlYWRlcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkuc3BsaXQoL1xccj9cXG4vKVxuXHRcdGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGVhZGVyKSB7XG5cdFx0XHR2YXIgbWF0Y2hlcyA9IGhlYWRlci5tYXRjaCgvXihbXjpdKyk6XFxzKiguKikvKVxuXHRcdFx0aWYgKG1hdGNoZXMpIHtcblx0XHRcdFx0dmFyIGtleSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKVxuXHRcdFx0XHRpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcblx0XHRcdFx0XHRpZiAoc2VsZi5oZWFkZXJzW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0c2VsZi5oZWFkZXJzW2tleV0gPSBbXVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzZWxmLmhlYWRlcnNba2V5XS5wdXNoKG1hdGNoZXNbMl0pXG5cdFx0XHRcdH0gZWxzZSBpZiAoc2VsZi5oZWFkZXJzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHNlbGYuaGVhZGVyc1trZXldICs9ICcsICcgKyBtYXRjaGVzWzJdXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5oZWFkZXJzW2tleV0gPSBtYXRjaGVzWzJdXG5cdFx0XHRcdH1cblx0XHRcdFx0c2VsZi5yYXdIZWFkZXJzLnB1c2gobWF0Y2hlc1sxXSwgbWF0Y2hlc1syXSlcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0c2VsZi5fY2hhcnNldCA9ICd4LXVzZXItZGVmaW5lZCdcblx0XHRpZiAoIWNhcGFiaWxpdHkub3ZlcnJpZGVNaW1lVHlwZSkge1xuXHRcdFx0dmFyIG1pbWVUeXBlID0gc2VsZi5yYXdIZWFkZXJzWydtaW1lLXR5cGUnXVxuXHRcdFx0aWYgKG1pbWVUeXBlKSB7XG5cdFx0XHRcdHZhciBjaGFyc2V0TWF0Y2ggPSBtaW1lVHlwZS5tYXRjaCgvO1xccypjaGFyc2V0PShbXjtdKSg7fCQpLylcblx0XHRcdFx0aWYgKGNoYXJzZXRNYXRjaCkge1xuXHRcdFx0XHRcdHNlbGYuX2NoYXJzZXQgPSBjaGFyc2V0TWF0Y2hbMV0udG9Mb3dlckNhc2UoKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXNlbGYuX2NoYXJzZXQpXG5cdFx0XHRcdHNlbGYuX2NoYXJzZXQgPSAndXRmLTgnIC8vIGJlc3QgZ3Vlc3Ncblx0XHR9XG5cdH1cbn1cblxuaW5oZXJpdHMoSW5jb21pbmdNZXNzYWdlLCBzdHJlYW0uUmVhZGFibGUpXG5cbkluY29taW5nTWVzc2FnZS5wcm90b3R5cGUuX3JlYWQgPSBmdW5jdGlvbiAoKSB7fVxuXG5JbmNvbWluZ01lc3NhZ2UucHJvdG90eXBlLl9vblhIUlByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblxuXHR2YXIgeGhyID0gc2VsZi5feGhyXG5cblx0dmFyIHJlc3BvbnNlID0gbnVsbFxuXHRzd2l0Y2ggKHNlbGYuX21vZGUpIHtcblx0XHRjYXNlICd0ZXh0OnZiYXJyYXknOiAvLyBGb3IgSUU5XG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgIT09IHJTdGF0ZXMuRE9ORSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8vIFRoaXMgZmFpbHMgaW4gSUU4XG5cdFx0XHRcdHJlc3BvbnNlID0gbmV3IGdsb2JhbC5WQkFycmF5KHhoci5yZXNwb25zZUJvZHkpLnRvQXJyYXkoKVxuXHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdGlmIChyZXNwb25zZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRzZWxmLnB1c2gobmV3IEJ1ZmZlcihyZXNwb25zZSkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHQvLyBGYWxscyB0aHJvdWdoIGluIElFOFx0XG5cdFx0Y2FzZSAndGV4dCc6XG5cdFx0XHR0cnkgeyAvLyBUaGlzIHdpbGwgZmFpbCB3aGVuIHJlYWR5U3RhdGUgPSAzIGluIElFOS4gU3dpdGNoIG1vZGUgYW5kIHdhaXQgZm9yIHJlYWR5U3RhdGUgPSA0XG5cdFx0XHRcdHJlc3BvbnNlID0geGhyLnJlc3BvbnNlVGV4dFxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRzZWxmLl9tb2RlID0gJ3RleHQ6dmJhcnJheSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGlmIChyZXNwb25zZS5sZW5ndGggPiBzZWxmLl9wb3MpIHtcblx0XHRcdFx0dmFyIG5ld0RhdGEgPSByZXNwb25zZS5zdWJzdHIoc2VsZi5fcG9zKVxuXHRcdFx0XHRpZiAoc2VsZi5fY2hhcnNldCA9PT0gJ3gtdXNlci1kZWZpbmVkJykge1xuXHRcdFx0XHRcdHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKG5ld0RhdGEubGVuZ3RoKVxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbmV3RGF0YS5sZW5ndGg7IGkrKylcblx0XHRcdFx0XHRcdGJ1ZmZlcltpXSA9IG5ld0RhdGEuY2hhckNvZGVBdChpKSAmIDB4ZmZcblxuXHRcdFx0XHRcdHNlbGYucHVzaChidWZmZXIpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5wdXNoKG5ld0RhdGEsIHNlbGYuX2NoYXJzZXQpXG5cdFx0XHRcdH1cblx0XHRcdFx0c2VsZi5fcG9zID0gcmVzcG9uc2UubGVuZ3RoXG5cdFx0XHR9XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgJ2FycmF5YnVmZmVyJzpcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSAhPT0gclN0YXRlcy5ET05FIHx8ICF4aHIucmVzcG9uc2UpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRyZXNwb25zZSA9IHhoci5yZXNwb25zZVxuXHRcdFx0c2VsZi5wdXNoKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkocmVzcG9uc2UpKSlcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnbW96LWNodW5rZWQtYXJyYXlidWZmZXInOiAvLyB0YWtlIHdob2xlXG5cdFx0XHRyZXNwb25zZSA9IHhoci5yZXNwb25zZVxuXHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlICE9PSByU3RhdGVzLkxPQURJTkcgfHwgIXJlc3BvbnNlKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0c2VsZi5wdXNoKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkocmVzcG9uc2UpKSlcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnbXMtc3RyZWFtJzpcblx0XHRcdHJlc3BvbnNlID0geGhyLnJlc3BvbnNlXG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgIT09IHJTdGF0ZXMuTE9BRElORylcblx0XHRcdFx0YnJlYWtcblx0XHRcdHZhciByZWFkZXIgPSBuZXcgZ2xvYmFsLk1TU3RyZWFtUmVhZGVyKClcblx0XHRcdHJlYWRlci5vbnByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAocmVhZGVyLnJlc3VsdC5ieXRlTGVuZ3RoID4gc2VsZi5fcG9zKSB7XG5cdFx0XHRcdFx0c2VsZi5wdXNoKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkocmVhZGVyLnJlc3VsdC5zbGljZShzZWxmLl9wb3MpKSkpXG5cdFx0XHRcdFx0c2VsZi5fcG9zID0gcmVhZGVyLnJlc3VsdC5ieXRlTGVuZ3RoXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHNlbGYucHVzaChudWxsKVxuXHRcdFx0fVxuXHRcdFx0Ly8gcmVhZGVyLm9uZXJyb3IgPSA/Pz8gLy8gVE9ETzogdGhpc1xuXHRcdFx0cmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKHJlc3BvbnNlKVxuXHRcdFx0YnJlYWtcblx0fVxuXG5cdC8vIFRoZSBtcy1zdHJlYW0gY2FzZSBoYW5kbGVzIGVuZCBzZXBhcmF0ZWx5IGluIHJlYWRlci5vbmxvYWQoKVxuXHRpZiAoc2VsZi5feGhyLnJlYWR5U3RhdGUgPT09IHJTdGF0ZXMuRE9ORSAmJiBzZWxmLl9tb2RlICE9PSAnbXMtc3RyZWFtJykge1xuXHRcdHNlbGYucHVzaChudWxsKVxuXHR9XG59XG4iLCIvLyBhIGR1cGxleCBzdHJlYW0gaXMganVzdCBhIHN0cmVhbSB0aGF0IGlzIGJvdGggcmVhZGFibGUgYW5kIHdyaXRhYmxlLlxuLy8gU2luY2UgSlMgZG9lc24ndCBoYXZlIG11bHRpcGxlIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UsIHRoaXMgY2xhc3Ncbi8vIHByb3RvdHlwYWxseSBpbmhlcml0cyBmcm9tIFJlYWRhYmxlLCBhbmQgdGhlbiBwYXJhc2l0aWNhbGx5IGZyb21cbi8vIFdyaXRhYmxlLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8qPHJlcGxhY2VtZW50PiovXG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAga2V5cy5wdXNoKGtleSk7XG4gIH1yZXR1cm4ga2V5cztcbn07XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxubW9kdWxlLmV4cG9ydHMgPSBEdXBsZXg7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgcHJvY2Vzc05leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy1uZXh0aWNrLWFyZ3MnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBSZWFkYWJsZSA9IHJlcXVpcmUoJy4vX3N0cmVhbV9yZWFkYWJsZScpO1xudmFyIFdyaXRhYmxlID0gcmVxdWlyZSgnLi9fc3RyZWFtX3dyaXRhYmxlJyk7XG5cbnV0aWwuaW5oZXJpdHMoRHVwbGV4LCBSZWFkYWJsZSk7XG5cbnZhciBrZXlzID0gb2JqZWN0S2V5cyhXcml0YWJsZS5wcm90b3R5cGUpO1xuZm9yICh2YXIgdiA9IDA7IHYgPCBrZXlzLmxlbmd0aDsgdisrKSB7XG4gIHZhciBtZXRob2QgPSBrZXlzW3ZdO1xuICBpZiAoIUR1cGxleC5wcm90b3R5cGVbbWV0aG9kXSkgRHVwbGV4LnByb3RvdHlwZVttZXRob2RdID0gV3JpdGFibGUucHJvdG90eXBlW21ldGhvZF07XG59XG5cbmZ1bmN0aW9uIER1cGxleChvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBEdXBsZXgpKSByZXR1cm4gbmV3IER1cGxleChvcHRpb25zKTtcblxuICBSZWFkYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICBXcml0YWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVhZGFibGUgPT09IGZhbHNlKSB0aGlzLnJlYWRhYmxlID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy53cml0YWJsZSA9PT0gZmFsc2UpIHRoaXMud3JpdGFibGUgPSBmYWxzZTtcblxuICB0aGlzLmFsbG93SGFsZk9wZW4gPSB0cnVlO1xuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmFsbG93SGFsZk9wZW4gPT09IGZhbHNlKSB0aGlzLmFsbG93SGFsZk9wZW4gPSBmYWxzZTtcblxuICB0aGlzLm9uY2UoJ2VuZCcsIG9uZW5kKTtcbn1cblxuLy8gdGhlIG5vLWhhbGYtb3BlbiBlbmZvcmNlclxuZnVuY3Rpb24gb25lbmQoKSB7XG4gIC8vIGlmIHdlIGFsbG93IGhhbGYtb3BlbiBzdGF0ZSwgb3IgaWYgdGhlIHdyaXRhYmxlIHNpZGUgZW5kZWQsXG4gIC8vIHRoZW4gd2UncmUgb2suXG4gIGlmICh0aGlzLmFsbG93SGFsZk9wZW4gfHwgdGhpcy5fd3JpdGFibGVTdGF0ZS5lbmRlZCkgcmV0dXJuO1xuXG4gIC8vIG5vIG1vcmUgZGF0YSBjYW4gYmUgd3JpdHRlbi5cbiAgLy8gQnV0IGFsbG93IG1vcmUgd3JpdGVzIHRvIGhhcHBlbiBpbiB0aGlzIHRpY2suXG4gIHByb2Nlc3NOZXh0VGljayhvbkVuZE5ULCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25FbmROVChzZWxmKSB7XG4gIHNlbGYuZW5kKCk7XG59XG5cbmZ1bmN0aW9uIGZvckVhY2goeHMsIGYpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmKHhzW2ldLCBpKTtcbiAgfVxufSIsIi8vIGEgcGFzc3Rocm91Z2ggc3RyZWFtLlxuLy8gYmFzaWNhbGx5IGp1c3QgdGhlIG1vc3QgbWluaW1hbCBzb3J0IG9mIFRyYW5zZm9ybSBzdHJlYW0uXG4vLyBFdmVyeSB3cml0dGVuIGNodW5rIGdldHMgb3V0cHV0IGFzLWlzLlxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gUGFzc1Rocm91Z2g7XG5cbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL19zdHJlYW1fdHJhbnNmb3JtJyk7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudXRpbC5pbmhlcml0cyhQYXNzVGhyb3VnaCwgVHJhbnNmb3JtKTtcblxuZnVuY3Rpb24gUGFzc1Rocm91Z2gob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUGFzc1Rocm91Z2gpKSByZXR1cm4gbmV3IFBhc3NUaHJvdWdoKG9wdGlvbnMpO1xuXG4gIFRyYW5zZm9ybS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5QYXNzVGhyb3VnaC5wcm90b3R5cGUuX3RyYW5zZm9ybSA9IGZ1bmN0aW9uIChjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNiKG51bGwsIGNodW5rKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWRhYmxlO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHByb2Nlc3NOZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MtbmV4dGljay1hcmdzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cblJlYWRhYmxlLlJlYWRhYmxlU3RhdGUgPSBSZWFkYWJsZVN0YXRlO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG52YXIgRUVsaXN0ZW5lckNvdW50ID0gZnVuY3Rpb24gKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJzKHR5cGUpLmxlbmd0aDtcbn07XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBTdHJlYW07XG4oZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIFN0cmVhbSA9IHJlcXVpcmUoJ3N0JyArICdyZWFtJyk7XG4gIH0gY2F0Y2ggKF8pIHt9IGZpbmFsbHkge1xuICAgIGlmICghU3RyZWFtKSBTdHJlYW0gPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG4gIH1cbn0pKCk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbi8qPHJlcGxhY2VtZW50PiovXG52YXIgYnVmZmVyU2hpbSA9IHJlcXVpcmUoJ2J1ZmZlci1zaGltcycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBkZWJ1Z1V0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG52YXIgZGVidWcgPSB2b2lkIDA7XG5pZiAoZGVidWdVdGlsICYmIGRlYnVnVXRpbC5kZWJ1Z2xvZykge1xuICBkZWJ1ZyA9IGRlYnVnVXRpbC5kZWJ1Z2xvZygnc3RyZWFtJyk7XG59IGVsc2Uge1xuICBkZWJ1ZyA9IGZ1bmN0aW9uICgpIHt9O1xufVxuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBCdWZmZXJMaXN0ID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9zdHJlYW1zL0J1ZmZlckxpc3QnKTtcbnZhciBTdHJpbmdEZWNvZGVyO1xuXG51dGlsLmluaGVyaXRzKFJlYWRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIoZW1pdHRlciwgZXZlbnQsIGZuKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5wcmVwZW5kTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5wcmVwZW5kTGlzdGVuZXIoZXZlbnQsIGZuKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGlzIGlzIGEgaGFjayB0byBtYWtlIHN1cmUgdGhhdCBvdXIgZXJyb3IgaGFuZGxlciBpcyBhdHRhY2hlZCBiZWZvcmUgYW55XG4gICAgLy8gdXNlcmxhbmQgb25lcy4gIE5FVkVSIERPIFRISVMuIFRoaXMgaXMgaGVyZSBvbmx5IGJlY2F1c2UgdGhpcyBjb2RlIG5lZWRzXG4gICAgLy8gdG8gY29udGludWUgdG8gd29yayB3aXRoIG9sZGVyIHZlcnNpb25zIG9mIE5vZGUuanMgdGhhdCBkbyBub3QgaW5jbHVkZVxuICAgIC8vIHRoZSBwcmVwZW5kTGlzdGVuZXIoKSBtZXRob2QuIFRoZSBnb2FsIGlzIHRvIGV2ZW50dWFsbHkgcmVtb3ZlIHRoaXMgaGFjay5cbiAgICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW2V2ZW50XSkgZW1pdHRlci5vbihldmVudCwgZm4pO2Vsc2UgaWYgKGlzQXJyYXkoZW1pdHRlci5fZXZlbnRzW2V2ZW50XSkpIGVtaXR0ZXIuX2V2ZW50c1tldmVudF0udW5zaGlmdChmbik7ZWxzZSBlbWl0dGVyLl9ldmVudHNbZXZlbnRdID0gW2ZuLCBlbWl0dGVyLl9ldmVudHNbZXZlbnRdXTtcbiAgfVxufVxuXG52YXIgRHVwbGV4O1xuZnVuY3Rpb24gUmVhZGFibGVTdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgRHVwbGV4ID0gRHVwbGV4IHx8IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyBvYmplY3Qgc3RyZWFtIGZsYWcuIFVzZWQgdG8gbWFrZSByZWFkKG4pIGlnbm9yZSBuIGFuZCB0b1xuICAvLyBtYWtlIGFsbCB0aGUgYnVmZmVyIG1lcmdpbmcgYW5kIGxlbmd0aCBjaGVja3MgZ28gYXdheVxuICB0aGlzLm9iamVjdE1vZGUgPSAhIW9wdGlvbnMub2JqZWN0TW9kZTtcblxuICBpZiAoc3RyZWFtIGluc3RhbmNlb2YgRHVwbGV4KSB0aGlzLm9iamVjdE1vZGUgPSB0aGlzLm9iamVjdE1vZGUgfHwgISFvcHRpb25zLnJlYWRhYmxlT2JqZWN0TW9kZTtcblxuICAvLyB0aGUgcG9pbnQgYXQgd2hpY2ggaXQgc3RvcHMgY2FsbGluZyBfcmVhZCgpIHRvIGZpbGwgdGhlIGJ1ZmZlclxuICAvLyBOb3RlOiAwIGlzIGEgdmFsaWQgdmFsdWUsIG1lYW5zIFwiZG9uJ3QgY2FsbCBfcmVhZCBwcmVlbXB0aXZlbHkgZXZlclwiXG4gIHZhciBod20gPSBvcHRpb25zLmhpZ2hXYXRlck1hcms7XG4gIHZhciBkZWZhdWx0SHdtID0gdGhpcy5vYmplY3RNb2RlID8gMTYgOiAxNiAqIDEwMjQ7XG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IGh3bSB8fCBod20gPT09IDAgPyBod20gOiBkZWZhdWx0SHdtO1xuXG4gIC8vIGNhc3QgdG8gaW50cy5cbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gfiB+dGhpcy5oaWdoV2F0ZXJNYXJrO1xuXG4gIC8vIEEgbGlua2VkIGxpc3QgaXMgdXNlZCB0byBzdG9yZSBkYXRhIGNodW5rcyBpbnN0ZWFkIG9mIGFuIGFycmF5IGJlY2F1c2UgdGhlXG4gIC8vIGxpbmtlZCBsaXN0IGNhbiByZW1vdmUgZWxlbWVudHMgZnJvbSB0aGUgYmVnaW5uaW5nIGZhc3RlciB0aGFuXG4gIC8vIGFycmF5LnNoaWZ0KClcbiAgdGhpcy5idWZmZXIgPSBuZXcgQnVmZmVyTGlzdCgpO1xuICB0aGlzLmxlbmd0aCA9IDA7XG4gIHRoaXMucGlwZXMgPSBudWxsO1xuICB0aGlzLnBpcGVzQ291bnQgPSAwO1xuICB0aGlzLmZsb3dpbmcgPSBudWxsO1xuICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gIHRoaXMuZW5kRW1pdHRlZCA9IGZhbHNlO1xuICB0aGlzLnJlYWRpbmcgPSBmYWxzZTtcblxuICAvLyBhIGZsYWcgdG8gYmUgYWJsZSB0byB0ZWxsIGlmIHRoZSBvbndyaXRlIGNiIGlzIGNhbGxlZCBpbW1lZGlhdGVseSxcbiAgLy8gb3Igb24gYSBsYXRlciB0aWNrLiAgV2Ugc2V0IHRoaXMgdG8gdHJ1ZSBhdCBmaXJzdCwgYmVjYXVzZSBhbnlcbiAgLy8gYWN0aW9ucyB0aGF0IHNob3VsZG4ndCBoYXBwZW4gdW50aWwgXCJsYXRlclwiIHNob3VsZCBnZW5lcmFsbHkgYWxzb1xuICAvLyBub3QgaGFwcGVuIGJlZm9yZSB0aGUgZmlyc3Qgd3JpdGUgY2FsbC5cbiAgdGhpcy5zeW5jID0gdHJ1ZTtcblxuICAvLyB3aGVuZXZlciB3ZSByZXR1cm4gbnVsbCwgdGhlbiB3ZSBzZXQgYSBmbGFnIHRvIHNheVxuICAvLyB0aGF0IHdlJ3JlIGF3YWl0aW5nIGEgJ3JlYWRhYmxlJyBldmVudCBlbWlzc2lvbi5cbiAgdGhpcy5uZWVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcbiAgdGhpcy5yZWFkYWJsZUxpc3RlbmluZyA9IGZhbHNlO1xuICB0aGlzLnJlc3VtZVNjaGVkdWxlZCA9IGZhbHNlO1xuXG4gIC8vIENyeXB0byBpcyBraW5kIG9mIG9sZCBhbmQgY3J1c3R5LiAgSGlzdG9yaWNhbGx5LCBpdHMgZGVmYXVsdCBzdHJpbmdcbiAgLy8gZW5jb2RpbmcgaXMgJ2JpbmFyeScgc28gd2UgaGF2ZSB0byBtYWtlIHRoaXMgY29uZmlndXJhYmxlLlxuICAvLyBFdmVyeXRoaW5nIGVsc2UgaW4gdGhlIHVuaXZlcnNlIHVzZXMgJ3V0ZjgnLCB0aG91Z2guXG4gIHRoaXMuZGVmYXVsdEVuY29kaW5nID0gb3B0aW9ucy5kZWZhdWx0RW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXG4gIC8vIHdoZW4gcGlwaW5nLCB3ZSBvbmx5IGNhcmUgYWJvdXQgJ3JlYWRhYmxlJyBldmVudHMgdGhhdCBoYXBwZW5cbiAgLy8gYWZ0ZXIgcmVhZCgpaW5nIGFsbCB0aGUgYnl0ZXMgYW5kIG5vdCBnZXR0aW5nIGFueSBwdXNoYmFjay5cbiAgdGhpcy5yYW5PdXQgPSBmYWxzZTtcblxuICAvLyB0aGUgbnVtYmVyIG9mIHdyaXRlcnMgdGhhdCBhcmUgYXdhaXRpbmcgYSBkcmFpbiBldmVudCBpbiAucGlwZSgpc1xuICB0aGlzLmF3YWl0RHJhaW4gPSAwO1xuXG4gIC8vIGlmIHRydWUsIGEgbWF5YmVSZWFkTW9yZSBoYXMgYmVlbiBzY2hlZHVsZWRcbiAgdGhpcy5yZWFkaW5nTW9yZSA9IGZhbHNlO1xuXG4gIHRoaXMuZGVjb2RlciA9IG51bGw7XG4gIHRoaXMuZW5jb2RpbmcgPSBudWxsO1xuICBpZiAob3B0aW9ucy5lbmNvZGluZykge1xuICAgIGlmICghU3RyaW5nRGVjb2RlcikgU3RyaW5nRGVjb2RlciA9IHJlcXVpcmUoJ3N0cmluZ19kZWNvZGVyLycpLlN0cmluZ0RlY29kZXI7XG4gICAgdGhpcy5kZWNvZGVyID0gbmV3IFN0cmluZ0RlY29kZXIob3B0aW9ucy5lbmNvZGluZyk7XG4gICAgdGhpcy5lbmNvZGluZyA9IG9wdGlvbnMuZW5jb2Rpbmc7XG4gIH1cbn1cblxudmFyIER1cGxleDtcbmZ1bmN0aW9uIFJlYWRhYmxlKG9wdGlvbnMpIHtcbiAgRHVwbGV4ID0gRHVwbGV4IHx8IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmVhZGFibGUpKSByZXR1cm4gbmV3IFJlYWRhYmxlKG9wdGlvbnMpO1xuXG4gIHRoaXMuX3JlYWRhYmxlU3RhdGUgPSBuZXcgUmVhZGFibGVTdGF0ZShvcHRpb25zLCB0aGlzKTtcblxuICAvLyBsZWdhY3lcbiAgdGhpcy5yZWFkYWJsZSA9IHRydWU7XG5cbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMucmVhZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fcmVhZCA9IG9wdGlvbnMucmVhZDtcblxuICBTdHJlYW0uY2FsbCh0aGlzKTtcbn1cblxuLy8gTWFudWFsbHkgc2hvdmUgc29tZXRoaW5nIGludG8gdGhlIHJlYWQoKSBidWZmZXIuXG4vLyBUaGlzIHJldHVybnMgdHJ1ZSBpZiB0aGUgaGlnaFdhdGVyTWFyayBoYXMgbm90IGJlZW4gaGl0IHlldCxcbi8vIHNpbWlsYXIgdG8gaG93IFdyaXRhYmxlLndyaXRlKCkgcmV0dXJucyB0cnVlIGlmIHlvdSBzaG91bGRcbi8vIHdyaXRlKCkgc29tZSBtb3JlLlxuUmVhZGFibGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgaWYgKCFzdGF0ZS5vYmplY3RNb2RlICYmIHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGVuY29kaW5nIHx8IHN0YXRlLmRlZmF1bHRFbmNvZGluZztcbiAgICBpZiAoZW5jb2RpbmcgIT09IHN0YXRlLmVuY29kaW5nKSB7XG4gICAgICBjaHVuayA9IGJ1ZmZlclNoaW0uZnJvbShjaHVuaywgZW5jb2RpbmcpO1xuICAgICAgZW5jb2RpbmcgPSAnJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVhZGFibGVBZGRDaHVuayh0aGlzLCBzdGF0ZSwgY2h1bmssIGVuY29kaW5nLCBmYWxzZSk7XG59O1xuXG4vLyBVbnNoaWZ0IHNob3VsZCAqYWx3YXlzKiBiZSBzb21ldGhpbmcgZGlyZWN0bHkgb3V0IG9mIHJlYWQoKVxuUmVhZGFibGUucHJvdG90eXBlLnVuc2hpZnQgPSBmdW5jdGlvbiAoY2h1bmspIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgcmV0dXJuIHJlYWRhYmxlQWRkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCAnJywgdHJ1ZSk7XG59O1xuXG5SZWFkYWJsZS5wcm90b3R5cGUuaXNQYXVzZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcgPT09IGZhbHNlO1xufTtcblxuZnVuY3Rpb24gcmVhZGFibGVBZGRDaHVuayhzdHJlYW0sIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGFkZFRvRnJvbnQpIHtcbiAgdmFyIGVyID0gY2h1bmtJbnZhbGlkKHN0YXRlLCBjaHVuayk7XG4gIGlmIChlcikge1xuICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgfSBlbHNlIGlmIChjaHVuayA9PT0gbnVsbCkge1xuICAgIHN0YXRlLnJlYWRpbmcgPSBmYWxzZTtcbiAgICBvbkVvZkNodW5rKHN0cmVhbSwgc3RhdGUpO1xuICB9IGVsc2UgaWYgKHN0YXRlLm9iamVjdE1vZGUgfHwgY2h1bmsgJiYgY2h1bmsubGVuZ3RoID4gMCkge1xuICAgIGlmIChzdGF0ZS5lbmRlZCAmJiAhYWRkVG9Gcm9udCkge1xuICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoJ3N0cmVhbS5wdXNoKCkgYWZ0ZXIgRU9GJyk7XG4gICAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlLmVuZEVtaXR0ZWQgJiYgYWRkVG9Gcm9udCkge1xuICAgICAgdmFyIF9lID0gbmV3IEVycm9yKCdzdHJlYW0udW5zaGlmdCgpIGFmdGVyIGVuZCBldmVudCcpO1xuICAgICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgX2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2tpcEFkZDtcbiAgICAgIGlmIChzdGF0ZS5kZWNvZGVyICYmICFhZGRUb0Zyb250ICYmICFlbmNvZGluZykge1xuICAgICAgICBjaHVuayA9IHN0YXRlLmRlY29kZXIud3JpdGUoY2h1bmspO1xuICAgICAgICBza2lwQWRkID0gIXN0YXRlLm9iamVjdE1vZGUgJiYgY2h1bmsubGVuZ3RoID09PSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWFkZFRvRnJvbnQpIHN0YXRlLnJlYWRpbmcgPSBmYWxzZTtcblxuICAgICAgLy8gRG9uJ3QgYWRkIHRvIHRoZSBidWZmZXIgaWYgd2UndmUgZGVjb2RlZCB0byBhbiBlbXB0eSBzdHJpbmcgY2h1bmsgYW5kXG4gICAgICAvLyB3ZSdyZSBub3QgaW4gb2JqZWN0IG1vZGVcbiAgICAgIGlmICghc2tpcEFkZCkge1xuICAgICAgICAvLyBpZiB3ZSB3YW50IHRoZSBkYXRhIG5vdywganVzdCBlbWl0IGl0LlxuICAgICAgICBpZiAoc3RhdGUuZmxvd2luZyAmJiBzdGF0ZS5sZW5ndGggPT09IDAgJiYgIXN0YXRlLnN5bmMpIHtcbiAgICAgICAgICBzdHJlYW0uZW1pdCgnZGF0YScsIGNodW5rKTtcbiAgICAgICAgICBzdHJlYW0ucmVhZCgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB1cGRhdGUgdGhlIGJ1ZmZlciBpbmZvLlxuICAgICAgICAgIHN0YXRlLmxlbmd0aCArPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcbiAgICAgICAgICBpZiAoYWRkVG9Gcm9udCkgc3RhdGUuYnVmZmVyLnVuc2hpZnQoY2h1bmspO2Vsc2Ugc3RhdGUuYnVmZmVyLnB1c2goY2h1bmspO1xuXG4gICAgICAgICAgaWYgKHN0YXRlLm5lZWRSZWFkYWJsZSkgZW1pdFJlYWRhYmxlKHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWF5YmVSZWFkTW9yZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWFkZFRvRnJvbnQpIHtcbiAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gbmVlZE1vcmVEYXRhKHN0YXRlKTtcbn1cblxuLy8gaWYgaXQncyBwYXN0IHRoZSBoaWdoIHdhdGVyIG1hcmssIHdlIGNhbiBwdXNoIGluIHNvbWUgbW9yZS5cbi8vIEFsc28sIGlmIHdlIGhhdmUgbm8gZGF0YSB5ZXQsIHdlIGNhbiBzdGFuZCBzb21lXG4vLyBtb3JlIGJ5dGVzLiAgVGhpcyBpcyB0byB3b3JrIGFyb3VuZCBjYXNlcyB3aGVyZSBod209MCxcbi8vIHN1Y2ggYXMgdGhlIHJlcGwuICBBbHNvLCBpZiB0aGUgcHVzaCgpIHRyaWdnZXJlZCBhXG4vLyByZWFkYWJsZSBldmVudCwgYW5kIHRoZSB1c2VyIGNhbGxlZCByZWFkKGxhcmdlTnVtYmVyKSBzdWNoIHRoYXRcbi8vIG5lZWRSZWFkYWJsZSB3YXMgc2V0LCB0aGVuIHdlIG91Z2h0IHRvIHB1c2ggbW9yZSwgc28gdGhhdCBhbm90aGVyXG4vLyAncmVhZGFibGUnIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkLlxuZnVuY3Rpb24gbmVlZE1vcmVEYXRhKHN0YXRlKSB7XG4gIHJldHVybiAhc3RhdGUuZW5kZWQgJiYgKHN0YXRlLm5lZWRSZWFkYWJsZSB8fCBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrIHx8IHN0YXRlLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuUmVhZGFibGUucHJvdG90eXBlLnNldEVuY29kaW5nID0gZnVuY3Rpb24gKGVuYykge1xuICBpZiAoIVN0cmluZ0RlY29kZXIpIFN0cmluZ0RlY29kZXIgPSByZXF1aXJlKCdzdHJpbmdfZGVjb2Rlci8nKS5TdHJpbmdEZWNvZGVyO1xuICB0aGlzLl9yZWFkYWJsZVN0YXRlLmRlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcihlbmMpO1xuICB0aGlzLl9yZWFkYWJsZVN0YXRlLmVuY29kaW5nID0gZW5jO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIERvbid0IHJhaXNlIHRoZSBod20gPiA4TUJcbnZhciBNQVhfSFdNID0gMHg4MDAwMDA7XG5mdW5jdGlvbiBjb21wdXRlTmV3SGlnaFdhdGVyTWFyayhuKSB7XG4gIGlmIChuID49IE1BWF9IV00pIHtcbiAgICBuID0gTUFYX0hXTTtcbiAgfSBlbHNlIHtcbiAgICAvLyBHZXQgdGhlIG5leHQgaGlnaGVzdCBwb3dlciBvZiAyIHRvIHByZXZlbnQgaW5jcmVhc2luZyBod20gZXhjZXNzaXZlbHkgaW5cbiAgICAvLyB0aW55IGFtb3VudHNcbiAgICBuLS07XG4gICAgbiB8PSBuID4+PiAxO1xuICAgIG4gfD0gbiA+Pj4gMjtcbiAgICBuIHw9IG4gPj4+IDQ7XG4gICAgbiB8PSBuID4+PiA4O1xuICAgIG4gfD0gbiA+Pj4gMTY7XG4gICAgbisrO1xuICB9XG4gIHJldHVybiBuO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGJlIGlubGluYWJsZSwgc28gcGxlYXNlIHRha2UgY2FyZSB3aGVuIG1ha2luZ1xuLy8gY2hhbmdlcyB0byB0aGUgZnVuY3Rpb24gYm9keS5cbmZ1bmN0aW9uIGhvd011Y2hUb1JlYWQobiwgc3RhdGUpIHtcbiAgaWYgKG4gPD0gMCB8fCBzdGF0ZS5sZW5ndGggPT09IDAgJiYgc3RhdGUuZW5kZWQpIHJldHVybiAwO1xuICBpZiAoc3RhdGUub2JqZWN0TW9kZSkgcmV0dXJuIDE7XG4gIGlmIChuICE9PSBuKSB7XG4gICAgLy8gT25seSBmbG93IG9uZSBidWZmZXIgYXQgYSB0aW1lXG4gICAgaWYgKHN0YXRlLmZsb3dpbmcgJiYgc3RhdGUubGVuZ3RoKSByZXR1cm4gc3RhdGUuYnVmZmVyLmhlYWQuZGF0YS5sZW5ndGg7ZWxzZSByZXR1cm4gc3RhdGUubGVuZ3RoO1xuICB9XG4gIC8vIElmIHdlJ3JlIGFza2luZyBmb3IgbW9yZSB0aGFuIHRoZSBjdXJyZW50IGh3bSwgdGhlbiByYWlzZSB0aGUgaHdtLlxuICBpZiAobiA+IHN0YXRlLmhpZ2hXYXRlck1hcmspIHN0YXRlLmhpZ2hXYXRlck1hcmsgPSBjb21wdXRlTmV3SGlnaFdhdGVyTWFyayhuKTtcbiAgaWYgKG4gPD0gc3RhdGUubGVuZ3RoKSByZXR1cm4gbjtcbiAgLy8gRG9uJ3QgaGF2ZSBlbm91Z2hcbiAgaWYgKCFzdGF0ZS5lbmRlZCkge1xuICAgIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcmV0dXJuIHN0YXRlLmxlbmd0aDtcbn1cblxuLy8geW91IGNhbiBvdmVycmlkZSBlaXRoZXIgdGhpcyBtZXRob2QsIG9yIHRoZSBhc3luYyBfcmVhZChuKSBiZWxvdy5cblJlYWRhYmxlLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24gKG4pIHtcbiAgZGVidWcoJ3JlYWQnLCBuKTtcbiAgbiA9IHBhcnNlSW50KG4sIDEwKTtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgdmFyIG5PcmlnID0gbjtcblxuICBpZiAobiAhPT0gMCkgc3RhdGUuZW1pdHRlZFJlYWRhYmxlID0gZmFsc2U7XG5cbiAgLy8gaWYgd2UncmUgZG9pbmcgcmVhZCgwKSB0byB0cmlnZ2VyIGEgcmVhZGFibGUgZXZlbnQsIGJ1dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYSBidW5jaCBvZiBkYXRhIGluIHRoZSBidWZmZXIsIHRoZW4ganVzdCB0cmlnZ2VyXG4gIC8vIHRoZSAncmVhZGFibGUnIGV2ZW50IGFuZCBtb3ZlIG9uLlxuICBpZiAobiA9PT0gMCAmJiBzdGF0ZS5uZWVkUmVhZGFibGUgJiYgKHN0YXRlLmxlbmd0aCA+PSBzdGF0ZS5oaWdoV2F0ZXJNYXJrIHx8IHN0YXRlLmVuZGVkKSkge1xuICAgIGRlYnVnKCdyZWFkOiBlbWl0UmVhZGFibGUnLCBzdGF0ZS5sZW5ndGgsIHN0YXRlLmVuZGVkKTtcbiAgICBpZiAoc3RhdGUubGVuZ3RoID09PSAwICYmIHN0YXRlLmVuZGVkKSBlbmRSZWFkYWJsZSh0aGlzKTtlbHNlIGVtaXRSZWFkYWJsZSh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIG4gPSBob3dNdWNoVG9SZWFkKG4sIHN0YXRlKTtcblxuICAvLyBpZiB3ZSd2ZSBlbmRlZCwgYW5kIHdlJ3JlIG5vdyBjbGVhciwgdGhlbiBmaW5pc2ggaXQgdXAuXG4gIGlmIChuID09PSAwICYmIHN0YXRlLmVuZGVkKSB7XG4gICAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCkgZW5kUmVhZGFibGUodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBBbGwgdGhlIGFjdHVhbCBjaHVuayBnZW5lcmF0aW9uIGxvZ2ljIG5lZWRzIHRvIGJlXG4gIC8vICpiZWxvdyogdGhlIGNhbGwgdG8gX3JlYWQuICBUaGUgcmVhc29uIGlzIHRoYXQgaW4gY2VydGFpblxuICAvLyBzeW50aGV0aWMgc3RyZWFtIGNhc2VzLCBzdWNoIGFzIHBhc3N0aHJvdWdoIHN0cmVhbXMsIF9yZWFkXG4gIC8vIG1heSBiZSBhIGNvbXBsZXRlbHkgc3luY2hyb25vdXMgb3BlcmF0aW9uIHdoaWNoIG1heSBjaGFuZ2VcbiAgLy8gdGhlIHN0YXRlIG9mIHRoZSByZWFkIGJ1ZmZlciwgcHJvdmlkaW5nIGVub3VnaCBkYXRhIHdoZW5cbiAgLy8gYmVmb3JlIHRoZXJlIHdhcyAqbm90KiBlbm91Z2guXG4gIC8vXG4gIC8vIFNvLCB0aGUgc3RlcHMgYXJlOlxuICAvLyAxLiBGaWd1cmUgb3V0IHdoYXQgdGhlIHN0YXRlIG9mIHRoaW5ncyB3aWxsIGJlIGFmdGVyIHdlIGRvXG4gIC8vIGEgcmVhZCBmcm9tIHRoZSBidWZmZXIuXG4gIC8vXG4gIC8vIDIuIElmIHRoYXQgcmVzdWx0aW5nIHN0YXRlIHdpbGwgdHJpZ2dlciBhIF9yZWFkLCB0aGVuIGNhbGwgX3JlYWQuXG4gIC8vIE5vdGUgdGhhdCB0aGlzIG1heSBiZSBhc3luY2hyb25vdXMsIG9yIHN5bmNocm9ub3VzLiAgWWVzLCBpdCBpc1xuICAvLyBkZWVwbHkgdWdseSB0byB3cml0ZSBBUElzIHRoaXMgd2F5LCBidXQgdGhhdCBzdGlsbCBkb2Vzbid0IG1lYW5cbiAgLy8gdGhhdCB0aGUgUmVhZGFibGUgY2xhc3Mgc2hvdWxkIGJlaGF2ZSBpbXByb3Blcmx5LCBhcyBzdHJlYW1zIGFyZVxuICAvLyBkZXNpZ25lZCB0byBiZSBzeW5jL2FzeW5jIGFnbm9zdGljLlxuICAvLyBUYWtlIG5vdGUgaWYgdGhlIF9yZWFkIGNhbGwgaXMgc3luYyBvciBhc3luYyAoaWUsIGlmIHRoZSByZWFkIGNhbGxcbiAgLy8gaGFzIHJldHVybmVkIHlldCksIHNvIHRoYXQgd2Uga25vdyB3aGV0aGVyIG9yIG5vdCBpdCdzIHNhZmUgdG8gZW1pdFxuICAvLyAncmVhZGFibGUnIGV0Yy5cbiAgLy9cbiAgLy8gMy4gQWN0dWFsbHkgcHVsbCB0aGUgcmVxdWVzdGVkIGNodW5rcyBvdXQgb2YgdGhlIGJ1ZmZlciBhbmQgcmV0dXJuLlxuXG4gIC8vIGlmIHdlIG5lZWQgYSByZWFkYWJsZSBldmVudCwgdGhlbiB3ZSBuZWVkIHRvIGRvIHNvbWUgcmVhZGluZy5cbiAgdmFyIGRvUmVhZCA9IHN0YXRlLm5lZWRSZWFkYWJsZTtcbiAgZGVidWcoJ25lZWQgcmVhZGFibGUnLCBkb1JlYWQpO1xuXG4gIC8vIGlmIHdlIGN1cnJlbnRseSBoYXZlIGxlc3MgdGhhbiB0aGUgaGlnaFdhdGVyTWFyaywgdGhlbiBhbHNvIHJlYWQgc29tZVxuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwIHx8IHN0YXRlLmxlbmd0aCAtIG4gPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgZG9SZWFkID0gdHJ1ZTtcbiAgICBkZWJ1ZygnbGVuZ3RoIGxlc3MgdGhhbiB3YXRlcm1hcmsnLCBkb1JlYWQpO1xuICB9XG5cbiAgLy8gaG93ZXZlciwgaWYgd2UndmUgZW5kZWQsIHRoZW4gdGhlcmUncyBubyBwb2ludCwgYW5kIGlmIHdlJ3JlIGFscmVhZHlcbiAgLy8gcmVhZGluZywgdGhlbiBpdCdzIHVubmVjZXNzYXJ5LlxuICBpZiAoc3RhdGUuZW5kZWQgfHwgc3RhdGUucmVhZGluZykge1xuICAgIGRvUmVhZCA9IGZhbHNlO1xuICAgIGRlYnVnKCdyZWFkaW5nIG9yIGVuZGVkJywgZG9SZWFkKTtcbiAgfSBlbHNlIGlmIChkb1JlYWQpIHtcbiAgICBkZWJ1ZygnZG8gcmVhZCcpO1xuICAgIHN0YXRlLnJlYWRpbmcgPSB0cnVlO1xuICAgIHN0YXRlLnN5bmMgPSB0cnVlO1xuICAgIC8vIGlmIHRoZSBsZW5ndGggaXMgY3VycmVudGx5IHplcm8sIHRoZW4gd2UgKm5lZWQqIGEgcmVhZGFibGUgZXZlbnQuXG4gICAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCkgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICAvLyBjYWxsIGludGVybmFsIHJlYWQgbWV0aG9kXG4gICAgdGhpcy5fcmVhZChzdGF0ZS5oaWdoV2F0ZXJNYXJrKTtcbiAgICBzdGF0ZS5zeW5jID0gZmFsc2U7XG4gICAgLy8gSWYgX3JlYWQgcHVzaGVkIGRhdGEgc3luY2hyb25vdXNseSwgdGhlbiBgcmVhZGluZ2Agd2lsbCBiZSBmYWxzZSxcbiAgICAvLyBhbmQgd2UgbmVlZCB0byByZS1ldmFsdWF0ZSBob3cgbXVjaCBkYXRhIHdlIGNhbiByZXR1cm4gdG8gdGhlIHVzZXIuXG4gICAgaWYgKCFzdGF0ZS5yZWFkaW5nKSBuID0gaG93TXVjaFRvUmVhZChuT3JpZywgc3RhdGUpO1xuICB9XG5cbiAgdmFyIHJldDtcbiAgaWYgKG4gPiAwKSByZXQgPSBmcm9tTGlzdChuLCBzdGF0ZSk7ZWxzZSByZXQgPSBudWxsO1xuXG4gIGlmIChyZXQgPT09IG51bGwpIHtcbiAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgIG4gPSAwO1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLmxlbmd0aCAtPSBuO1xuICB9XG5cbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIElmIHdlIGhhdmUgbm90aGluZyBpbiB0aGUgYnVmZmVyLCB0aGVuIHdlIHdhbnQgdG8ga25vd1xuICAgIC8vIGFzIHNvb24gYXMgd2UgKmRvKiBnZXQgc29tZXRoaW5nIGludG8gdGhlIGJ1ZmZlci5cbiAgICBpZiAoIXN0YXRlLmVuZGVkKSBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuXG4gICAgLy8gSWYgd2UgdHJpZWQgdG8gcmVhZCgpIHBhc3QgdGhlIEVPRiwgdGhlbiBlbWl0IGVuZCBvbiB0aGUgbmV4dCB0aWNrLlxuICAgIGlmIChuT3JpZyAhPT0gbiAmJiBzdGF0ZS5lbmRlZCkgZW5kUmVhZGFibGUodGhpcyk7XG4gIH1cblxuICBpZiAocmV0ICE9PSBudWxsKSB0aGlzLmVtaXQoJ2RhdGEnLCByZXQpO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBjaHVua0ludmFsaWQoc3RhdGUsIGNodW5rKSB7XG4gIHZhciBlciA9IG51bGw7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGNodW5rKSAmJiB0eXBlb2YgY2h1bmsgIT09ICdzdHJpbmcnICYmIGNodW5rICE9PSBudWxsICYmIGNodW5rICE9PSB1bmRlZmluZWQgJiYgIXN0YXRlLm9iamVjdE1vZGUpIHtcbiAgICBlciA9IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbm9uLXN0cmluZy9idWZmZXIgY2h1bmsnKTtcbiAgfVxuICByZXR1cm4gZXI7XG59XG5cbmZ1bmN0aW9uIG9uRW9mQ2h1bmsoc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUuZW5kZWQpIHJldHVybjtcbiAgaWYgKHN0YXRlLmRlY29kZXIpIHtcbiAgICB2YXIgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLmVuZCgpO1xuICAgIGlmIChjaHVuayAmJiBjaHVuay5sZW5ndGgpIHtcbiAgICAgIHN0YXRlLmJ1ZmZlci5wdXNoKGNodW5rKTtcbiAgICAgIHN0YXRlLmxlbmd0aCArPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgc3RhdGUuZW5kZWQgPSB0cnVlO1xuXG4gIC8vIGVtaXQgJ3JlYWRhYmxlJyBub3cgdG8gbWFrZSBzdXJlIGl0IGdldHMgcGlja2VkIHVwLlxuICBlbWl0UmVhZGFibGUoc3RyZWFtKTtcbn1cblxuLy8gRG9uJ3QgZW1pdCByZWFkYWJsZSByaWdodCBhd2F5IGluIHN5bmMgbW9kZSwgYmVjYXVzZSB0aGlzIGNhbiB0cmlnZ2VyXG4vLyBhbm90aGVyIHJlYWQoKSBjYWxsID0+IHN0YWNrIG92ZXJmbG93LiAgVGhpcyB3YXksIGl0IG1pZ2h0IHRyaWdnZXJcbi8vIGEgbmV4dFRpY2sgcmVjdXJzaW9uIHdhcm5pbmcsIGJ1dCB0aGF0J3Mgbm90IHNvIGJhZC5cbmZ1bmN0aW9uIGVtaXRSZWFkYWJsZShzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICBzdGF0ZS5uZWVkUmVhZGFibGUgPSBmYWxzZTtcbiAgaWYgKCFzdGF0ZS5lbWl0dGVkUmVhZGFibGUpIHtcbiAgICBkZWJ1ZygnZW1pdFJlYWRhYmxlJywgc3RhdGUuZmxvd2luZyk7XG4gICAgc3RhdGUuZW1pdHRlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICBpZiAoc3RhdGUuc3luYykgcHJvY2Vzc05leHRUaWNrKGVtaXRSZWFkYWJsZV8sIHN0cmVhbSk7ZWxzZSBlbWl0UmVhZGFibGVfKHN0cmVhbSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdFJlYWRhYmxlXyhzdHJlYW0pIHtcbiAgZGVidWcoJ2VtaXQgcmVhZGFibGUnKTtcbiAgc3RyZWFtLmVtaXQoJ3JlYWRhYmxlJyk7XG4gIGZsb3coc3RyZWFtKTtcbn1cblxuLy8gYXQgdGhpcyBwb2ludCwgdGhlIHVzZXIgaGFzIHByZXN1bWFibHkgc2VlbiB0aGUgJ3JlYWRhYmxlJyBldmVudCxcbi8vIGFuZCBjYWxsZWQgcmVhZCgpIHRvIGNvbnN1bWUgc29tZSBkYXRhLiAgdGhhdCBtYXkgaGF2ZSB0cmlnZ2VyZWRcbi8vIGluIHR1cm4gYW5vdGhlciBfcmVhZChuKSBjYWxsLCBpbiB3aGljaCBjYXNlIHJlYWRpbmcgPSB0cnVlIGlmXG4vLyBpdCdzIGluIHByb2dyZXNzLlxuLy8gSG93ZXZlciwgaWYgd2UncmUgbm90IGVuZGVkLCBvciByZWFkaW5nLCBhbmQgdGhlIGxlbmd0aCA8IGh3bSxcbi8vIHRoZW4gZ28gYWhlYWQgYW5kIHRyeSB0byByZWFkIHNvbWUgbW9yZSBwcmVlbXB0aXZlbHkuXG5mdW5jdGlvbiBtYXliZVJlYWRNb3JlKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKCFzdGF0ZS5yZWFkaW5nTW9yZSkge1xuICAgIHN0YXRlLnJlYWRpbmdNb3JlID0gdHJ1ZTtcbiAgICBwcm9jZXNzTmV4dFRpY2sobWF5YmVSZWFkTW9yZV8sIHN0cmVhbSwgc3RhdGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1heWJlUmVhZE1vcmVfKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIGxlbiA9IHN0YXRlLmxlbmd0aDtcbiAgd2hpbGUgKCFzdGF0ZS5yZWFkaW5nICYmICFzdGF0ZS5mbG93aW5nICYmICFzdGF0ZS5lbmRlZCAmJiBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgZGVidWcoJ21heWJlUmVhZE1vcmUgcmVhZCAwJyk7XG4gICAgc3RyZWFtLnJlYWQoMCk7XG4gICAgaWYgKGxlbiA9PT0gc3RhdGUubGVuZ3RoKVxuICAgICAgLy8gZGlkbid0IGdldCBhbnkgZGF0YSwgc3RvcCBzcGlubmluZy5cbiAgICAgIGJyZWFrO2Vsc2UgbGVuID0gc3RhdGUubGVuZ3RoO1xuICB9XG4gIHN0YXRlLnJlYWRpbmdNb3JlID0gZmFsc2U7XG59XG5cbi8vIGFic3RyYWN0IG1ldGhvZC4gIHRvIGJlIG92ZXJyaWRkZW4gaW4gc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gY2xhc3Nlcy5cbi8vIGNhbGwgY2IoZXIsIGRhdGEpIHdoZXJlIGRhdGEgaXMgPD0gbiBpbiBsZW5ndGguXG4vLyBmb3IgdmlydHVhbCAobm9uLXN0cmluZywgbm9uLWJ1ZmZlcikgc3RyZWFtcywgXCJsZW5ndGhcIiBpcyBzb21ld2hhdFxuLy8gYXJiaXRyYXJ5LCBhbmQgcGVyaGFwcyBub3QgdmVyeSBtZWFuaW5nZnVsLlxuUmVhZGFibGUucHJvdG90eXBlLl9yZWFkID0gZnVuY3Rpb24gKG4pIHtcbiAgdGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJykpO1xufTtcblxuUmVhZGFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoZGVzdCwgcGlwZU9wdHMpIHtcbiAgdmFyIHNyYyA9IHRoaXM7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgc3dpdGNoIChzdGF0ZS5waXBlc0NvdW50KSB7XG4gICAgY2FzZSAwOlxuICAgICAgc3RhdGUucGlwZXMgPSBkZXN0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxOlxuICAgICAgc3RhdGUucGlwZXMgPSBbc3RhdGUucGlwZXMsIGRlc3RdO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXRlLnBpcGVzLnB1c2goZGVzdCk7XG4gICAgICBicmVhaztcbiAgfVxuICBzdGF0ZS5waXBlc0NvdW50ICs9IDE7XG4gIGRlYnVnKCdwaXBlIGNvdW50PSVkIG9wdHM9JWonLCBzdGF0ZS5waXBlc0NvdW50LCBwaXBlT3B0cyk7XG5cbiAgdmFyIGRvRW5kID0gKCFwaXBlT3B0cyB8fCBwaXBlT3B0cy5lbmQgIT09IGZhbHNlKSAmJiBkZXN0ICE9PSBwcm9jZXNzLnN0ZG91dCAmJiBkZXN0ICE9PSBwcm9jZXNzLnN0ZGVycjtcblxuICB2YXIgZW5kRm4gPSBkb0VuZCA/IG9uZW5kIDogY2xlYW51cDtcbiAgaWYgKHN0YXRlLmVuZEVtaXR0ZWQpIHByb2Nlc3NOZXh0VGljayhlbmRGbik7ZWxzZSBzcmMub25jZSgnZW5kJywgZW5kRm4pO1xuXG4gIGRlc3Qub24oJ3VucGlwZScsIG9udW5waXBlKTtcbiAgZnVuY3Rpb24gb251bnBpcGUocmVhZGFibGUpIHtcbiAgICBkZWJ1Zygnb251bnBpcGUnKTtcbiAgICBpZiAocmVhZGFibGUgPT09IHNyYykge1xuICAgICAgY2xlYW51cCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZW5kKCkge1xuICAgIGRlYnVnKCdvbmVuZCcpO1xuICAgIGRlc3QuZW5kKCk7XG4gIH1cblxuICAvLyB3aGVuIHRoZSBkZXN0IGRyYWlucywgaXQgcmVkdWNlcyB0aGUgYXdhaXREcmFpbiBjb3VudGVyXG4gIC8vIG9uIHRoZSBzb3VyY2UuICBUaGlzIHdvdWxkIGJlIG1vcmUgZWxlZ2FudCB3aXRoIGEgLm9uY2UoKVxuICAvLyBoYW5kbGVyIGluIGZsb3coKSwgYnV0IGFkZGluZyBhbmQgcmVtb3ZpbmcgcmVwZWF0ZWRseSBpc1xuICAvLyB0b28gc2xvdy5cbiAgdmFyIG9uZHJhaW4gPSBwaXBlT25EcmFpbihzcmMpO1xuICBkZXN0Lm9uKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gIHZhciBjbGVhbmVkVXAgPSBmYWxzZTtcbiAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICBkZWJ1ZygnY2xlYW51cCcpO1xuICAgIC8vIGNsZWFudXAgZXZlbnQgaGFuZGxlcnMgb25jZSB0aGUgcGlwZSBpcyBicm9rZW5cbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcigndW5waXBlJywgb251bnBpcGUpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgb25lbmQpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgY2xlYW51cCk7XG4gICAgc3JjLnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgb25kYXRhKTtcblxuICAgIGNsZWFuZWRVcCA9IHRydWU7XG5cbiAgICAvLyBpZiB0aGUgcmVhZGVyIGlzIHdhaXRpbmcgZm9yIGEgZHJhaW4gZXZlbnQgZnJvbSB0aGlzXG4gICAgLy8gc3BlY2lmaWMgd3JpdGVyLCB0aGVuIGl0IHdvdWxkIGNhdXNlIGl0IHRvIG5ldmVyIHN0YXJ0XG4gICAgLy8gZmxvd2luZyBhZ2Fpbi5cbiAgICAvLyBTbywgaWYgdGhpcyBpcyBhd2FpdGluZyBhIGRyYWluLCB0aGVuIHdlIGp1c3QgY2FsbCBpdCBub3cuXG4gICAgLy8gSWYgd2UgZG9uJ3Qga25vdywgdGhlbiBhc3N1bWUgdGhhdCB3ZSBhcmUgd2FpdGluZyBmb3Igb25lLlxuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluICYmICghZGVzdC5fd3JpdGFibGVTdGF0ZSB8fCBkZXN0Ll93cml0YWJsZVN0YXRlLm5lZWREcmFpbikpIG9uZHJhaW4oKTtcbiAgfVxuXG4gIC8vIElmIHRoZSB1c2VyIHB1c2hlcyBtb3JlIGRhdGEgd2hpbGUgd2UncmUgd3JpdGluZyB0byBkZXN0IHRoZW4gd2UnbGwgZW5kIHVwXG4gIC8vIGluIG9uZGF0YSBhZ2Fpbi4gSG93ZXZlciwgd2Ugb25seSB3YW50IHRvIGluY3JlYXNlIGF3YWl0RHJhaW4gb25jZSBiZWNhdXNlXG4gIC8vIGRlc3Qgd2lsbCBvbmx5IGVtaXQgb25lICdkcmFpbicgZXZlbnQgZm9yIHRoZSBtdWx0aXBsZSB3cml0ZXMuXG4gIC8vID0+IEludHJvZHVjZSBhIGd1YXJkIG9uIGluY3JlYXNpbmcgYXdhaXREcmFpbi5cbiAgdmFyIGluY3JlYXNlZEF3YWl0RHJhaW4gPSBmYWxzZTtcbiAgc3JjLm9uKCdkYXRhJywgb25kYXRhKTtcbiAgZnVuY3Rpb24gb25kYXRhKGNodW5rKSB7XG4gICAgZGVidWcoJ29uZGF0YScpO1xuICAgIGluY3JlYXNlZEF3YWl0RHJhaW4gPSBmYWxzZTtcbiAgICB2YXIgcmV0ID0gZGVzdC53cml0ZShjaHVuayk7XG4gICAgaWYgKGZhbHNlID09PSByZXQgJiYgIWluY3JlYXNlZEF3YWl0RHJhaW4pIHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIHVucGlwZWQgZHVyaW5nIGBkZXN0LndyaXRlKClgLCBpdCBpcyBwb3NzaWJsZVxuICAgICAgLy8gdG8gZ2V0IHN0dWNrIGluIGEgcGVybWFuZW50bHkgcGF1c2VkIHN0YXRlIGlmIHRoYXQgd3JpdGVcbiAgICAgIC8vIGFsc28gcmV0dXJuZWQgZmFsc2UuXG4gICAgICAvLyA9PiBDaGVjayB3aGV0aGVyIGBkZXN0YCBpcyBzdGlsbCBhIHBpcGluZyBkZXN0aW5hdGlvbi5cbiAgICAgIGlmICgoc3RhdGUucGlwZXNDb3VudCA9PT0gMSAmJiBzdGF0ZS5waXBlcyA9PT0gZGVzdCB8fCBzdGF0ZS5waXBlc0NvdW50ID4gMSAmJiBpbmRleE9mKHN0YXRlLnBpcGVzLCBkZXN0KSAhPT0gLTEpICYmICFjbGVhbmVkVXApIHtcbiAgICAgICAgZGVidWcoJ2ZhbHNlIHdyaXRlIHJlc3BvbnNlLCBwYXVzZScsIHNyYy5fcmVhZGFibGVTdGF0ZS5hd2FpdERyYWluKTtcbiAgICAgICAgc3JjLl9yZWFkYWJsZVN0YXRlLmF3YWl0RHJhaW4rKztcbiAgICAgICAgaW5jcmVhc2VkQXdhaXREcmFpbiA9IHRydWU7XG4gICAgICB9XG4gICAgICBzcmMucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgZGVzdCBoYXMgYW4gZXJyb3IsIHRoZW4gc3RvcCBwaXBpbmcgaW50byBpdC5cbiAgLy8gaG93ZXZlciwgZG9uJ3Qgc3VwcHJlc3MgdGhlIHRocm93aW5nIGJlaGF2aW9yIGZvciB0aGlzLlxuICBmdW5jdGlvbiBvbmVycm9yKGVyKSB7XG4gICAgZGVidWcoJ29uZXJyb3InLCBlcik7XG4gICAgdW5waXBlKCk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcbiAgICBpZiAoRUVsaXN0ZW5lckNvdW50KGRlc3QsICdlcnJvcicpID09PSAwKSBkZXN0LmVtaXQoJ2Vycm9yJywgZXIpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIG91ciBlcnJvciBoYW5kbGVyIGlzIGF0dGFjaGVkIGJlZm9yZSB1c2VybGFuZCBvbmVzLlxuICBwcmVwZW5kTGlzdGVuZXIoZGVzdCwgJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgLy8gQm90aCBjbG9zZSBhbmQgZmluaXNoIHNob3VsZCB0cmlnZ2VyIHVucGlwZSwgYnV0IG9ubHkgb25jZS5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdmaW5pc2gnLCBvbmZpbmlzaCk7XG4gICAgdW5waXBlKCk7XG4gIH1cbiAgZGVzdC5vbmNlKCdjbG9zZScsIG9uY2xvc2UpO1xuICBmdW5jdGlvbiBvbmZpbmlzaCgpIHtcbiAgICBkZWJ1Zygnb25maW5pc2gnKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIHVucGlwZSgpO1xuICB9XG4gIGRlc3Qub25jZSgnZmluaXNoJywgb25maW5pc2gpO1xuXG4gIGZ1bmN0aW9uIHVucGlwZSgpIHtcbiAgICBkZWJ1ZygndW5waXBlJyk7XG4gICAgc3JjLnVucGlwZShkZXN0KTtcbiAgfVxuXG4gIC8vIHRlbGwgdGhlIGRlc3QgdGhhdCBpdCdzIGJlaW5nIHBpcGVkIHRvXG4gIGRlc3QuZW1pdCgncGlwZScsIHNyYyk7XG5cbiAgLy8gc3RhcnQgdGhlIGZsb3cgaWYgaXQgaGFzbid0IGJlZW4gc3RhcnRlZCBhbHJlYWR5LlxuICBpZiAoIXN0YXRlLmZsb3dpbmcpIHtcbiAgICBkZWJ1ZygncGlwZSByZXN1bWUnKTtcbiAgICBzcmMucmVzdW1lKCk7XG4gIH1cblxuICByZXR1cm4gZGVzdDtcbn07XG5cbmZ1bmN0aW9uIHBpcGVPbkRyYWluKHNyYykge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGF0ZSA9IHNyYy5fcmVhZGFibGVTdGF0ZTtcbiAgICBkZWJ1ZygncGlwZU9uRHJhaW4nLCBzdGF0ZS5hd2FpdERyYWluKTtcbiAgICBpZiAoc3RhdGUuYXdhaXREcmFpbikgc3RhdGUuYXdhaXREcmFpbi0tO1xuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluID09PSAwICYmIEVFbGlzdGVuZXJDb3VudChzcmMsICdkYXRhJykpIHtcbiAgICAgIHN0YXRlLmZsb3dpbmcgPSB0cnVlO1xuICAgICAgZmxvdyhzcmMpO1xuICAgIH1cbiAgfTtcbn1cblxuUmVhZGFibGUucHJvdG90eXBlLnVucGlwZSA9IGZ1bmN0aW9uIChkZXN0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gaWYgd2UncmUgbm90IHBpcGluZyBhbnl3aGVyZSwgdGhlbiBkbyBub3RoaW5nLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMCkgcmV0dXJuIHRoaXM7XG5cbiAgLy8ganVzdCBvbmUgZGVzdGluYXRpb24uICBtb3N0IGNvbW1vbiBjYXNlLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMSkge1xuICAgIC8vIHBhc3NlZCBpbiBvbmUsIGJ1dCBpdCdzIG5vdCB0aGUgcmlnaHQgb25lLlxuICAgIGlmIChkZXN0ICYmIGRlc3QgIT09IHN0YXRlLnBpcGVzKSByZXR1cm4gdGhpcztcblxuICAgIGlmICghZGVzdCkgZGVzdCA9IHN0YXRlLnBpcGVzO1xuXG4gICAgLy8gZ290IGEgbWF0Y2guXG4gICAgc3RhdGUucGlwZXMgPSBudWxsO1xuICAgIHN0YXRlLnBpcGVzQ291bnQgPSAwO1xuICAgIHN0YXRlLmZsb3dpbmcgPSBmYWxzZTtcbiAgICBpZiAoZGVzdCkgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNsb3cgY2FzZS4gbXVsdGlwbGUgcGlwZSBkZXN0aW5hdGlvbnMuXG5cbiAgaWYgKCFkZXN0KSB7XG4gICAgLy8gcmVtb3ZlIGFsbC5cbiAgICB2YXIgZGVzdHMgPSBzdGF0ZS5waXBlcztcbiAgICB2YXIgbGVuID0gc3RhdGUucGlwZXNDb3VudDtcbiAgICBzdGF0ZS5waXBlcyA9IG51bGw7XG4gICAgc3RhdGUucGlwZXNDb3VudCA9IDA7XG4gICAgc3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxlbjsgX2krKykge1xuICAgICAgZGVzdHNbX2ldLmVtaXQoJ3VucGlwZScsIHRoaXMpO1xuICAgIH1yZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHRyeSB0byBmaW5kIHRoZSByaWdodCBvbmUuXG4gIHZhciBpID0gaW5kZXhPZihzdGF0ZS5waXBlcywgZGVzdCk7XG4gIGlmIChpID09PSAtMSkgcmV0dXJuIHRoaXM7XG5cbiAgc3RhdGUucGlwZXMuc3BsaWNlKGksIDEpO1xuICBzdGF0ZS5waXBlc0NvdW50IC09IDE7XG4gIGlmIChzdGF0ZS5waXBlc0NvdW50ID09PSAxKSBzdGF0ZS5waXBlcyA9IHN0YXRlLnBpcGVzWzBdO1xuXG4gIGRlc3QuZW1pdCgndW5waXBlJywgdGhpcyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBzZXQgdXAgZGF0YSBldmVudHMgaWYgdGhleSBhcmUgYXNrZWQgZm9yXG4vLyBFbnN1cmUgcmVhZGFibGUgbGlzdGVuZXJzIGV2ZW50dWFsbHkgZ2V0IHNvbWV0aGluZ1xuUmVhZGFibGUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2LCBmbikge1xuICB2YXIgcmVzID0gU3RyZWFtLnByb3RvdHlwZS5vbi5jYWxsKHRoaXMsIGV2LCBmbik7XG5cbiAgaWYgKGV2ID09PSAnZGF0YScpIHtcbiAgICAvLyBTdGFydCBmbG93aW5nIG9uIG5leHQgdGljayBpZiBzdHJlYW0gaXNuJ3QgZXhwbGljaXRseSBwYXVzZWRcbiAgICBpZiAodGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nICE9PSBmYWxzZSkgdGhpcy5yZXN1bWUoKTtcbiAgfSBlbHNlIGlmIChldiA9PT0gJ3JlYWRhYmxlJykge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gICAgaWYgKCFzdGF0ZS5lbmRFbWl0dGVkICYmICFzdGF0ZS5yZWFkYWJsZUxpc3RlbmluZykge1xuICAgICAgc3RhdGUucmVhZGFibGVMaXN0ZW5pbmcgPSBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgICAgc3RhdGUuZW1pdHRlZFJlYWRhYmxlID0gZmFsc2U7XG4gICAgICBpZiAoIXN0YXRlLnJlYWRpbmcpIHtcbiAgICAgICAgcHJvY2Vzc05leHRUaWNrKG5SZWFkaW5nTmV4dFRpY2ssIHRoaXMpO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5sZW5ndGgpIHtcbiAgICAgICAgZW1pdFJlYWRhYmxlKHRoaXMsIHN0YXRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzO1xufTtcblJlYWRhYmxlLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IFJlYWRhYmxlLnByb3RvdHlwZS5vbjtcblxuZnVuY3Rpb24gblJlYWRpbmdOZXh0VGljayhzZWxmKSB7XG4gIGRlYnVnKCdyZWFkYWJsZSBuZXh0dGljayByZWFkIDAnKTtcbiAgc2VsZi5yZWFkKDApO1xufVxuXG4vLyBwYXVzZSgpIGFuZCByZXN1bWUoKSBhcmUgcmVtbmFudHMgb2YgdGhlIGxlZ2FjeSByZWFkYWJsZSBzdHJlYW0gQVBJXG4vLyBJZiB0aGUgdXNlciB1c2VzIHRoZW0sIHRoZW4gc3dpdGNoIGludG8gb2xkIG1vZGUuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICBpZiAoIXN0YXRlLmZsb3dpbmcpIHtcbiAgICBkZWJ1ZygncmVzdW1lJyk7XG4gICAgc3RhdGUuZmxvd2luZyA9IHRydWU7XG4gICAgcmVzdW1lKHRoaXMsIHN0YXRlKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIHJlc3VtZShzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucmVzdW1lU2NoZWR1bGVkKSB7XG4gICAgc3RhdGUucmVzdW1lU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICBwcm9jZXNzTmV4dFRpY2socmVzdW1lXywgc3RyZWFtLCBzdGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzdW1lXyhzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucmVhZGluZykge1xuICAgIGRlYnVnKCdyZXN1bWUgcmVhZCAwJyk7XG4gICAgc3RyZWFtLnJlYWQoMCk7XG4gIH1cblxuICBzdGF0ZS5yZXN1bWVTY2hlZHVsZWQgPSBmYWxzZTtcbiAgc3RhdGUuYXdhaXREcmFpbiA9IDA7XG4gIHN0cmVhbS5lbWl0KCdyZXN1bWUnKTtcbiAgZmxvdyhzdHJlYW0pO1xuICBpZiAoc3RhdGUuZmxvd2luZyAmJiAhc3RhdGUucmVhZGluZykgc3RyZWFtLnJlYWQoMCk7XG59XG5cblJlYWRhYmxlLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uICgpIHtcbiAgZGVidWcoJ2NhbGwgcGF1c2UgZmxvd2luZz0laicsIHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZyk7XG4gIGlmIChmYWxzZSAhPT0gdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nKSB7XG4gICAgZGVidWcoJ3BhdXNlJyk7XG4gICAgdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nID0gZmFsc2U7XG4gICAgdGhpcy5lbWl0KCdwYXVzZScpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gZmxvdyhzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuICBkZWJ1ZygnZmxvdycsIHN0YXRlLmZsb3dpbmcpO1xuICB3aGlsZSAoc3RhdGUuZmxvd2luZyAmJiBzdHJlYW0ucmVhZCgpICE9PSBudWxsKSB7fVxufVxuXG4vLyB3cmFwIGFuIG9sZC1zdHlsZSBzdHJlYW0gYXMgdGhlIGFzeW5jIGRhdGEgc291cmNlLlxuLy8gVGhpcyBpcyAqbm90KiBwYXJ0IG9mIHRoZSByZWFkYWJsZSBzdHJlYW0gaW50ZXJmYWNlLlxuLy8gSXQgaXMgYW4gdWdseSB1bmZvcnR1bmF0ZSBtZXNzIG9mIGhpc3RvcnkuXG5SZWFkYWJsZS5wcm90b3R5cGUud3JhcCA9IGZ1bmN0aW9uIChzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgdmFyIHBhdXNlZCA9IGZhbHNlO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgZGVidWcoJ3dyYXBwZWQgZW5kJyk7XG4gICAgaWYgKHN0YXRlLmRlY29kZXIgJiYgIXN0YXRlLmVuZGVkKSB7XG4gICAgICB2YXIgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLmVuZCgpO1xuICAgICAgaWYgKGNodW5rICYmIGNodW5rLmxlbmd0aCkgc2VsZi5wdXNoKGNodW5rKTtcbiAgICB9XG5cbiAgICBzZWxmLnB1c2gobnVsbCk7XG4gIH0pO1xuXG4gIHN0cmVhbS5vbignZGF0YScsIGZ1bmN0aW9uIChjaHVuaykge1xuICAgIGRlYnVnKCd3cmFwcGVkIGRhdGEnKTtcbiAgICBpZiAoc3RhdGUuZGVjb2RlcikgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLndyaXRlKGNodW5rKTtcblxuICAgIC8vIGRvbid0IHNraXAgb3ZlciBmYWxzeSB2YWx1ZXMgaW4gb2JqZWN0TW9kZVxuICAgIGlmIChzdGF0ZS5vYmplY3RNb2RlICYmIChjaHVuayA9PT0gbnVsbCB8fCBjaHVuayA9PT0gdW5kZWZpbmVkKSkgcmV0dXJuO2Vsc2UgaWYgKCFzdGF0ZS5vYmplY3RNb2RlICYmICghY2h1bmsgfHwgIWNodW5rLmxlbmd0aCkpIHJldHVybjtcblxuICAgIHZhciByZXQgPSBzZWxmLnB1c2goY2h1bmspO1xuICAgIGlmICghcmV0KSB7XG4gICAgICBwYXVzZWQgPSB0cnVlO1xuICAgICAgc3RyZWFtLnBhdXNlKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBwcm94eSBhbGwgdGhlIG90aGVyIG1ldGhvZHMuXG4gIC8vIGltcG9ydGFudCB3aGVuIHdyYXBwaW5nIGZpbHRlcnMgYW5kIGR1cGxleGVzLlxuICBmb3IgKHZhciBpIGluIHN0cmVhbSkge1xuICAgIGlmICh0aGlzW2ldID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIHN0cmVhbVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpc1tpXSA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gc3RyZWFtW21ldGhvZF0uYXBwbHkoc3RyZWFtLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfShpKTtcbiAgICB9XG4gIH1cblxuICAvLyBwcm94eSBjZXJ0YWluIGltcG9ydGFudCBldmVudHMuXG4gIHZhciBldmVudHMgPSBbJ2Vycm9yJywgJ2Nsb3NlJywgJ2Rlc3Ryb3knLCAncGF1c2UnLCAncmVzdW1lJ107XG4gIGZvckVhY2goZXZlbnRzLCBmdW5jdGlvbiAoZXYpIHtcbiAgICBzdHJlYW0ub24oZXYsIHNlbGYuZW1pdC5iaW5kKHNlbGYsIGV2KSk7XG4gIH0pO1xuXG4gIC8vIHdoZW4gd2UgdHJ5IHRvIGNvbnN1bWUgc29tZSBtb3JlIGJ5dGVzLCBzaW1wbHkgdW5wYXVzZSB0aGVcbiAgLy8gdW5kZXJseWluZyBzdHJlYW0uXG4gIHNlbGYuX3JlYWQgPSBmdW5jdGlvbiAobikge1xuICAgIGRlYnVnKCd3cmFwcGVkIF9yZWFkJywgbik7XG4gICAgaWYgKHBhdXNlZCkge1xuICAgICAgcGF1c2VkID0gZmFsc2U7XG4gICAgICBzdHJlYW0ucmVzdW1lKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBzZWxmO1xufTtcblxuLy8gZXhwb3NlZCBmb3IgdGVzdGluZyBwdXJwb3NlcyBvbmx5LlxuUmVhZGFibGUuX2Zyb21MaXN0ID0gZnJvbUxpc3Q7XG5cbi8vIFBsdWNrIG9mZiBuIGJ5dGVzIGZyb20gYW4gYXJyYXkgb2YgYnVmZmVycy5cbi8vIExlbmd0aCBpcyB0aGUgY29tYmluZWQgbGVuZ3RocyBvZiBhbGwgdGhlIGJ1ZmZlcnMgaW4gdGhlIGxpc3QuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGJlIGlubGluYWJsZSwgc28gcGxlYXNlIHRha2UgY2FyZSB3aGVuIG1ha2luZ1xuLy8gY2hhbmdlcyB0byB0aGUgZnVuY3Rpb24gYm9keS5cbmZ1bmN0aW9uIGZyb21MaXN0KG4sIHN0YXRlKSB7XG4gIC8vIG5vdGhpbmcgYnVmZmVyZWRcbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgdmFyIHJldDtcbiAgaWYgKHN0YXRlLm9iamVjdE1vZGUpIHJldCA9IHN0YXRlLmJ1ZmZlci5zaGlmdCgpO2Vsc2UgaWYgKCFuIHx8IG4gPj0gc3RhdGUubGVuZ3RoKSB7XG4gICAgLy8gcmVhZCBpdCBhbGwsIHRydW5jYXRlIHRoZSBsaXN0XG4gICAgaWYgKHN0YXRlLmRlY29kZXIpIHJldCA9IHN0YXRlLmJ1ZmZlci5qb2luKCcnKTtlbHNlIGlmIChzdGF0ZS5idWZmZXIubGVuZ3RoID09PSAxKSByZXQgPSBzdGF0ZS5idWZmZXIuaGVhZC5kYXRhO2Vsc2UgcmV0ID0gc3RhdGUuYnVmZmVyLmNvbmNhdChzdGF0ZS5sZW5ndGgpO1xuICAgIHN0YXRlLmJ1ZmZlci5jbGVhcigpO1xuICB9IGVsc2Uge1xuICAgIC8vIHJlYWQgcGFydCBvZiBsaXN0XG4gICAgcmV0ID0gZnJvbUxpc3RQYXJ0aWFsKG4sIHN0YXRlLmJ1ZmZlciwgc3RhdGUuZGVjb2Rlcik7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vLyBFeHRyYWN0cyBvbmx5IGVub3VnaCBidWZmZXJlZCBkYXRhIHRvIHNhdGlzZnkgdGhlIGFtb3VudCByZXF1ZXN0ZWQuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGJlIGlubGluYWJsZSwgc28gcGxlYXNlIHRha2UgY2FyZSB3aGVuIG1ha2luZ1xuLy8gY2hhbmdlcyB0byB0aGUgZnVuY3Rpb24gYm9keS5cbmZ1bmN0aW9uIGZyb21MaXN0UGFydGlhbChuLCBsaXN0LCBoYXNTdHJpbmdzKSB7XG4gIHZhciByZXQ7XG4gIGlmIChuIDwgbGlzdC5oZWFkLmRhdGEubGVuZ3RoKSB7XG4gICAgLy8gc2xpY2UgaXMgdGhlIHNhbWUgZm9yIGJ1ZmZlcnMgYW5kIHN0cmluZ3NcbiAgICByZXQgPSBsaXN0LmhlYWQuZGF0YS5zbGljZSgwLCBuKTtcbiAgICBsaXN0LmhlYWQuZGF0YSA9IGxpc3QuaGVhZC5kYXRhLnNsaWNlKG4pO1xuICB9IGVsc2UgaWYgKG4gPT09IGxpc3QuaGVhZC5kYXRhLmxlbmd0aCkge1xuICAgIC8vIGZpcnN0IGNodW5rIGlzIGEgcGVyZmVjdCBtYXRjaFxuICAgIHJldCA9IGxpc3Quc2hpZnQoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyByZXN1bHQgc3BhbnMgbW9yZSB0aGFuIG9uZSBidWZmZXJcbiAgICByZXQgPSBoYXNTdHJpbmdzID8gY29weUZyb21CdWZmZXJTdHJpbmcobiwgbGlzdCkgOiBjb3B5RnJvbUJ1ZmZlcihuLCBsaXN0KTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vLyBDb3BpZXMgYSBzcGVjaWZpZWQgYW1vdW50IG9mIGNoYXJhY3RlcnMgZnJvbSB0aGUgbGlzdCBvZiBidWZmZXJlZCBkYXRhXG4vLyBjaHVua3MuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGJlIGlubGluYWJsZSwgc28gcGxlYXNlIHRha2UgY2FyZSB3aGVuIG1ha2luZ1xuLy8gY2hhbmdlcyB0byB0aGUgZnVuY3Rpb24gYm9keS5cbmZ1bmN0aW9uIGNvcHlGcm9tQnVmZmVyU3RyaW5nKG4sIGxpc3QpIHtcbiAgdmFyIHAgPSBsaXN0LmhlYWQ7XG4gIHZhciBjID0gMTtcbiAgdmFyIHJldCA9IHAuZGF0YTtcbiAgbiAtPSByZXQubGVuZ3RoO1xuICB3aGlsZSAocCA9IHAubmV4dCkge1xuICAgIHZhciBzdHIgPSBwLmRhdGE7XG4gICAgdmFyIG5iID0gbiA+IHN0ci5sZW5ndGggPyBzdHIubGVuZ3RoIDogbjtcbiAgICBpZiAobmIgPT09IHN0ci5sZW5ndGgpIHJldCArPSBzdHI7ZWxzZSByZXQgKz0gc3RyLnNsaWNlKDAsIG4pO1xuICAgIG4gLT0gbmI7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIGlmIChuYiA9PT0gc3RyLmxlbmd0aCkge1xuICAgICAgICArK2M7XG4gICAgICAgIGlmIChwLm5leHQpIGxpc3QuaGVhZCA9IHAubmV4dDtlbHNlIGxpc3QuaGVhZCA9IGxpc3QudGFpbCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0LmhlYWQgPSBwO1xuICAgICAgICBwLmRhdGEgPSBzdHIuc2xpY2UobmIpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgICsrYztcbiAgfVxuICBsaXN0Lmxlbmd0aCAtPSBjO1xuICByZXR1cm4gcmV0O1xufVxuXG4vLyBDb3BpZXMgYSBzcGVjaWZpZWQgYW1vdW50IG9mIGJ5dGVzIGZyb20gdGhlIGxpc3Qgb2YgYnVmZmVyZWQgZGF0YSBjaHVua3MuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGJlIGlubGluYWJsZSwgc28gcGxlYXNlIHRha2UgY2FyZSB3aGVuIG1ha2luZ1xuLy8gY2hhbmdlcyB0byB0aGUgZnVuY3Rpb24gYm9keS5cbmZ1bmN0aW9uIGNvcHlGcm9tQnVmZmVyKG4sIGxpc3QpIHtcbiAgdmFyIHJldCA9IGJ1ZmZlclNoaW0uYWxsb2NVbnNhZmUobik7XG4gIHZhciBwID0gbGlzdC5oZWFkO1xuICB2YXIgYyA9IDE7XG4gIHAuZGF0YS5jb3B5KHJldCk7XG4gIG4gLT0gcC5kYXRhLmxlbmd0aDtcbiAgd2hpbGUgKHAgPSBwLm5leHQpIHtcbiAgICB2YXIgYnVmID0gcC5kYXRhO1xuICAgIHZhciBuYiA9IG4gPiBidWYubGVuZ3RoID8gYnVmLmxlbmd0aCA6IG47XG4gICAgYnVmLmNvcHkocmV0LCByZXQubGVuZ3RoIC0gbiwgMCwgbmIpO1xuICAgIG4gLT0gbmI7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIGlmIChuYiA9PT0gYnVmLmxlbmd0aCkge1xuICAgICAgICArK2M7XG4gICAgICAgIGlmIChwLm5leHQpIGxpc3QuaGVhZCA9IHAubmV4dDtlbHNlIGxpc3QuaGVhZCA9IGxpc3QudGFpbCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0LmhlYWQgPSBwO1xuICAgICAgICBwLmRhdGEgPSBidWYuc2xpY2UobmIpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgICsrYztcbiAgfVxuICBsaXN0Lmxlbmd0aCAtPSBjO1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBlbmRSZWFkYWJsZShzdHJlYW0pIHtcbiAgdmFyIHN0YXRlID0gc3RyZWFtLl9yZWFkYWJsZVN0YXRlO1xuXG4gIC8vIElmIHdlIGdldCBoZXJlIGJlZm9yZSBjb25zdW1pbmcgYWxsIHRoZSBieXRlcywgdGhlbiB0aGF0IGlzIGFcbiAgLy8gYnVnIGluIG5vZGUuICBTaG91bGQgbmV2ZXIgaGFwcGVuLlxuICBpZiAoc3RhdGUubGVuZ3RoID4gMCkgdGhyb3cgbmV3IEVycm9yKCdcImVuZFJlYWRhYmxlKClcIiBjYWxsZWQgb24gbm9uLWVtcHR5IHN0cmVhbScpO1xuXG4gIGlmICghc3RhdGUuZW5kRW1pdHRlZCkge1xuICAgIHN0YXRlLmVuZGVkID0gdHJ1ZTtcbiAgICBwcm9jZXNzTmV4dFRpY2soZW5kUmVhZGFibGVOVCwgc3RhdGUsIHN0cmVhbSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5kUmVhZGFibGVOVChzdGF0ZSwgc3RyZWFtKSB7XG4gIC8vIENoZWNrIHRoYXQgd2UgZGlkbid0IGdldCBvbmUgbGFzdCB1bnNoaWZ0LlxuICBpZiAoIXN0YXRlLmVuZEVtaXR0ZWQgJiYgc3RhdGUubGVuZ3RoID09PSAwKSB7XG4gICAgc3RhdGUuZW5kRW1pdHRlZCA9IHRydWU7XG4gICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2U7XG4gICAgc3RyZWFtLmVtaXQoJ2VuZCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZvckVhY2goeHMsIGYpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmKHhzW2ldLCBpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleE9mKHhzLCB4KSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKHhzW2ldID09PSB4KSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59IiwiLy8gYSB0cmFuc2Zvcm0gc3RyZWFtIGlzIGEgcmVhZGFibGUvd3JpdGFibGUgc3RyZWFtIHdoZXJlIHlvdSBkb1xuLy8gc29tZXRoaW5nIHdpdGggdGhlIGRhdGEuICBTb21ldGltZXMgaXQncyBjYWxsZWQgYSBcImZpbHRlclwiLFxuLy8gYnV0IHRoYXQncyBub3QgYSBncmVhdCBuYW1lIGZvciBpdCwgc2luY2UgdGhhdCBpbXBsaWVzIGEgdGhpbmcgd2hlcmVcbi8vIHNvbWUgYml0cyBwYXNzIHRocm91Z2gsIGFuZCBvdGhlcnMgYXJlIHNpbXBseSBpZ25vcmVkLiAgKFRoYXQgd291bGRcbi8vIGJlIGEgdmFsaWQgZXhhbXBsZSBvZiBhIHRyYW5zZm9ybSwgb2YgY291cnNlLilcbi8vXG4vLyBXaGlsZSB0aGUgb3V0cHV0IGlzIGNhdXNhbGx5IHJlbGF0ZWQgdG8gdGhlIGlucHV0LCBpdCdzIG5vdCBhXG4vLyBuZWNlc3NhcmlseSBzeW1tZXRyaWMgb3Igc3luY2hyb25vdXMgdHJhbnNmb3JtYXRpb24uICBGb3IgZXhhbXBsZSxcbi8vIGEgemxpYiBzdHJlYW0gbWlnaHQgdGFrZSBtdWx0aXBsZSBwbGFpbi10ZXh0IHdyaXRlcygpLCBhbmQgdGhlblxuLy8gZW1pdCBhIHNpbmdsZSBjb21wcmVzc2VkIGNodW5rIHNvbWUgdGltZSBpbiB0aGUgZnV0dXJlLlxuLy9cbi8vIEhlcmUncyBob3cgdGhpcyB3b3Jrczpcbi8vXG4vLyBUaGUgVHJhbnNmb3JtIHN0cmVhbSBoYXMgYWxsIHRoZSBhc3BlY3RzIG9mIHRoZSByZWFkYWJsZSBhbmQgd3JpdGFibGVcbi8vIHN0cmVhbSBjbGFzc2VzLiAgV2hlbiB5b3Ugd3JpdGUoY2h1bmspLCB0aGF0IGNhbGxzIF93cml0ZShjaHVuayxjYilcbi8vIGludGVybmFsbHksIGFuZCByZXR1cm5zIGZhbHNlIGlmIHRoZXJlJ3MgYSBsb3Qgb2YgcGVuZGluZyB3cml0ZXNcbi8vIGJ1ZmZlcmVkIHVwLiAgV2hlbiB5b3UgY2FsbCByZWFkKCksIHRoYXQgY2FsbHMgX3JlYWQobikgdW50aWxcbi8vIHRoZXJlJ3MgZW5vdWdoIHBlbmRpbmcgcmVhZGFibGUgZGF0YSBidWZmZXJlZCB1cC5cbi8vXG4vLyBJbiBhIHRyYW5zZm9ybSBzdHJlYW0sIHRoZSB3cml0dGVuIGRhdGEgaXMgcGxhY2VkIGluIGEgYnVmZmVyLiAgV2hlblxuLy8gX3JlYWQobikgaXMgY2FsbGVkLCBpdCB0cmFuc2Zvcm1zIHRoZSBxdWV1ZWQgdXAgZGF0YSwgY2FsbGluZyB0aGVcbi8vIGJ1ZmZlcmVkIF93cml0ZSBjYidzIGFzIGl0IGNvbnN1bWVzIGNodW5rcy4gIElmIGNvbnN1bWluZyBhIHNpbmdsZVxuLy8gd3JpdHRlbiBjaHVuayB3b3VsZCByZXN1bHQgaW4gbXVsdGlwbGUgb3V0cHV0IGNodW5rcywgdGhlbiB0aGUgZmlyc3Rcbi8vIG91dHB1dHRlZCBiaXQgY2FsbHMgdGhlIHJlYWRjYiwgYW5kIHN1YnNlcXVlbnQgY2h1bmtzIGp1c3QgZ28gaW50b1xuLy8gdGhlIHJlYWQgYnVmZmVyLCBhbmQgd2lsbCBjYXVzZSBpdCB0byBlbWl0ICdyZWFkYWJsZScgaWYgbmVjZXNzYXJ5LlxuLy9cbi8vIFRoaXMgd2F5LCBiYWNrLXByZXNzdXJlIGlzIGFjdHVhbGx5IGRldGVybWluZWQgYnkgdGhlIHJlYWRpbmcgc2lkZSxcbi8vIHNpbmNlIF9yZWFkIGhhcyB0byBiZSBjYWxsZWQgdG8gc3RhcnQgcHJvY2Vzc2luZyBhIG5ldyBjaHVuay4gIEhvd2V2ZXIsXG4vLyBhIHBhdGhvbG9naWNhbCBpbmZsYXRlIHR5cGUgb2YgdHJhbnNmb3JtIGNhbiBjYXVzZSBleGNlc3NpdmUgYnVmZmVyaW5nXG4vLyBoZXJlLiAgRm9yIGV4YW1wbGUsIGltYWdpbmUgYSBzdHJlYW0gd2hlcmUgZXZlcnkgYnl0ZSBvZiBpbnB1dCBpc1xuLy8gaW50ZXJwcmV0ZWQgYXMgYW4gaW50ZWdlciBmcm9tIDAtMjU1LCBhbmQgdGhlbiByZXN1bHRzIGluIHRoYXQgbWFueVxuLy8gYnl0ZXMgb2Ygb3V0cHV0LiAgV3JpdGluZyB0aGUgNCBieXRlcyB7ZmYsZmYsZmYsZmZ9IHdvdWxkIHJlc3VsdCBpblxuLy8gMWtiIG9mIGRhdGEgYmVpbmcgb3V0cHV0LiAgSW4gdGhpcyBjYXNlLCB5b3UgY291bGQgd3JpdGUgYSB2ZXJ5IHNtYWxsXG4vLyBhbW91bnQgb2YgaW5wdXQsIGFuZCBlbmQgdXAgd2l0aCBhIHZlcnkgbGFyZ2UgYW1vdW50IG9mIG91dHB1dC4gIEluXG4vLyBzdWNoIGEgcGF0aG9sb2dpY2FsIGluZmxhdGluZyBtZWNoYW5pc20sIHRoZXJlJ2QgYmUgbm8gd2F5IHRvIHRlbGxcbi8vIHRoZSBzeXN0ZW0gdG8gc3RvcCBkb2luZyB0aGUgdHJhbnNmb3JtLiAgQSBzaW5nbGUgNE1CIHdyaXRlIGNvdWxkXG4vLyBjYXVzZSB0aGUgc3lzdGVtIHRvIHJ1biBvdXQgb2YgbWVtb3J5LlxuLy9cbi8vIEhvd2V2ZXIsIGV2ZW4gaW4gc3VjaCBhIHBhdGhvbG9naWNhbCBjYXNlLCBvbmx5IGEgc2luZ2xlIHdyaXR0ZW4gY2h1bmtcbi8vIHdvdWxkIGJlIGNvbnN1bWVkLCBhbmQgdGhlbiB0aGUgcmVzdCB3b3VsZCB3YWl0ICh1bi10cmFuc2Zvcm1lZCkgdW50aWxcbi8vIHRoZSByZXN1bHRzIG9mIHRoZSBwcmV2aW91cyB0cmFuc2Zvcm1lZCBjaHVuayB3ZXJlIGNvbnN1bWVkLlxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtO1xuXG52YXIgRHVwbGV4ID0gcmVxdWlyZSgnLi9fc3RyZWFtX2R1cGxleCcpO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnV0aWwuaW5oZXJpdHMoVHJhbnNmb3JtLCBEdXBsZXgpO1xuXG5mdW5jdGlvbiBUcmFuc2Zvcm1TdGF0ZShzdHJlYW0pIHtcbiAgdGhpcy5hZnRlclRyYW5zZm9ybSA9IGZ1bmN0aW9uIChlciwgZGF0YSkge1xuICAgIHJldHVybiBhZnRlclRyYW5zZm9ybShzdHJlYW0sIGVyLCBkYXRhKTtcbiAgfTtcblxuICB0aGlzLm5lZWRUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgdGhpcy50cmFuc2Zvcm1pbmcgPSBmYWxzZTtcbiAgdGhpcy53cml0ZWNiID0gbnVsbDtcbiAgdGhpcy53cml0ZWNodW5rID0gbnVsbDtcbiAgdGhpcy53cml0ZWVuY29kaW5nID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYWZ0ZXJUcmFuc2Zvcm0oc3RyZWFtLCBlciwgZGF0YSkge1xuICB2YXIgdHMgPSBzdHJlYW0uX3RyYW5zZm9ybVN0YXRlO1xuICB0cy50cmFuc2Zvcm1pbmcgPSBmYWxzZTtcblxuICB2YXIgY2IgPSB0cy53cml0ZWNiO1xuXG4gIGlmICghY2IpIHJldHVybiBzdHJlYW0uZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ25vIHdyaXRlY2IgaW4gVHJhbnNmb3JtIGNsYXNzJykpO1xuXG4gIHRzLndyaXRlY2h1bmsgPSBudWxsO1xuICB0cy53cml0ZWNiID0gbnVsbDtcblxuICBpZiAoZGF0YSAhPT0gbnVsbCAmJiBkYXRhICE9PSB1bmRlZmluZWQpIHN0cmVhbS5wdXNoKGRhdGEpO1xuXG4gIGNiKGVyKTtcblxuICB2YXIgcnMgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG4gIHJzLnJlYWRpbmcgPSBmYWxzZTtcbiAgaWYgKHJzLm5lZWRSZWFkYWJsZSB8fCBycy5sZW5ndGggPCBycy5oaWdoV2F0ZXJNYXJrKSB7XG4gICAgc3RyZWFtLl9yZWFkKHJzLmhpZ2hXYXRlck1hcmspO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybShvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBUcmFuc2Zvcm0pKSByZXR1cm4gbmV3IFRyYW5zZm9ybShvcHRpb25zKTtcblxuICBEdXBsZXguY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICB0aGlzLl90cmFuc2Zvcm1TdGF0ZSA9IG5ldyBUcmFuc2Zvcm1TdGF0ZSh0aGlzKTtcblxuICAvLyB3aGVuIHRoZSB3cml0YWJsZSBzaWRlIGZpbmlzaGVzLCB0aGVuIGZsdXNoIG91dCBhbnl0aGluZyByZW1haW5pbmcuXG4gIHZhciBzdHJlYW0gPSB0aGlzO1xuXG4gIC8vIHN0YXJ0IG91dCBhc2tpbmcgZm9yIGEgcmVhZGFibGUgZXZlbnQgb25jZSBkYXRhIGlzIHRyYW5zZm9ybWVkLlxuICB0aGlzLl9yZWFkYWJsZVN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG5cbiAgLy8gd2UgaGF2ZSBpbXBsZW1lbnRlZCB0aGUgX3JlYWQgbWV0aG9kLCBhbmQgZG9uZSB0aGUgb3RoZXIgdGhpbmdzXG4gIC8vIHRoYXQgUmVhZGFibGUgd2FudHMgYmVmb3JlIHRoZSBmaXJzdCBfcmVhZCBjYWxsLCBzbyB1bnNldCB0aGVcbiAgLy8gc3luYyBndWFyZCBmbGFnLlxuICB0aGlzLl9yZWFkYWJsZVN0YXRlLnN5bmMgPSBmYWxzZTtcblxuICBpZiAob3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50cmFuc2Zvcm0gPT09ICdmdW5jdGlvbicpIHRoaXMuX3RyYW5zZm9ybSA9IG9wdGlvbnMudHJhbnNmb3JtO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmZsdXNoID09PSAnZnVuY3Rpb24nKSB0aGlzLl9mbHVzaCA9IG9wdGlvbnMuZmx1c2g7XG4gIH1cblxuICB0aGlzLm9uY2UoJ3ByZWZpbmlzaCcsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX2ZsdXNoID09PSAnZnVuY3Rpb24nKSB0aGlzLl9mbHVzaChmdW5jdGlvbiAoZXIpIHtcbiAgICAgIGRvbmUoc3RyZWFtLCBlcik7XG4gICAgfSk7ZWxzZSBkb25lKHN0cmVhbSk7XG4gIH0pO1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nKSB7XG4gIHRoaXMuX3RyYW5zZm9ybVN0YXRlLm5lZWRUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgcmV0dXJuIER1cGxleC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsIGNodW5rLCBlbmNvZGluZyk7XG59O1xuXG4vLyBUaGlzIGlzIHRoZSBwYXJ0IHdoZXJlIHlvdSBkbyBzdHVmZiFcbi8vIG92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gaW4gaW1wbGVtZW50YXRpb24gY2xhc3Nlcy5cbi8vICdjaHVuaycgaXMgYW4gaW5wdXQgY2h1bmsuXG4vL1xuLy8gQ2FsbCBgcHVzaChuZXdDaHVuaylgIHRvIHBhc3MgYWxvbmcgdHJhbnNmb3JtZWQgb3V0cHV0XG4vLyB0byB0aGUgcmVhZGFibGUgc2lkZS4gIFlvdSBtYXkgY2FsbCAncHVzaCcgemVybyBvciBtb3JlIHRpbWVzLlxuLy9cbi8vIENhbGwgYGNiKGVycilgIHdoZW4geW91IGFyZSBkb25lIHdpdGggdGhpcyBjaHVuay4gIElmIHlvdSBwYXNzXG4vLyBhbiBlcnJvciwgdGhlbiB0aGF0J2xsIHB1dCB0aGUgaHVydCBvbiB0aGUgd2hvbGUgb3BlcmF0aW9uLiAgSWYgeW91XG4vLyBuZXZlciBjYWxsIGNiKCksIHRoZW4geW91J2xsIG5ldmVyIGdldCBhbm90aGVyIGNodW5rLlxuVHJhbnNmb3JtLnByb3RvdHlwZS5fdHJhbnNmb3JtID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbn07XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdmFyIHRzID0gdGhpcy5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLndyaXRlY2IgPSBjYjtcbiAgdHMud3JpdGVjaHVuayA9IGNodW5rO1xuICB0cy53cml0ZWVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIGlmICghdHMudHJhbnNmb3JtaW5nKSB7XG4gICAgdmFyIHJzID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgICBpZiAodHMubmVlZFRyYW5zZm9ybSB8fCBycy5uZWVkUmVhZGFibGUgfHwgcnMubGVuZ3RoIDwgcnMuaGlnaFdhdGVyTWFyaykgdGhpcy5fcmVhZChycy5oaWdoV2F0ZXJNYXJrKTtcbiAgfVxufTtcblxuLy8gRG9lc24ndCBtYXR0ZXIgd2hhdCB0aGUgYXJncyBhcmUgaGVyZS5cbi8vIF90cmFuc2Zvcm0gZG9lcyBhbGwgdGhlIHdvcmsuXG4vLyBUaGF0IHdlIGdvdCBoZXJlIG1lYW5zIHRoYXQgdGhlIHJlYWRhYmxlIHNpZGUgd2FudHMgbW9yZSBkYXRhLlxuVHJhbnNmb3JtLnByb3RvdHlwZS5fcmVhZCA9IGZ1bmN0aW9uIChuKSB7XG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlO1xuXG4gIGlmICh0cy53cml0ZWNodW5rICE9PSBudWxsICYmIHRzLndyaXRlY2IgJiYgIXRzLnRyYW5zZm9ybWluZykge1xuICAgIHRzLnRyYW5zZm9ybWluZyA9IHRydWU7XG4gICAgdGhpcy5fdHJhbnNmb3JtKHRzLndyaXRlY2h1bmssIHRzLndyaXRlZW5jb2RpbmcsIHRzLmFmdGVyVHJhbnNmb3JtKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBtYXJrIHRoYXQgd2UgbmVlZCBhIHRyYW5zZm9ybSwgc28gdGhhdCBhbnkgZGF0YSB0aGF0IGNvbWVzIGluXG4gICAgLy8gd2lsbCBnZXQgcHJvY2Vzc2VkLCBub3cgdGhhdCB3ZSd2ZSBhc2tlZCBmb3IgaXQuXG4gICAgdHMubmVlZFRyYW5zZm9ybSA9IHRydWU7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGRvbmUoc3RyZWFtLCBlcikge1xuICBpZiAoZXIpIHJldHVybiBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG5cbiAgLy8gaWYgdGhlcmUncyBub3RoaW5nIGluIHRoZSB3cml0ZSBidWZmZXIsIHRoZW4gdGhhdCBtZWFuc1xuICAvLyB0aGF0IG5vdGhpbmcgbW9yZSB3aWxsIGV2ZXIgYmUgcHJvdmlkZWRcbiAgdmFyIHdzID0gc3RyZWFtLl93cml0YWJsZVN0YXRlO1xuICB2YXIgdHMgPSBzdHJlYW0uX3RyYW5zZm9ybVN0YXRlO1xuXG4gIGlmICh3cy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignQ2FsbGluZyB0cmFuc2Zvcm0gZG9uZSB3aGVuIHdzLmxlbmd0aCAhPSAwJyk7XG5cbiAgaWYgKHRzLnRyYW5zZm9ybWluZykgdGhyb3cgbmV3IEVycm9yKCdDYWxsaW5nIHRyYW5zZm9ybSBkb25lIHdoZW4gc3RpbGwgdHJhbnNmb3JtaW5nJyk7XG5cbiAgcmV0dXJuIHN0cmVhbS5wdXNoKG51bGwpO1xufSIsIi8vIEEgYml0IHNpbXBsZXIgdGhhbiByZWFkYWJsZSBzdHJlYW1zLlxuLy8gSW1wbGVtZW50IGFuIGFzeW5jIC5fd3JpdGUoY2h1bmssIGVuY29kaW5nLCBjYiksIGFuZCBpdCdsbCBoYW5kbGUgYWxsXG4vLyB0aGUgZHJhaW4gZXZlbnQgZW1pc3Npb24gYW5kIGJ1ZmZlcmluZy5cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdyaXRhYmxlO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHByb2Nlc3NOZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MtbmV4dGljay1hcmdzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBhc3luY1dyaXRlID0gIXByb2Nlc3MuYnJvd3NlciAmJiBbJ3YwLjEwJywgJ3YwLjkuJ10uaW5kZXhPZihwcm9jZXNzLnZlcnNpb24uc2xpY2UoMCwgNSkpID4gLTEgPyBzZXRJbW1lZGlhdGUgOiBwcm9jZXNzTmV4dFRpY2s7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuV3JpdGFibGUuV3JpdGFibGVTdGF0ZSA9IFdyaXRhYmxlU3RhdGU7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBpbnRlcm5hbFV0aWwgPSB7XG4gIGRlcHJlY2F0ZTogcmVxdWlyZSgndXRpbC1kZXByZWNhdGUnKVxufTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIFN0cmVhbTtcbihmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgU3RyZWFtID0gcmVxdWlyZSgnc3QnICsgJ3JlYW0nKTtcbiAgfSBjYXRjaCAoXykge30gZmluYWxseSB7XG4gICAgaWYgKCFTdHJlYW0pIFN0cmVhbSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbiAgfVxufSkoKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBidWZmZXJTaGltID0gcmVxdWlyZSgnYnVmZmVyLXNoaW1zJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudXRpbC5pbmhlcml0cyhXcml0YWJsZSwgU3RyZWFtKTtcblxuZnVuY3Rpb24gbm9wKCkge31cblxuZnVuY3Rpb24gV3JpdGVSZXEoY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB0aGlzLmNodW5rID0gY2h1bms7XG4gIHRoaXMuZW5jb2RpbmcgPSBlbmNvZGluZztcbiAgdGhpcy5jYWxsYmFjayA9IGNiO1xuICB0aGlzLm5leHQgPSBudWxsO1xufVxuXG52YXIgRHVwbGV4O1xuZnVuY3Rpb24gV3JpdGFibGVTdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgRHVwbGV4ID0gRHVwbGV4IHx8IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyBvYmplY3Qgc3RyZWFtIGZsYWcgdG8gaW5kaWNhdGUgd2hldGhlciBvciBub3QgdGhpcyBzdHJlYW1cbiAgLy8gY29udGFpbnMgYnVmZmVycyBvciBvYmplY3RzLlxuICB0aGlzLm9iamVjdE1vZGUgPSAhIW9wdGlvbnMub2JqZWN0TW9kZTtcblxuICBpZiAoc3RyZWFtIGluc3RhbmNlb2YgRHVwbGV4KSB0aGlzLm9iamVjdE1vZGUgPSB0aGlzLm9iamVjdE1vZGUgfHwgISFvcHRpb25zLndyaXRhYmxlT2JqZWN0TW9kZTtcblxuICAvLyB0aGUgcG9pbnQgYXQgd2hpY2ggd3JpdGUoKSBzdGFydHMgcmV0dXJuaW5nIGZhbHNlXG4gIC8vIE5vdGU6IDAgaXMgYSB2YWxpZCB2YWx1ZSwgbWVhbnMgdGhhdCB3ZSBhbHdheXMgcmV0dXJuIGZhbHNlIGlmXG4gIC8vIHRoZSBlbnRpcmUgYnVmZmVyIGlzIG5vdCBmbHVzaGVkIGltbWVkaWF0ZWx5IG9uIHdyaXRlKClcbiAgdmFyIGh3bSA9IG9wdGlvbnMuaGlnaFdhdGVyTWFyaztcbiAgdmFyIGRlZmF1bHRId20gPSB0aGlzLm9iamVjdE1vZGUgPyAxNiA6IDE2ICogMTAyNDtcbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gaHdtIHx8IGh3bSA9PT0gMCA/IGh3bSA6IGRlZmF1bHRId207XG5cbiAgLy8gY2FzdCB0byBpbnRzLlxuICB0aGlzLmhpZ2hXYXRlck1hcmsgPSB+IH50aGlzLmhpZ2hXYXRlck1hcms7XG5cbiAgdGhpcy5uZWVkRHJhaW4gPSBmYWxzZTtcbiAgLy8gYXQgdGhlIHN0YXJ0IG9mIGNhbGxpbmcgZW5kKClcbiAgdGhpcy5lbmRpbmcgPSBmYWxzZTtcbiAgLy8gd2hlbiBlbmQoKSBoYXMgYmVlbiBjYWxsZWQsIGFuZCByZXR1cm5lZFxuICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gIC8vIHdoZW4gJ2ZpbmlzaCcgaXMgZW1pdHRlZFxuICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XG5cbiAgLy8gc2hvdWxkIHdlIGRlY29kZSBzdHJpbmdzIGludG8gYnVmZmVycyBiZWZvcmUgcGFzc2luZyB0byBfd3JpdGU/XG4gIC8vIHRoaXMgaXMgaGVyZSBzbyB0aGF0IHNvbWUgbm9kZS1jb3JlIHN0cmVhbXMgY2FuIG9wdGltaXplIHN0cmluZ1xuICAvLyBoYW5kbGluZyBhdCBhIGxvd2VyIGxldmVsLlxuICB2YXIgbm9EZWNvZGUgPSBvcHRpb25zLmRlY29kZVN0cmluZ3MgPT09IGZhbHNlO1xuICB0aGlzLmRlY29kZVN0cmluZ3MgPSAhbm9EZWNvZGU7XG5cbiAgLy8gQ3J5cHRvIGlzIGtpbmQgb2Ygb2xkIGFuZCBjcnVzdHkuICBIaXN0b3JpY2FsbHksIGl0cyBkZWZhdWx0IHN0cmluZ1xuICAvLyBlbmNvZGluZyBpcyAnYmluYXJ5JyBzbyB3ZSBoYXZlIHRvIG1ha2UgdGhpcyBjb25maWd1cmFibGUuXG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgdW5pdmVyc2UgdXNlcyAndXRmOCcsIHRob3VnaC5cbiAgdGhpcy5kZWZhdWx0RW5jb2RpbmcgPSBvcHRpb25zLmRlZmF1bHRFbmNvZGluZyB8fCAndXRmOCc7XG5cbiAgLy8gbm90IGFuIGFjdHVhbCBidWZmZXIgd2Uga2VlcCB0cmFjayBvZiwgYnV0IGEgbWVhc3VyZW1lbnRcbiAgLy8gb2YgaG93IG11Y2ggd2UncmUgd2FpdGluZyB0byBnZXQgcHVzaGVkIHRvIHNvbWUgdW5kZXJseWluZ1xuICAvLyBzb2NrZXQgb3IgZmlsZS5cbiAgdGhpcy5sZW5ndGggPSAwO1xuXG4gIC8vIGEgZmxhZyB0byBzZWUgd2hlbiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd3JpdGUuXG4gIHRoaXMud3JpdGluZyA9IGZhbHNlO1xuXG4gIC8vIHdoZW4gdHJ1ZSBhbGwgd3JpdGVzIHdpbGwgYmUgYnVmZmVyZWQgdW50aWwgLnVuY29yaygpIGNhbGxcbiAgdGhpcy5jb3JrZWQgPSAwO1xuXG4gIC8vIGEgZmxhZyB0byBiZSBhYmxlIHRvIHRlbGwgaWYgdGhlIG9ud3JpdGUgY2IgaXMgY2FsbGVkIGltbWVkaWF0ZWx5LFxuICAvLyBvciBvbiBhIGxhdGVyIHRpY2suICBXZSBzZXQgdGhpcyB0byB0cnVlIGF0IGZpcnN0LCBiZWNhdXNlIGFueVxuICAvLyBhY3Rpb25zIHRoYXQgc2hvdWxkbid0IGhhcHBlbiB1bnRpbCBcImxhdGVyXCIgc2hvdWxkIGdlbmVyYWxseSBhbHNvXG4gIC8vIG5vdCBoYXBwZW4gYmVmb3JlIHRoZSBmaXJzdCB3cml0ZSBjYWxsLlxuICB0aGlzLnN5bmMgPSB0cnVlO1xuXG4gIC8vIGEgZmxhZyB0byBrbm93IGlmIHdlJ3JlIHByb2Nlc3NpbmcgcHJldmlvdXNseSBidWZmZXJlZCBpdGVtcywgd2hpY2hcbiAgLy8gbWF5IGNhbGwgdGhlIF93cml0ZSgpIGNhbGxiYWNrIGluIHRoZSBzYW1lIHRpY2ssIHNvIHRoYXQgd2UgZG9uJ3RcbiAgLy8gZW5kIHVwIGluIGFuIG92ZXJsYXBwZWQgb253cml0ZSBzaXR1YXRpb24uXG4gIHRoaXMuYnVmZmVyUHJvY2Vzc2luZyA9IGZhbHNlO1xuXG4gIC8vIHRoZSBjYWxsYmFjayB0aGF0J3MgcGFzc2VkIHRvIF93cml0ZShjaHVuayxjYilcbiAgdGhpcy5vbndyaXRlID0gZnVuY3Rpb24gKGVyKSB7XG4gICAgb253cml0ZShzdHJlYW0sIGVyKTtcbiAgfTtcblxuICAvLyB0aGUgY2FsbGJhY2sgdGhhdCB0aGUgdXNlciBzdXBwbGllcyB0byB3cml0ZShjaHVuayxlbmNvZGluZyxjYilcbiAgdGhpcy53cml0ZWNiID0gbnVsbDtcblxuICAvLyB0aGUgYW1vdW50IHRoYXQgaXMgYmVpbmcgd3JpdHRlbiB3aGVuIF93cml0ZSBpcyBjYWxsZWQuXG4gIHRoaXMud3JpdGVsZW4gPSAwO1xuXG4gIHRoaXMuYnVmZmVyZWRSZXF1ZXN0ID0gbnVsbDtcbiAgdGhpcy5sYXN0QnVmZmVyZWRSZXF1ZXN0ID0gbnVsbDtcblxuICAvLyBudW1iZXIgb2YgcGVuZGluZyB1c2VyLXN1cHBsaWVkIHdyaXRlIGNhbGxiYWNrc1xuICAvLyB0aGlzIG11c3QgYmUgMCBiZWZvcmUgJ2ZpbmlzaCcgY2FuIGJlIGVtaXR0ZWRcbiAgdGhpcy5wZW5kaW5nY2IgPSAwO1xuXG4gIC8vIGVtaXQgcHJlZmluaXNoIGlmIHRoZSBvbmx5IHRoaW5nIHdlJ3JlIHdhaXRpbmcgZm9yIGlzIF93cml0ZSBjYnNcbiAgLy8gVGhpcyBpcyByZWxldmFudCBmb3Igc3luY2hyb25vdXMgVHJhbnNmb3JtIHN0cmVhbXNcbiAgdGhpcy5wcmVmaW5pc2hlZCA9IGZhbHNlO1xuXG4gIC8vIFRydWUgaWYgdGhlIGVycm9yIHdhcyBhbHJlYWR5IGVtaXR0ZWQgYW5kIHNob3VsZCBub3QgYmUgdGhyb3duIGFnYWluXG4gIHRoaXMuZXJyb3JFbWl0dGVkID0gZmFsc2U7XG5cbiAgLy8gY291bnQgYnVmZmVyZWQgcmVxdWVzdHNcbiAgdGhpcy5idWZmZXJlZFJlcXVlc3RDb3VudCA9IDA7XG5cbiAgLy8gYWxsb2NhdGUgdGhlIGZpcnN0IENvcmtlZFJlcXVlc3QsIHRoZXJlIGlzIGFsd2F5c1xuICAvLyBvbmUgYWxsb2NhdGVkIGFuZCBmcmVlIHRvIHVzZSwgYW5kIHdlIG1haW50YWluIGF0IG1vc3QgdHdvXG4gIHRoaXMuY29ya2VkUmVxdWVzdHNGcmVlID0gbmV3IENvcmtlZFJlcXVlc3QodGhpcyk7XG59XG5cbldyaXRhYmxlU3RhdGUucHJvdG90eXBlLmdldEJ1ZmZlciA9IGZ1bmN0aW9uIHdyaXRhYmxlU3RhdGVHZXRCdWZmZXIoKSB7XG4gIHZhciBjdXJyZW50ID0gdGhpcy5idWZmZXJlZFJlcXVlc3Q7XG4gIHZhciBvdXQgPSBbXTtcbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICBvdXQucHVzaChjdXJyZW50KTtcbiAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0O1xuICB9XG4gIHJldHVybiBvdXQ7XG59O1xuXG4oZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXcml0YWJsZVN0YXRlLnByb3RvdHlwZSwgJ2J1ZmZlcicsIHtcbiAgICAgIGdldDogaW50ZXJuYWxVdGlsLmRlcHJlY2F0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlcigpO1xuICAgICAgfSwgJ193cml0YWJsZVN0YXRlLmJ1ZmZlciBpcyBkZXByZWNhdGVkLiBVc2UgX3dyaXRhYmxlU3RhdGUuZ2V0QnVmZmVyICcgKyAnaW5zdGVhZC4nKVxuICAgIH0pO1xuICB9IGNhdGNoIChfKSB7fVxufSkoKTtcblxudmFyIER1cGxleDtcbmZ1bmN0aW9uIFdyaXRhYmxlKG9wdGlvbnMpIHtcbiAgRHVwbGV4ID0gRHVwbGV4IHx8IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICAvLyBXcml0YWJsZSBjdG9yIGlzIGFwcGxpZWQgdG8gRHVwbGV4ZXMsIHRob3VnaCB0aGV5J3JlIG5vdFxuICAvLyBpbnN0YW5jZW9mIFdyaXRhYmxlLCB0aGV5J3JlIGluc3RhbmNlb2YgUmVhZGFibGUuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBXcml0YWJsZSkgJiYgISh0aGlzIGluc3RhbmNlb2YgRHVwbGV4KSkgcmV0dXJuIG5ldyBXcml0YWJsZShvcHRpb25zKTtcblxuICB0aGlzLl93cml0YWJsZVN0YXRlID0gbmV3IFdyaXRhYmxlU3RhdGUob3B0aW9ucywgdGhpcyk7XG5cbiAgLy8gbGVnYWN5LlxuICB0aGlzLndyaXRhYmxlID0gdHJ1ZTtcblxuICBpZiAob3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy53cml0ZSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fd3JpdGUgPSBvcHRpb25zLndyaXRlO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLndyaXRldiA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fd3JpdGV2ID0gb3B0aW9ucy53cml0ZXY7XG4gIH1cblxuICBTdHJlYW0uY2FsbCh0aGlzKTtcbn1cblxuLy8gT3RoZXJ3aXNlIHBlb3BsZSBjYW4gcGlwZSBXcml0YWJsZSBzdHJlYW1zLCB3aGljaCBpcyBqdXN0IHdyb25nLlxuV3JpdGFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0Nhbm5vdCBwaXBlLCBub3QgcmVhZGFibGUnKSk7XG59O1xuXG5mdW5jdGlvbiB3cml0ZUFmdGVyRW5kKHN0cmVhbSwgY2IpIHtcbiAgdmFyIGVyID0gbmV3IEVycm9yKCd3cml0ZSBhZnRlciBlbmQnKTtcbiAgLy8gVE9ETzogZGVmZXIgZXJyb3IgZXZlbnRzIGNvbnNpc3RlbnRseSBldmVyeXdoZXJlLCBub3QganVzdCB0aGUgY2JcbiAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICBwcm9jZXNzTmV4dFRpY2soY2IsIGVyKTtcbn1cblxuLy8gSWYgd2UgZ2V0IHNvbWV0aGluZyB0aGF0IGlzIG5vdCBhIGJ1ZmZlciwgc3RyaW5nLCBudWxsLCBvciB1bmRlZmluZWQsXG4vLyBhbmQgd2UncmUgbm90IGluIG9iamVjdE1vZGUsIHRoZW4gdGhhdCdzIGFuIGVycm9yLlxuLy8gT3RoZXJ3aXNlIHN0cmVhbSBjaHVua3MgYXJlIGFsbCBjb25zaWRlcmVkIHRvIGJlIG9mIGxlbmd0aD0xLCBhbmQgdGhlXG4vLyB3YXRlcm1hcmtzIGRldGVybWluZSBob3cgbWFueSBvYmplY3RzIHRvIGtlZXAgaW4gdGhlIGJ1ZmZlciwgcmF0aGVyIHRoYW5cbi8vIGhvdyBtYW55IGJ5dGVzIG9yIGNoYXJhY3RlcnMuXG5mdW5jdGlvbiB2YWxpZENodW5rKHN0cmVhbSwgc3RhdGUsIGNodW5rLCBjYikge1xuICB2YXIgdmFsaWQgPSB0cnVlO1xuICB2YXIgZXIgPSBmYWxzZTtcbiAgLy8gQWx3YXlzIHRocm93IGVycm9yIGlmIGEgbnVsbCBpcyB3cml0dGVuXG4gIC8vIGlmIHdlIGFyZSBub3QgaW4gb2JqZWN0IG1vZGUgdGhlbiB0aHJvd1xuICAvLyBpZiBpdCBpcyBub3QgYSBidWZmZXIsIHN0cmluZywgb3IgdW5kZWZpbmVkLlxuICBpZiAoY2h1bmsgPT09IG51bGwpIHtcbiAgICBlciA9IG5ldyBUeXBlRXJyb3IoJ01heSBub3Qgd3JpdGUgbnVsbCB2YWx1ZXMgdG8gc3RyZWFtJyk7XG4gIH0gZWxzZSBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihjaHVuaykgJiYgdHlwZW9mIGNodW5rICE9PSAnc3RyaW5nJyAmJiBjaHVuayAhPT0gdW5kZWZpbmVkICYmICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgZXIgPSBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG5vbi1zdHJpbmcvYnVmZmVyIGNodW5rJyk7XG4gIH1cbiAgaWYgKGVyKSB7XG4gICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xuICAgIHByb2Nlc3NOZXh0VGljayhjYiwgZXIpO1xuICAgIHZhbGlkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbGlkO1xufVxuXG5Xcml0YWJsZS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuICB2YXIgcmV0ID0gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gZW5jb2Rpbmc7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9XG5cbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihjaHVuaykpIGVuY29kaW5nID0gJ2J1ZmZlcic7ZWxzZSBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9IHN0YXRlLmRlZmF1bHRFbmNvZGluZztcblxuICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSBjYiA9IG5vcDtcblxuICBpZiAoc3RhdGUuZW5kZWQpIHdyaXRlQWZ0ZXJFbmQodGhpcywgY2IpO2Vsc2UgaWYgKHZhbGlkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCBjYikpIHtcbiAgICBzdGF0ZS5wZW5kaW5nY2IrKztcbiAgICByZXQgPSB3cml0ZU9yQnVmZmVyKHRoaXMsIHN0YXRlLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG5Xcml0YWJsZS5wcm90b3R5cGUuY29yayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fd3JpdGFibGVTdGF0ZTtcblxuICBzdGF0ZS5jb3JrZWQrKztcbn07XG5cbldyaXRhYmxlLnByb3RvdHlwZS51bmNvcmsgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgaWYgKHN0YXRlLmNvcmtlZCkge1xuICAgIHN0YXRlLmNvcmtlZC0tO1xuXG4gICAgaWYgKCFzdGF0ZS53cml0aW5nICYmICFzdGF0ZS5jb3JrZWQgJiYgIXN0YXRlLmZpbmlzaGVkICYmICFzdGF0ZS5idWZmZXJQcm9jZXNzaW5nICYmIHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdCkgY2xlYXJCdWZmZXIodGhpcywgc3RhdGUpO1xuICB9XG59O1xuXG5Xcml0YWJsZS5wcm90b3R5cGUuc2V0RGVmYXVsdEVuY29kaW5nID0gZnVuY3Rpb24gc2V0RGVmYXVsdEVuY29kaW5nKGVuY29kaW5nKSB7XG4gIC8vIG5vZGU6OlBhcnNlRW5jb2RpbmcoKSByZXF1aXJlcyBsb3dlciBjYXNlLlxuICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJykgZW5jb2RpbmcgPSBlbmNvZGluZy50b0xvd2VyQ2FzZSgpO1xuICBpZiAoIShbJ2hleCcsICd1dGY4JywgJ3V0Zi04JywgJ2FzY2lpJywgJ2JpbmFyeScsICdiYXNlNjQnLCAndWNzMicsICd1Y3MtMicsICd1dGYxNmxlJywgJ3V0Zi0xNmxlJywgJ3JhdyddLmluZGV4T2YoKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKCkpID4gLTEpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpO1xuICB0aGlzLl93cml0YWJsZVN0YXRlLmRlZmF1bHRFbmNvZGluZyA9IGVuY29kaW5nO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGRlY29kZUNodW5rKHN0YXRlLCBjaHVuaywgZW5jb2RpbmcpIHtcbiAgaWYgKCFzdGF0ZS5vYmplY3RNb2RlICYmIHN0YXRlLmRlY29kZVN0cmluZ3MgIT09IGZhbHNlICYmIHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycpIHtcbiAgICBjaHVuayA9IGJ1ZmZlclNoaW0uZnJvbShjaHVuaywgZW5jb2RpbmcpO1xuICB9XG4gIHJldHVybiBjaHVuaztcbn1cblxuLy8gaWYgd2UncmUgYWxyZWFkeSB3cml0aW5nIHNvbWV0aGluZywgdGhlbiBqdXN0IHB1dCB0aGlzXG4vLyBpbiB0aGUgcXVldWUsIGFuZCB3YWl0IG91ciB0dXJuLiAgT3RoZXJ3aXNlLCBjYWxsIF93cml0ZVxuLy8gSWYgd2UgcmV0dXJuIGZhbHNlLCB0aGVuIHdlIG5lZWQgYSBkcmFpbiBldmVudCwgc28gc2V0IHRoYXQgZmxhZy5cbmZ1bmN0aW9uIHdyaXRlT3JCdWZmZXIoc3RyZWFtLCBzdGF0ZSwgY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjaHVuayA9IGRlY29kZUNodW5rKHN0YXRlLCBjaHVuaywgZW5jb2RpbmcpO1xuXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoY2h1bmspKSBlbmNvZGluZyA9ICdidWZmZXInO1xuICB2YXIgbGVuID0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG5cbiAgc3RhdGUubGVuZ3RoICs9IGxlbjtcblxuICB2YXIgcmV0ID0gc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyaztcbiAgLy8gd2UgbXVzdCBlbnN1cmUgdGhhdCBwcmV2aW91cyBuZWVkRHJhaW4gd2lsbCBub3QgYmUgcmVzZXQgdG8gZmFsc2UuXG4gIGlmICghcmV0KSBzdGF0ZS5uZWVkRHJhaW4gPSB0cnVlO1xuXG4gIGlmIChzdGF0ZS53cml0aW5nIHx8IHN0YXRlLmNvcmtlZCkge1xuICAgIHZhciBsYXN0ID0gc3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdDtcbiAgICBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0ID0gbmV3IFdyaXRlUmVxKGNodW5rLCBlbmNvZGluZywgY2IpO1xuICAgIGlmIChsYXN0KSB7XG4gICAgICBsYXN0Lm5leHQgPSBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5idWZmZXJlZFJlcXVlc3QgPSBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0O1xuICAgIH1cbiAgICBzdGF0ZS5idWZmZXJlZFJlcXVlc3RDb3VudCArPSAxO1xuICB9IGVsc2Uge1xuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmFsc2UsIGxlbiwgY2h1bmssIGVuY29kaW5nLCBjYik7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIHdyaXRldiwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHN0YXRlLndyaXRlbGVuID0gbGVuO1xuICBzdGF0ZS53cml0ZWNiID0gY2I7XG4gIHN0YXRlLndyaXRpbmcgPSB0cnVlO1xuICBzdGF0ZS5zeW5jID0gdHJ1ZTtcbiAgaWYgKHdyaXRldikgc3RyZWFtLl93cml0ZXYoY2h1bmssIHN0YXRlLm9ud3JpdGUpO2Vsc2Ugc3RyZWFtLl93cml0ZShjaHVuaywgZW5jb2RpbmcsIHN0YXRlLm9ud3JpdGUpO1xuICBzdGF0ZS5zeW5jID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG9ud3JpdGVFcnJvcihzdHJlYW0sIHN0YXRlLCBzeW5jLCBlciwgY2IpIHtcbiAgLS1zdGF0ZS5wZW5kaW5nY2I7XG4gIGlmIChzeW5jKSBwcm9jZXNzTmV4dFRpY2soY2IsIGVyKTtlbHNlIGNiKGVyKTtcblxuICBzdHJlYW0uX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkID0gdHJ1ZTtcbiAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZXIpO1xufVxuXG5mdW5jdGlvbiBvbndyaXRlU3RhdGVVcGRhdGUoc3RhdGUpIHtcbiAgc3RhdGUud3JpdGluZyA9IGZhbHNlO1xuICBzdGF0ZS53cml0ZWNiID0gbnVsbDtcbiAgc3RhdGUubGVuZ3RoIC09IHN0YXRlLndyaXRlbGVuO1xuICBzdGF0ZS53cml0ZWxlbiA9IDA7XG59XG5cbmZ1bmN0aW9uIG9ud3JpdGUoc3RyZWFtLCBlcikge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3dyaXRhYmxlU3RhdGU7XG4gIHZhciBzeW5jID0gc3RhdGUuc3luYztcbiAgdmFyIGNiID0gc3RhdGUud3JpdGVjYjtcblxuICBvbndyaXRlU3RhdGVVcGRhdGUoc3RhdGUpO1xuXG4gIGlmIChlcikgb253cml0ZUVycm9yKHN0cmVhbSwgc3RhdGUsIHN5bmMsIGVyLCBjYik7ZWxzZSB7XG4gICAgLy8gQ2hlY2sgaWYgd2UncmUgYWN0dWFsbHkgcmVhZHkgdG8gZmluaXNoLCBidXQgZG9uJ3QgZW1pdCB5ZXRcbiAgICB2YXIgZmluaXNoZWQgPSBuZWVkRmluaXNoKHN0YXRlKTtcblxuICAgIGlmICghZmluaXNoZWQgJiYgIXN0YXRlLmNvcmtlZCAmJiAhc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyAmJiBzdGF0ZS5idWZmZXJlZFJlcXVlc3QpIHtcbiAgICAgIGNsZWFyQnVmZmVyKHN0cmVhbSwgc3RhdGUpO1xuICAgIH1cblxuICAgIGlmIChzeW5jKSB7XG4gICAgICAvKjxyZXBsYWNlbWVudD4qL1xuICAgICAgYXN5bmNXcml0ZShhZnRlcldyaXRlLCBzdHJlYW0sIHN0YXRlLCBmaW5pc2hlZCwgY2IpO1xuICAgICAgLyo8L3JlcGxhY2VtZW50PiovXG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWZ0ZXJXcml0ZShzdHJlYW0sIHN0YXRlLCBmaW5pc2hlZCwgY2IpO1xuICAgICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFmdGVyV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmluaXNoZWQsIGNiKSB7XG4gIGlmICghZmluaXNoZWQpIG9ud3JpdGVEcmFpbihzdHJlYW0sIHN0YXRlKTtcbiAgc3RhdGUucGVuZGluZ2NiLS07XG4gIGNiKCk7XG4gIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpO1xufVxuXG4vLyBNdXN0IGZvcmNlIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbiBuZXh0VGljaywgc28gdGhhdCB3ZSBkb24ndFxuLy8gZW1pdCAnZHJhaW4nIGJlZm9yZSB0aGUgd3JpdGUoKSBjb25zdW1lciBnZXRzIHRoZSAnZmFsc2UnIHJldHVyblxuLy8gdmFsdWUsIGFuZCBoYXMgYSBjaGFuY2UgdG8gYXR0YWNoIGEgJ2RyYWluJyBsaXN0ZW5lci5cbmZ1bmN0aW9uIG9ud3JpdGVEcmFpbihzdHJlYW0sIHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5sZW5ndGggPT09IDAgJiYgc3RhdGUubmVlZERyYWluKSB7XG4gICAgc3RhdGUubmVlZERyYWluID0gZmFsc2U7XG4gICAgc3RyZWFtLmVtaXQoJ2RyYWluJyk7XG4gIH1cbn1cblxuLy8gaWYgdGhlcmUncyBzb21ldGhpbmcgaW4gdGhlIGJ1ZmZlciB3YWl0aW5nLCB0aGVuIHByb2Nlc3MgaXRcbmZ1bmN0aW9uIGNsZWFyQnVmZmVyKHN0cmVhbSwgc3RhdGUpIHtcbiAgc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyA9IHRydWU7XG4gIHZhciBlbnRyeSA9IHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdDtcblxuICBpZiAoc3RyZWFtLl93cml0ZXYgJiYgZW50cnkgJiYgZW50cnkubmV4dCkge1xuICAgIC8vIEZhc3QgY2FzZSwgd3JpdGUgZXZlcnl0aGluZyB1c2luZyBfd3JpdGV2KClcbiAgICB2YXIgbCA9IHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdENvdW50O1xuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXkobCk7XG4gICAgdmFyIGhvbGRlciA9IHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZTtcbiAgICBob2xkZXIuZW50cnkgPSBlbnRyeTtcblxuICAgIHZhciBjb3VudCA9IDA7XG4gICAgd2hpbGUgKGVudHJ5KSB7XG4gICAgICBidWZmZXJbY291bnRdID0gZW50cnk7XG4gICAgICBlbnRyeSA9IGVudHJ5Lm5leHQ7XG4gICAgICBjb3VudCArPSAxO1xuICAgIH1cblxuICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgdHJ1ZSwgc3RhdGUubGVuZ3RoLCBidWZmZXIsICcnLCBob2xkZXIuZmluaXNoKTtcblxuICAgIC8vIGRvV3JpdGUgaXMgYWxtb3N0IGFsd2F5cyBhc3luYywgZGVmZXIgdGhlc2UgdG8gc2F2ZSBhIGJpdCBvZiB0aW1lXG4gICAgLy8gYXMgdGhlIGhvdCBwYXRoIGVuZHMgd2l0aCBkb1dyaXRlXG4gICAgc3RhdGUucGVuZGluZ2NiKys7XG4gICAgc3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdCA9IG51bGw7XG4gICAgaWYgKGhvbGRlci5uZXh0KSB7XG4gICAgICBzdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWUgPSBob2xkZXIubmV4dDtcbiAgICAgIGhvbGRlci5uZXh0ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlID0gbmV3IENvcmtlZFJlcXVlc3Qoc3RhdGUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBTbG93IGNhc2UsIHdyaXRlIGNodW5rcyBvbmUtYnktb25lXG4gICAgd2hpbGUgKGVudHJ5KSB7XG4gICAgICB2YXIgY2h1bmsgPSBlbnRyeS5jaHVuaztcbiAgICAgIHZhciBlbmNvZGluZyA9IGVudHJ5LmVuY29kaW5nO1xuICAgICAgdmFyIGNiID0gZW50cnkuY2FsbGJhY2s7XG4gICAgICB2YXIgbGVuID0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG5cbiAgICAgIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgZmFsc2UsIGxlbiwgY2h1bmssIGVuY29kaW5nLCBjYik7XG4gICAgICBlbnRyeSA9IGVudHJ5Lm5leHQ7XG4gICAgICAvLyBpZiB3ZSBkaWRuJ3QgY2FsbCB0aGUgb253cml0ZSBpbW1lZGlhdGVseSwgdGhlblxuICAgICAgLy8gaXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHdhaXQgdW50aWwgaXQgZG9lcy5cbiAgICAgIC8vIGFsc28sIHRoYXQgbWVhbnMgdGhhdCB0aGUgY2h1bmsgYW5kIGNiIGFyZSBjdXJyZW50bHlcbiAgICAgIC8vIGJlaW5nIHByb2Nlc3NlZCwgc28gbW92ZSB0aGUgYnVmZmVyIGNvdW50ZXIgcGFzdCB0aGVtLlxuICAgICAgaWYgKHN0YXRlLndyaXRpbmcpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVudHJ5ID09PSBudWxsKSBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0ID0gbnVsbDtcbiAgfVxuXG4gIHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdENvdW50ID0gMDtcbiAgc3RhdGUuYnVmZmVyZWRSZXF1ZXN0ID0gZW50cnk7XG4gIHN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgPSBmYWxzZTtcbn1cblxuV3JpdGFibGUucHJvdG90eXBlLl93cml0ZSA9IGZ1bmN0aW9uIChjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNiKG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJykpO1xufTtcblxuV3JpdGFibGUucHJvdG90eXBlLl93cml0ZXYgPSBudWxsO1xuXG5Xcml0YWJsZS5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5fd3JpdGFibGVTdGF0ZTtcblxuICBpZiAodHlwZW9mIGNodW5rID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBjaHVuaztcbiAgICBjaHVuayA9IG51bGw7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gZW5jb2Rpbmc7XG4gICAgZW5jb2RpbmcgPSBudWxsO1xuICB9XG5cbiAgaWYgKGNodW5rICE9PSBudWxsICYmIGNodW5rICE9PSB1bmRlZmluZWQpIHRoaXMud3JpdGUoY2h1bmssIGVuY29kaW5nKTtcblxuICAvLyAuZW5kKCkgZnVsbHkgdW5jb3Jrc1xuICBpZiAoc3RhdGUuY29ya2VkKSB7XG4gICAgc3RhdGUuY29ya2VkID0gMTtcbiAgICB0aGlzLnVuY29yaygpO1xuICB9XG5cbiAgLy8gaWdub3JlIHVubmVjZXNzYXJ5IGVuZCgpIGNhbGxzLlxuICBpZiAoIXN0YXRlLmVuZGluZyAmJiAhc3RhdGUuZmluaXNoZWQpIGVuZFdyaXRhYmxlKHRoaXMsIHN0YXRlLCBjYik7XG59O1xuXG5mdW5jdGlvbiBuZWVkRmluaXNoKHN0YXRlKSB7XG4gIHJldHVybiBzdGF0ZS5lbmRpbmcgJiYgc3RhdGUubGVuZ3RoID09PSAwICYmIHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdCA9PT0gbnVsbCAmJiAhc3RhdGUuZmluaXNoZWQgJiYgIXN0YXRlLndyaXRpbmc7XG59XG5cbmZ1bmN0aW9uIHByZWZpbmlzaChzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucHJlZmluaXNoZWQpIHtcbiAgICBzdGF0ZS5wcmVmaW5pc2hlZCA9IHRydWU7XG4gICAgc3RyZWFtLmVtaXQoJ3ByZWZpbmlzaCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpIHtcbiAgdmFyIG5lZWQgPSBuZWVkRmluaXNoKHN0YXRlKTtcbiAgaWYgKG5lZWQpIHtcbiAgICBpZiAoc3RhdGUucGVuZGluZ2NiID09PSAwKSB7XG4gICAgICBwcmVmaW5pc2goc3RyZWFtLCBzdGF0ZSk7XG4gICAgICBzdGF0ZS5maW5pc2hlZCA9IHRydWU7XG4gICAgICBzdHJlYW0uZW1pdCgnZmluaXNoJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZWZpbmlzaChzdHJlYW0sIHN0YXRlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5lZWQ7XG59XG5cbmZ1bmN0aW9uIGVuZFdyaXRhYmxlKHN0cmVhbSwgc3RhdGUsIGNiKSB7XG4gIHN0YXRlLmVuZGluZyA9IHRydWU7XG4gIGZpbmlzaE1heWJlKHN0cmVhbSwgc3RhdGUpO1xuICBpZiAoY2IpIHtcbiAgICBpZiAoc3RhdGUuZmluaXNoZWQpIHByb2Nlc3NOZXh0VGljayhjYik7ZWxzZSBzdHJlYW0ub25jZSgnZmluaXNoJywgY2IpO1xuICB9XG4gIHN0YXRlLmVuZGVkID0gdHJ1ZTtcbiAgc3RyZWFtLndyaXRhYmxlID0gZmFsc2U7XG59XG5cbi8vIEl0IHNlZW1zIGEgbGlua2VkIGxpc3QgYnV0IGl0IGlzIG5vdFxuLy8gdGhlcmUgd2lsbCBiZSBvbmx5IDIgb2YgdGhlc2UgZm9yIGVhY2ggc3RyZWFtXG5mdW5jdGlvbiBDb3JrZWRSZXF1ZXN0KHN0YXRlKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgdGhpcy5lbnRyeSA9IG51bGw7XG5cbiAgdGhpcy5maW5pc2ggPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgdmFyIGVudHJ5ID0gX3RoaXMuZW50cnk7XG4gICAgX3RoaXMuZW50cnkgPSBudWxsO1xuICAgIHdoaWxlIChlbnRyeSkge1xuICAgICAgdmFyIGNiID0gZW50cnkuY2FsbGJhY2s7XG4gICAgICBzdGF0ZS5wZW5kaW5nY2ItLTtcbiAgICAgIGNiKGVycik7XG4gICAgICBlbnRyeSA9IGVudHJ5Lm5leHQ7XG4gICAgfVxuICAgIGlmIChzdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWUpIHtcbiAgICAgIHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZS5uZXh0ID0gX3RoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZSA9IF90aGlzO1xuICAgIH1cbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIGJ1ZmZlclNoaW0gPSByZXF1aXJlKCdidWZmZXItc2hpbXMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1ZmZlckxpc3Q7XG5cbmZ1bmN0aW9uIEJ1ZmZlckxpc3QoKSB7XG4gIHRoaXMuaGVhZCA9IG51bGw7XG4gIHRoaXMudGFpbCA9IG51bGw7XG4gIHRoaXMubGVuZ3RoID0gMDtcbn1cblxuQnVmZmVyTGlzdC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICh2KSB7XG4gIHZhciBlbnRyeSA9IHsgZGF0YTogdiwgbmV4dDogbnVsbCB9O1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB0aGlzLnRhaWwubmV4dCA9IGVudHJ5O2Vsc2UgdGhpcy5oZWFkID0gZW50cnk7XG4gIHRoaXMudGFpbCA9IGVudHJ5O1xuICArK3RoaXMubGVuZ3RoO1xufTtcblxuQnVmZmVyTGlzdC5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uICh2KSB7XG4gIHZhciBlbnRyeSA9IHsgZGF0YTogdiwgbmV4dDogdGhpcy5oZWFkIH07XG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgdGhpcy50YWlsID0gZW50cnk7XG4gIHRoaXMuaGVhZCA9IGVudHJ5O1xuICArK3RoaXMubGVuZ3RoO1xufTtcblxuQnVmZmVyTGlzdC5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICB2YXIgcmV0ID0gdGhpcy5oZWFkLmRhdGE7XG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMSkgdGhpcy5oZWFkID0gdGhpcy50YWlsID0gbnVsbDtlbHNlIHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0O1xuICAtLXRoaXMubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuQnVmZmVyTGlzdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuaGVhZCA9IHRoaXMudGFpbCA9IG51bGw7XG4gIHRoaXMubGVuZ3RoID0gMDtcbn07XG5cbkJ1ZmZlckxpc3QucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiAocykge1xuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiAnJztcbiAgdmFyIHAgPSB0aGlzLmhlYWQ7XG4gIHZhciByZXQgPSAnJyArIHAuZGF0YTtcbiAgd2hpbGUgKHAgPSBwLm5leHQpIHtcbiAgICByZXQgKz0gcyArIHAuZGF0YTtcbiAgfXJldHVybiByZXQ7XG59O1xuXG5CdWZmZXJMaXN0LnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbiAobikge1xuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiBidWZmZXJTaGltLmFsbG9jKDApO1xuICBpZiAodGhpcy5sZW5ndGggPT09IDEpIHJldHVybiB0aGlzLmhlYWQuZGF0YTtcbiAgdmFyIHJldCA9IGJ1ZmZlclNoaW0uYWxsb2NVbnNhZmUobiA+Pj4gMCk7XG4gIHZhciBwID0gdGhpcy5oZWFkO1xuICB2YXIgaSA9IDA7XG4gIHdoaWxlIChwKSB7XG4gICAgcC5kYXRhLmNvcHkocmV0LCBpKTtcbiAgICBpICs9IHAuZGF0YS5sZW5ndGg7XG4gICAgcCA9IHAubmV4dDtcbiAgfVxuICByZXR1cm4gcmV0O1xufTsiLCJ2YXIgU3RyZWFtID0gKGZ1bmN0aW9uICgpe1xuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKCdzdCcgKyAncmVhbScpOyAvLyBoYWNrIHRvIGZpeCBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgaXNzdWUgd2hlbiB1c2VkIHdpdGggYnJvd3NlcmlmeVxuICB9IGNhdGNoKF8pe31cbn0oKSk7XG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3JlYWRhYmxlLmpzJyk7XG5leHBvcnRzLlN0cmVhbSA9IFN0cmVhbSB8fCBleHBvcnRzO1xuZXhwb3J0cy5SZWFkYWJsZSA9IGV4cG9ydHM7XG5leHBvcnRzLldyaXRhYmxlID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV93cml0YWJsZS5qcycpO1xuZXhwb3J0cy5EdXBsZXggPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX2R1cGxleC5qcycpO1xuZXhwb3J0cy5UcmFuc2Zvcm0gPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcycpO1xuZXhwb3J0cy5QYXNzVGhyb3VnaCA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fcGFzc3Rocm91Z2guanMnKTtcblxuaWYgKCFwcm9jZXNzLmJyb3dzZXIgJiYgcHJvY2Vzcy5lbnYuUkVBREFCTEVfU1RSRUFNID09PSAnZGlzYWJsZScgJiYgU3RyZWFtKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gU3RyZWFtO1xufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG5cbnZhciBpc0J1ZmZlckVuY29kaW5nID0gQnVmZmVyLmlzRW5jb2RpbmdcbiAgfHwgZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgICAgICBzd2l0Y2ggKGVuY29kaW5nICYmIGVuY29kaW5nLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgIGNhc2UgJ2hleCc6IGNhc2UgJ3V0ZjgnOiBjYXNlICd1dGYtOCc6IGNhc2UgJ2FzY2lpJzogY2FzZSAnYmluYXJ5JzogY2FzZSAnYmFzZTY0JzogY2FzZSAndWNzMic6IGNhc2UgJ3Vjcy0yJzogY2FzZSAndXRmMTZsZSc6IGNhc2UgJ3V0Zi0xNmxlJzogY2FzZSAncmF3JzogcmV0dXJuIHRydWU7XG4gICAgICAgICBkZWZhdWx0OiByZXR1cm4gZmFsc2U7XG4gICAgICAgfVxuICAgICB9XG5cblxuZnVuY3Rpb24gYXNzZXJ0RW5jb2RpbmcoZW5jb2RpbmcpIHtcbiAgaWYgKGVuY29kaW5nICYmICFpc0J1ZmZlckVuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKTtcbiAgfVxufVxuXG4vLyBTdHJpbmdEZWNvZGVyIHByb3ZpZGVzIGFuIGludGVyZmFjZSBmb3IgZWZmaWNpZW50bHkgc3BsaXR0aW5nIGEgc2VyaWVzIG9mXG4vLyBidWZmZXJzIGludG8gYSBzZXJpZXMgb2YgSlMgc3RyaW5ncyB3aXRob3V0IGJyZWFraW5nIGFwYXJ0IG11bHRpLWJ5dGVcbi8vIGNoYXJhY3RlcnMuIENFU1UtOCBpcyBoYW5kbGVkIGFzIHBhcnQgb2YgdGhlIFVURi04IGVuY29kaW5nLlxuLy9cbi8vIEBUT0RPIEhhbmRsaW5nIGFsbCBlbmNvZGluZ3MgaW5zaWRlIGEgc2luZ2xlIG9iamVjdCBtYWtlcyBpdCB2ZXJ5IGRpZmZpY3VsdFxuLy8gdG8gcmVhc29uIGFib3V0IHRoaXMgY29kZSwgc28gaXQgc2hvdWxkIGJlIHNwbGl0IHVwIGluIHRoZSBmdXR1cmUuXG4vLyBAVE9ETyBUaGVyZSBzaG91bGQgYmUgYSB1dGY4LXN0cmljdCBlbmNvZGluZyB0aGF0IHJlamVjdHMgaW52YWxpZCBVVEYtOCBjb2RlXG4vLyBwb2ludHMgYXMgdXNlZCBieSBDRVNVLTguXG52YXIgU3RyaW5nRGVjb2RlciA9IGV4cG9ydHMuU3RyaW5nRGVjb2RlciA9IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gIHRoaXMuZW5jb2RpbmcgPSAoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1stX10vLCAnJyk7XG4gIGFzc2VydEVuY29kaW5nKGVuY29kaW5nKTtcbiAgc3dpdGNoICh0aGlzLmVuY29kaW5nKSB7XG4gICAgY2FzZSAndXRmOCc6XG4gICAgICAvLyBDRVNVLTggcmVwcmVzZW50cyBlYWNoIG9mIFN1cnJvZ2F0ZSBQYWlyIGJ5IDMtYnl0ZXNcbiAgICAgIHRoaXMuc3Vycm9nYXRlU2l6ZSA9IDM7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIC8vIFVURi0xNiByZXByZXNlbnRzIGVhY2ggb2YgU3Vycm9nYXRlIFBhaXIgYnkgMi1ieXRlc1xuICAgICAgdGhpcy5zdXJyb2dhdGVTaXplID0gMjtcbiAgICAgIHRoaXMuZGV0ZWN0SW5jb21wbGV0ZUNoYXIgPSB1dGYxNkRldGVjdEluY29tcGxldGVDaGFyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIC8vIEJhc2UtNjQgc3RvcmVzIDMgYnl0ZXMgaW4gNCBjaGFycywgYW5kIHBhZHMgdGhlIHJlbWFpbmRlci5cbiAgICAgIHRoaXMuc3Vycm9nYXRlU2l6ZSA9IDM7XG4gICAgICB0aGlzLmRldGVjdEluY29tcGxldGVDaGFyID0gYmFzZTY0RGV0ZWN0SW5jb21wbGV0ZUNoYXI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhpcy53cml0ZSA9IHBhc3NUaHJvdWdoV3JpdGU7XG4gICAgICByZXR1cm47XG4gIH1cblxuICAvLyBFbm91Z2ggc3BhY2UgdG8gc3RvcmUgYWxsIGJ5dGVzIG9mIGEgc2luZ2xlIGNoYXJhY3Rlci4gVVRGLTggbmVlZHMgNFxuICAvLyBieXRlcywgYnV0IENFU1UtOCBtYXkgcmVxdWlyZSB1cCB0byA2ICgzIGJ5dGVzIHBlciBzdXJyb2dhdGUpLlxuICB0aGlzLmNoYXJCdWZmZXIgPSBuZXcgQnVmZmVyKDYpO1xuICAvLyBOdW1iZXIgb2YgYnl0ZXMgcmVjZWl2ZWQgZm9yIHRoZSBjdXJyZW50IGluY29tcGxldGUgbXVsdGktYnl0ZSBjaGFyYWN0ZXIuXG4gIHRoaXMuY2hhclJlY2VpdmVkID0gMDtcbiAgLy8gTnVtYmVyIG9mIGJ5dGVzIGV4cGVjdGVkIGZvciB0aGUgY3VycmVudCBpbmNvbXBsZXRlIG11bHRpLWJ5dGUgY2hhcmFjdGVyLlxuICB0aGlzLmNoYXJMZW5ndGggPSAwO1xufTtcblxuXG4vLyB3cml0ZSBkZWNvZGVzIHRoZSBnaXZlbiBidWZmZXIgYW5kIHJldHVybnMgaXQgYXMgSlMgc3RyaW5nIHRoYXQgaXNcbi8vIGd1YXJhbnRlZWQgdG8gbm90IGNvbnRhaW4gYW55IHBhcnRpYWwgbXVsdGktYnl0ZSBjaGFyYWN0ZXJzLiBBbnkgcGFydGlhbFxuLy8gY2hhcmFjdGVyIGZvdW5kIGF0IHRoZSBlbmQgb2YgdGhlIGJ1ZmZlciBpcyBidWZmZXJlZCB1cCwgYW5kIHdpbGwgYmVcbi8vIHJldHVybmVkIHdoZW4gY2FsbGluZyB3cml0ZSBhZ2FpbiB3aXRoIHRoZSByZW1haW5pbmcgYnl0ZXMuXG4vL1xuLy8gTm90ZTogQ29udmVydGluZyBhIEJ1ZmZlciBjb250YWluaW5nIGFuIG9ycGhhbiBzdXJyb2dhdGUgdG8gYSBTdHJpbmdcbi8vIGN1cnJlbnRseSB3b3JrcywgYnV0IGNvbnZlcnRpbmcgYSBTdHJpbmcgdG8gYSBCdWZmZXIgKHZpYSBgbmV3IEJ1ZmZlcmAsIG9yXG4vLyBCdWZmZXIjd3JpdGUpIHdpbGwgcmVwbGFjZSBpbmNvbXBsZXRlIHN1cnJvZ2F0ZXMgd2l0aCB0aGUgdW5pY29kZVxuLy8gcmVwbGFjZW1lbnQgY2hhcmFjdGVyLiBTZWUgaHR0cHM6Ly9jb2RlcmV2aWV3LmNocm9taXVtLm9yZy8xMjExNzMwMDkvIC5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gIHZhciBjaGFyU3RyID0gJyc7XG4gIC8vIGlmIG91ciBsYXN0IHdyaXRlIGVuZGVkIHdpdGggYW4gaW5jb21wbGV0ZSBtdWx0aWJ5dGUgY2hhcmFjdGVyXG4gIHdoaWxlICh0aGlzLmNoYXJMZW5ndGgpIHtcbiAgICAvLyBkZXRlcm1pbmUgaG93IG1hbnkgcmVtYWluaW5nIGJ5dGVzIHRoaXMgYnVmZmVyIGhhcyB0byBvZmZlciBmb3IgdGhpcyBjaGFyXG4gICAgdmFyIGF2YWlsYWJsZSA9IChidWZmZXIubGVuZ3RoID49IHRoaXMuY2hhckxlbmd0aCAtIHRoaXMuY2hhclJlY2VpdmVkKSA/XG4gICAgICAgIHRoaXMuY2hhckxlbmd0aCAtIHRoaXMuY2hhclJlY2VpdmVkIDpcbiAgICAgICAgYnVmZmVyLmxlbmd0aDtcblxuICAgIC8vIGFkZCB0aGUgbmV3IGJ5dGVzIHRvIHRoZSBjaGFyIGJ1ZmZlclxuICAgIGJ1ZmZlci5jb3B5KHRoaXMuY2hhckJ1ZmZlciwgdGhpcy5jaGFyUmVjZWl2ZWQsIDAsIGF2YWlsYWJsZSk7XG4gICAgdGhpcy5jaGFyUmVjZWl2ZWQgKz0gYXZhaWxhYmxlO1xuXG4gICAgaWYgKHRoaXMuY2hhclJlY2VpdmVkIDwgdGhpcy5jaGFyTGVuZ3RoKSB7XG4gICAgICAvLyBzdGlsbCBub3QgZW5vdWdoIGNoYXJzIGluIHRoaXMgYnVmZmVyPyB3YWl0IGZvciBtb3JlIC4uLlxuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBieXRlcyBiZWxvbmdpbmcgdG8gdGhlIGN1cnJlbnQgY2hhcmFjdGVyIGZyb20gdGhlIGJ1ZmZlclxuICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZShhdmFpbGFibGUsIGJ1ZmZlci5sZW5ndGgpO1xuXG4gICAgLy8gZ2V0IHRoZSBjaGFyYWN0ZXIgdGhhdCB3YXMgc3BsaXRcbiAgICBjaGFyU3RyID0gdGhpcy5jaGFyQnVmZmVyLnNsaWNlKDAsIHRoaXMuY2hhckxlbmd0aCkudG9TdHJpbmcodGhpcy5lbmNvZGluZyk7XG5cbiAgICAvLyBDRVNVLTg6IGxlYWQgc3Vycm9nYXRlIChEODAwLURCRkYpIGlzIGFsc28gdGhlIGluY29tcGxldGUgY2hhcmFjdGVyXG4gICAgdmFyIGNoYXJDb2RlID0gY2hhclN0ci5jaGFyQ29kZUF0KGNoYXJTdHIubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGNoYXJDb2RlID49IDB4RDgwMCAmJiBjaGFyQ29kZSA8PSAweERCRkYpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCArPSB0aGlzLnN1cnJvZ2F0ZVNpemU7XG4gICAgICBjaGFyU3RyID0gJyc7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgdGhpcy5jaGFyUmVjZWl2ZWQgPSB0aGlzLmNoYXJMZW5ndGggPSAwO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIG1vcmUgYnl0ZXMgaW4gdGhpcyBidWZmZXIsIGp1c3QgZW1pdCBvdXIgY2hhclxuICAgIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gY2hhclN0cjtcbiAgICB9XG4gICAgYnJlYWs7XG4gIH1cblxuICAvLyBkZXRlcm1pbmUgYW5kIHNldCBjaGFyTGVuZ3RoIC8gY2hhclJlY2VpdmVkXG4gIHRoaXMuZGV0ZWN0SW5jb21wbGV0ZUNoYXIoYnVmZmVyKTtcblxuICB2YXIgZW5kID0gYnVmZmVyLmxlbmd0aDtcbiAgaWYgKHRoaXMuY2hhckxlbmd0aCkge1xuICAgIC8vIGJ1ZmZlciB0aGUgaW5jb21wbGV0ZSBjaGFyYWN0ZXIgYnl0ZXMgd2UgZ290XG4gICAgYnVmZmVyLmNvcHkodGhpcy5jaGFyQnVmZmVyLCAwLCBidWZmZXIubGVuZ3RoIC0gdGhpcy5jaGFyUmVjZWl2ZWQsIGVuZCk7XG4gICAgZW5kIC09IHRoaXMuY2hhclJlY2VpdmVkO1xuICB9XG5cbiAgY2hhclN0ciArPSBidWZmZXIudG9TdHJpbmcodGhpcy5lbmNvZGluZywgMCwgZW5kKTtcblxuICB2YXIgZW5kID0gY2hhclN0ci5sZW5ndGggLSAxO1xuICB2YXIgY2hhckNvZGUgPSBjaGFyU3RyLmNoYXJDb2RlQXQoZW5kKTtcbiAgLy8gQ0VTVS04OiBsZWFkIHN1cnJvZ2F0ZSAoRDgwMC1EQkZGKSBpcyBhbHNvIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlclxuICBpZiAoY2hhckNvZGUgPj0gMHhEODAwICYmIGNoYXJDb2RlIDw9IDB4REJGRikge1xuICAgIHZhciBzaXplID0gdGhpcy5zdXJyb2dhdGVTaXplO1xuICAgIHRoaXMuY2hhckxlbmd0aCArPSBzaXplO1xuICAgIHRoaXMuY2hhclJlY2VpdmVkICs9IHNpemU7XG4gICAgdGhpcy5jaGFyQnVmZmVyLmNvcHkodGhpcy5jaGFyQnVmZmVyLCBzaXplLCAwLCBzaXplKTtcbiAgICBidWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIDAsIDAsIHNpemUpO1xuICAgIHJldHVybiBjaGFyU3RyLnN1YnN0cmluZygwLCBlbmQpO1xuICB9XG5cbiAgLy8gb3IganVzdCBlbWl0IHRoZSBjaGFyU3RyXG4gIHJldHVybiBjaGFyU3RyO1xufTtcblxuLy8gZGV0ZWN0SW5jb21wbGV0ZUNoYXIgZGV0ZXJtaW5lcyBpZiB0aGVyZSBpcyBhbiBpbmNvbXBsZXRlIFVURi04IGNoYXJhY3RlciBhdFxuLy8gdGhlIGVuZCBvZiB0aGUgZ2l2ZW4gYnVmZmVyLiBJZiBzbywgaXQgc2V0cyB0aGlzLmNoYXJMZW5ndGggdG8gdGhlIGJ5dGVcbi8vIGxlbmd0aCB0aGF0IGNoYXJhY3RlciwgYW5kIHNldHMgdGhpcy5jaGFyUmVjZWl2ZWQgdG8gdGhlIG51bWJlciBvZiBieXRlc1xuLy8gdGhhdCBhcmUgYXZhaWxhYmxlIGZvciB0aGlzIGNoYXJhY3Rlci5cblN0cmluZ0RlY29kZXIucHJvdG90eXBlLmRldGVjdEluY29tcGxldGVDaGFyID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gIC8vIGRldGVybWluZSBob3cgbWFueSBieXRlcyB3ZSBoYXZlIHRvIGNoZWNrIGF0IHRoZSBlbmQgb2YgdGhpcyBidWZmZXJcbiAgdmFyIGkgPSAoYnVmZmVyLmxlbmd0aCA+PSAzKSA/IDMgOiBidWZmZXIubGVuZ3RoO1xuXG4gIC8vIEZpZ3VyZSBvdXQgaWYgb25lIG9mIHRoZSBsYXN0IGkgYnl0ZXMgb2Ygb3VyIGJ1ZmZlciBhbm5vdW5jZXMgYW5cbiAgLy8gaW5jb21wbGV0ZSBjaGFyLlxuICBmb3IgKDsgaSA+IDA7IGktLSkge1xuICAgIHZhciBjID0gYnVmZmVyW2J1ZmZlci5sZW5ndGggLSBpXTtcblxuICAgIC8vIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VURi04I0Rlc2NyaXB0aW9uXG5cbiAgICAvLyAxMTBYWFhYWFxuICAgIGlmIChpID09IDEgJiYgYyA+PiA1ID09IDB4MDYpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCA9IDI7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyAxMTEwWFhYWFxuICAgIGlmIChpIDw9IDIgJiYgYyA+PiA0ID09IDB4MEUpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCA9IDM7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyAxMTExMFhYWFxuICAgIGlmIChpIDw9IDMgJiYgYyA+PiAzID09IDB4MUUpIHtcbiAgICAgIHRoaXMuY2hhckxlbmd0aCA9IDQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgdGhpcy5jaGFyUmVjZWl2ZWQgPSBpO1xufTtcblxuU3RyaW5nRGVjb2Rlci5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gIHZhciByZXMgPSAnJztcbiAgaWYgKGJ1ZmZlciAmJiBidWZmZXIubGVuZ3RoKVxuICAgIHJlcyA9IHRoaXMud3JpdGUoYnVmZmVyKTtcblxuICBpZiAodGhpcy5jaGFyUmVjZWl2ZWQpIHtcbiAgICB2YXIgY3IgPSB0aGlzLmNoYXJSZWNlaXZlZDtcbiAgICB2YXIgYnVmID0gdGhpcy5jaGFyQnVmZmVyO1xuICAgIHZhciBlbmMgPSB0aGlzLmVuY29kaW5nO1xuICAgIHJlcyArPSBidWYuc2xpY2UoMCwgY3IpLnRvU3RyaW5nKGVuYyk7XG4gIH1cblxuICByZXR1cm4gcmVzO1xufTtcblxuZnVuY3Rpb24gcGFzc1Rocm91Z2hXcml0ZShidWZmZXIpIHtcbiAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZyh0aGlzLmVuY29kaW5nKTtcbn1cblxuZnVuY3Rpb24gdXRmMTZEZXRlY3RJbmNvbXBsZXRlQ2hhcihidWZmZXIpIHtcbiAgdGhpcy5jaGFyUmVjZWl2ZWQgPSBidWZmZXIubGVuZ3RoICUgMjtcbiAgdGhpcy5jaGFyTGVuZ3RoID0gdGhpcy5jaGFyUmVjZWl2ZWQgPyAyIDogMDtcbn1cblxuZnVuY3Rpb24gYmFzZTY0RGV0ZWN0SW5jb21wbGV0ZUNoYXIoYnVmZmVyKSB7XG4gIHRoaXMuY2hhclJlY2VpdmVkID0gYnVmZmVyLmxlbmd0aCAlIDM7XG4gIHRoaXMuY2hhckxlbmd0aCA9IHRoaXMuY2hhclJlY2VpdmVkID8gMyA6IDA7XG59XG4iLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJ1Zikge1xuXHQvLyBJZiB0aGUgYnVmZmVyIGlzIGJhY2tlZCBieSBhIFVpbnQ4QXJyYXksIGEgZmFzdGVyIHZlcnNpb24gd2lsbCB3b3JrXG5cdGlmIChidWYgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG5cdFx0Ly8gSWYgdGhlIGJ1ZmZlciBpc24ndCBhIHN1YmFycmF5LCByZXR1cm4gdGhlIHVuZGVybHlpbmcgQXJyYXlCdWZmZXJcblx0XHRpZiAoYnVmLmJ5dGVPZmZzZXQgPT09IDAgJiYgYnVmLmJ5dGVMZW5ndGggPT09IGJ1Zi5idWZmZXIuYnl0ZUxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIGJ1Zi5idWZmZXJcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBidWYuYnVmZmVyLnNsaWNlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHQvLyBPdGhlcndpc2Ugd2UgbmVlZCB0byBnZXQgYSBwcm9wZXIgY29weVxuXHRcdFx0cmV0dXJuIGJ1Zi5idWZmZXIuc2xpY2UoYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlT2Zmc2V0ICsgYnVmLmJ5dGVMZW5ndGgpXG5cdFx0fVxuXHR9XG5cblx0aWYgKEJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG5cdFx0Ly8gVGhpcyBpcyB0aGUgc2xvdyB2ZXJzaW9uIHRoYXQgd2lsbCB3b3JrIHdpdGggYW55IEJ1ZmZlclxuXHRcdC8vIGltcGxlbWVudGF0aW9uIChldmVuIGluIG9sZCBicm93c2Vycylcblx0XHR2YXIgYXJyYXlDb3B5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmxlbmd0aClcblx0XHR2YXIgbGVuID0gYnVmLmxlbmd0aFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGFycmF5Q29weVtpXSA9IGJ1ZltpXVxuXHRcdH1cblx0XHRyZXR1cm4gYXJyYXlDb3B5LmJ1ZmZlclxuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG5cdH1cbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlcHJlY2F0ZTtcblxuLyoqXG4gKiBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuICogUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbiAqXG4gKiBJZiBgbG9jYWxTdG9yYWdlLm5vRGVwcmVjYXRpb24gPSB0cnVlYCBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbiAqXG4gKiBJZiBgbG9jYWxTdG9yYWdlLnRocm93RGVwcmVjYXRpb24gPSB0cnVlYCBpcyBzZXQsIHRoZW4gZGVwcmVjYXRlZCBmdW5jdGlvbnNcbiAqIHdpbGwgdGhyb3cgYW4gRXJyb3Igd2hlbiBpbnZva2VkLlxuICpcbiAqIElmIGBsb2NhbFN0b3JhZ2UudHJhY2VEZXByZWNhdGlvbiA9IHRydWVgIGlzIHNldCwgdGhlbiBkZXByZWNhdGVkIGZ1bmN0aW9uc1xuICogd2lsbCBpbnZva2UgYGNvbnNvbGUudHJhY2UoKWAgaW5zdGVhZCBvZiBgY29uc29sZS5lcnJvcigpYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiAtIHRoZSBmdW5jdGlvbiB0byBkZXByZWNhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBtc2cgLSB0aGUgc3RyaW5nIHRvIHByaW50IHRvIHRoZSBjb25zb2xlIHdoZW4gYGZuYCBpcyBpbnZva2VkXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IGEgbmV3IFwiZGVwcmVjYXRlZFwiIHZlcnNpb24gb2YgYGZuYFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZXByZWNhdGUgKGZuLCBtc2cpIHtcbiAgaWYgKGNvbmZpZygnbm9EZXByZWNhdGlvbicpKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAoY29uZmlnKCd0aHJvd0RlcHJlY2F0aW9uJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKGNvbmZpZygndHJhY2VEZXByZWNhdGlvbicpKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn1cblxuLyoqXG4gKiBDaGVja3MgYGxvY2FsU3RvcmFnZWAgZm9yIGJvb2xlYW4gdmFsdWVzIGZvciB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvbmZpZyAobmFtZSkge1xuICAvLyBhY2Nlc3NpbmcgZ2xvYmFsLmxvY2FsU3RvcmFnZSBjYW4gdHJpZ2dlciBhIERPTUV4Y2VwdGlvbiBpbiBzYW5kYm94ZWQgaWZyYW1lc1xuICB0cnkge1xuICAgIGlmICghZ2xvYmFsLmxvY2FsU3RvcmFnZSkgcmV0dXJuIGZhbHNlO1xuICB9IGNhdGNoIChfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB2YWwgPSBnbG9iYWwubG9jYWxTdG9yYWdlW25hbWVdO1xuICBpZiAobnVsbCA9PSB2YWwpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIFN0cmluZyh2YWwpLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJztcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL2xvZ01hbmFnZXIuanMnKTtcbnZhciBodHRwID0gcmVxdWlyZSgnLi8uLi9jb21tdW5pY2F0aW9uL2h0dHBIZWxwZXInKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi8uLi9pbnRlcm5hbC91dGlsaXRpZXMnKTtcbnZhciBQYWdlSW5mbyA9IHJlcXVpcmUoJy4vLi4vY29tbW9uL3BhZ2VJbmZvJyk7XG5cbi8qKlxuICogU2FwZXJpb24gVXNlclxuICogXG4gKiBAbW9kdWxlIGFkbWluaXN0cmF0aW9uXG4gKiBAY2xhc3MgVXNlclxuICogQHR5cGUgT2JqZWN0XG4gKi9cbmZ1bmN0aW9uIFVzZXIoc2VydmljZUNvbm5lY3Rpb24sIGpzb24pIHtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gb2JqZWN0IGluaXRpYWxpemF0aW9uIGFzc2VydGlvbnNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgaWYgKCFzZXJ2aWNlQ29ubmVjdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbiBpcyBub3Qgc2V0Jyk7XG5cbiAgICBodHRwLnZhbGlkYXRlU2VydmljZUNvbm5lY3Rpb24oc2VydmljZUNvbm5lY3Rpb24pO1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBwcml2YXRlIHByb3BlcnRpZXNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgdmFyIF9pZCA9ICcnO1xuICAgIHZhciBfb2JqZWN0SWQgPSAnJztcbiAgICB2YXIgX3NlbGZVcmw7XG5cbiAgICB2YXIgX2Z1bGxOYW1lO1xuICAgIHZhciBfc2hvcnROYW1lO1xuICAgIHZhciBfZGVzY3JpcHRpb247XG4gICAgdmFyIF9lbWFpbDtcbiAgICB2YXIgX3RlbmFudElkO1xuICAgIHZhciBfZGlzdGluZ3Vpc2hlZE5hbWU7XG4gICAgdmFyIF9kZWxldGVkID0gZmFsc2U7XG4gICAgdmFyIF9sb2NrZWQgPSBmYWxzZTtcbiAgICB2YXIgX3ByZXNlbnQgPSBmYWxzZTtcbiAgICB2YXIgX3RlY2huaWNhbFVzZXIgPSBmYWxzZTtcbiAgICB2YXIgX3N5bmNocm9uaXplZFVzZXIgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIGNvbm5lY3Rpb24gd2hpY2ggaXMgdXNlZCBmb3IgY29tbXVuaWNhdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgc2VydmljZUNvbm5lY3Rpb25cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZpY2VDb25uZWN0aW9uID0gc2VydmljZUNvbm5lY3Rpb247XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIGpzb24gbWFwcGluZ1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICB2YXIgX3NlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2UoanNvbikge1xuICAgICAgICBsb2cudmVyYm9zZSgnY3JlYXRlIHVzZXIgZnJvbSBqc29uIHswfScsIEpTT04uc3RyaW5naWZ5KGpzb24pKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChqc29uICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgICAgIGlmIChqc29uLnJlZmVyZW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncHJvdmlkZWQganNvbiB3aWxsIG5vdCBtYXRjaCBlY20gc2VydmljZSBtb2RlbCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoanNvbi50eXBlICE9PSAnVVNFUicpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gdXNlciBvYmplY3QgcmVjZWl2ZWQnKTtcblxuICAgICAgICAgICAgICAgIF9pZCA9IGpzb24ucmVmZXJlbmNlLmlkIHx8IF9pZDtcbiAgICAgICAgICAgICAgICBfb2JqZWN0SWQgPSBqc29uLnJlZmVyZW5jZS5vYmplY3RJZDtcbiAgICAgICAgICAgICAgICBfc2VsZlVybCA9IGpzb24ucmVmZXJlbmNlLnNlbGY7XG5cbiAgICAgICAgICAgICAgICBfZnVsbE5hbWUgPSBqc29uLm5hbWUgfHwganNvbi5mdWxsTmFtZSB8fCBfZnVsbE5hbWU7XG4gICAgICAgICAgICAgICAgX3Nob3J0TmFtZSA9IGpzb24uc2hvcnROYW1lIHx8IF9zaG9ydE5hbWU7XG4gICAgICAgICAgICAgICAgX2Rlc2NyaXB0aW9uID0ganNvbi5kZXNjcmlwdGlvbiB8fCBfZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgX2Rpc3Rpbmd1aXNoZWROYW1lID0ganNvbi5kaXN0aW5ndWlzaGVkTmFtZSB8fCBfZGlzdGluZ3Vpc2hlZE5hbWU7XG4gICAgICAgICAgICAgICAgX2VtYWlsID0ganNvbi5lbWFpbEFkZHJlc3MgfHwgX2VtYWlsO1xuICAgICAgICAgICAgICAgIC8vX2d1aWQgPSBqc29uLmd1aWQgfHwgX2d1aWQ7XG5cbiAgICAgICAgICAgICAgICBfdGVjaG5pY2FsVXNlciA9IGpzb24udGVjaG5pY2FsVXNlciB8fCBfdGVjaG5pY2FsVXNlcjtcbiAgICAgICAgICAgICAgICBfc3luY2hyb25pemVkVXNlciA9IGpzb24uc3luY2hyb25pemVkVXNlciB8fCBfc3luY2hyb25pemVkVXNlcjtcbiAgICAgICAgICAgICAgICBfbG9ja2VkID0ganNvbi5sb2NrZWQgfHwgX2xvY2tlZDtcbiAgICAgICAgICAgICAgICBfZGVsZXRlZCA9IGpzb24uZGVsZXRlZCB8fCBfZGVsZXRlZDtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nLmVycm9yKCdtZXJnZSBlcnJvciBmb3IgdXNlcjogezB9JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lcmdlKGpzb24pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogbWVyZ2UgYSBqc29uIG9iamVjdCB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlLlxuICAgICAqIGludGVybmFseSB1c2VkIGZvciB1cGRhdGVzIGZyb20gc2VydmljZVxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcm9wZXJ0eSBtZXJnZVxuICAgICAqL1xuICAgIHRoaXMubWVyZ2UgPSBtZXJnZTtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gZ2V0dGVyIGFuZCBzZXR0ZXJcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgLyoqXG4gICAgICogdHlwZWQgaWRlbnRpZmllciBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdElkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBpZCBvZiB0aGUgZWxlbWVudCBpbiB0aGUgc2FwZXJpb24gYmFja2VuZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgc2FwZXJpb25JZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc2FwZXJpb25JZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2lkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JlZmVyZW5jZVVybCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NlbGZVcmw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIGZ1bGxOYW1lIG9mIHRoZSB1c2VyXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBkZXNjcmlwdGlvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZnVsbE5hbWUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9mdWxsTmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX2Z1bGxOYW1lID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogc2hvcnROYW1lIG9mIHRoZSB1c2VyXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBkZXNjcmlwdGlvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc2hvcnROYW1lJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2hvcnROYW1lO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBfc2hvcnROYW1lID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogZGlzdGluZ3Vpc2hlZCBOYW1lIG9mIHRoZSB1c2VyXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBkaXN0aW5ndWlzaGVkTmFtZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZGlzdGluZ3Vpc2hlZE5hbWUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9kaXN0aW5ndWlzaGVkTmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX2Rpc3Rpbmd1aXNoZWROYW1lID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvKipcbiAgICAgKiBkZXNjcmlwdGlvbiBvZiB0aGUgdXNlclxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgZGVzY3JpcHRpb25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2Rlc2NyaXB0aW9uJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfZGVzY3JpcHRpb247XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF9kZXNjcmlwdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIGVtYWlsIGFkZHJlc3Mgb2YgdGhlIHVzZXJcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGVtYWlsXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdlbWFpbCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2VtYWlsO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBfZW1haWwgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YWx1ZSBpcyBub3QgZGVmaW5lZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiB0cnVlIGlmIHRlY2huaWNhbCB1c2VyXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpc1RlY2huaWNhbFVzZXJcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzVGVjaG5pY2FsVXNlcicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RlY2huaWNhbFVzZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF90ZWNobmljYWxVc2VyID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIHRydWUgaWYgc3luY2VkXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpc1N5bmNocm9uaXplZFVzZXJcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzU3luY2hyb25pemVkVXNlcicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3N5bmNocm9uaXplZFVzZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF9zeW5jaHJvbml6ZWRVc2VyID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdHJ1ZSBpZiBkZWxldGVkXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpc0RlbGV0ZWRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzRGVsZXRlZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2RlbGV0ZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF9kZWxldGVkID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdHJ1ZSBpZiBsb2NrZWRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlzTG9ja2VkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpc0xvY2tlZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2xvY2tlZDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX2xvY2tlZCA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIGZhbHNlIGlmIHRoaXMgdGFzayBjb250YWlucyBvbmx5IGEgcmVkdWNlZCBzZXQgb2YgZGF0YSAoc3BlY2lmaWVkIGJ5IHRoZSBzZXJ2aWNlIGNvbGxlY3Rpb25zKVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgaXNSZWR1Y2VkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpc1JlZHVjZWQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfc2hvcnROYW1lID09PSB1bmRlZmluZWQgJiYgX2VtYWlsID09PSB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0gLy9lbmQgY29uc3RydWN0b3JcblxuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuLy8gaW5zdGFuY2UgZnVuY3Rpb25zXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4vL2ludGVybmFsIHVzZWQgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGFjdG9yIHJlZmVyZW5jZVxuVXNlci5wcm90b3R5cGUudG9TZXJ2aWNlQWN0b3JSZWZlcmVuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIHR5cGU6ICdVU0VSJ1xuICAgIH07XG59O1xuXG5Vc2VyLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xufTtcblxuVXNlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJldCA9IHRoaXMuZnVsbE5hbWU7XG4gICAgaWYgKCF0aGlzLmlzUmVkdWNlZClcbiAgICAgICAgcmV0ICs9ICcgKCcgKyB0aGlzLnNob3J0TmFtZSArICcpJztcbiAgICBlbHNlIHJldCArPSAnIC0gcmVkdWNlZCAtJztcbiAgICByZXR1cm4gcmV0O1xufTtcblxuVXNlci5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZm5OYW1lID0gJ1VzZXIucmVmcmVzaCc7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGZuTmFtZSk7XG4gICAgICAgICAgICBodHRwLmdldEpzb24oc2VsZi5zZXJ2aWNlQ29ubmVjdGlvbiwgKHNlbGYucmVmZXJlbmNlVXJsKSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgncmVjZWl2ZWQgdXNlcjogezB9JywganNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5tZXJnZShqc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vIHN0YXRpYyBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cblxuLyoqXG4gKiBEZXNjcmlwdGlvbiBmb3IgZ2V0VXNlcnNcbiAqIEBwcml2YXRlXG4gKiBAbWV0aG9kIGdldFVzZXJzXG4gKiBAcGFyYW0ge09iamVjdH0gc2VydmljZUNvbm5lY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWdlICAtIDEgaXMgZGVmYXVsdFxuICogQHBhcmFtIHtPYmplY3R9IHF1ZXJ5IC0gb3B0aW9uYWwgcXVlcnkgZm9yIGZpbHRlcmluZyB1c2VycyAoc2VlIHNlcnZpY2UgZG9jdW1lbnRhdGlvbilcbiAqIEByZXR1cm4ge09iamVjdH0gY29sbGVjdGlvbiBvZiB1c2VycyBvcyBwYWdlaW5mb1xuICovXG5Vc2VyLmdldFVzZXJzID0gZnVuY3Rpb24gKHNlcnZpY2VDb25uZWN0aW9uLCBwYWdlLCBkZXRhaWxlZCwgcXVlcnkpIHtcbiAgICAvL2RvYzogaHR0cHM6Ly9lY20tc2VydmljZS5wc2Z0LmNvL2VjbXMvcmVzb3VyY2VfVXNlck1hbmFnZW1lbnRSZXNvdXJjZS5odG1sXG4gICAgdmFyIGZuTmFtZSA9ICdVc2VyLmdldFVzZXJzJztcbiAgICBpZiAocGFnZSA9PT0gdW5kZWZpbmVkKSBwYWdlID0gMTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuaW5mbyhmbk5hbWUpO1xuICAgICAgICAgICAgaHR0cC5nZXRKc29uKHNlcnZpY2VDb25uZWN0aW9uLCBodHRwLmVuZHBvaW50cy5tYW5hZ2VtZW50LnVzZXJzLmFsbCArIChxdWVyeSB8fCAnJyksIHBhZ2UpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWpzb24uaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLnZlcmJvc2UoJ3JlY2VpdmVkIGRhdGE6IHswfScsIEpTT04uc3RyaW5naWZ5KGpzb24pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8gaXRlbXMgY29sbGVjdGlvbiByZWNlaXZlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9taXNlQ29sbGVjdGlvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1c2VyQ29sbGVjdGlvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAodXNlckpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVzZXIgPSBuZXcgVXNlcihzZXJ2aWNlQ29ubmVjdGlvbiwgdXNlckpzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyQ29sbGVjdGlvbi5wdXNoKHVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV0YWlsZWQpIHByb21pc2VDb2xsZWN0aW9uLnB1c2godXNlci5yZWZyZXNoKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZUNvbGxlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXRhaWxlZFVzZXJDb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB1c2VyQ29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlSW5mbzogbmV3IFBhZ2VJbmZvKGpzb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblVzZXIuZ2V0VXNlckJ5TmFtZSA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgdXNlck5hbWUpIHtcbiAgICAvL2RvYzogaHR0cHM6Ly9lY20tc2VydmljZS5wc2Z0LmNvL2VjbXMvcmVzb3VyY2VfVXNlck1hbmFnZW1lbnRSZXNvdXJjZS5odG1sXG4gICAgdmFyIGZuTmFtZSA9ICdVc2VyLmdldFVzZXJCeU5hbWUnO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuaW5mbyhmbk5hbWUpO1xuICAgICAgICAgICAgaHR0cC5nZXRKc29uKHNlcnZpY2VDb25uZWN0aW9uLCAoaHR0cC5lbmRwb2ludHMubWFuYWdlbWVudC51c2Vycy5ieVNob3J0TmFtZSkucmVwbGFjZSgne3VzZXJOYW1lfScsIHVzZXJOYW1lKSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgncmVjZWl2ZWQgdXNlcjogezB9JywganNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy92YWxpZGF0ZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnR5cGUgIT09ICdVU0VSJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8gdXNlciBvYmplY3QgcmVjZWl2ZWQnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVzZXIgPSBuZXcgVXNlcihzZXJ2aWNlQ29ubmVjdGlvbiwganNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzcyh1c2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJySHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJJbml0KTtcbiAgICAgICAgICAgIGZhaWxlZChlcnJJbml0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuVXNlci5nZXRVc2VyQnlJZCA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgdXNlcklkKSB7XG4gICAgLy9kb2M6IGh0dHBzOi8vZWNtLXNlcnZpY2UucHNmdC5jby9lY21zL3Jlc291cmNlX1VzZXJNYW5hZ2VtZW50UmVzb3VyY2UuaHRtbFxuICAgIHZhciBmbk5hbWUgPSAnVXNlci5nZXRVc2VyQnlJZCc7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGZuTmFtZSk7XG4gICAgICAgICAgICBodHRwLmdldEpzb24oc2VydmljZUNvbm5lY3Rpb24sIChodHRwLmVuZHBvaW50cy5tYW5hZ2VtZW50LnVzZXJzLmJ5SWQpLnJlcGxhY2UoJ3tpZH0nLCB1c2VySWQpKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy52ZXJib3NlKCdyZWNlaXZlZCB1c2VyOiB7MH0nLCBqc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3ZhbGlkYXRlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24udHlwZSAhPT0gJ1VTRVInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQobmV3IEVycm9yKCdubyB1c2VyIG9iamVjdCByZWNlaXZlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXNlciA9IG5ldyBVc2VyKHNlcnZpY2VDb25uZWN0aW9uLCBqc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKHVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBVc2VyID0gcmVxdWlyZSgnLi91c2VyJyk7XG5cbi8qKlxuICogU2FwZXJpb24gVXNlciBNYW5hZ2Vyd2hpY2ggcHJvdmlkZXMgYWNjZXNzIHRvIHVzZXIgcmVsYXRlZCBmdW5jdGlvbnMgYW5kIG9iamVjdHMuXG4gKiBcbiAqIEBtb2R1bGUgYWRtaW5pc3RyYXRpb25cbiAqIEBjbGFzcyBVc2VyTWFuYWdlclxuICogQHR5cGUgT2JqZWN0XG4gKi9cbmZ1bmN0aW9uIFVzZXJNYW5hZ2VyKHNlcnZpY2VDb25uZWN0aW9uKSB7XG4gICAgaWYgKCFzZXJ2aWNlQ29ubmVjdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbiBpcyBub3Qgc2V0Jyk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NlcnZpY2VDb25uZWN0aW9uJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlQ29ubmVjdGlvbjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vL1VzZXJNYW5hZ2VyLlVzZXIgPSBVc2VyO1xuXG5Vc2VyTWFuYWdlci5wcm90b3R5cGUuZ2V0QWxsVXNlcnMgPSBmdW5jdGlvbiAocGFnZSkge1xuICAgIHJldHVybiBVc2VyLmdldFVzZXJzKHRoaXMuc2VydmljZUNvbm5lY3Rpb24sIHBhZ2UsIGZhbHNlKTtcbn07XG5cblVzZXJNYW5hZ2VyLnByb3RvdHlwZS5nZXRBbGxVc2Vyc0RldGFpbGVkID0gZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICByZXR1cm4gVXNlci5nZXRVc2Vycyh0aGlzLnNlcnZpY2VDb25uZWN0aW9uLCBwYWdlLCB0cnVlKTtcbn07XG5cblVzZXJNYW5hZ2VyLnByb3RvdHlwZS5nZXRVc2VyQnlJZCA9IGZ1bmN0aW9uICh1c2VySWQpIHtcbiAgICByZXR1cm4gVXNlci5nZXRVc2VyQnlJZCh0aGlzLnNlcnZpY2VDb25uZWN0aW9uLCB1c2VySWQpO1xufTtcblxuVXNlck1hbmFnZXIucHJvdG90eXBlLmdldFVzZXJCeU5hbWUgPSBmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICByZXR1cm4gVXNlci5nZXRVc2VyQnlOYW1lKHRoaXMuc2VydmljZUNvbm5lY3Rpb24sIHVzZXJOYW1lKTtcbn07XG5cblVzZXJNYW5hZ2VyLnByb3RvdHlwZS5nZXRVc2VyQnlTaG9ydE5hbWUgPSBmdW5jdGlvbiAoc2hvcnROYW1lKSB7XG4gICAgcmV0dXJuIFVzZXIuZ2V0VXNlckJ5U2hvcnROYW1lKHRoaXMuc2VydmljZUNvbm5lY3Rpb24sIHNob3J0TmFtZSk7XG59O1xuXG5Vc2VyTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFVzZXIodGhpcy5zZXJ2aWNlQ29ubmVjdGlvbik7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVXNlck1hbmFnZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXNlciA9IHJlcXVpcmUoJy4vLi4vYWRtaW5pc3RyYXRpb24vdXNlcicpO1xuXG4vKipcbiAqIENvbnRhaW5zIGEgYWJzdHJhY3Rpb24gb2YgdGhlIFNhcGVyaW9uIE93bmVyIEluZm9ybWF0aW9uIGFuZCBoZWxwZXIgZnVuY3Rpb25zIHRvIGFjY2VzcyB0aGVtXG4gKiBcbiAqIEBtb2R1bGUgc2RrLmNvbW1vblxuICogQGNsYXNzIE93bmVyXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuXG5mdW5jdGlvbiBBY3RvclJlZmVyZW5jZShzZXJ2aWNlQ29ubmVjdGlvbiwganNvbikge1xuXG4gICAgLy9UT0RPIHZhbGlkYXRlIGNvbm5lY3Rpb24gb2JqZWN0IGluc3RhbmNlXG4gICAgaWYgKHNlcnZpY2VDb25uZWN0aW9uID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignbWlzc2luZyBjb25uZWN0aW9uIHBhcmFtZXRlcicpO1xuXG4gICAgLy9uZWNlc3NhcnkgdG8gZ2V0IHVzZXIgb3IgZ3JvdXAgb2JqZWN0IGluc3RhbmNlc1xuICAgIC8qKlxuICAgICAqIGNvbm5lY3Rpb24gd2hpY2ggaXMgdXNlZCBmb3IgY29tbXVuaWNhdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgc2VydmljZUNvbm5lY3Rpb25cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZpY2VDb25uZWN0aW9uID0gc2VydmljZUNvbm5lY3Rpb247XG5cbiAgICB2YXIgX2lkID0gJyc7XG4gICAgdmFyIF9vYmplY3RJZCA9ICcnO1xuICAgIHZhciBfb2JqZWN0VXJsID0gJyc7XG4gICAgdmFyIF90eXBlID0gJyc7XG4gICAgdmFyIF9uYW1lID0gJyc7XG5cbiAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgX2lkID0ganNvbi5pZCB8fCBfaWQ7XG4gICAgICAgIF9vYmplY3RJZCA9IGpzb24ub2JqZWN0SWQgfHwgX29iamVjdElkO1xuICAgICAgICBfb2JqZWN0VXJsID0ganNvbi5zZWxmIHx8IF9vYmplY3RVcmw7XG4gICAgICAgIF90eXBlID0ganNvbi50eXBlIHx8IF90eXBlO1xuICAgICAgICBfbmFtZSA9IGpzb24ubmFtZSB8fCBfbmFtZTtcblxuICAgICAgICBpZiAoanNvbi5yZWZlcmVuY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgX2lkID0ganNvbi5yZWZlcmVuY2UuaWQgfHwgX2lkO1xuICAgICAgICAgICAgX29iamVjdElkID0ganNvbi5yZWZlcmVuY2Uub2JqZWN0SWQgfHwgX29iamVjdElkO1xuICAgICAgICAgICAgX3R5cGUgPSBqc29uLnJlZmVyZW5jZS50eXBlIHx8IF90eXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaWQgb2YgdGhlIG93bmVyXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBwYWdlXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2lkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBzYXBlcmlvbiBvYmplY3QgcmVmZXJlbmNlIFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgcGFnZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnb2JqZWN0SWQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9vYmplY3RJZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdHlwZSBvZiB0aGUgb3duZXIgKGdyb3VwIG9yIHVzZXIpXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSB0eXBlXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0eXBlJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdHlwZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogbmFtZSBvZiB0aGUgb3duZXIsIGNhbiBiZSBlbXB0eVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgbmFtZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbmFtZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX25hbWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuQWN0b3JSZWZlcmVuY2UucHJvdG90eXBlLmlzVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMudHlwZSA9PT0gJ1VTRVInKTtcbn07XG5cbkFjdG9yUmVmZXJlbmNlLnByb3RvdHlwZS5pc0dyb3VwID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy50eXBlID09PSAnR1JPVVAnKTtcbn07XG5cbi8qKlxuICogcmV0dXJuIGEgcHJvbWlzIHdoaWNoIGNvbnRhaW5zIGEgb2JqZWN0IG9mIHR5cGUgdXNlciBvciBncm91cCB3aXRoIGRldGFpbGVkIG93bmVyIGluZm9ybWF0aW9uXG4gKiBAcHVibGljXG4gKiBAcHJvcGVydHkgcGFnZVxuICovXG5BY3RvclJlZmVyZW5jZS5wcm90b3R5cGUuZ2V0RGV0YWlscyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc1VzZXIpIHtcbiAgICAgICAgcmV0dXJuIFVzZXIuZ2V0VXNlckJ5SWQodGhpcy5zZXJ2aWNlQ29ubmVjdGlvbiwgdGhpcy5pZCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbCkge1xuICAgICAgICBpZiAodGhpcy5pc0dyb3VwKCkpIHtcbiAgICAgICAgICAgIC8vVE9ETyBpbnN0YW5jaWF0ZSBhIGdyb3VwIG9iamVjdCBhbmQgcmVhZCB0aGUgZWxlbWVudFxuICAgICAgICAgICAgc3VjY2Vzcyh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2FkbWluaXN0cmF0b3JzJyxcbiAgICAgICAgICAgICAgICBpc01vY2tlZDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmYWlsKCd1bnN1cHBvcnRlZCBvd25lciB0eXBlICcgKyB0aGlzLnR5cGUpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5BY3RvclJlZmVyZW5jZS5wcm90b3R5cGUudG9TZXJ2aWNlQWN0b3JSZWZlcmVuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgIHR5cGU6IHRoaXMudHlwZVxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdG9yUmVmZXJlbmNlOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb250YWlucyByZXN1bHQgaW5mb3JtYXRpb24gYWJvdXQgYXZhaWxhYmxlIHBhZ2VzXG4gKiBcbiAqIEBtb2R1bGUgc2RrXG4gKiBAY2xhc3MgUGFnZUluZm9cbiAqIEB0eXBlIE9iamVjdFxuICovXG5cbmZ1bmN0aW9uIFBhZ2VJbmZvKGpzb24pIHtcblxuICAgIHZhciBfcGFnZSA9IDE7XG4gICAgdmFyIF9wYWdlU2l6ZSA9IDA7XG4gICAgdmFyIF9oYXNNb3JlSXRlbXMgPSBmYWxzZTtcblxuICAgIGlmIChqc29uICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICBfcGFnZSA9IGpzb24ubnVtYmVyIHx8IF9wYWdlO1xuICAgICAgICBpZiAoanNvbi5wYWdlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfcGFnZVNpemUgPSBqc29uLnBhZ2VEZWZpbml0aW9uLnBhZ2VTaXplIHx8IF9wYWdlU2l6ZTtcbiAgICAgICAgICAgIHZhciBwYWdlT2Zmc2V0ID0ganNvbi5wYWdlRGVmaW5pdGlvbi5vZmZzZXQgfHwgMDtcbiAgICAgICAgICAgIGlmIChfcGFnZVNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgX3BhZ2UgPSBNYXRoLnJvdW5kKHBhZ2VPZmZzZXQgLyBfcGFnZVNpemUpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfaGFzTW9yZUl0ZW1zID0ganNvbi5oYXNNb3JlSXRlbXMgfHwgX2hhc01vcmVJdGVtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBudW1iZXIgb2YgdGhlIGN1cnJlbnQgcGFnZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgcGFnZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncGFnZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3BhZ2U7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIG51bWJlciBvZiBlbGVtZW50cyBwZXIgcGFnZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgcGFnZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncGFnZVNpemUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9wYWdlU2l6ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogaW5kaWNhdG9yIHRoYXQgdGhlcmUgYXJlIG1vcmUgZWxlbWVudHMgYXZhaWxhYmxlIG9uIHRoZSBzZXJ2aWNlXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBwYWdlXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdoYXNNb3JlSXRlbXMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9oYXNNb3JlSXRlbXM7XG4gICAgICAgIH1cbiAgICB9KTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2VJbmZvOyIsIid1c2Ugc3RyaWN0J1xudmFyIGxvZyA9IHJlcXVpcmUoJy4vLi4vaW50ZXJuYWwvbG9nTWFuYWdlci5qcycpO1xuXG4vKipcbiAqIFRva2VuIG9iamVjdCB3aGljaCBjb250YWlucyBhdXRoZW50aWNhdGlvbiByZWxhdGVkIGRhdGEuXG4gKiBUaGlzIG9iamVjdCBpcyB1c2VkIGJ5IHRoZSBUb2tlbkF1dGhQcm92aWRlciBhbmQgdGhlIENyZWRlbnRpYWxBdXRoUHJvdmlkZXIgdG8gc3RvcmUgdGhlIHZhbGlkYXRlZCBsb2dpbiBkYXRhe3sjY3Jvc3NMaW5rIFwiQmFzaWNBdXRoUHJvdmlkZXJcIn19e3svY3Jvc3NMaW5rfX0uXG4gKlxuICogQG1vZHVsZSBjb21tdW5pY2F0aW9uXG4gKiBAY2xhc3MgQXV0aFRva2VuXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuZnVuY3Rpb24gQXV0aGVudGljYXRpb25Ub2tlbihzZXJ2aWNlVG9rZW4pIHtcblxuICAgIGlmIChzZXJ2aWNlVG9rZW4gPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCd1bmFibGUgdG8gY3JlYXRlIGluc3RhbmNlIG9mIEF1dGhlbnRpY2F0aW9uVG9rZW4gd2l0aG91dCBqc29uJyk7XG4gICAgaWYgKHNlcnZpY2VUb2tlbi50b2tlbiA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ3NlcnZpY2UgdG9rZW4gaXMgaW52YWxpZC4gdG9rZW4gcGFydCBpcyBtaXNzaW5nLicpO1xuXG4gICAgLy91c2VkIGJ5IG91ciBzZXJpYWxpemF0aW9uXG4gICAgdmFyIHZhbGlkVW50aWwgPSBzZXJ2aWNlVG9rZW4uZXhwaXJlc0F0IHx8IG5ldyBEYXRlKCk7XG4gICAgdmFyIHJlZnJlc2hBdCA9IHNlcnZpY2VUb2tlbi5yZWZyZXNoQXQgfHwgbmV3IERhdGUoKTtcblxuICAgIGlmIChzZXJ2aWNlVG9rZW4uZXhwaXJlc0luKSB7XG4gICAgICAgIHZhbGlkVW50aWwgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB2YWxpZFVudGlsLnNldFNlY29uZHModmFsaWRVbnRpbC5nZXRTZWNvbmRzKCkgKyBzZXJ2aWNlVG9rZW4uZXhwaXJlc0luKTtcbiAgICAgICAgcmVmcmVzaEF0LnNldFNlY29uZHMocmVmcmVzaEF0LmdldFNlY29uZHMoKSArIChzZXJ2aWNlVG9rZW4uZXhwaXJlc0luICogMC43NSkpO1xuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndG9rZW4nLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbi50b2tlbjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdleHBpcmVzQXQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbGlkVW50aWw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVmcmVzaEF0Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiByZWZyZXNoQXQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vdG9rZW4gaXMgZXhwaXJlZCBhbmQgbm90IGxvbmdlciB1c2FibGVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzRXhwaXJlZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsaWRVbnRpbCA8IERhdGUubm93O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2luZGljYXRvciB0aGF0IHRoZSB0b2tlbiBzaG91ZGwgYmUgcmVmcmVzaGVkXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICduZWVkc1JlZnJlc2gnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlZnJlc2hBdCA8IERhdGUubm93O1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbkF1dGhlbnRpY2F0aW9uVG9rZW4ucHJvdG90eXBlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbyA9IHtcbiAgICAgICAgdG9rZW46IHRoaXMudG9rZW4sXG4gICAgICAgIGV4cGlyZXNBdDogdGhpcy5leHBpcmVzQXQsXG4gICAgICAgIHJlZnJlc2hBdDogdGhpcy5yZWZyZXNoQXRcbiAgICB9O1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvKTtcbn07XG5cbkF1dGhlbnRpY2F0aW9uVG9rZW4ucHJvdG90eXBlLnRvSnNvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJpYWxpemUoKTtcbn07XG5cbkF1dGhlbnRpY2F0aW9uVG9rZW4uZGVzZXJpYWxpemUgPSBmdW5jdGlvbiAoc2VyaWFsaXplZERhdGEpIHtcbiAgICB2YXIgbyA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZERhdGEpO1xuICAgIHJldHVybiBuZXcgQXV0aGVudGljYXRpb25Ub2tlbihvKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0aGVudGljYXRpb25Ub2tlbjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL2xvZ01hbmFnZXIuanMnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi8uLi9pbnRlcm5hbC91dGlsaXRpZXMnKTsgLy9iYXNlIDY0IGVuY29kaW5nXG5cbnZhciBBdXRoZW50aWNhdGlvblRva2VuID0gcmVxdWlyZSgnLi9hdXRoZW50aWNhdGlvblRva2VuJyk7XG52YXIgVG9rZW5BdXRoUHJvdmlkZXIgPSByZXF1aXJlKCcuL3Rva2VuQXV0aFByb3ZpZGVyJyk7XG5cbnZhciBVc2VyID0gcmVxdWlyZSgnLi8uLi9hZG1pbmlzdHJhdGlvbi91c2VyJyk7XG5cbnZhciBodHRwID0gcmVxdWlyZSgnLi9odHRwSGVscGVyJyk7XG5cbi8qKlxuICogQ3JlZGVudGlhbCBPYmplY3Qgd2hpY2ggb3JnYW5pemluZyBsb2dpbiByZWxhdGVkIGRhdGFcbiAqIGF1dGhlbnRpY2F0aW9uIHByb3ZpZGVyLiBEZWZhdWx0IGF1dGhlbnRpY2F0aW9uIHByb3ZpZGVyIGlzIHt7I2Nyb3NzTGluayBcIkJhc2ljQXV0aFByb3ZpZGVyXCJ9fXt7L2Nyb3NzTGlua319LlxuICogXG4gKiBAbW9kdWxlIGNvbW11bmljYXRpb25cbiAqIEBjbGFzcyBhdXRoZW50aWNhdGlvbk1hbmFnZXJcbiAqIEB0eXBlIE9iamVjdFxuICovXG5mdW5jdGlvbiBDcmVkZW50aWFsQXV0aFByb3ZpZGVyKGF1dGhTZXJ2aWNlVXJsLCB1c2VyLCBwYXNzLCBsaWNlbnNlLCB0ZW5hbnQpIHtcblxuICAgIGlmICghYXV0aFNlcnZpY2VVcmwpIHRocm93IG5ldyBFcnJvcigncGFyYW1ldGVyIGF1dGhTZXJ2aWNlVXJsIGlzIG1pc3NpbmcnKTtcbiAgICBpZiAoIXVzZXIpIHRocm93IG5ldyBFcnJvcigncGFyYW1ldGVyIHVzZXIgaXMgbWlzc2luZycpO1xuICAgIGlmICghcGFzcykgdGhyb3cgbmV3IEVycm9yKCdwYXJhbWV0ZXIgcGFzcyBpcyBtaXNzaW5nJyk7XG4gICAgaWYgKCF0ZW5hbnQpIHRlbmFudCA9ICdTWVNURU0nOyAvL3Rocm93IG5ldyBFcnJvcigncGFyYW1ldGVyIHRlbmFudCBpcyBtaXNzaW5nJyk7XG4gICAgaWYgKCFsaWNlbnNlKSBsaWNlbnNlID0gJ2luZGV4JzsgLy90aHJvdyBuZXcgRXJyb3IoJ3BhcmFtZXRlciBsaWNlbnNlIGlzIG1pc3NpbmcnKTtcblxuXG4gICAgdmFyIF9saWNlbnNlSWQgPSAwO1xuICAgIC8vSW5mbzogSUUxMSBhbmQgUGhhbnRvbUpTIGFyZSBub3Qgc3VwcG9ydGluZyBOdW1iZXIuaXNJbnRlZ2VyXG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoTnVtYmVyLmlzSW50ZWdlcihsaWNlbnNlKSkge1xuICAgICAgICAgICAgX2xpY2Vuc2VJZCA9IGxpY2Vuc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKF9saWNlbnNlSWQgPT09IDApIHtcbiAgICAgICAgc3dpdGNoIChsaWNlbnNlKSB7XG4gICAgICAgIGNhc2UgJ2FkbWluJzpcbiAgICAgICAgY2FzZSAnMyc6XG4gICAgICAgICAgICBfbGljZW5zZUlkID0gMztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdxdWVyeSc6XG4gICAgICAgIGNhc2UgJzInOlxuICAgICAgICAgICAgX2xpY2Vuc2VJZCA9IDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaW5kZXgnOlxuICAgICAgICBjYXNlICcxJzpcbiAgICAgICAgICAgIF9saWNlbnNlSWQgPSAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKF9saWNlbnNlSWQgPCAxIHx8IF9saWNlbnNlSWQgPiAzKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgbGljZW5zZS4gXCInICsgbGljZW5zZSArICdcIiBpcyBub3QgYWxsb3dlZC4gUGxlYXNlIHVzZSBvbmUgb2YgdGhlc2U6IFxcbicgKyBKU09OLnN0cmluZ2lmeShDcmVkZW50aWFsQXV0aFByb3ZpZGVyLmxpY2Vuc2VzLCBudWxsLCAyKSk7XG5cbiAgICB2YXIgX3Rva2VuQXV0aFByb3ZpZGVyO1xuICAgIHZhciBfYXV0aEhlYWRlciA9ICdCYXNpYyAnICsgdXRpbC50b0Jhc2U2NCh1c2VyICsgJzonICsgcGFzcyk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2F1dGhTZXJ2aWNlVXJsJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhdXRoU2VydmljZVVybDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdfaW5uZXJBdXRoUHJvdmlkZXInLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90b2tlbkF1dGhQcm92aWRlcjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fYXBwbHlOZXdUb2tlbiA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICBsb2cuaW5mbygnQ3JlZGVudGlhbEF1dGhQcm92aWRlci5fYXBwbHlOZXdUb2tlbicpO1xuICAgICAgICBfdG9rZW5BdXRoUHJvdmlkZXIgPSBuZXcgVG9rZW5BdXRoUHJvdmlkZXIoYXV0aFNlcnZpY2VVcmwsIHRva2VuKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBpbmplY3RzIHRoZSBuZWNlc3NhcnkgaGVhZGVycyBmb3IgYXV0aGVudGljYXRpb24gdG8gYSBYSFIgLyBIdHRwIFJlcXVlc3QgT2JqZWN0XG4gICAgICogQG1ldGhvZCBwcmVwYXJlQXV0aGVudGljYXRpb25cbiAgICAgKi9cbiAgICB0aGlzLmFwcGx5QXV0aGVudGljYXRpb24gPSBmdW5jdGlvbiAoaHR0cFJlcXVlc3QpIHtcbiAgICAgICAgaWYgKF90b2tlbkF1dGhQcm92aWRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfdG9rZW5BdXRoUHJvdmlkZXIuYXBwbHlBdXRoZW50aWNhdGlvbihodHRwUmVxdWVzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2cuaW5mbygnQ3JlZGVudGlhbEF1dGhQcm92aWRlci5hcHBseUF1dGhlbnRpY2F0aW9uJyk7XG4gICAgICAgICAgICBodHRwUmVxdWVzdC5zZXRIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBfYXV0aEhlYWRlcik7XG4gICAgICAgICAgICBodHRwUmVxdWVzdC5zZXRIZWFkZXIoJ1gtRUNNLUxpY2Vuc2VUeXBlJywgX2xpY2Vuc2VJZCk7XG4gICAgICAgICAgICBodHRwUmVxdWVzdC5zZXRIZWFkZXIoJ1gtRUNNLVRlbmFudCcsIHRlbmFudCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG4vKipcbiAqIExpc3Qgb2Ygc3VwcG9ydGVkIGxpY2Vuc2VzXG4gKiBAc3RhdGljXG4gKiBAcHJvcGVydHkgbGljZW5zZXNcbiAqL1xuQ3JlZGVudGlhbEF1dGhQcm92aWRlci5saWNlbnNlcyA9IHtcbiAgICBhZG1pbjogMyxcbiAgICBxdWVyeTogMixcbiAgICBpbmRleDogMVxufTtcblxuT2JqZWN0LmZyZWV6ZShDcmVkZW50aWFsQXV0aFByb3ZpZGVyLmxpY2Vuc2VzKTtcblxuQ3JlZGVudGlhbEF1dGhQcm92aWRlci5wcm90b3R5cGUuZ2V0VG9rZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgbG9nLmluZm8oJ0NyZWRlbnRpYWxBdXRoUHJvdmlkZXIuZ2V0VG9rZW4nKTtcblxuICAgIGlmICh0aGlzLl9pbm5lckF1dGhQcm92aWRlciAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5faW5uZXJBdXRoUHJvdmlkZXIuZ2V0VG9rZW4oKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWxlZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaHR0cC5leGVjdXRlSHR0cENhbGwoc2VsZi5hdXRoU2VydmljZVVybCwgaHR0cC5lbmRwb2ludHMuYXV0aC50b2tlbi5nZW5lcmF0ZSwgJ0dFVCcsIG51bGwsIGZhbHNlLCBzZWxmLmFwcGx5QXV0aGVudGljYXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy92YWxpZGF0ZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghanNvbi50b2tlbiB8fCAhanNvbi5leHBpcmVzSW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChuZXcgRXJyb3IoJ25vIHRva2VuIHJlY2VpdmVkLCBsb2dpbiBmYWlsZWQnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRva2VuID0gbmV3IEF1dGhlbnRpY2F0aW9uVG9rZW4oanNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fYXBwbHlOZXdUb2tlbih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzcyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuQ3JlZGVudGlhbEF1dGhQcm92aWRlci5wcm90b3R5cGUudmFsaWRhdGVUb2tlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBsb2cuaW5mbygnQ3JlZGVudGlhbEF1dGhQcm92aWRlci52YWxpZGF0ZVRva2VuJyk7XG4gICAgaWYgKHRoaXMuX2lubmVyQXV0aFByb3ZpZGVyICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLl9pbm5lckF1dGhQcm92aWRlci52YWxpZGF0ZVRva2VuKCk7XG5cbiAgICAvL3RoZSB2YWxpZGl0eSBjYWxsIGV4cGVjdCBhIEpTT04gV2ViIFRva2VuLCBzbyBpdCBjYW4gYmUgZXhlY3V0ZWQgb25seSBieSB0aGUgVG9rZW5BdXRoUHJvdmlkZXIuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdwbGVhc2UgZXhlY3V0ZSBnZXRUb2tlbigpIGJlZm9yZSBjaGVja2luZyB0aGUgdmFsaWRpdHkuJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyZWRlbnRpYWxBdXRoUHJvdmlkZXI7IiwidmFyIGV4cG9ydHMgPSB7fTtcblxudmFyIGVjbXMgPSAnYXBpLyc7XG52YXIgYXV0aCA9ICdhcGkvJztcblxuZXhwb3J0cy5hdXRoID0ge307XG5leHBvcnRzLmF1dGgudG9rZW4gPSB7fTtcbmV4cG9ydHMuYXV0aC50b2tlbi5nZW5lcmF0ZSA9IGF1dGggKyAndG9rZW4nO1xuZXhwb3J0cy5hdXRoLnRva2VuLnJlbmV3ID0gYXV0aCArICd0b2tlbi9yZW5ld2VkJztcbmV4cG9ydHMuYXV0aC50b2tlbi52YWxpZGF0ZSA9IGF1dGggKyAndG9rZW4vdmFsaWRpdHknO1xuXG5leHBvcnRzLm1hbmFnZW1lbnQgPSB7fTtcbmV4cG9ydHMubWFuYWdlbWVudC51c2VycyA9IHt9O1xuZXhwb3J0cy5tYW5hZ2VtZW50LnVzZXJzLmFsbCA9IGVjbXMgKyAnbWFuYWdlbWVudC91c2Vycyc7XG5leHBvcnRzLm1hbmFnZW1lbnQudXNlcnMuY3JlYXRlID0gZWNtcyArICdtYW5hZ2VtZW50L3VzZXJzJztcbmV4cG9ydHMubWFuYWdlbWVudC51c2Vycy5ieUlkID0gZWNtcyArICdtYW5hZ2VtZW50L3VzZXJzL3tpZH0nO1xuZXhwb3J0cy5tYW5hZ2VtZW50LnVzZXJzLmJ5TmFtZSA9IGVjbXMgKyAnbWFuYWdlbWVudC91c2Vycy9uYW1lZC97dXNlck5hbWV9JztcbmV4cG9ydHMubWFuYWdlbWVudC51c2Vycy5ieVNob3J0TmFtZSA9IGVjbXMgKyAnbWFuYWdlbWVudC91c2Vycz9xdWVyeT1XSEVSRSUyMGRpc3BsYXlOYW1lJTIwRVElMjAlMjJ7dXNlck5hbWV9JTIyJztcblxuZXhwb3J0cy53b3JrZmxvdyA9IHt9O1xuZXhwb3J0cy53b3JrZmxvdy5pbmJveGVzID0ge307XG5leHBvcnRzLndvcmtmbG93LmluYm94ZXMuYWxsID0gZWNtcyArICd3b3JrZmxvdy9pbmJveGVzLyc7XG5leHBvcnRzLndvcmtmbG93LmluYm94ZXMudGFza3MgPSBlY21zICsgJ3dvcmtmbG93L2luYm94ZXMve2luYm94fS9pdGVtcyc7XG5cbi8vaHR0cHM6IC8vZWNtLXNlcnZpY2UucHNmdC5jby9lY21zL3Jlc291cmNlX1Rhc2tSZXNvdXJjZS5odG1sXG5leHBvcnRzLndvcmtmbG93LnRhc2sgPSB7fTtcbmV4cG9ydHMud29ya2Zsb3cudGFzay5kZXRhaWxzID0gZWNtcyArICd3b3JrZmxvdy90YXNrcy97dGFza30nO1xuZXhwb3J0cy53b3JrZmxvdy50YXNrLnRyYW5zaXRpb25zID0gZWNtcyArICd3b3JrZmxvdy90YXNrcy97dGFza30vdHJhbnNpdGlvbnMnO1xuZXhwb3J0cy53b3JrZmxvdy50YXNrLmluZGV4ID0gZWNtcyArICd3b3JrZmxvdy90YXNrcy97dGFza30vaW5kZXgnO1xuZXhwb3J0cy53b3JrZmxvdy50YXNrLmNvbW1lbnRzID0gZWNtcyArICd3b3JrZmxvdy90YXNrcy97dGFza30vY29tbWVudHMnO1xuZXhwb3J0cy53b3JrZmxvdy50YXNrLnRha2VPd25lcnNoaXAgPSBlY21zICsgJ3dvcmtmbG93L3Rhc2tzL3t0YXNrfS9vd25lcnNoaXAvYWNxdWlyZSc7XG5leHBvcnRzLndvcmtmbG93LnRhc2sucmV2b2tlT3duZXJzaGlwID0gZWNtcyArICd3b3JrZmxvdy90YXNrcy97dGFza30vb3duZXJzaGlwL3Jldm9rZSc7XG5leHBvcnRzLndvcmtmbG93LnRhc2suZm9yd2FyZCA9IGVjbXMgKyAnd29ya2Zsb3cvdGFza3Mve3Rhc2t9L2ZvcndhcmQnO1xuXG5leHBvcnRzLndvcmtmbG93LnByb2Nlc3MgPSBlY21zICsgJ3dvcmtmbG93L3Rhc2tzL3t0YXNrfSc7XG5cbmV4cG9ydHMuY29udGVudCA9IHt9O1xuZXhwb3J0cy5jb250ZW50LmFyY2hpdmVzID0ge307XG5leHBvcnRzLmNvbnRlbnQuYXJjaGl2ZXMuYWxsID0gZWNtcyArICdhcmNoaXZlcyc7XG5leHBvcnRzLmNvbnRlbnQuYXJjaGl2ZXMuZG9jdW1lbnRzID0ge307XG5leHBvcnRzLmNvbnRlbnQuYXJjaGl2ZXMuZG9jdW1lbnRzLmFsbCA9IGVjbXMgKyAnYXJjaGl2ZS9kb2N1bWVudHMve2FyY2hpdmV9L2NvbnRlbnQnO1xuZXhwb3J0cy5jb250ZW50LmRvY3VtZW50ID0ge307XG5leHBvcnRzLmNvbnRlbnQuZG9jdW1lbnQuZGV0YWlscyA9IGVjbXMgKyAnZG9jdW1lbnRzL3tkb2N1bWVudH0nO1xuZXhwb3J0cy5jb250ZW50LmRvY3VtZW50LnJldmlzaW9uID0gZWNtcyArICdkb2N1bWVudHMvcmV2aXNpb25zL3tyZXZpc2lvbn0nO1xuZXhwb3J0cy5jb250ZW50LmRvY3VtZW50LmVsZW1lbnQgPSBlY21zICsgJ2RvY3VtZW50cy9yZXZpc2lvbnMve3JldmlzaW9ufS9lbGVtZW50L3tlbGVtZW50fSc7XG5cblxuT2JqZWN0LmZyZWV6ZShleHBvcnRzKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0czsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9sb2dNYW5hZ2VyJyk7XG52YXIgZW5kcG9pbnRzID0gcmVxdWlyZSgnLi9lbmRwb2ludHMnKTtcblxudmFyIGh0dHBCYXNlID0gcmVxdWlyZSgnaHR0cCcpO1xudmFyIGh0dHBzQmFzZSA9IHJlcXVpcmUoJ2h0dHBzJyk7XG52YXIgaHR0cDtcbnZhciB1cmwgPSByZXF1aXJlKCd1cmwnKTtcblxuXG4vL2NvbnZlcnQgdGhlIGhlYWRlcnMgbGlzdCB0byBhbiBxdWVyeWFibGUgYXJyYXkgd2hpY2ggd29ya3MgaW4gbm9kZWpzIGFuZCBicm93c2VycyBpbmNsdWRpbmcgaWVcbnZhciBjb252ZXJ0SGVhZGVycyA9IGZ1bmN0aW9uIChyZXNwb25zZUhlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVyID0gW107XG4gICAgaWYgKCFyZXNwb25zZUhlYWRlcnMpIHJldHVybiBbXTtcbiAgICB2YXIga2V5ID0gMCxcbiAgICAgICAgdmFsdWUgPSAxO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2VIZWFkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBrdnAgPSByZXNwb25zZUhlYWRlcnNbaV0uc3BsaXQoJzogJyk7XG4gICAgICAgIGhlYWRlcltrdnBba2V5XS50cmltKCldID0ga3ZwW3ZhbHVlXS50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiBoZWFkZXI7XG59O1xuXG4vL2NyZWF0ZSBhIHJhbmRvbSBudW1iZXIgdG8gdHJhY2sgcmVzcG9uc2VzIGZvciBsb2dnaW5nIG9uIG11bHRpcGxlIHBhcmFsbGVsIHJlcXVlc3RzXG5mdW5jdGlvbiBnZW5lcmF0ZVJlcXVlc3RJZCgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDg5OTk5OSkgKyAxMDAwMDApLnRvU3RyaW5nKCk7XG59XG5cbnZhciB2YWxpZGF0ZVNlcnZpY2VDb25uZWN0aW9uID0gZnVuY3Rpb24gKHNlcnZpY2VDb25uZWN0aW9uKSB7XG4gICAgLy9UT0RPOiBhZGQgY2hlY2sgZm9yIG5vIHNlcnZpY2VDb25uZWN0aW9uIGhlcmUgYW5kIHJlbW92ZSBjaGVja3MgaW4gY2FsbGVyJ3MgbG9jYXRpb25cblxuICAgIGlmICghc2VydmljZUNvbm5lY3Rpb24uc2VydmljZVVybClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbi5zZXJ2aWNlVXJsIGlzIG5vdCBkZWZpbmVkJyk7XG5cbiAgICBpZiAoIXNlcnZpY2VDb25uZWN0aW9uLl9hcHBseUF1dGhlbnRpY2F0aW9uKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlcnZpY2VDb25uZWN0aW9uIGRvZXMgbm90IHN1cHBvcnQgYXBwbHlBdXRoZW50aWNhdGlvbicpO1xufTtcblxuLyoqXG4gKiBleGVjdXRlcyBhc3luYyBodHRwIHJlcXVlc3RcbiAqIEBpbnRlcm5hbFxuICogQG1ldGhvZCBleGVjdXRlSHR0cENhbGxcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXJ2aWNlQ29ubmVjdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbmRwb2ludCBlLmcuIC9lY20tYXV0aC90b2tlblxuICogQHBhcmFtIHtPYmplY3R9IG1ldGhvZCAgbGlrZSBnZXQsIHBvc3QsIHB1dCwgdXBkYXRlXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAgdGhlIHBheWxvYWQgdG8gc2VuZCB0byB0aGUgc2VydmVyXG4gKiBAcGFyYW0ge09iamVjdH0gaXNCaW5hcnkgaW5kaWNhdGVkIHRoYXQgdGhlIHBheWxvYWQgaXMgYmluYXJ5LCBvdGhlcndpc2UgYSBqc29uIGlzIGV4cGVjdGVkXG4gKiBAcmV0dXJuIHtPYmplY3R9IHJldHJ1bnMgYSBwcm9taXNlIG9iamVjdCB3aGljaCBkZWxpdmVzIHRoZSByZWNlaXZlZCBkYXRhIGluIHRlaCBzdWNjZXNzIGhhbmRsZXJcbiAqL1xudmFyIGV4ZWN1dGVIdHRwQ2FsbCA9IGZ1bmN0aW9uIChzZXJ2aWNlVXJsLCBlbmRwb2ludCwgbWV0aG9kLCBkYXRhLCBpc0JpbmFyeSwgYXV0aGVudGljYXRlLCB1bmF1dGhvcml6ZWROb3RpZmllcikge1xuICAgIC8vVE9ETzogZXh0ZW5kIGZ1bmN0aW9uIHBhcmFtcyBmb3Igc2VuZGluZyBiaW5hcnkgYW5kIHJlY2VpdmUganNvblxuICAgIGlmICghbWV0aG9kKVxuICAgICAgICBtZXRob2QgPSAnR0VUJztcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJlcXVlc3RJZCA9IGdlbmVyYXRlUmVxdWVzdElkKCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBwYXJzZWRVcmwgPSB1cmwucGFyc2Uoc2VydmljZVVybCArIGVuZHBvaW50IC8qdXJsLnJlc29sdmUoc2VydmljZVVybCxlbmRwb2ludCkqLyApO1xuICAgICAgICAgICAgbG9nLnZlcmJvc2UoJ3swfSAtIHByZXBhcmUgezF9IHJlcXVlc3QgZm9yIHsyfScsIHJlcXVlc3RJZCwgbWV0aG9kLCBwYXJzZWRVcmwuaHJlZik7XG5cbiAgICAgICAgICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMubWV0aG9kID0gbWV0aG9kO1xuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuaG9zdCA9IHBhcnNlZFVybC5ob3N0bmFtZTtcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zLnBhdGggPSBwYXJzZWRVcmwucGF0aDtcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zLnByb3RvY29sID0gcGFyc2VkVXJsLnByb3RvY29sO1xuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMucG9ydCA9IHBhcnNlZFVybC5wb3J0O1xuXG4gICAgICAgICAgICBsb2cudmVyYm9zZSgnezB9IGNyZWF0ZSByZXF1ZXN0IHdpdGggb3B0aW9uczogezF9JywgcmVxdWVzdElkLCBKU09OLnN0cmluZ2lmeShyZXF1ZXN0T3B0aW9ucykpO1xuXG4gICAgICAgICAgICAvL2RlY2lkZSB3aGV0aGVyIHRvIHRha2UgaHR0cCBvciBodHRwcyBkZXBlbmRpbmcgb24gcHJvdG9jb2xsIG9mIHBhcnNlZFVybFxuICAgICAgICAgICAgaWYgKHBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ2h0dHA6Jykge1xuICAgICAgICAgICAgICAgIGh0dHAgPSBodHRwQmFzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaHR0cCA9IGh0dHBzQmFzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9UT0RPOiBzcGxpdCBiZXR3ZWVuIHNlbmRiaW5hcnkgYW5kIHJlY2VpdmUgYmluYXJ5IGJlY2FzdWUgYSB1cGRhdGUgZG9jdW1lbnQgY29udGVudCBjYW4gcmVzdWx0IGluIGEganNvbiByZXNwb25zZVxuICAgICAgICAgICAgaWYgKCFpc0JpbmFyeSkge1xuICAgICAgICAgICAgICAgIGxvZy52ZXJib3NlKCd7MH0gc2V0IGFjY2VwdCBoZWFkZXIgdG8gYXBwbGljYXRpb24vanNvbicsIHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuSGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZy52ZXJib3NlKCd7MH0gc2V0IGFjY2VwdCBoZWFkZXIgdG8gYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJywgcmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucy5IZWFkZXJzID0ge1xuICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVxID0gaHR0cC5yZXF1ZXN0KHJlcXVlc3RPcHRpb25zLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc2V0RW5jb2RpbmcgIT09IHVuZGVmaW5lZCAmJiAhaXNCaW5hcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnNldEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgnezB9IHJlY2VpdmVkIHJlc3BvbnNlIHdpdGggc3RhdHVzIGNvZGUgezJ9ICh7M30pIGZvciB7MX0nLCByZXF1ZXN0SWQsIHBhcnNlZFVybC5ocmVmLCByZXNwb25zZS5zdGF0dXNDb2RlLCByZXNwb25zZS5zdGF0dXNNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgnezB9IHJlc3BvbnNlIGhlYWRlcnMgezF9JywgcmVxdWVzdElkLCBKU09OLnN0cmluZ2lmeShyZXNwb25zZS5oZWFkZXJzLCBudWxsLCAyKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHVzZVJlY2VpdmVkRGF0YSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocmVzcG9uc2Uuc3RhdHVzQ29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDIwMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vb2tcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyMDE6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjAyOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIDIwMzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyMDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGNvbnRlbnQgb24gYSBwdXQgb3IgcG9zdCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjA1OlxuICAgICAgICAgICAgICAgICAgICBjYXNlIDIwNjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyMjY6XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDMwNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVE9ETzogcmV0dXJuIG9yZyBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDE6XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2JlIGF3YXJlIHRoYXQgNDAzIG1lYW5zIHRoZSB1c2VyIGhhcyBubyByaWdodCB0byB0aGlzIHJlc291cmNlLCBidXQgaGUgc2VuZCBhdXRob3JpemF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodW5hdXRob3JpemVkTm90aWZpZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbm90aWZ5IGEgY2FsbCBpZiByZXF1ZXN0ZWQgdGhhdCB0aGUgdXNlIGhhcyBubyBhdXRob3JpemF0aW9uIHRvIHRoYXQgY2FsbCwgdGhlbiBmYWlsIGFzIHVzdWFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuYXV0aG9yaXplZE5vdGlmaWVyKHBhcnNlZFVybC5ocmVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcignezB9IHVuYXV0aG9yaXplZE5vdGlmaWVyIGNhbGxiYWNrIGZhaWxlZCB7MX0nLCByZXF1ZXN0SWQsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZVJlY2VpdmVkRGF0YSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbCgndXNlciBpcyBub3QgYXV0aG9yaXplZC4gdHJ5IHRvIHJlbG9naW4uIFNlcnZlckVycm9yOiAnICsgcmVzcG9uc2Uuc3RhdHVzTWVzc2FnZSArICcgKCcgKyByZXNwb25zZS5zdGF0dXNDb2RlICsgJykgYXQgcmVxdWVzdCAnICsgcmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlUmVjZWl2ZWREYXRhID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VydmljZUVycm9yID0gY29udmVydEhlYWRlcnMocmVzcG9uc2UuaGVhZGVycylbJ3gtZWNtcy1lcnJvci1tZXNzYWdlJ10gfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsKCdodHRwIGVycm9yICcgKyByZXNwb25zZS5zdGF0dXNNZXNzYWdlICsgJyAoJyArIHJlc3BvbnNlLnN0YXR1c0NvZGUgKyAnKSAnICsgc2VydmljZUVycm9yICsgJyBhdCByZXF1ZXN0ICcgKyByZXF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVkQ2h1bmtzID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3RvcmUgcmVjZWl2ZWQgY2h1bmsgaW4gYSBmYXN0LCBzaW1wbGUgd2F5IVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZWRDaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgnezB9IHNlbmRpbmcgcmVjZWl2ZWQgZGF0YSB0byBjYWxsZXInLCByZXF1ZXN0SWQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZVJlY2VpdmVkRGF0YSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG90YWxTaXplID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRCdWZmZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmNvZGluZyA9ICd1dGY4JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0JpbmFyeSkgZW5jb2RpbmcgPSAnYmluYXJ5JztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uY2F0IGFsbCBjaHVua3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY2VpdmVkQ2h1bmtzLmZvckVhY2goZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdEJ1ZmZlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEJ1ZmZlciA9IG5ldyBCdWZmZXIoY2h1bmssIGVuY29kaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFtyZXN1bHRCdWZmZXIsIG5ldyBCdWZmZXIoY2h1bmssIGVuY29kaW5nKV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNCaW5hcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2pzb24gcmV0dXJuIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGpzb24gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0QnVmZmVyICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShyZXN1bHRCdWZmZXIudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoanNvbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignanNvbiBwYXJzaW5nIGZhaWxlZCBmb3IgZGF0YTogXCInICsganNvbiArICdcIicgKyAnIGF0IHJlcXVlc3QgJyArIHJlcXVlc3RJZCArICcgd2l0aCBFcnJvcjogJyArIGpzb25FcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MoanNvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnYXRoZXIgY29udGVudFR5cGUgZnJvbSByZXNwb25zZUhlYWRlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcENvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BDb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE8gY2hlY2sgb3IgdXNlIGNvbnZlcnRIZWFkZXJzKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgnbm8gY29udGVudC10eXBlIGF2YWlsaWJsZSBpbiByZXNwb25zZSBoZWFkZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCByZXN1bHRKc29uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzdWx0QnVmZmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhSW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IHJlc3BDb250ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHRvdGFsU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmFyeVVybDogcGFyc2VkVXJsLmhyZWZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyhyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSAvL2VuZCByZXF1ZXN0IGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbXNnID0gJ3Byb2JsZW0gd2l0aCByZXF1ZXN0ICcgKyByZXF1ZXN0SWQgKyAnIE1lc3NhZ2U6ICcgKyBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IobXNnKTtcbiAgICAgICAgICAgICAgICAgICAgZmFpbChuZXcgRXJyb3IobXNnKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vY29udGludWUgd2l0aCByZXF1ZXN0IGluaXRpYWxpemluZ1xuICAgICAgICAgICAgaWYgKGF1dGhlbnRpY2F0ZSAhPT0gdW5kZWZpbmVkICYmIGF1dGhlbnRpY2F0ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgYXV0aGVudGljYXRlKHJlcSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZy53YXJuKCd7MH0gbm8gYXV0aGVudGljYXRpb24gaGFuZGxlciBpcyBhdmFpbGFibGUuIG5vIGF1dGhlbnRpY2F0aW9uIGFwcGxpZWQnLCByZXF1ZXN0SWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2cudmVyYm9zZSgnezB9IHJlcXVlc3QgaGVhZGVyIHsxfScsIHJlcXVlc3RJZCwgcmVxdWVzdE9wdGlvbnMuSGVhZGVycyk7XG5cbiAgICAgICAgICAgIGlmIChkYXRhICE9PSBudWxsICYmIChtZXRob2QgPT09ICdQT1NUJyB8fCBtZXRob2QgPT09ICdVUERBVEUnIHx8IG1ldGhvZCA9PT0gJ1BVVCcpKSB7XG4gICAgICAgICAgICAgICAgbG9nLnZlcmJvc2UoJ3swfSB3cml0ZSB7MX0gYnl0ZXMgdG8gc2VydmljZScsIHJlcXVlc3RJZCwgZGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIC8vcmVxLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCBCdWZmZXIuYnl0ZUxlbmd0aChkYXRhKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0JpbmFyeSkge1xuICAgICAgICAgICAgICAgICAgICByZXEuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICAgICAgICByZXEud3JpdGUoZGF0YSwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXEuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlcS53cml0ZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmluZm8oJ3swfSBleGVjdXRlIHsxfSByZXF1ZXN0IHRvIHsyfScsIHJlcXVlc3RJZCwgcmVxLm1ldGhvZCwgcmVxLnBhdGgpO1xuICAgICAgICAgICAgcmVxLmVuZCgpO1xuICAgICAgICB9IGNhdGNoIChwcm9taXNlRXJyb3IpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihwcm9taXNlRXJyb3IpO1xuICAgICAgICAgICAgZmFpbChwcm9taXNlRXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIC8vZW5kIHByb21pc2VcbiAgICB9KTtcbn07XG5cblxuLyoqXG4gKiBleGVjdXRlcyBhc3luYyBodHRwIHJlcXVlc3RcbiAqIEBpbnRlcm5hbFxuICogQG1ldGhvZCBleGVjdXRlSHR0cENhbGxcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXJ2aWNlQ29ubmVjdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbmRwb2ludCBlLmcuIC9lY20tYXV0aC90b2tlblxuICogQHBhcmFtIHtPYmplY3R9IG1ldGhvZCAgbGlrZSBnZXQsIHBvc3QsIHB1dCwgdXBkYXRlXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAgdGhlIHBheWxvYWQgdG8gc2VuZCB0byB0aGUgc2VydmVyXG4gKiBAcGFyYW0ge09iamVjdH0gaXNCaW5hcnkgaW5kaWNhdGVkIHRoYXQgdGhlIHBheWxvYWQgaXMgYmluYXJ5LCBvdGhlcndpc2UgYSBqc29uIGlzIGV4cGVjdGVkXG4gKiBAcmV0dXJuIHtPYmplY3R9IHJldHJ1bnMgYSBwcm9taXNlIG9iamVjdCB3aGljaCBkZWxpdmVzIHRoZSByZWNlaXZlZCBkYXRhIGluIHRlaCBzdWNjZXNzIGhhbmRsZXJcbiAqL1xudmFyIGV4ZWN1dGVDb25uZWN0aW9uQmFzZWRIdHRwQ2FsbCA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgZW5kcG9pbnQsIG1ldGhvZCwgZGF0YSwgaXNCaW5hcnkpIHtcbiAgICByZXR1cm4gZXhlY3V0ZUh0dHBDYWxsKHNlcnZpY2VDb25uZWN0aW9uLnNlcnZpY2VVcmwsIGVuZHBvaW50LCBtZXRob2QsIGRhdGEsIGlzQmluYXJ5LCBzZXJ2aWNlQ29ubmVjdGlvbi5fYXBwbHlBdXRoZW50aWNhdGlvbiwgc2VydmljZUNvbm5lY3Rpb24uX3VuYXV0aG9yaXplZENhbGxiYWNrKTtcbn07XG5cbnZhciBnZXRKc29uID0gZnVuY3Rpb24gKHNlcnZpY2VDb25uZWN0aW9uLCBlbmRwb2ludCkge1xuICAgIHJldHVybiBleGVjdXRlQ29ubmVjdGlvbkJhc2VkSHR0cENhbGwoc2VydmljZUNvbm5lY3Rpb24sIGVuZHBvaW50LCAnR0VUJywgbnVsbCwgZmFsc2UpO1xufTtcblxudmFyIGdldEJpbmFyeSA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgZW5kcG9pbnQpIHtcbiAgICByZXR1cm4gZXhlY3V0ZUNvbm5lY3Rpb25CYXNlZEh0dHBDYWxsKHNlcnZpY2VDb25uZWN0aW9uLCBlbmRwb2ludCwgJ0dFVCcsIG51bGwsIHRydWUpO1xufTtcblxudmFyIHBvc3RKc29uID0gZnVuY3Rpb24gKHNlcnZpY2VDb25uZWN0aW9uLCBlbmRwb2ludCwgcGF5bG9hZCkge1xuICAgIHJldHVybiBleGVjdXRlQ29ubmVjdGlvbkJhc2VkSHR0cENhbGwoc2VydmljZUNvbm5lY3Rpb24sIGVuZHBvaW50LCAnUE9TVCcsIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLCBmYWxzZSk7XG59O1xuXG52YXIgcG9zdEJpbmFyeSA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgZW5kcG9pbnQsIHBheWxvYWQpIHtcbiAgICByZXR1cm4gZXhlY3V0ZUNvbm5lY3Rpb25CYXNlZEh0dHBDYWxsKHNlcnZpY2VDb25uZWN0aW9uLCBlbmRwb2ludCwgJ1BPU1QnLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSwgdHJ1ZSk7XG59O1xuXG52YXIgcHV0SnNvbiA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgZW5kcG9pbnQsIHBheWxvYWQpIHtcbiAgICByZXR1cm4gZXhlY3V0ZUNvbm5lY3Rpb25CYXNlZEh0dHBDYWxsKHNlcnZpY2VDb25uZWN0aW9uLCBlbmRwb2ludCwgJ1BVVCcsIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLCBmYWxzZSk7XG59O1xuXG52YXIgc3RhcnRBY3Rpb24gPSBmdW5jdGlvbiAoc2VydmljZUNvbm5lY3Rpb24sIGVuZHBvaW50KSB7XG4gICAgcmV0dXJuIGV4ZWN1dGVDb25uZWN0aW9uQmFzZWRIdHRwQ2FsbChzZXJ2aWNlQ29ubmVjdGlvbiwgZW5kcG9pbnQsICdQVVQnLCBudWxsLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEVuY29kZSAvIERlY29kZSBVcmlcbiAqL1xudmFyIGVuY29kZVVyaUNvbXBvbmVudCA9IGZ1bmN0aW9uIChwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtZXRlcik7XG59O1xuXG52YXIgZGVjb2RlVXJpQ29tcG9uZW50ID0gZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocGFyYW1ldGVyKTtcbn07XG52YXIgZW5jb2RlVXJpID0gZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuICAgIHJldHVybiBlbmNvZGVVUkkocGFyYW1ldGVyKTtcbn07XG5cbnZhciBkZWNvZGVVcmkgPSBmdW5jdGlvbiAocGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSShwYXJhbWV0ZXIpO1xufTtcblxuXG52YXIgc3RhcnRBY3Rpb24gPSBmdW5jdGlvbiAoc2VydmljZUNvbm5lY3Rpb24sIGVuZHBvaW50KSB7XG4gICAgcmV0dXJuIGV4ZWN1dGVDb25uZWN0aW9uQmFzZWRIdHRwQ2FsbChzZXJ2aWNlQ29ubmVjdGlvbiwgZW5kcG9pbnQsICdQVVQnLCBudWxsLCBmYWxzZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAndmFsaWRhdGVTZXJ2aWNlQ29ubmVjdGlvbic6IHZhbGlkYXRlU2VydmljZUNvbm5lY3Rpb24sXG4gICAgJ2V4ZWN1dGVIdHRwQ2FsbCc6IGV4ZWN1dGVIdHRwQ2FsbCxcbiAgICAnZ2V0SnNvbic6IGdldEpzb24sXG4gICAgJ2dldEJpbmFyeSc6IGdldEJpbmFyeSxcbiAgICAncG9zdEpzb24nOiBwb3N0SnNvbixcbiAgICAncG9zdEJpbmFyeSc6IHBvc3RCaW5hcnksXG4gICAgJ3B1dEpzb24nOiBwdXRKc29uLFxuICAgICdzdGFydEFjdGlvbic6IHN0YXJ0QWN0aW9uLFxuICAgICdlbmRwb2ludHMnOiBlbmRwb2ludHMsXG4gICAgJ2VuY29kZVVyaUNvbXBvbmVudCc6IGVuY29kZVVyaUNvbXBvbmVudCxcbiAgICAnZGVjb2RlVXJpQ29tcG9uZW50JzogZGVjb2RlVXJpQ29tcG9uZW50LFxuICAgICdlbmNvZGVVcmknOiBlbmNvZGVVcmksXG4gICAgJ2RlY29kZVVyaSc6IGRlY29kZVVyaVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL2xvZ01hbmFnZXInKTtcbnZhciBVc2VyID0gcmVxdWlyZSgnLi8uLi9hZG1pbmlzdHJhdGlvbi91c2VyJyk7XG5cbi8qKlxuICogU2FwZXJpb24gQ29ubmVjdGlvbiBQcm92aWRlciB3aGljaCBvcmdhbml6aW5nIHRoZSBjb21tdW5pY2F0aW9uIHRvIHRoZSBzZXJ2aWNlIGluY2x1ZGluZyBsb2dpbiwgdG9rZW4gaGFuZGxpbmcgYW5kIGxvZ2luIHJlbGF0ZWQgZGF0YVxuICogYXV0aGVudGljYXRpb24gcHJvdmlkZXIuIERlZmF1bHQgYXV0aGVudGljYXRpb24gcHJvdmlkZXIgaXMge3sjY3Jvc3NMaW5rIFwiQmFzaWNBdXRoUHJvdmlkZXJcIn19e3svY3Jvc3NMaW5rfX0uXG4gKiBcbiAqIEBtb2R1bGUgY29tbXVuaWNhdGlvblxuICogQGNsYXNzIGF1dGhlbnRpY2F0aW9uTWFuYWdlclxuICogQHR5cGUgT2JqZWN0XG4gKi9cbmZ1bmN0aW9uIENvbm5lY3Rpb24oc2VydmljZVVybCwgYXV0aFByb3ZpZGVyLCB1bmF1dGhvcml6ZWRDYWxsYmFjaykge1xuICAgIGlmICghc2VydmljZVVybClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1cmwgaXMgbm90IHNldCcpO1xuICAgIGlmICghYXV0aFByb3ZpZGVyKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2F1dGhQcm92aWRlciBpcyBub3QgZGVmaW5lZCcpO1xuXG4gICAgaWYgKCFhdXRoUHJvdmlkZXIuYXBwbHlBdXRoZW50aWNhdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhdXRoUHJvdmlkZXIgZG9lcyBub3Qgc3VwcG9ydCBhcHBseUF1dGhlbnRpY2F0aW9uJyk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NlcnZpY2VVcmwnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VVcmw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2F1dGhQcm92aWRlcicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXV0aFByb3ZpZGVyO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2NhbGxiYWNrIHRvIG5vdGlmeSBzZGsgdXNlcnMgYWJvdXQgaW52YWxpZCBjcmVkZW50aWFscyBvciBleHBpcmVkIHRva2VuXG4gICAgdGhpcy5fdW5hdXRob3JpemVkQ2FsbGJhY2sgPSB1bmF1dGhvcml6ZWRDYWxsYmFjaztcbiAgICAvL1RPRE8gY2hlY2sgYWxsIHJlZmVyZW5jZXMgdG8gcmVtb3ZlXG4gICAgLy9nb2FsOiB0aGUgaHR0cCBoYW5kbGVyIHdpbGwgYmUgdGhlIG9ubHkgb25lIHdobyB1c2UgdGhpcyBmdW5jdGlvblxuICAgIHRoaXMuX2FwcGx5QXV0aGVudGljYXRpb24gPSBhdXRoUHJvdmlkZXIuYXBwbHlBdXRoZW50aWNhdGlvbjtcbn1cblxuXG5Db25uZWN0aW9uLnByb3RvdHlwZS5pc1NlcnZpY2VDb21wYXRpYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vVE9ETzogaW1wbGVtbnQgdmVyc2lvbiBjaGVjayBmb3Igc2VydmljZVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy9yZXR1cm5zIGEgcHJvbWlzZSBhbmQgZmluYWx5IGEgdG9rZW4gb2JqZWN0IFxuQ29ubmVjdGlvbi5wcm90b3R5cGUubG9naW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgbG9nLmluZm8oJ1NlcnZpY2VDb25uZWN0aW9uLmxvZ2luJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiB0aGlzLl9hdXRoUHJvdmlkZXIuZ2V0VG9rZW4oKTtcbn07XG5cbi8vcmV0dXJucyB0aGUgY3VycmVudCB1c2VyIG5hbWUgb24gc3VjY2Vzc1xuQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0Q3VycmVudFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZuTmFtZSA9ICdTZXJ2aWNlQ29ubmVjdGlvbi5nZXRDdXJyZW50VXNlcic7XG4gICAgbG9nLmluZm8oZm5OYW1lKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgc2VsZi5fYXV0aFByb3ZpZGVyLnZhbGlkYXRlVG9rZW4oKS50aGVuKGZ1bmN0aW9uIChsb2dpbkRhdGEpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgndXNpbmcgdGhlIGZvbGxvd2luZyBkYXRhIHRvIGlkZW50aWZ5IGN1cnJlbnQgdXNlcjonLCBsb2dpbkRhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIFVzZXIuZ2V0VXNlcnMoc2VsZiwgMSwgdHJ1ZSwgKCc/cXVlcnk9V0hFUkUlMjBkaXNwbGF5TmFtZSUyMEVRJTIwJTIye2xvZ2lufSUyMicpLnJlcGxhY2UoJ3tsb2dpbn0nLCBsb2dpbkRhdGEubG9naW4pKS50aGVuKGZ1bmN0aW9uICh1c2VyTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRVc2VyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJMaXN0LmRhdGEubGVuZ3RoID09PSAxKSBjdXJyZW50VXNlciA9IHVzZXJMaXN0LmRhdGFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKGN1cnJlbnRVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZChlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVycm9yKTtcbiAgICAgICAgICAgICAgICBmYWlsZWQoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdGlvbjsiLCIndXNlIHN0cmljdCdcblxudmFyIGxvZyA9IHJlcXVpcmUoJy4vLi4vaW50ZXJuYWwvbG9nTWFuYWdlci5qcycpO1xudmFyIGh0dHAgPSByZXF1aXJlKCcuL2h0dHBIZWxwZXInKTtcbi8vdmFyIHV0aWwgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL3V0aWxpdGllcycpO1xudmFyIEF1dGhlbnRpY2F0aW9uVG9rZW4gPSByZXF1aXJlKCcuL2F1dGhlbnRpY2F0aW9uVG9rZW4nKTtcblxuLyoqXG4gKiBDcmVkZW50aWFsIE9iamVjdCB3aGljaCBvcmdhbml6aW5nIGxvZ2luIHJlbGF0ZWQgZGF0YVxuICogYXV0aGVudGljYXRpb24gcHJvdmlkZXIuIERlZmF1bHQgYXV0aGVudGljYXRpb24gcHJvdmlkZXIgaXMge3sjY3Jvc3NMaW5rIFwiQmFzaWNBdXRoUHJvdmlkZXJcIn19e3svY3Jvc3NMaW5rfX0uXG4gKlxuICogQG1vZHVsZSBjb21tdW5pY2F0aW9uXG4gKiBAY2xhc3MgYXV0aGVudGljYXRpb25NYW5hZ2VyXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuZnVuY3Rpb24gVG9rZW5BdXRoUHJvdmlkZXIoYXV0aFNlcnZpY2VVcmwsIHRva2VuKSB7XG5cbiAgICBpZiAoIXRva2VuKSB0aHJvdyBuZXcgRXJyb3IoJ3BhcmFtZXRlciB0b2tlbiBpcyBtaXNzaW5nJyk7XG4gICAgaWYgKCFhdXRoU2VydmljZVVybCkgdGhyb3cgbmV3IEVycm9yKCdwYXJhbWV0ZXIgYXV0aFNlcnZpY2VVcmwgaXMgbWlzc2luZycpO1xuXG4gICAgdmFyIF9hdXRoSGVhZGVyO1xuICAgIHZhciBfdXNlZFRva2VuO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdhdXRoU2VydmljZVVybCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXV0aFNlcnZpY2VVcmw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2FwcGx5TmV3VG9rZW4gPSBmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgICAgbG9nLmluZm8oJ1Rva2VuQXV0aFByb3ZpZGVyLl9hcHBseU5ld1Rva2VuJyk7XG4gICAgICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIEF1dGhlbnRpY2F0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgIF91c2VkVG9rZW4gPSB0b2tlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy90cnkgdG8gZGVzZXJpYWxpemUgYW4gYXV0aCB0b2tlblxuICAgICAgICAgICAgICAgIF91c2VkVG9rZW4gPSBBdXRoZW50aWNhdGlvblRva2VuLmRlc2VyaWFsaXplKHRva2VuKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvL3RyeSB0byB1c2UgdG9rZW4gYXMgYSBzdHJpbmcgXG4gICAgICAgICAgICAgICAgX3VzZWRUb2tlbiA9IG5ldyBBdXRoZW50aWNhdGlvblRva2VuKHtcbiAgICAgICAgICAgICAgICAgICAgJ3Rva2VuJzogdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGV4cGlyZXNJbjogNjBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfYXV0aEhlYWRlciA9ICdCZWFyZXIgJyArIF91c2VkVG9rZW4udG9rZW47XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gaW5qZWN0cyB0aGUgbmVjZXNzYXJ5IGhlYWRlcnMgZm9yIGF1dGhlbnRpY2F0aW9uIHRvIGEgWEhSIC8gSHR0cCBSZXF1ZXN0IE9iamVjdFxuICAgICAqIEBtZXRob2QgcHJlcGFyZUF1dGhlbnRpY2F0aW9uXG4gICAgICovXG4gICAgdGhpcy5hcHBseUF1dGhlbnRpY2F0aW9uID0gZnVuY3Rpb24gKGh0dHBSZXF1ZXN0KSB7XG4gICAgICAgIGxvZy5pbmZvKCdUb2tlbkF1dGhQcm92aWRlci5hcHBseUF1dGhlbnRpY2F0aW9uJyk7XG4gICAgICAgIGh0dHBSZXF1ZXN0LnNldEhlYWRlcignQXV0aG9yaXphdGlvbicsIF9hdXRoSGVhZGVyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fYXBwbHlOZXdUb2tlbih0b2tlbik7XG59XG5cblRva2VuQXV0aFByb3ZpZGVyLnByb3RvdHlwZS5nZXRUb2tlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBsb2cuaW5mbygnVG9rZW5BdXRoUHJvdmlkZXIuZ2V0VG9rZW4nKTtcbiAgICAvL3RoaXMgZnVuY3Rpb24gYW5kIGFsbCB0b2tlbiB2YWxpZGF0aW9uIGlzIHBsYWNlZCBoZXJlIGJlY2F1c2UgdGhlIGF1dGggcHJvdmlkZXJzIGp1c3QgcHJvdmlkaW5nIGF1dGggaGVhZGVyc1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWxlZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaHR0cC5leGVjdXRlSHR0cENhbGwoc2VsZi5hdXRoU2VydmljZVVybCwgaHR0cC5lbmRwb2ludHMuYXV0aC50b2tlbi5yZW5ldywgJ0dFVCcsIG51bGwsIGZhbHNlLCBzZWxmLmFwcGx5QXV0aGVudGljYXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy92YWxpZGF0ZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghanNvbi50b2tlbiB8fCAhanNvbi5leHBpcmVzSW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChuZXcgRXJyb3IoJ25vIHRva2VuIHJlY2VpdmVkLiBsb2dpbiBmYWlsZWQhJykpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRva2VuID0gbmV3IEF1dGhlbnRpY2F0aW9uVG9rZW4oanNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fYXBwbHlOZXdUb2tlbih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzcyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuVG9rZW5BdXRoUHJvdmlkZXIucHJvdG90eXBlLnZhbGlkYXRlVG9rZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgbG9nLmluZm8oJ1Rva2VuQXV0aFByb3ZpZGVyLnZhbGlkYXRlVG9rZW4nKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWxlZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaHR0cC5leGVjdXRlSHR0cENhbGwoc2VsZi5hdXRoU2VydmljZVVybCwgaHR0cC5lbmRwb2ludHMuYXV0aC50b2tlbi52YWxpZGF0ZSwgJ0dFVCcsIG51bGwsIGZhbHNlLCBzZWxmLmFwcGx5QXV0aGVudGljYXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luOiBqc29uLmVjbXNVc2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6IGpzb24uZWNtc1RlbmFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGljZW5zZToganNvbi5lY21zTGljZW5zZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9naW5CeToganNvbi5lY21zVXNlcklkZW50aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgZmFpbGVkKGVycik7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRva2VuQXV0aFByb3ZpZGVyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxvZyA9IHJlcXVpcmUoJy4vLi4vaW50ZXJuYWwvbG9nTWFuYWdlci5qcycpO1xudmFyIGh0dHAgPSByZXF1aXJlKCcuLy4uL2NvbW11bmljYXRpb24vaHR0cEhlbHBlcicpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL3V0aWxpdGllcycpO1xudmFyIFBhZ2VJbmZvID0gcmVxdWlyZSgnLi8uLi9jb21tb24vcGFnZUluZm8nKTtcbnZhciBEb2N1bWVudCA9IHJlcXVpcmUoJy4vZG9jdW1lbnQnKTtcblxuXG4vKipcbiAqIFNhcGVyaW9uIEFyY2hpdmUuXG4gKlxuICogQG1vZHVsZSBjb250ZW50XG4gKiBAY2xhc3MgQXJjaGl2ZVxuICogQHR5cGUgT2JqZWN0XG4gKi9cbmZ1bmN0aW9uIEFyY2hpdmUoc2VydmljZUNvbm5lY3Rpb24sIGpzb24pIHtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gb2JqZWN0IGluaXRpYWxpemF0aW9uIGFzc2VydGlvbnNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgLy9UT0RPOiB0aGlzIGNoZWNrIHdpbGwgYmUgcmVtb3ZlZCBzb29uIGFuZCBtb3ZlZCB0byB2YWxpZGF0ZVNlcnZpY2VDb25uZWN0aW9uXG4gICAgaWYgKCFzZXJ2aWNlQ29ubmVjdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbiBpcyBub3Qgc2V0Jyk7XG5cbiAgICBodHRwLnZhbGlkYXRlU2VydmljZUNvbm5lY3Rpb24oc2VydmljZUNvbm5lY3Rpb24pO1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBwcml2YXRlIHByb3BlcnRpZXNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgdmFyIF9vYmplY3RJZCA9ICcnO1xuICAgIHZhciBfb2JqZWN0VXJsID0gJyc7XG4gICAgdmFyIF9jb250ZW50VHlwZSA9ICcnO1xuXG4gICAgdmFyIF9uYW1lO1xuICAgIHZhciBfdmVyc2lvbjtcbiAgICB2YXIgX2lzb2xhdGlvbjtcblxuICAgIC8qKlxuICAgICAqIGNvbm5lY3Rpb24gd2hpY2ggaXMgdXNlZCBmb3IgY29tbXVuaWNhdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgc2VydmljZUNvbm5lY3Rpb25cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZpY2VDb25uZWN0aW9uID0gc2VydmljZUNvbm5lY3Rpb247XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIGpzb24gbWFwcGluZ1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICB2YXIgX3NlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2UoanNvbikge1xuICAgICAgICBsb2cudmVyYm9zZSgnY3JlYXRlIGFyY2hpdmUgZnJvbSBqc29uIHswfScsIGpzb24pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGpzb24gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGpzb24ucmVmZXJlbmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwcm92aWRlZCBqc29uIHdpbGwgbm90IG1hdGNoIGVjbSBzZXJ2aWNlIG1vZGVsJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF9vYmplY3RJZCA9IGpzb24ucmVmZXJlbmNlLm9iamVjdElkO1xuICAgICAgICAgICAgICAgIF9vYmplY3RVcmwgPSBqc29uLnJlZmVyZW5jZS5zZWxmO1xuICAgICAgICAgICAgICAgIF9jb250ZW50VHlwZSA9IGpzb24ucmVmZXJlbmNlLmNvbnRlbnRUeXBlO1xuICAgICAgICAgICAgICAgIF9uYW1lID0ganNvbi5yZWZlcmVuY2UubmFtZTtcblxuICAgICAgICAgICAgICAgIF92ZXJzaW9uID0ganNvbi52ZXJzaW9uIHx8IF92ZXJzaW9uO1xuICAgICAgICAgICAgICAgIF9pc29sYXRpb24gPSBqc29uLmlzb2xhdGlvbiB8fCBfaXNvbGF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nLmVycm9yKCdtZXJnZSBlcnJvciBmb3IgYXJjaGl2ZTogezB9JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUNvbnRlbnRUeXBlKGlucHV0Q29udGVudFR5cGUpIHtcbiAgICAgICAgaWYgKGlucHV0Q29udGVudFR5cGUgPT09IEFyY2hpdmUuY29udGVudFR5cGVzLkRPQ1VNRU5UKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJjaGl2ZS5jb250ZW50VHlwZXMuRE9DVU1FTlQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0Q29udGVudFR5cGUgPT09IEFyY2hpdmUuY29udGVudFR5cGVzLkxPT0tVUCkge1xuICAgICAgICAgICAgcmV0dXJuIEFyY2hpdmUuY29udGVudFR5cGVzLkxPT0tVUDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXRDb250ZW50VHlwZSA9PT0gQXJjaGl2ZS5jb250ZW50VHlwZXMuRk9MREVSKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJjaGl2ZS5jb250ZW50VHlwZXMuRk9MREVSO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgbm9uZSBvZiBhYm92ZSByZXR1cm4gVU5LTk9XTlxuICAgICAgICByZXR1cm4gQXJjaGl2ZS5jb250ZW50VHlwZXMuVU5LTk9XTjtcbiAgICB9XG5cbiAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lcmdlKGpzb24pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogbWVyZ2UgYSBqc29uIG9iamVjdCB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlLlxuICAgICAqIGludGVybmFseSB1c2VkIGZvciB1cGRhdGVzIGZyb20gc2VydmljZVxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcm9wZXJ0eSBtZXJnZVxuICAgICAqL1xuICAgIHRoaXMubWVyZ2UgPSBtZXJnZTtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gZ2V0dGVyIGFuZCBzZXR0ZXJcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgLyoqXG4gICAgICogdHlwZWQgaWRlbnRpZmllciBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdElkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiByZWZlcmVuY2VVcmwgb2YgdGhpcyBlbGVtZW50XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSByZWZlcmVuY2VVcmxcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JlZmVyZW5jZVVybCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdFVybDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogbmFtZSBvZiB0aGUgYXJjaGl2ZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgbmFtZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbmFtZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX25hbWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIGNvbnRlbnRUeXBlIG9mIHRoZSBhcmNoaXZlXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBjb250ZW50VHlwZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29udGVudFR5cGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9jb250ZW50VHlwZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdmVyc2lvbiBvZiBhcmNoaXZlXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSB2ZXJzaW9uXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2ZXJzaW9uJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdmVyc2lvbjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogaXNvbGF0aW9uIG9mIGFyY2hpdmVcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlzb2xhdGlvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNvbGF0aW9uJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfaXNvbGF0aW9uO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBpbnN0YW5jZSBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbkFyY2hpdmUucHJvdG90eXBlLmdldERvY3VtZW50cyA9IGZ1bmN0aW9uIChwYWdlLCBkZXRhaWxlZCkge1xuICAgIHJldHVybiBEb2N1bWVudC5nZXREb2N1bWVudHNGcm9tQXJjaGl2ZSh0aGlzLCBwYWdlLCBkZXRhaWxlZCk7XG59O1xuXG5BcmNoaXZlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmV0ID0gdGhpcy5uYW1lICsgJyAoSUQgJyArIHRoaXMuaWQgKyAnIHwgY29udGVudFR5cGU6ICcgKyB0aGlzLmNvbnRlbnRUeXBlICsgJyAgfCByZWZlcmVuY2VVcmw6ICcgKyB0aGlzLnJlZmVyZW5jZVVybCArICcpJztcbiAgICByZXR1cm4gcmV0O1xufTtcblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vIHN0YXRpYyBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbkFyY2hpdmUuZ2V0QWxsQXJjaGl2ZXMgPSBmdW5jdGlvbiAoc2VydmljZUNvbm5lY3Rpb24sIHBhZ2UpIHtcbiAgICBpZiAocGFnZSA9PT0gdW5kZWZpbmVkKSBwYWdlID0gMTtcbiAgICBsb2cudmVyYm9zZSgnZ2V0QWxsQXJjaGl2ZXMnKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBodHRwLmdldEpzb24oc2VydmljZUNvbm5lY3Rpb24sIGh0dHAuZW5kcG9pbnRzLmNvbnRlbnQuYXJjaGl2ZXMuYWxsKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy52ZXJib3NlKCdhcmNoaXZlcyB7MH0nLCBqc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3ZhbGlkYXRlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFqc29uLml0ZW1zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQobmV3IEVycm9yKCdubyBpdGVtcyBjb2xsZWN0aW9uIHJlY2VpdmVkJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29udmVydCBqc29uIHRvIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmNoaXZlQ29sbGVjdGlvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoYXJjaGl2ZUpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyY2hpdmUgPSBuZXcgQXJjaGl2ZShzZXJ2aWNlQ29ubmVjdGlvbiwgYXJjaGl2ZUpzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0lORk86IEhlcmUgdGhlIEFyY2hpdmVzIHdpbGwgYmUgZmlsdGVyZWQgZm9yIGp1c3QgdXNpbmcgRG9jdW1lbnQtQXJjaGl2ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBjaGFuZ2UgaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmNoaXZlLmNvbnRlbnRUeXBlID09PSBBcmNoaXZlLmNvbnRlbnRUeXBlcy5ET0NVTUVOVCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJjaGl2ZUNvbGxlY3Rpb24ucHVzaChhcmNoaXZlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhcmNoaXZlQ29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZUluZm86IG5ldyBQYWdlSW5mbyhqc29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJIdHRwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbkFyY2hpdmUuY29udGVudFR5cGVzID0ge1xuICAgIERPQ1VNRU5UOiAnRE9DVU1FTlQnLFxuICAgIExPT0tVUDogJ0xPT0tVUCcsXG4gICAgRk9MREVSOiAnRk9MREVSJyxcbiAgICBVTktOT1dOOiAnVU5LTk9XTidcbn07XG5cbk9iamVjdC5mcmVlemUoQXJjaGl2ZS5jb250ZW50VHlwZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFyY2hpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi8uLi9pbnRlcm5hbC9sb2dNYW5hZ2VyLmpzJyk7XG52YXIgaHR0cCA9IHJlcXVpcmUoJy4vLi4vY29tbXVuaWNhdGlvbi9odHRwSGVscGVyJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vLi4vaW50ZXJuYWwvdXRpbGl0aWVzJyk7XG52YXIgUGFnZUluZm8gPSByZXF1aXJlKCcuLy4uL2NvbW1vbi9wYWdlSW5mbycpO1xuXG4vKipcbiAqIFNhcGVyaW9uIENvbnRlbnQgRWxlbWVudC5cbiAqXG4gKiBAbW9kdWxlIGNvbnRlbnRcbiAqIEBjbGFzcyBDb250ZW50RWxlbWVudFxuICogQHR5cGUgT2JqZWN0XG4gKi9cbmZ1bmN0aW9uIENvbnRlbnRFbGVtZW50KHNlcnZpY2VDb25uZWN0aW9uLCBqc29uLCBkb2N1bWVudCwgcGFyZW50Q29udGVudEVsZW1lbnQpIHtcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIG9iamVjdCBpbml0aWFsaXphdGlvbiBhc3NlcnRpb25zXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIGlmICghc2VydmljZUNvbm5lY3Rpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbiBpcyBub3Qgc2V0Jyk7XG4gICAgfVxuICAgIGh0dHAudmFsaWRhdGVTZXJ2aWNlQ29ubmVjdGlvbihzZXJ2aWNlQ29ubmVjdGlvbik7XG5cbiAgICAvKipcbiAgICAgKiBjb25uZWN0aW9uIHdoaWNoIGlzIHVzZWQgZm9yIGNvbW11bmljYXRpb25cbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHNlcnZpY2VDb25uZWN0aW9uXG4gICAgICovXG4gICAgdGhpcy5zZXJ2aWNlQ29ubmVjdGlvbiA9IHNlcnZpY2VDb25uZWN0aW9uO1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBwcml2YXRlIHByb3BlcnRpZXNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5cbiAgICB2YXIgX29iamVjdElkID0gJyc7XG4gICAgdmFyIF9lbGVtZW50VHlwZSA9IENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5VTktOT1dOO1xuICAgIHZhciBfY3JlYXRpb25EYXRlID0gJyc7XG4gICAgdmFyIF92YXJpYWJsZXMgPSB7fTtcbiAgICB2YXIgX3BhcmVudCA9IHt9O1xuXG4gICAgLy8gc3RydWN0dXJlU3BlY2lmaWNcbiAgICB2YXIgX2NoaWxkcmVuID0gW107XG5cbiAgICAvLyBmaWxlU3BlY2lmaWNcblxuICAgIHZhciBfYW5ub3RhdGlvbnMgPSBbXTtcbiAgICB2YXIgX2hhc2ggPSB7fTtcblxuICAgIF9oYXNoLmFsb3JpdGhtID0gJyc7XG4gICAgX2hhc2gudmFsdWUgPSAnJztcblxuICAgIHZhciBfdW5jb21wcmVzc2VkU2l6ZTtcbiAgICB2YXIgX2NvbXByZXNzZWRTaXplO1xuXG4gICAgdmFyIF9maWxlTmFtZSA9ICcnO1xuICAgIHZhciBfaXNQaWN0dXJlID0gZmFsc2U7XG4gICAgdmFyIF9pc0NodW5rZWRPbk1lZGl1bSA9IGZhbHNlO1xuICAgIHZhciBfaXNPcmlnaW5hbEZvcm1hdCA9IGZhbHNlO1xuXG4gICAgdmFyIF9kb2N1bWVudDtcblxuICAgIGlmIChkb2N1bWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGRvY3VtZW50IGlzIHJlYWxseSBhbiBkb2N1bWVudFxuICAgICAgICBfZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICB9XG5cbiAgICBpZiAocGFyZW50Q29udGVudEVsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBwYXJlbnRDb250ZW50RWxlbWVudCBpcyByZWFsbHkgYSBjb250ZW50RWxlbWVudFxuICAgICAgICBfcGFyZW50ID0gcGFyZW50Q29udGVudEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBqc29uIG1hcHBpbmdcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgdmFyIF9zZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIG1lcmdlKGpzb24pIHtcbiAgICAgICAgdmFyIGZuTmFtZSA9ICdDb250ZW50RWxlbWVudC5tZXJnZSc7XG4gICAgICAgIGxvZy52ZXJib3NlKGZuTmFtZSwnY3JlYXRlIENvbnRlbnRFbGVtZW50IGZyb20ganNvbiB7MH0nLCBKU09OLnN0cmluZ2lmeShqc29uKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLyoganNoaW50IC1XMTA2ICovIC8vIFwiZWxlbWVudF90eXBlXCIgaXMgbm90IGNhbWVsQ2FzZVxuICAgICAgICAgICAgICAgIF9lbGVtZW50VHlwZSA9IHBhcnNlRWxlbWVudFR5cGUoanNvbi5lbGVtZW50X3R5cGUpO1xuICAgICAgICAgICAgICAgIC8qIGpzaGludCAtVzEwNiAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKF9lbGVtZW50VHlwZSA9PT0gQ29udGVudEVsZW1lbnQuZWxlbWVudFR5cGVzLlVOS05PV04pIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKCdtZXJnZSBKU09OIG9uIEVsZW1lbnRUeXBlIG5vdCBmaWxlIG9yIHN0cnVjdHVyZSBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncHJvdmlkZWQganNvbiB3aWxsIG5vdCBtYXRjaCBlY20gc2VydmljZSBtb2RlbDogZWxlbWVudF90eXBlIG5vdCBwYXJzZWFibGUnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL3JlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGlmIChqc29uLnJlZmVyZW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncHJvdmlkZWQganNvbiB3aWxsIG5vdCBtYXRjaCBlY20gc2VydmljZSBtb2RlbDogcmVmZXJlbmNlIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX29iamVjdElkID0ganNvbi5yZWZlcmVuY2Uub2JqZWN0SWQ7XG4gICAgICAgICAgICAgICAgX2NyZWF0aW9uRGF0ZSA9IGpzb24uY3JlYXRpb25EYXRlIHx8IF9jcmVhdGlvbkRhdGU7XG4gICAgICAgICAgICAgICAgX3ZhcmlhYmxlcyA9IGpzb24udmFyaWFibGVzIHx8IF92YXJpYWJsZXM7XG5cblxuICAgICAgICAgICAgICAgIC8vc3RydWN0dXJlU3BlY2lmaWNcbiAgICAgICAgICAgICAgICBpZiAoX2VsZW1lbnRUeXBlID09PSBDb250ZW50RWxlbWVudC5lbGVtZW50VHlwZXMuU1RSVUNUVVJFKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHMgPSBqc29uLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IF9zZWxmO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRKc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgnZm91bmQgY2hpbGRFbGVtZW50SnNvbiB7MH0nLCBjaGlsZEpzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkQ29udGVudEVsZW1lbnQgPSBuZXcgQ29udGVudEVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXJ2aWNlQ29ubmVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZEpzb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2RvY3VtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBfY2hpbGRyZW4ucHVzaChjaGlsZENvbnRlbnRFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF9lbGVtZW50VHlwZSA9PT0gQ29udGVudEVsZW1lbnQuZWxlbWVudFR5cGVzLkZJTEUpIHtcbiAgICAgICAgICAgICAgICAgICAgX2Fubm90YXRpb25zID0ganNvbi5hbm5vdGF0aW9ucyB8fCBfYW5ub3RhdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9jb250ZW50TWV0YURhdGFcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uY29udGVudE1ldGFEYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncHJvdmlkZWQganNvbiB3aWxsIG5vdCBtYXRjaCBlY20gc2VydmljZSBtb2RlbDogY29udGVudE1ldGFEYXRhIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfaGFzaC5hbG9yaXRobSA9IGpzb24uY29udGVudE1ldGFEYXRhLmhhc2hBbGdvcml0aG0gfHwgX2hhc2guYWxvcml0aG07XG4gICAgICAgICAgICAgICAgICAgIF9oYXNoLnZhbHVlID0ganNvbi5jb250ZW50TWV0YURhdGEuaGFzaCB8fCBfaGFzaC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgX3VuY29tcHJlc3NlZFNpemUgPSBqc29uLmNvbnRlbnRNZXRhRGF0YS51bmNvbXByZXNzZWRTaXplO1xuICAgICAgICAgICAgICAgICAgICBfY29tcHJlc3NlZFNpemUgPSBqc29uLmNvbnRlbnRNZXRhRGF0YS5jb21wcmVzc2VkU2l6ZTtcblxuICAgICAgICAgICAgICAgICAgICBfZmlsZU5hbWUgPSBqc29uLmZpbGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICBfaXNQaWN0dXJlID0ganNvbi5waWN0dXJlO1xuICAgICAgICAgICAgICAgICAgICBfaXNDaHVua2VkT25NZWRpdW0gPSBqc29uLmNodW5rZWRPbk1lZGl1bTtcbiAgICAgICAgICAgICAgICAgICAgX2lzT3JpZ2luYWxGb3JtYXQgPSBqc29uLm9yaWdpbmFsRm9ybWF0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoX2VsZW1lbnRUeXBlID09PSBDb250ZW50RWxlbWVudC5lbGVtZW50VHlwZXMuTElOSykge1xuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdCB5ZXQgaGFuZGxlZFxuICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhmbk5hbWUsJ0hhbmRsaW5nIGZvciBDb250ZW50RWxlbWVudCBMSU5LIG5vdCB5ZXQgaGFuZGxlZCcpOyAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nLmVycm9yKCdtZXJnZSBlcnJvciBmb3IgRWxlbWVudDogezB9JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lcmdlKGpzb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG1lcmdlIGEganNvbiBvYmplY3Qgd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZS5cbiAgICAgKiBpbnRlcm5hbHkgdXNlZCBmb3IgdXBkYXRlcyBmcm9tIHNlcnZpY2VcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJvcGVydHkgbWVyZ2VcbiAgICAgKi9cbiAgICB0aGlzLm1lcmdlID0gbWVyZ2U7XG5cbiAgICBmdW5jdGlvbiBwYXJzZUVsZW1lbnRUeXBlKGlucHV0RWxlbWVudFR5cGUpIHtcbiAgICAgICAgaWYgKGlucHV0RWxlbWVudFR5cGUgPT09IENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5GSUxFKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29udGVudEVsZW1lbnQuZWxlbWVudFR5cGVzLkZJTEU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0RWxlbWVudFR5cGUgPT09IENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5TVFJVQ1RVUkUpIHtcbiAgICAgICAgICAgIHJldHVybiBDb250ZW50RWxlbWVudC5lbGVtZW50VHlwZXMuU1RSVUNUVVJFO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dEVsZW1lbnRUeXBlID09PSBDb250ZW50RWxlbWVudC5lbGVtZW50VHlwZXMuTElOSykge1xuICAgICAgICAgICAgcmV0dXJuIENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5MSU5LO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIG5vbmUgb2YgYWJvdmUgcmV0dXJuIFVOS05PV05cbiAgICAgICAgcmV0dXJuIENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5VTktOT1dOO1xuICAgIH1cblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gZ2V0dGVyIGFuZCBzZXR0ZXJcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgLyoqXG4gICAgICogdHlwZWQgaWRlbnRpZmllciBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdElkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBkZXBlbmRlZCBkb2N1bWVudCBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGRvY3VtZW50XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdkb2N1bWVudCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2RvY3VtZW50O1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLyoqXG4gICAgICogZWxlbWVudFR5cGUgb2YgdGhpcyBlbGVtZW50XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBlbGVtZW50VHlwZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZWxlbWVudFR5cGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9lbGVtZW50VHlwZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdHJ1ZSBpZiB0aGUgY29udGVudEVsZW1lbnQgcmVwcmVzZW50cyBhIGZpbGVcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlzRmlsZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNGaWxlJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfZWxlbWVudFR5cGUgPT09IENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5GSUxFO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiB0cnVlIGlmIHRoZSBjb250ZW50RWxlbWVudCByZXByZXNlbnRzIGEgc3RydWN0dXJlXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpc1N0cnVjdHVyZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNTdHJ1Y3R1cmUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9lbGVtZW50VHlwZSA9PT0gQ29udGVudEVsZW1lbnQuZWxlbWVudFR5cGVzLlNUUlVDVFVSRTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdHJ1ZSBpZiB0aGUgY29udGVudEVsZW1lbnQgcmVwcmVzZW50cyBhIGxpbmtcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlzTGlua1xuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNMaW5rJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfZWxlbWVudFR5cGUgPT09IENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5MSU5LO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLyoqXG4gICAgICogZmlsZU5hbWUgaWRlbnRpZmllciBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGZpbGVOYW1lXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdmaWxlTmFtZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVzID0gX2ZpbGVOYW1lO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgaW5kZXggPSByZXMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+PTAgKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gIHJlcy5zdWJzdHJpbmcoaW5kZXgrMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluZGV4ID0gcmVzLmxhc3RJbmRleE9mKCdcXFxcJyk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPj0wICkge1xuICAgICAgICAgICAgICAgIHJlcyA9ICByZXMuc3Vic3RyaW5nKGluZGV4KzEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbmRleCA9IHJlcy5sYXN0SW5kZXhPZignQCcpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID49MCApIHtcbiAgICAgICAgICAgICAgICByZXMgPSAgcmVzLnN1YnN0cmluZygwLGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHNpemUgb2YgYmluYXJ5Q29udGVudCBvZiB0aGUgY29udGVudEVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHNpemVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NpemUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF91bmNvbXByZXNzZWRTaXplO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiB0cnVlIGlmIHRoaXMgY29udGVudEVsZW1lbnQgY29udGFpbnMgYSBwYXJlbnQgQ29udGVudEVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGhhc1BhcmVudFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaGFzUGFyZW50Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhKF9wYXJlbnQgPT09IHVuZGVmaW5lZCB8fCBfcGFyZW50LmtleXMgPT09IHVuZGVmaW5lZCB8fCBfcGFyZW50LmtleXMubGVuZ3RoID09PSAwKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgKiByZXR1cm5zIHRoZSBwYXJlbnRFbGVtZW50IGlmIGV4aXRzdHMgb3IgdW5kZWZpbmRlZCBpZiB0aGlzIGNvbnRlbnRFbGVtZW50IGNvbnRhaW5zIGNoaWxkcmVuIGVsZW1lbnRzXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBwYXJlbnRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3BhcmVudCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3BhcmVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdHJ1ZSBpZiB0aGlzIGNvbnRlbnRFbGVtZW50IGNvbnRhaW5zIGNoaWxkcmVuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBoYXNDaGlsZHJlblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaGFzQ2hpbGRyZW4nLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfY2hpbGRyZW4gIT09IHVuZGVmaW5lZCAmJiBfY2hpbGRyZW4ubGVuZ3RoID4gMCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgYSBsaXN0IG9mIGNoaWxkcmVuIGluIHN0cnVjdHVyZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgY2hpbGRyZW5cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NoaWxkcmVuJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jaGlsZHJlbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGEgZmxhdCBsaXN0IG9mIGNoaWxkcmVuIHdoaWNoIGFyZSBmaWxlc1xuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgY2hpbGRyZW5GaWxlc0xpc3RcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NoaWxkcmVuRmlsZXNMaXN0Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcnIgPSBbXTtcbiAgICAgICAgICAgIF9jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5lbGVtZW50VHlwZSA9PT0gQ29udGVudEVsZW1lbnQuZWxlbWVudFR5cGVzLkZJTEUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuZWxlbWVudFR5cGUgPT09IENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5TVFJVQ1RVUkUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyID0gYXJyLmNvbmNhdChjaGlsZC5jaGlsZHJlbkZpbGVzTGlzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHRoZSBoYXNoT2JqZWN0IG9mIHRoZSBlbGVtZW50IGlmIGl0IGlzIGEgZmlsZUVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGhhc2hcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2hhc2gnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNGaWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9oYXNoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cblxuXG59IC8vZW5kIGNvbnN0cnVjdG9yXG5cblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vIGluc3RhbmNlIGZ1bmN0aW9uc1xuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuQ29udGVudEVsZW1lbnQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRUeXBlID09PSBDb250ZW50RWxlbWVudC5lbGVtZW50VHlwZXMuRklMRSApIHtcbiAgICAgICAgcmV0dXJuICdGaWxlOiAnICsgIHRoaXMuZmlsZU5hbWUgKyAnKFNpemU6ICcgKyB0aGlzLnNpemUgKyAnIEJ5dGVzIHwgSUQ6ICcgKyB0aGlzLmlkICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnRWxlbWVudDogJyArICB0aGlzLmVsZW1lbnRUeXBlICsgJyggSUQ6ICcgKyB0aGlzLmlkICsgJyknO1xuICAgIH0gXG59O1xuXG4vL3VwZGF0ZSB0aGUgY3VycmVudCBpbnN0YW5jZSB3aXRoIGRhdGEgZnJvbSBzZXJ2aWNlXG5Db250ZW50RWxlbWVudC5wcm90b3R5cGUuZ2V0QmluYXJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmbk5hbWUgPSAnQ29udGVudEVsZW1lbnQuZ2V0QmluYXJ5JztcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgaWYgKHNlbGYuZWxlbWVudFR5cGUgIT09IENvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcy5GSUxFKSB7XG4gICAgICAgICAgICBmYWlsZWQoJ2dldCBCaW5hcnkgbm90IHN1cHBvcnRlZCBvbiBlbGVtZW50IE5PVCBmaWxlJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGZuTmFtZSk7XG4gICAgICAgICAgICBodHRwLmdldEJpbmFyeShzZWxmLnNlcnZpY2VDb25uZWN0aW9uLCAoKGh0dHAuZW5kcG9pbnRzLmNvbnRlbnQuZG9jdW1lbnQuZWxlbWVudCkucmVwbGFjZSgne3JldmlzaW9ufScsIHNlbGYuZG9jdW1lbnQucmV2aXNpb25JZCkpLnJlcGxhY2UoJ3tlbGVtZW50fScsIHNlbGYuaWQpKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChiaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLnZlcmJvc2UoZm5OYW1lLCdyZWNlaXZlZCBiaW5hcnkgd2l0aCBsZW5ndGg6IHswfScsIGJpbi5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdmFsaWRhdGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJpbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8gZGF0YSByZWNlaXZlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKGJpbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJySHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJJbml0KTtcbiAgICAgICAgICAgIGZhaWxlZChlcnJJbml0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vIHN0YXRpYyBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbkNvbnRlbnRFbGVtZW50LmVsZW1lbnRUeXBlcyA9IHtcbiAgICBGSUxFOiAnZmlsZScsXG4gICAgU1RSVUNUVVJFOiAnc3RydWN0dXJlJyxcbiAgICBMSU5LOidsaW5rJyxcbiAgICBVTktOT1dOOiAnVU5LTk9XTidcbn07XG5cbk9iamVjdC5mcmVlemUoQ29udGVudEVsZW1lbnQuZWxlbWVudFR5cGVzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250ZW50RWxlbWVudDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBodHRwID0gcmVxdWlyZSgnLi8uLi9jb21tdW5pY2F0aW9uL2h0dHBIZWxwZXInKTtcbnZhciBBcmNoaXZlID0gcmVxdWlyZSgnLi9hcmNoaXZlJyk7XG52YXIgRG9jdW1lbnQgPSByZXF1aXJlKCcuL2RvY3VtZW50Jyk7XG5cbi8qKlxuICogU2FwZXJpb24gQ29udGVudCBNYW5hZ2VyIHdoaWNoIHByb3ZpZGVzIGFjY2VzcyB0byBjb250ZW50IHJlbGF0ZWQgZnVuY3Rpb25zIGFuZCBvYmplY3RzLlxuICogXG4gKiBAbW9kdWxlIGNvbnRlbnRcbiAqIEBjbGFzcyBDb250ZW50TWFuYWdlclxuICogQHR5cGUgT2JqZWN0XG4gKi9cbmZ1bmN0aW9uIENvbnRlbnRNYW5hZ2VyKHNlcnZpY2VDb25uZWN0aW9uKSB7XG4gICAgaWYgKCFzZXJ2aWNlQ29ubmVjdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbiBpcyBub3Qgc2V0Jyk7XG5cbiAgICBodHRwLnZhbGlkYXRlU2VydmljZUNvbm5lY3Rpb24oc2VydmljZUNvbm5lY3Rpb24pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzZXJ2aWNlQ29ubmVjdGlvbicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VydmljZUNvbm5lY3Rpb247XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuQ29udGVudE1hbmFnZXIucHJvdG90eXBlLmdldEFyY2hpdmVzID0gZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICByZXR1cm4gQXJjaGl2ZS5nZXRBbGxBcmNoaXZlcyh0aGlzLnNlcnZpY2VDb25uZWN0aW9uLCBwYWdlKTtcbn07XG5cbi8vVE9ETzogZGVzY3JpYmUgcGFyYW1ldGVyc1xuQ29udGVudE1hbmFnZXIucHJvdG90eXBlLmdldERvY3VtZW50QnlJZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgIHJldHVybiBEb2N1bWVudC5nZXREb2N1bWVudEJ5SWQodGhpcy5zZXJ2aWNlQ29ubmVjdGlvbiwgaWQpO1xufTtcblxuQ29udGVudE1hbmFnZXIucHJvdG90eXBlLmdldERvY3VtZW50QnlSZXZpc2lvbklkID0gZnVuY3Rpb24gKHJldmlzaW9uSWQpIHtcbiAgICByZXR1cm4gRG9jdW1lbnQuZ2V0RG9jdW1lbnRCeVJldmlzaW9uSWQodGhpcy5zZXJ2aWNlQ29ubmVjdGlvbiwgcmV2aXNpb25JZCk7XG59O1xuXG5Db250ZW50TWFuYWdlci5wcm90b3R5cGUuZ2V0RG9jdW1lbnRCeVVybCA9IGZ1bmN0aW9uIChyZWZlcmVuY2VVcmwpIHtcbiAgICByZXR1cm4gRG9jdW1lbnQuZ2V0RG9jdW1lbnRCeVVybCh0aGlzLnNlcnZpY2VDb25uZWN0aW9uLCByZWZlcmVuY2VVcmwpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250ZW50TWFuYWdlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL2xvZ01hbmFnZXIuanMnKTtcbnZhciBodHRwID0gcmVxdWlyZSgnLi8uLi9jb21tdW5pY2F0aW9uL2h0dHBIZWxwZXInKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi8uLi9pbnRlcm5hbC91dGlsaXRpZXMnKTtcbnZhciBQYWdlSW5mbyA9IHJlcXVpcmUoJy4vLi4vY29tbW9uL3BhZ2VJbmZvJyk7XG4vL3ZhciBBcmNoaXZlID0gcmVxdWlyZSgnLi9hcmNoaXZlJyk7XG52YXIgQ29udGVudEVsZW1lbnQgPSByZXF1aXJlKCcuL2NvbnRlbnRFbGVtZW50Jyk7XG52YXIgQWN0b3IgPSByZXF1aXJlKCcuLy4uL2NvbW1vbi9hY3RvclJlZmVyZW5jZScpO1xuXG4vKipcbiAqIFNhcGVyaW9uIERvY3VtZW50LlxuICpcbiAqIEBtb2R1bGUgY29udGVudFxuICogQGNsYXNzIERvY3VtZW50XG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuZnVuY3Rpb24gRG9jdW1lbnQoc2VydmljZUNvbm5lY3Rpb24sIGpzb24sIGFyY2hpdmUpIHtcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIG9iamVjdCBpbml0aWFsaXphdGlvbiBhc3NlcnRpb25zXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIGlmICghc2VydmljZUNvbm5lY3Rpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbiBpcyBub3Qgc2V0Jyk7XG4gICAgfVxuICAgIGh0dHAudmFsaWRhdGVTZXJ2aWNlQ29ubmVjdGlvbihzZXJ2aWNlQ29ubmVjdGlvbik7XG5cbiAgICAvKipcbiAgICAgKiBjb25uZWN0aW9uIHdoaWNoIGlzIHVzZWQgZm9yIGNvbW11bmljYXRpb25cbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHNlcnZpY2VDb25uZWN0aW9uXG4gICAgICovXG4gICAgdGhpcy5zZXJ2aWNlQ29ubmVjdGlvbiA9IHNlcnZpY2VDb25uZWN0aW9uO1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBwcml2YXRlIHByb3BlcnRpZXNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgdmFyIF9kb2N1bWVudElkID0gJyc7XG4gICAgdmFyIF9vYmplY3RVcmwgPSAnJztcbiAgICB2YXIgX3JldmlzaW9uSWQgPSAnJztcbiAgICB2YXIgX3ByZXZpb3VzUmV2aXNpb25JZCA9ICcnO1xuICAgIHZhciBfaW5kZXhEYXRhID0ge307XG5cbiAgICB2YXIgX2NvbnRlbnQ7XG5cbiAgICAvL1RPRE86IHJlbW92ZSBsYXRlcjoganVzdCB0ZW1wb3JhcnlcbiAgICB2YXIgX2NvbnRlbnRKc29uID0gJyc7XG5cblxuICAgIHZhciBfYXJjaGl2ZSA9IHt9O1xuXG4gICAgaWYgKGFyY2hpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBhcmNoaXZlIGlzIHJlYWxseSBhbiBhcmNoaXZlXG4gICAgICAgIF9hcmNoaXZlID0gYXJjaGl2ZTtcbiAgICB9XG5cbiAgICB2YXIgX2NyZWF0aW9uRGF0ZTtcbiAgICB2YXIgX2NyZWF0aW9uVXNlcjtcbiAgICB2YXIgX2xhc3RNb2RpZmljYXRpb25EYXRlO1xuICAgIHZhciBfbGFzdE1vZGlmaWNhdGlvblVzZXI7XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIGpzb24gbWFwcGluZ1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICB2YXIgX3NlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2UoanNvbikge1xuICAgICAgICB2YXIgZm5OYW1lID0gJ0RvY3VtZW50Lm1lcmdlJztcbiAgICAgICAgbG9nLnZlcmJvc2UoZm5OYW1lLCAnY3JlYXRlIGRvY3VtZW50IGZyb20ganNvbiB7MH0nLCBKU09OLnN0cmluZ2lmeShqc29uKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICAvL3JlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGlmIChqc29uLnJlZmVyZW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGpzb24gZnJvbSBzZXJ2aWNlXG4gICAgICAgICAgICAgICAgICAgIF9yZXZpc2lvbklkID0ganNvbi5yZWZlcmVuY2Uub2JqZWN0SWQ7XG4gICAgICAgICAgICAgICAgICAgIF9vYmplY3RVcmwgPSBqc29uLnJlZmVyZW5jZS5zZWxmO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGpzb24gYXMgZG9jdW1lbnRSZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgX29iamVjdFVybCA9IGpzb24uc2VsZjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoanNvbi5kb2N1bWVudElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX2RvY3VtZW50SWQgPSBqc29uLmRvY3VtZW50SWQub2JqZWN0SWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGpzb24ucHJldmlvdXNSZXZpc2lvbklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3ByZXZpb3VzUmV2aXNpb25JZCA9IGpzb24ucHJldmlvdXNSZXZpc2lvbklkLm9iamVjdElkIHx8IF9kb2N1bWVudElkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vYXJjaGl2ZVJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGlmIChqc29uLmFyY2hpdmVSZWZlcmVuY2UgIT09IHVuZGVmaW5lZCAmJiBfYXJjaGl2ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYganNvbi5hcmNoaXZlUmVmZXJlbmNlIGlzIGF2YWlsYWJsZSBpbiBKU09OOiBjYWxsIHdhcyBwb3RlbnRpYWxseSBmcm9tIGRvY3VtZW50LnVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAvL2lmIGpzb24uYXJjaGl2ZVJlZmVyZW5jZSBpcyBOT1QgYXZhaWxhYmxlIGluIEpTT046IGNhbGwgd2FzIGZyb20gcG90ZXRpYWxseSBmcm9tIGFyY2hpdmUuZ2V0RG9jdW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIC8vVGhlcmUgaXMgbm8gbmVlZCB0byB1cGRhdGUgX2FyY2hpdmUgaWYgaXRzIGFscmVhZHkgZXhpc3RpbmcgKHdvdWxkIFwibmV2ZXJcIiBjaGFuZ2UgYW5kIGZyb20gZG9jdW1lbnQudXBkYXRlIHRoZXJlIHdpbGwgYmUganVzdCBhIHJlZmVyZW5jZSlcbiAgICAgICAgICAgICAgICAgICAgLy9fYXJjaGl2ZSA9IG5ldyBBcmNoaXZlKF9zZWxmLnNlcnZpY2VDb25uZWN0aW9uLCBqc29uLmFyY2hpdmVSZWZlcmVuY2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vaW5kZXhEYXRhXG4gICAgICAgICAgICAgICAgX2luZGV4RGF0YSA9IGpzb24uaW5kZXhEYXRhIHx8IF9pbmRleERhdGE7XG5cbiAgICAgICAgICAgICAgICAvL21vZGlmaWNhdGlvbk1ldGFEYXRhXG4gICAgICAgICAgICAgICAgaWYgKGpzb24ubW9kaWZpY2F0aW9uTWV0YURhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBfY3JlYXRpb25EYXRlID0ganNvbi5tb2RpZmljYXRpb25NZXRhRGF0YS5jcmVhdGlvbkRhdGU7XG4gICAgICAgICAgICAgICAgICAgIF9jcmVhdGlvblVzZXIgPSBuZXcgQWN0b3IoX3NlbGYuc2VydmljZUNvbm5lY3Rpb24sIGpzb24ubW9kaWZpY2F0aW9uTWV0YURhdGEuY3JlYXRpb25Vc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgX2xhc3RNb2RpZmljYXRpb25EYXRlID0ganNvbi5tb2RpZmljYXRpb25NZXRhRGF0YS5sYXN0TW9kaWZpY2F0aW9uRGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgX2xhc3RNb2RpZmljYXRpb25Vc2VyID0gbmV3IEFjdG9yKF9zZWxmLnNlcnZpY2VDb25uZWN0aW9uLCBqc29uLm1vZGlmaWNhdGlvbk1ldGFEYXRhLmxhc3RNb2RpZmljYXRpb25Vc2VyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBjb250ZW50TWV0YURhdGE6aWdub3JlZCBmb3Igbm93XG5cbiAgICAgICAgICAgICAgICAvL2RvY3VtZW50RWxlbWVudFxuICAgICAgICAgICAgICAgIGlmIChqc29uLmRvY3VtZW50RWxlbWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb250ZW50SnNvbiA9IGpzb24uZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBfY29udGVudCA9IG5ldyBDb250ZW50RWxlbWVudChfc2VsZi5zZXJ2aWNlQ29ubmVjdGlvbiwganNvbi5kb2N1bWVudEVsZW1lbnQsIF9zZWxmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCAnbWVyZ2UgZXJyb3IgZm9yIGRvY3VtZW50OiB7MH0nLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChqc29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbWVyZ2UoanNvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogbWVyZ2UgYSBqc29uIG9iamVjdCB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlLlxuICAgICAqIGludGVybmFseSB1c2VkIGZvciB1cGRhdGVzIGZyb20gc2VydmljZVxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcm9wZXJ0eSBtZXJnZVxuICAgICAqL1xuICAgIHRoaXMubWVyZ2UgPSBtZXJnZTtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gZ2V0dGVyIGFuZCBzZXR0ZXJcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgLyoqXG4gICAgICogdHlwZWQgaWRlbnRpZmllciBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2RvY3VtZW50SWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHJlZmVyZW5jZVVybCBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHJlZmVyZW5jZVVybFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVmZXJlbmNlVXJsJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfb2JqZWN0VXJsO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiByZXZpc2lvbklkIG9mIHRoaXMgZWxlbWVudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgcmV2aXNpb25JZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmV2aXNpb25JZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JldmlzaW9uSWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHByZXZpb3VzUmV2aXNpb25JZCBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHByZXZpb3VzUmV2aXNpb25JZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncHJldmlvdXNSZXZpc2lvbklkJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfcHJldmlvdXNSZXZpc2lvbklkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHdoZXRoZXIgZG9jdW1lbnQgaGFzIHByZXZpb3VzIHJldmlzaW9uIG9yIG5vdFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgaGFzUHJldmlvdXNSZXZpc2lvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaGFzUHJldmlvdXNSZXZpc2lvbicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKF9wcmV2aW91c1JldmlzaW9uSWQgIT09IHVuZGVmaW5lZCkgJiYgKF9wcmV2aW91c1JldmlzaW9uSWQubGVuZ3RoID4gMCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIGluZGV4RGF0YSBvZiB0aGUgRG9jdW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGluZGV4RGF0YVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaW5kZXhEYXRhJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfaW5kZXhEYXRhO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGlvbkRhdGUgb2YgdGhlIERvY3VtZW50XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBjcmVhdGlvbkRhdGVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NyZWF0aW9uRGF0ZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoX2NyZWF0aW9uRGF0ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIGNyZWF0b3Igb2YgdGhlIERvY3VtZW50XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBjcmVhdG9yXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjcmVhdG9yJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfY3JlYXRpb25Vc2VyO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBsYXN0TW9kaWZpY2F0aW9uRGF0ZSBvZiB0aGUgRG9jdW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGxhc3RNb2RpZmljYXRpb25EYXRlXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdsYXN0TW9kaWZpY2F0aW9uRGF0ZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoX2xhc3RNb2RpZmljYXRpb25EYXRlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogbGFzdE1vZGlmaWVyIG9mIHRoZSBEb2N1bWVudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgbGFzdE1vZGlmaWVyXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdsYXN0TW9kaWZpZXInLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9sYXN0TW9kaWZpY2F0aW9uVXNlcjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQXJjaGl2ZSB3aGVyZSB0aGlzIGRvY3VtZW50IGlzIGxvY2F0ZWRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGFyY2hpdmVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2FyY2hpdmUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9hcmNoaXZlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBmYWxzZSBpZiB0aGlzIGRvY3VtZW50IGRvZXMgbm90IGNvbnRhaW5zIGNvbnRlbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGhhc0NvbnRlbnRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2hhc0NvbnRlbnQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfY29udGVudCAhPT0gdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ29ubnRlbnRFbGVtZW50IG9mIHRoaXMgZG9jdW1lbnQgXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBlbGVtZW50XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjb250ZW50Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0NvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2NvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgYWxsIENvbnRlbnRFbGVtZW50cyBvZiB0aGlzIGRvY3VtZW50IHdoaWNoIGFyZSBGaWxlc3NcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGVsZW1lbnRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbnRlbnRMaXN0Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0NvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250ZW50LmVsZW1lbnRUeXBlID09PSBDb250ZW50RWxlbWVudC5lbGVtZW50VHlwZXMuRklMRSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3RoaXMuY29udGVudF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZW50LmNoaWxkcmVuRmlsZXNMaXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvKipcbiAgICAgKiBmYWxzZSBpZiB0aGlzIGRvY3VtZW50IGluZm8gY29udGFpbnMgb25seSBhIHJlZHVjZWQgc2V0IG9mIGRhdGEgKHNwZWNpZmllZCBieSB0aGUgc2VydmljZSBjb2xsZWN0aW9ucylcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlzUmVkdWNlZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNSZWR1Y2VkJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhc0NvbnRlbnQgPT09IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0gLy9lbmQgY29uc3RydWN0b3JcblxuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuLy8gaW5zdGFuY2UgZnVuY3Rpb25zXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5Eb2N1bWVudC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdEb2N1bWVudDogKElEICcgKyB0aGlzLmlkICsgJyAgfCBmcm9tIGFyY2hpdmU6ICcgKyB0aGlzLmFyY2hpdmUubmFtZSArICcpJztcbn07XG5cbi8vcmVmcmVzaGVzICB0aGUgY3VycmVudCBpbnN0YW5jZSB3aXRoIGRhdGEgZnJvbSBzZXJ2aWNlXG5Eb2N1bWVudC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZm5OYW1lID0gJ0RvY3VtZW50LnJlZnJlc2gnO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWxlZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9nLmluZm8oZm5OYW1lKTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBzZWxmLnJlZmVyZW5jZVVybDtcblxuICAgICAgICAgICAgaWYgKHVybCA9PT0gdW5kZWZpbmVkIHx8IHVybC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCAnaW52YWxpZCB1cmw6ICcgKyB1cmwpO1xuICAgICAgICAgICAgICAgIGZhaWxlZChuZXcgRXJyb3IoJ0Vycm9yIG9uIHVybCBpbmZvcm1hdGlvbicpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaHR0cC5nZXRKc29uKHNlbGYuc2VydmljZUNvbm5lY3Rpb24sIHVybClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZShmbk5hbWUsICdyZWNlaXZlZCBkb2N1bWVudDogezB9JywgSlNPTi5zdHJpbmdpZnkoanNvbikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdmFsaWRhdGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWpzb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChuZXcgRXJyb3IoJ25vIGpzb24gcmVjZWl2ZWQnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5tZXJnZShqc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbkRvY3VtZW50LnByb3RvdHlwZS5nZXRQcmV2aW91c1JldmlzaW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmbk5hbWUgPSAnRG9jdW1lbnQuZ2V0UHJldmlvdXNSZXZpc2lvbic7XG4gICAgbG9nLmluZm8oZm5OYW1lKTtcbiAgICBpZiAoIXRoaXMuaGFzUHJldmlvdXNSZXZpc2lvbikge1xuICAgICAgICBsb2cuaW5mbyhmbk5hbWUsICdubyBwcmV2aW91cyByZXZpc2lvbiBhdmFpbGFibGUnKTtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ25vIHByZXZpb3VzIHJldmlzaW9uIGF2YWlsYWJsZScpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gRG9jdW1lbnQuZ2V0RG9jdW1lbnRCeVJldmlzaW9uSWQodGhpcy5wcmV2aW91c1JldmlzaW9uSWQpO1xufTtcblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vIHN0YXRpYyBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cblxuRG9jdW1lbnQuZ2V0RG9jdW1lbnRCeUlkID0gZnVuY3Rpb24gKHNlcnZpY2VDb25uZWN0aW9uLCBpZCkge1xuICAgIHZhciBmbk5hbWUgPSAnRG9jdW1lbnQuZ2V0RG9jdW1lbnRCeUlkJztcbiAgICBsb2cuaW5mbyhmbk5hbWUpO1xuXG4gICAgLy9UT0RPOiB0aGluayBhYm91dCBwbGFjZUhvbGRlclxuICAgIHZhciB1cmwgPSAoaHR0cC5lbmRwb2ludHMuY29udGVudC5kb2N1bWVudC5kZXRhaWxzKS5yZXBsYWNlKCd7ZG9jdW1lbnR9JywgaWQpO1xuXG4gICAgcmV0dXJuIERvY3VtZW50LmdldERvY3VtZW50QnlVcmwoc2VydmljZUNvbm5lY3Rpb24sIHVybCk7XG59O1xuXG5Eb2N1bWVudC5nZXREb2N1bWVudEJ5UmV2aXNpb25JZCA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgcmV2aXNpb25JZCkge1xuICAgIHZhciBmbk5hbWUgPSAnRG9jdW1lbnQuZ2V0RG9jdW1lbnRCeVJldmlzaW9uSWQnO1xuICAgIGxvZy5pbmZvKGZuTmFtZSk7XG5cbiAgICB2YXIgdXJsID0gKGh0dHAuZW5kcG9pbnRzLmNvbnRlbnQuZG9jdW1lbnQucmV2aXNpb24pLnJlcGxhY2UoJ3tyZXZpc2lvbn0nLCByZXZpc2lvbklkKTtcblxuICAgIHJldHVybiBEb2N1bWVudC5nZXREb2N1bWVudEJ5VXJsKHNlcnZpY2VDb25uZWN0aW9uLCB1cmwpO1xufTtcblxuRG9jdW1lbnQuZ2V0RG9jdW1lbnRCeVVybCA9IGZ1bmN0aW9uIChzZXJ2aWNlQ29ubmVjdGlvbiwgdXJsKSB7XG4gICAgdmFyIGZuTmFtZSA9ICdEb2N1bWVudC5nZXREb2N1bWVudEJ5T2JqZWN0VXJsJztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuaW5mbyhmbk5hbWUpO1xuICAgICAgICAgICAgaWYgKHVybCA9PT0gdW5kZWZpbmVkIHx8IHVybC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCAnaW52YWxpZCB1cmw6ICcgKyB1cmwpO1xuICAgICAgICAgICAgICAgIGZhaWxlZChuZXcgRXJyb3IoJ0Vycm9yIG9uIHVybCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaHR0cC5nZXRKc29uKHNlcnZpY2VDb25uZWN0aW9uLCB1cmwpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLnZlcmJvc2UoJ3JlY2VpdmVkIGpzb246IHswfScsIEpTT04uc3RyaW5naWZ5KGpzb24pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghanNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8ganNvbiByZWNlaXZlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZG9jID0gbmV3IERvY3VtZW50KHNlcnZpY2VDb25uZWN0aW9uLCBqc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKGRvYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJySHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJJbml0KTtcbiAgICAgICAgICAgIGZhaWxlZChlcnJJbml0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuXG5Eb2N1bWVudC5nZXREb2N1bWVudHNGcm9tQXJjaGl2ZSA9IGZ1bmN0aW9uIChhcmNoaXZlLCBwYWdlLCBkZXRhaWxlZCkge1xuICAgIHZhciBmbk5hbWUgPSAnRG9jdW1lbnQuZ2V0RG9jdW1lbnRzRnJvbUFyY2hpdmUnO1xuICAgIGlmIChwYWdlID09PSB1bmRlZmluZWQpIHBhZ2UgPSAxO1xuICAgIGlmIChkZXRhaWxlZCA9PT0gdW5kZWZpbmVkKSBkZXRhaWxlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGZuTmFtZSk7XG4gICAgICAgICAgICBodHRwLmdldEpzb24oYXJjaGl2ZS5zZXJ2aWNlQ29ubmVjdGlvbiwgKGh0dHAuZW5kcG9pbnRzLmNvbnRlbnQuYXJjaGl2ZXMuZG9jdW1lbnRzLmFsbCkucmVwbGFjZSgne2FyY2hpdmV9JywgaHR0cC5lbmNvZGVVcmlDb21wb25lbnQoYXJjaGl2ZS5pZCkpKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy52ZXJib3NlKGZuTmFtZSwgJ3JlY2VpdmVkIGRvY3VtZW50czogezB9JywgSlNPTi5zdHJpbmdpZnkoanNvbikpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy92YWxpZGF0ZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghanNvbi5pdGVtcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8gaXRlbXMgY29sbGVjdGlvbiByZWNlaXZlZCcpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29udmVydCBqc29uIHRvIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkb2N1bWVudENvbGxlY3Rpb24gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZUNvbGxlY3Rpb24gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoZG9jdW1lbnRKc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkb2N1bWVudCA9IG5ldyBEb2N1bWVudChhcmNoaXZlLnNlcnZpY2VDb25uZWN0aW9uLCBkb2N1bWVudEpzb24sIGFyY2hpdmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudENvbGxlY3Rpb24ucHVzaChkb2N1bWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXRhaWxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZUNvbGxlY3Rpb24ucHVzaChkb2N1bWVudC5yZWZyZXNoKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlQ29sbGVjdGlvbikudGhlbihmdW5jdGlvbiAoZGV0YWlsZWREb2N1bWVudENvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmluZm8oZm5OYW1lLCAnYWxsIGRvY3VtZW50cyByZWNlaXZlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRvY3VtZW50Q29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VJbmZvOiBuZXcgUGFnZUluZm8oanNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRG9jdW1lbnQ7IiwiLy8gaW4gdGhpcyBjbGFzcyB3ZSBkZWZpbmluZyB0aGUgcHVibGljIHNkayBhcGkgYW5kIGV4cG9zaW5nIGFsbCBuZWNlc3Nhcnkgb2JqZWN0cyAvIGZ1bmN0aW9uc1xuXG52YXIgbG9nZ2VyID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9sb2dNYW5hZ2VyLmpzJyk7XG5sb2dnZXIuc2V0TG9nTGV2ZWwobG9nZ2VyLmxldmVscy5XYXJuKTtcblxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvdXRpbGl0aWVzJyk7XG5cbmNvbnN0IHNka1ZlcnNpb24gPSAnc2RrdmVyc2lvbnBsYWNlaG9sZGVyJztcbi8vdGhpcyB2YWx1ZSB3aWxsIGJlIGNvbXBhcmVkIHdpdGggdGVoIHNlcnZpY2UgcHJvZHVjdCB2ZXJzaW9uIG1ham9yXG5jb25zdCBtaW5TZXJ2aWNlVmVyc2lvbk1ham9yID0gMTtcbi8vdGhpcyB2YWx1ZSB3aWxsIGJlIGNvbXBhcmVkIHdpdGggdGVoIHNlcnZpY2UgcHJvZHVjdCB2ZXJzaW9uIG1ham9yXG5jb25zdCBtaW5TZXJ2aWNlVmVyc2lvbk1pbm9yID0gMDtcblxudmFyIHNkayA9IHNkayB8fCB7fTtcblxuc2RrLnV0aWxpdGllcyA9IHNkay51dGlsaXRpZXMgfHwge307XG5zZGsuY29uZmlndXJhdGlvbiA9IHNkay5jb25maWd1cmF0aW9uIHx8IHt9O1xuXG4vKipcbiAqIEF2YWlsYWJsZSBsb2cgbGV2ZWxzLlxuICogXG4gKiBAcHJvcGVydHkgbGV2ZWwge09iamVjdH0gTG9nIGxldmVscy5cbiAqICBAcHJvcGVydHkge051bWJlcn0gbGV2ZWwuTm9uZSBEaXNhYmxlIGxvZ2dpbmcuXG4gKiAgQHByb3BlcnR5IHtOdW1iZXJ9IGxldmVsLkVycm9yIExvZyBlcnJvcnMuXG4gKiAgQHByb3BlcnR5IHtOdW1iZXJ9IGxldmVsLldhcm4gTG9nIHdhcm5pbmdzLlxuICogIEBwcm9wZXJ0eSB7TnVtYmVyfSBsZXZlbC5JbmZvIExvZyBpbmZvLlxuICogIEBwcm9wZXJ0eSB7TnVtYmVyfSBsZXZlbC5WZXJib3NlIExvZyBldmVyeXRoaW5nLlxuICogQHN0YXRpY1xuICogXG4gKi9cbnNkay5jb25maWd1cmF0aW9uLmxvZ0xldmVscyA9IGxvZ2dlci5sZXZlbHM7XG5cbi8qKlxuICogU2V0IGxvZyBsZXZlbC5cbiAqIFxuICogQG1ldGhvZCBzZXRMb2dMZXZlbFxuICogQHBhcmFtIHt0eXBlfSBsZXZlbFxuICogXG4gKiBAdGhyb3dzIHtFcnJvcn0gTm90IGV4aXN0aW5nIGxvZyBsZXZlbC5cbiAqL1xuc2RrLmNvbmZpZ3VyYXRpb24uc2V0TG9nTGV2ZWwgPSBsb2dnZXIuc2V0TG9nTGV2ZWw7XG5cbi8vVE9ETzogZG9jdW1lbnRhdGlvblxuc2RrLkNyZWRlbnRpYWxBdXRoZW50aWNhdGlvbiA9IHJlcXVpcmUoJy4vY29tbXVuaWNhdGlvbi9jcmVkZW50aWFsQXV0aFByb3ZpZGVyJyk7XG5cbnNkay5Ub2tlbkF1dGhlbnRpY2F0aW9uID0gcmVxdWlyZSgnLi9jb21tdW5pY2F0aW9uL3Rva2VuQXV0aFByb3ZpZGVyLmpzJyk7XG5cbnNkay5BdXRoZW50aWNhdGlvblRva2VuID0gcmVxdWlyZSgnLi9jb21tdW5pY2F0aW9uL2F1dGhlbnRpY2F0aW9uVG9rZW4nKTtcblxuc2RrLlNlcnZpY2VDb25uZWN0aW9uID0gcmVxdWlyZSgnLi9jb21tdW5pY2F0aW9uL3NlcnZpY2VDb25uZWN0aW9uJyk7XG5cbnNkay5Xb3JrZmxvd01hbmFnZXIgPSByZXF1aXJlKCcuL3dvcmtmbG93L3dvcmtmbG93TWFuYWdlcicpO1xuXG5zZGsuQ29udGVudE1hbmFnZXIgPSByZXF1aXJlKCcuL2NvbnRlbnQvY29udGVudE1hbmFnZXInKTtcblxuLy9zZGsuRG9jdW1lbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9kb2N1bWVudHMvZG9jdW1lbnRNYW5hZ2VyJyk7XG5cbnNkay5Vc2VyTWFuYWdlciA9IHJlcXVpcmUoJy4vYWRtaW5pc3RyYXRpb24vdXNlck1hbmFnZXInKTtcblxuLypcbi8vaGVscGVyc1xuc2RrLnV0aWxpdGllcy5pc05vbkVtcHR5U3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gKCh0eXBlb2YgcyA9PT0gJ3N0cmluZycpICYmIHMubGVuZ3RoICYmIHMubGVuZ3RoID4gMCk7XG59O1xuKi9cblxuLyoqXG4gKiBWZXJzaW9uIG9mIHRoZSBzZGtcbiAqIFxuICogQHByb3BlcnR5IHNka1ZlcnNpb25cbiAqIEBwdWJsaWNcbiAqIEB0eXBlIHN0cmluZ1xuICovXG5zZGsudmVyc2lvbiA9IHNka1ZlcnNpb247XG4vL09iamVjdC5mcmVlemUoc2RrLnZlcnNpb24pO1xuXG4vKipcbiAqIFZlcnNpb24gb2Ygc2VydmljZSBhcGkgd2hpY2ggaXMgY29tcGF0aWJsZSB3aXRoIHRoZSBTREsuIEl0IGluZGljYXRlc1xuICogdGhlIG1pbmltYWwgbmVlZGVkIGFwaSB2ZXJzaW9uLlxuICogXG4gKiBAcHJvcGVydHkgYXBpQ29tcGF0aWJsZVxuICogQHByaXZhdGVcbiAqIEB0eXBlIE51bWJlclxuICovXG5zZGsubWluU2VydmljZVZlcnNpb24gPSBtaW5TZXJ2aWNlVmVyc2lvbk1ham9yICsgJy4nICsgbWluU2VydmljZVZlcnNpb25NaW5vcjtcbi8vT2JqZWN0LmZyZWV6ZShzZGsuY29tcGF0aWJsZUFQSSk7XG5cbi8qKlxuICogR2V0IGFuZCBjb21wYXJlIHNlcnZpY2UgYXBpIHZlcnNpb24sIHdoZXRoZXIgaXQgaXMgY29tcGF0aWJsZSB3aXRoXG4gKiB0aGUgdmVyc2lvbiB3aGljaCBTREsgbmVlZHMuXG4gKiBcbiAqIEBtZXRob2QgaXNTZXJ2aWNlQXBpQ29tcGF0aWJsZVxuICogQGFzeW5jXG4gKiBAcHJpdmF0ZVxuICogQHJldHVybnMge1Byb21pc2V9IElmIHByb21pc2UgaXMgcmVqZWN0ZWQgdGhlbiBpdCBtZWFucyB0aGF0IHNlcnZpY2VcbiAqIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIHNkay5cbiAqL1xuLypcbmZ1bmN0aW9uIGlzU2VydmljZUFwaUNvbXBhdGlibGUoKSB7XG4gICAgdmFyIGxvZ2dlciA9IFNhcGVyaW9uLmNvbW1vbi5sb2dnZXJNYW5hZ2VyO1xuICAgIGxvZ2dlci53cml0ZShsb2dnZXIubGV2ZWxzLlZlcmJvc2UsICdFTlRFUiBpc1NlcnZpY2VBcGlDb21wYXRpYmxlKCknKTtcbiAgICB2YXIgbWFpblByb21pc2UgPSBTYXBlcmlvbi4kLkRlZmVycmVkKCk7XG5cbiAgICB2YXIgcmVxID0gU2FwZXJpb24uaHR0cC5nZXQoU2FwZXJpb24uZ2V0U2VydmljZVVybCgpKTtcblxuICAgIHJlcS5leGVjdXRlKCkudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICB2YXIgc2VydmljZVZlcnNpb24gPSByZXNwLmhlYWRlcnNbJ1gtRUNNLVByb3RvY29sLVZlcnNpb24nXTtcbiAgICAgICAgaWYgKHNlcnZpY2VWZXJzaW9uID49IGFwaUNvbXBhdGlibGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci53cml0ZShsb2dnZXIubGV2ZWxzLkluZm8sICdTZXJ2aWNlIEFQSSB2ZXJzaW9uIGNhbiBiZSB1c2VkIGJ5IFNESyBmb3IgY29tbXVuaWNhdGlvbi4gU2VydmljZSBBUEkgdmVyc2lvbjogezB9Jywgc2VydmljZVZlcnNpb24pO1xuICAgICAgICAgICAgbWFpblByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci53cml0ZShsb2dnZXIubGV2ZWxzLkVycm9yLCAnU2VydmljZSBBUEkgdmVyc2lvbiBjYW4gbm90IGJlIHVzZWQgYnkgU0RLIGZvciBjb21tdW5pY2F0aW9uLiBTZXJ2aWNlIEFQSSB2ZXJzaW9uOiB7MH0nLCBzZXJ2aWNlVmVyc2lvbik7XG4gICAgICAgIG1haW5Qcm9taXNlLnJlamVjdCgpO1xuICAgIH0sIGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgIHZhciBzZXJ2aWNlVmVyc2lvbiA9IHJlc3AuaGVhZGVyc1snWC1FQ00tUHJvdG9jb2wtVmVyc2lvbiddO1xuICAgICAgICBsb2dnZXIud3JpdGUobG9nZ2VyLmxldmVscy5FcnJvciwgJ1NlcnZpY2UgQVBJIHZlcnNpb24gY2FuIG5vdCBiZSB1c2VkIGJ5IFNESyBmb3IgY29tbXVuaWNhdGlvbi4gU2VydmljZSBBUEkgdmVyc2lvbjogezB9Jywgc2VydmljZVZlcnNpb24pO1xuICAgICAgICBtYWluUHJvbWlzZS5yZWplY3QoKTtcbiAgICB9KTtcbiAgICBsb2dnZXIud3JpdGUobG9nZ2VyLmxldmVscy5WZXJib3NlLCAnTEVBVkUgaXNTZXJ2aWNlQXBpQ29tcGF0aWJsZSgpJyk7XG5cbiAgICByZXR1cm4gbWFpblByb21pc2U7XG59XG4qL1xuXG4vL2Jyb3dzZXIgc3BlY2lmaWMgZXh0ZW5zaW9uc1xuc2RrLmJyb3dzZXIgPSB7fTtcbi8qKlxuICogY29udmVydCBhIGRhdGEgYXJyYXkgdG8gYSBibG9iIGFuZCByZXR1cm5zIHRoZSBsb2NhbCBvYmplY3QgdXJsIHRvIHRoZSBkYXRhXG4gKiBAcHJpdmF0ZVxuICogQG1ldGhvZCBnZXRPYmplY3RVcmxGb3JCcm93c2VyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YUFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gY29udGVudFR5cGUgLSBvcHRpb25hbFxuICogQHJldHVybiB7T2JqZWN0fSB1cmwgYXMgc3RyaW5nXG4gKi9cbnNkay5icm93c2VyLmNyZWF0ZU9iamVjdFVybCA9IHV0aWxpdGllcy5nZXRPYmplY3RVcmxGb3JCcm93c2VyO1xuXG5sb2dnZXIud3JpdGUobG9nZ2VyLmxldmVscy52ZXJib3NlLCAnc2RrIGxvYWRlZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZGs7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIExvZ2dlciBtYW5hZ2VyIHByb3ZpZGVzIGludGVyZmFjZSBmb3IgbG9nZ2luZy5cbiAqIFxuICogQG1vZHVsZSBjb21tb25cbiAqIEBjbGFzcyBsb2dnZXJNYW5hZ2VyXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xudmFyIGxvZ01hbmFnZXIgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLyoqXG4gICAgICogQXZhaWxhYmxlIGxvZyBsZXZlbHMuXG4gICAgICogXG4gICAgICogQHByb3BlcnR5IGxldmVsIHtPYmplY3R9IExvZyBsZXZlbHMuXG4gICAgICogIEBwcm9wZXJ0eSB7TnVtYmVyfSBsZXZlbC5Ob25lIERpc2FibGUgbG9nZ2luZy5cbiAgICAgKiAgQHByb3BlcnR5IHtOdW1iZXJ9IGxldmVsLkVycm9yIExvZyBlcnJvcnMuXG4gICAgICogIEBwcm9wZXJ0eSB7TnVtYmVyfSBsZXZlbC5XYXJuIExvZyB3YXJuaW5ncy5cbiAgICAgKiAgQHByb3BlcnR5IHtOdW1iZXJ9IGxldmVsLkluZm8gTG9nIGluZm8uXG4gICAgICogIEBwcm9wZXJ0eSB7TnVtYmVyfSBsZXZlbC5WZXJib3NlIExvZyBldmVyeXRoaW5nLlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBcbiAgICAgKi9cbiAgICB2YXIgbG9nTGV2ZWxzID0ge1xuICAgICAgICAgICAgTm9uZTogMCxcbiAgICAgICAgICAgIEVycm9yOiAxLFxuICAgICAgICAgICAgZXJyb3I6IDEsXG4gICAgICAgICAgICBXYXJuOiAyLFxuICAgICAgICAgICAgd2FybjogMixcbiAgICAgICAgICAgIEluZm86IDMsXG4gICAgICAgICAgICBpbmZvOiAzLFxuICAgICAgICAgICAgRGVidWc6IDQsXG4gICAgICAgICAgICBkZWJ1ZzogNCxcbiAgICAgICAgICAgIFZlcmJvc2U6IDUsXG4gICAgICAgICAgICB2ZXJib3NlOiA1XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2cgbGV2ZWwuXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcHJvcGVydHkgbG9nTGV2ZWxcbiAgICAgICAgICogQHR5cGUgTnVtYmVyXG4gICAgICAgICAqIEBkZWZhdWx0IDEgLSBFcnJvclxuICAgICAgICAgKi9cbiAgICAgICAgbG9nTGV2ZWwgPSBsb2dMZXZlbHMuRXJyb3I7XG5cbiAgICAvKipcbiAgICAgKiBXcml0ZSBsb2cgbWVzc2FnZS5cbiAgICAgKiBcbiAgICAgKiBAbWV0aG9kIHdyaXRlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxldmVsIExvZyBsZXZlbCBhY2NvcmRpbmcgdG8gYXZhaWxhYmxlIGxvZyBsZXZlbHMuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgTG9nIG1lc3NhZ2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gd3JpdGUobGV2ZWwsIG1lc3NhZ2UgLypwYXJhbWV0ZXJzIHRvIHJlcGxhY2UqLyApIHtcbiAgICAgICAgaWYgKGxvZ0xldmVsID49IGxldmVsKSB7XG4gICAgICAgICAgICAvL3Rha2UgYWxsIGFyZ3MgZXhjZXB0IHRoZSBmaXJzdCB0d29cbiAgICAgICAgICAgIHZhciBkYXRhVG9SZXBsYWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlVG9Mb2cgPSBwcmVwYXJlTWVzc2FnVG9Mb2cobWVzc2FnZSwgZGF0YVRvUmVwbGFjZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlVG9Mb2cpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmVyYm9zZShtZXNzYWdlLCBkYXRhKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmNhbGwoYXJndW1lbnRzLCBsb2dMZXZlbHMuVmVyYm9zZSk7XG4gICAgICAgIHdyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5mbyhtZXNzYWdlKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmNhbGwoYXJndW1lbnRzLCBsb2dMZXZlbHMuSW5mbyk7XG4gICAgICAgIHdyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd2FybihtZXNzYWdlKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmNhbGwoYXJndW1lbnRzLCBsb2dMZXZlbHMuV2Fybik7XG4gICAgICAgIHdyaXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgbG9nTGV2ZWxzLkVycm9yKTtcbiAgICAgICAgd3JpdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgbG9nIGxldmVsLlxuICAgICAqIFxuICAgICAqIEBtZXRob2Qgc2V0TG9nTGV2ZWxcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGxldmVsXG4gICAgICogXG4gICAgICogQHRocm93cyB7RXJyb3J9IE5vdCBleGlzdGluZyBsb2cgbGV2ZWwuXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0TG9nTGV2ZWwobGV2ZWwpIHtcblxuICAgICAgICB2YXIgZXhpc3RzID0gZmFsc2U7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobG9nTGV2ZWxzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbG9nTGV2ZWxWYWx1ZSA9IGxvZ0xldmVsc1trZXlzW2ldXTtcblxuICAgICAgICAgICAgaWYgKGxvZ0xldmVsVmFsdWUgPT09IGxldmVsKSB7XG4gICAgICAgICAgICAgICAgZXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBleGlzdGluZyBsb2cgbGV2ZWwuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dMZXZlbCA9IGxldmVsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmVhcHJlIG1lc3NhZ2Ugd2hpY2ggd2lsbCBiZSBsb2dnZWQgb3V0LlxuICAgICAqIEBtZXRob2QgcHJlcGFyZU1lc3NhZ2VUb0xvZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBtZXNzYWdlIFN0cmluZyB3aGVyZSBhcmUgcGxhY2Vob2xkZXJzIHRvIHJlcGxhY2UuXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGRhdGEgICAgIERhdGEgd2hpY2ggd2lsbCByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBtZXNzYWdlLlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgICBTdHJpbmcgd2hpdCByZXBsYWNlZCB2YWx1ZXMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJlcGFyZU1lc3NhZ1RvTG9nKG1lc3NhZ2UsIGRhdGEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplZERhdGEgPSBkYXRhW2ldO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXplZERhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhW2ldKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBsYWNlaG9sZGVyMSA9ICd7JyArIGkgKyAnfSc7XG4gICAgICAgICAgICB2YXIgcGxhY2Vob2xkZXIyID0gJyUnICsgaSArICclJztcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuaW5kZXhPZihwbGFjZWhvbGRlcjEpIDwgMCAmJiBtZXNzYWdlLmluZGV4T2YocGxhY2Vob2xkZXIyKSA8IDApIG1lc3NhZ2UgKz0gJyAtLT4gJyArIGRhdGFbaV07XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnJlcGxhY2UocGxhY2Vob2xkZXIxLCBzZXJpYWxpemVkRGF0YSk7XG4gICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZS5yZXBsYWNlKHBsYWNlaG9sZGVyMiwgc2VyaWFsaXplZERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGxldmVsczogbG9nTGV2ZWxzLFxuICAgICAgICBzZXRMb2dMZXZlbDogc2V0TG9nTGV2ZWwsXG4gICAgICAgIHdyaXRlOiB3cml0ZSxcbiAgICAgICAgdmVyYm9zZTogdmVyYm9zZSxcbiAgICAgICAgaW5mbzogaW5mbyxcbiAgICAgICAgd2Fybjogd2FybixcbiAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgfTtcblxufSkoKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ01hbmFnZXI7IiwiJ3VzZSBzdHJpY3QnXG5tb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5mdW5jdGlvbiB0b0Jhc2U2NChpbnB1dCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKGlucHV0KS50b1N0cmluZygnYmFzZTY0Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzLnRvQmFzZTY0ID0gdG9CYXNlNjQ7XG5cbmZ1bmN0aW9uIGZyb21CYXNlNjQoaW5wdXQpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihpbnB1dCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCdhc2NpaScpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5mcm9tQmFzZTY0ID0gZnJvbUJhc2U2NDtcblxuXG4vKipcbiAqIFRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIG5vZGVqc1xuICogQHByaXZhdGVcbiAqIEBtZXRob2QgaXNOb2RlSnNcbiAqIEByZXR1cm4ge09iamVjdH0gdHJ1ZSBmb3Igbm9kZWpzXG4gKi9cbmZ1bmN0aW9uIGlzTm9kZUpzKCkge1xuICAgIHJldHVybiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xufVxubW9kdWxlLmV4cG9ydHMuaXNOb2RlSnMgPSBpc05vZGVKcztcblxuLyoqXG4gKiBUcnVlIGlmIHRoZSBFbnZpcm9ubWVudCBpcyBhIEJyb3dzZXJcbiAqIEBwcml2YXRlXG4gKiBAbWV0aG9kIGlzQnJvd3NlclxuICogQHJldHVybiB7T2JqZWN0fSB0cnVlIGlmIGJyb3dzZXJcbiAqL1xuZnVuY3Rpb24gaXNCcm93c2VyKCkge1xuICAgIHJldHVybiAoIWlzTm9kZUpzKCkpO1xufVxubW9kdWxlLmV4cG9ydHMuaXNCcm93c2VyID0gaXNCcm93c2VyO1xuXG5cbi8qKlxuICogY29udmVydCBhIGRhdGEgYXJyYXkgdG8gYSBibG9iIGFuZCByZXR1cm5zIHRoZSBsb2NhbCBvYmplY3QgdXJsIHRvIHRoZSBkYXRhXG4gKiBAcHJpdmF0ZVxuICogQG1ldGhvZCBnZXRPYmplY3RVcmxGb3JCcm93c2VyXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YUFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gY29udGVudFR5cGUgLSBvcHRpb25hbFxuICogQHJldHVybiB7T2JqZWN0fSB1cmwgYXMgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGdldE9iamVjdFVybEZvckJyb3dzZXIoZGF0YUFycmF5LCBjb250ZW50VHlwZSkge1xuICAgIC8qZ2xvYmFsIEJsb2IgKi9cbiAgICBpZiAoaXNOb2RlSnMoKSkgdGhyb3cgbmV3IEVycm9yKCdmdW5jdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBpbiBicm93c2VyIG1vZGUnKTtcblxuICAgIGlmIChjb250ZW50VHlwZSA9PT0gdW5kZWZpbmVkKSBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgIHZhciBhcnJheUJ1ZmZlclZpZXcgPSBuZXcgVWludDhBcnJheShkYXRhQXJyYXkpO1xuICAgIHZhciBibG9iID0gbmV3IEJsb2IoW2FycmF5QnVmZmVyVmlld10sIHtcbiAgICAgICAgdHlwZTogY29udGVudFR5cGVcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdhcnJheUJ1ZmZlclZpZXdTaXplJywgYXJyYXlCdWZmZXJWaWV3Lmxlbmd0aCk7XG4gICAgLy9jb25zb2xlLmxvZygnQmxvYlNpemUnLCBibG9iLnNpemUpO1xuICAgIHZhciB1cmxDcmVhdG9yID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMO1xuICAgIHZhciBvYmplY3RVcmwgPSB1cmxDcmVhdG9yLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICByZXR1cm4gb2JqZWN0VXJsO1xufVxubW9kdWxlLmV4cG9ydHMuZ2V0T2JqZWN0VXJsRm9yQnJvd3NlciA9IGdldE9iamVjdFVybEZvckJyb3dzZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi8uLi9pbnRlcm5hbC9sb2dNYW5hZ2VyLmpzJyk7XG52YXIgaHR0cCA9IHJlcXVpcmUoJy4vLi4vY29tbXVuaWNhdGlvbi9odHRwSGVscGVyJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vLi4vaW50ZXJuYWwvdXRpbGl0aWVzJyk7XG52YXIgT3duZXIgPSByZXF1aXJlKCcuLy4uL2NvbW1vbi9hY3RvclJlZmVyZW5jZScpO1xudmFyIFBhZ2VJbmZvID0gcmVxdWlyZSgnLi8uLi9jb21tb24vcGFnZUluZm8nKTtcbnZhciBXb3JrZmxvd1Rhc2sgPSByZXF1aXJlKCcuL3dvcmtmbG93VGFzaycpO1xuXG4vKipcbiAqIFNhcGVyaW9uIFdvcmtmbG93IElub3guXG4gKiBcbiAqIEBtb2R1bGUgd29ya2Zsb3dcbiAqIEBjbGFzcyBJbm94XG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuZnVuY3Rpb24gSW5ib3goc2VydmljZUNvbm5lY3Rpb24sIGpzb24pIHtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gb2JqZWN0IGluaXRpYWxpemF0aW9uIGFzc2VydGlvbnNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgaWYgKCFzZXJ2aWNlQ29ubmVjdGlvbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXJ2aWNlQ29ubmVjdGlvbiBpcyBub3Qgc2V0Jyk7XG5cbiAgICBodHRwLnZhbGlkYXRlU2VydmljZUNvbm5lY3Rpb24oc2VydmljZUNvbm5lY3Rpb24pO1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBwcml2YXRlIHByb3BlcnRpZXNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgdmFyIF9pZCA9IDA7XG4gICAgdmFyIF9vYmplY3RJZCA9ICcnO1xuICAgIHZhciBfb2JqZWN0VXJsID0gJyc7XG4gICAgdmFyIF9uYW1lID0gJyc7XG4gICAgdmFyIF90eXBlID0gJyc7XG4gICAgdmFyIF91bnJlYWRDb3VudCA9IDA7XG4gICAgdmFyIF90b3RhbENvdW50ID0gMDtcbiAgICB2YXIgX293bmVyO1xuXG4gICAgLyoqXG4gICAgICogY29ubmVjdGlvbiB3aGljaCBpcyB1c2VkIGZvciBjb21tdW5pY2F0aW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBzZXJ2aWNlQ29ubmVjdGlvblxuICAgICAqL1xuICAgIHRoaXMuc2VydmljZUNvbm5lY3Rpb24gPSBzZXJ2aWNlQ29ubmVjdGlvbjtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8ganNvbiBtYXBwaW5nXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIC8vdG9kbyBjcmVhdGUgYSBtZXJnZSBmcm9tIGpzb24gYW5kIHRvanNvbiBmdW5jdGlvblxuICAgIGlmIChqc29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9UT0RPIExvZ2dlci52ZXJib3NlKCdjcmVhdGUgaW5ib3ggZnJvbSBqc29uIHswfScsIGpzb24pO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGpzb24pO1xuICAgICAgICAvL21hcCB0aGUgZGF0YSBmcm9tIGpzb24gXG4gICAgICAgIGlmIChqc29uLnJlZmVyZW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb3ZpZGVkIGpzb24gd2lsbCBub3QgbWF0Y2ggZWNtIHNlcnZpY2UgbW9kZWwnKTtcbiAgICAgICAgfVxuICAgICAgICBfaWQgPSBqc29uLnJlZmVyZW5jZS5pZCB8fCBfaWQ7XG4gICAgICAgIF9vYmplY3RJZCA9IGpzb24ucmVmZXJlbmNlLm9iamVjdElkO1xuICAgICAgICAvL3RvZG8ganNvbi5zZWxmIGlzIGEgcmVmZXJlbmNlIHRvIHRoaXMgaW5ib3ggZm9yIHVwZGF0ZSBvciBvdGhlciBjYWxscyB3ZSBoYXZlIHRvIHVzZSBpdCBcbiAgICAgICAgX29iamVjdFVybCA9IGpzb24ucmVmZXJlbmNlLnNlbGY7XG5cbiAgICAgICAgX25hbWUgPSBqc29uLm5hbWUgfHwgX25hbWU7XG4gICAgICAgIF90eXBlID0ganNvbi50eXBlIHx8IF90eXBlO1xuICAgICAgICBfdW5yZWFkQ291bnQgPSBqc29uLnVucmVhZENvdW50IHx8IF91bnJlYWRDb3VudDtcbiAgICAgICAgX3RvdGFsQ291bnQgPSBqc29uLnRvdGFsQ291bnQgfHwgX3RvdGFsQ291bnQ7XG4gICAgICAgIGlmIChqc29uLm93bmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF9vd25lciA9IG5ldyBPd25lcihzZXJ2aWNlQ29ubmVjdGlvbiwganNvbi5vd25lcik7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gZ2V0dGVyIGFuZCBzZXR0ZXJcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgLyoqXG4gICAgICogdHlwZWQgaWRlbnRpZmllciBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdElkO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8qKlxuICAgICAqIGlkIG9mIHRoZSBlbGVtZW50IGluIHRoZSBzYXBlcmlvbiBiYWNrZW5kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc2FwZXJpb25JZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2lkO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8qKlxuICAgICAqIG5hbWUgb2YgdGhlIGluYm94XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbmFtZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX25hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF9uYW1lID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogdHlwZSBvZiB0aGUgaW5ib3hcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0eXBlJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdHlwZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy9UT0RPIGFkZCBjaGVjayBvZiB2YWxpZCB0eXBlc1xuICAgICAgICAgICAgICAgIF90eXBlID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogY291bnQgb2YgdW5yZWFkZWQgZWxlbWVudHMgaW4gdGhpcyBpbmJveFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgaWRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3VucmVhZENvdW50Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdW5yZWFkQ291bnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIF91bnJlYWRDb3VudCA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIGlzIG5vdCBhIGludGVnZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogY29udCBvZiB0b3RhbCBlbGVtZW50cyBpbiB0aGlzIGluYm94XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndG90YWxDb3VudCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RvdGFsQ291bnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIF90b3RhbENvdW50ID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGEgaW50ZWdlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBvd25lciBvZiB0aGlzIGluYm94XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnb3duZXInLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9vd25lcjtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX293bmVyID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSAvL2VuZCBjb25zdHJ1Y3RvclxuXG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBpbnN0YW5jZSBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbkluYm94LnByb3RvdHlwZS5nZXRXb3JrZmxvd1Rhc2tzID0gZnVuY3Rpb24gKHBhZ2UsIGRldGFpbGVkKSB7XG4gICAgcmV0dXJuIFdvcmtmbG93VGFzay5nZXRUYXNrcyh0aGlzLCBwYWdlLCBkZXRhaWxlZCk7XG59O1xuXG5JbmJveC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJldCA9IHRoaXMubmFtZSArICcgLyAnICsgdGhpcy50eXBlICsgJyAoSUQgJyArIHRoaXMuaWQgKyAnKSc7XG4gICAgcmV0dXJuIHJldDtcbn07XG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBzdGF0aWMgZnVuY3Rpb25zXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5JbmJveC5nZXRBbGxJbmJveGVzID0gZnVuY3Rpb24gKHNlcnZpY2VDb25uZWN0aW9uLCBwYWdlKSB7XG4gICAgaWYgKHBhZ2UgPT09IHVuZGVmaW5lZCkgcGFnZSA9IDE7XG4gICAgbG9nLnZlcmJvc2UoJ2dldEFsbEluYm94ZXMnKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBodHRwLmdldEpzb24oc2VydmljZUNvbm5lY3Rpb24sIGh0dHAuZW5kcG9pbnRzLndvcmtmbG93LmluYm94ZXMuYWxsKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy52ZXJib3NlKCdpbmJveGVzIHswfScsIGpzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdmFsaWRhdGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWpzb24uaXRlbXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChuZXcgRXJyb3IoJ25vIGl0ZW1zIGNvbGxlY3Rpb24gcmVjZWl2ZWQnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb252ZXJ0IGpzb24gdG8gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluYm94Q29sbGVjdGlvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaW5ib3hKc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmJveCA9IG5ldyBJbmJveChzZXJ2aWNlQ29ubmVjdGlvbiwgaW5ib3hKc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5ib3hDb2xsZWN0aW9uLnB1c2goaW5ib3gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpbmJveENvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VJbmZvOiBuZXcgUGFnZUluZm8oanNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJySHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGVyckluaXQpO1xuICAgICAgICAgICAgZmFpbGVkKGVyckluaXQpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBJbmJveDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL2xvZ01hbmFnZXIuanMnKTtcbnZhciBodHRwID0gcmVxdWlyZSgnLi8uLi9jb21tdW5pY2F0aW9uL2h0dHBIZWxwZXInKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi8uLi9pbnRlcm5hbC91dGlsaXRpZXMnKTtcbnZhciBQYWdlSW5mbyA9IHJlcXVpcmUoJy4vLi4vY29tbW9uL3BhZ2VJbmZvJyk7XG52YXIgQWN0b3IgPSByZXF1aXJlKCcuLy4uL2NvbW1vbi9hY3RvclJlZmVyZW5jZScpO1xuXG4vKipcbiAqIFNhcGVyaW9uIFdvcmtmbG93IFRhc2suXG4gKiBcbiAqIEBtb2R1bGUgd29ya2Zsb3dcbiAqIEBjbGFzcyBJbm94XG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuZnVuY3Rpb24gV29ya2Zsb3dQcm9jZXNzKHNlcnZpY2VDb25uZWN0aW9uLCBqc29uKSB7XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIG9iamVjdCBpbml0aWFsaXphdGlvbiBhc3NlcnRpb25zXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIGlmICghc2VydmljZUNvbm5lY3Rpb24pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignc2VydmljZUNvbm5lY3Rpb24gaXMgbm90IHNldCcpO1xuXG4gICAgaHR0cC52YWxpZGF0ZVNlcnZpY2VDb25uZWN0aW9uKHNlcnZpY2VDb25uZWN0aW9uKTtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gcHJpdmF0ZSBwcm9wZXJ0aWVzXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIHZhciBfaWQgPSAwO1xuICAgIHZhciBfb2JqZWN0SWQgPSAnJztcbiAgICB2YXIgX29iamVjdFVybCA9ICcnO1xuICAgIHZhciBfbmFtZSA9ICcnO1xuICAgIHZhciBfb3duZXI7XG4gICAgdmFyIF9kb2N1bWVudDtcbiAgICB2YXIgX3N0YXRlO1xuICAgIHZhciBfdGltZUluZm9ybWF0aW9uO1xuICAgIHZhciBfd29ya2Zsb3dEZWZpbml0aW9uO1xuXG4gICAgLyoqXG4gICAgICogY29ubmVjdGlvbiB3aGljaCBpcyB1c2VkIGZvciBjb21tdW5pY2F0aW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBzZXJ2aWNlQ29ubmVjdGlvblxuICAgICAqL1xuICAgIHRoaXMuc2VydmljZUNvbm5lY3Rpb24gPSBzZXJ2aWNlQ29ubmVjdGlvbjtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8ganNvbiBtYXBwaW5nXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIHZhciBfc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBtZXJnZShqc29uKSB7XG4gICAgICAgIGxvZy52ZXJib3NlKCdjcmVhdGUgd29ya2Zsb3cgcHJvY2VzcyBmcm9tIGpzb24gezB9JywganNvbik7XG4gICAgICAgIGlmIChqc29uICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgaWYgKGpzb24ucmVmZXJlbmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb3ZpZGVkIGpzb24gd2lsbCBub3QgbWF0Y2ggZWNtIHNlcnZpY2UgbW9kZWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9pZCA9IGpzb24ucmVmZXJlbmNlLmlkIHx8IF9pZDtcbiAgICAgICAgICAgIF9vYmplY3RJZCA9IGpzb24ucmVmZXJlbmNlLm9iamVjdElkO1xuICAgICAgICAgICAgLy9qc29uLnNlbGYgaXMgYSByZWZlcmVuY2UgdG8gdGhpcyBvYmplY3QgZm9yIHVwZGF0ZSBvciBvdGhlciBjYWxscyB3ZSBoYXZlIHRvIHVzZSBpdCBcbiAgICAgICAgICAgIF9vYmplY3RVcmwgPSBqc29uLnJlZmVyZW5jZS5zZWxmO1xuXG4gICAgICAgICAgICBfbmFtZSA9IGpzb24uZGVzY3JpcHRpb24gfHwgX25hbWU7XG5cbiAgICAgICAgICAgIF9uYW1lID0ganNvbi5uYW1lO1xuICAgICAgICAgICAgX293bmVyID0gbmV3IEFjdG9yKHNlcnZpY2VDb25uZWN0aW9uLCBwcm9jZXNzLm93bmVyKTtcbiAgICAgICAgICAgIF9kb2N1bWVudCA9IHt9OyAvL1RPRE8gYWRkIGRvY3VtZW50IGluc3RhbmNlXG4gICAgICAgICAgICBfc3RhdGUgPSBqc29uLnN0YXRlO1xuICAgICAgICAgICAgX3RpbWVJbmZvcm1hdGlvbiA9IGpzb24udGltZUluZm9ybWF0aW9uO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2pzb24gaXMgZW1wdHkgb3IgdW5kZWZpbmVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lcmdlKGpzb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG1lcmdlIGEganNvbiBvYmplY3Qgd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZS5cbiAgICAgKiBpbnRlcm5hbHkgdXNlZCBmb3IgdXBkYXRlcyBmcm9tIHNlcnZpY2VcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJvcGVydHkgbWVyZ2VcbiAgICAgKi9cbiAgICB0aGlzLm1lcmdlID0gbWVyZ2U7XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIGdldHRlciBhbmQgc2V0dGVyXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIC8qKlxuICAgICAqIHR5cGVkIGlkZW50aWZpZXIgb2YgdGhpcyBlbGVtZW50XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9vYmplY3RJZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogaWQgb2YgdGhlIGVsZW1lbnQgaW4gdGhlIHNhcGVyaW9uIGJhY2tlbmRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzYXBlcmlvbklkJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLyoqXG4gICAgICogbmFtZSBvZiB0aGUgaW5ib3hcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICduYW1lJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfbmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX25hbWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YWx1ZSBpcyBub3QgZGVmaW5lZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBmYWxzZSBpZiB0aGlzIHByb2Nlc3MgaW5mbyBjb250YWlucyBvbmx5IGEgcmVkdWNlZCBzZXQgb2YgZGF0YSAoc3BlY2lmaWVkIGJ5IHRoZSBzZXJ2aWNlIGNvbGxlY3Rpb25zKVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgaWRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzUmVkdWNlZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKF9kZWZpbml0aW9uID09PSB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxufSAvL2VuZCBjb25zdHJ1Y3RvclxuXG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBpbnN0YW5jZSBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cblxuLy9sb2FkIGFkZGl0aW9uYWwgXG5Xb3JrZmxvd1Byb2Nlc3MucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2RvYzogaHR0cHM6IC8vZWNtLXNlcnZpY2UucHNmdC5jby9lY21zL2pzb25fVGFza1R5cGUuaHRtbFxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWxlZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9nLmluZm8oJ1dvcmtmbG93VGFzay51cGRhdGUnKTtcbiAgICAgICAgICAgIGh0dHAuZ2V0SnNvbihzZWxmLnNlcnZpY2VDb25uZWN0aW9uLCAoaHR0cC5lbmRwb2ludHMud29ya2Zsb3cudGFzaykucmVwbGFjZSgne3Rhc2t9Jywgc2VsZi5pZCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sb2cudmVyYm9zZSgncmVjZWl2ZWQgdGFzazogezB9JywganNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy92YWxpZGF0ZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghanNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8ganNvbiByZWNlaXZlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm1lcmdlKGpzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Moc2VsZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihlcnJIdHRwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChlcnJIdHRwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVyckluaXQpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihlcnJJbml0KTtcbiAgICAgICAgICAgIGZhaWxlZChlcnJJbml0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuXG5Xb3JrZmxvd1Byb2Nlc3MucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXQgPSB0aGlzLmRlc2NyaXB0aW9uICsgJyAvICcgKyB0aGlzLnN1YmplY3QgKyAnIC8gJyArIHRoaXMuYWN0b3IubmFtZSArICcgKElEICcgKyB0aGlzLmlkICsgJyknO1xuICAgIHJldHVybiByZXQ7XG59O1xuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuLy8gc3RhdGljIGZ1bmN0aW9uc1xuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuV29ya2Zsb3dQcm9jZXNzLmdldFRhc2tzID0gZnVuY3Rpb24gKGluYm94LCBwYWdlLCBkZXRhaWxlZCkge1xuICAgIC8vaW5ib3ggPSB0aGUgcGFyZW50IG9iZWp0XG4gICAgLy9kZXRhaWxlZCA9IHRydWUgLyBmYWxzZSAgaWYgdHJ1ZSB0aGVuIHdlIHJldHJ1biBhIGNvbXBsZXRlIHRhc2sgb2JqZWN0IGFvdGhlcndpc2Ugb25seSBhIHNpbXBsZSAoaWQsIG5hbWUpXG4gICAgLy9kb2M6IGh0dHBzOiAvL2VjbS1zZXJ2aWNlLnBzZnQuY28vZWNtcy9qc29uX1Rhc2tUeXBlLmh0bWxcbiAgICBpZiAoZGV0YWlsZWQgPT09IHVuZGVmaW5lZCkgZGV0YWlsZWQgPSBmYWxzZTtcbiAgICBpZiAocGFnZSA9PT0gdW5kZWZpbmVkKSBwYWdlID0gMTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuaW5mbygnZ2V0VGFza3MnKTtcbiAgICAgICAgICAgIGh0dHAuZ2V0SnNvbihpbmJveC5zZXJ2aWNlQ29ubmVjdGlvbiwgKGh0dHAuZW5kcG9pbnRzLndvcmtmbG93LmluYm94ZXMudGFza3MpLnJlcGxhY2UoJ3tpbmJveH0nLCBpbmJveC5pZCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLnZlcmJvc2UoJ3JlY2VpdmVkIHRhc2tzOiB7MH0nLCBqc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3ZhbGlkYXRlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFqc29uLml0ZW1zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQobmV3IEVycm9yKCdubyBpdGVtcyBjb2xsZWN0aW9uIHJlY2VpdmVkJykpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb252ZXJ0IGpzb24gdG8gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tDb2xsZWN0aW9uID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbi5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uICh0YXNrSnNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFzayA9IG5ldyBXb3JrZmxvd1Rhc2soaW5ib3guc2VydmljZUNvbm5lY3Rpb24sIHRhc2tKc29uLCBpbmJveCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tDb2xsZWN0aW9uLnB1c2godGFzayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV0YWlsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2VDb2xsZWN0aW9uID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tDb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VDb2xsZWN0aW9uLnB1c2godGFzay51cGRhdGUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21pc2VDb2xsZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRldGFpbGVkVGFza0NvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbygnYWxsIHRhc2tzIHJlY2VpdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRldGFpbGVkVGFza0NvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VJbmZvOiBuZXcgUGFnZUluZm8oanNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2VuZCBpZiBkZXRhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vc2ltcGxlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFza0NvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlSW5mbzogbmV3IFBhZ2VJbmZvKGpzb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJIdHRwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZmxvd1Byb2Nlc3M7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vLi4vaW50ZXJuYWwvdXRpbGl0aWVzJyk7XG52YXIgaHR0cCA9IHJlcXVpcmUoJy4vLi4vY29tbXVuaWNhdGlvbi9odHRwSGVscGVyJyk7XG52YXIgSW5ib3ggPSByZXF1aXJlKCcuL2luYm94Jyk7XG5cbi8qKlxuICogU2FwZXJpb24gV29ya2Zsb3cgTWFuYWdlciB3aGljaCBwcm92aWRlcyBhY2Nlc3MgdG8gd29ya2xmb3cgcmVsYXRlZCBmdW5jdGlvbnMgYW5kIG9iamVjdHMuXG4gKiBcbiAqIEBtb2R1bGUgd29ya2Zsb3dcbiAqIEBjbGFzcyB3b3JrZmxvd01hbmFnZXJcbiAqIEB0eXBlIE9iamVjdFxuICovXG5mdW5jdGlvbiBXb3JrZmxvd01hbmFnZXIoc2VydmljZUNvbm5lY3Rpb24pIHtcbiAgICBpZiAoIXNlcnZpY2VDb25uZWN0aW9uKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlcnZpY2VDb25uZWN0aW9uIGlzIG5vdCBzZXQnKTtcblxuICAgIGh0dHAudmFsaWRhdGVTZXJ2aWNlQ29ubmVjdGlvbihzZXJ2aWNlQ29ubmVjdGlvbik7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NlcnZpY2VDb25uZWN0aW9uJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlQ29ubmVjdGlvbjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5Xb3JrZmxvd01hbmFnZXIucHJvdG90eXBlLmdldEluYm94ZXMgPSBmdW5jdGlvbiAocGFnZSkge1xuICAgIHJldHVybiBJbmJveC5nZXRBbGxJbmJveGVzKHRoaXMuc2VydmljZUNvbm5lY3Rpb24sIHBhZ2UpO1xufTtcblxuLy9Xb3JrZmxvd01hbmFnZXIucHJvdG90eXBlLmNyZWF0ZUluYm94ID0gZnVuY3Rpb24gKHBhZ2UpIHtcbi8vICAgIHJldHVybiBuZXcgSW5ib3godGhpcy5zZXJ2aWNlQ29ubmVjdGlvbik7XG4vL3Rocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkIHlldCcpO1xuLy9UT0RPIFAzOiBpbXBsZW1lbnRcbi8vfTtcblxuXG5Xb3JrZmxvd01hbmFnZXIucHJvdG90eXBlLmdldFdvcmtmbG93RGVmaW5pdGlvbnMgPSBmdW5jdGlvbiAocGFnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkIHlldCcpO1xuICAgIC8vVE9ETyBQMzogaW1wbGVtZW50XG4gICAgLy9yZXR1cm4gSW5ib3guZ2V0QWxsSW5ib3hlcyh0aGlzLnNlcnZpY2VDb25uZWN0aW9uLCBwYWdlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV29ya2Zsb3dNYW5hZ2VyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxvZyA9IHJlcXVpcmUoJy4vLi4vaW50ZXJuYWwvbG9nTWFuYWdlci5qcycpO1xudmFyIGh0dHAgPSByZXF1aXJlKCcuLy4uL2NvbW11bmljYXRpb24vaHR0cEhlbHBlcicpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL3V0aWxpdGllcycpO1xudmFyIFdvcmtmbG93UHJvY2VzcyA9IHJlcXVpcmUoJy4vcHJvY2Vzcy5qcycpO1xudmFyIEFjdG9yID0gcmVxdWlyZSgnLi8uLi9jb21tb24vYWN0b3JSZWZlcmVuY2UnKTtcbnZhciBQYWdlSW5mbyA9IHJlcXVpcmUoJy4vLi4vY29tbW9uL3BhZ2VJbmZvJyk7XG52YXIgV29ya2Zsb3dUYXNrVHJhbnNpdGlvbiA9IHJlcXVpcmUoJy4vd29ya2Zsb3dUYXNrVHJhbnNpdGlvbicpO1xudmFyIERvY3VtZW50ID0gcmVxdWlyZSgnLi8uLi9jb250ZW50L2RvY3VtZW50Jyk7XG5cblxuLyoqXG4gKiBTYXBlcmlvbiBXb3JrZmxvdyBUYXNrLlxuICogXG4gKiBAbW9kdWxlIHdvcmtmbG93XG4gKiBAY2xhc3MgV29ya2Zsb3dUYXNrXG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuZnVuY3Rpb24gV29ya2Zsb3dUYXNrKHNlcnZpY2VDb25uZWN0aW9uLCBqc29uLCBpbmJveCkge1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBvYmplY3QgaW5pdGlhbGl6YXRpb24gYXNzZXJ0aW9uc1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICBpZiAoIXNlcnZpY2VDb25uZWN0aW9uKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlcnZpY2VDb25uZWN0aW9uIGlzIG5vdCBzZXQnKTtcblxuICAgIGh0dHAudmFsaWRhdGVTZXJ2aWNlQ29ubmVjdGlvbihzZXJ2aWNlQ29ubmVjdGlvbik7XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIHByaXZhdGUgcHJvcGVydGllc1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICB2YXIgX2luYm94ID0gaW5ib3g7XG5cbiAgICB2YXIgX2lkID0gMDtcbiAgICB2YXIgX29iamVjdElkID0gJyc7XG4gICAgdmFyIF9yZWZlcmVuY2VVcmwgPSAnJztcblxuICAgIHZhciBfZGVzY3JpcHRpb24gPSAnJztcbiAgICB2YXIgX2lzUmVhZCA9IGZhbHNlO1xuXG4gICAgdmFyIF9wcmlvcml0eSA9IDA7XG4gICAgdmFyIF9hY3RvcjtcbiAgICB2YXIgX3ByZXZpb3VzQWN0b3I7XG4gICAgdmFyIF9wcm9jZXNzO1xuICAgIHZhciBfcmVjZWl2ZURhdGUgPSBqc29uLnJlY2VpdmVEYXRlO1xuICAgIHZhciBfc3ViamVjdCA9IGpzb24uc3ViamVjdDtcbiAgICB2YXIgX3VzZXJGaWVsZHMgPSBqc29uLnVzZXJGaWVsZHM7XG5cbiAgICB2YXIgX2NhcGFiaWxpdGllcztcbiAgICBcbiAgICAvL1RPRE86aGFzIHRvIGJlIG1vdmVkIHRvIHdvcmtmbG93UHJvY2Vzc1xuICAgIHZhciBfZG9jdW1lbnRSZWZlcmVuY2U7XG5cbiAgICAvKipcbiAgICAgKiBjb25uZWN0aW9uIHdoaWNoIGlzIHVzZWQgZm9yIGNvbW11bmljYXRpb25cbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHNlcnZpY2VDb25uZWN0aW9uXG4gICAgICovXG4gICAgdGhpcy5zZXJ2aWNlQ29ubmVjdGlvbiA9IHNlcnZpY2VDb25uZWN0aW9uO1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBqc29uIG1hcHBpbmdcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgdmFyIF9zZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIG1lcmdlKGpzb24pIHtcbiAgICAgICAgbG9nLnZlcmJvc2UoJ2NyZWF0ZSB0YXNrIGZyb20ganNvbiB7MH0nLCBKU09OLnN0cmluZ2lmeShqc29uKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoanNvbi5yZWZlcmVuY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb3ZpZGVkIGpzb24gd2lsbCBub3QgbWF0Y2ggZWNtIHNlcnZpY2UgbW9kZWwnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfaWQgPSBqc29uLnJlZmVyZW5jZS5pZCB8fCBfaWQ7XG4gICAgICAgICAgICAgICAgX29iamVjdElkID0ganNvbi5yZWZlcmVuY2Uub2JqZWN0SWQ7XG4gICAgICAgICAgICAgICAgX3JlZmVyZW5jZVVybCA9IGpzb24ucmVmZXJlbmNlLnNlbGY7XG5cbiAgICAgICAgICAgICAgICBfZGVzY3JpcHRpb24gPSBqc29uLmRlc2NyaXB0aW9uIHx8IF9kZXNjcmlwdGlvbjtcblxuICAgICAgICAgICAgICAgIF9wcmlvcml0eSA9IGpzb24ucHJpb3JpdHkgfHwgX3ByaW9yaXR5O1xuICAgICAgICAgICAgICAgIGlmIChqc29uLmFjdG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX2FjdG9yID0gbmV3IEFjdG9yKHNlcnZpY2VDb25uZWN0aW9uLCBqc29uLmFjdG9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoanNvbi5wcmV2aW91c0FjdG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3ByZXZpb3VzQWN0b3IgPSBuZXcgQWN0b3Ioc2VydmljZUNvbm5lY3Rpb24sIGpzb24ucHJldmlvdXNBY3Rvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGpzb24ucHJvY2VzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIF9wcm9jZXNzID0gbmV3IFdvcmtmbG93UHJvY2VzcyhzZXJ2aWNlQ29ubmVjdGlvbiwganNvbi5wcm9jZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETzpoYXMgdG8gYmUgbW92ZWQgdG8gd29ya2Zsb3dQcm9jZXNzXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnByb2Nlc3MuZG9jdW1lbnRSZWZlcmVuY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2RvY3VtZW50UmVmZXJlbmNlID0ganNvbi5wcm9jZXNzLmRvY3VtZW50UmVmZXJlbmNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF9yZWNlaXZlRGF0ZSA9IGpzb24ucmVjZWl2ZURhdGUgfHwgX3JlY2VpdmVEYXRlO1xuICAgICAgICAgICAgICAgIF9zdWJqZWN0ID0ganNvbi5zdWJqZWN0IHx8IF9zdWJqZWN0O1xuICAgICAgICAgICAgICAgIF91c2VyRmllbGRzID0ganNvbi51c2VyRmllbGRzIHx8IF91c2VyRmllbGRzO1xuXG4gICAgICAgICAgICAgICAgX2NhcGFiaWxpdGllcyA9IGpzb24uY2FwYWJpbGl0aWVzIHx8IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nLmVycm9yKCdtZXJnZSBlcnJvciBmb3Igd29ya2Zsb3cgdGFzazogezB9JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lcmdlKGpzb24pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogbWVyZ2UgYSBqc29uIG9iamVjdCB3aXRoIHRoZSBjdXJyZW50IGluc3RhbmNlLlxuICAgICAqIGludGVybmFseSB1c2VkIGZvciB1cGRhdGVzIGZyb20gc2VydmljZVxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcm9wZXJ0eSBtZXJnZVxuICAgICAqL1xuICAgIHRoaXMubWVyZ2UgPSBtZXJnZTtcblxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gZ2V0dGVyIGFuZCBzZXR0ZXJcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICAgLyoqXG4gICAgICogdHlwZWQgaWRlbnRpZmllciBvZiB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdElkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBpZCBvZiB0aGUgZWxlbWVudCBpbiB0aGUgc2FwZXJpb24gYmFja2VuZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgc2FwZXJpb25JZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc2FwZXJpb25JZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2lkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgUkVTVCBVcmwgb2YgdGhpcyBPYmplY3RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHJlZmVyZW5jZVVybFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVmZXJlbmNlVXJsJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVmZXJlbmNlVXJsO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBkZXNjcmlwdGlvbiBvZiB0aGUgZWxlbWVudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgZGVzY3JpcHRpb25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2Rlc2NyaXB0aW9uJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfZGVzY3JpcHRpb247XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF9kZXNjcmlwdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHRhc2sgaXMgcmVhZGVkXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpc1JlYWRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzUmVhZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2lzUmVhZDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX2lzUmVhZCA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHRhc2sgcHJpb3JpdHlcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHByaW9yaXR5XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdwcmlvcml0eScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3ByaW9yaXR5O1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBfcHJpb3JpdHkgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YWx1ZSBpcyBub3QgZGVmaW5lZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBjdXJyZW50IGFjdG9yIGZvciB0aGlzIHdvcmtmbG93IHRhc2sgb3IgdW5kZWZpbmVkXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBhY3RvclxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnYWN0b3InLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9hY3RvcjtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX2FjdG9yID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsdWUgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogcHJldmlvdXMgYWN0b3IgZm9yIHRoaXMgd29ya2Zsb3cgdGFzayBvciB1bmRlZmluZWRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHByZXZpb3VzQWN0b3JcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ByZXZpb3VzQWN0b3InLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9wcmV2aW91c0FjdG9yO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiB0aGUgaW5zdGFuY2Ugb2YgYSB3b3JrZmxvdyB3aGVyZSB0aGVzZSB0YXNrIGJlbG9uZ3MgdG9cbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHByb2Nlc3NcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Byb2Nlc3MnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9wcm9jZXNzO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiB0aW1lc3RhbXAgd2hlcmUgdGVoIHRhc2sgd2FzIHJlY2VpdmVkXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSByZWNlaXZlRGF0ZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVjZWl2ZURhdGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKF9yZWNlaXZlRGF0ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHRpdGxlIG9mIHRoZSB0YXNrXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBzdWJqZWN0XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzdWJqZWN0Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3ViamVjdDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX3N1YmplY3QgPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YWx1ZSBpcyBub3QgZGVmaW5lZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBmYWxzZSBpZiB0aGlzIHRhc2sgY29udGFpbnMgb25seSBhIHJlZHVjZWQgc2V0IG9mIGRhdGEgKHNwZWNpZmllZCBieSB0aGUgc2VydmljZSBjb2xsZWN0aW9ucylcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGlzUmVkdWNlZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNSZWR1Y2VkJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoX3Byb2Nlc3MgPT09IHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLy9UT0RPOiB0aGluayBhYm91dCBhIHNldHRlciBmb3IgdXNlckZpZWxkcywgYmVjYXVzZSB0aGV5IGFyZSBsaW1pdGVkXG5cbiAgICAvKipcbiAgICAgKiBhIGNvbGxlY3Rpb24gb2YgZmllbGRzIHdoaWNoIGNhbiBiZSBhc3NpZ2VuIGR0byBhIHdvcmtmbG93IHRhc2tcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHVzZXJGaWVsZHNcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3VzZXJGaWVsZHMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF91c2VyRmllbGRzO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1RPRE86aGFzIHRvIGJlIG1vdmVkIHRvIHdvcmtmbG93UHJvY2Vzc1xuICAgIC8qKlxuICAgICAqIHJldHVybnMgYSBkb2N1bWVudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgZG9jdW1lbnRcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2RvY3VtZW50Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnQodGhpcy5zZXJ2aWNlQ29ubmVjdGlvbixfZG9jdW1lbnRSZWZlcmVuY2UpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1RPRE86aGFzIHRvIGJlIG1vdmVkIHRvIHdvcmtmbG93UHJvY2Vzc1xuICAgIC8qKlxuICAgICAqIGZhbHNlIGlmIHRoaXMgdGFzayBoYXMgZG9jdW1lbnQgcmVmZXJlbmNlXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBoYXNEb2N1bWVudFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaGFzRG9jdW1lbnQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfZG9jdW1lbnRSZWZlcmVuY2UgIT09IHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHRydWUgaWYgdGhlIHRhc2sgY2FuIG1vdmVkIHRvIHRoZSBwZXJzb25hbCBpbmJveCAodGFrZSBvd25lcnNoaXApXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBjYW5Nb3ZlVG9NeUluYm94XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjYW5Nb3ZlVG9NeUluYm94Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoX2NhcGFiaWxpdGllcy5pbmRleE9mKCdDQU5fVEFLRScpICE9PSAtMSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIHRydWUgaWYgdGhlIHRhc2sgY2FuIG1vdmVkIHRvIHRoZSBwZXJzb25hbCBpbmJveCAocmVqZWN0IG93bmVyc2hpcClcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGNhbk1vdmVUb1ByZXZpb3VzSW5ib3hcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2Nhbk1vdmVUb1ByZXZpb3VzSW5ib3gnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfY2FwYWJpbGl0aWVzLmluZGV4T2YoJ0NBTl9QVVRfQkFDSycpICE9PSAtMSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSAvL2VuZCBjb25zdHJ1Y3RvclxuXG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBpbnN0YW5jZSBmdW5jdGlvbnNcbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cblxuV29ya2Zsb3dUYXNrLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmV0ID0gdGhpcy5kZXNjcmlwdGlvbiArICcgLyAnICsgdGhpcy5zdWJqZWN0O1xuICAgIGlmICh0aGlzLmFjdG9yICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJldCArPSAnIC8gJyArIHRoaXMuYWN0b3IubmFtZTtcblxuICAgIHJldCArPSAnIChJRCAnICsgdGhpcy5pZCArICcpJztcbiAgICByZXR1cm4gcmV0O1xufTtcblxuLy91cGRhdGUgdGhlIGN1cnJlbnQgaW5zdGFuY2Ugd2l0aCBkYXRhIGZyb20gc2VydmljZVxuV29ya2Zsb3dUYXNrLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZG9jOiBodHRwczogLy9lY20tc2VydmljZS5wc2Z0LmNvL2VjbXMvanNvbl9UYXNrVHlwZS5odG1sXG4gICAgdmFyIGZuTmFtZSA9ICdXb3JrZmxvd1Rhc2sucmVmcmVzaCc7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGZuTmFtZSk7XG4gICAgICAgICAgICBodHRwLmdldEpzb24oc2VsZi5zZXJ2aWNlQ29ubmVjdGlvbiwgKHNlbGYucmVmZXJlbmNlVXJsKSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cudmVyYm9zZSgncmVjZWl2ZWQgdGFzazogezB9JywganNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy92YWxpZGF0ZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghanNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8gZGF0YSByZWNlaXZlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm1lcmdlKGpzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Moc2VsZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJySHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJJbml0KTtcbiAgICAgICAgICAgIGZhaWxlZChlcnJJbml0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuV29ya2Zsb3dUYXNrLnByb3RvdHlwZS5tb3ZlVG9NeUluYm94ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZG9jOiBodHRwczogLy9lY20tc2VydmljZS5wc2Z0LmNvL2VjbXMvanNvbl9UYXNrVHlwZS5odG1sXG4gICAgdmFyIGZuTmFtZSA9ICdXb3JrZmxvd1Rhc2subW92ZVRvTXlJbmJveCc7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghdGhpcy5jYW5Nb3ZlVG9NeUluYm94KSB0aHJvdyBuZXcgRXJyb3IoJ29wZXJhdGlvbiBub3QgYWxsb3dlZCcpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuaW5mbyhmbk5hbWUpO1xuICAgICAgICAgICAgaHR0cC5zdGFydEFjdGlvbihzZWxmLnNlcnZpY2VDb25uZWN0aW9uLCBodHRwLmVuZHBvaW50cy53b3JrZmxvdy50YXNrLnRha2VPd25lcnNoaXAucmVwbGFjZSgne3Rhc2t9JywgaHR0cC5lbmNvZGVVcmlDb21wb25lbnQoc2VsZi5pZCkpKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5pbmZvKCd7MH0gZm9yIHsxfSBleGVjdXRlZCcsIGZuTmFtZSwgc2VsZi50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Moc2VsZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJySHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJJbml0KTtcbiAgICAgICAgICAgIGZhaWxlZChlcnJJbml0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuV29ya2Zsb3dUYXNrLnByb3RvdHlwZS5tb3ZlVG9QcmV2aW91c0luYm94ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZG9jOiBodHRwczogLy9lY20tc2VydmljZS5wc2Z0LmNvL2VjbXMvanNvbl9UYXNrVHlwZS5odG1sXG4gICAgdmFyIGZuTmFtZSA9ICdXb3JrZmxvd1Rhc2subW92ZVRvUHJldmlvdXNJbmJveCc7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghdGhpcy5jYW5Nb3ZlVG9QcmV2aW91c0luYm94KSB0aHJvdyBuZXcgRXJyb3IoJ29wZXJhdGlvbiBub3QgYWxsb3dlZCcpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoc3VjY2VzcywgZmFpbGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuaW5mbyhmbk5hbWUpO1xuICAgICAgICAgICAgaHR0cC5zdGFydEFjdGlvbihzZWxmLnNlcnZpY2VDb25uZWN0aW9uLCBodHRwLmVuZHBvaW50cy53b3JrZmxvdy50YXNrLnJldm9rZU93bmVyc2hpcC5yZXBsYWNlKCd7dGFza30nLCAgaHR0cC5lbmNvZGVVcmlDb21wb25lbnQoc2VsZi5pZCkpKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5pbmZvKCd7MH0gZm9yIHsxfSBleGVjdXRlZCcsIGZuTmFtZSwgc2VsZi50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Moc2VsZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJySHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJySHR0cCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJJbml0KSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJJbml0KTtcbiAgICAgICAgICAgIGZhaWxlZChlcnJJbml0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuV29ya2Zsb3dUYXNrLnByb3RvdHlwZS5nZXRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gV29ya2Zsb3dUYXNrVHJhbnNpdGlvbi5nZXRUcmFuc2l0aW9ucyh0aGlzKTtcbn07XG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBzdGF0aWMgZnVuY3Rpb25zXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5Xb3JrZmxvd1Rhc2suZ2V0VGFza3MgPSBmdW5jdGlvbiAoaW5ib3gsIHBhZ2UsIGRldGFpbGVkKSB7XG4gICAgLy9kb2M6IGh0dHBzOiAvL2VjbS1zZXJ2aWNlLnBzZnQuY28vZWNtcy9qc29uX1Rhc2tUeXBlLmh0bWxcbiAgICB2YXIgZm5OYW1lID0gJ1dvcmtmbG93VGFzay5nZXRUYXNrcyc7XG5cbiAgICAvL2luYm94ID0gdGhlIHBhcmVudCBvYmVqdFxuICAgIC8vZGV0YWlsZWQgPSB0cnVlIC8gZmFsc2UgIGlmIHRydWUgdGhlbiB3ZSByZXRydW4gYSBjb21wbGV0ZSB0YXNrIG9iamVjdCBhb3RoZXJ3aXNlIG9ubHkgYSBzaW1wbGUgKGlkLCBuYW1lKVxuICAgIGlmIChkZXRhaWxlZCA9PT0gdW5kZWZpbmVkKSBkZXRhaWxlZCA9IGZhbHNlO1xuICAgIGlmIChwYWdlID09PSB1bmRlZmluZWQpIHBhZ2UgPSAxO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGZuTmFtZSk7XG4gICAgICAgICAgICBodHRwLmdldEpzb24oaW5ib3guc2VydmljZUNvbm5lY3Rpb24sIChodHRwLmVuZHBvaW50cy53b3JrZmxvdy5pbmJveGVzLnRhc2tzKS5yZXBsYWNlKCd7aW5ib3h9JywgaW5ib3guaWQpKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdmFsaWRhdGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWpzb24uaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLnZlcmJvc2UoJ3JlY2VpdmVkIGRhdGE6IHswfScsIEpTT04uc3RyaW5naWZ5KGpzb24sIG51bGwsIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKG5ldyBFcnJvcignbm8gaXRlbXMgY29sbGVjdGlvbiByZWNlaXZlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9taXNlQ29sbGVjdGlvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXNrQ29sbGVjdGlvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAodGFza0pzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2sgPSBuZXcgV29ya2Zsb3dUYXNrKGluYm94LnNlcnZpY2VDb25uZWN0aW9uLCB0YXNrSnNvbiwgaW5ib3gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXNrQ29sbGVjdGlvbi5wdXNoKHRhc2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV0YWlsZWQpIHByb21pc2VDb2xsZWN0aW9uLnB1c2godGFzay5yZWZyZXNoKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlQ29sbGVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb21pc2VSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrQ29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlSW5mbzogbmV3IFBhZ2VJbmZvKGpzb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbldvcmtmbG93VGFzay5nZXRUYXNrID0gZnVuY3Rpb24gKHNlcnZpY2VDb25uZWN0aW9uLCB0YXNrSWQsIGluYm94KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtmbG93VGFzazsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLy4uL2ludGVybmFsL2xvZ01hbmFnZXIuanMnKTtcbnZhciBodHRwID0gcmVxdWlyZSgnLi8uLi9jb21tdW5pY2F0aW9uL2h0dHBIZWxwZXInKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi8uLi9pbnRlcm5hbC91dGlsaXRpZXMnKTtcbnZhciBXb3JrZmxvd1Byb2Nlc3MgPSByZXF1aXJlKCcuL3Byb2Nlc3MuanMnKTtcbnZhciBBY3RvciA9IHJlcXVpcmUoJy4vLi4vY29tbW9uL2FjdG9yUmVmZXJlbmNlJyk7XG52YXIgUGFnZUluZm8gPSByZXF1aXJlKCcuLy4uL2NvbW1vbi9wYWdlSW5mbycpO1xuXG4vKipcbiAqIFNhcGVyaW9uIFdvcmtmbG93IFRhc2sgdHJhbnNpdGlvbiAoZXhpdHMpXG4gKiBcbiAqIEBtb2R1bGUgd29ya2Zsb3dcbiAqIEBjbGFzcyBJbm94XG4gKiBAdHlwZSBPYmplY3RcbiAqL1xuZnVuY3Rpb24gV29ya2Zsb3dUYXNrVHJhbnNpdGlvbihzZXJ2aWNlQ29ubmVjdGlvbiwganNvbiwgdGFzaykge1xuXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyBvYmplY3QgaW5pdGlhbGl6YXRpb24gYXNzZXJ0aW9uc1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICBpZiAoIXNlcnZpY2VDb25uZWN0aW9uKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlcnZpY2VDb25uZWN0aW9uIGlzIG5vdCBzZXQnKTtcblxuICAgIGh0dHAudmFsaWRhdGVTZXJ2aWNlQ29ubmVjdGlvbihzZXJ2aWNlQ29ubmVjdGlvbik7XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIHByaXZhdGUgcHJvcGVydGllc1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICB2YXIgX3Rhc2sgPSB0YXNrO1xuICAgIHZhciBfaWQgPSAwO1xuICAgIHZhciBfY29tbWVudFJlcXVpcmVkID0gZmFsc2U7XG4gICAgdmFyIF9kZXNjcmlwdGlvbiA9ICcnO1xuXG4gICAgdmFyIF9wb3RlbnRpYWxSZWNpcGllbnRzO1xuICAgIHZhciBfcmVjaXBpZW50U2VsZWN0aW9uUnVsZTtcblxuICAgIC8qKlxuICAgICAqIGNvbm5lY3Rpb24gd2hpY2ggaXMgdXNlZCBmb3IgY29tbXVuaWNhdGlvblxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgc2VydmljZUNvbm5lY3Rpb25cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZpY2VDb25uZWN0aW9uID0gc2VydmljZUNvbm5lY3Rpb247XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIGpzb24gbWFwcGluZ1xuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICB2YXIgX3NlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2UoanNvbikge1xuICAgICAgICBsb2cudmVyYm9zZSgnY3JlYXRlIHRyYW5zaXRpb24gZnJvbSBqc29uIHswfScsIEpTT04uc3RyaW5naWZ5KGpzb24pKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChqc29uICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgICAgIF9pZCA9IGpzb24uaWQgfHwgX2lkO1xuICAgICAgICAgICAgICAgIF9kZXNjcmlwdGlvbiA9IGpzb24uZGVzY3JpcHRpb24gfHwgX2Rlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIF9jb21tZW50UmVxdWlyZWQgPSBqc29uLmNvbW1lbnRSZXF1aXJlZCB8fCBfY29tbWVudFJlcXVpcmVkO1xuICAgICAgICAgICAgICAgIGlmIChqc29uLnJlY2lwaWVudFNlbGVjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETyBNYXAgb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICBfcG90ZW50aWFsUmVjaXBpZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBfcmVjaXBpZW50U2VsZWN0aW9uUnVsZSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcignbWVyZ2UgZXJyb3IgZm9yIHdvcmtmbG93IHRhc2sgdHJhbnNpdGlvbjogezB9JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoanNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lcmdlKGpzb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG1lcmdlIGEganNvbiBvYmplY3Qgd2l0aCB0aGUgY3VycmVudCBpbnN0YW5jZS5cbiAgICAgKiBpbnRlcm5hbHkgdXNlZCBmb3IgdXBkYXRlcyBmcm9tIHNlcnZpY2VcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJvcGVydHkgbWVyZ2VcbiAgICAgKi9cbiAgICB0aGlzLm1lcmdlID0gbWVyZ2U7XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgIC8vIGdldHRlciBhbmQgc2V0dGVyXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIC8qKlxuICAgICAqIGlkZW50aWZpZXIgb2YgdGhpcyBlbGVtZW50XG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwcm9wZXJ0eSBpZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9pZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvKipcbiAgICAgKiBjb21tZW50UmVxdWlyZWRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGNvbW1lbnRSZXF1aXJlZFxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29tbWVudFJlcXVpcmVkJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfY29tbWVudFJlcXVpcmVkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiB0YXNrIHRyYW5zaXRpb24gZGVzY3JpcHRpb25cbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IGRlc2NyaXB0aW9uXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdkZXNjcmlwdGlvbicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Rlc2NyaXB0aW9uO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBsaXN0IG9mIGFsbG93ZWQgcG90ZW50aWFsUmVjaXBpZW50cyBvciBhbiBlbXB0eSBhcnJheVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcHJvcGVydHkgcG90ZW50aWFsUmVjZWlwaWVudHNcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3BvdGVudGlhbFJlY2lwaWVudHMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9wb3RlbnRpYWxSZWNpcGllbnRzIHx8IFtdO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBydWxlcyB0byBzZWxlY3QgYSByZWNpcGllbnQgZm9yIHRoaXMgdGFzayBvciB1bmRlZmluZWRcbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHJlY2lwaWVudFNlbGVjdGlvblJ1bGVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JlY2lwaWVudFNlbGVjdGlvblJ1bGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWNpcGllbnRTZWxlY3Rpb25SdWxlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiByZWZlcmVuY2UgdG8gdGhlIHRhc2sgd2hlcmUgdGhpcyB0cmFuc2l0aW9uIGJlbG9uZ3MgdG9cbiAgICAgKiBAcHVibGljXG4gICAgICogQHByb3BlcnR5IHRhc2tcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Rhc2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90YXNrO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0gLy9lbmQgY29uc3RydWN0b3JcblxuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuLy8gaW5zdGFuY2UgZnVuY3Rpb25zXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5Xb3JrZmxvd1Rhc2tUcmFuc2l0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmV0ID0gdGhpcy5kZXNjcmlwdGlvbiArICcgKElEICcgKyB0aGlzLmlkICsgJyknO1xuICAgIHJldHVybiByZXQ7XG59O1xuXG5Xb3JrZmxvd1Rhc2tUcmFuc2l0aW9uLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uIChjb21tZW50LCByZWNpcGllbnRzKSB7XG4gICAgLy90YXNrID0gdGhlIHBhcmVudCBvYmplY3RcbiAgICAvL2RvYzogaHR0cHM6Ly9lY20tc2VydmljZS5wc2Z0LmNvL2VjbXMvanNvbl9UcmFuc2l0aW9uRGVmaW5pdGlvblR5cGUuaHRtbFxuICAgIHZhciBmbk5hbWUgPSAnV29ya2Zsb3dUYXNrVHJhbnNpdGlvbi5hcHBseSc7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChzdWNjZXNzLCBmYWlsZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGZuTmFtZSk7XG5cbiAgICAgICAgICAgIHZhciBwYXlsb2FkID0ge307XG4gICAgICAgICAgICBwYXlsb2FkLnRyYW5zaXRpb25JZCA9IHNlbGYuaWQ7XG4gICAgICAgICAgICBpZiAoY29tbWVudCkgcGF5bG9hZC5jb21tZW50ID0gY29tbWVudDtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlY2lwaWVudHMpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlY2lwaWVudFJlZmVyZW5jZXMgPSBbXTtcbiAgICAgICAgICAgICAgICByZWNpcGllbnRzLmZvckVhY2goZnVuY3Rpb24gKHJlY2lwaWVudCkge1xuICAgICAgICAgICAgICAgICAgICByZWNpcGllbnRSZWZlcmVuY2VzLnB1c2gocmVjaXBpZW50LnRvU2VydmljZUFjdG9yUmVmZXJlbmNlKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBheWxvYWQucmVjaXBpZW50cyA9IHJlY2lwaWVudFJlZmVyZW5jZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2cudmVyYm9zZSgnezB9IGRhdGEgdG8gc2VuZCA6IHsxfScsIGZuTmFtZSwgcGF5bG9hZCk7XG4gICAgICAgICAgICBodHRwLnBvc3RKc29uKHNlbGYuc2VydmljZUNvbm5lY3Rpb24sIChodHRwLmVuZHBvaW50cy53b3JrZmxvdy50YXNrLmZvcndhcmQpLnJlcGxhY2UoJ3t0YXNrfScsIHNlbGYudGFzay5pZCksIHBheWxvYWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmluZm8oJ3swfSBmb3IgezF9IGV4ZWN1dGVkJywgZm5OYW1lLCBzZWxmLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyhzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVyckh0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVyckh0dHApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJySW5pdCkge1xuICAgICAgICAgICAgbG9nLmVycm9yKGZuTmFtZSwgZXJySW5pdCk7XG4gICAgICAgICAgICBmYWlsZWQoZXJySW5pdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vUE9TVCAvd29ya2Zsb3cvdGFza3Mve3Rhc2tJZH0vZm9yd2FyZFxuXG5cbi8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBzdGF0aWMgZnVuY3Rpb25zXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5Xb3JrZmxvd1Rhc2tUcmFuc2l0aW9uLmdldFRyYW5zaXRpb25zID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAvL3Rhc2sgPSB0aGUgcGFyZW50IG9iamVjdFxuICAgIC8vZG9jOiBodHRwczovL2VjbS1zZXJ2aWNlLnBzZnQuY28vZWNtcy9qc29uX1RyYW5zaXRpb25EZWZpbml0aW9uVHlwZS5odG1sXG4gICAgdmFyIGZuTmFtZSA9ICdXb3JrZmxvd1Rhc2tUcmFuc2l0aW9uLmdldFRyYW5zaXRpb25zJztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWxlZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9nLmluZm8oZm5OYW1lKTtcbiAgICAgICAgICAgIGh0dHAuZ2V0SnNvbih0YXNrLnNlcnZpY2VDb25uZWN0aW9uLCAoaHR0cC5lbmRwb2ludHMud29ya2Zsb3cudGFzay50cmFuc2l0aW9ucykucmVwbGFjZSgne3Rhc2t9JywgdGFzay5pZCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sb2cudmVyYm9zZSgncmVjZWl2ZWQgdHJhbnNpdGlvbnM6IHswfScsIGpzb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlQ29sbGVjdGlvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24uZm9yRWFjaChmdW5jdGlvbiAoaXRlbUpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1PYmogPSBuZXcgV29ya2Zsb3dUYXNrVHJhbnNpdGlvbih0YXNrLnNlcnZpY2VDb25uZWN0aW9uLCBpdGVtSnNvbiwgdGFzayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29sbGVjdGlvbi5wdXNoKGl0ZW1PYmopO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy93ZSByZXR1cm4gYSBwYWdlSW5mbyBldmVuIGlmIHRoZXJlIGlzIG5vIHBhZ2VkIHJlc3BvbnNlLCB0byBiZSBlcXVhbCB0byBvdGhlciBjb2xsZWN0aW9uIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlQ29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZUluZm86IG5ldyBQYWdlSW5mbygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJIdHRwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoZm5OYW1lLCBlcnJIdHRwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZChlcnJIdHRwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVyckluaXQpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihmbk5hbWUsIGVyckluaXQpO1xuICAgICAgICAgICAgZmFpbGVkKGVyckluaXQpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtmbG93VGFza1RyYW5zaXRpb247Il19
