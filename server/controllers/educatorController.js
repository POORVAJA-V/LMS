import { clerkClient } from "@clerk/express";

export const updateRoleToEducator = async (req, res) => {
  try {
    // Get auth data properly using req.auth()
    const authData = req.auth();
    console.log("Auth data received:", authData);
    
    if (!authData || !authData.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    // Update user metadata in Clerk
    await clerkClient.users.updateUserMetadata(authData.userId, {
      publicMetadata: {
        role: 'educator',
      }
    });

    res.json({ 
      success: true, 
      message: "You can publish a course now!",
      userId: authData.userId 
    });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to update role" 
    });
  }
};
