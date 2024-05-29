
import jwt from 'jsonwebtoken';
import userModel from "../models/user"
import Sender from 'aws-sms-send';

import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';
import status from "../enums/status"
import userType from "../enums/userType"
import ExcelJS from 'exceljs';
import { userServices } from '../api/v1/services/user';
const { findAllUsers } = userServices;
require('dotenv').config();
const uuid = require('uuid');
module.exports = {

 // sent email thanks to enquiry 
 async Enquiry(userEmail, userName)  {
  var sub = `<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
    <div style="margin: 50px auto; width: 70%; padding: 20px 0">
      <div style="border-bottom: 1px solid #eee">
        <table style="width: 100%">
          <tr>
            <th><img src="#" alt="Company Logo" style="max-width: 100px;"></th>
            <th style="text-align: right; font-size: 1.5em; color: #333;">Knights Fin Estates Company</th>
          </tr>
        </table>
      </div>
      <p style="padding: 10px; background: #f0f0f0; border-radius: 4px;">
        Dear ${userName},
      </p>
      <p style="padding: 10px; background: #f0f0f0; border-radius: 4px;">
        Thank you for your inquiry about our knights fin estates services. We have received your request and one of our agents will be in touch with you soon.
      </p>
      <p style="padding: 10px; background: #f0f0f0; border-radius: 4px;">
        If you have any immediate questions, feel free to contact  +91-8177083523.
      </p>
      <p style="padding: 10px; background: #f0f0f0; border-radius: 4px;">
        Best regards,<br/>
        Knights fin estates Company Team
      </p>
      <hr style="border: none; border-top: 1px solid #eee" />
      <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
      knightsfinestates.com || +91-8177083523
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://www.facebook.com/profile.php?id=61559868392921" style="margin: 0 10px;">
        <img src="https://i3.wp.com/upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/1200px-Facebook_f_logo_%282019%29.svg.png" alt="Facebook" style="width: 30px; height: 30px;">
        </a>
        <a href="https://x.com/EstatesFin16778" style="margin: 0 10px;">
        <img src="https://english.cdn.zeenews.com/sites/default/files/styles/zm_700x400/public/2022/11/11/1115415-twitter.gif" alt="Twitter" style="width: 30px; height: 30px;">
        </a>
        <a href="https://www.linkedin.com/company/knightsfinestates" style="margin: 0 10px;">
          <img src="https://yt3.googleusercontent.com/oSDWM41k0gFqFkTKMQlDQ8kiJsPeaZSNP73wcYnDCzrjzAcDrdQST1Z1e9jZ8_Vgow57kJfl2CA=s900-c-k-c0x00ffffff-no-rj" alt="LinkedIn" style="width: 30px; height: 30px;">
        </a>
        <a href="https://www.instagram.com/knightsfinestates/" style="margin: 0 10px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="width: 30px; height: 30px;">
        </a>
      </div>
    </div>
  </div>`;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:  process.env.NODEMAILER_EMAIL ,
      pass: process.env.NODEMAILER_PASSWORD 
    }
  });
  var mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: userEmail,
    subject: 'Thank You for Your Inquiry',
    html: sub,
  };
  return await transporter.sendMail(mailOptions);
},
  // userList returns
  async sendUserListToAdmin   () {
    try {
      const users = await userServices.findAllUsers();
      console.log("🚀 ~ sendUserListToAdmin ~ users:", users)
      
      // Create a new Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');
      
      // Add column headers
      worksheet.columns = [
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Country Code', key: 'countryCode', width: 15 },
        { header: 'Mobile Number', key: 'mobileNumber', width: 20 },
        { header: 'Message', key: 'message', width: 50 },
        { header: 'Location', key: 'location', width: 30 },
        { header: 'Enqury Date', key: 'createdAt', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      
      // Add user data
      users.forEach(user => {
        worksheet.addRow({ 
          email: user.email,
          name: user.name,
          countryCode: user.countryCode || '',
          mobileNumber: user.mobileNumber || '',
          message: user.message,
          location: user.location || '',
          status: user.status, 
          createdAt: user.createdAt.toLocaleDateString(),
        });
      });
      
      // Save the workbook to a buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Send the email
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD
        }
      });
      
      let mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: process.env.NODEMAILER_ADMIN_EMAIL, // Admin email from config
        subject: 'User List',
        text: 'Attached is the list of users.',
        attachments: [
          {
            filename: 'user_list.xlsx',
            content: buffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ]
      };
      await Promise.all(users.map(async user => {
        user.status = 'Sent';
        await user.save();
      }));
      await transporter.sendMail(mailOptions);
      console.log('User list sent to admin.');
    } catch (error) {
      console.error('Error sending user list to admin:', error);
    }
  },
}

// console.log(findCred);