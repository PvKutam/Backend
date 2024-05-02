    import { asyncHanlder } from "../utils/asyncHandler.js";
    import  {ApiError} from "../utils/ApiError.js"
    import { User } from "../models/user.model.js";
    import {uploadonCloudinary} from "../utils/cloudinary.js"
    import {ApiResponce} from "../utils/ApiResponce.js"
    import jwt from "jsonwebtoken"


    const generateAcessAndRefreshTokens= async(userID)=>{
        try {
            const user=await User.findById(userID)
            const accestoken=user.generateAccessToken()
            console.log(accestoken);
            const refreshToken=user.generateRefreshToken()
            console.log(refreshToken);

            user.refreshToken=refreshToken
            await user.save({validateBeforeSave: false})

            return {accestoken,refreshToken}

            
        } catch (error) {
            console.log(error);
            throw new ApiError(500,"something went wrong when generating acces tokens")            
        }


    }

    const registerhandler = asyncHanlder(async (req, res) => {
        //get username, password and save it in db 
        // validation  -not null
        // check if user exists:username,email
        //check for username, and avatar
        // upload them to cloudinary,avatar
        // create user
        // remove password, refrsh token from resp
        // check user creationals
        // return true

        //username: pvk.abbu@gmail.com
        //passowrd:123456

        const {fullname,username,email,password}=req.body
        // console.log("email is",email);

        if([fullname,username,email,password].some((field)=> field?.trim() === "" ))
        {
            throw new ApiError(400,"ALl field are needed")
        }
        const existinguser= await User.findOne({
            $or:[{username},{email}]
        })
        if(existinguser){
            throw new ApiError(409,"User alredy exists")
        }

        // console.log(req.files);
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const coverImageLocalPath = req.files?.coverimg?.[0]?.path;


        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is needed")
        }
        const   avatar= await uploadonCloudinary(avatarLocalPath)
        const   coverImg= await uploadonCloudinary(coverImageLocalPath)

        if(!avatar){
            console.log("not getting avater pic");
            throw new ApiError(400, "Avatr file is needed")
        }
        const user=await User.create({
            fullname,
            avatar:avatar.url,
            coverImage:coverImg?.url || "",
            email,
            password,
            username:username.toLowerCase()
        })
    const createdUser= await User.findById(user._id  ).select(
            "-password -refreshToken "
        )
        if (!createdUser) {
            throw new ApiError(500,"Something went wrong")
        }
        
        return res.status(201).json( 
            new ApiResponce(200,createdUser, "User registered Successfully")
        )
    });

    const Loginhanlder= asyncHanlder(async (req,res)=>{
        // take email, password or username from req.body
        // check username or email 
        //check password if its wrong send errr
        // something access toke 
        // send cookies and login

        const {email, username, password} = req.body
    console.log(req.body);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

        const user = await User.findOne({
            $or: [{username}, {email}]
        })

        if (!user){
            throw new ApiError(404,"User not found/ incorrect username or email")
        }
        const isPasswordValid= await user.isPasswordCorrect(password)
        if(!isPasswordValid){
            throw new ApiError(401,"incorrect Password")
        }

        const {accestoken,refreshToken}=await generateAcessAndRefreshTokens(user._id)

        const loggedInUser= await User.findById(user._id).select("-password -refreshToken")
        const options={
            httpOnly:true,
            secure:true
        }
        return res.
        status(200)
        .cookie("accestoken",accestoken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponce(200,
            {
                user:loggedInUser,accestoken,refreshToken
            },
            "User logged in successfully"
        ))
    })

    const logout= asyncHanlder( async(req,res)=>{
        // console.log(req);
        await User.findByIdAndUpdate(

           req.user._id,{ 
            $set:{
                refreshToken:undefined
            }}
             ,{new:true}
        )
        const options={
            httpOnly:true,
            secure:true
        }

        return res.status(200).clearCookie("accestoken",options).clearCookie("refreshToken",options).json( new ApiResponce(200,{},"user Logged Out"))


    })

    
    const refreshAccessToken= asyncHanlder(async(req,res)=>{
      const incomingRefreshToken=  req.cookies?.refreshToken || req.body.refreshToken
      if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
      }
      try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
        const user=await User.findById(decodedToken?._id)
        if(!user){
          throw new ApiError(401,"Invalid refresh token")
        }
  
        if(incomingRefreshToken !== user.refreshToken){
          throw new ApiError(401, "Refresh token is expired or used")
        }
        const options={
          httpOnly:true,
          secure:true
      }
        const{accestoken,newrefreshToken}=await generateAcessAndRefreshTokens(user._id)
        
        return res
        .status(200)
        .cookie("accestoken",accestoken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
          new ApiResponce(200,{accestoken,refreshToken:newrefreshToken },"Access token refreshed")
        )
      } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
        
      }




    })
    
    
    export { registerhandler,Loginhanlder,logout,refreshAccessToken };
