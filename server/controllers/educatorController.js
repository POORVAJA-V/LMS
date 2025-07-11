import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/Purchase.js";

export const updateRoleToEducator = async (req, res) => {
    try {
        const auth = req.auth; // Access auth directly
        const userId = auth.userId; // Get userId from auth
        console.log("User  ID:", userId);
        
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        });

        // Add delay to ensure metadata propagates
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        res.json({ success: true, message: "You can publish a course now!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const addCourse = async (req, res) => {
    try {
       
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId; 
      
        console.log("Raw courseData:", req.body.courseData);
console.log("Type of courseData:", typeof req.body.courseData);

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail Not Attached" });
        }

        
            const parsedCourseData = await JSON.parse(courseData);
       

        parsedCourseData.educator = educatorId;
        const newCourse = await Course.create(parsedCourseData);
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.json({ success: true, message: "Course Added" });
    } catch (error) {
        
        res.json({ success: false, message: error.message });
    }
};

export const getEducatorCourses = async(req,res)=>{
    try{
        const educator=req.auth.userId 
        const courses = await Course.find({educator})
        res.json({success:true,courses})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const educatorDashboardData=async()=>{
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const totalCourse = courses.length;
        const courseIds=courses.map(course=>course._id)

        //purchase 
        const purchases= await Purchase.find({
            courseId:{$in:courseIds},
            status :'completed'
        });
        const totalEarnings = purchases.reduce((sum,purchase)=>sum+purchase.amount,0);

        const enrolledStudentsData=[];
        for(const course of courses){
            const students = await User.find({
                _id:{$in:course.enrolledStudents}
            },'name imageUrl');
            students.forEach(student=>{
enrolledStudentsData.push({
    courseTitle:course.courseTitle,
    student
});
            });
        }

        res.json({success:true,educatorDashboardData:{totalEarnings,enrolledStudentsData,totalCourse}})
    }catch(error){
res.json({success:false,message:error.message});
    }
}

export const getEnrolledStudentData=async()=>{
    try{
 const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const courseIds = courses.map(course=>course._id);
 const purchases= await Purchase.find({
            courseId:{$in:courseIds},
            status :'completed'
        }).populate('userId',"name imageUrl").populate("courseId","courseTitle")

const enrolledStudents=purchases.map(purchase=>({
    student : purchase.userId,
    courseTitle:purchase.courseId.courseTitle,
    purchaseData:purchase.createdAt
}))

res.json({success:true,enrolledStudents})

    }catch(error){
res.json({success:false,message:error.message})
    }
}
