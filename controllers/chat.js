var async = require('async');

module.exports = {
  view: function(req, res, next) {
    Chat.find({}).sort('timestamp').populate('_author').limit(20).exec(function(err, chats) {
      res.render('chats', {
        chats: chats
      });
    });
  },
  since: function(req, res, next) {
    Chat.find({ _id: { $gt: req.param('chatID') } }).sort('-timestamp').populate('_author').limit(20).exec(function(err, chats) {
      if (err) { console.log(err); }

      async.parallel( chats.map(function(chat) {
        return function(done) {
          res.render('partials/message', {
            message: chat
          }, function(err, html) {
            done(err, {
                _author: {
                    _id: chat._author._id
                  , username: chat._author.username
                  , slug: chat._author.slug
                  , avatar: chat._author.avatar
                }
              , message: chat.message
              , formatted: html
              , created: chat.created
            });
          });
        }
      }), function(err, chats) {
        res.send(chats.sort(function(a, b) {
          return a['created'] - b['created']; // oldest first
        }));
      });
    });
  }
}