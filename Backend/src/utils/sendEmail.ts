import nodemailer from "nodemailer";
import Technician from "../models/Technician.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sendBookingEmail = async (
  technicianId: string,
  slot: Date,
  customerName: string
): Promise<void> => {
  try {
    const technician = await Technician.findById(technicianId);

    if (!technician) {
      console.error("Technician not found for email notification");
      return;
    }

    await transporter.sendMail({
      from: `"TechBook" <${process.env.GMAIL_USER}>`,
      to: technician.email,
      subject: "🔔 New Booking Assigned",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Booking!</h1>
            </div>
            <div class="content">
              <p>Hi ${technician.name},</p>
              <p>You have received a new booking from a customer.</p>
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <strong>Customer:</strong>
                  <span>${customerName}</span>
                </div>
                <div class="detail-row">
                  <strong>Date & Time:</strong>
                  <span>${formatDate(slot)}</span>
                </div>
              </div>
              <p>Please make sure to be available at the scheduled time.</p>
            </div>
            <div class="footer">
              <p>TechBook - Your Trusted Technician Booking Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Booking email sent to technician: ${technician.email}`);
  } catch (error) {
    console.error("Error sending booking email to technician:", error);
  }
};

export const sendBookingConfirmationToUser = async (
  userEmail: string,
  technicianName: string,
  slot: Date
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"TechBook" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: "✅ Booking Confirmed",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Your booking has been confirmed successfully.</p>
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <strong>Technician:</strong>
                  <span>${technicianName}</span>
                </div>
                <div class="detail-row">
                  <strong>Date & Time:</strong>
                  <span>${formatDate(slot)}</span>
                </div>
              </div>
              <p>You can manage your booking from your dashboard.</p>
            </div>
            <div class="footer">
              <p>TechBook - Your Trusted Technician Booking Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Confirmation email sent to user: ${userEmail}`);
  } catch (error) {
    console.error("Error sending confirmation email to user:", error);
  }
};
