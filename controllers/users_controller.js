const User = require('../models/user'); // Import the User model

module.exports.profile = async function(req, res) {
    try {
        // Fetch the user profile by the provided ID using async/await
        const user = await User.findById(req.params.id);

        // Check if user is found
        if (!user) {
            // Handle the case when the user is not found by rendering an appropriate view
            return res.render('user_not_found', {
                title: "User Not Found"
            });
        }

        // Render the user profile view with the fetched user data
        return res.render('user_profile', {
            title: "User Profile",
            profile_user: user
        });
    } catch (err) {
        // If an error occurs during the fetching process, log the error
        console.error('Error in fetching user profile:', err);

        // Handle the error case by rendering an error view
        return res.render('error', {
            title: "Server Error"
        });
    }
};

module.exports.update = async function(req, res) {
    try {
        // Check if the authenticated user owns the profile being updated
        if (req.user.id == req.params.id) {
            // Update the user's data using async/await
            await User.findByIdAndUpdate(req.params.id, req.body);

            // Redirect back to the previous page after updating the user profile
            return res.redirect('back');
        } else {
            // Send a 401 Unauthorized status if the user is not authorized to update the profile
            return res.status(401).send('Unauthorized');
        }
    } catch (err) {
        // Handle any errors that occurred during the process
        console.error('Error in updating user:', err);

        // Handle the error case by rendering an error view
        return res.render('error', {
            title: "Server Error"
        });
    }
}


// render the sign up page
module.exports.signUp = function(req, res){
    if(req.isAuthenticated()){
       return res.redirect('/users/profile');
    }
    return res.render('user_sign_up', {
        title: "Socionise | Sign Up"
    });
}

// render the sign in page
module.exports.signIn = function(req, res){
    if(req.isAuthenticated()){
       return res.redirect('/users/profile');
    }
    
    return res.render('user_sign_in', {
        title: "Socionise | Sign In"
    });
}

// get the sign up data
module.exports.create = async function(req, res){
    try {
        if (req.body.password !== req.body.confirm_password) {
            return res.redirect('back');
        }

        const existingUser = await User.findOne({ email: req.body.email });

        if (!existingUser) {
            const newUser = await User.create(req.body);
            return res.redirect('/users/sign-in'); // Corrected redirection path
        } else {
            return res.redirect('back');
        }
    } catch (err) {
        console.error('Error in creating user while signing up:', err);
        return res.redirect('back');
    }
}

// sign in and create a session for the user
module.exports.createSession = function(req, res){
    return res.redirect('/');
}

module.exports.destroySession = function(req, res){
    req.logout(function(err) {
        if (err) {
            console.error('Error in destroying session:', err);
            return;
        }
        return res.redirect('/');
    });
}
