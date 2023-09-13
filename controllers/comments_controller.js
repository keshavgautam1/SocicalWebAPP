const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');
const commentsMailer = require('../mailers/comments_mailer');
const commentEmailWorker = require('../workers/comment_email_worker');
const queue = require('../config/kue');
const Like = require('../models/like');

module.exports.create = async function(req, res){
    try{
        let post = await Post.findById(req.body.post);

        if(post){
            let comment = await Comment.create({
                content: req.body.content,
                post: req.body.post,
                user: req.user._id
            });
            
            post.comments.push(comment);
            post.save();

            comment = await comment.populate('user', 'name email');
            // commentsMailer.newComment(comment);
            let job = queue.create('emails', comment).save(function(err){
                if(err){
                    console.log('Error in creating a queue', err);
                    return;
                }
                console.log('job enqueued', job.id);
            });
            if(req.xhr){
                let user = await User.findById(req.user.id);
                req.flash('success', 'Comment Created!');

                return res.status(200).json({
                    data: {
                        comment: comment,
                        username: user.name
                    },
                    message: "Comment Created!"
                });
            }

            return res.redirect('back');
        }
    }
    catch(err){
        req.flash('error', err);
        return;
    }
}

    



module.exports.destroy = async function(req, res){

    try{
        let comment = await Comment.findById(req.params.id);

        if(comment.user == req.user.id){
            let postId = comment.post;
            await comment.deleteOne();

            // let post = await Post.findById(postId)
            // post.comments.splice(post.comments.indexOf(req.params.id) , 1)

            // await post.save();

            let post = await Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id}});
            // CHANGE :: destroy the associated likes for this comment 
            await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});

            // send the comment id which was deleted back to the views
            if(req.xhr){
                return res.status(200).json({
                    data: {
                        comment_id: req.params.id
                    },
                    message: "Comment Deleted!"
                });
            }
            req.flash('success', 'Comment Deleted!');
            res.redirect('back');
        }
    }
    catch(err){
        console.log('Error in deleting comment', err); 
        return; }

}