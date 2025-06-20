import {clerkClient} from "@clerk/express"

//middleware
export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const response = await clerkClient.users.getUser(userId);
        
        // Fix: Check if role IS educator (not !==)
        if (response.publicMetadata.role === "educator") {
            return next();
        }
        return res.json({success: false, message: "Unauthorized Access"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
