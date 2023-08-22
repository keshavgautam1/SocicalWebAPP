const Post = require('../models/post');
const Comment = require('../models/comment');

module.exports.create = function(req, res){
    Post.create({
        content: req.body.content,
        user: req.user._id
    })
    .then(post => {
        return res.redirect('back');
    })
    .catch(err => {
        console.log('Error in creating a post', err);
        return res.redirect('back');
    });
}

module.exports.destroy = async function(req, res) {
    try {
        // Find the post by its ID
        const post = await Post.findById(req.params.id).exec();

        if (!post) {
            // Handle case where post doesn't exist
            return res.redirect('back');
        }

        // Check if the authenticated user owns the post
        if (post.user.toString() === req.user.id) {
            await Post.deleteOne({ _id: req.params.id }); // Use deleteOne to remove the post

            // Delete all comments associated with the deleted post
            await Comment.deleteMany({ post: req.params.id });

            return res.redirect('back');
        } else {
            // If the user does not own the post, redirect back
            return res.redirect('back');
        }
    } catch (err) {
        // Handle any errors that occurred during the process
        console.log('Error in finding or deleting a post', err);
        return res.redirect('back');
    }
};
