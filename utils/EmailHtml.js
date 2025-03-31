// emailTemplate.js
module.exports.HTML = (authCode, UserName, TypeofEmail) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      background-color: #ffffff;
      max-width: 600px;
      margin: 20px auto;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #4caf50;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .email-body {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .email-footer {
      background-color: #f4f4f4;
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #777777;
    }
    .verification-code {
      font-size: 24px;
      color: #4caf50;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button {
      display: block;
      width: 200px;
      margin: 20px auto;
      padding: 10px;
      text-align: center;
      background-color: #4caf50;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .cta-button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Chat Me</h1>
    </div>
    <div class="email-body">
      <p>Hi ${UserName},</p>
      <p>Following is your ${TypeofEmail}</p>
      <p>It is only valid for 1 minute</p>

      <div class="verification-code">${authCode}</div>
      <p>If you didn’t request this email, please ignore it.</p>
    </div>
    <div class="email-footer">
      &copy; 2024 Chat Me. All rights reserved.
    </div>
  </div>
</body>
</html>`;
