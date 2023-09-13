const Post = require('../../../models/post');
const Comment = require('../../../models/comment');
module.exports.index = async function(req, res){
    
    let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            }
        });
    
    
        return res.status(200).json({
            message: 'List OF Posts',
            posts: posts
        });
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
            // Delete the post
            await post.deleteOne();

            // Delete comments of the post
            await Comment.deleteMany({ post: req.params.id });
          
            return res.status(200).json({
                message: "Post and associated comments deleted successfully!"
            });
        }else{
            return res.status(401).json({
                message: "You cannot delete this post!"
            });
            
        }
    }catch(err){
        console.log("Error in finding post ----->", err);
        return res.json(500, {
            message: "Internal Server Error"
        });
    }

}