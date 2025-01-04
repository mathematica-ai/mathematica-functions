import { Resend } from "resend";
import { renderAsync } from "@react-email/components";
import config from "@/config";
import HomeTemplate from "@/emails/HomeTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendHomeEmail(to: string, data: any) {
  try {
    const html = await renderAsync(HomeTemplate({
      title: data.meta_title || "Mathematica Functions",
      description: data.meta_description || "Your AI-powered assistant for mathematical computations and insights",
      slices: data.slices || [],
    }));

    const emailData = await resend.emails.send({
      from: config.resend.fromAdmin,
      to,
      subject: data.meta_title || "Welcome to Mathematica Functions",
      html,
    });

    return emailData;
  } catch (error) {
    console.error('Error in sendHomeEmail');
    throw new Error("Failed to send home email");
  }
}
