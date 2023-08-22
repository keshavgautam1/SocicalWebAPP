const Comment = require('../models/comment');  // Importing the Comment model
const Post = require('../models/post');        // Importing the Post model

// Exporting the function to handle comment creation
module.exports.create = async function(req, res) {
    try {
        // Find the post using the ID provided in the request body
        const post = await Post.findById(req.body.post);

        if (post) {
            // Create a new Comment using data from the request body
            const comment = await Comment.create({
                content: req.body.content,
                post: req.body.post,
                user: req.user._id  // Assuming this refers to the current logged-in user
            });

            // Add the newly created comment to the post's "comments" array
            post.comments.push(comment);
            await post.save();  // Save the updated post

            // Redirect back to the home page after creating the comment
            return res.redirect('/');
        }
    } catch (err) {
        console.error(err);  // Handle the error if needed
    }
}

// Exporting the function to handle comment deletion
module.exports.destroy = async function(req, res) {
    try {
        // Find the comment by its ID
        const comment = await Comment.findById(req.params.id);

        // Check if the comment exists and if the current user is the author of the comment
        if (comment && comment.user.toString() === req.user._id.toString()) {
            // Store the ID of the post that the comment belongs to
            const postId = comment.post;

            // Delete the comment
            await comment.deleteOne();

            // Remove the comment ID from the 'comments' array of the post
            const post = await Post.findByIdAndUpdate(postId, { $pull: { comments: req.params.id } });

            // Redirect back to the previous page
            return res.redirect('back');
        } else {
            // Redirect back to the previous page if the user is not authorized
            return res.redirect('back');
        }
    } catch (err) {
        // Handle any errors that occur during the process
        console.error(err);
    }
};

