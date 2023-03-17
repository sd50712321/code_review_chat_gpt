const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

const readFile = promisify(fs.readFile);

const isGitLab = process.env.CI_PROJECT_URL
  ? process.env.CI_PROJECT_URL.includes('gitlab.com')
  : false;

async function createGitLabComment(projectId, mergeRequestId, reviewText) {
  const gitlabApiToken = process.env.GITLAB_API_TOKEN;

  const url = `https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mergeRequestId}/discussions`;

  const headers = {
    'Content-Type': 'application/json',
    'Private-Token': gitlabApiToken,
  };

  const body = {
    body: reviewText,
  };

  return axios.post(url, body, { headers });
}

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
  .then((reviews) => {
    if (isGitLab) {
      const projectId = process.env.CI_PROJECT_ID;
      const mergeRequestId = process.env.CI_MERGE_REQUEST_IID;
      const reviewText = Object.entries(JSON.parse(reviews))
        .map(([file, review]) => `## File: ${file}\n\n${review}`)
        .join('\n\n');
      const reviewComment = `Code Review 결과:\n\n${reviewText}\n`;
      createGitLabComment(projectId, mergeRequestId, reviewComment)
        .then(() => console.log('Comment added to GitLab Merge Request'))
        .catch((error) => {
          console.error(
            'Failed to add comment to GitLab Merge Request:',
            error,
          );
          process.exit(1);
        });
    } else {
      console.log(reviews);
    }
  })
  .catch((error) => {
    // console.error(error);
    console.log('error', error);
    console.log('error', error?.response);
    process.exit(1);
  });
