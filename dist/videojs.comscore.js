(function() {
  (function(vjs) {

    /*
    This keymap defines how to map the internal keys (left-hand side) to the
    user's key name (right-hand side).
     */
    var Clip, classificationTypes, comscore, extend, isArray, isNumber, keymap;
    isArray = function(obj) {
      return toString.call(obj) === "[object Array]";
    };
    isNumber = function(value) {
      return parseInt(value, 10) !== NaN;
    };
    extend = function(obj) {
      var arg, i, k;
      arg = void 0;
      i = void 0;
      k = void 0;
      i = 1;
      while (i < arguments_.length) {
        arg = arguments_[i];
        for (k in arg) {
          if (arg.hasOwnProperty(k)) {
            obj[k] = arg[k];
          }
        }
        i++;
      }
      return obj;
    };
    keymap = {
      ad: 'ad',
      duration: 'duration',
      index: 'index',
      id: 'id',
      name: 'name',
      publisher: 'publisher',
      show: 'show',
      url: 'url'
    };
    classificationTypes = {
      video: {
        shortform: {
          premium: 'vc11',
          ugc: 'vc21'
        },
        longform: {
          premium: 'vc12',
          ugc: 'vc22'
        },
        live: {
          premium: 'vc13',
          ugc: 'vc23'
        },
        audio: 'ac00',
        "default": 'vc00'
      },
      ad: {
        preroll: 'va11',
        midroll: 'va12',
        postroll: 'va13',
        live: 'va21',
        audio: 'aa00',
        "default": 'va00'
      }
    };
    Clip = (function() {
      var getLengthInMs;

      Clip.prototype.ns_st_ad = null;

      Clip.prototype.ns_st_cl = null;

      Clip.prototype.ns_st_cn = null;

      Clip.prototype.ns_st_ci = null;

      Clip.prototype.ns_st_ep = null;

      Clip.prototype.ns_st_pu = null;

      Clip.prototype.ns_st_pr = null;

      Clip.prototype.ns_st_cu = null;

      getLengthInMs = function(length, inSeconds) {
        if (inSeconds) {
          return length * 1000;
        } else {
          return length;
        }
      };

      function Clip(index, metadata) {
        this.ad(metadata[keymap.ad]);
        this.duration(metadata[keymap.duration]);
        this.index(index);
        this.id(metadata[keymap.id]);
        this.name(metadata[keymap.name]);
        this.publisher(metadata[keymap.publisher]);
        this.show(metadata[keymap.show]);
        this.url(metadata[keymap.url]);
      }

      Clip.prototype.ad = function(flag) {
        if (flag) {
          return this.ns_st_ad = flag;
        }
      };

      Clip.prototype.duration = function(length, in_seconds) {
        return this.ns_st_cl = length;
      };

      Clip.prototype.index = function(index) {
        if (index) {
          this.ns_st_cn = index;
        }
        return this.ns_st_cn;
      };

      Clip.prototype.id = function(id) {
        if (id) {
          this.ns_st_ci = id;
        }
        return this.ns_st_ci;
      };

      Clip.prototype.name = function(name) {
        if (name) {
          this.ns_st_ep = name;
        }
        return this.ns_st_ep;
      };

      Clip.prototype.publisher = function(name) {
        if (name) {
          this.ns_st_pu = name;
        }
        return this.ns_st_pu;
      };

      Clip.prototype.show = function(name) {
        if (name) {
          this.ns_st_pr = name;
        }
        return this.ns_st_pr;
      };

      Clip.prototype.url = function(url) {
        if (url) {
          this.ns_st_cu = url;
        }
        return this.ns_st_cu;
      };


      /*
      todo support these as well
      var ns_st_pn = 'part number'; // identifies a segment of the content (increment after mid-roll ad)
      var ns_st_tp = 'total parts'; // total segments (or 0 if no segments)
      var ns_st_ct = 'classification type'; // 4-character ID which distinguishes advertisement stream types from content stream types
       */

      return Clip;

    })();
    comscore = function(id, playlist, keymapOverride) {
      var clips, currentClip, events, getClipByUrl, getCurrentClip, initialize, makeClips, player, tracker;
      if (!isNumber(id)) {
        throw new Error('The first argument should be your comScore ID');
      }
      if (!isArray(playlist)) {
        throw new Error('The second argument should be an array (can be empty)');
      }
      events = {
        BUFFER: ns_.StreamSense.PlayerEvents.BUFFER,
        END: ns_.StreamSense.PlayerEvents.END,
        PLAY: ns_.StreamSense.PlayerEvents.PLAY,
        PAUSE: ns_.StreamSense.PlayerEvents.PAUSE
      };
      player = this;
      tracker = new ns_.StreamSense({}, "http://b.scorecardresearch.com/p?c1=2&c2=" + id);
      currentClip = null;
      clips = [];
      if (keymapOverride) {
        keymap = extend({}, keymap, keymapOverride);
      }
      initialize = function() {
        clips = makeClips(playlist);
        if (clips.length > 0) {
          return tracker.setPlaylist(clips);
        }
      };
      makeClips = function(playlist) {
        return playlist.map(function(metadata, index) {
          return new Clip(index, metadata);
        });
      };
      getClipByUrl = function(url) {
        var clip, _i, _len;
        for (_i = 0, _len = clips.length; _i < _len; _i++) {
          clip = clips[_i];
          if (url === clip.url()) {
            return clip;
          }
        }
      };
      getCurrentClip = function() {
        return getClipByUrl(player.currentSrc());
      };
      player.on('firstplay', function() {
        return console.log('first');
      });
      player.on('play', function() {
        return tracker.notify(events.PLAY, {}, player.currentTime() * 1000);
      });
      player.on('durationchange', function() {
        currentClip = getCurrentClip();
        currentClip.url(player.currentSrc());
        currentClip.duration(player.duration());
        return tracker.setClip(currentClip);
      });
      player.on('progress', function() {
        return console.log('progress');
      });
      player.on('ended', function() {
        return tracker.notify(events.END, {}, currentClip.duration());
      });
      player.on('pause', function() {
        return tracker.notify(events.PAUSE, {}, player.currentTime() * 1000);
      });
      player.comscore = {
        getClips: function() {
          return clips;
        },
        getCurrentClip: function() {
          return getCurrentClip;
        }
      };
      return initialize();
    };
    return vjs.plugin("comscore", comscore);
  })(window.videojs);

}).call(this);
