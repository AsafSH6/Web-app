var express = require('express')
var nodemailer = require('nodemailer')
var models = require('../DB/models')
var config = require('../config')
var router = express.Router();

var transporter = nodemailer.createTransport("SMTP", config.email)
var postURL = config.host + (config.host.endsWith('/') ?  '#/post/' : '/#/post/')

module.exports = function(socketIO) {

    router.get('/get-all-categories/', function (req, res) {
        models.Category.findAllCategories(function (err, categories) {
            if (!err) {
                res.status(200).json(categories)
            }
            else {
                res.status(500)
            }
        })
    });

    router.get('/get-all-tags/', function (req, res) {
        models.Tag.getAllTags(function (err, tags) {
            if (!err) {
                res.status(200).json(tags)
            }
            else {
                res.status(500)
            }
        })
    });

    router.get('/get-all-addresses/', function(req, res) {
        models.User.getAddress(function(addr) {
            res.json(addr);
        })
    });

    router.get('/get-home-posts/', function(req, res) {
        models.Post.getPostsHomePage(function(posts) {
            res.json(posts);
        })
    });

    router.post('/delete-tag/', function (req, res) {
        models.Tag.removeTags(req.body.tagId, function (err) {
            if (!err) {
                res.sendStatus(200)
            }
            else {
                res.sendStatus(500)
            }
        })
    })

    router.post('/add-tag/', function (req, res) {
        models.Tag.createNewTag(req.body.tagName, function (err, tag) {
            if (!err) {
                res.status(200).json(tag)
            }
            else {
                res.sendStatus(500)
            }
        })
    })

    router.get('/get-all-users/', function (req, res) {
        models.User.getAllUsers(function (err, users) {
            if (!err) {
                res.status(200).json(users)
            }
            else {
                res.sendStatus(500)
            }
        })
    });

    router.get('/get-all-posts-filtered-by-category/:category', function (req, res) {
        models.Post.findAllPostsFilteredByCategory(req.params['category'], function (err, posts) {
            if (!err) {
                res.status(200).json(posts)
            }
            else {
                res.sendStatus(500)
            }
        })
    });

    router.get('/get-all-tags-filtered-by-category/:category', function (req, res) {
        models.Tag.findAllTagsFilteredByCategory(req.params['category'], function (err, tags) {
            if (!err) {
                res.status(200).json(tags)
            }
            else {
                res.sendStatus(500)
            }
        })
    });

    router.get('/get-post-by-id/:id', function (req, res) {
        models.Post.findPostById(req.params['id'], function (err, post) {
            if (!err) {
                res.status(200).json(post)
            }
            else {
                res.sendStatus(500)
            }
        })
    });

    router.get('/increase-view-by-one/:id', function (req, res) {
        models.Post.findPostById(req.params['id'], function (err, post) {
            if (!err) {
                post.increasePostViewByOne(function () {
                    res.sendStatus(200)
                })
            }
            else {
                res.sendStatus(500)
            }
        })
    });

    router.post('/create-new-post/', function (req, res) {
        models.Post.createNewPost(req.user._id,
            req.body.category,
            req.body.tags,
            req.body.title,
            req.body.text,
            function (err, post) {
                if (!err) {
                    socketIO.sockets.emit(req.body.category, post)
                    socketIO.sockets.emit('new-post', post)
                    if(config.email != false) {
                        models.User.getAllUsers(function (err, users) {
                            if (err) {
                                return res.sendStatus(500)
                            }
                            var other_users = users.filter(function (user) {
                                return user.email != req.user.email
                            })
                            var other_users_email = other_users.map(function (obj) {
                                return obj.email
                            })

                            var currentPostURL = postURL + post._id
                            var html = '<p dir="ltr"><b>Hello,</b></p>' +
                                '<p dir="ltr"><br>Just letting you know that there is a new post in KnowledgeCenter under</br>' +
                                '<br><b>"' + post.category.name + '"</b> by <b>' + req.user.username + '</b>.</br></p>' +
                                '<a style="direction: ltr; float: left;" href="' + currentPostURL + '">' + currentPostURL + '</a>'

                            var mailOptions = {
                                from: 'KnowledgeCenter KnowledgeCenter', // sender address
                                to: other_users_email, // list of receivers
                                subject: 'New Post', // Subject line
                                html: html
                            }
                            transporter.sendMail(mailOptions, function (err, info) {
                            }) // happens in another thread and therefore does not slow the response
                        })
                    }
                    res.status(200).json(post)
                }
                else {
                    res.sendStatus(500)
                }
            })
    });

    router.post('/create-new-comment/', function (req, res) {
        models.Comment.createNewCommentAndPushToPost(req.user._id,
            req.body.postId,
            req.body.text,
            function (err, comment, post) {
                if (!err) {
                    socketIO.sockets.emit(post._id, comment)
                    if(config.email != false && !comment.user._id.equals(post.user._id)) {  // the comment is not posted by the Post owner himself
                        var currentPostURL = postURL + post._id
                        var html = '<p dir="ltr"><b>Hello,</b></p>' +
                            '<p dir="ltr">Just letting you know that there is a new comment by <b>' + req.user.username + '</b> in your post: <b>' + post.title + '</b>.</p>' +
                            '<a style="direction: ltr; float: left;" href="' + currentPostURL + '">' + currentPostURL + '</a>'

                        var mailOptions = {
                            from: 'KnowledgeCenter KnowledgeCenter', // sender address
                            to: post.user.email, // list of receivers
                            subject: 'New Comment', // Subject line
                            html: html
                        }
                        transporter.sendMail(mailOptions, function (err, info) {}) // happens in another thread and therefore does not slow the response
                    }
                    res.status(200).json(comment)
                }
                else {
                    res.sendStatus(500)
                }

            })
    });

    router.post('/update-post/', function (req, res) {
        models.Post.updatePost(req.user._id,
            req.body.post,
            function (err, post) {
                if (!err) {
                    return res.status(200).json(post)
                }
                else {
                    res.sendStatus(500)
                }
            })
    });

    router.post('/update-comment/', function (req, res) {
        models.Comment.updateComment(req.user._id,
            req.body.comment,
            function (err) {
                if (!err) {
                    res.sendStatus(200)
                }
                else {
                    res.sendStatus(500)
                }
            })
    });

    router.post('/update-user-admin/', function(req, res) {
        models.User.updateUserAdmin(req.body.username,
            req.body.password, req.body.email, req.body.userId,
            function(err) {
                if(err) {
                    return res.sendStatus(500)
                }
                return res.sendStatus(200)
            })
    });

    router.post('/delete-post/', function (req, res) {
        models.Post.deletePost(req.user, req.body.postId, function (err) {
            if (!err) {
                res.sendStatus(200)
            }
            else {
                return res.sendStatus(500)
            }
        })
    })

    router.post('/delete-comment/', function (req, res) {
        models.Comment.deleteComment(req.user._id, req.body.commentId, function (err) {
            if (!err) {
                socketIO.sockets.emit('comment-' + req.body.postId, req.body.commentId)
                return res.sendStatus(200)
            }
            else {
                return res.sendStatus(500)
            }
        })
    })

    router.post('/search/', function (req, res) {
        models.Post.search(req.body, function (err, posts) {
            if (!err) {
                return res.status(200).json(posts)
            }
            else {
                return res.status(500)
            }
        })
    })

    router.post('/update-solved-status/', function (req, res) {
        models.Post.updateSolvedStatus(req.user._id,
            req.body.postId,
            req.body.solved,
            function (err) {
                if (!err) {
                    res.sendStatus(200)
                }
                else {
                    res.sendStatus(500)
                }
            })
    });

    router.get('/get-categories-and-number-of-related-posts/', function (req, res) {
        models.Post.getPostsGroupedByCategory(function (err, result) {
            if (!err) {
                res.status(200).json(result)
            }
            else {
                res.sendStatus(500)
            }
        })
    })

    router.get('/get-tags-and-number-of-related-posts/', function (req, res) {
        models.Post.getNumberOfRelatedPostsForEachTag(function (err, results) {
            if (!err) {
                res.status(200).json(results)
            }
            else {
                res.status(500)
            }
        })
    })

    router.get('/get-all-images/', function (req, res) {
        models.Image.findAllImages(function (err, images) {
            if (err) {
                res.sendStatus(500)
            }
            else {
                res.status(200).json(images)
            }
        })
    })

    router.post('/admin/edit-user/', function(req, res) {
        if(req.user.is_admin) {
            models.User.updateUserAdmin(req.body.username, req.body.email, req.body.userId, function(err) {
                if(err) {
                    res.sendStatus(500)
                }
                else {
                    res.sendStatus(200)
                }
            })
        }
        else {
            res.sendStatus(500)
        }
    })

    return router
}