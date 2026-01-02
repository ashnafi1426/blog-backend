import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const initializeSendGrid = () => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return true;
  }
  return false;
};

// Constant sender email
const SENDER_EMAIL = 'noreply@sendgrid.net';

// Send email notification for claps
export const sendClapNotificationEmail = async (postAuthorEmail, postAuthorName, clapperName, postTitle) => {
  try {
    // Skip if credentials not configured
    if (!process.env.SENDGRID_API_KEY) {
      return;
    }

    const msg = {
      to: postAuthorEmail,
      from: SENDER_EMAIL,
      subject: `${clapperName} clapped your story: "${postTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Someone clapped your story!</h2>
          <p>Hi ${postAuthorName},</p>
          <p><strong>${clapperName}</strong> clapped your story:</p>
          <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50;">
            <strong>"${postTitle}"</strong>
          </p>
          <p>Keep writing great content!</p>
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from BlogWebsite. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`Clap notification email sent to ${postAuthorEmail}`);
  } catch (error) {
    console.error('Failed to send clap notification email:', error.message);
  }
};

// Send email notification for comments
export const sendCommentNotificationEmail = async (postAuthorEmail, postAuthorName, commenterName, postTitle, commentPreview) => {
  try {
    // Skip if credentials not configured
    if (!process.env.SENDGRID_API_KEY) {
      return;
    }

    const msg = {
      to: postAuthorEmail,
      from: SENDER_EMAIL,
      subject: `${commenterName} commented on your story: "${postTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Someone commented on your story!</h2>
          <p>Hi ${postAuthorName},</p>
          <p><strong>${commenterName}</strong> commented on your story:</p>
          <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50;">
            <strong>"${postTitle}"</strong>
          </p>
          <p style="background-color: #f9f9f9; padding: 10px; border-left: 3px solid #2196F3; margin: 15px 0;">
            <em>"${commentPreview}"</em>
          </p>
          <p>Reply to engage with your readers!</p>
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from BlogWebsite. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`Comment notification email sent to ${postAuthorEmail}`);
  } catch (error) {
    console.error('Failed to send comment notification email:', error.message);
  }
};

// Send email notification for replies
export const sendReplyNotificationEmail = async (commentAuthorEmail, commentAuthorName, replierName, postTitle, replyPreview) => {
  try {
    // Skip if credentials not configured
    if (!process.env.SENDGRID_API_KEY) {
      return;
    }

    const msg = {
      to: commentAuthorEmail,
      from: SENDER_EMAIL,
      subject: `${replierName} replied to your comment on "${postTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Someone replied to your comment!</h2>
          <p>Hi ${commentAuthorName},</p>
          <p><strong>${replierName}</strong> replied to your comment on:</p>
          <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50;">
            <strong>"${postTitle}"</strong>
          </p>
          <p style="background-color: #f9f9f9; padding: 10px; border-left: 3px solid #2196F3; margin: 15px 0;">
            <em>"${replyPreview}"</em>
          </p>
          <p>Continue the conversation!</p>
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from BlogWebsite. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`Reply notification email sent to ${commentAuthorEmail}`);
  } catch (error) {
    console.error('Failed to send reply notification email:', error.message);
  }
};

// Send email notification for follows
export const sendFollowNotificationEmail = async (userEmail, userName, followerName) => {
  try {
    // Skip if credentials not configured
    if (!process.env.SENDGRID_API_KEY) {
      return;
    }

    const msg = {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: `${followerName} started following you!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You have a new follower!</h2>
          <p>Hi ${userName},</p>
          <p><strong>${followerName}</strong> started following you!</p>
          <p>Check out their profile and follow them back if you like their content.</p>
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from BlogWebsite. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`Follow notification email sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send follow notification email:', error.message);
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    // Check if SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.log('⚠️  SendGrid API key not configured - email notifications disabled');
      return false;
    }

    // Initialize SendGrid
    const initialized = initializeSendGrid();
    
    if (initialized) {
      console.log('✅ SendGrid email service is configured and ready to send emails');
      return true;
    } else {
      console.log('⚠️  SendGrid initialization failed');
      return false;
    }
  } catch (error) {
    console.error('⚠️  Email service configuration error:', error.message);
    return false;
  }
};
