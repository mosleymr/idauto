import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function fetchSystemAdmins() {
  const base = process.env.IDENTITY_API_BASE ?? "https://portal.rapidisd.org";
  const username = process.env.IDENTITY_API_USERNAME;
  const password = process.env.IDENTITY_API_PASSWORD;

  if (!username || !password) {
    throw new Error("IDENTITY_API_USERNAME or IDENTITY_API_PASSWORD not set");
  }

  const url = `${base.replace(/\/$/, "")}/api/rest/restpoints/dashboards/v1/systemadmins`;

  const authHeader =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
    },
    // ensure fresh data; optional
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Identity API error:", res.status, text);
    throw new Error(`Identity API error: ${res.status}`);
  }

  return res.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = (body.question as string | undefined)?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // 1) Fetch system admins data from your identity API
    const systemAdmins = await fetchSystemAdmins();

    // 2) Ask Anthropic, giving it both the question and the JSON
    const systemPrompt = `
You are an identity security assistant for a K-12 district.

You are given:
- A question from the user.
- JSON data containing all system administrator groups and their members.

JSON structure example:
{
  "groups": [
    {
      "name": "Tenant Administrator",
      "members": [
        {
          "username": "KSatterfield",
          "mail": "KSatterfield@idauto.net",
          "riskScore": "11",
          "risk": "High",
          "riskDetail": "User Risk Impact Score 4. ..."
        },
        ...
      ]
    },
    ...
  ]
}

Use ONLY the provided JSON for user-specific / group-specific facts.
You can use your own knowledge for general best practices and recommendations.

When answering:
- Clearly list relevant users, their groups, and risk.
- Highlight high-risk admins and why they are high risk.
- Suggest remediation steps (e.g., reduce privileged roles, enforce MFA, improve password policies).
`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Question:\n${question}\n\n` +
                `System admin data (JSON):\n` +
                JSON.stringify(systemAdmins).slice(0, 16000), // truncate if huge
            },
          ],
        },
      ],
    });

    const answerText =
      response.content
        .filter((block) => block.type === "text")
        .map((block: any) => block.text)
        .join(" ")
        .trim() || "I was unable to generate a response.";

    return NextResponse.json({ answer: answerText });
  } catch (err: any) {
    console.error("Error in /api/identity-chat:", err);
    return NextResponse.json(
      { error: "Server error talking to identity agent." },
      { status: 500 }
    );
  }
}
