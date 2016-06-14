$(function() {
  App.init();
});

var App = {
  apiUrl: {
    baseUrl: "https://api.twitch.tv/kraken",
    streams: "/streams?callback=?",
    channels: "/channels/",
    favs: ["ESL_SC2",
        "TSM_Bjergsen",
        "freecodecamp",
        "storbeck",
        "beyondthesummit",
        "OgamingSC2",
        "cretetion",
        "comster404"],
    streamLimit: 7,
    favLimit: 8,
  },

  init: function() {
    // an $.ajax call to baseUrl + "/streams?callback=?", with the key "streams" returns
    // an array of objects, each object consisting of data on current streams.
    // Objects are sorted by current number of viewers in descending order
    this._getData(this.apiUrl.streams, 'streams', this._parseStreams, this.apiUrl.streamLimit);
    // an $.ajax call to baseUrl + "/streams/" + [user] + "?callback=?", with the key
    // "stream" returns an object.  If online, the stream object will have a key "channel" with
    // the user's channel information .  If offline, the stream object will be null.
    // (For more information, go to Twitch-API docs at
    // https://github.com/justintv/Twitch-API/blob/master/v2_resources/streams.md)
    for (var i = 0; i < this.apiUrl.favs.length; i++) {
      var url = "/streams/" + this.apiUrl.favs[i] + "?callback=?";
      this._getData(url, 'stream', this._parseFav, this.apiUrl.favLimit, this.apiUrl.favs[i]);
    }
  },

  _getData: function(url, key, handler, limit, user) {
    $.ajax({
      url: "https://api.twitch.tv/kraken" + url,
      data: {
        'limit': limit
      },
      dataType: 'jsonp',
      type: 'GET',
      headers: {
        'Client-ID': 'fcc_ytv'
      },
      success: function(data) {
        // console.log(data);
        if (key !== null)
          handler(data[key], user);
        else
          handler(data, user);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('AJAX RequestError:' + JSON.stringify(jqxHR, null, 2));
      }
    });
  },

  _parseStreams: function(data) {
    function stream(viewers, game, previewImg, displayName, status, logo, url, followers, totalViews) {
      this.viewers = viewers;
      this.game = game;
      this.previewImg = previewImg;
      this.displayName = displayName;
      this.status = status;
      this.logo = logo;
      this.url = url;
      this.followers = followers;
      this.totalViews = totalViews;
    }
    var currStreams = [];
    for (var i = 0; i < data.length; i++) {
      var obj = new stream(data[i].viewers, data[i].game, data[i].preview.large, data[i].channel.display_name, data[i].channel.status, data[i].channel.logo, data[i].channel.url, data[i].channel.followers, data[i].channel.views);
      currStreams.push(obj);
    }
    App._postStreams(currStreams);
  },

  _postStreams: function(currStreams) {
    for (var i = 0; i < 5; i++) {
      if (i === 0) {
        var md = 6;
        var xs = 12;
      }
      else{
        var md = 3;
        var xs = 6;
      }

      $(".streams").append(
        '<div class="stream col-md-' + md + ' col-xs-' + xs + ' id="stream">' +
        '<div class="content imgDiv" id="streamImgDiv"><a target="_blank" href="' + currStreams[i].url + '">' + '<img class="img-responsive" src="' + currStreams[i].previewImg + '"/></a></div>' +
        '<div class="content statusDiv" id="streamStatusDiv"><a target="_blank" href="' + currStreams[i].url + '">' + currStreams[i].status + '</a></div>' +
        '<div class="content nameDiv" id="streamNameDiv"><a target="_blank" href="' + currStreams[i].url + '/profile">' + currStreams[i].displayName + '</a></div>' +
        '<div class="content viewersDiv" id="streamViewersDiv"><i class="fa fa-eye"></i> ' + App._formatNum(currStreams[i].viewers) + ' viewers' + '</div><br>' +
        '<div class="content gameDiv" id="streamGameDiv">playing ' + currStreams[i].game +'</div>' +
        '</div>'
      );
    }
  },

  _parseFav: function(data, user) {
    // user is online
    if (data != null) {
      var channelData = data.channel;
      // console.log(channelData);
      $(".favs").append(
        '<div class="fav col-md-3 col-xs-6" id="fav">' +
        '<div class="content imgDiv" id="favImgDiv"><a target="_blank" href="' + channelData.url + '">' +
        '<img class="img-responsive" src="' + channelData.logo + '"/></a></div>' +
        '<div class="content statusDiv" id="favStatusDiv"><a target="_blank" href="' + channelData.url + '">' + channelData.status + '</a></div>' +
        '<div class="content nameDiv" id="favNameDiv"><a target="_blank" href="' + channelData.url + '/profile">' + channelData.display_name + '</a></div>' +
        '<div class="content followers" id="favFollowers"><i class="fa fa-users"></i> ' + App._formatNum(channelData.followers) + '</div>' +
        '<div class="content totViewsDiv" id="favTotViewsDiv"><i class="fa fa-eye"></i> ' + App._formatNum(channelData.views) + '</div>' +
        '</div>'
      );
    }
    // user is offline
    else if (data === null) {
      var url = "/channels/" + user + "?callback=?";
      App._getData(url, null, App._postOffline, App.apiUrl.favLimit, user);
    }
    // user account is closed or doesn't exist
    else {
      App._postAcctClosed(user);
    }
  },

  _postOffline: function(channel, user) {
    // console.log(channel.url);
    var noImg = 'http://rainbowvillage.org/wp-content/uploads/2011/03/no-photo-available-300x300.jpg';
    var img = "";
    if (channel.logo === null)
      img += noImg;
    else
      img += channel.logo;

    $(".favs").append(
      '<div class="fav col-md-3 col-xs-6" id="fav">' +
      '<div class="content imgDiv" id="favImgDiv"><a target="_blank" href="' + channel.url + '">' +
      '<img class="img-responsive" src="' + img + '"/></a></div>' +
      '<div class="content statusDiv" id="favStatusDiv">' + 'Offline' + '</div>' +
      '<div class="content nameDiv" id="favNameDiv"><a target="_blank" href="' + channel.url + '/profile">' + channel.display_name + '</a></div>' +
      '<div class="content followers" id="favFollowers"><i class="fa fa-users"></i> ' + App._formatNum(channel.followers) + '</div>' +
      '<div class="content totViewsDiv" id="favTotViewsDiv"><i class="fa fa-eye"></i> ' + App._formatNum(channel.views) + '</div>' +
      '</div>'
    );
  },

  _postAcctClosed: function(user) {
    var noImg = 'http://rainbowvillage.org/wp-content/uploads/2011/03/no-photo-available-300x300.jpg';
    $(".favs").append(
      '<div class="fav col-md-3 col-xs-6" id="fav">' +
      '<div class="content imgDiv" id="favImgDiv"><img class="img-responsive" src="' + noImg + '"/></div>' +
      '<div class="content statusDiv" id="favStatusDiv">' + 'Account Closed' + '</div>' +
      '<div class="content nameDiv" id="favNameDiv">' + user + '</div><br>' +
      '</div>'
    );
  },
  _formatNum: function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

}
