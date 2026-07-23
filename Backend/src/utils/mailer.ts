import dotenv from "dotenv";
dotenv.config();

export async function sendVerificationCode(
  toEmail: string,
  code: string,
): Promise<Boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: toEmail,
      },
      body: JSON.stringify({
        from: "R3_Love <onboarding@resend.dev>",
        to: [process.env.TEST_MAIL as string],
        subject: "Your verification code",
        html: `
         <div style="text-align:center; font-family:sans-serif; padding:30px">
            <h2 style="color:#ec4899; margin-bottom:8px">R3_Love</h2>
            <p style="color:#4b5563">Your verification code is:</p>
            <h1 style="font-size:32px; letter-spacing:10px; color:#be185d; margin:16px 0">${code}</h1>
            <p style="color:#9ca3af; font-size:12px">This code expires in 10 minutes.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Resend error:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email", error);
    return false;
  }
}
