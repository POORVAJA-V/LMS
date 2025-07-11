import express from "express"
import { addUserRatings, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from "../controllers/UserController.js"

const userRouter = express.Router()

userRouter.get("/data",getUserData)
userRouter.get("/enrolled-courses",userEnrolledCourses)
userRouter.post("/purchase",purchaseCourse)
userRouter.post('/update-course-progress',updateUserCourseProgress)
userRouter.post("/get-course-progress",getUserCourseProgress)
userRouter.post("/add-rating",addUserRatings)

export default userRouter
