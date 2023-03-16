const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { Configuration, OpenAIApi } = require('openai');

const readFile = promisify(fs.readFile);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function main() {
  const files = process.argv.slice(2);
  const reviews = {};

  for (const file of files) {
    const code = await readFile(file, 'utf-8');
    const prompt = `Please review the following TypeScript code:\n\n${code}\n`;

    const chatMessages = [
      {
        role: 'system',
        content:
          'As a code reviewer, I am focusing on identifying structural improvements and duplicated code in TypeScript, particularly within the context of the NestJS framework. My goal is to provide a review that highlights best practices and potential areas of improvement, ultimately enhancing the overall quality of your project. Once you provide your code, I will offer feedback on structural improvements and duplicated code tailored to your specific implementation. Please paste your code below. Lastly, please note that the review will be provided in korean.',
      },
      { role: 'user', content: prompt },
    ];
    const completions = await openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: chatMessages,
        temperature: 0.7,
      },
      {
        timeout: 120000 * 2,
        maxBodyLength: 8192 * 2,
      },
    );

    const review = completions.data.choices[0].message.content;
    reviews[path.basename(file)] = review;
  }

  return JSON.stringify(reviews);
}

main()
  .then(console.log)
  .catch((error) => {
    // console.error(error);
    console.log('error', error);
    process.exit(1);
  });
