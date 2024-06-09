const otpServices = require('../Services/otp-service')
const hashService = require('../Services/hash-services')
const crypto = require('crypto');
const otpService = require('../Services/otp-service');

class AuthController {

    async sendOtp(req, res) {

        const { phone } = req.body; // Destructure req.body to get the phone number
        if (!phone) { // Check if phone number is provided
            return res.status(400).json({ message: 'phone field is required' }); 
        }
        const otp= await otpServices.generateOtp();     // recieved promise
        
        const TTL = 1000 * 60 * 2 //2 minute;
        const expire= Date.now() + TTL ;  // otp activation time
        const data =`${phone}.${otp}.${expire}`;    // this three thing are store in our hash;
        const hash = hashService.hashOtp(data);

         
        //sending live OTP
        try{
            await otpServices.sendBySms(phone,otp);
             res.json({
                hash : `${hash}.${expire}`,
                phone,
            })
        }catch(err){
            console.log(err);
            res.status(500).json({message : 'message sending failed'});
        }


        // res.json({ hash : hash}); // Send response if phone number is provided


     //HASHING OF OTP
    } 
    
    //verify OTP
    verifyOtp(req,res){
         const { otp, hash, phone }= req.body;
         if(!otp || !hash || !phone) {
            res.status(400).json({message : "All fields are required. "});
         }
         const [hashOtp , expire]= hash.split('.');
         if(Date.now() > expire){
            res.status(400).json({message : "OTP expired."})
         }

         const data = `${phone}.${otp}.${expire}`;

         const isValid = otpService.verifyOtp(hashOtp,data);

         if(!isValid){
            res.status(400).json({message : "InValid OTP"})
         }

         let user;
         let accessToken;
         let refreshToken;
         

     }
}

module.exports = new AuthController(); // Instantiate and export the AuthController class
