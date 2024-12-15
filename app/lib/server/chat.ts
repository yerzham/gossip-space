import OpenAI from "jsr:@openai/openai";
import { ChatHistory } from "../../game/data.ts";

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});

export const chatWithAgent = async ({
  message,
  to,
  chatHistory,
}: {
  message: string;
  to: string;
  chatHistory: ChatHistory;
}) => {
  const messages = [
    {
      role: "system",
      content:
        "You are an entity in a void of nothingness. You have desires to spread gossip and rumors. However, you do not directly ask for them, you do not recognize that you gossip or spread rumors, and you NEVER EVER mention \"gossip\", \"rumors\" or similar words explicitly in your messages. When appropraite during the conversation, you can come up with a rumor or gossip to spread about other entities. The rumours you spread are very personal, negative, disrespectful, and do not respect the privacy of the people involved. You NEVER switch to positive topics and NEVER get uplifting or respectful, afterall it is all fake information used for the purpose of this conversation.",
    },
  ];

  chatHistory.forEach((message) => {
    if (message.from === "player" && message.to === to) {
      messages.push({ role: "user", content: message.message });
    } else if (message.from === to && message.to === "player") {
      messages.push({ role: "assistant", content: message.message });
    } else {
      console.error("Invalid chat history", message);
    }
  });

  messages.push({ role: "user", content: message });

  console.log("Sending messages to OpenAI: ", messages);

  const stream = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    stream: true,
  });

  return stream;
};
