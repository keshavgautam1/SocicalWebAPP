// Import necessary models
const Post = require('../models/post');
const User = require('../models/user');

// Controller function for the home route
module.exports.home = async function(req, res) {
    try {
        // Fetch all posts, populate user and comments
        const posts = await Post.find({})
            .populate('user')  // Populate the 'user' field with user data
            .populate({
                path: 'comments',  // Populate the 'comments' field
                populate: {
                    path: 'user'  // Populate the 'user' field within comments
                }
            })
            .exec();  // Execute the query

      
        const users = await User.find({}).exec();  // Fetch all user data

        // Render the home view with posts and users
        return res.render('home', {
            title: "Socionize | Home",
            posts: posts,       // Pass the fetched posts to the view
            all_users: users    // Pass the fetched users to the view
        });
    } catch (err) {
        // If an error occurs in the try block, catch and log it
        console.error("Error in home controller:", err);
    }
};
