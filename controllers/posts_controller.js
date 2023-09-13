const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');
const User = require('../models/user');


module.exports.create = async function(req, res){
    try{
        let post = await Post.create({
            content: req.body.content,
            user: req.user.id
        });

        
        if(req.xhr){
            let user = await User.findById(req.user.id);

            // if we want to populate just the name of the user (we'll not want to send the password in the API), this is how we do it!
            post = await post.populate('user', 'name');

            return res.status(200).json({
                data: {
                    post: post,
                    username: user.name

                },
                message: "Post Created!"
            });
        }
        
        req.flash('success', 'Post Published!');
        // console.log('Post created successfully --->', post);
        return res.redirect('back');
    }
    catch(err){
        req.flash('error', err);
        console.log('Error in creating post --->', err);
        return res.redirect('back');
    }
}



module.exports.destroy = async function(req, res){
    try{
        let post = await Post.findById(req.params.id);
        
        if (!post) {
            console.log("Post not found");
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.user == req.user.id){

            //CHANGE :: delete the associated likes for the post and all its comments' likes too
            await Like.deleteMany({likeable: post, onModel: 'Post'});
            await Like.deleteMany({_id: {$in: post.comments}});

            // Delete the post
            await post.deleteOne();

            // Delete comments of the post
            await Comment.deleteMany({ post: req.params.id });

            return res.status(200).json({
                data: {
                    post_id: req.params.id
                },
                message: "Post Deleted!"
            });
        }
        else{
            console.log("Not Authorized to Delete this post");
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
    }
    catch(err){
        console.log("Error in finding post ----->", err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}





