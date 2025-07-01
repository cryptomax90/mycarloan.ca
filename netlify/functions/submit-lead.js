const axios = require("axios");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const data = JSON.parse(event.body);

    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.BASE_ID;
    const TABLE_NAME = process.env.TABLE_NAME;

    const fields = {
      "First Name": data["First Name"],
      "Last Name": data["Last Name"],
      "Email": data["Email"],
      "Phone Number": data["Phone Number"],
      "Province": data["Province"],
      "Postal Code": data["Postal Code"],
      "Credit Rating": data["Credit Rating"],
      "Employment Status": data["Employment Status"],
      "Monthly Income": data["Monthly Income"],
      "Years at Employment": data["Years at Employment"],
      "Vehicle Intent": data["Vehicle Intent"],
      "Car Budget": data["Car Budget"],
      "Loan Term": data["Loan Term"],
      "Down Payment Available": data["Down Payment Available"],
      "Down Payment Amount": data["Down Payment Amount"],
      "Consent Given": data["Consent Given"],
      "Country": data["Country"] || "Canada",
    };

    await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
      { fields },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // Send confirmation email to applicant
await axios.post(
  "https://api.resend.com/emails",
  {
    from: "MyCarLoan Test <noreply@resend.dev>",
    to: "cryptomax90@proton.me",  // during sandbox testing; later change to data["Email"]
    subject: "We Received Your Application",
    html: `<p>Hi ${data["First Name"] || "there"},</p><p>Thanks for applying with MyCarLoan.ca! A licensed advisor will contact you soon.</p>`
  },
  {
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
  }
);

// Send notification email to yourself
await axios.post(
  "https://api.resend.com/emails",
  {
    from: "MyCarLoan Notification <noreply@resend.dev>",
    to: "cryptomax90@proton.me",  // always notify yourself
    subject: "New Car Loan Lead Submitted",
    html: `
      <p>A new lead has been submitted:</p>
      <ul>
        <li><strong>Name:</strong> ${data["First Name"]} ${data["Last Name"]}</li>
        <li><strong>Email:</strong> ${data["Email"]}</li>
        <li><strong>Phone:</strong> ${data["Phone Number"]}</li>
        <li><strong>Province:</strong> ${data["Province"]}</li>
        <li><strong>Credit Rating:</strong> ${data["Credit Rating"]}</li>
        <!-- add any other key details you want -->
      </ul>
    `
  },
  {
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
  }
);


    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Submission Error:", error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Submission failed" }),
    };
  }
};

